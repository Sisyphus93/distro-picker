# 02: Unify Distro presentation and Caveat framing behind one module seam

**What to build:** Consolidate shared **Distro** display formatting, expectation entries, official link metadata, ISO review date formatting, and **Caveat** audience framing into one pure, React-free **Distro** presentation module (`presentDistro` + `formatReviewedDate`), migrate catalog cards, comparison, detail, results, and methodology to consume that single seam, remove the shallow date-formatting helper, and replace its tests with interface-level unit tests.

**Blocked by:** 01: Enforce ease-of-use <= 2 Caveat completeness in domain integrity

**Status:** ready-for-agent

- [ ] `presentDistro` resolves `familyLabel`, `releaseModelLabel`, desktop labels (`"No default desktop"` fallback), `reviewedDateLabel`, `installDifficultyLabel`, structured `expectationFacts`, `officialLinks`, and normalized `caveat` framing (`"Newcomer caution"` vs `"Worth knowing"` + `isForNewcomers`) from one place.
- [ ] `expectationFacts` uses `"Install"`, `"Day-to-day maintenance"`, `"Getting software"`, and `"Who feels at home"` across comparison, detail (rendering the difficulty pill badge), and results (keeping the compact install summary for alternatives).
- [ ] Official links use `"Website"`, `"Download"`, and `"Docs"` with accessible tab announcements across comparison, detail, and results.
- [ ] **Caveat** audience labels (`"Newcomer caution"` vs `"Worth knowing"`) appear uniformly in methodology, comparison **Caveat** cells, and the detail caution banner (retaining newcomer quiz and beginner catalog links when `isForNewcomers` is true), while catalog cards remain compact (`! {headline}`).
- [ ] Standalone `formatReviewedDate` remains available for multi-distro date-range copy in methodology, and the old shallow date-formatting module and its test are deleted.
- [ ] Presentation unit tests validate `presentDistro` and `formatReviewedDate` across desktop fallbacks, both **Caveat** audiences, null **Caveat**, expectations, and official links.
