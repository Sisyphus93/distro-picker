# Catalog Query & Comparison URL State

Status: ready-for-agent

## Problem Statement

Catalog search, priority filtering, sorting, and three-distro comparison state were fragmented across three small modules and four UI views, causing duplicate logic and inconsistent URL sanitization:

- Catalog query parameters (`?q=`, `?dim=`, `?sort=`, `?compare=`) live in one module (`catalog-search.ts`), side-by-side comparison parameters (`?distros=`) live in another (`compare-search.ts`), and the 3-slot comparison rules (`MAX_COMPARISON_DISTROS`, normalization, toggle) sit in a tiny standalone domain module (`domain/comparison.ts`) used only by catalog and comparison views.
- Returning from comparison to the catalog constructs `/catalog?...&compare=...` paths by mutating raw `URLSearchParams` directly inside `buildCatalogComparePath`, bypassing the catalog URL parser and allowing stale, malformed, or out-of-order query parameters in `catalogSearch` to survive round-trips.
- Priority ordering in catalog query state re-implements its own index lookup (`byDimensionOrder`) instead of reusing the canonical `dimensionRank` helper from dimensions metadata.
- Filter checks (`hasFilters`), `prioritySummary` prose formatting, remaining-slot arithmetic (`MAX_COMPARISON_DISTROS - distros.length`), and ad-hoc slug removal (`.filter(...)`) are repeated across `CatalogPage`, `CatalogToolbar`, `ComparisonTray`, and `ComparePage`.

## Solution

Unify catalog query state, priority ordering, three-slot comparison rules, toolbar/filter summary derivation, and both `?compare=` and `?distros=` URL codecs into one deep React-free module (`catalog-state.ts`), removing the three fragmented modules and delegating canonical comparison-to-catalog URL building through one shared parser and serializer.

## User Stories

1. As a browser opening `/catalog` with untrusted, stale, or manually edited query parameters (unknown dimensions, unknown sort keys, duplicate slugs, or oversized search terms), I want them cleanly sanitized to defaults and valid selections in shared **Dimensions** order without crashing or corrupting results.
2. As a user selecting priorities (`?dim=`) or toggling `"Compare"` checkboxes on **Distro** cards, I want the catalog URL to omit default values cleanly when cleared and keep priorities ordered identically to the quiz and methodology views.
3. As a user picking up to three **Distro** profiles for side-by-side comparison, I want the remaining cards to disable once three are picked while still letting me remove any already-selected distro from either a card, the tray, or the comparison page.
4. As a user inspecting or narrowing distros in `/compare` (`?distros=...`) and returning to `/catalog` (`?compare=...`), I want `buildCatalogComparePath` to sanitize and preserve my catalog search, priority filters, and sort order through the exact same URL codec the catalog itself uses.
5. As a user navigating via bookmarked `/compare?distros=...` links with whitespace, repeated `distros` parameters, unknown slugs, or more than three slugs, I want the selection normalized identically across the tray and comparison views.
6. As a maintainer modifying comparison limits, query parameter names, or toolbar filter summaries, I want one deep state module with high **locality** so UI views stay thin and no second URL serializer can drift out of sync.

## Implementation Decisions

- **Unified catalog state module**: Merge `catalog-search.ts`, `compare-search.ts`, and `domain/comparison.ts` into one deep React-free module (`src/catalog/catalog-state.ts`) and delete the three superseded modules and their separate test suites.
- **Canonical URL codec & comparison rules**:
  - Own `MAX_SEARCH_LENGTH` (`80`), `MAX_COMPARISON_DISTROS` (`3`), `CatalogViewState`, `DEFAULT_CATALOG_VIEW_STATE`, `normalizeComparisonSelection`, `toggleCompareSlug`, `removeCompareSlug`, `togglePriority`, `parseCatalogViewState`, `buildCatalogViewSearchParams`, `parseCompareSlugs`, `buildCompareSearchParams`, and `buildComparePath` in one place.
  - Reuse shared `dimensionRank` from `dimensions.ts` directly inside priority normalization instead of maintaining a separate `byDimensionOrder` helper.
  - Implement `buildCatalogComparePath(slugs, catalogSearch)` by parsing `catalogSearch` with `parseCatalogViewState` and serializing `{ ...parsed, compare: normalizeComparisonSelection(slugs) }` through `buildCatalogViewSearchParams`, guaranteeing one canonical `?compare=` serializer and full sanitization across `Compare -> Catalog` returns.
- **Derived snapshot resolvers**: Expose `resolveCatalogView(searchParams)` returning `{ state, results, totalCount, hasFilters, comparisonFull, prioritySummary, toolbarSummary }` and `resolveCompareSelection(slugs)` / `resolveCompareView(searchParams)` returning `{ slugs, distros, remaining, isFull }`.
- **Thin UI views**: Update `CatalogPage`, `CatalogToolbar`, `ComparisonTray`, `ComparePage`, `DistroCard`, `DistroDetailPage`, and `return-context` to consume `catalog-state.ts` without duplicating `hasFilters`, priority summary formatting, slot-remaining arithmetic, or ad-hoc slug filtering.

## Testing Decisions

- **What makes a good test**: Tests exercise the public `catalog-state` interface against untrusted URL query strings, selection transitions, and derived snapshots rather than internal helper functions or React rendering details.
- **Primary seams**:
  1. **Comparison selection seam**: Verify the three-distro cap, order-preserving deduplication and unknown-slug dropping (`normalizeComparisonSelection`), `toggleCompareSlug` at partial and full capacity, and clean removal via `removeCompareSlug`.
  2. **Catalog URL & snapshot seam**: Verify empty-default omission, search trimming and length capping, `dimensionRank` ordering, unknown dimension/sort rejection, `togglePriority`, round-trip serialization, and `resolveCatalogView` (`results`, `hasFilters`, `comparisonFull`, `prioritySummary`, and `toolbarSummary` across unfiltered, priority-filtered, and search-only states).
  3. **Compare URL & path codec seam**: Verify comma-separated and repeated `?distros=` parsing, `buildComparePath`, `resolveCompareView` / `resolveCompareSelection` remaining/full calculations, and `buildCatalogComparePath` sanitizing dirty `catalogSearch` parameters through the single shared catalog codec.
- **Prior art**: Existing Vitest + TypeScript unit tests on `domain/catalog.test.ts` and `navigation/return-context.test.ts`.

## Out of Scope

- Domain catalog matching/scoring (`domain/catalog.ts`), which remains a standalone pure domain module shared with recommendation/integrity checks.
- Persisting comparison selections across unrelated browser sessions beyond URL query parameters and current-tab return navigation.
- Changing catalog query parameter names (`q`, `dim`, `sort`, `compare`, `distros`).

## Further Notes

- No domain glossary changes are required; URL state serialization and comparison UI slot limits are general application mechanics rather than new domain concepts.
- All code changes, consolidated unit tests, production build/lint checks, and Chromium interactive checks described in this spec were already implemented and verified during the architecture-review session.
