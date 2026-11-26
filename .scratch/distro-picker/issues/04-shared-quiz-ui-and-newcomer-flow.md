# 04: Shared quiz UI and newcomer flow

**What to build:** The shared quiz experience and the newcomer-tailored quiz flow. Users can take a 6–8 question, one-at-a-time quiz with progress indication, back navigation, and “I’m not sure / no preference” on most questions. The newcomer flow uses plain-language scenario questions mapped to the shared 10-dimension model and produces a recommendation result via the recommendation engine.

**Blocked by:** 01: Project scaffold, app shell, and home page; 03: Recommendation engine and scoring tests.

**Status:** completed

- [x] Quiz UI presents one question at a time with clear progress indication and accessible controls.
- [x] Users can navigate back to previous questions and change answers before completing the quiz.
- [x] Most questions include an “I’m not sure / no preference” option.
- [x] Newcomer quiz flow includes 7 plain-language questions covering: intended use case, comfort with troubleshooting/terminal, stability vs freshness, hardware/NVIDIA concerns, software/app ease, desktop look preference, and proprietary software/drivers stance.
- [x] Newcomer answers map to the shared dimension model and produce a recommendation engine result on completion.
- [x] Quiz is responsive and keyboard usable, with visible focus states and semantic form controls.
- [x] User can start the newcomer flow from the Home page “I’m new to Linux” entry path.

## Comments

- Implemented in `src/quiz/`: `QuizExperience.tsx` (the shared one-at-a-time quiz UI — progress bar with `role="progressbar"` plus "Question X of N" label, Back navigation with editable answers, visible focus management that moves to the question heading on step changes, native radio inputs in a `radiogroup` with an amber `:focus-visible` ring, neutral "I'm not sure / no preference" options honored/hidden via `allowNotSure`), `QuizPage.tsx` (route wrapper that persists the run and hands off to `/results`), `QuizChooser.tsx` (the `/quiz` hub with both paths; experienced path marked "Coming soon" until ticket 05) and `quiz-run-store.ts` (session-storage persistence of answers + step, with validation for stale question/option ids; storage failures degrade gracefully to in-memory state + router-state handoff).
- `/quiz/newcomer` renders the existing 7-question `NEWCOMER_QUIZ` (required topics: use case, terminal/troubleshooting comfort, stability vs freshness, hardware/NVIDIA, software/app ease, desktop look, proprietary stance). On completion, answers go through `buildPreferenceProfile` → `recommendDistros` over the curated 16-distro dataset, and `/results` renders the engine output: top pick with qualitative fit badge (no numeric scores), "why this fits" reasons, tradeoffs, warnings when present, and 2 close alternatives. The results view is deliberately interim — ticket 06 builds the full transparent breakdown; empty state handled when no run exists.
- Home page "I'm new to Linux" already linked to `/quiz/newcomer`; the route is now live, so the entry path works end to end. A `/quiz` chooser sits behind the header "Find my distro" CTA.
- Resume/adjust behavior: progress mirrors to session storage, so a reload resumes mid-quiz; "Adjust my answers" from results returns with answers restored; "Start from scratch" clears them.
- Verified: `npm run typecheck`, `npm test` (22 engine tests pass), `npm run build`, plus a temporary SSR render check (since removed) confirming `/`, `/quiz`, `/quiz/newcomer`, `/quiz/experienced` and `/results` render without crashing and that real newcomer answers produce a rendered engine result (Zorin OS top pick, Strong fit, Linux Lite + Linux Mint alternatives for the tested answer set). No component tests added — outside the v1 testing seam. Monogram avatars pick readable text via a luminance calc since accents range from navy to lime.
- Not done (by design, owned by later tickets): experienced flow is still a placeholder (ticket 05); full results breakdown with what-to-expect/links depth (ticket 06); distro detail pages (ticket 09) are still placeholders, so profile links resolve to the placeholder page.
