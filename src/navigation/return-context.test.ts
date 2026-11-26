import { describe, expect, it } from "vitest";
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
});

describe("scroll manager", () => {
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
});
