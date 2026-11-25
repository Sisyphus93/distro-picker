import {
  DEFAULT_CATALOG_SORT,
  isCatalogSortId,
  normalizeComparisonSelection,
  type CatalogSortId,
} from "../domain";
import { DIMENSIONS, type DimensionId } from "../domain/dimensions";

/**
 * Catalog view state lives in the URL, so a filtered catalog can be linked,
 * bookmarked and reloaded — and so returning from a distro page keeps the
 * exact view the user left. These helpers translate between typed state and
 * `URLSearchParams`, dropping anything unknown that arrives from a stale link.
 */

export const MAX_SEARCH_LENGTH = 80;

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

const DIMENSION_IDS = new Set<string>(DIMENSIONS.map((dimension) => dimension.id));

function isDimensionId(value: string): value is DimensionId {
  return DIMENSION_IDS.has(value);
}

function byDimensionOrder(a: DimensionId, b: DimensionId): number {
  return (
    DIMENSIONS.findIndex((dimension) => dimension.id === a) -
    DIMENSIONS.findIndex((dimension) => dimension.id === b)
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
  return [...next].sort(byDimensionOrder);
}

/** Parses untrusted query params into valid catalog state. */
export function parseCatalogViewState(
  params: URLSearchParams,
): CatalogViewState {
  const search = (params.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
  const priorities = [
    ...new Set(
      params
        .getAll("dim")
        .filter(isDimensionId),
    ),
  ].sort(byDimensionOrder);
  const rawSort = params.get("sort") ?? "";
  const sort = isCatalogSortId(rawSort) ? rawSort : DEFAULT_CATALOG_SORT;
  const compare = normalizeComparisonSelection(params.getAll("compare"));

  return { search, priorities, sort, compare };
}

/** Serializes state, omitting defaults so an untouched catalog has a clean URL. */
export function buildCatalogViewSearchParams(
  state: CatalogViewState,
): URLSearchParams {
  const params = new URLSearchParams();
  const search = state.search.trim().slice(0, MAX_SEARCH_LENGTH);
  if (search) {
    params.set("q", search);
  }
  const priorities = [
    ...new Set(state.priorities.filter(isDimensionId)),
  ].sort(byDimensionOrder);
  for (const priority of priorities) {
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
