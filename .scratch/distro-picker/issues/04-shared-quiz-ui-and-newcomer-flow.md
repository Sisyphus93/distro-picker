# 04: Shared quiz UI and newcomer flow

**What to build:** The shared quiz experience and the newcomer-tailored quiz flow. Users can take a 6–8 question, one-at-a-time quiz with progress indication, back navigation, and “I’m not sure / no preference” on most questions. The newcomer flow uses plain-language scenario questions mapped to the shared 10-dimension model and produces a recommendation result via the recommendation engine.

**Blocked by:** 01: Project scaffold, app shell, and home page; 03: Recommendation engine and scoring tests.

**Status:** ready-for-agent

- [ ] Quiz UI presents one question at a time with clear progress indication and accessible controls.
- [ ] Users can navigate back to previous questions and change answers before completing the quiz.
- [ ] Most questions include an “I’m not sure / no preference” option.
- [ ] Newcomer quiz flow includes 7 plain-language questions covering: intended use case, comfort with troubleshooting/terminal, stability vs freshness, hardware/NVIDIA concerns, software/app ease, desktop look preference, and proprietary software/drivers stance.
- [ ] Newcomer answers map to the shared dimension model and produce a recommendation engine result on completion.
- [ ] Quiz is responsive and keyboard usable, with visible focus states and semantic form controls.
- [ ] User can start the newcomer flow from the Home page “I’m new to Linux” entry path.
