// =============================================================================
// Match Simulator Core Engine
// Discrete 4Hz spatial simulation orchestrator with deterministic seeded RNG
// =============================================================================

import {
  TeamInput,
  MatchResult,
  MatchEvent,
  MatchKeyframe,
  CompactPlayerKeyframe,
  Vector2D,
  Vector3D,
  PITCH_LENGTH,
  PITCH_WIDTH,
  GOAL_Y_MIN,
  GOAL_Y_MAX,
} from '../types/index.js';
import { SeededRNG } from '../math/SeededRNG.js';
import { VectorMath } from '../math/VectorMath.js';
import { Ball } from '../entities/Ball.js';
import { Team } from '../entities/Team.js';
import { PlayerAgent } from '../entities/PlayerAgent.js';
import { DuelResolver } from '../events/DuelResolver.js';
import { xGModel } from '../events/xGModel.js';
import { BallPhysics } from '../physics/BallPhysics.js';

export interface SimOptions {
  seed?: number;
  durationMinutes?: number; // default 90
  includeKeyframes?: boolean; // default true, can disable for ultra-fast background batch runs
}

export class MatchSimulator {
  private rng: SeededRNG;
  private homeTeam: Team;
  private awayTeam: Team;
  private ball: Ball;
  private events: MatchEvent[] = [];
  private keyframes: MatchKeyframe[] = [];

  private currentTick = 0;
  private homeScore = 0;
  private awayScore = 0;
  private homePossessionTicks = 0;
  private awayPossessionTicks = 0;

  private ballCarrier: PlayerAgent | null = null;
  private carrierTeam: Team | null = null;
  private defendingTeam: Team | null = null;

  // Decision latency cooldown to avoid twitching
  private decisionTimer = 0;

  constructor(homeInput: TeamInput, awayInput: TeamInput, options?: SimOptions) {
    const seed = options?.seed ?? 1234567;
    this.rng = new SeededRNG(seed);

    // Home attacks right (0 -> 105), Away attacks left (105 -> 0)
    this.homeTeam = new Team(homeInput, true);
    this.awayTeam = new Team(awayInput, false);

    this.ball = new Ball();
    this.initKickoff(this.homeTeam);
  }

  private initKickoff(kickoffTeam: Team): void {
    this.ball.reset(52.5, 34.0);
    // Striker takes kickoff
    const kicker = kickoffTeam.players.find((p) => p.positionCode === 'ST') || kickoffTeam.players[9];
    kicker.pos = { x: 52.5, y: 34.0 };
    this.setCarrier(kicker);
  }

  private setCarrier(player: PlayerAgent | null): void {
    this.ballCarrier = player;
    if (player) {
      this.ball.carrierId = player.id;
      this.ball.pos = { x: player.pos.x, y: player.pos.y, z: 0.0 };
      this.ball.vel = { x: 0, y: 0, z: 0 };
      this.carrierTeam = player.teamId === this.homeTeam.id ? this.homeTeam : this.awayTeam;
      this.defendingTeam = player.teamId === this.homeTeam.id ? this.awayTeam : this.homeTeam;
      player.state = 'DRIBBLING';
    } else {
      this.ball.carrierId = null;
      this.carrierTeam = null;
      this.defendingTeam = null;
    }
  }

  /**
   * Runs the full match from 0' to 90'+
   */
  public simulate(options?: SimOptions): MatchResult {
    const totalMinutes = options?.durationMinutes ?? 90;
    // 4 ticks per second -> 240 ticks per minute
    const totalTicks = totalMinutes * 240;
    const includeKeyframes = options?.includeKeyframes ?? true;

    this.logEvent('KICK_OFF', this.homeTeam.id, this.ballCarrier?.id ?? '', 'Match kick-off');

    for (this.currentTick = 0; this.currentTick < totalTicks; this.currentTick++) {
      this.stepTick(0.25);

      if (includeKeyframes && this.currentTick % 1 === 0) {
        // Record 4Hz keyframe
        this.recordKeyframe();
      }

      // Half-time whistle check
      if (this.currentTick === Math.floor(totalTicks / 2)) {
        this.logEvent('HALF_TIME', this.homeTeam.id, '', 'Half-time whistle');
        // Swap sides for 2nd half
        this.homeTeam.attackingRight = false;
        this.awayTeam.attackingRight = true;
        this.initKickoff(this.awayTeam);
      }
    }

    this.logEvent('FULL_TIME', this.homeTeam.id, '', 'Full-time whistle');

    return this.assembleResult(options?.seed ?? 1234567, totalMinutes);
  }

