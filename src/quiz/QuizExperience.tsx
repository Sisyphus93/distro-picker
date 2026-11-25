import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import type { QuizAnswer, QuizFlow, QuizQuestion } from "../domain/quiz";
import { clearQuizRun, loadQuizRun, saveQuizRun } from "./quiz-run-store";

interface QuizExperienceProps {
  flow: QuizFlow;
  /** Called once the final question is answered; receives the full answer list. */
  onComplete: (answers: QuizAnswer[]) => void;
}

const AUDIENCE_LABELS = {
  newcomer: "I’M NEW TO LINUX",
  experienced: "I ALREADY USE LINUX",
} as const;

function optionsFor(question: QuizQuestion) {
  // Defence in depth: a question that opts out of the neutral option never
  // offers one, even if the flow data accidentally includes it.
  return question.allowNotSure
    ? question.options
    : question.options.filter((option) => option.kind !== "neutral");
}

/** Keeps only answers that still match the flow data (drops stale ids). */
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

/** Answers in question order, ready for the preference profile builder. */
function toAnswerList(
  flow: QuizFlow,
  record: Record<string, string>,
): QuizAnswer[] {
  return flow.questions.flatMap((question) => {
    const optionId = record[question.id];
    return optionId ? [{ questionId: question.id, optionId }] : [];
  });
}

/**
 * The shared quiz experience: intro, then one question at a time with a
 * progress bar and Back navigation. Answers are kept in state and mirrored
 * to session storage so the user can leave, come back, or return from the
 * results page to adjust them.
 *
 * Keyboard support comes from native radio inputs grouped under one name;
 * visible focus is preserved via `:focus-visible` styles in the stylesheet.
 */
export default function QuizExperience({ flow, onComplete }: QuizExperienceProps) {
  const total = flow.questions.length;
  const initialRun = useMemo(() => loadQuizRun(flow.audience), [flow.audience]);
  const [phase, setPhase] = useState<"intro" | "questions">("intro");
  const [step, setStep] = useState(() =>
    Math.min(initialRun?.step ?? 0, total - 1),
  );
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    toAnswerRecord(flow, initialRun?.answers ?? []),
  );
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const answeredCount = Object.keys(answers).length;
  const hasPartialAnswers = answeredCount > 0;

  // Mirror progress to session storage so a reload resumes mid-quiz.
  useEffect(() => {
    saveQuizRun({
      version: 1,
      flow: flow.audience,
      answers: toAnswerList(flow, answers),
      step,
    });
  }, [answers, step, flow]);

  // Move focus to the question heading on every step change so keyboard and
  // screen-reader users land on the new question instead of a stale control.
  useEffect(() => {
    if (phase === "questions") {
      questionHeadingRef.current?.focus();
    }
  }, [phase, step]);

  function start() {
    setPhase("questions");
  }

  function startOver() {
    clearQuizRun();
    setAnswers({});
    setStep(0);
    setPhase("intro");
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((previous) => ({ ...previous, [questionId]: optionId }));
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  function goNext() {
    const question = flow.questions[step];
    if (!answers[question.id]) {
      return;
    }
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    onComplete(toAnswerList(flow, answers));
  }

  if (phase === "intro") {
    return (
      <section className="quiz-page wrap" aria-labelledby="quiz-intro-title">
        <div className="quiz-card quiz-intro-card">
          <div className="quiz-eyebrow">
            <Compass size={15} aria-hidden="true" /> {AUDIENCE_LABELS[flow.audience]}
          </div>
          <h1 id="quiz-intro-title">{flow.title}</h1>
          <p className="quiz-intro-copy">{flow.intro}</p>
          <ul className="quiz-intro-meta">
            <li>{total} questions, one at a time</li>
            <li>“I’m not sure” is fine on most of them</li>
            <li>Go back and change answers before you finish</li>
          </ul>
          <div className="quiz-intro-actions">
            <button type="button" className="button button-dark" onClick={start}>
              {hasPartialAnswers ? "Resume the quiz" : "Start the quiz"}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <Link className="text-link" to="/">
              Back to home <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {hasPartialAnswers ? (
            <button type="button" className="quiz-start-over" onClick={startOver}>
              <RotateCcw size={13} aria-hidden="true" /> Start from scratch instead
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  const question = flow.questions[step];
  const options = optionsFor(question);
  const selectedOptionId = answers[question.id];
  const isLastQuestion = step === total - 1;

  return (
    <section className="quiz-page wrap" aria-labelledby="quiz-question-title">
      <div className="quiz-page-head">
        <Link className="quiz-back-link" to="/quiz">
          <ArrowLeft size={14} aria-hidden="true" /> Quiz paths
        </Link>
        <span className="quiz-flow-label">{AUDIENCE_LABELS[flow.audience]}</span>
      </div>

      <div className="quiz-progress-row">
        <p className="quiz-step-label">
          Question <strong>{step + 1}</strong> of {total}
          <span className="quiz-answered-count">
            {" "}
            · {answeredCount} answered
          </span>
        </p>
        <button type="button" className="quiz-start-over" onClick={startOver}>
          <RotateCcw size={13} aria-hidden="true" /> Start over
        </button>
      </div>
      <div
        className="quiz-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-label={`Question ${step + 1} of ${total}`}
      >
        <div
          className="quiz-progress-fill"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      <div className="quiz-card quiz-question-card" role="group" aria-labelledby="quiz-question-title">
        <h2
          id="quiz-question-title"
          ref={questionHeadingRef}
          tabIndex={-1}
          className="quiz-question-title"
        >
          {question.prompt}
        </h2>
        {question.helpText ? (
          <p className="quiz-question-help">{question.helpText}</p>
        ) : null}

        <div
          className="quiz-options"
          role="radiogroup"
          aria-labelledby="quiz-question-title"
        >
          {options.map((option) => {
            const selected = option.id === selectedOptionId;
            return (
              <label
                key={option.id}
                className={`quiz-option${selected ? " is-selected" : ""}${
                  option.kind === "neutral" ? " is-neutral" : ""
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={selected}
                  onChange={() => selectOption(question.id, option.id)}
                />
                {option.kind === "neutral" ? (
                  <HelpCircle
                    size={19}
                    className="quiz-option-neutral-icon"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="quiz-option-text">
                  <span className="quiz-option-label">{option.label}</span>
                  {option.description ? (
                    <span className="quiz-option-description">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <span className="quiz-option-check" aria-hidden="true">
                  <Check size={15} strokeWidth={3} />
                </span>
              </label>
            );
          })}
        </div>

        <div className="quiz-footer">
          <button
            type="button"
            className="button quiz-button-back"
            onClick={goBack}
            disabled={step === 0}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back
          </button>
          <p className="quiz-footer-note">You can revisit and change answers.</p>
          <button
            type="button"
            className="button button-dark quiz-button-next"
            onClick={goNext}
            disabled={!selectedOptionId}
          >
            {isLastQuestion ? "See my results" : "Continue"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
