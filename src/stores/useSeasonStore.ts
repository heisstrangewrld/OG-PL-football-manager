// =============================================================================
// useSeasonStore — Zustand store for the live season state
// Manages fixtures, standings, gameweek advancement and batch simulation.
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Fixture, generateFixtures } from '@/engine/season/FixtureGenerator';
import { resolveMatchBatch, BatchMatchInput, ClubStrength } from '@/engine/simulation/FastMatchResolver';
import { PL_CLUB_LIST } from '@/engine/data/defaultSquads';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClubStanding {
  clubId: string;
  name: string;
  shortName: string;
  primaryColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<'W' | 'D' | 'L'>; // last 5 results
}

// Rough strength values per club (used by FastMatchResolver)
// Keyed by clubId — derived from their positional overalls in defaultSquads
const CLUB_STRENGTHS: Record<string, ClubStrength> = {
  mci: { clubId: 'mci', attack: 92, midfield: 90, defense: 85, overall: 89 },
  ars: { clubId: 'ars', attack: 87, midfield: 88, defense: 85, overall: 87 },
  liv: { clubId: 'liv', attack: 88, midfield: 86, defense: 85, overall: 86 },
  che: { clubId: 'che', attack: 84, midfield: 82, defense: 81, overall: 82 },
  mun: { clubId: 'mun', attack: 82, midfield: 79, defense: 80, overall: 80 },
  tot: { clubId: 'tot', attack: 83, midfield: 80, defense: 79, overall: 81 },
  new: { clubId: 'new', attack: 80, midfield: 81, defense: 82, overall: 81 },
  avl: { clubId: 'avl', attack: 82, midfield: 81, defense: 80, overall: 81 },
  bha: { clubId: 'bha', attack: 79, midfield: 80, defense: 78, overall: 79 },
  whu: { clubId: 'whu', attack: 78, midfield: 76, defense: 77, overall: 77 },
  ful: { clubId: 'ful', attack: 76, midfield: 76, defense: 76, overall: 76 },
  wol: { clubId: 'wol', attack: 75, midfield: 74, defense: 75, overall: 75 },
  bou: { clubId: 'bou', attack: 74, midfield: 73, defense: 73, overall: 73 },
  cry: { clubId: 'cry', attack: 74, midfield: 72, defense: 73, overall: 73 },
  ips: { clubId: 'ips', attack: 70, midfield: 69, defense: 70, overall: 70 },
  lei: { clubId: 'lei', attack: 72, midfield: 70, defense: 71, overall: 71 },
  eve: { clubId: 'eve', attack: 71, midfield: 71, defense: 72, overall: 71 },
  not: { clubId: 'not', attack: 73, midfield: 73, defense: 74, overall: 73 },
  bre: { clubId: 'bre', attack: 75, midfield: 75, defense: 74, overall: 75 },
  sou: { clubId: 'sou', attack: 68, midfield: 67, defense: 68, overall: 68 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initStandings(): ClubStanding[] {
  return PL_CLUB_LIST.map((c) => ({
    clubId: c.id,
    name: c.name,
    shortName: c.shortName,
    primaryColor: c.primaryColor,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: [],
  }));
}

function sortStandings(standings: ClubStanding[]): ClubStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });
}

