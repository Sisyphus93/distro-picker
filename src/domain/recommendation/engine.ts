import { getDimension } from "../dimensions";
import type { PreferenceProfile } from "../preferences";
import type {
  DimensionFit,
  DistroProfile,
  DistroRecommendation,
  RecommendationResult,
} from "../types";

/**
 * The recommendation engine: pure TypeScript, no UI dependencies.
 *
 * Inputs are a quiz-derived preference profile ("not sure" answers are already
 * absent — they contribute nothing) and a curated distro dataset. Output is a
 * ranked list with qualitative fit labels only; numeric match scores never
 * leave this module. There are no hard eliminations in v1: extreme mismatches
 * surface as tradeoffs and warnings instead.
 *
 * Fit labels derive from the weight-averaged distance between the user's
 * stated ideal and the distro's rating on each dimension:
 *
 * - weighted gap ≤ 1 → `Strong`
 * - weighted gap ≤ 2 → `Good`
 * - otherwise         → `Partial`
 *
 * Ties in the ranking keep the dataset's curated order (the sort is stable).
 */

/**
 * The scoring rules, exposed so the methodology page can explain the engine
 * without keeping a second copy of the numbers.
 *
 * Gaps are measured on the shared 1–5 rating scale.
 */
export const SCORING_RULES = {
  /** A distro within this gap of a preference counts as a match. */
  matchGap: 1,
  /** A gap this large earns an explicit warning, even at low weight. */
  extremeGap: 3,
  /** Weighted average gap at or below this value earns a Strong fit. */
  strongThreshold: 1,
  /** Weighted average gap at or below this value earns a Good fit. */
  goodThreshold: 2,
} as const;

interface ScoredDistro {
  recommendation: DistroRecommendation;
  weightedGap: number;
  datasetOrder: number;
}

function scoreDistro(
  distro: DistroProfile,
  profile: PreferenceProfile,
  datasetOrder: number,
): ScoredDistro {
  let totalWeight = 0;
  let weightedGapSum = 0;
  const matches: DimensionFit[] = [];
  const tradeoffs: string[] = [];
  const warnings: string[] = [];

  for (const pref of profile.preferences) {
    const dimension = getDimension(pref.dimension);
    const rated = distro.ratings[pref.dimension];
    const rating = rated?.rating ?? 3;
    const rationale = rated?.rationale ?? "No rating recorded.";
    const gap = Math.abs(rating - pref.ideal);
    totalWeight += pref.weight;
    weightedGapSum += pref.weight * gap;

    if (gap <= SCORING_RULES.matchGap) {
      matches.push({
        dimension: pref.dimension,
        fit: gap === 0 ? "Strong" : "Good",
        reason: `${dimension.label}: ${rationale}`,
      });
    } else {
      tradeoffs.push(
        `${dimension.label} works against what you asked for: ${rationale}`,
      );
      if (gap >= SCORING_RULES.extremeGap) {
        warnings.push(
          `Works strongly against your ${dimension.label} preference: ${rationale}`,
        );
      }
    }
  }

  const weightedGap = totalWeight === 0 ? 0 : weightedGapSum / totalWeight;
  const overallFit =
    totalWeight === 0
      ? "Good"
      : weightedGap <= SCORING_RULES.strongThreshold
        ? "Strong"
        : weightedGap <= SCORING_RULES.goodThreshold
          ? "Good"
          : "Partial";

  if (
    distro.caveat &&
    (distro.caveat.mostRelevantTo === "everyone" || profile.flow === "newcomer")
  ) {
    warnings.push(`${distro.caveat.headline}: ${distro.caveat.detail}`);
  }

  const recommendation: DistroRecommendation = {
    distro,
    overallFit,
    matches,
    tradeoffs,
    ...(warnings.length > 0 ? { warning: warnings.join(" ") } : {}),
  };

  return { recommendation, weightedGap, datasetOrder };
}

/**
 * Ranks the given distros for a preference profile. Always returns a top pick
 * plus exactly two close alternatives; throws when the dataset cannot provide
 * three distros.
 */
export function recommendDistros(
  profile: PreferenceProfile,
  distros: readonly DistroProfile[],
): RecommendationResult {
  if (distros.length < 3) {
    throw new Error(
      `The recommendation engine needs at least 3 distros to recommend from; received ${distros.length}.`,
    );
  }

  const ranked = distros
    .map((distro, index) => scoreDistro(distro, profile, index))
    .sort((a, b) => a.weightedGap - b.weightedGap || a.datasetOrder - b.datasetOrder)
    .map(({ recommendation }) => recommendation);

  const [topPick, ...rest] = ranked;
  return {
    topPick,
    alternatives: [rest[0], rest[1]],
    ranked,
  };
}
