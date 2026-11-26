# Quiz Run & Recommendation Pipeline Deepening

Status: ready-for-agent

## Problem Statement

People taking the Distro Picker quiz and viewing their **Recommendation Result** face subtle reliability and trust gaps caused by split responsibilities across the quiz and results flow:

- Opening a quiz path without answering any questions immediately records an empty **Quiz Run**, so visiting the results page produces a misleading **Recommendation Result** where every distribution ties as `"Good"` instead of showing the empty state—and opening the other quiz path silently overwrites an earlier completed **Quiz Run**.
- Moving from the final question to results relies on both browser storage and secondary route state, while storage failures (such as restricted browser tabs) are not backed by an in-memory fallback across navigation.
- Editorial **Caveat** scoping (`newcomers` vs `everyone`) is contradicted across modules: the recommendation engine unconditionally attaches newcomer-only **Caveat** warnings even for experienced users, while the results view contains dead filtering logic that is bypassed before it can run.

## Solution

Collapse **Quiz Run** persistence, answer validation, step clamping, and **Recommendation Result** resolution into one deep **Quiz Run** module behind a single storage adapter seam, and enforce **Caveat** audience scoping inside the recommendation engine itself.

## User Stories

1. As a visitor who opens a quiz path without answering any questions, I want the results page to still show the "No results yet" empty state, so that I never see fabricated recommendations based on zero answers.
2. As a visitor who has already completed a **Quiz Run**, I want browsing the intro of the other quiz path to leave my completed **Quiz Run** intact until I actually record a new answer, so that exploring the other path does not destroy my results.
3. As a quiz taker who answers one or more questions and leaves before finishing, I want my partial **Quiz Run** saved so that returning to the same quiz path offers to resume where I left off.
4. As a quiz taker with a partial, unfinished **Quiz Run**, I want the results page to keep showing the "No results yet" empty state until I complete the final question, so that half-answered quizzes do not produce premature recommendations.
5. As a quiz taker resuming a saved **Quiz Run** after quiz questions or options have been edited in the dataset, I want stale question or option identifiers pruned safely and out-of-range steps clamped, so that my resumed **Quiz Run** never crashes or lands on an invalid step.
6. As a quiz taker on a question that disallows the neutral option, I want neutral answers excluded even if stale saved data references one, so that question constraints are enforced consistently.
7. As a quiz taker clicking "Start over" or "Start from scratch", I want all saved **Quiz Run** progress cleared immediately, so that I begin cleanly from the intro and the results page returns to its empty state.
8. As a quiz taker using a browser where `sessionStorage` is blocked or throws errors, I want my **Quiz Run** to continue working in memory for the current tab session, so that I can still complete the quiz and view my **Recommendation Result**.
9. As a quiz taker who finishes the final question, I want my **Quiz Run** marked completed and my **Recommendation Result** computed cleanly on the results page without relying on fragile router-state payloads, so that refreshing or revisiting the results page keeps working.
10. As a user reviewing my **Recommendation Result**, I want the "Adjust my answers" action to return me to my **Quiz Run** with my prior answers preserved, so that I can tweak a preference and recompute my results.
11. As a user who returns to adjust answers and modifies an answer mid-quiz, I want the **Quiz Run** to require reaching and submitting the final step before exposing updated results, so that half-edited changes never masquerade as a completed **Recommendation Result**.
12. As an experienced Linux user completing the experienced path, I want newcomer-only **Caveat** notices (`newcomers`) suppressed from my **Recommendation Result** warnings, so that I am not warned away from distributions meant for experienced users.
13. As an experienced Linux user completing the experienced path, I want universal **Caveat** notices (`everyone`) to still appear in my **Recommendation Result** warnings, so that important operational risks remain visible regardless of experience level.
14. As a newcomer completing the newcomer path, I want both newcomer-scoped (`newcomers`) and universal (`everyone`) **Caveat** notices surfaced in my **Recommendation Result** warnings, so that I have clear expectations before trying an advanced distribution.
15. As a maintainer, I want one deep **Quiz Run** module to own validation, persistence, step transitions, and **Recommendation Result** resolution, so that UI views remain thin and easy to reason about.
16. As a maintainer, I want the **Quiz Run** persistence seam backed by an injectable storage adapter, so that tests can exercise the full quiz-to-results lifecycle deterministically without a browser DOM.

