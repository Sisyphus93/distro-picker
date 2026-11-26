import type { DimensionId } from "./dimensions";
import type { Rating } from "./types";

/** The two audience-tailored paths through the quiz. */
export type AudienceFlow = "newcomer" | "experienced";

/**
 * Preference weight scale.
 *
 * 1 = nice to have, 2 = matters, 3 = strongly matters. Dimension weights are
 * capped at 3 so every dimension stays on the same importance scale, no matter
 * how many questions touched it.
 */
export type PreferenceWeight = 1 | 2 | 3;

export const MIN_PREFERENCE_WEIGHT: PreferenceWeight = 1;
export const MAX_PREFERENCE_WEIGHT: PreferenceWeight = 3;

/** Clamp any number to the valid 1–3 weight scale. */
export function clampPreferenceWeight(value: number): PreferenceWeight {
  const clamped = Math.min(
    MAX_PREFERENCE_WEIGHT,
    Math.max(MIN_PREFERENCE_WEIGHT, Math.round(value)),
  );
  return clamped as PreferenceWeight;
}

/** A stated preference: where the user wants a distro to sit on one dimension. */
export interface DimensionPreference {
  dimension: DimensionId;
  /** Preferred position on the dimension's 1–5 scale. */
  ideal: Rating;
  weight: PreferenceWeight;
}

/**
 * The engine's input, derived from quiz answers.
 *
 * Neutral ("not sure / no preference") answers contribute nothing here, which
 * is what keeps them from influencing the ranking in either direction.
 */
export interface PreferenceProfile {
  flow: AudienceFlow;
  /** One entry per dimension the user expressed an opinion about. */
  preferences: readonly DimensionPreference[];
}
