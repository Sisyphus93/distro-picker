import { describe, expect, it } from "vitest";
import { DISTROS } from "../domain";
import {
  buildCatalogComparePath,
  buildCatalogViewSearchParams,
  buildComparePath,
  buildCompareSearchParams,
  DEFAULT_CATALOG_VIEW_STATE,
  MAX_COMPARISON_DISTROS,
  MAX_SEARCH_LENGTH,
  normalizeComparisonSelection,
  parseCatalogViewState,
  parseCompareSlugs,
  removeCompareSlug,
  resolveCatalogView,
  resolveCompareSelection,
  resolveCompareView,
  toggleCompareSlug,
  togglePriority,
} from "./catalog-state";

function parseCatalog(queryString: string) {
  return parseCatalogViewState(new URLSearchParams(queryString));
}

function parseCompare(queryString: string) {
  return parseCompareSlugs(new URLSearchParams(queryString));
}

describe("comparison selection rules", () => {
  it("caps comparison at three distros", () => {
    expect(MAX_COMPARISON_DISTROS).toBe(3);
  });

  it("toggles distros in picking order while respecting the cap", () => {
    expect(toggleCompareSlug(["ubuntu"], "debian")).toEqual([
      "ubuntu",
      "debian",
    ]);
    expect(toggleCompareSlug(["ubuntu", "debian"], "ubuntu")).toEqual([
      "debian",
    ]);

    const full = ["ubuntu", "debian", "fedora-workstation"];
    expect(full).toHaveLength(MAX_COMPARISON_DISTROS);
    expect(toggleCompareSlug(full, "arch-linux")).toEqual(full);
    expect(toggleCompareSlug(full, "debian")).toEqual([
      "ubuntu",
      "fedora-workstation",
    ]);
  });

  it("removes a distro cleanly and drops unknown, duplicate, or over-cap slugs", () => {
    expect(removeCompareSlug(["ubuntu", "debian", "ubuntu"], "ubuntu")).toEqual([
      "debian",
    ]);
    expect(
      normalizeComparisonSelection([
        "debian",
        "not-a-distro",
        "debian",
        "ubuntu",
      ]),
    ).toEqual(["debian", "ubuntu"]);
    expect(
      normalizeComparisonSelection([
        "ubuntu",
        "debian",
        "fedora-workstation",
        "arch-linux",
      ]),
    ).toEqual(["ubuntu", "debian", "fedora-workstation"]);
  });
});

describe("catalog query URL state", () => {
  it("falls back to defaults, trims/caps search, and orders valid priorities by shared dimensionRank", () => {
    const empty = parseCatalog("");
    expect(empty).toEqual(DEFAULT_CATALOG_VIEW_STATE);

    expect(parseCatalog("q=%20mint%20").search).toBe("mint");
    expect(
      parseCatalog(`q=${"a".repeat(MAX_SEARCH_LENGTH + 40)}`).search,
    ).toHaveLength(MAX_SEARCH_LENGTH);

    expect(
      parseCatalog("dim=customization&dim=not-a-dimension&dim=ease-of-use&dim=ease-of-use")
        .priorities,
    ).toEqual(["ease-of-use", "customization"]);

    expect(parseCatalog("sort=gaming").sort).toBe("gaming");
    expect(parseCatalog("sort=cheapest").sort).toBe("curated");

    expect(
      parseCatalog("compare=debian&compare=not-real&compare=debian&compare=ubuntu")
        .compare,
    ).toEqual(["debian", "ubuntu"]);
  });

  it("omits defaults on serialization and normalizes round-trips", () => {
    expect(
      buildCatalogViewSearchParams(DEFAULT_CATALOG_VIEW_STATE).toString(),
    ).toBe("");

    const params = buildCatalogViewSearchParams({
      search: "  debian  ",
      priorities: ["gaming", "gaming", "ease-of-use"],
      sort: "name",
      compare: ["not-real", "ubuntu"],
    });
    expect(params.getAll("dim")).toEqual(["ease-of-use", "gaming"]);
    expect(params.get("q")).toBe("debian");
    expect(params.getAll("compare")).toEqual(["ubuntu"]);
    expect(parseCatalogViewState(params)).toEqual({
      search: "debian",
      priorities: ["ease-of-use", "gaming"],
      sort: "name",
      compare: ["ubuntu"],
    });
  });

  it("toggles priorities in shared dimension order", () => {
    expect(togglePriority(["customization"], "ease-of-use")).toEqual([
      "ease-of-use",
      "customization",
    ]);
    expect(
      togglePriority(["ease-of-use", "customization"], "ease-of-use"),
    ).toEqual(["customization"]);
  });

  it("resolves catalog results, filter flags, and toolbar summaries from URLSearchParams", () => {
    const unfiltered = resolveCatalogView(new URLSearchParams(""));
    expect(unfiltered.totalCount).toBe(DISTROS.length);
    expect(unfiltered.results).toHaveLength(DISTROS.length);
    expect(unfiltered.hasFilters).toBe(false);
    expect(unfiltered.comparisonFull).toBe(false);
    expect(unfiltered.toolbarSummary).toBe(
      `All ${DISTROS.length} curated distros. Pick priorities or search to narrow.`,
    );

    const filtered = resolveCatalogView(
      new URLSearchParams(
        "q=pop&dim=gaming&dim=ease-of-use&compare=ubuntu&compare=debian&compare=arch-linux",
      ),
    );
    expect(filtered.hasFilters).toBe(true);
    expect(filtered.comparisonFull).toBe(true);
    expect(filtered.prioritySummary).toBe(
      "Showing distros rated 4+ for ease of use and gaming.",
    );
    expect(filtered.toolbarSummary).toBe(filtered.prioritySummary);
    expect(filtered.results.every((d) => d.ratings["ease-of-use"].rating >= 4)).toBe(
      true,
    );

    const searchOnly = resolveCatalogView(new URLSearchParams("q=mint"));
    expect(searchOnly.hasFilters).toBe(true);
    expect(searchOnly.toolbarSummary).toBe("Matching “mint”.");
  });
});

