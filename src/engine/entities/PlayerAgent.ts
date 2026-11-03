// =============================================================================
// Player Agent
// Autonomous pitch agent with physical attributes, tactical anchors, and state
// =============================================================================

import {
  Vector2D,
  PlayerInput,
  PlayerAttributes,
  PlayerState,
  PositionCode,
  PlayerRole,
  PlayerDuty,
  PlayerMatchStats,
  PITCH_LENGTH,
  PITCH_WIDTH,
} from '../types/index.js';
import { VectorMath } from '../math/VectorMath.js';

export class PlayerAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly shirtNumber: number;
  public readonly teamId: string;
  public readonly positionCode: PositionCode;
  public readonly role: PlayerRole;
  public readonly duty: PlayerDuty;
  public readonly attributes: PlayerAttributes;

  public pos: Vector2D;
  public targetPos: Vector2D;
  public tacticalBasePos: Vector2D;
  public state: PlayerState = 'IDLE';

  public staminaPct = 100.0; // 0 to 100
  public condition = 100.0;
  public hasYellowCard = false;
  public hasRedCard = false;
  public isInjured = false;

  public stats: PlayerMatchStats;

  constructor(input: PlayerInput, teamId: string, initialPos: Vector2D) {
    this.id = input.id;
    this.name = input.name;
    this.shirtNumber = input.shirtNumber;
    this.teamId = teamId;
    this.positionCode = input.position;
    this.role = input.role;
    this.duty = input.duty;
    this.attributes = input.attributes;
    this.condition = input.condition ?? 100.0;

    this.pos = { ...initialPos };
    this.targetPos = { ...initialPos };
    this.tacticalBasePos = { ...initialPos };

    this.stats = {
      minutesPlayed: 0,
      rating: 6.0,
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      xG: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      tacklesAttempted: 0,
      tacklesWon: 0,
      interceptions: 0,
      saves: 0,
      fouls: 0,
      yellowCard: false,
      redCard: false,
      distanceCoveredMeters: 0,
    };
  }

  /**
   * Top sprint speed in meters per second
   * 50 Pace = 7.5 m/s; 99 Pace = 9.5 m/s
   */
  public getMaxSpeed(): number {
    const baseSpeed = 5.5 + (this.attributes.pace / 100.0) * 4.0;
    // Fatigue penalty when stamina drops below 60%
    const fatigueFactor = this.staminaPct < 60 ? 0.75 + (this.staminaPct / 60) * 0.25 : 1.0;
    return baseSpeed * fatigueFactor;
  }

  /**
   * Moves player towards targetPos for dt seconds
   */
  public moveTowards(target: Vector2D, dt: number, isSprinting = false): void {
    if (this.hasRedCard || this.isInjured) return;

    const dist = VectorMath.distance2D(this.pos, target);
    if (dist < 0.1) return;

    const speed = isSprinting ? this.getMaxSpeed() : this.getMaxSpeed() * 0.55;
    const moveDist = Math.min(dist, speed * dt);
    const dir = VectorMath.direction2D(this.pos, target);

    this.pos.x = VectorMath.clamp(this.pos.x + dir.x * moveDist, 0.0, PITCH_LENGTH);
    this.pos.y = VectorMath.clamp(this.pos.y + dir.y * moveDist, 0.0, PITCH_WIDTH);

    this.stats.distanceCoveredMeters += moveDist;

    // Stamina decay
    if (isSprinting) {
      // Natural stamina attribute decelerates decay
      const decay = (dt * (110 - this.attributes.stamina)) * 0.015;
      this.staminaPct = Math.max(10, this.staminaPct - decay);
    } else {
      // Slight stamina recovery while jogging
      this.staminaPct = Math.min(100, this.staminaPct + dt * 0.02);
    }
  }

  /**
   * Compact telemetry array for keyframe streaming:
   * [numericId, x, y, stateCode, staminaPct]
   */
  public toKeyframe(numId: number): [number, number, number, number, number] {
    const stateCodes: Record<PlayerState, number> = {
      IDLE: 0,
      PRESSING: 1,
      TACKLING: 2,
      DRIBBLING: 3,
      PASSING: 4,
      SHOOTING: 5,
      INTERCEPTING: 6,
      RECOVERING: 7,
      GOALKEEPING: 8,
    };

    return [
      numId,
      Math.round(this.pos.x * 10) / 10,
      Math.round(this.pos.y * 10) / 10,
      stateCodes[this.state] ?? 0,
      Math.round(this.staminaPct),
    ];
  }
}