function applyResult(
  standings: ClubStanding[],
  homeId: string,
  awayId: string,
  homeGoals: number,
  awayGoals: number,
): ClubStanding[] {
  return standings.map((s) => {
    if (s.clubId !== homeId && s.clubId !== awayId) return s;
    const isHome = s.clubId === homeId;
    const gf = isHome ? homeGoals : awayGoals;
    const ga = isHome ? awayGoals : homeGoals;
    const outcome: 'W' | 'D' | 'L' = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
    const pts = outcome === 'W' ? 3 : outcome === 'D' ? 1 : 0;
    const form = [...s.form, outcome].slice(-5) as Array<'W' | 'D' | 'L'>;
    return {
      ...s,
      played: s.played + 1,
      won: s.won + (outcome === 'W' ? 1 : 0),
      drawn: s.drawn + (outcome === 'D' ? 1 : 0),
      lost: s.lost + (outcome === 'L' ? 1 : 0),
      goalsFor: s.goalsFor + gf,
      goalsAgainst: s.goalsAgainst + ga,
      goalDifference: s.goalDifference + gf - ga,
      points: s.points + pts,
      form,
    };
  });
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface SeasonState {
  season: string;
  currentGameweek: number;
  fixtures: Fixture[];
  standings: ClubStanding[];
  userClubId: string;

  // Computed
  fixturesByGameweek: (gw: number) => Fixture[];
  userNextFixture: () => Fixture | null;

  // Actions
  initSeason: (userClubId: string) => void;
  simulateGameweek: (gw: number, userClubId: string) => void;
  recordUserResult: (fixtureId: string, homeGoals: number, awayGoals: number) => void;
  advanceGameweek: () => void;
}

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      season: '2025/2026',
      currentGameweek: 1,
      fixtures: [],
      standings: [],
      userClubId: 'mci',

      // ---- Computed (not persisted, called inline) ----
      fixturesByGameweek: (gw) => get().fixtures.filter((f) => f.gameweek === gw),

      userNextFixture: () => {
        const { fixtures, userClubId, currentGameweek } = get();
        return (
          fixtures.find(
            (f) =>
              !f.played &&
              f.gameweek >= currentGameweek &&
              (f.homeId === userClubId || f.awayId === userClubId),
          ) ?? null
        );
      },

      // ---- Init ----
      initSeason: (userClubId) => {
        const fixtures = generateFixtures(
          PL_CLUB_LIST,
          '2025-08-16',
        );
        set({
          fixtures,
          standings: initStandings(),
          currentGameweek: 1,
          userClubId,
        });
      },

      // ---- Simulate all non-user matches in a given gameweek ----
      simulateGameweek: (gw, userClubId) => {
        const { fixtures, standings } = get();
        const gwFixtures = fixtures.filter(
          (f) => f.gameweek === gw && !f.played,
        );
        // Separate user fixture (don't auto-sim it)
        const toSimulate = gwFixtures.filter(
          (f) => f.homeId !== userClubId && f.awayId !== userClubId,
        );

        if (toSimulate.length === 0) return;

        // Build batch inputs
        const batchInputs: BatchMatchInput[] = toSimulate.map((f, i) => ({
          homeId: f.homeId,
          awayId: f.awayId,
          homeStrength: CLUB_STRENGTHS[f.homeId] ?? { clubId: f.homeId, attack: 75, midfield: 75, defense: 75, overall: 75 },
          awayStrength: CLUB_STRENGTHS[f.awayId] ?? { clubId: f.awayId, attack: 75, midfield: 75, defense: 75, overall: 75 },
          seed: gw * 1000 + i,
        }));

        const results = resolveMatchBatch(batchInputs);

        // Apply to fixtures + standings
        let updatedFixtures = [...fixtures];
        let updatedStandings = standings;

        for (const res of results) {
          updatedFixtures = updatedFixtures.map((f) => {
            if (f.homeId === res.homeId && f.awayId === res.awayId && f.gameweek === gw && !f.played) {
              return { ...f, played: true, homeGoals: res.homeGoals, awayGoals: res.awayGoals };
            }
            return f;
          });
          updatedStandings = applyResult(updatedStandings, res.homeId, res.awayId, res.homeGoals, res.awayGoals);
        }

        set({ fixtures: updatedFixtures, standings: sortStandings(updatedStandings) });
      },

      // ---- Record user match result (called after the Phaser match ends) ----
      recordUserResult: (fixtureId, homeGoals, awayGoals) => {
        const { fixtures, standings } = get();
        const fixture = fixtures.find((f) => f.id === fixtureId);
        if (!fixture || fixture.played) return;

        const updatedFixtures = fixtures.map((f) =>
          f.id === fixtureId ? { ...f, played: true, homeGoals, awayGoals } : f,
        );
        const updatedStandings = applyResult(standings, fixture.homeId, fixture.awayId, homeGoals, awayGoals);

        set({ fixtures: updatedFixtures, standings: sortStandings(updatedStandings) });
      },

      // ---- Advance to next gameweek ----
      advanceGameweek: () => {
        set((s) => ({ currentGameweek: Math.min(s.currentGameweek + 1, 38) }));
      },
    }),
    {
      name: 'pl-season-2526',
      partialize: (s) => ({
        season: s.season,
        currentGameweek: s.currentGameweek,
        fixtures: s.fixtures,
        standings: s.standings,
        userClubId: s.userClubId,
      }),
    },
  ),
);
