import { describe, expect, it } from "vitest";
import { EXPERIENCED_QUIZ, NEWCOMER_QUIZ } from "../domain";
import {
  clearQuizRun,
  createMemoryStorageAdapter,
  loadCompletedQuizResults,
  openQuizRun,
  type StorageAdapter,
} from "./quiz-run";

describe("Quiz Run module", () => {
  it("does not persist or produce results until at least one answer is recorded", () => {
    const storage = createMemoryStorageAdapter();
    const run = openQuizRun(NEWCOMER_QUIZ, storage);

    expect(run.getSnapshot().hasPartialAnswers).toBe(false);
    expect(run.getSnapshot().answeredCount).toBe(0);
    expect(loadCompletedQuizResults(storage)).toBeNull();

    // Stepping back at step 0 or trying to advance unanswered does not write.
    run.back();
    expect(run.next().completed).toBe(false);
    expect(loadCompletedQuizResults(storage)).toBeNull();
  });

  it("does not expose incomplete runs on results, while still allowing resume", () => {
    const storage = createMemoryStorageAdapter();
    const first = NEWCOMER_QUIZ.questions[0];
    const run = openQuizRun(NEWCOMER_QUIZ, storage);

    run.answer(first.id, first.options[0].id);
    const stepTwo = run.next();
    expect(stepTwo.completed).toBe(false);
    expect(stepTwo.snapshot.step).toBe(1);
    expect(loadCompletedQuizResults(storage)).toBeNull();

    const resumed = openQuizRun(NEWCOMER_QUIZ, storage);
    expect(resumed.getSnapshot().step).toBe(1);
    expect(resumed.getSnapshot().answeredCount).toBe(1);
    expect(resumed.getSnapshot().hasPartialAnswers).toBe(true);
  });

  it("does not overwrite a completed run simply by opening the other quiz intro", () => {
    const storage = createMemoryStorageAdapter();
    const run = openQuizRun(NEWCOMER_QUIZ, storage);

    for (const question of NEWCOMER_QUIZ.questions) {
      run.answer(question.id, question.options[0].id);
      run.next();
    }
    expect(loadCompletedQuizResults(storage)?.flow).toBe("newcomer");

    // Opening the experienced quiz without answering preserves newcomer results.
    const other = openQuizRun(EXPERIENCED_QUIZ, storage);
    expect(other.getSnapshot().hasPartialAnswers).toBe(false);
    expect(loadCompletedQuizResults(storage)?.flow).toBe("newcomer");
  });

  it("completes the newcomer flow and resolves recommendations with newcomer caveats", () => {
    const storage = createMemoryStorageAdapter();
    const run = openQuizRun(NEWCOMER_QUIZ, storage);

    for (const question of NEWCOMER_QUIZ.questions) {
      run.answer(question.id, question.options[0].id);
      const result = run.next();
      if (question === NEWCOMER_QUIZ.questions.at(-1)) {
        expect(result.completed).toBe(true);
      }
    }

    const completed = loadCompletedQuizResults(storage);
    expect(completed?.flow).toBe("newcomer");
    expect(completed?.result.topPick).toBeDefined();
    expect(completed?.result.alternatives).toHaveLength(2);
    const arch = completed?.result.ranked.find((r) => r.distro.slug === "arch-linux");
    expect(arch?.warning).toBeTruthy();
  });

  it("suppresses newcomer-only caveats for completed experienced runs while keeping universal ones", () => {
    const storage = createMemoryStorageAdapter();
    const optionIds = [
      "development",
      "rolling",
      "arch-aur",
      "new-hardware",
      "from-scratch",
      "live-on-the-edge",
      "tiling",
    ];
    const run = openQuizRun(EXPERIENCED_QUIZ, storage);

    EXPERIENCED_QUIZ.questions.forEach((question, index) => {
      run.answer(question.id, optionIds[index]);
      run.next();
    });

    const completed = loadCompletedQuizResults(storage);
    expect(completed?.flow).toBe("experienced");
    expect(completed?.result.topPick.distro.slug).toBe("arch-linux");
    expect(completed?.result.topPick.warning).toBeUndefined();

    const manjaro = completed?.result.ranked.find(
      (r) => r.distro.slug === "manjaro",
    );
    expect(manjaro?.warning).toBeTruthy();
  });

  it("prunes stale question/option ids and clamps out-of-range steps", () => {
    const storage = createMemoryStorageAdapter();
    const validQuestion = NEWCOMER_QUIZ.questions[0];
    storage.setItem(
      "distro-picker:quiz-run",
      JSON.stringify({
        version: 1,
        flow: "newcomer",
        step: 99,
        completed: true,
        answers: [
          { questionId: "deleted-question", optionId: "foo" },
          { questionId: validQuestion.id, optionId: "deleted-option" },
          { questionId: validQuestion.id, optionId: validQuestion.options[0].id },
        ],
      }),
    );

    const run = openQuizRun(NEWCOMER_QUIZ, storage);
    const snap = run.getSnapshot();
    expect(snap.step).toBe(NEWCOMER_QUIZ.questions.length - 1);
    expect(snap.answeredCount).toBe(1);
    expect(loadCompletedQuizResults(storage)?.flow).toBe("newcomer");
  });

  it("clears persisted state on reset and clearQuizRun", () => {
    const storage = createMemoryStorageAdapter();
    const run = openQuizRun(NEWCOMER_QUIZ, storage);

    for (const question of NEWCOMER_QUIZ.questions) {
      run.answer(question.id, question.options[0].id);
      run.next();
    }
    expect(loadCompletedQuizResults(storage)).not.toBeNull();

    const afterReset = run.reset();
    expect(afterReset.answeredCount).toBe(0);
    expect(afterReset.step).toBe(0);
    expect(loadCompletedQuizResults(storage)).toBeNull();

    // Also verify clearQuizRun clears directly.
    run.answer(NEWCOMER_QUIZ.questions[0].id, NEWCOMER_QUIZ.questions[0].options[0].id);
    clearQuizRun(storage);
    expect(openQuizRun(NEWCOMER_QUIZ, storage).getSnapshot().hasPartialAnswers).toBe(false);
  });

  it("handles a throwing StorageAdapter gracefully without crashing", () => {
    const throwingStorage: StorageAdapter = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };

    const run = openQuizRun(NEWCOMER_QUIZ, throwingStorage);
    const first = NEWCOMER_QUIZ.questions[0];
    const snap = run.answer(first.id, first.options[0].id);
    expect(snap.answeredCount).toBe(1);
    expect(run.next().snapshot.step).toBe(1);
    expect(loadCompletedQuizResults(throwingStorage)).toBeNull();
  });
});
