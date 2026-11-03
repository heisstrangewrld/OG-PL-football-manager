// =============================================================================
// FixtureGenerator — round-robin schedule for 20 PL clubs, 38 gameweeks
// Uses the "circle method" (Berger tables) for balanced home/away scheduling.
// Each team plays every other team exactly twice (H & A).
// =============================================================================

export interface FixtureClub {
  id: string;
  name: string;
  shortName: string;
}

export interface Fixture {
  id: string;         // e.g. 'gw01-mci-ars'
  gameweek: number;   // 1–38
  date: string;       // ISO date 'YYYY-MM-DD'
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  homeShort: string;
  awayShort: string;
  played: boolean;
  homeGoals: number | null;
  awayGoals: number | null;
}

/**
 * Add `days` calendar days to an ISO date string.
 */
function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Generate a full 38-gameweek Premier League schedule.
 *
 * @param clubs     Exactly 20 clubs
 * @param startDate ISO date for Gameweek 1 (e.g. '2025-08-16')
 * @returns         Array of 380 fixtures
 */
export function generateFixtures(
  clubs: FixtureClub[],
  startDate: string = '2025-08-16',
): Fixture[] {
  if (clubs.length !== 20) {
    throw new Error(`generateFixtures requires exactly 20 clubs, got ${clubs.length}`);
  }

  const fixtures: Fixture[] = [];

  // Circle method: pin team[0], rotate the rest
  // For n=20 teams → n-1=19 rounds in first half
  // Second half: reverse home/away
  const n = clubs.length;
  const half = n - 1; // 19 rounds per half-season

  // Build index array [0..19] — we rotate [1..19], keep [0] fixed
  const indices = Array.from({ length: n }, (_, i) => i);

  // First half — 19 rounds, 10 matches each
  const firstHalf: Array<Array<[number, number]>> = [];
  const rotatingIndices = [...indices]; // will be mutated

  for (let round = 0; round < half; round++) {
    const roundPairs: Array<[number, number]> = [];

    // Pair [0] vs last
    roundPairs.push([rotatingIndices[0], rotatingIndices[n - 1]]);

    // Pair remaining
    for (let i = 1; i < n / 2; i++) {
      roundPairs.push([rotatingIndices[i], rotatingIndices[n - 1 - i]]);
    }

    firstHalf.push(roundPairs);

    // Rotate positions [1..n-1] left by 1
    const last = rotatingIndices[n - 1];
    for (let i = n - 1; i > 1; i--) {
      rotatingIndices[i] = rotatingIndices[i - 1];
    }
    rotatingIndices[1] = last;
  }

  // Helper: approximate gameweek date
  // GW1 starts on startDate, roughly one gameweek = 7 days
  // But PL spreads over ~10 months with Christmas/Winter break pauses.
  // We use a simple linear schedule with a 2-week winter break after GW20.
  const gwDate = (gw: number): string => {
    if (gw <= 19) {
      return addDays(startDate, (gw - 1) * 7);
    } else if (gw <= 20) {
      // Small gap before winter
      return addDays(startDate, (gw - 1) * 7 + 7);
    } else {
      // +14 days for winter break buffer
      return addDays(startDate, (gw - 1) * 7 + 14);
    }
  };

  let gwCounter = 1;

  // Emit first half (GW 1–19) — even rounds alternate home/away by pair index
  for (const roundPairs of firstHalf) {
    for (const [aIdx, bIdx] of roundPairs) {
      const home = clubs[aIdx];
      const away = clubs[bIdx];
      fixtures.push({
        id: `gw${String(gwCounter).padStart(2, '0')}-${home.id}-${away.id}`,
        gameweek: gwCounter,
        date: gwDate(gwCounter),
        homeId: home.id,
        awayId: away.id,
        homeName: home.name,
        awayName: away.name,
        homeShort: home.shortName,
        awayShort: away.shortName,
        played: false,
        homeGoals: null,
        awayGoals: null,
      });
    }
    gwCounter++;
  }

  // Emit second half (GW 20–38) — reverse home/away
  for (const roundPairs of firstHalf) {
    for (const [aIdx, bIdx] of roundPairs) {
      const home = clubs[bIdx]; // swapped
      const away = clubs[aIdx]; // swapped
      fixtures.push({
        id: `gw${String(gwCounter).padStart(2, '0')}-${home.id}-${away.id}`,
        gameweek: gwCounter,
        date: gwDate(gwCounter),
        homeId: home.id,
        awayId: away.id,
        homeName: home.name,
        awayName: away.name,
        homeShort: home.shortName,
        awayShort: away.shortName,
        played: false,
        homeGoals: null,
        awayGoals: null,
      });
    }
    gwCounter++;
  }

  return fixtures;
}

