# 06: Results page with transparent recommendations

**What to build:** A Results view that presents quiz outcomes transparently and helpfully. Users see a clear top pick, 2 close alternatives, qualitative fit indicators (Strong/Good/Partial), reasons why each fits, key tradeoffs/caveats, “what to expect” summaries, and official links. The page helps users trust the recommendation and take next steps, including retaking/adjusting answers or exploring the catalog.

**Blocked by:** 04: Shared quiz UI and newcomer flow.

**Status:** completed

- [x] Results page displays a clear top pick plus 2 close alternatives from the recommendation engine output.
- [x] Each recommended distro shows a qualitative fit indicator (`Strong`, `Good`, or `Partial`) and does not show numeric percentage scores.
- [x] Each recommendation includes clear “why this fits” reasons, key tradeoffs/caveats, and a short “what to expect” summary.
- [x] Extreme mismatches or caveat-heavy recommendations surface clear warnings/caveats where relevant.
- [x] Recommended distros include official website/download/docs links to trusted sources.
- [x] User can retake the quiz or adjust answers from the results experience.
- [x] User can navigate from results to distro detail pages and/or the catalog for further exploration.
- [x] Results layout is responsive, readable, and accessible on mobile and desktop.

## Comments

- Implemented on `arena/0d230ec3-distro-picker` (PR #7): top pick and two close alternatives from `recommendDistros`, qualitative fit badges with no percentages, “Why this fits” / “Worth knowing” / “What to expect”, caveat and extreme-mismatch warnings, official links, retake/adjust actions, and detail/catalog navigation.
- Follow-up on `arena/a1b87ff9-distro-picker`: the results page now renders every match reason and tradeoff for the top pick and both alternatives instead of truncating the lists, so all stated preferences are visible as the spec asks.
- The originating ticket had been left `ready-for-agent` with unchecked items after PR #7; status and checkboxes now record the shipped work.
