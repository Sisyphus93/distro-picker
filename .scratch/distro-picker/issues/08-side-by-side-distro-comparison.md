# 08: Side-by-side distro comparison

**What to build:** A side-by-side comparison experience that lets users select up to 3 distros from the catalog and compare them across shared profile fields and dimension ratings. The comparison makes tradeoffs easy to scan and uses the same shared data model as quiz results and distro detail pages.

**Blocked by:** 07: Catalog with search, filters, and sort.

**Status:** ready-for-agent

- [ ] Users can select up to 3 distros for comparison from the catalog; the UI prevents or clearly handles selecting more than 3.
- [ ] Comparison view displays selected distros side-by-side on desktop and in a usable responsive layout on smaller screens.
- [ ] Comparison includes shared profile fields: name, family/base, release model, default desktop(s), best for, not ideal for, key tradeoffs, and relevant “what to expect” summary.
- [ ] Comparison includes shared 10-dimension ratings/rationale in a consistent, scannable format.
- [ ] Users can remove a distro from comparison or change their selection without losing their place in the catalog.
- [ ] Comparison links to official sources and/or distro detail pages for deeper evaluation.
- [ ] Comparison controls and table/layout are keyboard accessible and semantically structured.

## Comments

- Ticket 07 left a seam to build on: the catalog keeps its comparison selection in the URL (`/catalog?compare=slug&compare=slug`) and links to `/compare?distros=slug,slug,slug`. `/compare` currently renders `CompareStubPage` (`src/catalog/CompareStubPage.tsx`), which resolves those slugs with `getDistrosBySlugs` (dropping stale ones) and shows the selection plus a back link. Replace that page with the real comparison table; the catalog and tray need no changes.
- Selection rules already exist and are tested in `src/domain/comparison.ts` (`MAX_COMPARISON_DISTROS = 3`, `toggleComparisonSelection`, `normalizeComparisonSelection`). Reuse them rather than re-deriving the cap, and keep the catalog's `?compare=` params in sync when a distro is removed from the comparison view so returning to the catalog keeps the narrowed selection.
