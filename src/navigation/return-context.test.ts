import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCompareLinkState,
  createMemoryScrollStorage,
  createProfileLinkState,
  createScrollManager,
  resolveCompareNavigation,
  resolveDetailNavigation,
  type ScrollStorageAdapter,
  type ViewportAdapter,
} from "./return-context";

describe("return context navigation", () => {
  it("resolves known in-app detail origins and rejects tampered or off-site states", () => {
    const catalogState = createProfileLinkState(
      "catalog",
      "?q=linux&dim=gaming&sort=name&compare=ubuntu",
    );
    expect(resolveDetailNavigation(catalogState)).toEqual({
      backLabel: "Back to catalog",
      backPath: "/catalog?q=linux&dim=gaming&sort=name&compare=ubuntu",
      backState: { restoreCatalogScroll: true },
      catalogPath: "/catalog?q=linux&dim=gaming&sort=name&compare=ubuntu",
      catalogState: { restoreCatalogScroll: true },
      siblingLinkState: catalogState,
    });

    expect(resolveDetailNavigation(createProfileLinkState("methodology"))).toEqual({
      backLabel: "Back to methodology",
      backPath: "/methodology",
      backState: undefined,
      catalogPath: "/catalog",
      catalogState: undefined,
      siblingLinkState: createProfileLinkState("methodology"),
    });

    expect(resolveDetailNavigation(createProfileLinkState("results"))).toMatchObject({
      backLabel: "Back to your results",
      backPath: "/results",
    });

    expect(resolveDetailNavigation(createProfileLinkState("home"))).toMatchObject({
      backLabel: "Back to home",
      backPath: "/",
    });

    const fallback = {
      backLabel: "Back to catalog",
      backPath: "/catalog",
      backState: { restoreCatalogScroll: true },
      catalogPath: "/catalog",
      catalogState: { restoreCatalogScroll: true },
      siblingLinkState: {
        profileOrigin: { source: "catalog", path: "/catalog" },
      },
    };
    expect(resolveDetailNavigation(null)).toEqual(fallback);
    expect(resolveDetailNavigation({ profileOrigin: "catalog" })).toEqual(fallback);
    expect(
      resolveDetailNavigation({
        profileOrigin: { source: "unknown", path: "/catalog" },
      }),
    ).toEqual(fallback);
    expect(
      resolveDetailNavigation({
        profileOrigin: { source: "catalog", path: "https://evil.example" },
      }),
    ).toEqual(fallback);
    expect(
      resolveDetailNavigation({
        profileOrigin: { source: "catalog", path: "//evil.example" },
      }),
    ).toEqual(fallback);
    expect(
      resolveDetailNavigation({
        profileOrigin: { source: "methodology", path: "/results?q=x" },
      }),
    ).toEqual(fallback);
  });

  it("preserves filtered catalog context through Catalog -> Compare -> Detail -> Compare -> Catalog", () => {
    const compareEntryState = createCompareLinkState("q=ubuntu&dim=gaming");
    const compareNav = resolveCompareNavigation(
      compareEntryState,
      ["ubuntu", "debian"],
      "?distros=ubuntu,debian",
    );

    expect(compareNav.catalogBackPath).toBe(
      "/catalog?q=ubuntu&dim=gaming&compare=ubuntu&compare=debian",
    );
    expect(compareNav.catalogBackState).toEqual({ restoreCatalogScroll: true });
    expect(compareNav.preserveState).toEqual({
      catalogSearch: "?q=ubuntu&dim=gaming",
    });

    const detailNav = resolveDetailNavigation(compareNav.detailLinkState);
    expect(detailNav.backLabel).toBe("Back to comparison");
    expect(detailNav.backPath).toBe("/compare?distros=ubuntu%2Cdebian");
    expect(detailNav.backState).toEqual({
      catalogSearch: "?q=ubuntu&dim=gaming",
    });
    expect(detailNav.catalogPath).toBe("/catalog");

    const returnedCompareNav = resolveCompareNavigation(
      detailNav.backState,
      ["debian"],
      "?distros=debian",
    );
    expect(returnedCompareNav.catalogBackPath).toBe(
      "/catalog?q=ubuntu&dim=gaming&compare=debian",
    );
    expect(returnedCompareNav.catalogBackState).toEqual({
      restoreCatalogScroll: true,
    });
  });

  it("drops malformed compare context gracefully", () => {
    const compareNav = resolveCompareNavigation(
      { catalogSearch: "" },
      ["ubuntu"],
      "?distros=ubuntu",
    );
    expect(compareNav.preserveState).toBeUndefined();
    expect(compareNav.catalogBackPath).toBe("/catalog?compare=ubuntu");
  });

  it("resolves every supported origin source to its own back label and path", () => {
    expect(resolveDetailNavigation(createProfileLinkState("home"))).toEqual({
      backLabel: "Back to home",
      backPath: "/",
      backState: undefined,
      catalogPath: "/catalog",
      catalogState: undefined,
      siblingLinkState: createProfileLinkState("home"),
    });

    const catalogState = createProfileLinkState(
      "catalog",
      "?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
    );
    expect(resolveDetailNavigation(catalogState)).toEqual({
      backLabel: "Back to catalog",
      backPath: "/catalog?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
      backState: { restoreCatalogScroll: true },
      catalogPath: "/catalog?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
      catalogState: { restoreCatalogScroll: true },
      siblingLinkState: catalogState,
    });

    expect(
      resolveDetailNavigation(createProfileLinkState("results", "?flow=newcomer")),
    ).toEqual({
      backLabel: "Back to your results",
      backPath: "/results?flow=newcomer",
      backState: undefined,
      catalogPath: "/catalog",
      catalogState: undefined,
      siblingLinkState: createProfileLinkState("results", "?flow=newcomer"),
    });

    const compareState = createProfileLinkState(
      "compare",
      "?distros=ubuntu,debian",
      "?q=ubuntu&dim=gaming",
    );
    expect(resolveDetailNavigation(compareState)).toEqual({
      backLabel: "Back to comparison",
      backPath: "/compare?distros=ubuntu%2Cdebian",
      backState: { catalogSearch: "?q=ubuntu&dim=gaming" },
      catalogPath: "/catalog",
      catalogState: undefined,
      siblingLinkState: compareState,
    });

    const methodologyState = createProfileLinkState("methodology");
    expect(resolveDetailNavigation(methodologyState)).toEqual({
      backLabel: "Back to methodology",
      backPath: "/methodology",
      backState: undefined,
      catalogPath: "/catalog",
      catalogState: undefined,
      siblingLinkState: methodologyState,
    });
  });

  it("keeps the originating \"Back to ...\" context across Previous/Next distro hops", () => {
    const origins = [
      createProfileLinkState("home"),
      createProfileLinkState("catalog", "?q=ubuntu&sort=name&compare=ubuntu"),
      createProfileLinkState("results", "?flow=experienced"),
      createProfileLinkState("compare", "?distros=ubuntu,debian", "?q=ubuntu"),
      createProfileLinkState("methodology"),
    ];

    for (const origin of origins) {
      const firstVisit = resolveDetailNavigation(origin);
      const siblingVisit = resolveDetailNavigation(firstVisit.siblingLinkState);
      expect(siblingVisit).toEqual(firstVisit);
    }
  });

  it("rejects tampered, off-site, and mismatched-path router state with the catalog fallback", () => {
    const catalogFallback = {
      backLabel: "Back to catalog",
      backPath: "/catalog",
      backState: { restoreCatalogScroll: true },
      catalogPath: "/catalog",
      catalogState: { restoreCatalogScroll: true },
      siblingLinkState: {
        profileOrigin: { source: "catalog", path: "/catalog" },
      },
    };
    const hostileStates: unknown[] = [
      null,
      undefined,
      "catalog",
      [],
      { profileOrigin: "catalog" },
      { profileOrigin: { source: "catalog" } },
      { profileOrigin: { source: "catalog", path: 42 } },
      { profileOrigin: { source: "unknown", path: "/catalog" } },
      { profileOrigin: { source: "catalog", path: "https://evil.example" } },
      { profileOrigin: { source: "catalog", path: "//evil.example/catalog" } },
      { profileOrigin: { source: "catalog", path: "/catalog\\..\\..\\evil" } },
      { profileOrigin: { source: "results", path: "/results\\..\\results" } },
      { profileOrigin: { source: "results", path: "/results\n" } },
      { profileOrigin: { source: "catalog", path: "JAVASCRIPT:alert(1)" } },
      { profileOrigin: { source: "results", path: "/catalog" } },
      { profileOrigin: { source: "methodology", path: "/results?q=x" } },
      { profileOrigin: { source: "catalog", path: "/catalog/../results" } },
      { profileOrigin: { source: "catalog", path: "/catalog%2F..%2Fresults" } },
      {
        profileOrigin: {
          source: "catalog",
          path: `/catalog?q=${"a".repeat(400)}`,
        },
      },
    ];

    for (const state of hostileStates) {
      expect(resolveDetailNavigation(state)).toEqual(catalogFallback);
    }
  });

  it("only carries canonical catalog filters into compare context", () => {
    expect(
      createCompareLinkState(
        "?q=%20ubuntu%20&dim=gaming&sort=curated&compare=ubuntu,debian&ref=newsletter",
      ),
    ).toEqual({ catalogSearch: "?q=ubuntu&dim=gaming" });

    expect(
      createCompareLinkState("?q=ubuntu&dim=gaming&sort=name&compare=ubuntu,debian"),
    ).toEqual({ catalogSearch: "?q=ubuntu&dim=gaming&sort=name" });

    expect(createCompareLinkState("")).toBeUndefined();
    expect(createCompareLinkState("?sort=bogus&compare=ubuntu")).toBeUndefined();
  });

  it("canonicalizes catalog context written into and read out of a compare origin", () => {
    expect(
      createProfileLinkState(
        "compare",
        "?distros=ubuntu",
        "?q=ubuntu&sort=bogus&compare=debian",
      ),
    ).toEqual({
      profileOrigin: {
        source: "compare",
        path: "/compare?distros=ubuntu",
        compareCatalogSearch: "?q=ubuntu",
      },
    });

    expect(
      createProfileLinkState("compare", "?distros=ubuntu", "https://evil.example"),
    ).toEqual({
      profileOrigin: { source: "compare", path: "/compare?distros=ubuntu" },
    });

    expect(
      resolveDetailNavigation(
        createProfileLinkState(
          "compare",
          "?distros=ubuntu",
          "?q=ubuntu&compare=debian",
        ),
      ).backState,
    ).toEqual({ catalogSearch: "?q=ubuntu" });

    // A tampered history entry carrying an off-site catalog search is dropped on read.
    expect(
      resolveDetailNavigation({
        profileOrigin: {
          source: "compare",
          path: "/compare?distros=ubuntu",
          compareCatalogSearch: "https://evil.example/?q=x",
        },
      }),
    ).toEqual({
      backLabel: "Back to comparison",
      backPath: "/compare?distros=ubuntu",
      backState: undefined,
      catalogPath: "/catalog",
      catalogState: undefined,
      siblingLinkState: {
        profileOrigin: { source: "compare", path: "/compare?distros=ubuntu" },
      },
    });

    // Stale and unknown filters are canonicalized on read, so siblings inherit clean state.
    expect(
      resolveDetailNavigation({
        profileOrigin: {
          source: "compare",
          path: "/compare?distros=ubuntu",
          compareCatalogSearch: "?q=ubuntu&sort=bogus&compare=debian",
        },
      }),
    ).toEqual({
      backLabel: "Back to comparison",
      backPath: "/compare?distros=ubuntu",
      backState: { catalogSearch: "?q=ubuntu" },
      catalogPath: "/catalog",
      catalogState: undefined,
      siblingLinkState: {
        profileOrigin: {
          source: "compare",
          path: "/compare?distros=ubuntu",
          compareCatalogSearch: "?q=ubuntu",
        },
      },
    });
  });

  it("ignores off-site, malformed, and stale compare context instead of preserving it", () => {
    const malformedStates: Array<{
      state: unknown;
      expected: { catalogSearch: string } | undefined;
    }> = [
      { state: null, expected: undefined },
      { state: "string", expected: undefined },
      { state: [], expected: undefined },
      { state: { catalogSearch: 42 }, expected: undefined },
      { state: { catalogSearch: `?q=${"a".repeat(400)}` }, expected: undefined },
      { state: { catalogSearch: "https://evil.example/?q=x" }, expected: undefined },
      { state: { catalogSearch: "//evil.example/catalog?q=x" }, expected: undefined },
      {
        state: { catalogSearch: "?sort=bogus&dim=nope&compare=debian" },
        expected: undefined,
      },
      {
        state: { catalogSearch: "?q=ubuntu&sort=bogus&dim=bogus&compare=debian" },
        expected: { catalogSearch: "?q=ubuntu" },
      },
    ];

    for (const { state, expected } of malformedStates) {
      const compareNav = resolveCompareNavigation(
        state,
        ["ubuntu"],
        "?distros=ubuntu",
      );
      expect(compareNav.preserveState).toEqual(expected);
      expect(compareNav.catalogBackPath).toBe(
        expected
          ? `/catalog${expected.catalogSearch}&compare=ubuntu`
          : "/catalog?compare=ubuntu",
      );
      expect(compareNav.catalogBackState).toEqual({ restoreCatalogScroll: true });
      expect(compareNav.detailLinkState).toEqual({
        profileOrigin: expected
          ? {
              source: "compare",
              path: "/compare?distros=ubuntu",
              compareCatalogSearch: expected.catalogSearch,
            }
          : { source: "compare", path: "/compare?distros=ubuntu" },
      });
    }
  });

  it("keeps the filtered catalog through Compare -> Detail -> Compare while narrowing and clearing", () => {
    const catalogSearch =
      "?q=ubuntu&dim=gaming&sort=name&compare=ubuntu&compare=debian";
    const compareEntryState = createCompareLinkState(catalogSearch);
    expect(compareEntryState).toEqual({
      catalogSearch: "?q=ubuntu&dim=gaming&sort=name",
    });

    const fullSelection = resolveCompareNavigation(
      compareEntryState,
      ["ubuntu", "debian"],
      "?distros=ubuntu,debian",
    );
    expect(fullSelection.catalogBackPath).toBe(
      "/catalog?q=ubuntu&dim=gaming&sort=name&compare=ubuntu&compare=debian",
    );

    // Removing debian rewrites /compare?distros=ubuntu and keeps the catalog filters.
    const narrowed = resolveCompareNavigation(
      fullSelection.preserveState,
      ["ubuntu"],
      "?distros=ubuntu",
    );
    expect(narrowed.catalogBackPath).toBe(
      "/catalog?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
    );

    // Detail opened from the narrowed comparison returns to it with the filters intact.
    const detailFromCompare = resolveDetailNavigation(narrowed.detailLinkState);
    expect(detailFromCompare.backPath).toBe("/compare?distros=ubuntu");
    expect(detailFromCompare.backState).toEqual({
      catalogSearch: "?q=ubuntu&dim=gaming&sort=name",
    });

    const backOnCompare = resolveCompareNavigation(
      detailFromCompare.backState,
      ["ubuntu"],
      "?distros=ubuntu",
    );
    expect(backOnCompare).toEqual(narrowed);

    // Clearing the selection drops ?compare= but keeps the filtered catalog and restore flag.
    const cleared = resolveCompareNavigation(
      backOnCompare.preserveState,
      [],
      "",
    );
    expect(cleared.catalogBackPath).toBe("/catalog?q=ubuntu&dim=gaming&sort=name");
    expect(cleared.catalogBackState).toEqual({ restoreCatalogScroll: true });
    expect(cleared.preserveState).toEqual({
      catalogSearch: "?q=ubuntu&dim=gaming&sort=name",
    });
  });
});

