import { DISTRO_SLUGS } from "./distros";

/**
 * Comparison selection rules, shared by the catalog and the comparison view.
 *
 * The selection is a list of distro slugs, in the order the user picked them.
 * At most three distros can be compared at once.
 */

export const MAX_COMPARISON_DISTROS = 3;

const KNOWN_SLUGS = new Set(DISTRO_SLUGS);

/**
 * Drops unknown and duplicate slugs and truncates to the comparison limit,
 * preserving the original picking order. Stale selections (for example, a
 * slug removed from the dataset) must not break the catalog.
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

/**
 * Adds the distro if it is not selected and there is room, otherwise removes
 * it. Selecting a fourth distro leaves the selection unchanged — the UI
 * disables those controls and explains the limit.
 */
export function toggleComparisonSelection(
  selection: readonly string[],
  slug: string,
): string[] {
  if (selection.includes(slug)) {
    return selection.filter((selected) => selected !== slug);
  }
  return normalizeComparisonSelection([...selection, slug]);
}