describe("compare URL state and shared compare path codec", () => {
  it("parses comma-separated or repeated ?distros= params and drops invalid entries", () => {
    expect(parseCompare("")).toEqual([]);
    expect(parseCompare("distros=")).toEqual([]);
    expect(parseCompare("distros=debian,ubuntu")).toEqual(["debian", "ubuntu"]);
    expect(parseCompare("distros=ubuntu&distros=%20debian%20")).toEqual([
      "ubuntu",
      "debian",
    ]);
    expect(parseCompare("distros=ubuntu,not-a-distro,ubuntu,debian")).toEqual([
      "ubuntu",
      "debian",
    ]);
    expect(
      parseCompare("distros=ubuntu,debian,fedora-workstation,arch-linux"),
    ).toEqual(["ubuntu", "debian", "fedora-workstation"]);
  });

  it("serializes ?distros= params and resolves compare view snapshots", () => {
    expect(buildCompareSearchParams([]).toString()).toBe("");
    expect(buildComparePath([])).toBe("/compare");
    expect(
      buildComparePath(["ubuntu", "debian", "fedora-workstation", "arch-linux"]),
    ).toBe("/compare?distros=ubuntu%2Cdebian%2Cfedora-workstation");

    const view = resolveCompareView(new URLSearchParams("distros=ubuntu,arch-linux"));
    expect(view.slugs).toEqual(["ubuntu", "arch-linux"]);
    expect(view.distros.map((d) => d.slug)).toEqual(["ubuntu", "arch-linux"]);
    expect(view.remaining).toBe(1);
    expect(view.isFull).toBe(false);

    expect(resolveCompareSelection(["ubuntu", "debian", "arch-linux"]).isFull).toBe(
      true,
    );
  });

  it("builds sanitized /catalog paths with narrowed ?compare= params via the shared codec", () => {
    expect(buildCatalogComparePath([])).toBe("/catalog");
    expect(buildCatalogComparePath(["ubuntu", "not-a-distro", "ubuntu"])).toBe(
      "/catalog?compare=ubuntu",
    );
    expect(
      buildCatalogComparePath(
        ["debian"],
        "?q=linux&dim=gaming&dim=stability&dim=unknown&sort=bogus&compare=ubuntu&compare=debian",
      ),
    ).toBe("/catalog?q=linux&dim=stability&dim=gaming&compare=debian");
    expect(
      buildCatalogComparePath(
        ["debian"],
        "?q=linux&dim=stability&dim=gaming&sort=name&compare=ubuntu&compare=debian",
      ),
    ).toBe("/catalog?q=linux&dim=stability&dim=gaming&sort=name&compare=debian");
    expect(buildCatalogComparePath([], "?q=linux&compare=ubuntu")).toBe(
      "/catalog?q=linux",
    );
  });
});
