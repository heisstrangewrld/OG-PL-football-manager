import { create } from 'zustand';
import { MatchResult, MatchEvent, MatchKeyframe, TeamInput } from '@/engine/types';
import { MatchSimulator } from '@/engine/core/MatchSimulator';
import { sampleManCity, sampleArsenal } from '@/engine/data/defaultSquads';

export interface MatchdayState {
  matchResult: MatchResult | null;
  currentTick: number;
  isPlaying: boolean;
  speedMultiplier: 1 | 2 | 4;
  highlightsOnly: boolean;
  selectedPlayerId: string | null;

  // Actions
  initMatch: (homeTeam?: TeamInput, awayTeam?: TeamInput, seed?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (multiplier: 1 | 2 | 4) => void;
  setTick: (tick: number) => void;
  jumpToNextEvent: () => void;
}

export const useMatchdayStore = create<MatchdayState>((set, get) => ({
  matchResult: null,
  currentTick: 0,
  isPlaying: false,
  speedMultiplier: 2,
  highlightsOnly: false,
  selectedPlayerId: null,

  initMatch: (homeTeam = sampleManCity, awayTeam = sampleArsenal, seed = 123456) => {
    // Run deterministic headless simulation to obtain complete keyframes and event stream
    const sim = new MatchSimulator(homeTeam, awayTeam, { seed, durationMinutes: 90 });
    const result = sim.simulate({ seed, durationMinutes: 90 });

    set(() => ({
      matchResult: result,
      currentTick: 0,
      isPlaying: true,
    }));
  },

  play: () => set(() => ({ isPlaying: true })),
  pause: () => set(() => ({ isPlaying: false })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSpeed: (speedMultiplier) => set(() => ({ speedMultiplier })),
  setTick: (currentTick) => set(() => ({ currentTick })),

  jumpToNextEvent: () => {
    const { matchResult, currentTick } = get();
    if (!matchResult) return;

    // Find the next significant event after currentTick
    const nextEvent = matchResult.events.find(
      (e) => e.tick > currentTick + 10 && ['GOAL', 'SHOT', 'SAVED', 'RED_CARD'].includes(e.type)
    );

    if (nextEvent) {
      // Jump 5 seconds before the event for replay
      const targetTick = Math.max(0, nextEvent.tick - 20);
      set(() => ({ currentTick: targetTick, isPlaying: true }));
    } else {
      // Jump to end
      set(() => ({ currentTick: matchResult.keyframes.length - 1 }));
    }
  },
}));
