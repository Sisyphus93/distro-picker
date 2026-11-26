# Return Context & Scroll Restoration

Status: ready-for-agent

## Problem Statement

People navigating between the catalog, side-by-side comparison, methodology notes, **Recommendation Result**, and individual **Distro** profiles lose context or see jarring scroll jumps because return origins and scroll management are fragmented across views:

- Origin state building and validation (`createProfileLinkState` and `"Back to ..."` resolution) live separately from catalog-comparison round-tripping, leaving `ComparisonTray` to intercept `<Link>` clicks with manual imperative navigation and `ComparePage` to manually assemble return paths, preserved query state, and detail link state inline.
- Scroll management is split between an app-root scroll-to-top call and a `CatalogPage`-local module-level `Map` listener, which bypasses React's navigation flow, loses saved positions on tab reloads or multi-step round-trips, and gets overridden by smooth CSS scrolling on route changes.
- Clicking a **Distro** from the methodology page drops the user's actual origin, defaulting the detail toolbar's back button to `"Back to catalog"` instead of returning to `/methodology`.
- Returning to `/catalog` from `/compare` after removing or clearing compared distros changes the `?compare=` query string, missing naive scroll caches keyed by raw `location.search`.

## Solution

Consolidate cross-view return origins (`Home`, `Catalog`, `Results`, `Compare`, and `Methodology`) and route-level scroll restoration into one deep navigation return-context module behind injectable storage and viewport adapters, keeping every view declarative through standard `<Link>` elements and router state.

## User Stories

1. As a browser scrolling down the distro catalog, checking distros, and opening `/compare`, I want `/compare` to open cleanly at the top of the page rather than inheriting my catalog scroll offset.
2. As a user inspecting a **Distro** from `/compare`, removing one distro from the comparison, and clicking `"Back to comparison"` then `"Back to catalog"`, I want to land back at my filtered catalog search/sort view with the narrowed `?compare=` selection AND my exact prior catalog scroll position restored.
3. As a reader clicking a **Distro** link on the methodology page (either curated examples or listed caveats), I want the **Distro** detail toolbar to offer `"Back to methodology"` and return me directly to `/methodology`.
4. As a user browsing adjacent **Distro** profiles via `"Previous distro"` and `"Next distro"`, I want my original `"Back to ..."` context preserved across sibling hops instead of being overwritten or lost.
5. As a user clicking top navigation `"Explore distros"` from Home, Results, or Methodology after having scrolled `/catalog` earlier in the session, I want the fresh forward visit to start at the top of `/catalog` rather than jumping unexpectedly to an old scroll position.
6. As a user pressing the browser Back button to return to `/catalog`, I want browser history (`POP`) navigation to restore the saved scroll position for that filtered catalog view even without explicit link state.
7. As a user adjusting catalog search, priority filters, or sort order—or clicking in-page hash anchors such as `#choose-path`—I want scroll to stay naturally anchored where I am rather than jumping to `(0, 0)`.
8. As a user following a direct URL or corrupted/off-site router state to a **Distro** detail page, I want tampered or invalid origin paths rejected safely and fallback navigation aimed cleanly at `/catalog`.
9. As a user browsing in a restricted tab where `sessionStorage` is blocked or throws, I want scroll restoration and navigation to continue working in memory without runtime errors.

## Implementation Decisions

