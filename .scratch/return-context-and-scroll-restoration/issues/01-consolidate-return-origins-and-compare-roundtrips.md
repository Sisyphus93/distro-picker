# 01: Consolidate cross-view return origins and comparison round-trips

**What to build:** Replace the standalone `profile-origin` module with a unified `return-context` navigation module supporting `"home"`, `"catalog"`, `"results"`, `"compare"`, and `"methodology"` origin resolution, strict in-app router-state validation with `/catalog` fallback, and `Catalog -> Compare -> Detail -> Compare -> Catalog` state round-trips; update `ComparisonTray`, `ComparePage`, `DistroDetailPage`, `CatalogPage`, `ResultsPage`, and `MethodologyPage` to use declarative `<Link>` `to` and `state` props without `useNavigate` click interception; and delete `profile-origin.ts` and its test file in favor of `return-context.test.ts`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `createProfileLinkState` and `resolveDetailNavigation` support `"home"`, `"catalog"`, `"results"`, `"compare"`, and `"methodology"` (`"Back to methodology"` on `Methodology -> Detail`), preserve `siblingLinkState` across `"Previous distro"` / `"Next distro"` links, and reject tampered, external, protocol-relative, backslash, or mismatched-path router state cleanly by falling back to `/catalog`.
- [ ] `createCompareLinkState` and `resolveCompareNavigation` carry filtered catalog queries from `ComparisonTray` to `ComparePage`, retain them across `removeDistro` / `clearSelection` URL rewrites and `Compare -> Detail -> Compare` hops, and construct `catalogBackPath` with the narrowed `?compare=` selection and explicit `{ restoreCatalogScroll: true }` state.
- [ ] `ComparisonTray` uses a standard `<Link>` instead of `useNavigate` click-hijacking, and `MethodologyPage` attaches `createProfileLinkState("methodology")` on curated and caveated **Distro** profile links.
- [ ] Interface-level Vitest tests in `return-context.test.ts` cover all five origin sources, `Catalog -> Compare -> Detail -> Compare -> Catalog` round-trips, malformed compare context handling, and tampered/off-site state rejection.
