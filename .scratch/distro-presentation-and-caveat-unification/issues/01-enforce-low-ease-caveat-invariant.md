# 01: Enforce ease-of-use <= 2 Caveat completeness in domain integrity

**What to build:** Enforce **Caveat** completeness inside domain dataset integrity validation so any **Distro** rated `2` or below on ease of setup & use must carry an explicit **Caveat** alongside already mandatory slugs, and remove the synthetic fallback caution from the detail view so every view uses editorial **Caveat** prose as the sole source of truth.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Domain dataset validation rejects any **Distro** with `ease-of-use <= 2` that lacks an explicit **Caveat**, while the curated dataset passes validation cleanly.
- [ ] The detail view reads solely from `distro.caveat` without generating fallback caution prose when a **Caveat** is absent.
- [ ] Domain integrity unit tests verify both clean validation of the curated dataset and failure detection when a fixture rated `ease-of-use <= 2` omits its **Caveat**.
