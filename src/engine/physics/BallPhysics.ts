// =============================================================================
// Ball Physics & Trajectory Engine
// Simulates 3D continuous trajectory with gravity, drag, and turf friction
// =============================================================================

import { Vector3D, PITCH_LENGTH, PITCH_WIDTH, GOAL_HEIGHT, GOAL_Y_MIN, GOAL_Y_MAX } from '../types/index.js';
import { VectorMath } from '../math/VectorMath.js';

export class BallPhysics {
  public static readonly GRAVITY = 9.81;            // m/s^2
  public static readonly AIR_RESISTANCE = 0.985;    // per tick decay
  public static readonly TURF_FRICTION = 0.95;      // per tick ground roll decay
  public static readonly RESTITUTION = 0.65;        // bounce energy retention

  /**
   * Updates ball position and velocity for dt seconds (e.g. 0.25s)
   */
  public static step(
    pos: Vector3D,
    vel: Vector3D,
    dt: number
  ): { pos: Vector3D; vel: Vector3D; bounced: boolean; outOfBounds: boolean } {
    let nx = pos.x + vel.x * dt;
    let ny = pos.y + vel.y * dt;
    let nz = pos.z + vel.z * dt;
    let nvx = vel.x;
    let nvy = vel.y;
    let nvz = vel.z;
    let bounced = false;

    // Apply gravity if in the air
    if (nz > 0) {
      nvz -= this.GRAVITY * dt;
      // Air resistance
      nvx *= Math.pow(this.AIR_RESISTANCE, dt * 4);
      nvy *= Math.pow(this.AIR_RESISTANCE, dt * 4);
      nvz *= Math.pow(this.AIR_RESISTANCE, dt * 4);
    } else {
      // On ground: turf rolling friction
      nz = 0;
      nvz = 0;
      nvx *= Math.pow(this.TURF_FRICTION, dt * 4);
      nvy *= Math.pow(this.TURF_FRICTION, dt * 4);
    }

    // Ground bounce detection
    if (nz < 0) {
      nz = 0;
      if (Math.abs(nvz) > 1.0) {
        nvz = -nvz * this.RESTITUTION;
        bounced = true;
      } else {
        nvz = 0;
      }
    }

    // Stop microscopic jitter
    if (nz === 0 && Math.sqrt(nvx * nvx + nvy * nvy) < 0.1) {
      nvx = 0;
      nvy = 0;
    }

    // Goal mouth check (if between goal posts, ball enters net)
    const inGoalY = ny >= GOAL_Y_MIN && ny <= GOAL_Y_MAX;
    const inGoalZ = nz <= GOAL_HEIGHT;
    const isGoalA = nx < 0.0 && inGoalY && inGoalZ;
    const isGoalB = nx > PITCH_LENGTH && inGoalY && inGoalZ;

    // Boundary check
    let outOfBounds = false;
    if (!isGoalA && !isGoalB) {
      if (nx < 0 || nx > PITCH_LENGTH || ny < 0 || ny > PITCH_WIDTH) {
        outOfBounds = true;
        // Clamp to pitch edge for safe coordinate bounds
        nx = VectorMath.clamp(nx, 0, PITCH_LENGTH);
        ny = VectorMath.clamp(ny, 0, PITCH_WIDTH);
      }
    }

    return {
      pos: { x: nx, y: ny, z: nz },
      vel: { x: nvx, y: nvy, z: nvz },
      bounced,
      outOfBounds,
    };
  }

  /**
   * Calculates launch velocity vector to reach target coordinate
   */
  public static calculatePassVelocity(
    from: Vector3D,
    to: Vector3D,
    desiredSpeed: number,
    loft = 0.0
  ): Vector3D {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1e-4) {
      return { x: 0, y: 0, z: 0 };
    }

    const dirX = dx / dist;
    const dirY = dy / dist;

    return {
      x: dirX * desiredSpeed,
      y: dirY * desiredSpeed,
      z: loft,
    };
  }
}

