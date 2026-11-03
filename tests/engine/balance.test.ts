import { describe, it, expect } from 'vitest';
import { MatchSimulator } from '../../src/engine/core/MatchSimulator.js';
import { sampleManCity, sampleArsenal } from '../fixtures/sampleTeams.js';
import { xGModel } from '../../src/engine/events/xGModel.js';

describe('Match Simulator Balance & Constraints', () => {
  it('should run a full 90-minute simulation without NaN or infinite coordinates', () => {
    const sim = new MatchSimulator(sampleManCity, sampleArsenal, { seed: 42, durationMinutes: 90 });
    const result = sim.simulate({ seed: 42, durationMinutes: 90 });

    expect(result.durationMinutes).toBe(90);
    expect(result.keyframes.length).toBeGreaterThan(20000);

    // Verify keyframes contain valid finite floats
    const sampleFrame = result.keyframes[100];
    expect(Number.isFinite(sampleFrame.ball[0])).toBe(true);
    expect(Number.isFinite(sampleFrame.ball[1])).toBe(true);
    expect(Number.isFinite(sampleFrame.ball[2])).toBe(true);

    // Check all players in sample frame
    for (const playerFrame of sampleFrame.players) {
      expect(Number.isFinite(playerFrame[1])).toBe(true); // x
      expect(Number.isFinite(playerFrame[2])).toBe(true); // y
      expect(playerFrame[1]).toBeGreaterThanOrEqual(0);
      expect(playerFrame[1]).toBeLessThanOrEqual(105);
      expect(playerFrame[2]).toBeGreaterThanOrEqual(0);
      expect(playerFrame[2]).toBeLessThanOrEqual(68);
    }
  });

  it('should produce realistic match statistics over a sample of matches', () => {
    let totalGoals = 0;
    let totalShots = 0;
    const matchCount = 5;

    for (let i = 0; i < matchCount; i++) {
      const sim = new MatchSimulator(sampleManCity, sampleArsenal, { seed: 1000 + i, durationMinutes: 90 });
      const res = sim.simulate({ seed: 1000 + i, durationMinutes: 90 });

      totalGoals += res.homeScore + res.awayScore;
      totalShots += res.stats.home.shots + res.stats.away.shots;

      // Possession adds up to 100
      expect(res.stats.home.possession + res.stats.away.possession).toBe(100);

      // xG is non-negative and finite
      expect(Number.isFinite(res.stats.home.xG)).toBe(true);
      expect(Number.isFinite(res.stats.away.xG)).toBe(true);
    }

    const avgGoals = totalGoals / matchCount;
    const avgShots = totalShots / matchCount;

    // Premier league averages ~2.6-3.2 goals, ~20-28 shots
    expect(avgGoals).toBeGreaterThanOrEqual(0.5);
    expect(avgGoals).toBeLessThanOrEqual(7.0);
    expect(avgShots).toBeGreaterThanOrEqual(8);
  });

  it('should calculate xG accurately based on distance and defender density', () => {
    // 6-yard box tap-in (5m away, no defenders)
    const highXg = xGModel.calculate({
      shotPos: { x: 100.0, y: 34.0 },
      targetGoalX: 105.0,
      defendersInCone: 0,
    });

    // Long distance shot (35m away, 3 defenders in cone)
    const lowXg = xGModel.calculate({
      shotPos: { x: 70.0, y: 34.0 },
      targetGoalX: 105.0,
      defendersInCone: 3,
    });

    expect(highXg).toBeGreaterThan(0.50);
    expect(lowXg).toBeLessThan(0.10);
  });
});
