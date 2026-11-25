import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { QuizAnswer, QuizFlow } from "../domain/quiz";
import QuizExperience from "./QuizExperience";
import { saveQuizRun } from "./quiz-run-store";

/**
 * Route wrapper for a quiz flow. On completion it persists the run (so a
 * refresh on the results page still works) and hands off to `/results`.
 * The recommendation itself is computed there — and recomputed any time
 * the stored answers change.
 */
export default function QuizPage({ flow }: { flow: QuizFlow }) {
  const navigate = useNavigate();

  const handleComplete = useCallback(
    (answers: QuizAnswer[]) => {
      const run = {
        version: 1 as const,
        flow: flow.audience,
        answers,
        step: flow.questions.length - 1,
      };
      saveQuizRun(run);
      navigate("/results", { state: { run } });
    },
    [flow, navigate],
  );

  return <QuizExperience flow={flow} onComplete={handleComplete} />;
}
