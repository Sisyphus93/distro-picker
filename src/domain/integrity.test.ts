import { describe, expect, it } from "vitest";
import { getDistroBySlug } from "./distros";
import { findDistroIssues, findDomainIssues } from "./integrity";
import type { DistroProfile } from "./types";

describe("domain integrity", () => {
  it("validates the entire curated dataset and quiz flows without issues", () => {
    expect(findDomainIssues()).toEqual([]);
  });

  it("flags any distro rated ease-of-use <= 2 that omits an explicit caveat", () => {
    const base = getDistroBySlug("ubuntu");
    expect(base).toBeDefined();

    const lowEaseWithoutCaveat: DistroProfile = {
      ...base!,
      slug: "custom-hands-on",
      ratings: {
        ...base!.ratings,
        "ease-of-use": {
          rating: 2,
          rationale: "Requires manual configuration.",
        },
      },
    };

    const issues = findDistroIssues(lowEaseWithoutCaveat);
    expect(issues).toEqual([
      {
        area: "dataset",
        id: "custom-hands-on",
        message: "Caveat-heavy distro is missing its caveat.",
      },
    ]);
  });
});
