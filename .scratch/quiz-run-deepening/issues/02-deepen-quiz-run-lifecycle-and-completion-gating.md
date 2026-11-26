# 02: Deepen Quiz Run lifecycle and gate Recommendation Result on completion

**What to build:** Consolidate **Quiz Run** persistence, answer validation, stale-identifier pruning, neutral-option filtering, step clamping, and **Recommendation Result** resolution into one deep **Quiz Run** module behind an injectable `StorageAdapter` seam (browser `sessionStorage` with an in-memory fallback vs. an in-memory adapter for tests). Wire the quiz and results views directly to this interface, removing the shallow quiz route pass-through and router-state run transport, and gate **Recommendation Result** availability on explicit **Quiz Run** completion.

**Blocked by:** 01: Scope Caveat warnings by audience flow in recommendations

**Status:** ready-for-agent

- [ ] Browsing a quiz intro without answering any questions does not persist a **Quiz Run**, does not overwrite an existing completed **Quiz Run** on the other path, and leaves the results view in its "No results yet" empty state.
- [ ] Recording one or more answers persists the **Quiz Run** and allows resuming from the saved step on the same path, while keeping the results view empty until the final question is submitted.
- [ ] Resuming a saved **Quiz Run** prunes unknown question/option identifiers, enforces neutral-option exclusions, and clamps out-of-range steps safely.
- [ ] Completing the final question marks the **Quiz Run** completed and resolves the **Recommendation Result** cleanly on the results view without router-state payloads, surviving page reloads.
- [ ] Returning from results to adjust answers preserves prior choices; editing an answer requires re-submitting the final step before exposing updated results, and starting over clears all saved state.
- [ ] Storage failures (such as blocked `sessionStorage`) fall back gracefully in memory so the in-tab quiz-to-results journey still works without crashing.
- [ ] Unit tests verify the full **Quiz Run** lifecycle—lazy persistence, completion gating, resume, stale pruning, reset, throwing storage handling, and flow-scoped **Caveat** output—through the **Quiz Run** interface using an in-memory `StorageAdapter`.
