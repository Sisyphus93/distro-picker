# 01: Scope Caveat warnings by audience flow in recommendations

**What to build:** Enforce **Caveat** audience scoping (`newcomers` vs `everyone`) directly when building **Recommendation Result** warnings so experienced users are no longer shown newcomer-only **Caveat** notices, and simplify the results view to render engine warnings verbatim without redundant filtering.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Experienced **Preference Profile** recommendations suppress `newcomers`-only **Caveat** notices from their warnings while preserving `everyone` **Caveat** notices.
- [ ] Newcomer **Preference Profile** recommendations continue to surface both `newcomers` and `everyone` **Caveat** notices in their warnings.
- [ ] Extreme dimension mismatch warnings continue to combine cleanly with applicable **Caveat** warnings.
- [ ] The results view renders **Recommendation Result** warnings directly without duplicating or short-circuiting **Caveat** audience filtering.
- [ ] Scoring tests cover `newcomers` vs `everyone` **Caveat** scoping across both newcomer and experienced flows through the recommendation engine interface.
