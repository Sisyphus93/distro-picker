# 01: Unify catalog and comparison URL codec and selection rules

**What to build:** Merge `catalog-search.ts`, `compare-search.ts`, and `domain/comparison.ts` into one pure React-free `src/catalog/catalog-state.ts` module owning the three-slot comparison rules (`MAX_COMPARISON_DISTROS`, `normalizeComparisonSelection`, `toggleCompareSlug`, `removeCompareSlug`), `?q=&dim=&sort=&compare=` and `?distros=` parsing/serialization, shared `dimensionRank` priority ordering, and `buildCatalogComparePath` built through the single catalog codec; remove the old `domain/comparison` barrel export and delete the three superseded modules and their old tests; and write consolidated unit tests in `src/catalog/catalog-state.test.ts`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `normalizeComparisonSelection`, `toggleCompareSlug`, and `removeCompareSlug` enforce the three-distro cap, drop unknown or duplicate slugs, preserve picking order, and allow removal even when full.
- [ ] `parseCatalogViewState` and `buildCatalogViewSearchParams` reuse shared `dimensionRank` ordering instead of a local `byDimensionOrder` helper, trim/cap search terms, omit defaults cleanly, and reject unknown dimensions or sort keys.
- [ ] `parseCompareSlugs`, `buildCompareSearchParams`, `buildComparePath`, and `buildCatalogComparePath` parse both comma-separated and repeated `?distros=` params and route all `/catalog?...&compare=...` generation through `parseCatalogViewState` + `buildCatalogViewSearchParams` so dirty `catalogSearch` parameters are sanitized consistently.
- [ ] `catalog-search.ts`, `compare-search.ts`, `domain/comparison.ts`, and their separate test files are deleted (with `domain/index.ts` updated), and `catalog-state.test.ts` covers comparison selection rules, catalog URL round-trips, and `?distros=` / `?compare=` path building.
