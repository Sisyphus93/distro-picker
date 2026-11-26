# Distro Presentation & Caveat Unification

Status: ready-for-agent

## Problem Statement

People exploring Linux distributions across the catalog, comparison table, distro detail page, **Recommendation Result** view, and methodology page encounter subtle copy and caution inconsistencies caused by duplicated presentation rules:

- The detail page synthesizes a fallback caution (`"More hands-on than most"`) when a **Distro** rates `ease-of-use <= 2` without an explicit **Caveat**, whereas catalog cards, comparison rows, methodology, and **Recommendation Result** only read `distro.caveat`—creating the risk of divergent warnings if data changes.
- **Caveat** audience framing differs across views: methodology displays `"Newcomer caution"` vs `"Worth knowing"`, the detail banner displays `"A heads-up for newcomers"` vs `"Good to know before you start"`, and comparison cells show a **Caveat** with no audience tag at all.
- Identical formatting logic—resolving family, release model, default desktops (`"No default desktop"` fallback), living-with expectation labels, official links, and reviewed dates—is duplicated across five views, causing copy drift (`"Installation"` / `"Maintenance & updates"` / `"Installing software"` / `"Documentation"` on detail vs `"Install"` / `"Day-to-day maintenance"` / `"Getting software"` / `"Docs"` in comparison and results) while `formatReviewedDate` sits alone in a shallow single-function helper.

## Solution

Move the `ease-of-use <= 2` **Caveat** requirement into domain integrity validation so every **Distro** carries one explicit **Caveat**, and collapse all **Distro** presentation formatting, expectation normalization, official links, date formatting, and **Caveat** audience framing into one deep React-free presentation module shared by every view.

## User Stories

1. As a newcomer inspecting an advanced **Distro** across catalog cards, comparison, detail pages, methodology, or my **Recommendation Result**, I want the exact same editorial **Caveat** headline and detail everywhere, so that no view invents different caution copy from the rest of the app.
2. As a user comparing distros side by side or viewing a **Distro** detail page or the methodology caveats list, I want each **Caveat** consistently tagged as `"Newcomer caution"` or `"Worth knowing"`, so that I know at a glance whether a warning targets beginners or affects everyone.
3. As a newcomer reading a **Newcomer caution** banner on a **Distro** detail page, I want links back to the newcomer quiz and beginner-friendly catalog distros preserved, so that I have an easy next step if the distro looks too involved.
4. As a browser scanning the distro catalog grid, I want catalog cards to stay compact with just the `!` mark and **Caveat** headline, so that cards remain easy to scan while still flagging caveats early.
5. As a user moving from my **Recommendation Result** to side-by-side comparison and a **Distro** detail page, I want consistent `"Install"`, `"Day-to-day maintenance"`, `"Getting software"`, and `"Who feels at home"` headings everywhere, so that switching views never feels like comparing different concepts.
6. As a user checking official destinations across results, comparison, and detail pages, I want `"Website"`, `"Download"`, and `"Docs"` labels with clear accessible names (`"<Distro> <label> (opens in a new tab)"`) in all three places, so that navigation and screen-reader announcements remain uniform.
7. As a user inspecting a **Distro** with no pre-installed desktop environment (such as Arch Linux), I want catalog cards, hero metadata, `"At a glance"`, and comparison rows to consistently say `"No default desktop"`, so that every view reports the absence of defaults identically.
8. As a user checking how current curated profiles are across catalog cards, comparison footers, detail pages, and methodology, I want `"Last reviewed"` / `"Reviewed"` dates formatted consistently in human-readable form (or passed through unchanged if invalid), so that freshness cues match everywhere.
9. As a maintainer adding a new **Distro** with `ease-of-use <= 2`, I want domain integrity validation to reject a missing **Caveat** immediately on startup and in tests, so that low-ease distributions can never ship un-caveated or trigger view-local fallback prose.
10. As a maintainer changing how desktops, families, release models, expectations, official links, reviewed dates, or **Caveat** audience tags are presented, I want one deep presentation module with high **locality**, so that editing presentation rules once updates all five views.

## Implementation Decisions