## Implementation Decisions

- **Deepened Quiz Run module**: Consolidate run storage, answer validation/pruning, neutral-option defence-in-depth, step clamping, completion state, and **Preference Profile** → **Recommendation Result** resolution into one deep **Quiz Run** module. Remove the shallow quiz route pass-through and standalone store modules.
- **Quiz Run interface**: Expose a small lifecycle interface (`openQuizRun` returning `getSnapshot`, `answer`, `back`, `next`, and `reset`), alongside `loadCompletedQuizResults` and `clearQuizRun` for the results view. Keep serialization schema, version checks, answer-record/list conversions, and clamping hidden inside the module implementation.
- **Persistence seam & adapters**: Define a minimal `StorageAdapter` interface (`getItem`, `setItem`, `removeItem`) at the persistence seam. Provide a browser storage adapter that reads/writes `sessionStorage` with an internal in-memory `Map` fallback when `sessionStorage` is unavailable or throws, plus an in-memory adapter for tests. Remove secondary router-state run transport between the quiz and results routes.
- **Lazy persistence & completion gate**: Only persist a **Quiz Run** once at least one valid answer has been recorded, and track an explicit `completed` flag (`true` upon submitting the final question, reset to `false` when an existing answer is edited). Results resolution returns `null` unless a run exists, is marked `completed`, and holds at least one valid answer.
- **Caveat scoping in recommendation scoring**: Move **Caveat** audience filtering (`mostRelevantTo === "everyone" || profile.flow === "newcomer"`) directly into the recommendation engine when building warnings, and remove the duplicate/dead caveat filter from the results view so the results view renders warnings verbatim.
- **Thin UI callers**: The quiz view renders directly from the **Quiz Run** snapshot and dispatches `answer`, `back`, `next`, and `reset`; the results view reads directly from `loadCompletedQuizResults` and calls `clearQuizRun` on restart.
- **Domain glossary**: Maintain canonical definitions for **Quiz Run**, **Preference Profile**, **Recommendation Result**, and **Caveat** in the project glossary, free of implementation details.

## Testing Decisions

- **What makes a good test**: Tests cross the public module interfaces and assert observable outcomes (snapshots, completion status, ranked **Recommendation Result**, and **Caveat** warnings), never inspecting serialized storage keys or internal state structures unless validating corrupted/legacy input handling at the storage boundary.
- **Primary seams**:
  1. **Quiz Run lifecycle seam**: Test `openQuizRun`, `loadCompletedQuizResults`, and `clearQuizRun` end-to-end against an injected in-memory `StorageAdapter` (covering untouched intro non-persistence, partial-run resume vs results gating, cross-flow non-overwrite, newcomer vs experienced **Caveat** scoping, stale ID pruning, step clamping, reset, and graceful handling of throwing storage adapters).
  2. **Recommendation scoring seam (existing)**: Keep unit tests on the recommendation engine focused on scoring math, fit thresholds, tie-breaking, and **Caveat** audience scoping (`newcomers` vs `everyone` across both flows).
- **Prior art**: Existing Vitest + TypeScript unit tests on pure domain modules (such as the recommendation engine and catalog search test suites).

## Out of Scope

- Deepening the remaining three architecture candidates identified during review (Distro Presentation & Caution formatting parity with detail pages, Return Context & scroll restoration, and Catalog Query & Comparison URL state unification).
- Cross-device persistence, user accounts, or server-side storage.
- Automated React component rendering tests or full CI browser E2E test suites (manual/interactive verification suffices).

## Further Notes

- The refactoring and test suite described in this spec were already implemented and verified during the architecture-review session that produced it.
- The three remaining architecture deepening candidates can be tackled and specified separately if desired.
