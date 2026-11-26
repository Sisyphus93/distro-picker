import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { buildCatalogComparePath } from "../catalog/catalog-state";

/**
 * Navigation return context and scroll restoration across views.
 *
 * A distro profile can be opened from Home, Catalog, Results, Comparison, or
 * Methodology. Originating routes travel in router state (validated strictly on
 * read so tampered history entries never redirect off-site), while catalog
 * scroll offsets live behind a StorageAdapter seam keyed by catalog query so
 * both direct returns and Catalog -> Compare -> Detail -> Compare -> Catalog
 * round-trips restore the user's place without click-hijacking or global vars.
 */

export type ProfileOriginSource =
  | "home"
  | "catalog"
  | "results"
  | "compare"
  | "methodology";

const PROFILE_ORIGIN_LABELS: Record<ProfileOriginSource, string> = {
  home: "Back to home",
  catalog: "Back to catalog",
  results: "Back to your results",
  compare: "Back to comparison",
  methodology: "Back to methodology",
};

const ALLOWED_PATHS: Record<ProfileOriginSource, string> = {
  home: "/",
  catalog: "/catalog",
  results: "/results",
  compare: "/compare",
  methodology: "/methodology",
};

const DUMMY_ORIGIN = "https://distro-picker.invalid";
const MAX_PATH_LENGTH = 300;
const SCROLL_STORAGE_KEY = "distro-picker:catalog-scroll";

interface ProfileOrigin {
  source: ProfileOriginSource;
  path: string;
  compareCatalogSearch?: string;
}

export interface DetailNavigation {
  backLabel: string;
  backPath: string;
  backState: unknown;
  catalogPath: string;
  catalogState: unknown;
  siblingLinkState: unknown;
}

export interface CompareNavigation {
  catalogBackPath: string;
  catalogBackState: unknown;
  detailLinkState: unknown;
  preserveState: unknown;
}

export interface ScrollStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ViewportAdapter {
  getScrollY(): number;
  scrollTo(x: number, y: number): void;
}

export interface RouteTransition {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  isPop: boolean;
  previous: { pathname: string; search: string } | null;
}

export function createMemoryScrollStorage(): ScrollStorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

function createBrowserScrollStorage(): ScrollStorageAdapter {
  const fallback = new Map<string, string>();
  return {
    getItem(key) {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          const value = window.sessionStorage.getItem(key);
          if (value !== null) {
            return value;
          }
        }
      } catch {
        // Storage unavailable — fall through to in-memory fallback.
      }
      return fallback.get(key) ?? null;
    },
    setItem(key, value) {
      fallback.set(key, value);
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem(key, value);
        }
      } catch {
        // Storage unavailable — kept in in-memory fallback for this tab.
      }
    },
    removeItem(key) {
      fallback.delete(key);
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.removeItem(key);
        }
      } catch {
        // Storage unavailable — cleared from in-memory fallback.
      }
    },
  };
}

const browserViewport: ViewportAdapter = {
  getScrollY: () => (typeof window === "undefined" ? 0 : window.scrollY),
  scrollTo: (x, y) => {
    if (typeof window !== "undefined") {
      window.scrollTo({ left: x, top: y, behavior: "instant" });
    }
  },
};

function isSource(value: unknown): value is ProfileOriginSource {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ALLOWED_PATHS, value)
  );
}

/** Normalizes an optional query string into `""` or `"?key=value"`. */
function normalizeSearch(rawSearch: unknown): string {
  if (typeof rawSearch !== "string" || rawSearch.length === 0) {
    return "";
  }
  if (rawSearch.length > MAX_PATH_LENGTH) {
    return "";
  }
  const withoutQuestionMark = rawSearch.startsWith("?")
    ? rawSearch.slice(1)
    : rawSearch;
  try {
    const query = new URLSearchParams(withoutQuestionMark).toString();
    return query ? `?${query}` : "";
  } catch {
    return "";
  }
}