- **Domain integrity invariant**: Enforce during domain dataset integrity validation that any **Distro** with `"ease-of-use"` rated `2` or below carries an explicit **Caveat**, alongside already mandatory caveat slugs. Remove the synthetic fallback caution computation from the detail view so `distro.caveat` is the sole source of truth across the entire application.
- **Deepened Distro presentation module**: Consolidate shared **Distro** display formatting—family and release model label lookup, default desktop list joining (`"No default desktop"` fallback), ISO review date formatting, unified expectation rows, official link metadata, and **Caveat** audience resolution—into one pure, React-free presentation module outside core domain scoring and querying. Delete the shallow single-function date formatter module.
- **Minimal presentation interface**: Expose a small interface consisting of `presentDistro` (returning one cohesive view-model covering `familyLabel`, `releaseModelLabel`, `desktopLabels`, `desktopsLabel`, `reviewedDateLabel`, `installDifficultyLabel`, structured `expectationFacts`, `officialLinks`, and resolved `caveat`) plus standalone `formatReviewedDate` exclusively for editorial review date-range summaries that span multiple distros.
- **Canonical Caveat presentation**: Resolve `distro.caveat` to `audienceLabel` (`"Newcomer caution"` when `mostRelevantTo === "newcomers"`, `"Worth knowing"` when `"everyone"`) and `isForNewcomers` boolean. Surface `audienceLabel` uniformly in methodology, comparison **Caveat** cells (with matching amber badge styling), and the detail caution banner (retaining newcomer quiz and beginner catalog links when `isForNewcomers` is true), while keeping catalog cards compact (`! {headline}`).
- **Unified expectation & official link labels**: Normalize living-with expectations as `"Install"` (carrying `installDifficultyLabel` badge `"Straightforward"`, `"Moderate"`, or `"Involved"`), `"Day-to-day maintenance"`, `"Getting software"`, and `"Who feels at home"`. Comparison and results inline `Install (<difficulty>)` while detail renders its difficulty pill badge; results alternatives keep their compact single-paragraph install summary backed by `installDifficultyLabel`. Standardize official link labels to `"Website"`, `"Download"`, and `"Docs"` with accessible tab announcements across results, comparison, and detail.
- **Domain glossary**: Record **Distro** and update **Caveat** with the `ease-of-use <= 2` invariant in the project glossary without implementation details.

## Testing Decisions

- **What makes a good test**: Tests cross the public module interfaces (`presentDistro`, `formatReviewedDate`, `findDomainIssues`, and `findDistroIssues`) and verify observable outputs and integrity diagnostics rather than duplicating UI rendering details.
- **Primary seams**:
  1. **Domain integrity seam**: Test that the curated dataset and quiz flows pass integrity validation cleanly, and verify via a modified low-ease **Distro** fixture (`ease-of-use <= 2` without `caveat`) that domain validation reports the missing **Caveat**.
  2. **Distro presentation seam**: Replace the shallow date-formatter unit tests with interface-level unit tests covering `presentDistro` (family/release labels, multiple desktops vs `"No default desktop"`, `null` **Caveat**, `"Newcomer caution"` vs `"Worth knowing"` resolution, unified `expectationFacts` & `installDifficultyLabel`, and `officialLinks`) alongside valid and fallback ISO cases for `formatReviewedDate`.
- **Prior art**: Existing Vitest + TypeScript unit test suites on pure domain and navigation modules across the codebase.

## Out of Scope

- Deepening the remaining two architecture candidates (`Return Context & Scroll Restoration` and `Catalog Query & Comparison URL State`).
- Audience filtering of **Caveat** notices outside the quiz (**Recommendation Result** already filters `newcomers`-only caveats during experienced **Quiz Run** scoring; neutral exploration views continue displaying every **Caveat** tagged with its audience).
- Changing recommendation scoring math, dimensions, or curated editorial prose content beyond unifying the mismatched section/link labels noted above.

## Further Notes

- The refactoring, domain glossary updates, unit tests, production build/lint checks, and Chromium visual checks described in this spec were already implemented and verified during the architecture-review session.
