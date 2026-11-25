/**
 * Navigation context for distro detail pages.
 *
 * A profile can be opened from Home, Results, the Catalog or Comparison. The
 * originating path travels in router state so "back" returns to exactly the
 * view the user left — including the catalog's search, filters, sort and
 * comparison selection — while a direct link falls back to the catalog.
 * Router state is untrusted input (it can come from a tampered history
 * entry), so only known in-app paths are accepted.
 */

export type ProfileOriginSource = "home" | "catalog" | "results" | "compare";

export const PROFILE_ORIGIN_LABELS: Record<ProfileOriginSource, string> = {
  home: "Back to home",
  catalog: "Back to catalog",
  results: "Back to your results",
  compare: "Back to comparison",
};

const ALLOWED_PATHS: Record<ProfileOriginSource, string> = {
  home: "/",
  catalog: "/catalog",
  results: "/results",
  compare: "/compare",
};

const DUMMY_ORIGIN = "https://distro-picker.invalid";
const MAX_PATH_LENGTH = 300;

/** The comparison view's own return context, carried through a profile visit. */
export interface CompareContext {
  /** The catalog query string the comparison was opened from. */
  catalogSearch?: string;
  /** Scroll position to restore in the catalog afterwards. */
  catalogScrollY?: number;
}

export interface ProfileOrigin {
  source: ProfileOriginSource;
  /** A validated in-app pathname, optionally with a query string. */
  path: string;
  /** Only present for comparison origins. */
  compareContext?: CompareContext;
}

export interface ProfileOriginState {
  profileOrigin: ProfileOrigin;
}

function isSource(value: unknown): value is ProfileOriginSource {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ALLOWED_PATHS, value)
  );
}

function normalizeCompareContext(value: unknown): CompareContext | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const raw = value as Record<string, unknown>;
  const context: CompareContext = {};
  if (
    typeof raw.catalogSearch === "string" &&
    raw.catalogSearch.length > 0 &&
    raw.catalogSearch.length <= MAX_PATH_LENGTH
  ) {
    context.catalogSearch = raw.catalogSearch.startsWith("?")
      ? raw.catalogSearch
      : `?${raw.catalogSearch}`;
  }
  if (
    typeof raw.catalogScrollY === "number" &&
    Number.isFinite(raw.catalogScrollY) &&
    raw.catalogScrollY >= 0
  ) {
    context.catalogScrollY = Math.round(raw.catalogScrollY);
  }
  return Object.keys(context).length > 0 ? context : undefined;
}

/** Serializes an optional query string into a tidy, URL-safe suffix. */
function searchSuffix(rawSearch: string): string {
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

/**
 * Builds the navigation context to attach to a profile link. `search` is the
 * originating page's query string, e.g. `?q=ubuntu&dim=gaming`.
 */
export function buildProfileOrigin(
  source: ProfileOriginSource,
  search = "",
  compareContext?: CompareContext,
): ProfileOrigin {
  const origin: ProfileOrigin = {
    source,
    path: `${ALLOWED_PATHS[source]}${searchSuffix(search)}`,
  };
  if (source === "compare") {
    const context = normalizeCompareContext(compareContext);
    if (context) {
      origin.compareContext = context;
    }
  }
  return origin;
}

/** Wraps an origin in the router state shape the detail page expects. */
export function profileOriginState(origin: ProfileOrigin): ProfileOriginState {
  return { profileOrigin: origin };
}

/**
 * Reads (and re-validates) the origin from router state. Returns `null` for
 * direct links, stale state or anything that does not point at one of the
 * known in-app views.
 */
export function parseProfileOrigin(state: unknown): ProfileOrigin | null {
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
  const origin: ProfileOrigin = {
    source: raw.source,
    path: `${url.pathname}${url.search}`,
  };
  if (raw.source === "compare") {
    const context = normalizeCompareContext(raw.compareContext);
    if (context) {
      origin.compareContext = context;
    }
  }
  return origin;
}

// Catalog scroll position is tracked while the catalog is mounted. A profile
// page reads it later to restore the exact place the user left. Keeping this
// out of the link's state means it is captured at click time, not at render.
let catalogScrollY: number | undefined;

export function rememberCatalogScrollY(value: number): void {
  if (Number.isFinite(value) && value >= 0) {
    catalogScrollY = Math.round(value);
  }
}

export function readCatalogScrollY(): number | undefined {
  return catalogScrollY;
}
