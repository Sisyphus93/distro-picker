# 01: Scope Caveat warnings by audience flow in recommendations

**What to build:** Enforce **Caveat** audience scoping (`newcomers` vs `everyone`) directly when building **Recommendation Result** warnings so experienced users are no longer shown newcomer-only **Caveat** notices, and simplify the results view to render engine warnings verbatim without redundant filtering.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Experienced **Preference Profile** recommendations suppress `newcomers`-only **Caveat** notices from their warnings while preserving `everyone` **Caveat** notices.
- [x] Newcomer **Preference Profile** recommendations continue to surface both `newcomers` and `everyone` **Caveat** notices in their warnings.
- [x] Extreme dimension mismatch warnings continue to combine cleanly with applicable **Caveat** warnings.
- [x] The results view renders **Recommendation Result** warnings directly without duplicating or short-circuiting **Caveat** audience filtering.
- [x] Scoring tests cover `newcomers` vs `everyone` **Caveat** scoping across both newcomer and experienced flows through the recommendation engine interface.

## Comments

- Audience filtering was already implemented in the recommendation engine in the starting checkout. Expanded engine tests verify both audience flows, complete caveat text, and multiple extreme mismatches, including when a newcomer-only caveat is suppressed.
- The results view now references engine warnings directly. Rendered output was checked for completed newcomer and experienced runs, including an experienced mismatch and a universal caveat.
- `npm run typecheck`, `npm test` (82 tests), and `npm run build` pass.
