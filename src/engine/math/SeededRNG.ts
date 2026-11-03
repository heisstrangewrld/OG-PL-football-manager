// =============================================================================
// Seeded Pseudo-Random Number Generator (Mulberry32)
// Deterministic, reproducible, fast 32-bit PRNG
// =============================================================================

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    // Ensure 32-bit positive integer state
    this.state = seed >>> 0;
    if (this.state === 0) {
      this.state = 0x6d2b79f5;
    }
  }

  /**
   * Generates a float in [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a float in [min, max)
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates an integer in [min, max]
   */
  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Returns true with probability p (where 0 <= p <= 1)
   */
  public chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Box-Muller transform for normal distribution
   * mean = mean, stdDev = standard deviation
   */
  public gaussian(mean = 0, stdDev = 1): number {
    const u1 = Math.max(1e-15, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Picks a random element from an array
   */
  public pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const idx = Math.floor(this.next() * items.length);
    return items[idx];
  }

  /**
   * Weighted random selection
   */
  public weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
    let total = 0;
    for (let i = 0; i < weights.length; i++) {
      total += weights[i];
    }
    const roll = this.next() * total;
    let accumulated = 0;
    for (let i = 0; i < items.length; i++) {
      accumulated += weights[i];
      if (roll <= accumulated) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }
}

