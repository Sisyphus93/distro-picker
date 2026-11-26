import {
  buildPreferenceProfile,
  DISTROS,
  getQuizFlow,
  recommendDistros,
  type AudienceFlow,
  type DistroProfile,
  type QuizAnswer,
  type QuizFlow,
  type QuizOption,
  type QuizQuestion,
  type RecommendationResult,
} from "../domain";

const STORAGE_KEY = "distro-picker:quiz-run";
const STORAGE_VERSION = 1;

/**
 * Persistence seam for quiz runs. Production uses browser `sessionStorage`
 * (with an in-memory fallback when storage is unavailable); tests inject an
 * in-memory adapter.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryStorageAdapter(): StorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

export function createBrowserStorageAdapter(): StorageAdapter {
  const fallback = new Map<string, string>();
  return {
    getItem(key) {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          const value = window.sessionStorage.getItem(key);
          if (value !== null) {
            return value;
          }
        }
      } catch {
        // Storage unavailable — fall through to in-memory fallback.
      }
      return fallback.get(key) ?? null;
    },
    setItem(key, value) {
      fallback.set(key, value);
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem(key, value);
        }
      } catch {
        // Storage unavailable — kept in in-memory fallback for this tab.
      }
    },
    removeItem(key) {
      fallback.delete(key);
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.removeItem(key);
        }
      } catch {
        // Storage unavailable — cleared from in-memory fallback.
      }
    },
  };
}

const defaultBrowserStorage = createBrowserStorageAdapter();

interface StoredQuizRun {
  version: typeof STORAGE_VERSION;
  flow: AudienceFlow;
  answers: QuizAnswer[];
  step: number;
  completed: boolean;
}

function isQuizAnswer(value: unknown): value is QuizAnswer {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { questionId, optionId } = value as Record<string, unknown>;
  return typeof questionId === "string" && typeof optionId === "string";
}

function parseStoredQuizRun(value: unknown): StoredQuizRun | null {
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
  const completed = candidate.completed === true;
  return { version: STORAGE_VERSION, flow, answers, step, completed };
}

function readRun(storage: StorageAdapter): StoredQuizRun | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? parseStoredQuizRun(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeRun(storage: StorageAdapter, run: StoredQuizRun): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(run));
  } catch {
    // Storage unavailable — continue with in-memory run state.
  }
}

export function clearQuizRun(storage: StorageAdapter = defaultBrowserStorage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

function optionsFor(question: QuizQuestion): readonly QuizOption[] {
  // Defence in depth: a question that opts out of the neutral option never
  // offers one, even if the flow data accidentally includes it.
  return question.allowNotSure
    ? question.options
    : question.options.filter((option) => option.kind !== "neutral");
}

function toAnswerRecord(
  flow: QuizFlow,
  list: readonly QuizAnswer[],
): Record<string, string> {
  const record: Record<string, string> = {};
  const byId = new Map(flow.questions.map((question) => [question.id, question]));
  for (const answer of list) {
    const question = byId.get(answer.questionId);
    if (!question) continue;
    const valid = optionsFor(question).some(
      (option) => option.id === answer.optionId,
    );
    if (valid) {
      record[answer.questionId] = answer.optionId;
    }
  }
  return record;
}

function toAnswerList(
  flow: QuizFlow,
  record: Record<string, string>,
): QuizAnswer[] {
  return flow.questions.flatMap((question) => {
    const optionId = record[question.id];
    return optionId ? [{ questionId: question.id, optionId }] : [];
  });
}

export interface QuizRunSnapshot {
  flow: QuizFlow;
  step: number;
  totalSteps: number;
  question: QuizQuestion;
  options: readonly QuizOption[];
  selectedOptionId: string | undefined;
  answeredCount: number;
  hasPartialAnswers: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  canContinue: boolean;
  completed: boolean;
}

export interface QuizRunController {
  getSnapshot(): QuizRunSnapshot;
  answer(questionId: string, optionId: string): QuizRunSnapshot;
  back(): QuizRunSnapshot;
  next(): { snapshot: QuizRunSnapshot; completed: boolean };
  reset(): QuizRunSnapshot;
}

/**
 * Deep Quiz Run module: owns resume, stale answer pruning, step clamping,
 * persistence across the storage seam, and completion into recommendations.
 *
 * Persistence begins only once at least one answer is recorded, so browsing
 * a quiz intro never overwrites an existing run or fabricates empty results.
 */
