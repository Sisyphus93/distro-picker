import {
  DIMENSIONS,
  dimensionRank,
  type DimensionId,
  type DimensionMeta,
} from "./dimensions";
import type { DistroProfile, Rating } from "./types";

/**
 * Catalog querying: pure search, priority-filter and sort logic over the
 * curated dataset. No React, no URL handling — the catalog page turns user
 * input into a `CatalogQuery` and renders whatever comes back.
 */

/** Minimum rating a distro needs on a picked priority to stay in the results. */
export const PRIORITY_MATCH_MINIMUM: Rating = 4;

export type CatalogSortId =
  | "curated"
  | "name"
  | "beginner-friendly"
  | "lightweight"
  | "gaming"
  | "stable"
  | "hardware"
  | "software"
  | "desktop"
  | "support"
  | "customisable"
  | "privacy";

export interface CatalogSort {
  id: CatalogSortId;
  label: string;
  /** Dimension ranked strongest-first; absent for curated and alphabetical order. */
  dimension?: DimensionId;
}

/**
 * Sort options. Most map onto one of the shared dimensions, so the catalog
 * ranks a distro exactly the way the quiz, comparison and detail views
 * describe it.
 */
export const CATALOG_SORTS: readonly CatalogSort[] = [
  { id: "curated", label: "Curated order" },
  { id: "name", label: "Name (A–Z)" },
  {
    id: "beginner-friendly",
    label: "Beginner-friendly first",
    dimension: "ease-of-use",
  },
  {
    id: "lightweight",
    label: "Lightest on hardware first",
    dimension: "lightweight",
  },
  { id: "gaming", label: "Gaming-ready first", dimension: "gaming" },
  { id: "stable", label: "Most stable first", dimension: "stability" },
  {
    id: "hardware",
    label: "Hardware support first",
    dimension: "hardware-support",
  },
  {
    id: "software",
    label: "Widest software selection first",
    dimension: "software-availability",
  },
  {
    id: "desktop",
    label: "Most polished desktop first",
    dimension: "desktop-experience",
  },
  {
    id: "support",
    label: "Best community & docs first",
    dimension: "community-support",
  },
  {
    id: "customisable",
    label: "Most customisable first",
    dimension: "customization",
  },
  {
    id: "privacy",
    label: "Free software first",
    dimension: "free-software-privacy",
  },
];

export const DEFAULT_CATALOG_SORT: CatalogSortId = "curated";

const SORT_BY_ID = new Map<CatalogSortId, CatalogSort>(
  CATALOG_SORTS.map((sort) => [sort.id, sort]),
);

export function getCatalogSort(id: CatalogSortId): CatalogSort {
  const sort = SORT_BY_ID.get(id);
  if (!sort) {
    throw new Error(`Unknown catalog sort: ${id}`);
  }
  return sort;
}

export function isCatalogSortId(value: string): value is CatalogSortId {
  return SORT_BY_ID.has(value as CatalogSortId);
}

/** Everything the catalog needs to decide which distros to show, and in what order. */
export interface CatalogQuery {
  /** Free-text name search. Blank, empty or whitespace matches everything. */
  search?: string;
  /** Qualities a distro must rate well on. Every picked one must match. */
  priorities?: readonly DimensionId[];
  /** Result ordering. Defaults to the dataset's curated order. */
  sort?: CatalogSortId;
}

/**
 * Lowercase, letters and digits only, so "pop os", "Pop!_OS" and "POP-OS"
 * all find the same distro.
 */
export function normalizeCatalogText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchesSearch(distro: DistroProfile, normalizedSearch: string): boolean {
  return normalizeCatalogText(distro.name).includes(normalizedSearch);
}

function matchesPriorities(
  distro: DistroProfile,
  priorities: readonly DimensionId[],
): boolean {
  return priorities.every(
    (dimension) => distro.ratings[dimension].rating >= PRIORITY_MATCH_MINIMUM,
  );
}

function sortCatalog(
  distros: readonly DistroProfile[],
  sortId: CatalogSortId,
): DistroProfile[] {
  if (sortId === DEFAULT_CATALOG_SORT) {
    return [...distros];
  }
  const sort = getCatalogSort(sortId);
  const position = new Map(distros.map((distro, index) => [distro.slug, index]));
  const tiesFirst = (a: DistroProfile, b: DistroProfile) =>
    (position.get(a.slug) ?? 0) - (position.get(b.slug) ?? 0);

  if (!sort.dimension) {
    return [...distros].sort((a, b) => a.name.localeCompare(b.name, "en"));
  }
  const dimension = sort.dimension;
  return [...distros].sort(
    (a, b) =>
      b.ratings[dimension].rating - a.ratings[dimension].rating ||
      tiesFirst(a, b),
  );
}

/** Applies search, priority filters and sort. Never mutates the input list. */
export function queryCatalog(
  distros: readonly DistroProfile[],
  query: CatalogQuery,
): DistroProfile[] {
  const search = normalizeCatalogText(query.search ?? "");
  const priorities = query.priorities ?? [];

  const matches = distros.filter(
    (distro) =>
      (search === "" || matchesSearch(distro, search)) &&
      matchesPriorities(distro, priorities),
  );
  return sortCatalog(matches, query.sort ?? DEFAULT_CATALOG_SORT);
}

export interface DimensionStrength {
  dimension: DimensionMeta;
  rating: Rating;
}

/**
 * The dimensions where a distro rates strongest (4 or 5), best first, with
 * ties resolved by the shared dimension order. Used for the "notable
 * strengths" chips on catalog cards.
 */
export function topStrengths(
  distro: DistroProfile,
  limit = 3,
): DimensionStrength[] {
  return DIMENSIONS.flatMap((dimension) => {
    const rating = distro.ratings[dimension.id].rating;
    return rating >= PRIORITY_MATCH_MINIMUM ? [{ dimension, rating }] : [];
  })
    .sort(
      (a, b) =>
        b.rating - a.rating ||
        dimensionRank(a.dimension.id) - dimensionRank(b.dimension.id),
    )
    .slice(0, limit);
}
