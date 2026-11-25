import { describe, expect, it } from "vitest";
import { CATALOG_SORTS, queryCatalog, topStrengths } from "./catalog";
import { DIMENSIONS, type DimensionId } from "./dimensions";
import { DISTROS } from "./distros";
import type { DimensionRatings, DistroProfile, Rating } from "./types";

/**
 * Fixtures build synthetic profiles so each test controls exactly the ratings
 * and names under examination. Unlisted dimensions rate 3. The real curated
 * dataset is used only by the integration tests at the bottom.
 */
function makeDistro(
  name: string,
  ratingOverrides: Partial<Record<DimensionId, Rating>> = {},
): DistroProfile {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const ratings = Object.fromEntries(
    DIMENSIONS.map((dimension) => {
      const rating = ratingOverrides[dimension.id] ?? 3;
      return [
        dimension.id,
        {
          rating,
          rationale: `${name} rationale for ${dimension.label} (rated ${rating}).`,
        },
      ];
    }),
  ) as DimensionRatings;

  return {
    slug,
    name,
    monogram: name.slice(0, 2).toUpperCase(),
    accent: "#336699",
    family: "debian",
    base: "Test base",
    releaseModel: "point-release",
    releaseNote: "Test releases on a fixed schedule.",
    desktops: ["gnome"],
    tagline: `Tagline for ${name}.`,
    summary: `Summary for ${name}.`,
    bestFor: [`${name} happy path one`, `${name} happy path two`],
    notIdealFor: [`${name} poor fit one`, `${name} poor fit two`],
    tradeoffs: [`${name} tradeoff one`, `${name} tradeoff two`],
    ratings,
    whatToExpect: {
      installDifficulty: "moderate",
      install: `${name} install experience.`,
      maintenance: `${name} maintenance experience.`,
      softwareInstall: `${name} software install experience.`,
      whoWillFeelAtHome: `${name} audience.`,
    },
    links: {
      website: `https://example.com/${slug}`,
      download: `https://example.com/${slug}/download`,
      docs: `https://example.com/${slug}/docs`,
    },
    lastReviewed: "2026-11-25",
  };
}

function namesOf(distros: readonly DistroProfile[]): string[] {
  return distros.map((distro) => distro.name);
}

const fixtures: readonly DistroProfile[] = [
  makeDistro("Mint Like", { "ease-of-use": 5, lightweight: 4, gaming: 2 }),
  makeDistro("Arch Like", {
    "ease-of-use": 1,
    customization: 5,
    lightweight: 5,
    gaming: 4,
  }),
  makeDistro("Gaming Like", { gaming: 5, "ease-of-use": 3 }),
];

describe("catalog search", () => {
  it("matches names case-insensitively", () => {
    expect(namesOf(queryCatalog(fixtures, { search: "mint" }))).toEqual([
      "Mint Like",
    ]);
    expect(namesOf(queryCatalog(fixtures, { search: "ARCH" }))).toEqual([
      "Arch Like",
    ]);
  });

  it("ignores punctuation and spacing in names", () => {
    const pop = makeDistro("Pop!_OS");
    for (const search of ["pop os", "popos", "POP!_OS", "pop"]) {
      expect(namesOf(queryCatalog([pop], { search }))).toEqual(["Pop!_OS"]);
    }
  });

  it("treats a blank search as no filter", () => {
    expect(namesOf(queryCatalog(fixtures, { search: "   " }))).toEqual(
      namesOf(fixtures),
    );
  });

  it("returns nothing when no name matches", () => {
    expect(queryCatalog(fixtures, { search: "void" })).toEqual([]);
  });
});

