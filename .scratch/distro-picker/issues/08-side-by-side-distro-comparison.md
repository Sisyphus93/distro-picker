# 08: Side-by-side distro comparison

**What to build:** A side-by-side comparison experience that lets users select up to 3 distros from the catalog and compare them across shared profile fields and dimension ratings. The comparison makes tradeoffs easy to scan and uses the same shared data model as quiz results and distro detail pages.

**Blocked by:** 07: Catalog with search, filters, and sort.

**Status:** completed

- [x] Users can select up to 3 distros for comparison from the catalog; the UI prevents or clearly handles selecting more than 3.
- [x] Comparison view displays selected distros side-by-side on desktop and in a usable responsive layout on smaller screens.
- [x] Comparison includes shared profile fields: name, family/base, release model, default desktop(s), best for, not ideal for, key tradeoffs, and relevant “what to expect” summary.
- [x] Comparison includes shared 10-dimension ratings/rationale in a consistent, scannable format.
- [x] Users can remove a distro from comparison or change their selection without losing their place in the catalog.
- [x] Comparison links to official sources and/or distro detail pages for deeper evaluation.
- [x] Comparison controls and table/layout are keyboard accessible and semantically structured.

## Comments

- Ticket 07 left a seam to build on: the catalog keeps its comparison selection in the URL (`/catalog?compare=slug&compare=slug`) and links to `/compare?distros=slug,slug,slug`. `/compare` currently renders `CompareStubPage` (`src/catalog/CompareStubPage.tsx`), which resolves those slugs with `getDistrosBySlugs` (dropping stale ones) and shows the selection plus a back link. Replace that page with the real comparison table; the catalog and tray need no changes.
- Selection rules already exist and are tested in `src/domain/comparison.ts` (`MAX_COMPARISON_DISTROS = 3`, `toggleComparisonSelection`, `normalizeComparisonSelection`). Reuse them rather than re-deriving the cap, and keep the catalog's `?compare=` params in sync when a distro is removed from the comparison view so returning to the catalog keeps the narrowed selection.

- Implemented `/compare` as a semantic, horizontally scrollable comparison table using the shared profiles and all ten ratings with rationales and scale labels. It supports empty and one-distro selections, individual removal, clear, and links to official sources.
- Review follow-up: a "Caveat" row now shows each profile's curated caveat (or says there is none), so advanced/caveat-heavy distros are labelled in comparison as well as in catalog, results and detail views.
- Selection is normalized and capped for direct links. The catalog passes its URL state and scroll position to the comparison; return links preserve search, filters and sort while synchronizing the current selection. Direct links fall back to an unfiltered catalog.
- Keyboard users can focus the scroll region and remove controls; after removal focus returns to the comparison heading. The narrow layout keeps row headers visible while scrolling.
- Verified `npm run typecheck`, `npm test` (80 tests), and `npm run build`. Additional temporary DOM interaction checks covered the filtered catalog round-trip, removal and focus, direct-link normalization, and clearing the selection.
