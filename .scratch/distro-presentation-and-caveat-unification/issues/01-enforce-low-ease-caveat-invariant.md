# 01: Enforce ease-of-use <= 2 Caveat completeness in domain integrity

**What to build:** Enforce **Caveat** completeness inside domain dataset integrity validation so any **Distro** rated `2` or below on ease of setup & use must carry an explicit **Caveat** alongside already mandatory slugs, and remove the synthetic fallback caution from the detail view so every view uses editorial **Caveat** prose as the sole source of truth.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Domain dataset validation rejects any **Distro** with `ease-of-use <= 2` that lacks an explicit **Caveat**, while the curated dataset passes validation cleanly.
- [x] The detail view reads solely from `distro.caveat` without generating fallback caution prose when a **Caveat** is absent.
- [x] Domain integrity unit tests verify both clean validation of the curated dataset and failure detection when a fixture rated `ease-of-use <= 2` omits its **Caveat**.

## Comments

- Verified `findDistroIssues` already reports a missing **Caveat** for any **Distro** rated `ease-of-use <= 2` (not just `CAVEAT_REQUIRED_SLUGS`), and the curated 16-distro dataset passes `findDomainIssues` cleanly.
- Verified `DistroDetailPage` renders only `presentDistro(distro).caveat`; no synthetic fallback caution prose remains anywhere in `src/`.
- Replaced the duplicated low-ease fixture in `src/domain/integrity.test.ts` with one `handsOnFixture` builder and added a regression test proving a low-ease **Distro** that *does* carry a **Caveat** validates cleanly, so the invariant stays scoped to caveat presence rather than to low ease itself.
- `npm test` (83 tests), `npm run typecheck`, and `npm run build` all pass.
