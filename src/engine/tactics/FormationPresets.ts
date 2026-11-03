// =============================================================================
// Formation Presets & Tactical Positioning Grids
// Base coordinate assignments normalized to [105m x 68m] pitch
// =============================================================================

import { Vector2D, PositionCode, PlayerRole, PlayerDuty } from '../types/index.js';

export interface FormationSlot {
  slotIndex: number;
  position: PositionCode;
  defaultRole: PlayerRole;
  defaultDuty: PlayerDuty;
  // Normalized offset coordinates [0..1] where (0, 0.5) is own goal line, (1, 0.5) is opponent goal line
  normalizedPos: Vector2D;
}

export const FORMATIONS: Record<string, FormationSlot[]> = {
  // 4-3-3 Attacking
  '4-3-3': [
    { slotIndex: 0, position: 'GK', defaultRole: 'SWEEPER_KEEPER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.05, y: 0.5 } },
    { slotIndex: 1, position: 'RB', defaultRole: 'FULL_BACK', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.22, y: 0.85 } },
    { slotIndex: 2, position: 'CB', defaultRole: 'BALL_PLAYING_DEFENDER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.18, y: 0.62 } },
    { slotIndex: 3, position: 'CB', defaultRole: 'CENTER_BACK', defaultDuty: 'DEFEND', normalizedPos: { x: 0.18, y: 0.38 } },
    { slotIndex: 4, position: 'LB', defaultRole: 'FULL_BACK', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.22, y: 0.15 } },
    { slotIndex: 5, position: 'DM', defaultRole: 'DEFENSIVE_MIDFIELDER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.38, y: 0.5 } },
    { slotIndex: 6, position: 'CM', defaultRole: 'BOX_TO_BOX', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.52, y: 0.68 } },
    { slotIndex: 7, position: 'CM', defaultRole: 'DEEP_LYING_PLAYMAKER', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.52, y: 0.32 } },
    { slotIndex: 8, position: 'RW', defaultRole: 'INSIDE_FORWARD', defaultDuty: 'ATTACK', normalizedPos: { x: 0.76, y: 0.85 } },
    { slotIndex: 9, position: 'ST', defaultRole: 'STRIKER', defaultDuty: 'ATTACK', normalizedPos: { x: 0.82, y: 0.5 } },
    { slotIndex: 10, position: 'LW', defaultRole: 'INSIDE_FORWARD', defaultDuty: 'ATTACK', normalizedPos: { x: 0.76, y: 0.15 } },
  ],

  // 4-2-3-1
  '4-2-3-1': [
    { slotIndex: 0, position: 'GK', defaultRole: 'GOALKEEPER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.05, y: 0.5 } },
    { slotIndex: 1, position: 'RB', defaultRole: 'FULL_BACK', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.22, y: 0.85 } },
    { slotIndex: 2, position: 'CB', defaultRole: 'CENTER_BACK', defaultDuty: 'DEFEND', normalizedPos: { x: 0.18, y: 0.62 } },
    { slotIndex: 3, position: 'CB', defaultRole: 'CENTER_BACK', defaultDuty: 'DEFEND', normalizedPos: { x: 0.18, y: 0.38 } },
    { slotIndex: 4, position: 'LB', defaultRole: 'FULL_BACK', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.22, y: 0.15 } },
    { slotIndex: 5, position: 'DM', defaultRole: 'BALL_WINNING_MIDFIELDER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.38, y: 0.62 } },
    { slotIndex: 6, position: 'DM', defaultRole: 'DEEP_LYING_PLAYMAKER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.38, y: 0.38 } },
    { slotIndex: 7, position: 'CAM', defaultRole: 'ATTACKING_MIDFIELDER', defaultDuty: 'ATTACK', normalizedPos: { x: 0.64, y: 0.5 } },
    { slotIndex: 8, position: 'RM', defaultRole: 'WINGER', defaultDuty: 'ATTACK', normalizedPos: { x: 0.68, y: 0.85 } },
    { slotIndex: 9, position: 'LM', defaultRole: 'WINGER', defaultDuty: 'ATTACK', normalizedPos: { x: 0.68, y: 0.15 } },
    { slotIndex: 10, position: 'ST', defaultRole: 'POACHER', defaultDuty: 'ATTACK', normalizedPos: { x: 0.84, y: 0.5 } },
  ],

  // 4-4-2 Classic
  '4-4-2': [
    { slotIndex: 0, position: 'GK', defaultRole: 'GOALKEEPER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.05, y: 0.5 } },
    { slotIndex: 1, position: 'RB', defaultRole: 'FULL_BACK', defaultDuty: 'DEFEND', normalizedPos: { x: 0.22, y: 0.85 } },
    { slotIndex: 2, position: 'CB', defaultRole: 'CENTER_BACK', defaultDuty: 'DEFEND', normalizedPos: { x: 0.18, y: 0.62 } },
    { slotIndex: 3, position: 'CB', defaultRole: 'CENTER_BACK', defaultDuty: 'DEFEND', normalizedPos: { x: 0.18, y: 0.38 } },
    { slotIndex: 4, position: 'LB', defaultRole: 'FULL_BACK', defaultDuty: 'DEFEND', normalizedPos: { x: 0.22, y: 0.15 } },
    { slotIndex: 5, position: 'RM', defaultRole: 'WINGER', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.52, y: 0.85 } },
    { slotIndex: 6, position: 'CM', defaultRole: 'CENTRAL_MIDFIELDER', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.50, y: 0.62 } },
    { slotIndex: 7, position: 'CM', defaultRole: 'CENTRAL_MIDFIELDER', defaultDuty: 'DEFEND', normalizedPos: { x: 0.50, y: 0.38 } },
    { slotIndex: 8, position: 'LM', defaultRole: 'WINGER', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.52, y: 0.15 } },
    { slotIndex: 9, position: 'ST', defaultRole: 'TARGET_MAN', defaultDuty: 'SUPPORT', normalizedPos: { x: 0.82, y: 0.60 } },
    { slotIndex: 10, position: 'ST', defaultRole: 'POACHER', defaultDuty: 'ATTACK', normalizedPos: { x: 0.84, y: 0.40 } },
  ],
};

export class FormationPresets {
  public static getFormation(code: string): FormationSlot[] {
    return FORMATIONS[code] || FORMATIONS['4-3-3'];
  }

  /**
   * Converts normalized formation position [0..1] to absolute pitch meters [0..105, 0..68]
   * Takes into account attacking direction (isHome: left-to-right, isAway: right-to-left)
   */
  public static toPitchMeters(norm: Vector2D, attackingRight: boolean): Vector2D {
    if (attackingRight) {
      return {
        x: norm.x * 105.0,
        y: norm.y * 68.0,
      };
    } else {
      // Invert coordinates for team attacking from right to left
      return {
        x: (1.0 - norm.x) * 105.0,
        y: (1.0 - norm.y) * 68.0,
      };
    }
  }
}

