# 03: Recommendation engine and scoring tests

**What to build:** The core recommendation engine as a pure TypeScript module — the confirmed v1 testing seam. It takes a user preference profile derived from quiz answers plus the curated distro dataset and returns ranked recommendations with qualitative fit labels (Strong/Good/Partial), a top pick, 2 close alternatives, match reasons, and tradeoffs/caveats. “Not sure” answers are neutral. No hard eliminations in v1; extreme mismatches surface as strong caveats.

**Blocked by:** 02: Shared domain model and curated distro dataset.

**Status:** ready-for-agent

- [ ] Recommendation engine is implemented as pure TypeScript logic separated from React/UI code.
- [ ] Engine accepts quiz-derived preference input and the distro dataset, and returns ranked results with qualitative fit (`Strong`, `Good`, `Partial`), top pick, and 2 close alternatives.
- [ ] “Not sure / no preference” answers do not penalize or artificially boost distros.
- [ ] Results include transparent match reasons and tradeoffs/caveats; extreme mismatches are surfaced as caveats rather than hard-eliminating distros in v1.
- [ ] No numeric percentage match scores are produced by the engine.
- [ ] Deterministic unit tests cover the confirmed seam: scoring/ranking behavior, “not sure” neutrality, qualitative fit labeling, top-pick/alternative selection, and caveat/tradeoff surfacing.
- [ ] Tests verify external behavior through the engine’s public interface, not implementation details.
