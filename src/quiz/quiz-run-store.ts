import type { AudienceFlow } from "../domain/preferences";
import type { QuizAnswer } from "../domain/quiz";

const STORAGE_KEY = "distro-picker:quiz-run";
const STORAGE_VERSION = 1;

/**
 * The last quiz run stored on this device (per browser tab session).
 *
 * Only answers and the current position are kept — the recommendation itself
 * is always recomputed from the answers, so results pick up any dataset or
 * scoring changes between visits. `step` is a 0-based question index, kept
 * so returning users resume where they left off — including from the results
 * page, which restores answers for tweaking.
 */
export interface StoredQuizRun {
  version: typeof STORAGE_VERSION;
  flow: AudienceFlow;
  answers: QuizAnswer[];
  step: number;
}

function isQuizAnswer(value: unknown): value is QuizAnswer {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { questionId, optionId } = value as Record<string, unknown>;
  return typeof questionId === "string" && typeof optionId === "string";
}

/** Validates an untrusted value (parsed JSON or router state) into a run. */
export function parseStoredQuizRun(value: unknown): StoredQuizRun | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== STORAGE_VERSION) {
    return null;
  }
  const flow = candidate.flow;
  if (flow !== "newcomer" && flow !== "experienced") {
    return null;
  }
  if (!Array.isArray(candidate.answers)) {
    return null;
  }
  const answers = candidate.answers.filter(isQuizAnswer);
  const stepRaw = typeof candidate.step === "number" ? candidate.step : 0;
  const step = Number.isFinite(stepRaw) ? Math.max(0, Math.floor(stepRaw)) : 0;
  return { version: STORAGE_VERSION, flow, answers, step };
}

export function loadLastQuizRun(): StoredQuizRun | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? parseStoredQuizRun(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function loadQuizRun(flow: AudienceFlow): StoredQuizRun | null {
  const run = loadLastQuizRun();
  return run?.flow === flow ? run : null;
}

/** Returns whether the run could be persisted (storage can be unavailable). */
export function saveQuizRun(run: StoredQuizRun): boolean {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(run));
    return true;
  } catch {
    return false;
  }
}

export function clearQuizRun(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
