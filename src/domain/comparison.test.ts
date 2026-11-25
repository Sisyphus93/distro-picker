import { describe, expect, it } from "vitest";
import {
  MAX_COMPARISON_DISTROS,
  normalizeComparisonSelection,
  toggleComparisonSelection,
} from "./comparison";

describe("comparison selection", () => {
  it("caps comparison at three distros", () => {
    expect(MAX_COMPARISON_DISTROS).toBe(3);
  });

  it("adds a distro that is not selected yet", () => {
    expect(toggleComparisonSelection(["ubuntu"], "debian")).toEqual([
      "ubuntu",
      "debian",
    ]);
  });

  it("removes a distro that is already selected", () => {
    expect(
      toggleComparisonSelection(["ubuntu", "debian"], "ubuntu"),
    ).toEqual(["debian"]);
  });

  it("refuses to add a fourth distro", () => {
    const full = ["ubuntu", "debian", "fedora-workstation"];
    expect(full).toHaveLength(MAX_COMPARISON_DISTROS);
    expect(toggleComparisonSelection(full, "arch-linux")).toEqual(full);
  });

  it("still allows removing when the selection is full", () => {
    expect(
      toggleComparisonSelection(
        ["ubuntu", "debian", "fedora-workstation"],
        "debian",
      ),
    ).toEqual(["ubuntu", "fedora-workstation"]);
  });

  it("drops unknown and duplicate slugs, preserving order", () => {
    expect(
      normalizeComparisonSelection([
        "debian",
        "not-a-distro",
        "debian",
        "ubuntu",
      ]),
    ).toEqual(["debian", "ubuntu"]);
  });

  it("truncates anything beyond the cap", () => {
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
