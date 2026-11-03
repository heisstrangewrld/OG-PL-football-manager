import { describe, it, expect } from 'vitest';
import { MatchSimulator } from '../../src/engine/core/MatchSimulator.js';
import { sampleManCity, sampleArsenal } from '../fixtures/sampleTeams.js';

describe('Match Simulator Determinism', () => {
  it('should generate bit-exact results given the same PRNG seed', () => {
    const seed = 987654321;

    const simA = new MatchSimulator(sampleManCity, sampleArsenal, { seed, durationMinutes: 10 });
    const resultA = simA.simulate({ seed, durationMinutes: 10 });

    const simB = new MatchSimulator(sampleManCity, sampleArsenal, { seed, durationMinutes: 10 });
    const resultB = simB.simulate({ seed, durationMinutes: 10 });

    // Exact scoreline
    expect(resultA.homeScore).toBe(resultB.homeScore);
    expect(resultA.awayScore).toBe(resultB.awayScore);

    // Exact number of events
    expect(resultA.events.length).toBe(resultB.events.length);
    for (let i = 0; i < resultA.events.length; i++) {
      expect(resultA.events[i].tick).toBe(resultB.events[i].tick);
      expect(resultA.events[i].type).toBe(resultB.events[i].type);
      expect(resultA.events[i].primaryPlayerId).toBe(resultB.events[i].primaryPlayerId);
    }

    // Exact keyframe coordinates
    expect(resultA.keyframes.length).toBe(resultB.keyframes.length);
    const midIdx = Math.floor(resultA.keyframes.length / 2);
    expect(resultA.keyframes[midIdx].ball).toEqual(resultB.keyframes[midIdx].ball);
  });

  it('should generate different match outcomes with different seeds', () => {
    const sim1 = new MatchSimulator(sampleManCity, sampleArsenal, { seed: 11111, durationMinutes: 90 });
    const res1 = sim1.simulate({ seed: 11111, durationMinutes: 90 });

    const sim2 = new MatchSimulator(sampleManCity, sampleArsenal, { seed: 99999, durationMinutes: 90 });
    const res2 = sim2.simulate({ seed: 99999, durationMinutes: 90 });

    // Events or keyframe trajectories must vary
    const different =
      res1.homeScore !== res2.homeScore ||
      res1.awayScore !== res2.awayScore ||
      res1.events.length !== res2.events.length ||
      res1.stats.home.shots !== res2.stats.home.shots;

    expect(different).toBe(true);
  });
});