function parseProfileOrigin(state: unknown): ProfileOrigin | null {
  if (!state || typeof state !== "object") {
    return null;
  }
  const candidate = (state as { profileOrigin?: unknown }).profileOrigin;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }
  const raw = candidate as Record<string, unknown>;
  if (!isSource(raw.source) || typeof raw.path !== "string") {
    return null;
  }
  const path = raw.path;
  if (
    path.length > MAX_PATH_LENGTH ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("\n")
  ) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(path, DUMMY_ORIGIN);
  } catch {
    return null;
  }
  if (url.origin !== DUMMY_ORIGIN || url.pathname !== ALLOWED_PATHS[raw.source]) {
    return null;
  }
  const compareCatalogSearch =
    raw.source === "compare" ? normalizeSearch(raw.compareCatalogSearch) : "";
  return {
    source: raw.source,
    path: `${url.pathname}${url.search}`,
    ...(compareCatalogSearch ? { compareCatalogSearch } : {}),
  };
}

function readCompareCatalogSearch(state: unknown): string {
  if (!state || typeof state !== "object") {
    return "";
  }
  return normalizeSearch((state as { catalogSearch?: unknown }).catalogSearch);
}

function hasRestoreCatalogScrollFlag(state: unknown): boolean {
  return (
    !!state &&
    typeof state === "object" &&
    (state as { restoreCatalogScroll?: unknown }).restoreCatalogScroll === true
  );
}

/** Builds router state attached to links that open a Distro detail profile. */
export function createProfileLinkState(
  source: ProfileOriginSource,
  search = "",
  compareCatalogSearch?: string,
): { profileOrigin: ProfileOrigin } {
  const normalizedCompareSearch =
    source === "compare" ? normalizeSearch(compareCatalogSearch) : "";
  const origin: ProfileOrigin = {
    source,
    path: `${ALLOWED_PATHS[source]}${normalizeSearch(search)}`,
    ...(normalizedCompareSearch
      ? { compareCatalogSearch: normalizedCompareSearch }
      : {}),
  };
  return { profileOrigin: origin };
}

/** Builds router state attached to ComparisonTray links opening `/compare`. */
export function createCompareLinkState(catalogSearch = ""): unknown {
  const normalized = normalizeSearch(catalogSearch);
  return normalized ? { catalogSearch: normalized } : undefined;
}

/** Resolves return links, labels, and preserved catalog state for ComparePage. */
export function resolveCompareNavigation(
  routerState: unknown,
  currentSlugs: readonly string[],
  currentSearch: string,
): CompareNavigation {
  const catalogSearch = readCompareCatalogSearch(routerState);
  return {
    catalogBackPath: buildCatalogComparePath(currentSlugs, catalogSearch),
    catalogBackState: { restoreCatalogScroll: true },
    detailLinkState: createProfileLinkState("compare", currentSearch, catalogSearch),
    preserveState: catalogSearch ? { catalogSearch } : undefined,
  };
}

/** Resolves back navigation, breadcrumbs, and sibling link state for DistroDetailPage. */
export function resolveDetailNavigation(routerState: unknown): DetailNavigation {
  const origin = parseProfileOrigin(routerState) ?? {
    source: "catalog" as const,
    path: "/catalog",
  };
  const backState =
    origin.source === "catalog"
      ? { restoreCatalogScroll: true }
      : origin.source === "compare" && origin.compareCatalogSearch
        ? { catalogSearch: origin.compareCatalogSearch }
        : undefined;

  return {
    backLabel: PROFILE_ORIGIN_LABELS[origin.source],
    backPath: origin.path,
    backState,
    catalogPath: origin.source === "catalog" ? origin.path : "/catalog",
    catalogState:
      origin.source === "catalog" ? { restoreCatalogScroll: true } : undefined,
    siblingLinkState: { profileOrigin: origin },
  };
}

