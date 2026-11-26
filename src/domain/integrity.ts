import { DESKTOPS } from "./desktops";
import { DIMENSIONS, type DimensionId } from "./dimensions";
import { DISTROS } from "./distros";
import { FAMILIES } from "./families";
import { QUIZ_FLOWS } from "./quiz";
import type { QuizFlow, QuizQuestion } from "./quiz/types";
import { RELEASE_MODELS } from "./release-models";
import {
  INSTALL_DIFFICULTY_LABELS,
  RATINGS,
  type DimensionRating,
  type DistroProfile,
} from "./types";

export interface DomainIssue {
  area: "dataset" | "quiz";
  /** Distro slug or question id the issue belongs to. */
  id: string;
  message: string;
}

/** Every distro the v1 catalog promises to ship. */
export const EXPECTED_DISTRO_SLUGS: readonly string[] = [
  "ubuntu",
  "linux-mint",
  "zorin-os",
  "pop-os",
  "fedora-workstation",
  "debian",
  "opensuse-tumbleweed",
  "arch-linux",
  "endeavouros",
  "manjaro",
  "mx-linux",
  "elementary-os",
  "nobara",
  "bazzite",
  "nixos",
  "linux-lite",
];

/** Distros that must carry an explicit caveat, whatever else changes. */
export const CAVEAT_REQUIRED_SLUGS: readonly string[] = [
  "arch-linux",
  "nixos",
  "manjaro",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyStringList(value: readonly string[], minimum = 2): boolean {
  return value.length >= minimum && value.every(isNonEmptyString);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function findDistroIssues(distro: DistroProfile): DomainIssue[] {
  const issues: DomainIssue[] = [];
  const report = (message: string) => {
    issues.push({ area: "dataset", id: distro.slug, message });
  };

  if (!SLUG_PATTERN.test(distro.slug)) {
    report(`Slug "${distro.slug}" is not URL-safe.`);
  }
  if (!isNonEmptyString(distro.name)) {
    report("Name is missing.");
  }
  if (!/^[A-Za-z0-9]{1,2}$/.test(distro.monogram)) {
    report(`Monogram "${distro.monogram}" should be one or two letters or digits.`);
  }
  if (!HEX_COLOUR.test(distro.accent)) {
    report(`Accent "${distro.accent}" is not at #rrggbb hex colour.`);
  }
  if (!FAMILIES.some((family) => family.id === distro.family)) {
    report(`Unknown family: ${distro.family}`);
  }
  if (!isNonEmptyString(distro.base)) {
    report("Base is missing.");
  }
  if (!RELEASE_MODELS.some((model) => model.id === distro.releaseModel)) {
    report(`Unknown release model: ${distro.releaseModel}`);
  }
  if (!isNonEmptyString(distro.releaseNote)) {
    report("Release note is missing.");
  }
  for (const desktop of distro.desktops) {
    if (!DESKTOPS.some((known) => known.id === desktop)) {
      report(`Unknown desktop environment: ${desktop}`);
    }
  }
  if (distro.desktops.length === 0 && !isNonEmptyString(distro.desktopNote)) {
    report("A distro without default desktops needs a desktopNote.");
  }
  if (!isNonEmptyString(distro.tagline)) {
    report("Tagline is missing.");
  }
  if (!isNonEmptyString(distro.summary)) {
    report("Summary is missing.");
  }
  if (!isNonEmptyStringList(distro.bestFor)) {
    report("bestFor needs at least two non-empty entries.");
  }
  if (!isNonEmptyStringList(distro.notIdealFor)) {
    report("notIdealFor needs at least two non-empty entries.");
  }
  if (!isNonEmptyStringList(distro.tradeoffs)) {
    report("tradeoffs needs at least two non-empty entries.");
  }

  const ratings: Partial<Record<DimensionId, DimensionRating>> = distro.ratings;
  if (Object.keys(ratings).length !== DIMENSIONS.length) {
    report(
      `Ratings cover ${Object.keys(ratings).length} dimensions; expected ${DIMENSIONS.length}.`,
    );
  }
  for (const dimension of DIMENSIONS) {
    const rating = ratings[dimension.id];
    if (!rating) {
      report(`Missing rating for ${dimension.id}.`);
      continue;
    }
    if (!(RATINGS as readonly number[]).includes(rating.rating)) {
      report(`Rating for ${dimension.id} is outside 1–5.`);
    }
    if (!isNonEmptyString(rating.rationale)) {
      report(`Rating for ${dimension.id} needs a rationale.`);
    }
  }

  const { whatToExpect } = distro;
  if (!(whatToExpect.installDifficulty in INSTALL_DIFFICULTY_LABELS)) {
    report(`Unknown install difficulty: ${whatToExpect.installDifficulty}`);
  }
  for (const field of [
    "install",
    "maintenance",
    "softwareInstall",
    "whoWillFeelAtHome",
  ] as const) {
    if (!isNonEmptyString(whatToExpect[field])) {
      report(`whatToExpect.${field} is missing.`);
    }
  }

  for (const field of ["website", "download", "docs"] as const) {
    if (!isHttpsUrl(distro.links[field])) {
      report(`links.${field} must be an https URL.`);
    }
  }

  if (!isIsoDate(distro.lastReviewed)) {
    report(`lastReviewed "${distro.lastReviewed}" is not a valid YYYY-MM-DD date.`);
  }

  const easeRating = ratings["ease-of-use"]?.rating;
  if (distro.caveat) {
    if (!isNonEmptyString(distro.caveat.headline)) {
      report("Caveat headline is missing.");
    }
    if (!isNonEmptyString(distro.caveat.detail)) {
      report("Caveat detail is missing.");
    }
    if (!["newcomers", "everyone"].includes(distro.caveat.mostRelevantTo)) {
      report(`Unknown caveat audience: ${distro.caveat.mostRelevantTo}`);
    }
  } else if (
    CAVEAT_REQUIRED_SLUGS.includes(distro.slug) ||
    (typeof easeRating === "number" && easeRating <= 2)
  ) {
    report("Caveat-heavy distro is missing its caveat.");
  }

  return issues;
}

function collectQuestionIssues(
  flow: QuizFlow,
  question: QuizQuestion,
): DomainIssue[] {
  const issues: DomainIssue[] = [];
  const report = (message: string) => {
    issues.push({ area: "quiz", id: question.id, message });
  };

  if (flow.questions.filter((item) => item.id === question.id).length > 1) {
    report("Question id is duplicated within the flow.");
  }
  if (!isNonEmptyString(question.prompt)) {
    report("Prompt is missing.");
  }
  if (!DIMENSIONS.some((dimension) => dimension.id === question.dimension)) {
    report(`Unknown primary dimension: ${question.dimension}`);
  }

  const neutralOptions = question.options.filter(
    (option) => option.kind === "neutral",
  );
  if (question.allowNotSure && neutralOptions.length !== 1) {
    report("Needs exactly one neutral option.");
  }
  if (!question.allowNotSure && neutralOptions.length > 0) {
    report("Has a neutral option but does not allow it.");
  }
  if (question.options.length < 3) {
    report("Needs at least three answer options, including the neutral one.");
  }

  const optionIds = new Set<string>();
  for (const option of question.options) {
    if (!isNonEmptyString(option.id)) {
      report("An option is missing its id.");
      continue;
    }
    if (optionIds.has(option.id)) {
      report(`Option id "${option.id}" is duplicated.`);
    }
    optionIds.add(option.id);

    if (!isNonEmptyString(option.label)) {
      report(`Option "${option.id}" is missing its label.`);
    }
    if (option.kind === "neutral" && option.targets.length > 0) {
      report(`Neutral option "${option.id}" must not map to any dimension.`);
    }
    if (option.kind === "preference" && option.targets.length === 0) {
      report(`Option "${option.id}" does not map to any dimension.`);
    }

    const dimensionsInOption = new Set<DimensionId>();
    for (const target of option.targets) {
      if (!DIMENSIONS.some((dimension) => dimension.id === target.dimension)) {
        report(`Option "${option.id}" targets unknown dimension ${target.dimension}.`);
      }
      if (dimensionsInOption.has(target.dimension)) {
        report(`Option "${option.id}" targets ${target.dimension} twice.`);
      }
      dimensionsInOption.add(target.dimension);
      if (!(RATINGS as readonly number[]).includes(target.ideal)) {
        report(`Option "${option.id}" has an ideal outside 1–5.`);
      }
      if (![1, 2, 3].includes(target.weight)) {
        report(`Option "${option.id}" has a weight outside 1–3.`);
      }
    }
  }

  return issues;
}

function collectQuizIssues(): DomainIssue[] {
  const issues: DomainIssue[] = [];
  const seenQuestionIds = new Set<string>();

  for (const [audience, flow] of Object.entries(QUIZ_FLOWS) as [
    keyof typeof QUIZ_FLOWS,
    QuizFlow,
  ][]) {
    const report = (message: string) => {
      issues.push({ area: "quiz", id: audience, message });
    };

    if (flow.audience !== audience) {
      report(`Flow audience "${flow.audience}" does not match its key.`);
    }
    if (!isNonEmptyString(flow.title) || !isNonEmptyString(flow.intro)) {
      report("Flow title and intro are required.");
    }
    if (flow.questions.length < 6 || flow.questions.length > 8) {
      report(
        `Flow has ${flow.questions.length} questions; v1 asks for 6–8.`,
      );
    }

    for (const question of flow.questions) {
      if (seenQuestionIds.has(question.id)) {
        report(`Question id "${question.id}" is used more than once.`);
      }
      seenQuestionIds.add(question.id);
      issues.push(...collectQuestionIssues(flow, question));
    }
  }

  return issues;
}

/** Collects every problem with the curated dataset and quiz flows. */
export function findDomainIssues(): DomainIssue[] {
  const issues: DomainIssue[] = [];

  const knownSlugs = new Set(DISTROS.map((distro) => distro.slug));
  if (knownSlugs.size !== DISTROS.length) {
    issues.push({
      area: "dataset",
      id: "distros",
      message: "Distro slugs must be unique.",
    });
  }
  for (const slug of EXPECTED_DISTRO_SLUGS) {
    if (!knownSlugs.has(slug)) {
      issues.push({
        area: "dataset",
        id: slug,
        message: "Curated distro is missing from the dataset.",
      });
    }
  }
  for (const slug of knownSlugs) {
    if (!EXPECTED_DISTRO_SLUGS.includes(slug)) {
      issues.push({
        area: "dataset",
        id: slug,
        message: "Distro is not part of the curated v1 set.",
      });
    }
  }

  for (const distro of DISTROS) {
    issues.push(...findDistroIssues(distro));
  }
  issues.push(...collectQuizIssues());

  return issues;
}

/**
 * Fails loudly when the bundled data is inconsistent. Called once from the
 * app entry point in development so maintainers see problems immediately.
 */
export function assertDomainIntegrity(): void {
  const issues = findDomainIssues();
  if (issues.length === 0) {
    return;
  }
  const summary = issues
    .map((issue) => `[${issue.area}] ${issue.id}: ${issue.message}`)
    .join("\n");
  throw new Error(`Domain data is inconsistent:\n${summary}`);
}
