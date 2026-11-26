# 05: Experienced quiz flow

**What to build:** The experienced-user quiz flow, tailored with direct technical preference questions while reusing the shared quiz UI and recommendation engine. Experienced users can complete a 6–8 question flow that maps to the same shared 10-dimension model and produces the same transparent recommendation result format.

**Blocked by:** 04: Shared quiz UI and newcomer flow.

**Status:** completed

- [x] Experienced quiz flow includes 7 direct technical questions covering: primary workload/use case, release model preference, package/software ecosystem priorities, hardware/GPU needs, customization vs curated defaults, stability/tinkering tolerance and maintenance style, and desktop/workflow preference.
- [x] Experienced questions map to the same shared 10-dimension model used by the newcomer flow and recommendation engine.
- [x] Experienced flow reuses the shared quiz UI behaviors (one at a time, progress, back, “not sure/no preference” where appropriate, accessible controls).
- [x] Completing the experienced flow produces a recommendation result through the same engine/result shape as the newcomer flow.
- [x] User can start the experienced flow from the Home page “I already use Linux” entry path.
- [x] Copy/tone is technically grounded and credible without becoming niche or exclusionary.

## Comments

- Connected the existing seven-question experienced data to the shared `QuizPage` at `/quiz/experienced` and enabled the path on the quiz chooser. The existing Home entry now starts the flow.
- Both flows use the same question controls, session persistence, preference builder, recommendation engine, and interim results view. The experienced intro clarifies that package managers and desktops influence shared qualities rather than filtering results by name.
- Verified `npm run typecheck`, `npm test` (24 engine tests), and `npm run build`. A temporary DOM interaction check passed for Home → experienced flow → results, including progress, focus, Back, seven answers, persisted results and resume. Its test process stayed open after the success message and was stopped by the timeout. The existing detailed results and distro profile placeholders remain for later tickets.
