// =============================================================================
// 2D & 3D Spatial Vector Mathematics
// Optimized for fast inline operations with zero allocations when needed
// =============================================================================

import { Vector2D, Vector3D } from '../types/index.js';

export class VectorMath {
  public static distance2D(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static distanceSq2D(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  public static distance3D(a: Vector3D, b: Vector3D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public static length2D(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  public static normalize2D(v: Vector2D): Vector2D {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len < 1e-6) {
      return { x: 0, y: 0 };
    }
    return { x: v.x / len, y: v.y / len };
  }

  public static direction2D(from: Vector2D, to: Vector2D): Vector2D {
    return this.normalize2D({ x: to.x - from.x, y: to.y - from.y });
  }

  public static clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  public static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  public static lerp2D(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  public static angleBetween(from: Vector2D, to: Vector2D): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  public static dot2D(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Sigmoid activation function
   * Used for resolving attribute delta duels
   */
  public static sigmoid(z: number): number {
    if (z > 20) return 1.0;
    if (z < -20) return 0.0;
    return 1.0 / (1.0 + Math.exp(-z));
  }
}