describe("catalog priorities", () => {
  it("keeps distros rated at or above the threshold on one priority", () => {
    const results = queryCatalog(fixtures, {
      priorities: ["lightweight"],
      threshold: 4,
    });
    expect(namesOf(results)).toEqual(["Mint Like", "Arch Like"]);
  });

  it("requires every picked priority to match", () => {
    const results = queryCatalog(fixtures, {
      priorities: ["lightweight", "ease-of-use"],
      threshold: 4,
    });
    expect(namesOf(results)).toEqual(["Mint Like"]);
  });

  it("can demand a standout (5) rating", () => {
    const results = queryCatalog(fixtures, {
      priorities: ["lightweight"],
      threshold: 5,
    });
    expect(namesOf(results)).toEqual(["Arch Like"]);
  });

  it("does not filter when no priority is picked", () => {
    expect(
      namesOf(queryCatalog(fixtures, { priorities: [], threshold: 5 })),
    ).toEqual(namesOf(fixtures));
  });
});

describe("catalog sorting", () => {
  it("ranks by the sort's dimension, strongest rating first", () => {
    expect(namesOf(queryCatalog(fixtures, { sort: "gaming" }))).toEqual([
      "Gaming Like",
      "Arch Like",
      "Mint Like",
    ]);
    expect(namesOf(queryCatalog(fixtures, { sort: "beginner-friendly" }))).toEqual(
      ["Mint Like", "Gaming Like", "Arch Like"],
    );
  });

  it("keeps the incoming order for ties", () => {
    // Every fixture rates 3 on stability, so nothing may reorder.
    expect(namesOf(queryCatalog(fixtures, { sort: "stable" }))).toEqual(
      namesOf(fixtures),
    );
  });

  it("sorts by name when asked", () => {
    expect(namesOf(queryCatalog(fixtures, { sort: "name" }))).toEqual([
      "Arch Like",
      "Gaming Like",
      "Mint Like",
    ]);
  });

  it("combines search, priorities and sort", () => {
    const results = queryCatalog(fixtures, {
      search: "like",
      priorities: ["gaming"],
      threshold: 4,
      sort: "name",
    });
    expect(namesOf(results)).toEqual(["Arch Like", "Gaming Like"]);
  });
});

describe("catalog against the curated dataset", () => {
  it("returns the full catalog in curated order by default", () => {
    expect(queryCatalog(DISTROS, {}).map((distro) => distro.slug)).toEqual(
      DISTROS.map((distro) => distro.slug),
    );
  });

  it("supports every published sort without losing distros", () => {
    const allSlugs = DISTROS.map((distro) => distro.slug).sort();
    for (const sort of CATALOG_SORTS) {
      const slugs = queryCatalog(DISTROS, { sort: sort.id })
        .map((distro) => distro.slug)
        .sort();
      expect(slugs, `sort ${sort.id}`).toEqual(allSlugs);
    }
  });

  it("narrows the real catalog with a priority", () => {
    const results = queryCatalog(DISTROS, {
      priorities: ["gaming"],
      threshold: 5,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(DISTROS.length);
    expect(
      results.every((distro) => distro.ratings.gaming.rating === 5),
    ).toBe(true);
  });

  it("finds a real distro by name", () => {
    expect(
      queryCatalog(DISTROS, { search: "mint" }).map((distro) => distro.slug),
    ).toEqual(["linux-mint"]);
  });
});

describe("topStrengths", () => {
  it("lists rated-4-plus dimensions strongest first", () => {
    const strengths = topStrengths(
      makeDistro("Mixed", {
        gaming: 4,
        lightweight: 5,
        "ease-of-use": 2,
      }),
    );
    expect(strengths.map((strength) => strength.dimension.id)).toEqual([
      "lightweight",
      "gaming",
    ]);
    expect(strengths.map((strength) => strength.rating)).toEqual([5, 4]);
  });

  it("breaks rating ties with the shared dimension order", () => {
    const strengths = topStrengths(
      makeDistro("Tied", { customization: 5, "ease-of-use": 5 }),
    );
    expect(strengths.map((strength) => strength.dimension.id)).toEqual([
      "ease-of-use",
      "customization",
    ]);
  });

  it("respects the requested limit", () => {
    const strengths = topStrengths(DISTROS[0], 1);
    expect(strengths).toHaveLength(1);
  });

  it("returns nothing for a distro that never rates above middling", () => {
    expect(topStrengths(makeDistro("Middling"))).toEqual([]);
  });
});
