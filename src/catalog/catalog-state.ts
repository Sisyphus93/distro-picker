import {
  DEFAULT_CATALOG_SORT,
  DIMENSIONS,
  dimensionRank,
  DISTROS,
  DISTRO_SLUGS,
  getDimension,
  getDistrosBySlugs,
  isCatalogSortId,
  PRIORITY_MATCH_MINIMUM,
  queryCatalog,
  type CatalogSortId,
  type DimensionId,
  type DistroProfile,
} from "../domain";

/**
 * Unified catalog query and comparison selection URL state.
 *
 * Both `/catalog` (`?q=&dim=&sort=&compare=`) and `/compare` (`?distros=`)
 * share one canonical parser/serializer, dimension-rank ordering, comparison
 * selection limits, and state transitions so every view stays consistent.
 */

export const MAX_SEARCH_LENGTH = 80;
export const MAX_COMPARISON_DISTROS = 3;

export interface CatalogViewState {
  search: string;
  priorities: DimensionId[];
  sort: CatalogSortId;
  /** Slugs picked for side-by-side comparison, in picking order. */
  compare: string[];
}

export const DEFAULT_CATALOG_VIEW_STATE: CatalogViewState = {
  search: "",
  priorities: [],
  sort: DEFAULT_CATALOG_SORT,
  compare: [],
};

export interface CatalogViewSnapshot {
  state: CatalogViewState;
  results: DistroProfile[];
  totalCount: number;
  hasFilters: boolean;
  comparisonFull: boolean;
  prioritySummary: string;
  toolbarSummary: string;
}

export interface CompareViewSnapshot {
  slugs: string[];
  distros: DistroProfile[];
  remaining: number;
  isFull: boolean;
}

const DIMENSION_IDS = new Set<string>(DIMENSIONS.map((dimension) => dimension.id));
const KNOWN_SLUGS = new Set(DISTRO_SLUGS);

function isDimensionId(value: string): value is DimensionId {
  return DIMENSION_IDS.has(value);
}

function normalizePriorities(priorities: readonly DimensionId[]): DimensionId[] {
  return [...new Set(priorities.filter(isDimensionId))].sort(
    (a, b) => dimensionRank(a) - dimensionRank(b),
  );
}

function formatPrioritySummary(
  priorities: readonly DimensionId[],
  threshold = PRIORITY_MATCH_MINIMUM,
): string {
  if (priorities.length === 0) {
    return "";
  }
  const labels = priorities.map((id) => getDimension(id).shortLabel.toLowerCase());
  const list =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
  return `Showing distros rated ${threshold}+ for ${list}.`;
}

/**
 * Drops unknown and duplicate slugs and truncates to the comparison limit,
 * preserving the original picking order.
 */
