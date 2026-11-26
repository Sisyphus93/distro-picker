# 02: Adopt unified catalog and comparison view snapshots across UI callers

**What to build:** Expose `resolveCatalogView`, `resolveCompareSelection`, and `resolveCompareView` snapshot resolvers from `src/catalog/catalog-state.ts`, migrate `CatalogPage`, `CatalogToolbar`, `ComparisonTray`, `ComparePage`, `DistroCard`, `DistroDetailPage`, and `return-context` to consume that single module without duplicating filter checks (`hasFilters`), priority summary prose, remaining-slot math (`MAX_COMPARISON_DISTROS - distros.length`), or ad-hoc slug filtering, and verify snapshot derivation in `src/catalog/catalog-state.test.ts`.

**Blocked by:** 01: Unify catalog and comparison URL codec and selection rules

**Status:** ready-for-agent

- [ ] `resolveCatalogView` computes `state`, `results`, `totalCount`, `hasFilters`, `comparisonFull`, `prioritySummary`, and `toolbarSummary` from `URLSearchParams`, and `CatalogPage` + `CatalogToolbar` render directly from those fields without local filter/summary duplication.
- [ ] `resolveCompareSelection` and `resolveCompareView` return `{ slugs, distros, remaining, isFull }`, removing duplicated `getDistrosBySlugs` and remaining-slot arithmetic from `ComparisonTray` and `ComparePage`.
- [ ] `CatalogPage` and `ComparePage` use `toggleCompareSlug` and `removeCompareSlug` (plus `buildCompareSearchParams([])` on clear) instead of ad-hoc array `.filter(...)` removal, and `DistroCard`, `DistroDetailPage`, and `return-context` import cleanly from `catalog-state`.
- [ ] Unit tests in `catalog-state.test.ts` cover `resolveCatalogView` across unfiltered, priority-filtered, search-only, and full-comparison states as well as `resolveCompareView` / `resolveCompareSelection`.