  /**
   * Executes a single 0.25-second discrete simulation tick
   */
  private stepTick(dt: number): void {
    const ballPos2D = this.ball.pos2D;

    // Track possession ticks
    if (this.carrierTeam === this.homeTeam) {
      this.homePossessionTicks++;
    } else if (this.carrierTeam === this.awayTeam) {
      this.awayPossessionTicks++;
    }

    // 1. Update team tactical positions
    this.homeTeam.updateTacticalAnchors(ballPos2D);
    this.awayTeam.updateTacticalAnchors(ballPos2D);

    // 2. Ball physics step (if loose or kicked)
    if (this.ballCarrier === null) {
      const stepRes = this.ball.step(dt);

      // Check loose ball interception by closest player
      this.resolveLooseBall();

      // Out of bounds check
      if (stepRes.outOfBounds) {
        this.resolveOutOfBounds();
        return;
      }
    } else {
      // Keep ball synced to carrier feet
      this.ball.pos = { x: this.ballCarrier.pos.x, y: this.ballCarrier.pos.y, z: 0.0 };
    }

    // 3. Carrier decision cycle (every 2 ticks / 0.5s)
    this.decisionTimer += dt;
    if (this.ballCarrier !== null && this.decisionTimer >= 0.5) {
      this.decisionTimer = 0;
      this.executeCarrierDecision(dt);
    }

    // 4. Defending pressure & tackling
    if (this.ballCarrier !== null && this.defendingTeam !== null) {
      this.executeDefending(dt);
    }

    // 5. Update outfield positions for all non-active players
    this.updateOffBallMovement(dt);
  }

  private executeCarrierDecision(dt: number): void {
    if (!this.ballCarrier || !this.carrierTeam || !this.defendingTeam) return;

    const carrier = this.ballCarrier;
    const targetGoalX = this.carrierTeam.targetGoalX;
    const distToGoal = VectorMath.distance2D(carrier.pos, { x: targetGoalX, y: 34.0 });

    // --- SHOOTING DECISION ---
    // Only shoot if in viable range and not heavily crowded, or high xG
    const inShootingRange = distToGoal < 22.0;
    const isLongShotViable = distToGoal < 28.0 && carrier.attributes.longShots > 75;
    const shootingUrge = (carrier.attributes.finishing * 0.7 + carrier.attributes.longShots * 0.3) / 100.0;

    const shouldShoot =
      (inShootingRange && this.rng.chance(0.12 + shootingUrge * 0.15)) ||
      (isLongShotViable && this.rng.chance(0.06 + shootingUrge * 0.08));

    if (shouldShoot) {
      this.executeShot(carrier, this.carrierTeam, this.defendingTeam, distToGoal);
      return;
    }

    // --- PASSING DECISION ---
    // Search for open forward teammate
    const forwardPass = this.findBestPassTarget(carrier, this.carrierTeam);
    if (forwardPass && this.rng.chance(0.55)) {
      this.executePass(carrier, forwardPass, this.carrierTeam);
      return;
    }

    // --- DRIBBLE FORWARD ---
    carrier.state = 'DRIBBLING';
    const goalDir = this.carrierTeam.attackingRight ? 1 : -1;
    const dribbleTarget: Vector2D = {
      x: VectorMath.clamp(carrier.pos.x + goalDir * 6.0, 5.0, 100.0),
      y: VectorMath.clamp(carrier.pos.y + this.rng.range(-3.0, 3.0), 4.0, 64.0),
    };
    carrier.moveTowards(dribbleTarget, dt, true);
  }

