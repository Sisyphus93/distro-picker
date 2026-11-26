import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import type { QuizFlow } from "../domain/quiz";
import { openQuizRun } from "./quiz-run";

interface QuizExperienceProps {
  flow: QuizFlow;
}

const AUDIENCE_LABELS = {
  newcomer: "I’M NEW TO LINUX",
  experienced: "I ALREADY USE LINUX",
} as const;

/**
 * The shared quiz experience: intro, then one question at a time with a
 * progress bar and Back navigation. Run state, answer validation, and
 * persistence are handled behind the `Quiz Run` module seam.
 *
 * Keyboard support comes from native radio inputs grouped under one name;
 * visible focus is preserved via `:focus-visible` styles in the stylesheet.
 */
export default function QuizExperience({ flow }: QuizExperienceProps) {
  const navigate = useNavigate();
  const run = useMemo(() => openQuizRun(flow), [flow]);
  const [phase, setPhase] = useState<"intro" | "questions">("intro");
  const [snapshot, setSnapshot] = useState(() => run.getSnapshot());
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    setPhase("intro");
    setSnapshot(run.getSnapshot());
  }, [run]);

  // Move focus to the question heading on every step change so keyboard and
  // screen-reader users land on the new question instead of a stale control.
  useEffect(() => {
    if (phase === "questions") {
      questionHeadingRef.current?.focus();
    }
  }, [phase, snapshot.step]);

  function start() {
    setPhase("questions");
  }

  function startOver() {
    setSnapshot(run.reset());
    setPhase("intro");
  }

  function selectOption(questionId: string, optionId: string) {
    setSnapshot(run.answer(questionId, optionId));
  }

  function goBack() {
    setSnapshot(run.back());
  }

  function goNext() {
    const result = run.next();
    setSnapshot(result.snapshot);
    if (result.completed) {
      navigate("/results");
    }
  }

  if (phase === "intro") {
    return (
      <section className="quiz-page wrap" aria-labelledby="quiz-intro-title">
        <div className="quiz-card quiz-intro-card">
          <div className="quiz-eyebrow">
            <Compass size={15} aria-hidden="true" />{" "}
            {AUDIENCE_LABELS[flow.audience]}
          </div>
          <h1 id="quiz-intro-title">{flow.title}</h1>
          <p className="quiz-intro-copy">{flow.intro}</p>
          <ul className="quiz-intro-meta">
            <li>{snapshot.totalSteps} questions, one at a time</li>
            <li>“I’m not sure” is fine on most of them</li>
            <li>Go back and change answers before you finish</li>
          </ul>
          <div className="quiz-intro-actions">
            <button type="button" className="button button-dark" onClick={start}>
              {snapshot.hasPartialAnswers ? "Resume the quiz" : "Start the quiz"}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <Link className="text-link" to="/">
              Back to home <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {snapshot.hasPartialAnswers ? (
            <button type="button" className="quiz-start-over" onClick={startOver}>
              <RotateCcw size={13} aria-hidden="true" /> Start from scratch
              instead
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  const {
    step,
    totalSteps,
    question,
    options,
    selectedOptionId,
    answeredCount,
    isFirstStep,
    isLastStep,
    canContinue,
  } = snapshot;

  return (
    <section className="quiz-page wrap" aria-labelledby="quiz-question-title">
      <div className="quiz-page-head">
        <Link className="quiz-back-link" to="/quiz">
          <ArrowLeft size={14} aria-hidden="true" /> Quiz paths
        </Link>
        <span className="quiz-flow-label">
          {AUDIENCE_LABELS[flow.audience]}
        </span>
      </div>

      <div className="quiz-progress-row">
        <p className="quiz-step-label">
          Question <strong>{step + 1}</strong> of {totalSteps}
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
        aria-valuemax={totalSteps}
        aria-valuenow={step + 1}
        aria-label={`Question ${step + 1} of ${totalSteps}`}
      >
        <div
          className="quiz-progress-fill"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <div
        className="quiz-card quiz-question-card"
        role="group"
        aria-labelledby="quiz-question-title"
      >
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
          aria-required="true"
          aria-labelledby="quiz-question-title"
          aria-describedby="quiz-answer-hint"
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
            disabled={isFirstStep}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back
          </button>
          <p className="quiz-footer-note" id="quiz-answer-hint" role="status">
            {selectedOptionId
              ? "You can revisit and change answers."
              : "Choose an answer to continue."}
          </p>
          <button
            type="button"
            className="button button-dark quiz-button-next"
            onClick={goNext}
            disabled={!canContinue}
          >
            {isLastStep ? "See my results" : "Continue"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
