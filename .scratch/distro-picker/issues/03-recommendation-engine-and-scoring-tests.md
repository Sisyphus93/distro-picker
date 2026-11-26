# 03: Recommendation engine and scoring tests

**What to build:** The core recommendation engine as a pure TypeScript module — the confirmed v1 testing seam. It takes a user preference profile derived from quiz answers plus the curated distro dataset and returns ranked recommendations with qualitative fit labels (Strong/Good/Partial), a top pick, 2 close alternatives, match reasons, and tradeoffs/caveats. “Not sure” answers are neutral. No hard eliminations in v1; extreme mismatches surface as strong caveats.

**Blocked by:** 02: Shared domain model and curated distro dataset.

**Status:** completed

- [x] Recommendation engine is implemented as pure TypeScript logic separated from React/UI code.
- [x] Engine accepts quiz-derived preference input and the distro dataset, and returns ranked results with qualitative fit (`Strong`, `Good`, `Partial`), top pick, and 2 close alternatives.
- [x] “Not sure / no preference” answers do not penalize or artificially boost distros.
- [x] Results include transparent match reasons and tradeoffs/caveats; extreme mismatches are surfaced as caveats rather than hard-eliminating distros in v1.
- [x] No numeric percentage match scores are produced by the engine.
- [x] Deterministic unit tests cover the confirmed seam: scoring/ranking behavior, “not sure” neutrality, qualitative fit labeling, top-pick/alternative selection, and caveat/tradeoff surfacing.
- [x] Tests verify external behavior through the engine’s public interface, not implementation details.

## Comments

- Implemented in `src/domain/recommendation/`: `engine.ts` exports `recommendDistros(profile, distros)` — pure TypeScript, no React/UI imports, re-exported through `src/domain/recommendation/index.ts` and the `src/domain` barrel.
- Scoring compares the quiz-derived 1–5 ideal against each distro’s 1–5 rating per stated preference (`gap = |rating - ideal|`, weighted by the 1–3 preference weight). Fit labels derive from the weight-averaged gap: `≤ 1` → `Strong`, `≤ 2` → `Good`, otherwise `Partial`. Exact rating matches earn `Strong` per-dimension reasons; one-point misses earn `Good` reasons; gaps of 2+ become tradeoffs phrased against the preference; gaps of 3+ additionally raise a warning. Caveat-heavy distros (e.g. Arch, NixOS, Manjaro) always surface their curated caveat in `warning`.
- “Not sure” answers stay neutral end-to-end: `buildPreferenceProfile` omits them, and the engine treats absent preferences as nothing to score against — an all-neutral profile yields a stable dataset-order ranking with `Good` fits and no invented reasons. A test verifies this through the public quiz→engine path.
- No numeric match scores are produced: fit labels are the only scores, and a test asserts no numeric leaves appear outside the embedded distro profile. No hard eliminations — a badly misfitting distro is ranked last with `Partial`, never removed.
- Ties keep the curated dataset order (stable sort). The engine throws a clear error when asked to recommend from fewer than three distros, and `alternatives` is always exactly two picks distinct from the top pick.
- Tests live in `src/domain/recommendation/engine.test.ts` (22 tests): synthetic fixtures for behavior slices (ranking, weighting, labels, reasons, tradeoffs, warnings, neutrality, determinism/tie-breaking, minimum dataset size) plus an integration slice against the real 16-distro dataset (ranking shape, label-only output, caveat surfacing, all-“not sure” quiz neutrality). Vitest was added as the test runner (`npm test`; `npm run test:watch` for watch mode); this ticket is the first to need one.
- `npm run typecheck`, `npm test`, and `npm run build` pass.