describe("scroll manager", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createFakeViewport(initialY = 0) {
    let currentY = initialY;
    const scrollCalls: Array<[number, number]> = [];
    const viewport: ViewportAdapter = {
      getScrollY: () => currentY,
      scrollTo: (x, y) => {
        currentY = y;
        scrollCalls.push([x, y]);
      },
    };
    return {
      viewport,
      scrollCalls,
      setScrollY: (y: number) => {
        currentY = y;
      },
    };
  }

  it("saves catalog scroll per query on leave, resets new routes to top, and restores on return or POP", () => {
    const storage = createMemoryScrollStorage();
    const { viewport, scrollCalls, setScrollY } = createFakeViewport(0);
    const manager = createScrollManager(storage, viewport);

    // Mount catalog initially
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch",
      hash: "",
      state: null,
      isPop: false,
      previous: null,
    });
    expect(scrollCalls).toEqual([]);

    // User scrolls down and opens Compare -> forward nav scrolls to top after capturing 640
    setScrollY(640);
    manager.handleRouteTransition({
      pathname: "/compare",
      search: "?distros=arch-linux",
      hash: "",
      state: createCompareLinkState("?q=arch"),
      isPop: false,
      previous: { pathname: "/catalog", search: "?q=arch" },
    });
    expect(manager.readCatalogScroll("?q=arch")).toBe(640);
    expect(scrollCalls).toEqual([[0, 0]]);

    // Removing a distro keeps pathname === "/compare" -> does not touch scroll
    setScrollY(310);
    manager.handleRouteTransition({
      pathname: "/compare",
      search: "?distros=manjaro",
      hash: "",
      state: { catalogSearch: "?q=arch" },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=arch-linux" },
    });
    expect(scrollCalls).toEqual([[0, 0]]);

    // Navigating Back to catalog with restore state restores 640 even if compare= selection narrowed
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch&compare=manjaro",
      hash: "",
      state: { restoreCatalogScroll: true },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=manjaro" },
    });
    expect(scrollCalls).toEqual([
      [0, 0],
      [0, 640],
    ]);

    // Fresh forward visit to unfiltered /catalog without restore state scrolls to (0, 0)
    manager.handleRouteTransition({
      pathname: "/methodology",
      search: "",
      hash: "",
      state: null,
      isPop: false,
      previous: { pathname: "/catalog", search: "?q=arch" },
    });
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch",
      hash: "",
      state: null,
      isPop: false,
      previous: { pathname: "/methodology", search: "" },
    });
    expect(scrollCalls.at(-1)).toEqual([0, 0]);

    // Browser POP back to /catalog?q=arch also restores 640
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch",
      hash: "",
      state: null,
      isPop: true,
      previous: { pathname: "/methodology", search: "" },
    });
    expect(scrollCalls.at(-1)).toEqual([0, 640]);
  });

  it("leaves hash anchor navigation untouched and survives storage failures", () => {
    const throwingStorage: ScrollStorageAdapter = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const { viewport, scrollCalls } = createFakeViewport(400);
    const manager = createScrollManager(throwingStorage, viewport);

    manager.handleRouteTransition({
      pathname: "/",
      search: "",
      hash: "#choose-path",
      state: null,
      isPop: false,
      previous: { pathname: "/catalog", search: "" },
    });
    expect(scrollCalls).toEqual([]);

    expect(() => manager.rememberCatalogScroll("?q=nix", 250.4)).not.toThrow();
    expect(manager.readCatalogScroll("?q=nix")).toBe(250);
  });

  it("keeps one offset per catalog view regardless of the ?compare= selection", () => {
    const storage = createMemoryScrollStorage();
    const { viewport, scrollCalls } = createFakeViewport();
    const manager = createScrollManager(storage, viewport);

    manager.rememberCatalogScroll(
      "?q=arch&dim=gaming&sort=name&compare=arch-linux&compare=manjaro",
      420,
    );
    manager.rememberCatalogScroll("?q=ubuntu", 980);

    expect(manager.readCatalogScroll("?q=arch&dim=gaming&sort=name")).toBe(420);
    expect(
      manager.readCatalogScroll("?q=arch&dim=gaming&sort=name&compare=arch-linux"),
    ).toBe(420);
    expect(manager.readCatalogScroll("?q=ubuntu&compare=ubuntu")).toBe(980);
    expect(manager.readCatalogScroll("?q=fedora")).toBeUndefined();

    // Returning from /compare with a narrowed selection restores the saved offset.
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch&dim=gaming&sort=name&compare=manjaro",
      hash: "",
      state: { restoreCatalogScroll: true },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=manjaro" },
    });
    expect(scrollCalls).toEqual([[0, 420]]);
  });

  it("keeps the newest in-memory offset when storage writes are blocked but stale reads succeed", () => {
    const backing = createMemoryScrollStorage();
    const { viewport: staleViewport } = createFakeViewport();
    createScrollManager(backing, staleViewport).rememberCatalogScroll(
      "?q=arch",
      120,
    );

    const blockedWrites: ScrollStorageAdapter = {
      getItem: (key) => backing.getItem(key),
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: (key) => backing.removeItem(key),
    };
    const { viewport, scrollCalls } = createFakeViewport();
    const manager = createScrollManager(blockedWrites, viewport);
    manager.rememberCatalogScroll("?q=arch", 640);

    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch",
      hash: "",
      state: { restoreCatalogScroll: true },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=arch-linux" },
    });
    expect(scrollCalls).toEqual([[0, 640]]);
  });

  it("keeps the sessionStorage-backed default working when a tab blocks writes", () => {
    const persisted = new Map<string, string>();
    const writableSessionStorage = {
      getItem: (key: string) => persisted.get(key) ?? null,
      setItem: (key: string, value: string) => {
        persisted.set(key, value);
      },
      removeItem: (key: string) => {
        persisted.delete(key);
      },
    };
    vi.stubGlobal("window", { sessionStorage: writableSessionStorage });
    createScrollManager(undefined, createFakeViewport().viewport).rememberCatalogScroll(
      "?q=arch",
      120,
    );

    // A policy change blocks writes but leaves stale reads available.
    vi.stubGlobal("window", {
      sessionStorage: {
        ...writableSessionStorage,
        setItem: () => {
          throw new Error("blocked");
        },
      },
    });
    const { viewport, scrollCalls } = createFakeViewport();
    const manager = createScrollManager(undefined, viewport);
    expect(() => manager.rememberCatalogScroll("?q=arch", 640)).not.toThrow();
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch",
      hash: "",
      state: { restoreCatalogScroll: true },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=arch-linux" },
    });
    expect(scrollCalls).toEqual([[0, 640]]);
  });

  it("ignores corrupt or hostile persisted offsets instead of jumping to a bogus position", () => {
    const hostileValues: ScrollStorageAdapter = {
      getItem: () =>
        JSON.stringify({
          "?q=arch": -40,
          "?q=ubuntu": "980",
          "?q=debian": null,
          "?q=fedora": 275.6,
        }),
      setItem: () => {},
      removeItem: () => {},
    };
    const { viewport, scrollCalls } = createFakeViewport();
    const manager = createScrollManager(hostileValues, viewport);

    expect(manager.readCatalogScroll("?q=arch")).toBeUndefined();
    expect(manager.readCatalogScroll("?q=ubuntu")).toBeUndefined();
    expect(manager.readCatalogScroll("?q=debian")).toBeUndefined();
    expect(manager.readCatalogScroll("?q=fedora")).toBe(276);

    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch",
      hash: "",
      state: { restoreCatalogScroll: true },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=arch-linux" },
    });
    expect(scrollCalls).toEqual([[0, 0]]);
  });

  it("falls back to in-memory offsets when persisted scroll JSON cannot be parsed", () => {
    const corruptStorage: ScrollStorageAdapter = {
      getItem: () => "{not json",
      setItem: () => {},
      removeItem: () => {},
    };
    const { viewport, scrollCalls } = createFakeViewport();
    const manager = createScrollManager(corruptStorage, viewport);

    expect(() => manager.rememberCatalogScroll("?q=arch", 640)).not.toThrow();
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch&compare=arch-linux",
      hash: "",
      state: null,
      isPop: true,
      previous: { pathname: "/compare", search: "?distros=arch-linux" },
    });
    expect(scrollCalls).toEqual([[0, 640]]);
  });

  it("leaves in-route filter/sort updates and hash anchors naturally anchored", () => {
    const { viewport, scrollCalls, setScrollY } = createFakeViewport(300);
    const manager = createScrollManager(createMemoryScrollStorage(), viewport);

    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=ubuntu",
      hash: "",
      state: null,
      isPop: false,
      previous: null,
    });
    setScrollY(520);
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
      hash: "",
      state: null,
      isPop: false,
      previous: { pathname: "/catalog", search: "?q=ubuntu" },
    });
    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
      hash: "#choose-path",
      state: null,
      isPop: false,
      previous: {
        pathname: "/catalog",
        search: "?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
      },
    });
    expect(scrollCalls).toEqual([]);
  });

  it("restores only with an explicit true flag or POP, and resets other transitions to the top", () => {
    const { viewport, scrollCalls } = createFakeViewport();
    const manager = createScrollManager(createMemoryScrollStorage(), viewport);
    manager.rememberCatalogScroll("?q=arch", 640);

    const arrive = (
      options: Partial<Parameters<typeof manager.handleRouteTransition>[0]>,
    ) => {
      manager.handleRouteTransition({
        pathname: "/catalog",
        search: "?q=arch",
        hash: "",
        state: null,
        isPop: false,
        previous: { pathname: "/compare", search: "?distros=arch-linux" },
        ...options,
      });
    };

    // Initial mount must not fight the browser's own scroll handling.
    arrive({ previous: null });
    expect(scrollCalls).toEqual([]);

    // A truthy-but-not-true flag from tampered state does not restore.
    arrive({ state: { restoreCatalogScroll: "true" } });
    expect(scrollCalls).toEqual([[0, 0]]);

    arrive({ state: { restoreCatalogScroll: true } });
    expect(scrollCalls.at(-1)).toEqual([0, 640]);

    // Browser Back restores with no link state at all.
    arrive({ state: null, isPop: true });
    expect(scrollCalls.at(-1)).toEqual([0, 640]);

    // POP to another view and a fresh forward catalog visit both start at the top.
    arrive({ pathname: "/methodology", isPop: true });
    expect(scrollCalls.at(-1)).toEqual([0, 0]);
    arrive({ state: undefined });
    expect(scrollCalls.at(-1)).toEqual([0, 0]);
  });

  it("keeps a live-captured offset when the destination clamps the viewport", () => {
    const storage = createMemoryScrollStorage();
    const { viewport, scrollCalls, setScrollY } = createFakeViewport(0);
    const manager = createScrollManager(storage, viewport);
    manager.rememberCatalogScroll("?q=arch", 640);

    // The catalog page was replaced by a shorter one before the transition ran.
    setScrollY(35);
    manager.handleRouteTransition({
      pathname: "/compare",
      search: "?distros=arch-linux",
      hash: "",
      state: null,
      isPop: false,
      previous: { pathname: "/catalog", search: "?q=arch" },
      skipCapture: true,
    });
    expect(manager.readCatalogScroll("?q=arch")).toBe(640);
    expect(scrollCalls).toEqual([[0, 0]]);

    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch&compare=arch-linux",
      hash: "",
      state: { restoreCatalogScroll: true },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=arch-linux" },
    });
    expect(scrollCalls).toEqual([
      [0, 0],
      [0, 640],
    ]);
  });

  it("captures the catalog offset when leaving via a hash link without scrolling", () => {
    const { viewport, scrollCalls } = createFakeViewport(500);
    const manager = createScrollManager(createMemoryScrollStorage(), viewport);
    manager.handleRouteTransition({
      pathname: "/",
      search: "",
      hash: "#choose-path",
      state: null,
      isPop: false,
      previous: { pathname: "/catalog", search: "?q=arch" },
    });
    expect(scrollCalls).toEqual([]);
    expect(manager.readCatalogScroll("?q=arch")).toBe(500);
  });

  it("restores the exact offset across Catalog -> Compare -> Detail -> Compare -> Catalog", () => {
    const storage = createMemoryScrollStorage();
    const { viewport, scrollCalls, setScrollY } = createFakeViewport(0);
    const manager = createScrollManager(storage, viewport);
    const catalogSearch =
      "?q=ubuntu&dim=gaming&sort=name&compare=ubuntu&compare=debian";

    const go = (
      pathname: string,
      search: string,
      state: unknown,
      previous: { pathname: string; search: string } | null,
    ) => {
      manager.handleRouteTransition({
        pathname,
        search,
        hash: "",
        state,
        isPop: false,
        previous,
      });
    };

    go("/catalog", catalogSearch, null, null);
    setScrollY(640);

    const compareEntry = createCompareLinkState(catalogSearch);
    go("/compare", "?distros=ubuntu,debian", compareEntry, {
      pathname: "/catalog",
      search: catalogSearch,
    });
    expect(scrollCalls).toEqual([[0, 0]]);

    const fullCompare = resolveCompareNavigation(
      compareEntry,
      ["ubuntu", "debian"],
      "?distros=ubuntu,debian",
    );
    const detail = resolveDetailNavigation(fullCompare.detailLinkState);
    go("/distros/ubuntu", "", fullCompare.detailLinkState, {
      pathname: "/compare",
      search: "?distros=ubuntu,debian",
    });

    // Back to the comparison, then remove debian; filters must survive the rewrite.
    go("/compare", "?distros=ubuntu", detail.backState, {
      pathname: "/distros/ubuntu",
      search: "",
    });
    const narrowed = resolveCompareNavigation(
      detail.backState,
      ["ubuntu"],
      "?distros=ubuntu",
    );
    expect(narrowed.catalogBackPath).toBe(
      "/catalog?q=ubuntu&dim=gaming&sort=name&compare=ubuntu",
    );

    const [backPathname, backSearch = ""] = narrowed.catalogBackPath.split("?");
    go(backPathname, backSearch ? `?${backSearch}` : "", narrowed.catalogBackState, {
      pathname: "/compare",
      search: "?distros=ubuntu",
    });
    expect(scrollCalls.at(-1)).toEqual([0, 640]);
  });

  it("persists offsets through a storage adapter across a page reload", () => {
    const storage = createMemoryScrollStorage();
    expect(storage.getItem("key")).toBeNull();
    storage.setItem("key", "value");
    expect(storage.getItem("key")).toBe("value");
    storage.removeItem("key");
    expect(storage.getItem("key")).toBeNull();

    createScrollManager(
      storage,
      createFakeViewport().viewport,
    ).rememberCatalogScroll("?q=arch&dim=gaming", 640);

    const reloaded = createScrollManager(storage, createFakeViewport().viewport);
    expect(reloaded.readCatalogScroll("?q=arch&dim=gaming&compare=arch-linux")).toBe(
      640,
    );
  });

  it("scrolls route transitions instantly so CSS smooth scrolling cannot animate", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("window", { scrollY: 0, scrollTo });
    const manager = createScrollManager(createMemoryScrollStorage());
    manager.rememberCatalogScroll("?q=arch", 640);

    manager.handleRouteTransition({
      pathname: "/catalog",
      search: "?q=arch",
      hash: "",
      state: { restoreCatalogScroll: true },
      isPop: false,
      previous: { pathname: "/compare", search: "?distros=arch-linux" },
    });
    expect(scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 640,
      behavior: "instant",
    });

    manager.handleRouteTransition({
      pathname: "/methodology",
      search: "",
      hash: "",
      state: null,
      isPop: false,
      previous: { pathname: "/catalog", search: "?q=arch" },
    });
    expect(scrollTo).toHaveBeenLastCalledWith({
      left: 0,
      top: 0,
      behavior: "instant",
    });
  });
});
