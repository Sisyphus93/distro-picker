# 09: Distro detail page

**What to build:** A dedicated distro detail page for each curated distro, presenting the full profile standard in a clear, trustworthy layout. Users can understand what the distro is, who it’s for, where it falls short, how it rates across the shared dimensions, what day-to-day use is like, and where to find official sources.

**Blocked by:** 02: Shared domain model and curated distro dataset.

**Status:** completed

- [x] Each of the 16 curated distros has a reachable detail page/view powered by the shared dataset.
- [x] Detail page shows identity and context: name, logo/visual identifier, family/base, release model, default desktop(s), and short description.
- [x] Detail page shows “Best for”, “Not ideal for”, and key tradeoffs.
- [x] Detail page shows ratings/rationale across the shared 10 dimensions in a clear, scannable format.
- [x] Detail page includes “What to expect” covering install difficulty, maintenance/update style, software install experience, and who will feel at home.
- [x] Detail page includes official website, download, and documentation links, and displays a “Last reviewed” date.
- [x] Caveat-heavy/advanced distros display clear cautionary guidance appropriate for newcomers.
- [x] Page is responsive, accessible, and easy to navigate back to catalog/results/home.

## Comments

- Ticket 01 left the `/distros/:slug` route rendering `DistroPlaceholder` in `src/App.tsx`. It now renders `src/detail/DistroDetailPage.tsx`, which resolves the slug with `getDistroBySlug` and renders the shared `DistroProfile` directly — no second copy of the dataset. A stale/unknown slug gets a friendly "not found" view with catalog and home links rather than an error.
- The page shows the monogram tile, name, tagline, summary, family/base, release model (with cadence note), default desktop(s) (with the "no default desktop" note where relevant), install difficulty, "Last reviewed" (with `<time dateTime>`), "Best for", "Not ideal for", key tradeoffs, all ten dimension ratings (accessible pips + `x/5` + 1/5 scale labels + rationale), all four "What to expect" fields, and official website/download/documentation links. External links open in a new tab with an explicit accessible label and `rel="noreferrer noopener"`.
- Curated caveats appear in a prominent caution banner. When a caveat is relevant to newcomers — or a distro is rated 2 or lower on ease of setup & use — the banner adds newcomer-specific guidance and links to the newcomer quiz and the catalog. A derived caution still appears if an advanced profile ever loses its curated caveat.
- Navigation context lives in `src/navigation/profile-origin.ts`. Catalog cards, results cards and comparison profile links now pass a validated origin in router state, so "Back" returns to the exact catalog view (search, filters, sort, comparison selection and scroll position), results or comparison. Router state is re-validated against an allowlist of in-app paths so tampered history entries cannot turn the back link into an off-site jump; direct links fall back to the unfiltered catalog. Breadcrumbs, quick links and previous/next distro links carry the same context.
- The catalog tracks its latest scroll position while mounted and the detail page restores it on return. The comparison view passes its own catalog return context through the profile visit, so comparison → profile → comparison → catalog keeps the originating filtered catalog.
- Layout and styles were appended to `src/style.css`: a two-column desktop layout with a sticky quick-facts/sources sidebar, single-column tablet/mobile breakpoints at 900px/720px, semantic headings and lists, a real breadcrumb nav, `role="note"` caution, visible global focus states, and no colour-only rating information.
- Tests: `src/detail/DistroDetailPage.test.tsx` renders every one of the 16 profiles through the route and asserts the full profile (all ten dimensions, rationales, links, dates, what-to-expect and fit fields), caution behaviour, origin-aware back links, unknown slugs and the `App` route wiring. `src/navigation/profile-origin.test.ts` covers URL-state serialization, tampered-state rejection, comparison context and scroll tracking.
- Verified `npm run typecheck`, `npm test` (90 tests), and `npm run build`. Temporary happy-dom interaction checks (since removed, per the no-UI-tests-in-v1 decision) covered catalog → profile → catalog with filters and scroll state intact, and comparison → profile → comparison with its catalog return context intact. The dev/preview server also serves deep links such as `/distros/ubuntu` directly.
- Not done (by design): the methodology page is still the placeholder owned by ticket 10; the detail page's "How we recommend" / "How we rate distros" links point at it.