- **Unified return-context module**: Collapse origin link-state creation, strict origin parsing/validation, `ComparePage` return-context coordination, `DistroDetailPage` back/breadcrumb/sibling resolution, and route scroll orchestration into one deep React-free + thin-hook navigation module (`return-context.ts`). Replace the shallower standalone profile-origin module.
- **Supported origin sources**: Recognize `"home"`, `"catalog"`, `"results"`, `"compare"`, and `"methodology"` (`"Back to home"`, `"Back to catalog"`, `"Back to your results"`, `"Back to comparison"`, `"Back to methodology"`). Validate incoming router state strictly on read (allowing only in-app paths matching the claimed source, bounded length, and no protocol-relative, backslash, or external targets), falling back safely to `/catalog`.
- **Declarative `<Link>` round-trips**: Remove imperative `useNavigate` click interception from `ComparisonTray` and manual state wiring from `ComparePage`. Expose `createProfileLinkState`, `createCompareLinkState`, `resolveCompareNavigation`, and `resolveDetailNavigation` so views render standard `<Link>` elements with explicit `to` and `state` props:
  - `Catalog -> Compare` preserves the catalog search/filter/sort query in router state.
  - `Compare -> Detail -> Compare` carries `compareCatalogSearch` forward and back even when distros are removed or cleared in `/compare`.
  - `Compare -> Catalog` sets explicit `{ restoreCatalogScroll: true }` state alongside narrowed `?compare=` params.
- **Query-keyed scroll storage behind adapters**: Encapsulate scroll persistence and window scrolling behind `ScrollStorageAdapter` and `ViewportAdapter` seams (`createScrollManager`, `createMemoryScrollStorage`). Key saved `/catalog` offsets by normalized query parameters with `compare=` stripped (`normalizeScrollKey`), so narrowing or clearing comparisons never misses the saved catalog offset. Back browser storage with `sessionStorage` and an internal in-memory `Map` fallback when storage is unavailable or throws.
- **Live catalog scroll capture & instant route scrolling**: Capture `window.scrollY` while on `/catalog` on `scroll`, `pointerdown` (capture), and `keydown` (capture)—guarded by an active-route ref updated synchronously in `useLayoutEffect` before route transitions run—so DOM height changes on exit never clamp saved offsets to short destinations or overwrite `/catalog`'s saved offset with `0`. Perform route scroll resets and restorations with `behavior: "instant"` so CSS smooth scrolling does not animate across route transitions.
- **Explicit restore vs forward reset rules**: Leave hash anchor navigation and same-route query/filter changes untouched; restore saved `/catalog` scroll only on explicit `{ restoreCatalogScroll: true }` return transitions or browser `POP` navigation; scroll all other cross-route transitions to `(0, 0)`.

## Testing Decisions

- **What makes a good test**: Tests exercise the public return-context and scroll-manager interfaces across realistic multi-step user journeys and adverse inputs without touching DOM event internals or React component snapshots.
- **Primary seams**:
  1. **Origin & round-trip resolution seam**: Verify `createProfileLinkState`, `createCompareLinkState`, `resolveCompareNavigation`, and `resolveDetailNavigation` across all five origin sources (`"home"`, `"catalog"`, `"results"`, `"compare"`, `"methodology"`), full `Catalog -> Compare -> Detail -> Compare -> Catalog` round-trips with narrowed slugs, sibling-link state preservation, malformed compare state, and tampered/off-site router state rejection.
  2. **Scroll manager seam**: Exercise `createScrollManager` with `createMemoryScrollStorage` and a fake `ViewportAdapter` across initial `/catalog` mount, scroll-and-leave capture, in-route query changes, narrowed `?compare=` returns with `restoreCatalogScroll: true`, fresh forward `/catalog` visits resetting to `(0, 0)`, browser `POP` restoration, hash anchor non-interference, and throwing `ScrollStorageAdapter` fallback.
- **Prior art**: Vitest suites already used for navigation (`document-title.test.ts`), catalog search state, and quiz-run storage adapters.

## Out of Scope

- Deepening the final remaining architecture candidate (`Catalog Query & Comparison URL State`).
- Cross-tab or cross-session persistence of scroll positions (`sessionStorage` is scoped to the current tab session by design).
- Restoring scroll offsets within `/compare`, `/results`, or `/methodology` pages on return navigation.

## Further Notes

- No domain glossary changes are required for this spec; routing origin state and scroll restoration are general engineering mechanisms rather than domain concepts in Distro Picker.
- The implementation, unit test suite, production build/lint checks, and Chromium end-to-end verification were completed and verified during the architecture-review session.
