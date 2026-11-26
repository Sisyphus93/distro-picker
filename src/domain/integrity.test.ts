import { describe, expect, it } from "vitest";
import { getDistroBySlug } from "./distros";
import { findDistroIssues, findDomainIssues } from "./integrity";
import type { DistroProfile, Rating } from "./types";

/**
 * An otherwise-clean Distro fixture rated at the given ease-of-use. Ubuntu is
 * used as the base because its slug is not on the always-caveated list, so any
 * caveat complaint can only come from the ease-of-use invariant.
 */
function handsOnFixture(easeOfUse: Rating): DistroProfile {
  const base = getDistroBySlug("ubuntu");
  expect(base).toBeDefined();

  return {
    ...base!,
    slug: "custom-hands-on",
    ratings: {
      ...base!.ratings,
      "ease-of-use": {
        rating: easeOfUse,
        rationale: "Requires manual configuration.",
      },
    },
    caveat: undefined,
  };
}

describe("domain integrity", () => {
  it("validates the entire curated dataset and quiz flows without issues", () => {
    expect(findDomainIssues()).toEqual([]);
  });

  it("flags any distro rated ease-of-use <= 2 that omits an explicit caveat", () => {
    const issues = findDistroIssues(handsOnFixture(2));

    expect(issues).toEqual([
      {
        area: "dataset",
        id: "custom-hands-on",
        message: "Caveat-heavy distro is missing its caveat.",
      },
    ]);
  });

  it("accepts a low-ease distro once it carries an explicit caveat", () => {
    const withCaveat: DistroProfile = {
      ...handsOnFixture(1),
      caveat: {
        headline: "Not a first distro",
        detail: "Expect to read documentation before you are productive.",
        mostRelevantTo: "newcomers",
      },
    };

    expect(findDistroIssues(withCaveat)).toEqual([]);
  });
});