  private executeShot(
    shooter: PlayerAgent,
    attackingTeam: Team,
    defendingTeam: Team,
    distToGoal: number
  ): void {
    shooter.state = 'SHOOTING';
    shooter.stats.shots++;
    attackingTeam.stats.shots++;

    const targetGoalX = attackingTeam.targetGoalX;
    const defPositions = defendingTeam.players.map((p) => p.pos);
    const defsInCone = xGModel.countDefendersInCone(shooter.pos, targetGoalX, defPositions);

    const xG = xGModel.calculate({
      shotPos: shooter.pos,
      targetGoalX,
      defendersInCone: defsInCone,
    });

    shooter.stats.xG += xG;
    attackingTeam.stats.xG += xG;

    // Shot accuracy roll: Finishing + Technique (Premier League average on-target is ~36-42%)
    const onTargetChance =
      0.30 + (shooter.attributes.finishing * 0.15 + shooter.attributes.composure * 0.05) / 100.0;
    const isOnTarget = this.rng.chance(onTargetChance);

    // Defender block check if defenders in blocking cone
    if (defsInCone > 0 && this.rng.chance(Math.min(0.40, defsInCone * 0.16))) {
      this.setCarrier(null);
      this.ball.vel.x = -this.ball.vel.x * 0.3;
      this.ball.vel.y = this.rng.range(-6, 6);
      this.logEvent('SHOT', attackingTeam.id, shooter.id, `${shooter.name}'s shot is blocked by the defense`, {
        xG,
        shotOutcome: 'BLOCKED',
      });
      return;
    }

    // Detach ball and launch towards goal
    this.setCarrier(null);
    const targetY = isOnTarget
      ? this.rng.range(GOAL_Y_MIN + 0.5, GOAL_Y_MAX - 0.5)
      : this.rng.chance(0.5)
      ? GOAL_Y_MIN - this.rng.range(1.0, 6.0)
      : GOAL_Y_MAX + this.rng.range(1.0, 6.0);
    const targetZ = isOnTarget ? this.rng.range(0.2, 2.2) : this.rng.range(0.2, 5.0);

    const shotVel = BallPhysics.calculatePassVelocity(
      this.ball.pos,
      { x: targetGoalX, y: targetY, z: targetZ },
      26.0, // Shot speed m/s
      targetZ * 0.6
    );
    this.ball.kick(shotVel, shooter.id, attackingTeam.id);

    if (!isOnTarget) {
      this.logEvent('SHOT', attackingTeam.id, shooter.id, `${shooter.name} fires a shot off target`, {
        xG,
        shotOutcome: 'OFF_TARGET',
      });
      return;
    }

    shooter.stats.shotsOnTarget++;
    attackingTeam.stats.shotsOnTarget++;

    // Goalkeeper Save Duel
    const gk = defendingTeam.getGoalkeeper();
    const isSaved = DuelResolver.resolveSave(shooter.attributes, gk.attributes, xG, this.rng);

    if (isSaved) {
      gk.stats.saves++;
      this.logEvent('SAVED', defendingTeam.id, gk.id, `Great save by ${gk.name} to deny ${shooter.name}!`, {
        xG,
        shotOutcome: 'SAVED',
      });
      // GK parries or collects ball
      if (this.rng.chance(0.65)) {
        this.setCarrier(gk);
      } else {
        // Parried away into play
        this.ball.vel.x = -this.ball.vel.x * 0.3;
        this.ball.vel.y = this.rng.range(-8, 8);
      }
    } else {
      // GOAL SCORED!
      if (attackingTeam === this.homeTeam) {
        this.homeScore++;
      } else {
        this.awayScore++;
      }
      shooter.stats.goals++;
      shooter.stats.rating = Math.min(10.0, shooter.stats.rating + 1.2);

      this.logEvent('GOAL', attackingTeam.id, shooter.id, `GOAL! ${shooter.name} scores with a clinical finish!`, {
        xG,
        shotOutcome: 'GOAL',
      });

      // Reset to kickoff for opposing team
      this.initKickoff(defendingTeam);
    }
  }

  private executePass(passer: PlayerAgent, target: PlayerAgent, team: Team): void {
    passer.state = 'PASSING';
    passer.stats.passesAttempted++;
    team.stats.passesAttempted++;

    const dist = VectorMath.distance2D(passer.pos, target.pos);
    const passSpeed = Math.min(22.0, 10.0 + dist * 0.6);

    // Pass accuracy contest
    const passSuccessChance =
      0.65 + (passer.attributes.passing * 0.25 + passer.attributes.vision * 0.1) / 100.0;
    const isAccurate = this.rng.chance(passSuccessChance);

    this.setCarrier(null);

    if (isAccurate) {
      passer.stats.passesCompleted++;
      team.stats.passesCompleted++;
      const vel = BallPhysics.calculatePassVelocity(
        this.ball.pos,
        { x: target.pos.x, y: target.pos.y, z: 0.0 },
        passSpeed
      );
      this.ball.kick(vel, passer.id, team.id);
      target.state = 'INTERCEPTING';
      target.targetPos = { ...target.pos };
    } else {
      // Errant pass
      const errTarget: Vector2D = {
        x: target.pos.x + this.rng.range(-4.0, 4.0),
        y: target.pos.y + this.rng.range(-4.0, 4.0),
      };
      const vel = BallPhysics.calculatePassVelocity(
        this.ball.pos,
        { x: errTarget.x, y: errTarget.y, z: 0.0 },
        passSpeed * 0.8
      );
      this.ball.kick(vel, passer.id, team.id);
    }
  }

