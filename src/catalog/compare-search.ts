import { normalizeComparisonSelection } from "../domain";

/**
 * Comparison view state lives in the URL (`?distros=slug,slug,slug`), so a
 * comparison can be linked, bookmarked and reloaded — and so removing a
 * distro here can keep the catalog's `?compare=` selection in sync. These
 * helpers translate between the URL and the normalized selection, mirroring
 * `catalog-search.ts`. Parsing drops unknown, duplicate and over-cap slugs,
 * so a stale link can never break the page.
 */

/** Parses `?distros=` (comma-separated, repeated params tolerated). */
export function parseCompareSlugs(params: URLSearchParams): string[] {
  const slugs = params
    .getAll("distros")
    .flatMap((value) => value.split(","))
    .map((slug) => slug.trim())
    .filter(Boolean);
  return normalizeComparisonSelection(slugs);
}

/** Serializes a selection for `/compare`, omitting the param when empty. */
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

/** The `/compare` path for a selection, e.g. `/compare?distros=ubuntu,debian`. */
export function buildComparePath(slugs: readonly string[]): string {
  const query = buildCompareSearchParams(slugs).toString();
  return query ? `/compare?${query}` : "/compare";
}

/**
 * The catalog path carrying the same selection as repeated `?compare=`
 * params. Used for the "back to catalog" link so returning keeps the
 * narrowed selection after a distro was removed here.
 */
export function buildCatalogComparePath(
  slugs: readonly string[],
  catalogSearch = "",
): string {
  const params = new URLSearchParams(catalogSearch);
  params.delete("compare");
  for (const slug of normalizeComparisonSelection(slugs)) {
    params.append("compare", slug);
  }
  const query = params.toString();
  return query ? `/catalog?${query}` : "/catalog";
}
