import { describe, expect, it } from "vitest";
import {
  buildCatalogComparePath,
  buildComparePath,
  buildCompareSearchParams,
  parseCompareSlugs,
} from "./compare-search";

function parse(queryString: string) {
  return parseCompareSlugs(new URLSearchParams(queryString));
}

describe("compare view state parsing", () => {
  it("falls back to an empty selection for empty params", () => {
    expect(parse("")).toEqual([]);
    expect(parse("distros=")).toEqual([]);
  });

  it("reads comma-separated distros in picking order", () => {
    expect(parse("distros=debian,ubuntu")).toEqual(["debian", "ubuntu"]);
  });

  it("tolerates repeated distros params and surrounding whitespace", () => {
    expect(parse("distros=ubuntu&distros=%20debian%20")).toEqual([
      "ubuntu",
      "debian",
    ]);
  });

  it("drops unknown and duplicate slugs", () => {
    expect(parse("distros=ubuntu,not-a-distro,ubuntu,debian")).toEqual([
      "ubuntu",
      "debian",
    ]);
  });

  it("truncates anything beyond the three-distro cap", () => {
    expect(
      parse("distros=ubuntu,debian,fedora-workstation,arch-linux"),
    ).toEqual(["ubuntu", "debian", "fedora-workstation"]);
  });
});

describe("compare view state building", () => {
  it("serializes a selection as one comma-separated param", () => {
    expect(buildCompareSearchParams(["ubuntu", "debian"]).toString()).toBe(
      "distros=ubuntu%2Cdebian",
    );
  });

  it("omits the param for an empty selection", () => {
    expect(buildCompareSearchParams([]).toString()).toBe("");
  });

  it("builds the compare path, bare when nothing is selected", () => {
    expect(buildComparePath(["ubuntu", "debian"])).toBe(
      "/compare?distros=ubuntu%2Cdebian",
    );
    expect(buildComparePath([])).toBe("/compare");
  });

  it("builds the catalog path with repeated compare params", () => {
    expect(buildCatalogComparePath(["ubuntu", "debian"])).toBe(
      "/catalog?compare=ubuntu&compare=debian",
    );
    expect(buildCatalogComparePath([])).toBe("/catalog");
  });

  it("preserves catalog search, filters and sort while replacing the selection", () => {
    expect(buildCatalogComparePath(
      ["debian"],
      "?q=linux&dim=gaming&dim=stability&sort=name&compare=ubuntu&compare=debian",
    )).toBe("/catalog?q=linux&dim=gaming&dim=stability&sort=name&compare=debian");
    expect(buildCatalogComparePath([], "?q=linux&compare=ubuntu")).toBe(
      "/catalog?q=linux",
    );
  });

  it("normalizes before building either path", () => {
    expect(buildCatalogComparePath(["ubuntu", "not-a-distro", "ubuntu"])).toBe(
      "/catalog?compare=ubuntu",
    );
    expect(
      buildComparePath(["ubuntu", "debian", "fedora-workstation", "arch-linux"]),
    ).toBe("/compare?distros=ubuntu%2Cdebian%2Cfedora-workstation");
  });

  it("round-trips through parse and build", () => {
    const slugs = parse("distros=debian,ubuntu");
    expect(buildCatalogComparePath(slugs)).toBe(
      "/catalog?compare=debian&compare=ubuntu",
    );
    expect(parse(buildCompareSearchParams(slugs).toString())).toEqual(slugs);
  });
});
