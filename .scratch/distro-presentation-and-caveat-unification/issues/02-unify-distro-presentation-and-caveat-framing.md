# 02: Unify Distro presentation and Caveat framing behind one module seam

**What to build:** Consolidate shared **Distro** display formatting, expectation entries, official link metadata, ISO review date formatting, and **Caveat** audience framing into one pure, React-free **Distro** presentation module (`presentDistro` + `formatReviewedDate`), migrate catalog cards, comparison, detail, results, and methodology to consume that single seam, remove the shallow date-formatting helper, and replace its tests with interface-level unit tests.

**Blocked by:** 01: Enforce ease-of-use <= 2 Caveat completeness in domain integrity

**Status:** completed

- [x] `presentDistro` resolves `familyLabel`, `releaseModelLabel`, desktop labels (`"No default desktop"` fallback), `reviewedDateLabel`, `installDifficultyLabel`, structured `expectationFacts`, `officialLinks`, and normalized `caveat` framing (`"Newcomer caution"` vs `"Worth knowing"` + `isForNewcomers`) from one place.
- [x] `expectationFacts` uses `"Install"`, `"Day-to-day maintenance"`, `"Getting software"`, and `"Who feels at home"` across comparison, detail (rendering the difficulty pill badge), and results (keeping the compact install summary for alternatives).
- [x] Official links use `"Website"`, `"Download"`, and `"Docs"` with accessible tab announcements across comparison, detail, and results.
- [x] **Caveat** audience labels (`"Newcomer caution"` vs `"Worth knowing"`) appear uniformly in methodology, comparison **Caveat** cells, and the detail caution banner (retaining newcomer quiz and beginner catalog links when `isForNewcomers` is true), while catalog cards remain compact (`! {headline}`).
- [x] Standalone `formatReviewedDate` remains available for multi-distro date-range copy in methodology, and the old shallow date-formatting module and its test are deleted.
- [x] Presentation unit tests validate `presentDistro` and `formatReviewedDate` across desktop fallbacks, both **Caveat** audiences, null **Caveat**, expectations, and official links.

## Comments

- The unified presentation module and all five view migrations were already present in the starting checkout (`src/distros/distro-presentation.ts` is pure and React-free; catalog cards, comparison, detail, results, and methodology all read `presentDistro`). No `*date*`/`*format*` helper module remains, and no legacy copy (`"A heads-up for newcomers"`, `"Maintenance & updates"`, `"Documentation"`, synthetic `"More hands-on than most"` fallback) survives in `src/`. Verified that comparison amber **Caveat** tags, the detail caution banner (with newcomer quiz / catalog links), and methodology tags all read `caveat.audienceLabel`, while catalog cards stay compact (`! {headline}`).
- Replaced the shallow presentation tests with 19 interface-level tests at the spec's presentation seam: one full view-model assertion built from an independent fixture with literal expectations (family/release labels, desktops, review date, install difficulty, all four `expectationFacts`, all three `officialLinks` including new-tab accessible names, null **Caveat**), both **Caveat** audiences, curated desktop fallbacks vs multiple desktops, curated label/difficulty mapping, curated official links, and curated audience tagging. `formatReviewedDate` now covers valid ISO dates, a leap day, malformed strings, and impossible calendar dates.
- Fixed one real gap: `formatReviewedDate` silently rolled impossible ISO dates over (`"2026-02-30"` became `"2 Mar 2026"`) because JavaScript normalises them. It now round-trips the parsed day before formatting, so invalid values pass through unchanged as the module contract and spec require; valid curated dates render exactly as before.
- TDD evidence: the impossible-date test was red before the fix; five controlled regressions (expectation label drift, official link label drift, **Caveat** audience drift, desktop fallback drift, removed date guard) each fail 1–3 of the targeted tests, so the coverage detects the exact copy drift this ticket exists to prevent.
- Validation: `npm test` (97 tests in 8 files), `npm run typecheck`, and `npm run build` all pass. The issue-01 domain integrity seam still passes (3 tests), so the blocker holds.