export function openQuizRun(
  flow: QuizFlow,
  storage: StorageAdapter = defaultBrowserStorage,
): QuizRunController {
  const totalSteps = flow.questions.length;
  const saved = readRun(storage);
  const matchesFlow = saved?.flow === flow.audience;

  let answers: Record<string, string> = matchesFlow
    ? toAnswerRecord(flow, saved.answers)
    : {};
  let step = matchesFlow ? Math.min(saved.step, totalSteps - 1) : 0;
  let completed = matchesFlow ? saved.completed && Object.keys(answers).length > 0 : false;

  function persistIfStarted(): void {
    const answerList = toAnswerList(flow, answers);
    if (answerList.length === 0) {
      return;
    }
    writeRun(storage, {
      version: STORAGE_VERSION,
      flow: flow.audience,
      answers: answerList,
      step,
      completed,
    });
  }

  function snapshot(): QuizRunSnapshot {
    const question = flow.questions[step];
    const options = optionsFor(question);
    const selectedOptionId = answers[question.id];
    const answeredCount = Object.keys(answers).length;
    return {
      flow,
      step,
      totalSteps,
      question,
      options,
      selectedOptionId,
      answeredCount,
      hasPartialAnswers: answeredCount > 0,
      isFirstStep: step === 0,
      isLastStep: step === totalSteps - 1,
      canContinue: Boolean(selectedOptionId),
      completed,
    };
  }

  return {
    getSnapshot: snapshot,

    answer(questionId, optionId) {
      const question = flow.questions.find((q) => q.id === questionId);
      if (!question) {
        return snapshot();
      }
      const valid = optionsFor(question).some((option) => option.id === optionId);
      if (!valid) {
        return snapshot();
      }
      answers = { ...answers, [questionId]: optionId };
      completed = false;
      persistIfStarted();
      return snapshot();
    },

    back() {
      if (step > 0) {
        step -= 1;
        persistIfStarted();
      }
      return snapshot();
    },

    next() {
      const current = flow.questions[step];
      if (!answers[current.id]) {
        return { snapshot: snapshot(), completed: false };
      }
      if (step < totalSteps - 1) {
        step += 1;
        persistIfStarted();
        return { snapshot: snapshot(), completed: false };
      }
      completed = true;
      persistIfStarted();
      return { snapshot: snapshot(), completed: true };
    },

    reset() {
      answers = {};
      step = 0;
      completed = false;
      clearQuizRun(storage);
      return snapshot();
    },
  };
}

export interface CompletedQuizResults {
  flow: AudienceFlow;
  result: RecommendationResult;
}

/**
 * Resolves the latest completed Quiz Run into ranked recommendations.
 * Returns `null` when no run exists or the active run has not been completed.
 */
export function loadCompletedQuizResults(
  storage: StorageAdapter = defaultBrowserStorage,
  distros: readonly DistroProfile[] = DISTROS,
): CompletedQuizResults | null {
  const run = readRun(storage);
  if (!run || !run.completed) {
    return null;
  }
  const flow = getQuizFlow(run.flow);
  const validAnswers = toAnswerList(flow, toAnswerRecord(flow, run.answers));
  if (validAnswers.length === 0) {
    return null;
  }
  const profile = buildPreferenceProfile(flow, validAnswers);
  return {
    flow: run.flow,
    result: recommendDistros(profile, distros),
  };
}
