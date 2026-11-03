// =============================================================================
// Ball Entity
// 3D Ball representation with carrier attachment and physics stepping
// =============================================================================

import { Vector3D, Vector2D } from '../types/index.js';
import { BallPhysics } from '../physics/BallPhysics.js';

export class Ball {
  public pos: Vector3D = { x: 52.5, y: 34.0, z: 0.0 };
  public vel: Vector3D = { x: 0, y: 0, z: 0 };
  public carrierId: string | null = null;
  public lastTouchedById: string | null = null;
  public lastTouchedTeamId: string | null = null;

  public reset(x = 52.5, y = 34.0): void {
    this.pos = { x, y, z: 0.0 };
    this.vel = { x: 0, y: 0, z: 0 };
    this.carrierId = null;
  }

  public get pos2D(): Vector2D {
    return { x: this.pos.x, y: this.pos.y };
  }

  public kick(vel: Vector3D, kickerId: string, teamId: string): void {
    this.carrierId = null;
    this.vel = vel;
    this.lastTouchedById = kickerId;
    this.lastTouchedTeamId = teamId;
  }

  public step(dt: number): { bounced: boolean; outOfBounds: boolean } {
    if (this.carrierId !== null) {
      // Ball is attached to carrier feet, physics is bypassed
      return { bounced: false, outOfBounds: false };
    }

    const res = BallPhysics.step(this.pos, this.vel, dt);
    this.pos = res.pos;
    this.vel = res.vel;
    return {
      bounced: res.bounced,
      outOfBounds: res.outOfBounds,
    };
  }
}
