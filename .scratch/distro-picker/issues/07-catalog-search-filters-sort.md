# 07: Catalog with search, filters, and sort

**What to build:** A browsable distro catalog for users who want to explore options directly. The catalog lists all 16 curated distros and supports search by name, dimension-based filters, and useful sorting. It uses the shared domain model and presents distro cards with enough information to scan and compare at a high level.

**Blocked by:** 02: Shared domain model and curated distro dataset.

**Status:** completed

- [x] Catalog page lists all 16 curated distros from the shared dataset.
- [x] Users can search distros by name.
- [x] Users can filter distros using the shared 10-dimension model (or clear filter controls derived from it), enabling meaningful narrowing of options.
- [x] Users can sort the catalog by useful criteria (at minimum options covering beginner-friendly, lightweight/performance, gaming-ready, and stable/reliable use cases, as supported by the data model).
- [x] Distro cards show key scan-friendly information (e.g., name, short description, release model/base, notable strengths/caveats) and link to distro detail.
- [x] Catalog supports selecting distros for comparison (up to 3) with clear UI state, ready for the comparison view.
- [x] Catalog is responsive and keyboard accessible, with clear filter/search labels and visible focus states.

## Comments

- `/catalog` now renders `CatalogPage` (`src/catalog/CatalogPage.tsx`) instead of the placeholder; all 16 curated distros come straight from `DISTROS` — no second copy of the dataset exists.
- **View state lives in the URL** (`?q=`, `?dim=` repeated, `?sort=`, `?compare=`), so a filtered view can be linked, bookmarked and reloaded, and returning from a distro page restores the exact results and selection. Parsing drops unknown/stale ids and caps the search term, so old links can't break the page. Translations live in `src/catalog/catalog-search.ts` and are unit-tested.
- **Search** is name-only and forgiving: lowercased alphanumerics, so `pop os`, `popos` and `POP!_OS` all match Pop!_OS. Blank input means no filter, and there is an explicit clear button.
- **Filters** are the shared ten dimensions, presented as labelled chips ("Priorities — only show distros rated 4+ on…"). A distro must rate at least 4 on *every* picked priority. This is deliberately "must clear the bar", not "best average", so the filter explanation stays honest. Filters combine with search, and there is a summary line, a live result count (`role="status"`), and a clear-all action. No priority pair empties the real dataset, so the empty state was verified with a search+priority combination.
- **Sorts** (`src/domain/catalog.ts`) cover curated order, name A–Z, beginner-friendly, lightweight, gaming, stability, hardware, software, desktop polish, community/docs, customisability and free-software stance — ten of the twelve map onto a shared dimension, rated strongest-first with curated order breaking ties. Tests assert every sort keeps all 16 distros.
- **Cards** show the monogram, name, tagline, family · base · release model · default desktop(s), up to three notable strengths (4+ ratings, strongest first) with accessible 1–5 pips, the caveat headline where one exists, "Reviewed <date>", and a profile link. `DistroMark` was extracted from the results page into `src/components/DistroMark.tsx` rather than duplicated.
- **Comparison selection** is capped at three by `toggleComparisonSelection`/`normalizeComparisonSelection` in `src/domain/comparison.ts`. Selected cards get a visible outline, the footer control reads "In comparison", unselected controls disable once three are picked (with a title explaining the limit), and a sticky tray lists the picks with per-item remove, clear, and a working path to `/compare`.
- `/compare` currently renders a small `CompareStubPage` that parses `?distros=` with `getDistrosBySlugs` and confirms the selection survives navigation. Ticket 08 replaces it with the real side-by-side table; the catalog only needs to keep emitting that URL.
- Accessibility: a real `<label>` for search and sort, native checkboxes inside a `<fieldset>`/`<legend>`, explicit `aria-label`s so the decorative `+`/`✓` glyphs don't leak into accessible names, an amber `:focus-visible` ring on every control (including the visually-hidden inputs via `:has()`), `aria-live` result counts, and semantic `<article>`/`<ul>` structure. Keyboard users can tab through every filter, card link and compare toggle.
- Verified: `npm run typecheck`, `npm test` (65 tests: 36 new domain tests, 12 URL-state tests, 2 date-format tests), `npm run build`, and temporary SSR + happy-dom interaction checks (since removed, per the no-UI-tests-in-v1 decision) covering search, filter toggling, sorting, the three-item cap and disable state, URL round-tripping, the tray, the empty state, section structure and link targets.
- Not done (by design): distro detail pages are still the placeholder, so "View profile" resolves there until ticket 09; the side-by-side table itself belongs to ticket 08.
