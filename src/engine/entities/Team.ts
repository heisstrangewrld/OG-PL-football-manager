// =============================================================================
// Team Entity
// Manages the 11 active on-pitch agents, tactical shape, and team stats
// =============================================================================

import {
  TeamInput,
  TeamTactics,
  TeamMatchStats,
  Vector2D,
  PITCH_LENGTH,
  PITCH_WIDTH,
} from '../types/index.js';
import { PlayerAgent } from './PlayerAgent.js';
import { FormationPresets } from '../tactics/FormationPresets.js';
import { VectorMath } from '../math/VectorMath.js';

export class Team {
  public readonly id: string;
  public readonly name: string;
  public readonly shortName: string;
  public readonly primaryColor: string;
  public readonly secondaryColor: string;
  public tactics: TeamTactics;

  public players: PlayerAgent[] = [];
  public substitutes: PlayerAgent[] = [];
  public attackingRight: boolean;

  public stats: TeamMatchStats;

  constructor(input: TeamInput, attackingRight: boolean) {
    this.id = input.id;
    this.name = input.name;
    this.shortName = input.shortName;
    this.primaryColor = input.primaryColor;
    this.secondaryColor = input.secondaryColor;
    this.tactics = input.tactics;
    this.attackingRight = attackingRight;

    this.stats = {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      xG: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      tacklesAttempted: 0,
      tacklesWon: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
      corners: 0,
      offsides: 0,
    };

    // Instantiate 11 starting agents based on formation slots
    const slots = FormationPresets.getFormation(this.tactics.formation);
    for (let i = 0; i < Math.min(11, input.lineup.length); i++) {
      const pInput = input.lineup[i];
      const slot = slots[i] || slots[0];
      const initialPos = FormationPresets.toPitchMeters(slot.normalizedPos, this.attackingRight);
      const agent = new PlayerAgent(pInput, this.id, initialPos);
      this.players.push(agent);
    }
  }

  public get targetGoalX(): number {
    return this.attackingRight ? PITCH_LENGTH : 0.0;
  }

  public get ownGoalX(): number {
    return this.attackingRight ? 0.0 : PITCH_LENGTH;
  }

  public getGoalkeeper(): PlayerAgent {
    const gk = this.players.find((p) => p.positionCode === 'GK');
    return gk || this.players[0];
  }

  public getActiveOutfieldPlayers(): PlayerAgent[] {
    return this.players.filter((p) => p.positionCode !== 'GK' && !p.hasRedCard && !p.isInjured);
  }

  public getNearestPlayerTo(pos: Vector2D, excludeId?: string): PlayerAgent {
    let nearest = this.players[0];
    let minDist = Infinity;
    for (const p of this.players) {
      if (p.hasRedCard || p.isInjured || p.id === excludeId) continue;
      const d = VectorMath.distanceSq2D(p.pos, pos);
      if (d < minDist) {
        minDist = d;
        nearest = p;
      }
    }
    return nearest;
  }

  /**
   * Dynamically shifts team formation anchors based on ball position and defensive line setting
   */
  public updateTacticalAnchors(ballPos: Vector2D): void {
    const slots = FormationPresets.getFormation(this.tactics.formation);

    // Defensive line shift factor (-10m to +15m)
    let defLineOffset = 0;
    if (this.tactics.defensiveLine === 'HIGH') defLineOffset = 12.0;
    if (this.tactics.defensiveLine === 'DEEP') defLineOffset = -10.0;

    // Direct defensive line offset in direction of attack
    const dirSign = this.attackingRight ? 1 : -1;

    // Team shape squeezes or expands based on ball position
    const ballShiftX = (ballPos.x - 52.5) * 0.35;

    for (let i = 0; i < this.players.length; i++) {
      const agent = this.players[i];
      if (agent.positionCode === 'GK') {
        // Goalkeeper stays near goal line
        agent.tacticalBasePos = {
          x: this.ownGoalX + dirSign * 4.0,
          y: VectorMath.clamp(ballPos.y * 0.2 + 34.0 * 0.8, 28.0, 40.0),
        };
        continue;
      }

      const slot = slots[i] || slots[0];
      const baseMeters = FormationPresets.toPitchMeters(slot.normalizedPos, this.attackingRight);

      let adjustedX = baseMeters.x + dirSign * defLineOffset + ballShiftX;
      let adjustedY = baseMeters.y;

      // Adjust width
      if (this.tactics.width === 'WIDE') {
        adjustedY = 34.0 + (baseMeters.y - 34.0) * 1.25;
      } else if (this.tactics.width === 'NARROW') {
        adjustedY = 34.0 + (baseMeters.y - 34.0) * 0.8;
      }

      agent.tacticalBasePos.x = VectorMath.clamp(adjustedX, 5.0, 100.0);
      agent.tacticalBasePos.y = VectorMath.clamp(adjustedY, 2.0, PITCH_WIDTH - 2.0);
    }
  }
}