function normalizeScrollKey(rawSearch: unknown): string {
  const normalized = normalizeSearch(rawSearch);
  if (!normalized) {
    return "";
  }
  const params = new URLSearchParams(normalized.slice(1));
  params.delete("compare");
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Coordinates saving catalog scroll position when leaving `/catalog` and
 * restoring it on return transitions (or scrolling new routes to the top).
 */
export function createScrollManager(
  storage: ScrollStorageAdapter = createBrowserScrollStorage(),
  viewport: ViewportAdapter = browserViewport,
) {
  const fallback = new Map<string, number>();

  function readScrollMap(): Record<string, number> {
    let raw: string | null = null;
    try {
      raw = storage.getItem(SCROLL_STORAGE_KEY);
    } catch {
      return Object.fromEntries(fallback);
    }
    if (!raw) {
      return Object.fromEntries(fallback);
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return Object.fromEntries(fallback);
      }
      const clean: Record<string, number> = Object.fromEntries(fallback);
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
          clean[key] = Math.round(value);
        }
      }
      return clean;
    } catch {
      return Object.fromEntries(fallback);
    }
  }

  function rememberCatalogScroll(catalogSearch: string, scrollY: number): void {
    if (!Number.isFinite(scrollY) || scrollY < 0) {
      return;
    }
    const key = normalizeScrollKey(catalogSearch);
    const rounded = Math.round(scrollY);
    fallback.set(key, rounded);
    const next = {
      ...readScrollMap(),
      [key]: rounded,
    };
    try {
      storage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — kept in in-memory fallback for this session.
    }
  }

  function readCatalogScroll(catalogSearch: string): number | undefined {
    const key = normalizeScrollKey(catalogSearch);
    return readScrollMap()[key];
  }

  function handleRouteTransition(
    transition: RouteTransition & { skipCapture?: boolean },
  ): void {
    if (
      !transition.skipCapture &&
      transition.previous?.pathname === "/catalog" &&
      transition.pathname !== "/catalog"
    ) {
      rememberCatalogScroll(transition.previous.search, viewport.getScrollY());
    }

    if (transition.hash) {
      return;
    }

    if (transition.previous && transition.previous.pathname === transition.pathname) {
      return;
    }

    const shouldRestoreCatalog =
      transition.pathname === "/catalog" &&
      (transition.isPop || hasRestoreCatalogScrollFlag(transition.state));

    if (shouldRestoreCatalog) {
      const saved = readCatalogScroll(transition.search);
      viewport.scrollTo(0, saved ?? 0);
      return;
    }

    if (transition.previous !== null) {
      viewport.scrollTo(0, 0);
    }
  }

  return {
    rememberCatalogScroll,
    readCatalogScroll,
    handleRouteTransition,
  };
}

const defaultScrollManager = createScrollManager();

/**
 * Mount once near the app root so forward navigation scrolls to top, in-page
 * filtering and hash anchors keep natural scroll, and returns to `/catalog`
 * restore the prior scroll offset.
 */
export function useRouteScrollRestoration(): void {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousRef = useRef<{ pathname: string; search: string } | null>(null);
  const capturedLiveScrollRef = useRef(false);
  const isCatalogActiveRef = useRef(location.pathname === "/catalog");

  useEffect(() => {
    if (location.pathname !== "/catalog") {
      return;
    }
    capturedLiveScrollRef.current = false;
    const capture = () => {
      if (!isCatalogActiveRef.current) {
        return;
      }
      capturedLiveScrollRef.current = true;
      defaultScrollManager.rememberCatalogScroll(
        location.search,
        window.scrollY,
      );
    };
    window.addEventListener("scroll", capture, { passive: true });
    window.addEventListener("pointerdown", capture, { capture: true, passive: true });
    window.addEventListener("keydown", capture, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", capture);
      window.removeEventListener("pointerdown", capture, { capture: true });
      window.removeEventListener("keydown", capture, { capture: true });
    };
  }, [location.pathname, location.search]);

  useLayoutEffect(() => {
    isCatalogActiveRef.current = location.pathname === "/catalog";
    defaultScrollManager.handleRouteTransition({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      isPop: navigationType === "POP",
      previous: previousRef.current,
      skipCapture: capturedLiveScrollRef.current,
    });
    capturedLiveScrollRef.current = false;
    previousRef.current = {
      pathname: location.pathname,
      search: location.search,
    };
  }, [
    location.pathname,
    location.search,
    location.hash,
    location.state,
    navigationType,
  ]);
}
