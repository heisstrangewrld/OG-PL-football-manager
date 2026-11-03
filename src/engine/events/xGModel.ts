// =============================================================================
// Analytical Expected Goals (xG) Model
// Computes probability of a shot resulting in a goal based on spatial geometry
// =============================================================================

import { Vector2D, GOAL_WIDTH, GOAL_Y_MIN, GOAL_Y_MAX } from '../types/index.js';
import { VectorMath } from '../math/VectorMath.js';

export interface ShotGeometryInput {
  shotPos: Vector2D;
  targetGoalX: number; // 0.0 or 105.0
  defendersInCone: number;
  isHeader?: boolean;
  isPressure?: boolean;
  isPenalty?: boolean;
}

export class xGModel {
  /**
   * Calculates analytical xG (0.01 to 0.99)
   */
  public static calculate(input: ShotGeometryInput): number {
    if (input.isPenalty) {
      return 0.78; // Standard professional penalty xG
    }

    const goalCenterX = input.targetGoalX;
    const goalCenterY = 34.0;

    // 1. Distance to goal center
    const dx = goalCenterX - input.shotPos.x;
    const dy = goalCenterY - input.shotPos.y;
    const distanceMeters = Math.sqrt(dx * dx + dy * dy);

    // 2. Visible angle to goal mouth (subtended angle between posts)
    const post1: Vector2D = { x: goalCenterX, y: GOAL_Y_MIN };
    const post2: Vector2D = { x: goalCenterX, y: GOAL_Y_MAX };

    const distToPost1 = VectorMath.distance2D(input.shotPos, post1);
    const distToPost2 = VectorMath.distance2D(input.shotPos, post2);

    // Law of cosines to find angle in radians
    const cosAngle =
      (distToPost1 * distToPost1 + distToPost2 * distToPost2 - GOAL_WIDTH * GOAL_WIDTH) /
      (2 * distToPost1 * distToPost2);
    const clampedCos = VectorMath.clamp(cosAngle, -1.0, 1.0);
    const visibleAngleRad = Math.acos(clampedCos);

    // Base logistic regression model weights calibrated against Premier League Opta data
    // logit(xG) = b0 + b_dist * dist + b_angle * angle + b_def * defs + b_head * isHeader + b_press * isPressure
    const b0 = -1.15;      // Intercept calibrated for ~8-12% average shot conversion
    const b_dist = -0.125; // Negative impact per meter
    const b_angle = 1.65;  // Positive impact per radian of goal visibility
    const b_def = -0.42;   // Negative impact per defender in blocking cone
    const b_head = input.isHeader ? -0.85 : 0.0; // Headers have lower conversion
    const b_press = input.isPressure ? -0.45 : 0.0;

    const logit =
      b0 +
      b_dist * distanceMeters +
      b_angle * visibleAngleRad +
      b_def * input.defendersInCone +
      b_head +
      b_press;

    const raw_xG = VectorMath.sigmoid(logit);

    // Clamp to realistic bounds (a tap-in on the goal line won't exceed 0.96; a 40m speculative shot won't be 0)
    return Math.round(VectorMath.clamp(raw_xG, 0.01, 0.95) * 1000) / 1000;
  }

  /**
   * Counts how many defenders are inside the triangle formed by shot position and both goal posts
   */
  public static countDefendersInCone(
    shotPos: Vector2D,
    targetGoalX: number,
    defenderPositions: Vector2D[]
  ): number {
    const p1: Vector2D = { x: targetGoalX, y: GOAL_Y_MIN };
    const p2: Vector2D = { x: targetGoalX, y: GOAL_Y_MAX };

    let count = 0;
    for (const def of defenderPositions) {
      if (this.isPointInTriangle(def, shotPos, p1, p2)) {
        count++;
      }
    }
    return count;
  }

  private static isPointInTriangle(p: Vector2D, a: Vector2D, b: Vector2D, c: Vector2D): boolean {
    const areaOrig = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
    const area1 = Math.abs((a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y));
    const area2 = Math.abs((b.x - p.x) * (c.y - p.y) - (c.x - p.x) * (b.y - p.y));
    const area3 = Math.abs((c.x - p.x) * (a.y - p.y) - (a.x - p.x) * (c.y - p.y));
    return Math.abs(areaOrig - (area1 + area2 + area3)) < 0.1;
  }
}
