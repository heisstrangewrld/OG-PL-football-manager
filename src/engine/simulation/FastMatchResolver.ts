// =============================================================================
// FastMatchResolver — lightweight statistical batch match resolver
// Used for simulating non-user fixtures in a season loop.
// ~2ms per match (no tick loop, pure probability math).
// =============================================================================

export interface ClubStrength {
  clubId: string;
  attack: number;  // 1-99
  midfield: number;
  defense: number;
  overall: number; // weighted composite
}

export interface BatchMatchInput {
  homeId: string;
  awayId: string;
  homeStrength: ClubStrength;
  awayStrength: ClubStrength;
  seed: number;
}

export interface BatchMatchResult {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  homeXG: number;
  awayXG: number;
}

// Mulberry32 PRNG (same as engine — deterministic)
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Compute expected goals for a team given strength ratio.
 * League average is ~1.4 goals/game per team.
 */
function computeExpectedGoals(
  attackStrength: number,
  defenseStrength: number,
  homeAdvantage: number, // +1 for home, 0 for away
): number {
  // Base xG: 1.4 goals/team/match
  const BASE_XG = 1.4;
  // Attack vs defense ratio modifies xG (clamped)
  const ratio = attackStrength / Math.max(defenseStrength, 1);
  const modifier = 0.5 + Math.min(Math.max(ratio * 0.5, 0.3), 1.4);
  const homeBonus = homeAdvantage * 0.15; // +0.15 xG home advantage
  return Math.max(0.2, BASE_XG * modifier + homeBonus);
}

/**
 * Sample an integer goal count from a Poisson distribution.
 * Uses Knuth's algorithm for small lambda.
 */
function poissonSample(lambda: number, rng: () => number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

/**
 * Resolve a single match statistically.
 */
export function resolveMatch(input: BatchMatchInput): BatchMatchResult {
  const rng = mulberry32(input.seed);

  const homeXG = computeExpectedGoals(
    input.homeStrength.attack,
    input.awayStrength.defense,
    1, // home advantage
  );
  const awayXG = computeExpectedGoals(
    input.awayStrength.attack,
    input.homeStrength.defense,
    0,
  );

  const homeGoals = poissonSample(homeXG, rng);
  const awayGoals = poissonSample(awayXG, rng);

  return {
    homeId: input.homeId,
    awayId: input.awayId,
    homeGoals,
    awayGoals,
    homeXG: Math.round(homeXG * 100) / 100,
    awayXG: Math.round(awayXG * 100) / 100,
  };
}

/**
 * Resolve a batch of matches. Returns results in same order.
 */
export function resolveMatchBatch(
  matches: BatchMatchInput[],
): BatchMatchResult[] {
  return matches.map(resolveMatch);
}