export function normalizeComparisonSelection(
  slugs: readonly string[],
): string[] {
  const seen = new Set<string>();
  const selection: string[] = [];
  for (const slug of slugs) {
    if (!KNOWN_SLUGS.has(slug) || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    selection.push(slug);
    if (selection.length === MAX_COMPARISON_DISTROS) {
      break;
    }
  }
  return selection;
}

/** Adds the distro if room remains, otherwise removes it. */
export function toggleCompareSlug(
  selection: readonly string[],
  slug: string,
): string[] {
  if (selection.includes(slug)) {
    return selection.filter((selected) => selected !== slug);
  }
  return normalizeComparisonSelection([...selection, slug]);
}

/** Removes one slug from the comparison selection. */
export function removeCompareSlug(
  selection: readonly string[],
  slug: string,
): string[] {
  return normalizeComparisonSelection(selection).filter(
    (selected) => selected !== slug,
  );
}

/** Toggles one priority, keeping the list in the shared dimension order. */
export function togglePriority(
  priorities: readonly DimensionId[],
  id: DimensionId,
): DimensionId[] {
  const next = priorities.includes(id)
    ? priorities.filter((priority) => priority !== id)
    : [...priorities, id];
  return normalizePriorities(next);
}

/** Parses untrusted `/catalog` query params into valid catalog state. */
export function parseCatalogViewState(
  params: URLSearchParams,
): CatalogViewState {
  const search = (params.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
  const priorities = normalizePriorities(
    params.getAll("dim").filter(isDimensionId),
  );
  const rawSort = params.get("sort") ?? "";
  const sort = isCatalogSortId(rawSort) ? rawSort : DEFAULT_CATALOG_SORT;
  const compare = normalizeComparisonSelection(params.getAll("compare"));

  return { search, priorities, sort, compare };
}

/** Serializes catalog state, omitting defaults so an untouched catalog has a clean URL. */
export function buildCatalogViewSearchParams(
  state: CatalogViewState,
): URLSearchParams {
  const params = new URLSearchParams();
  const search = state.search.trim().slice(0, MAX_SEARCH_LENGTH);
  if (search) {
    params.set("q", search);
  }
  for (const priority of normalizePriorities(state.priorities)) {
    params.append("dim", priority);
  }
  if (state.sort !== DEFAULT_CATALOG_SORT) {
    params.set("sort", state.sort);
  }
  for (const slug of normalizeComparisonSelection(state.compare)) {
    params.append("compare", slug);
  }
  return params;
}

/** Resolves typed state, matching distros, and summary copy for `/catalog`. */
export function resolveCatalogView(
  params: URLSearchParams,
): CatalogViewSnapshot {
  const state = parseCatalogViewState(params);
  const results = queryCatalog(DISTROS, {
    search: state.search,
    priorities: state.priorities,
    sort: state.sort,
  });
  const hasFilters = state.search !== "" || state.priorities.length > 0;
  const prioritySummary = formatPrioritySummary(state.priorities);
  const toolbarSummary = hasFilters
    ? prioritySummary || (state.search ? `Matching “${state.search}”.` : "")
    : `All ${DISTROS.length} curated distros. Pick priorities or search to narrow.`;

  return {
    state,
    results,
    totalCount: DISTROS.length,
    hasFilters,
    comparisonFull: state.compare.length >= MAX_COMPARISON_DISTROS,
    prioritySummary,
    toolbarSummary,
  };
}

/** Parses `/compare` `?distros=` (comma-separated, repeated params tolerated). */
export function parseCompareSlugs(params: URLSearchParams): string[] {
  const slugs = params
    .getAll("distros")
    .flatMap((value) => value.split(","))
    .map((slug) => slug.trim())
    .filter(Boolean);
  return normalizeComparisonSelection(slugs);
}

/** Serializes a comparison selection for `/compare`, omitting when empty. */
export function buildCompareSearchParams(
  slugs: readonly string[],
): URLSearchParams {
  const params = new URLSearchParams();
  const normalized = normalizeComparisonSelection(slugs);
  if (normalized.length > 0) {
    params.set("distros", normalized.join(","));
  }
  return params;
}

/** Resolves normalized distros and slot counts for a comparison slug list. */
export function resolveCompareSelection(
  slugs: readonly string[],
): CompareViewSnapshot {
  const normalized = normalizeComparisonSelection(slugs);
  const distros = getDistrosBySlugs(normalized);
  return {
    slugs: normalized,
    distros,
    remaining: MAX_COMPARISON_DISTROS - distros.length,
    isFull: distros.length >= MAX_COMPARISON_DISTROS,
  };
}

/** Resolves normalized distros and slot counts straight from `/compare` params. */
export function resolveCompareView(
  params: URLSearchParams,
): CompareViewSnapshot {
  return resolveCompareSelection(parseCompareSlugs(params));
}

/** The `/compare` path for a selection, e.g. `/compare?distros=ubuntu,debian`. */
export function buildComparePath(slugs: readonly string[]): string {
  const query = buildCompareSearchParams(slugs).toString();
  return query ? `/compare?${query}` : "/compare";
}

/**
 * The `/catalog` path carrying both sanitized catalog filters and the given
 * `?compare=` selection through the shared URL codec.
 */
export function buildCatalogComparePath(
  slugs: readonly string[],
  catalogSearch = "",
): string {
  const parsed = parseCatalogViewState(new URLSearchParams(catalogSearch));
  const query = buildCatalogViewSearchParams({
    ...parsed,
    compare: normalizeComparisonSelection(slugs),
  }).toString();
  return query ? `/catalog?${query}` : "/catalog";
}
