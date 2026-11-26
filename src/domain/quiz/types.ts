import type { DimensionId } from "../dimensions";
import type { AudienceFlow, PreferenceWeight } from "../preferences";
import type { Rating } from "../types";

/**
 * What an answer says about one dimension.
 *
 * `ideal` is a position on the same 1–5 scale used by distro ratings, so the
 * engine can compare them directly without any distro-specific logic.
 */
export interface DimensionTarget {
  dimension: DimensionId;
  ideal: Rating;
  weight: PreferenceWeight;
}

export type QuizOptionKind = "preference" | "neutral";

export interface QuizOption {
  id: string;
  label: string;
  /** Optional clarifier shown under the label. */
  description?: string;
  kind: QuizOptionKind;
  /** Empty for neutral answers, which must not nudge the ranking. */
  targets: readonly DimensionTarget[];
}

export interface QuizQuestion {
  id: string;
  /** Primary dimension this question is about (used for copy and grouping). */
  dimension: DimensionId;
  prompt: string;
  helpText?: string;
  options: readonly QuizOption[];
  /** Whether the flow offers the neutral option for this question. */
  allowNotSure: boolean;
}

export interface QuizFlow {
  audience: AudienceFlow;
  title: string;
  intro: string;
  questions: readonly QuizQuestion[];
}

/** One answer, stored by id so flows can change without breaking saved state. */
export interface QuizAnswer {
  questionId: string;
  optionId: string;
}

/** Terse constructor for answer-to-dimension mappings in the flow data. */
export function target(
  dimension: DimensionId,
  ideal: Rating,
  weight: PreferenceWeight,
): DimensionTarget {
  return { dimension, ideal, weight };
}

/** Building block for the shared "no opinion" answer. */
export function notSureOption(
  label = "I’m not sure / no preference",
): QuizOption {
  return {
    id: "not-sure",
    label,
    kind: "neutral",
    targets: [],
  };
}
