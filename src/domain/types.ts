import type { DesktopId } from "./desktops";
import type { DimensionId } from "./dimensions";
import type { DistroFamilyId } from "./families";
import type { ReleaseModelId } from "./release-models";

/**
 * Shared value scale.
 *
 * Every dimension is rated 1–5. A rating of 1 sits at the dimension's
 * `lowLabel`, a rating of 5 at its `highLabel`. Quiz preferences use the same
 * scale, which keeps distro ratings and user preferences directly comparable.
 */
export const RATINGS = [1, 2, 3, 4, 5] as const;
export type Rating = (typeof RATINGS)[number];

/** Clamp any number to the valid 1–5 rating scale. */
export function clampRating(value: number): Rating {
  const clamped = Math.min(5, Math.max(1, Math.round(value)));
  return clamped as Rating;
}

/** A distro's rating on one dimension, with a short human-readable rationale. */
export interface DimensionRating {
  rating: Rating;
  rationale: string;
}

/** Every dimension must be rated — `Record` makes omissions a type error. */
export type DimensionRatings = Record<DimensionId, DimensionRating>;

export type InstallDifficulty = "straightforward" | "moderate" | "involved";

export const INSTALL_DIFFICULTY_LABELS: Record<InstallDifficulty, string> = {
  straightforward: "Straightforward",
  moderate: "Moderate",
  involved: "Involved",
};

/** What living with the distro is actually like. */
export interface WhatToExpect {
  installDifficulty: InstallDifficulty;
  /** The installation experience in one or two sentences. */
  install: string;
  /** How updates and maintenance work day to day. */
  maintenance: string;
  /** How you install and manage software. */
  softwareInstall: string;
  /** Who tends to be happy on this distro. */
  whoWillFeelAtHome: string;
}

/** Official, trusted destinations for a distro. */
export interface OfficialLinks {
  website: string;
  download: string;
  docs: string;
}

export interface DistroCaveat {
  /** Short banner headline, e.g. "Not a first distro". */
  headline: string;
  /** Practical detail: what the caveat means in everyday use. */
  detail: string;
  mostRelevantTo: "newcomers" | "everyone";
}

/**
 * The shared distro profile. Every field is required because each one is
 * rendered by the catalog, comparison, detail or results views.
 */
export interface DistroProfile {
  /** URL-safe identifier used by `/distros/:slug`. */
  slug: string;
  name: string;
  /** Two-character monogram used as the visual identifier (no bitmaps in v1). */
  monogram: string;
  /** Hex accent colour paired with the monogram. */
  accent: string;
  family: DistroFamilyId;
  /** Immediate base, e.g. "Ubuntu LTS", "Arch Linux" or "Upstream project". */
  base: string;
  releaseModel: ReleaseModelId;
  /** Cadence/support detail for this distro's release model. */
  releaseNote: string;
  desktops: readonly DesktopId[];
  /** Used when desktops need an explanation, e.g. no default desktop. */
  desktopNote?: string;
  /** One-line positioning statement. */
  tagline: string;
  /** Two or three sentences of overview. */
  summary: string;
  bestFor: readonly string[];
  notIdealFor: readonly string[];
  tradeoffs: readonly string[];
  ratings: DimensionRatings;
  whatToExpect: WhatToExpect;
  links: OfficialLinks;
  /** ISO date (YYYY-MM-DD) of the last manual review of this profile. */
  lastReviewed: string;
  /** Present for caveat-heavy or advanced distros. */
  caveat?: DistroCaveat;
}

/** Qualitative fit labels. Results never show numeric percentages. */
export type FitLabel = "Strong" | "Good" | "Partial";

export const FIT_LABELS: readonly FitLabel[] = ["Strong", "Good", "Partial"];

export const FIT_LABEL_MEANINGS: Record<FitLabel, string> = {
  Strong: "Most of what you said matters points this way.",
  Good: "A solid fit, with tradeoffs you should know about.",
  Partial: "Workable, but it works against some of your priorities.",
};

/** How one of the user's preferences lines up with a distro. */
export interface DimensionFit {
  dimension: DimensionId;
  fit: FitLabel;
  /** Short explanation, e.g. "LTS releases line up with your need for predictability." */
  reason: string;
}

/** One ranked recommendation, always shaped the same way for every view. */
export interface DistroRecommendation {
  distro: DistroProfile;
  overallFit: FitLabel;
  /** Preferences this distro satisfies, with reasons. */
  matches: readonly DimensionFit[];
  /** Preferences this distro works against, phrased as tradeoffs. */
  tradeoffs: readonly string[];
  /** Extra caution for an extreme mismatch (or a caveat-heavy distro). */
  warning?: string;
}

/** Output shape of the recommendation engine. */
export interface RecommendationResult {
  topPick: DistroRecommendation;
  /** Exactly two close alternatives. */
  alternatives: readonly [DistroRecommendation, DistroRecommendation];
  /** Every distro, best fit first. */
  ranked: readonly DistroRecommendation[];
}
