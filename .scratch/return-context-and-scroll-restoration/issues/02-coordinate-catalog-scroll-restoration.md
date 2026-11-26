# 02: Coordinate query-keyed catalog scroll restoration behind storage and viewport adapters

**What to build:** Add `createScrollManager`, `createMemoryScrollStorage`, `ScrollStorageAdapter`, `ViewportAdapter`, and `useRouteScrollRestoration` to `return-context`, mount `<ScrollRestoration />` at the app root (`App.tsx`), remove `CatalogPage`'s module-local scroll map and listener, and verify forward resets, return/`POP` restoration, `compare=`-invariant query keys, hash/in-route non-interference, and throwing storage fallback in `return-context.test.ts`.

**Blocked by:** 01: Consolidate cross-view return origins and comparison round-trips

**Status:** ready-for-agent

- [ ] `createScrollManager` keys saved `/catalog` scroll offsets by normalized query string with `compare=` parameters stripped (`normalizeScrollKey`), backing browser storage with `sessionStorage` and an internal in-memory `Map` fallback if storage throws or is unavailable.
- [ ] Leaving `/catalog` captures `scrollY` reliably (via live `scroll`, `pointerdown` capture, and `keydown` capture guarded by an active-route ref updated synchronously in `useLayoutEffect`), preventing destination height changes or instant scroll resets from clobbering the saved offset.
- [ ] Route transitions restore saved `/catalog` offsets only when `{ restoreCatalogScroll: true }` is set or navigation type is `POP`, leave same-pathname query/filter updates and `#hash` anchor navigation untouched, and reset other forward cross-route transitions to `(0, 0)` using `behavior: "instant"`.
- [ ] Scroll manager unit tests in `return-context.test.ts` verify per-query capture and restore across narrowed `?compare=` selections, fresh forward `/catalog` resets to `(0, 0)`, browser `POP` restoration, hash anchor non-interference, and resilience against throwing `ScrollStorageAdapter` implementations.