  private findBestPassTarget(carrier: PlayerAgent, team: Team): PlayerAgent | null {
    let bestTarget: PlayerAgent | null = null;
    let bestScore = -Infinity;

    for (const mate of team.players) {
      if (mate.id === carrier.id || mate.positionCode === 'GK') continue;

      const dist = VectorMath.distance2D(carrier.pos, mate.pos);
      if (dist < 4.0 || dist > 45.0) continue;

      // Prefer forward progress
      const forwardProgress = team.attackingRight ? mate.pos.x - carrier.pos.x : carrier.pos.x - mate.pos.x;
      const score = forwardProgress * 1.5 + mate.attributes.positioning * 0.1 - dist * 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestTarget = mate;
      }
    }
    return bestTarget;
  }

  private executeDefending(dt: number): void {
    if (!this.ballCarrier || !this.defendingTeam) return;

    // Nearest defender presses the ball
    const presser = this.defendingTeam.getNearestPlayerTo(this.ballCarrier.pos);
    presser.state = 'PRESSING';
    presser.moveTowards(this.ballCarrier.pos, dt, true);

    const dist = VectorMath.distance2D(presser.pos, this.ballCarrier.pos);
    if (dist <= 1.8) {
      // Initiate tackle
      presser.state = 'TACKLING';
      presser.stats.tacklesAttempted++;
      this.defendingTeam.stats.tacklesAttempted++;

      const res = DuelResolver.resolveTackle(
        presser.attributes,
        this.ballCarrier.attributes,
        presser.staminaPct,
        this.ballCarrier.staminaPct,
        this.rng
      );

      if (res.won) {
        presser.stats.tacklesWon++;
        this.defendingTeam.stats.tacklesWon++;
        this.setCarrier(presser);
      } else if (res.foul) {
        this.defendingTeam.stats.fouls++;
        presser.stats.fouls++;
        if (res.card === 'YELLOW') {
          if (presser.hasYellowCard) {
            presser.hasRedCard = true;
            this.defendingTeam.stats.redCards++;
            this.logEvent('RED_CARD', this.defendingTeam.id, presser.id, `Second yellow card! ${presser.name} is sent off!`);
          } else {
            presser.hasYellowCard = true;
            this.defendingTeam.stats.yellowCards++;
            this.logEvent('YELLOW_CARD', this.defendingTeam.id, presser.id, `Yellow card for ${presser.name}`);
          }
        } else if (res.card === 'RED') {
          presser.hasRedCard = true;
          this.defendingTeam.stats.redCards++;
          this.logEvent('RED_CARD', this.defendingTeam.id, presser.id, `RED CARD! ${presser.name} is sent off!`);
        }
        // Free kick awarded: push tackler back and pause decision loop briefly
        const backwardSign = this.carrierTeam?.attackingRight ? -6.0 : 6.0;
        presser.pos.x = VectorMath.clamp(presser.pos.x + backwardSign, 5.0, 100.0);
        this.decisionTimer = -0.75;
      }
    }
  }

  private updateOffBallMovement(dt: number): void {
    const allPlayers = [...this.homeTeam.players, ...this.awayTeam.players];
    for (const p of allPlayers) {
      if (p === this.ballCarrier || p.hasRedCard || p.isInjured) continue;

      // Smoothly drift towards tactical base position
      const distToBase = VectorMath.distance2D(p.pos, p.tacticalBasePos);
      if (distToBase > 2.0) {
        p.state = 'IDLE';
        p.moveTowards(p.tacticalBasePos, dt, false);
      }
    }
  }

  private resolveLooseBall(): void {
    const ball2D = this.ball.pos2D;
    const allPlayers = [...this.homeTeam.players, ...this.awayTeam.players];

    let closest: PlayerAgent | null = null;
    let minDist = 2.0; // Interception radius

    for (const p of allPlayers) {
      if (p.hasRedCard || p.isInjured) continue;
      const d = VectorMath.distance2D(p.pos, ball2D);
      if (d < minDist && this.ball.pos.z < 2.0) {
        minDist = d;
        closest = p;
      }
    }

    if (closest) {
      this.setCarrier(closest);
      closest.stats.interceptions++;
    }
  }

  private checkGoal(): boolean {
    const ballPos = this.ball.pos;
    if (ballPos.y >= GOAL_Y_MIN && ballPos.y <= GOAL_Y_MAX && ballPos.z <= 2.44) {
      if (ballPos.x >= PITCH_LENGTH) {
        // Goal for Team attacking right (Home Team in 1st half)
        const scoringTeam = this.homeTeam.attackingRight ? this.homeTeam : this.awayTeam;
        const concedingTeam = scoringTeam === this.homeTeam ? this.awayTeam : this.homeTeam;
        if (scoringTeam === this.homeTeam) this.homeScore++;
        else this.awayScore++;

        this.logEvent('GOAL', scoringTeam.id, this.ball.lastTouchedById ?? '', 'Goal scored!');
        this.initKickoff(concedingTeam);
        return true;
      } else if (ballPos.x <= 0.0) {
        // Goal for Team attacking left
        const scoringTeam = !this.homeTeam.attackingRight ? this.homeTeam : this.awayTeam;
        const concedingTeam = scoringTeam === this.homeTeam ? this.awayTeam : this.homeTeam;
        if (scoringTeam === this.homeTeam) this.homeScore++;
        else this.awayScore++;

        this.logEvent('GOAL', scoringTeam.id, this.ball.lastTouchedById ?? '', 'Goal scored!');
        this.initKickoff(concedingTeam);
        return true;
      }
    }
    return false;
  }

  private resolveOutOfBounds(): void {
    // Return ball to nearest team throw-in or goal kick
    const team = this.rng.chance(0.5) ? this.homeTeam : this.awayTeam;
    const player = team.players[1];
    player.pos = { ...this.ball.pos2D };
    this.setCarrier(player);
  }

  private logEvent(
    type: MatchEvent['type'],
    teamId: string,
    playerId: string,
    description: string,
    data?: MatchEvent['data']
  ): void {
    const minute = Math.floor(this.currentTick / 240);
    const second = Math.floor((this.currentTick % 240) / 4);

    this.events.push({
      id: `evt-${this.events.length + 1}`,
      tick: this.currentTick,
      minute,
      second,
      type,
      teamId,
      primaryPlayerId: playerId,
      position: { ...this.ball.pos2D },
      description,
      data,
    });
  }

  private recordKeyframe(): void {
    const minute = Math.floor(this.currentTick / 240);
    const second = Math.floor((this.currentTick % 240) / 4);

    const playersCompact: CompactPlayerKeyframe[] = [];
    let idx = 1;

    for (const p of this.homeTeam.players) {
      playersCompact.push(p.toKeyframe(idx++));
    }
    for (const p of this.awayTeam.players) {
      playersCompact.push(p.toKeyframe(idx++));
    }

    this.keyframes.push({
      tick: this.currentTick,
      minute,
      second,
      ball: [
        Math.round(this.ball.pos.x * 10) / 10,
        Math.round(this.ball.pos.y * 10) / 10,
        Math.round(this.ball.pos.z * 10) / 10,
      ],
      players: playersCompact,
    });
  }

  private assembleResult(seed: number, durationMinutes: number): MatchResult {
    const totalPossession = Math.max(1, this.homePossessionTicks + this.awayPossessionTicks);
    this.homeTeam.stats.possession = Math.round((this.homePossessionTicks / totalPossession) * 100);
    this.awayTeam.stats.possession = 100 - this.homeTeam.stats.possession;

    const playerStatsMap: Record<string, any> = {};
    for (const p of [...this.homeTeam.players, ...this.awayTeam.players]) {
      playerStatsMap[p.id] = { ...p.stats, minutesPlayed: durationMinutes };
    }

    return {
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      homeTeam: {
        id: this.homeTeam.id,
        name: this.homeTeam.name,
        shortName: this.homeTeam.shortName,
        primaryColor: this.homeTeam.primaryColor,
        secondaryColor: this.homeTeam.secondaryColor,
        tactics: this.homeTeam.tactics,
        lineup: [],
        substitutes: [],
      },
      awayTeam: {
        id: this.awayTeam.id,
        name: this.awayTeam.name,
        shortName: this.awayTeam.shortName,
        primaryColor: this.awayTeam.primaryColor,
        secondaryColor: this.awayTeam.secondaryColor,
        tactics: this.awayTeam.tactics,
        lineup: [],
        substitutes: [],
      },
      stats: {
        home: this.homeTeam.stats,
        away: this.awayTeam.stats,
      },
      playerStats: playerStatsMap,
      events: this.events,
      keyframes: this.keyframes,
      durationMinutes,
      seed,
    };
  }
}
