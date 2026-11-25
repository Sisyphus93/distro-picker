import { describe, expect, it } from "vitest";
import {
  buildCatalogViewSearchParams,
  DEFAULT_CATALOG_VIEW_STATE,
  MAX_SEARCH_LENGTH,
  parseCatalogViewState,
  togglePriority,
} from "./catalog-search";

function parse(queryString: string) {
  return parseCatalogViewState(new URLSearchParams(queryString));
}

describe("catalog view state parsing", () => {
  it("falls back to the default state for empty params", () => {
    const state = parse("");
    expect(state.search).toBe("");
    expect(state.priorities).toEqual([]);
    expect(state.sort).toBe("curated");
    expect(state.compare).toEqual([]);
    expect(state.sort).toBe(DEFAULT_CATALOG_VIEW_STATE.sort);
  });

  it("reads and trims the search term", () => {
    expect(parse("q=%20mint%20").search).toBe("mint");
  });

  it("caps absurdly long search terms", () => {
    const state = parse(`q=${"a".repeat(MAX_SEARCH_LENGTH + 40)}`);
    expect(state.search).toHaveLength(MAX_SEARCH_LENGTH);
  });

  it("keeps valid dimensions, drops unknown ones and de-duplicates", () => {
    const state = parse("dim=lightweight&dim=not-a-dimension&dim=gaming&dim=gaming");
    expect(state.priorities).toEqual(["gaming", "lightweight"]);
  });

  it("orders priorities by the shared dimension order, not the URL", () => {
    expect(parse("dim=customization&dim=ease-of-use").priorities).toEqual([
      "ease-of-use",
      "customization",
    ]);
  });

  it("keeps a valid sort and rejects an unknown one", () => {
    expect(parse("sort=gaming").sort).toBe("gaming");
    expect(parse("sort=cheapest").sort).toBe("curated");
  });

  it("normalizes the comparison selection", () => {
    expect(
      parse("compare=debian&compare=not-real&compare=debian&compare=ubuntu")
        .compare,
    ).toEqual(["debian", "ubuntu"]);
    expect(
      parse("compare=ubuntu&compare=debian&compare=fedora-workstation&compare=nixos")
        .compare,
    ).toHaveLength(3);
  });
});

describe("catalog view state serialization", () => {
  it("omits defaults so untouched catalogs keep a clean URL", () => {
    expect(
      buildCatalogViewSearchParams(DEFAULT_CATALOG_VIEW_STATE).toString(),
    ).toBe("");
  });

  it("round-trips a fully populated state", () => {
    const state = {
      search: "pop",
      priorities: ["ease-of-use", "gaming"] as const,
      sort: "gaming" as const,
      compare: ["ubuntu", "debian"],
    };
    const params = buildCatalogViewSearchParams({
      ...state,
      priorities: [...state.priorities],
    });
    expect(parseCatalogViewState(params)).toEqual({
      search: "pop",
      priorities: ["ease-of-use", "gaming"],
      sort: "gaming",
      compare: ["ubuntu", "debian"],
    });
  });

  it("normalizes what it writes", () => {
    const params = buildCatalogViewSearchParams({
      search: "  debian  ",
      priorities: ["gaming", "gaming", "ease-of-use"],
      sort: "name",
      compare: ["not-real", "ubuntu"],
    });
    expect(params.getAll("dim")).toEqual(["ease-of-use", "gaming"]);
    expect(params.get("q")).toBe("debian");
    expect(params.getAll("compare")).toEqual(["ubuntu"]);
  });
});

describe("togglePriority", () => {
  it("adds a priority in shared dimension order", () => {
    expect(togglePriority(["customization"], "ease-of-use")).toEqual([
      "ease-of-use",
      "customization",
    ]);
  });

  it("removes a priority that is already on", () => {
    expect(
      togglePriority(["ease-of-use", "customization"], "ease-of-use"),
    ).toEqual(["customization"]);
  });
});
