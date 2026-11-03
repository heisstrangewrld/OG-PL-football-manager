// =============================================================================
// Probabilistic Duel & Contest Resolver
// Resolves physical and technical 1v1 contests using sigmoid delta formulas
// =============================================================================

import { PlayerAttributes } from '../types/index.js';
import { VectorMath } from '../math/VectorMath.js';
import { SeededRNG } from '../math/SeededRNG.js';

export interface TackleResult {
  won: boolean;
  foul: boolean;
  card?: 'YELLOW' | 'RED';
  injury: boolean;
}

export class DuelResolver {
  /**
   * Tackling Contest: Tackler vs Ball Carrier
   */
  public static resolveTackle(
    tackler: PlayerAttributes,
    carrier: PlayerAttributes,
    tacklerFatiguePct: number,
    carrierFatiguePct: number,
    rng: SeededRNG
  ): TackleResult {
    // Tackler score: Tackling (60%), Strength (20%), Aggression (20%)
    const tacklerScore =
      tackler.tackling * 0.6 +
      tackler.strength * 0.2 +
      tackler.aggression * 0.2;

    // Carrier score: Dribbling (50%), Agility (30%), Composure (20%)
    const carrierScore =
      carrier.dribbling * 0.5 +
      carrier.agility * 0.3 +
      carrier.composure * 0.2;

    // Apply fatigue penalties
    const fatigueDelta = (tacklerFatiguePct - carrierFatiguePct) * 0.15;
    const delta = (tacklerScore - carrierScore + fatigueDelta) / 16.0;
    const winProb = VectorMath.sigmoid(delta);

    const won = rng.chance(winProb);

    if (won) {
      return { won: true, foul: false, injury: false };
    }

    // If tackle missed, calculate probability of a foul
    // High aggression and low composure/decisions increase foul risk
    const foulRisk =
      0.15 + (tackler.aggression * 0.003) - (tackler.decisions * 0.002);
    const clampedFoulRisk = VectorMath.clamp(foulRisk, 0.05, 0.45);

    const isFoul = rng.chance(clampedFoulRisk);
    if (!isFoul) {
      return { won: false, foul: false, injury: false };
    }

    // Determine card severity (calibrated to ~3.5 yellow cards per full match)
    let card: 'YELLOW' | 'RED' | undefined;
    const yellowChance = 0.08 + (tackler.aggression * 0.001);
    if (rng.chance(yellowChance)) {
      // Rare straight red if aggression is very high
      if (tackler.aggression > 85 && rng.chance(0.015)) {
        card = 'RED';
      } else {
        card = 'YELLOW';
      }
    }

    // Minor injury roll (carrier injury proneness)
    const injuryChance = 0.01 + (carrier.injuryProneness * 0.001);
    const isInjury = rng.chance(injuryChance);

    return {
      won: false,
      foul: true,
      card,
      injury: isInjury,
    };
  }

  /**
   * Aerial Contest: Header duel
   */
  public static resolveAerialDuel(
    p1: PlayerAttributes,
    p2: PlayerAttributes,
    rng: SeededRNG
  ): boolean {
    const s1 = p1.jumpingReach * 0.5 + p1.heading * 0.3 + p1.strength * 0.2;
    const s2 = p2.jumpingReach * 0.5 + p2.heading * 0.3 + p2.strength * 0.2;
    const prob1 = VectorMath.sigmoid((s1 - s2) / 15.0);
    return rng.chance(prob1);
  }

  /**
   * Pass Interception Contest: Passer accuracy vs Defender anticipation
   */
  public static resolveInterception(
    passer: PlayerAttributes,
    defender: PlayerAttributes,
    passDistanceMeters: number,
    defenderProximityToLine: number,
    rng: SeededRNG
  ): boolean {
    // Passer execution
    const passQuality = passer.passing * 0.7 + passer.vision * 0.3;
    // Defender cut probability
    const defenderAcuity = defender.positioning * 0.5 + defender.pace * 0.3 + defender.decisions * 0.2;

    // Longer passes are easier to intercept if defender is close to the line
    const distanceFactor = Math.min(passDistanceMeters / 30.0, 1.5);
    const proximityFactor = Math.max(0, 1.0 - (defenderProximityToLine / 3.0));

    const interceptDelta =
      ((defenderAcuity - passQuality) / 20.0) + (distanceFactor * 0.3) + (proximityFactor * 0.4);

    const interceptProb = VectorMath.sigmoid(interceptDelta) * 0.65; // Max ~65% even in optimal cut
    return rng.chance(VectorMath.clamp(interceptProb, 0.02, 0.85));
  }

  /**
   * Shot on Target vs Goalkeeper Save Contest
   */
  public static resolveSave(
    shooter: PlayerAttributes,
    gk: PlayerAttributes,
    xG: number,
    rng: SeededRNG
  ): boolean {
    // Premier League GKs save ~72% of shots on target on average
    // Base save probability inversely proportional to xG
    const gkRating = (gk.shotStopping * 0.45 + gk.reflexes * 0.35 + gk.gkPositioning * 0.2) / 100.0;
    const shooterRating = (shooter.finishing * 0.7 + shooter.composure * 0.3) / 100.0;

    // High xG (e.g. 0.6) -> lower save probability; Low xG (0.05) -> 95%+ save probability
    const expectedSaveProb = 0.90 - (xG * 0.75); // for xG=0.1 -> 0.825, for xG=0.5 -> 0.525
    const qualityAdjustment = (gkRating - shooterRating) * 0.20;

    const finalSaveProb = VectorMath.clamp(expectedSaveProb + qualityAdjustment, 0.08, 0.96);
    return rng.chance(finalSaveProb);
  }
}
