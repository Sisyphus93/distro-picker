import { dimensionRank, type DimensionId } from "../dimensions";
import {
  clampPreferenceWeight,
  type AudienceFlow,
  type DimensionPreference,
  type PreferenceProfile,
} from "../preferences";
import { clampRating } from "../types";
import { EXPERIENCED_QUIZ } from "./experienced";
import { NEWCOMER_QUIZ } from "./newcomer";
import type { QuizAnswer, QuizFlow, QuizOption } from "./types";

export type {
  DimensionTarget,
  QuizAnswer,
  QuizFlow,
  QuizOption,
  QuizOptionKind,
  QuizQuestion,
} from "./types";
export { notSureOption } from "./types";
export { NEWCOMER_QUIZ } from "./newcomer";
export { EXPERIENCED_QUIZ } from "./experienced";

export const QUIZ_FLOWS: Record<AudienceFlow, QuizFlow> = {
  newcomer: NEWCOMER_QUIZ,
  experienced: EXPERIENCED_QUIZ,
};

export function getQuizFlow(audience: AudienceFlow): QuizFlow {
  return QUIZ_FLOWS[audience];
}

interface PreferenceAccumulator {
  weightedIdeal: number;
  weightSum: number;
}

function optionLookupFor(flow: QuizFlow): Map<string, QuizOption> {
  const options = new Map<string, QuizOption>();
  for (const question of flow.questions) {
    for (const option of question.options) {
      options.set(`${question.id}:${option.id}`, option);
    }
  }
  return options;
}

/**
 * Turns quiz answers into the preference profile the recommendation engine
 * consumes.
 *
 * Neutral answers and unknown question/option ids contribute nothing, so a
 * partially answered or stale quiz can never bias the ranking. Dimensions
 * touched by several answers are merged: ideals are weighted averages and the
 * combined weight is capped at 3 to stay on the shared importance scale.
 */
export function buildPreferenceProfile(
  flow: QuizFlow,
  answers: readonly QuizAnswer[],
): PreferenceProfile {
  const options = optionLookupFor(flow);
  const accumulated = new Map<DimensionId, PreferenceAccumulator>();

  for (const answer of answers) {
    const option = options.get(`${answer.questionId}:${answer.optionId}`);
    if (!option) {
      continue;
    }

    for (const { dimension, ideal, weight } of option.targets) {
      const current = accumulated.get(dimension) ?? {
        weightedIdeal: 0,
        weightSum: 0,
      };
      current.weightedIdeal += ideal * weight;
      current.weightSum += weight;
      accumulated.set(dimension, current);
    }
  }

  const preferences: DimensionPreference[] = [...accumulated]
    .map(([dimension, { weightedIdeal, weightSum }]) => ({
      dimension,
      ideal: clampRating(weightedIdeal / weightSum),
      weight: clampPreferenceWeight(weightSum),
    }))
    .sort((a, b) => dimensionRank(a.dimension) - dimensionRank(b.dimension));

  return { flow: flow.audience, preferences };
}
