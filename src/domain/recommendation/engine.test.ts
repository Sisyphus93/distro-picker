import { describe, expect, it } from "vitest";
import { DIMENSIONS, type DimensionId } from "../dimensions";
import { DISTROS } from "../distros";
import { buildPreferenceProfile, EXPERIENCED_QUIZ, NEWCOMER_QUIZ } from "../quiz";
import {
  FIT_LABELS,
  type DimensionRatings,
  type DistroCaveat,
  type DistroProfile,
  type Rating,
} from "../types";
import type { DimensionPreference, PreferenceProfile } from "../preferences";
import { recommendDistros } from "./engine";

/**
 * Fixtures build synthetic distro profiles so each test controls exactly the
 * ratings under examination. Unlisted dimensions rate 3 (the middle of the
 * scale). The real curated dataset is used only by the integration test at
 * the bottom.
 */
function makeDistro(
  slug: string,
  ratingOverrides: Partial<Record<DimensionId, Rating>> = {},
  caveat?: DistroCaveat,
): DistroProfile {
  const ratings = Object.fromEntries(
    DIMENSIONS.map((dimension) => {
      const rating = ratingOverrides[dimension.id] ?? 3;
      return [
        dimension.id,
        {
          rating,
          rationale: `${slug} rationale for ${dimension.label} (rated ${rating}).`,
        },
      ];
    }),
  ) as DimensionRatings;

  const distro: DistroProfile = {
    slug,
    name: `Test ${slug}`,
    monogram: slug.slice(0, 2).toUpperCase(),
    accent: "#336699",
    family: "debian",
    base: "Test base",
    releaseModel: "point-release",
    releaseNote: "Test releases on a fixed schedule.",
    desktops: ["gnome"],
    tagline: `Tagline for ${slug}.`,
    summary: `Summary for ${slug}.`,
    bestFor: [`${slug} happy path one`, `${slug} happy path two`],
    notIdealFor: [`${slug} poor fit one`, `${slug} poor fit two`],
    tradeoffs: [`${slug} tradeoff one`, `${slug} tradeoff two`],
    ratings,
    whatToExpect: {
      installDifficulty: "moderate",
      install: `${slug} install experience.`,
      maintenance: `${slug} maintenance experience.`,
      softwareInstall: `${slug} software install experience.`,
      whoWillFeelAtHome: `${slug} audience.`,
    },
    links: {
      website: `https://${slug}.example.com`,
      download: `https://${slug}.example.com/download`,
      docs: `https://${slug}.example.com/docs`,
    },
    lastReviewed: "2026-11-25",
  };

  if (caveat) {
    distro.caveat = caveat;
  }
  return distro;
}

function profileWith(
  preferences: DimensionPreference[],
  flow: PreferenceProfile["flow"] = "newcomer",
): PreferenceProfile {
  return { flow, preferences };
}

function preference(
  dimension: DimensionId,
  ideal: Rating,
  weight: 1 | 2 | 3,
): DimensionPreference {
  return { dimension, ideal, weight };
}

/** Looks up one distro's fit label within a full result. */
function fitFor(
  result: ReturnType<typeof recommendDistros>,
  slug: string,
): string | undefined {
  return result.ranked.find((r) => r.distro.slug === slug)?.overallFit;
}

describe("recommendDistros", () => {
  it("lets a strongly weighted preference outweigh a weakly weighted one", () => {
    const distros = [
      makeDistro("gaming-champ", { "ease-of-use": 1, gaming: 5 }),
      makeDistro("ease-champ", { "ease-of-use": 5, gaming: 1 }),
    ];
    // pad the dataset so the engine has its minimum of three entries
    const padded = [...distros, makeDistro("filler", { "ease-of-use": 3, gaming: 3 })];

    const result = recommendDistros(
      profileWith([
        preference("ease-of-use", 5, 3),
        preference("gaming", 5, 1),
      ]),
      padded,
    );

    expect(result.topPick.distro.slug).toBe("ease-champ");
  });

  it("labels a near-perfect match Strong", () => {
    const distros = [
      makeDistro("spot-on", { "ease-of-use": 5, stability: 4 }),
      makeDistro("far-off", { "ease-of-use": 1, stability: 1 }),
      makeDistro("in-between", { "ease-of-use": 3, stability: 3 }),
    ];

    const result = recommendDistros(
      profileWith([
        preference("ease-of-use", 5, 3),
        preference("stability", 4, 2),
      ]),
      distros,
    );

    expect(fitFor(result, "spot-on")).toBe("Strong");
  });

  it("labels a workable-but-notably-off match Good", () => {
    const distros = [
      makeDistro("a-bit-off", { stability: 3 }),
      makeDistro("close", { stability: 5 }),
      makeDistro("way-off", { stability: 1 }),
    ];

    const result = recommendDistros(
      profileWith([preference("stability", 5, 2)]),
      distros,
    );

    expect(fitFor(result, "a-bit-off")).toBe("Good");
  });

  it("labels a badly aligned distro Partial", () => {
    const distros = [
      makeDistro("way-off", { "ease-of-use": 1 }),
      makeDistro("close", { "ease-of-use": 5 }),
      makeDistro("in-between", { "ease-of-use": 4 }),
    ];

    const result = recommendDistros(
      profileWith([preference("ease-of-use", 5, 3)]),
      distros,
    );

    expect(fitFor(result, "way-off")).toBe("Partial");
  });

  it("reports why each matched preference lines up, per dimension", () => {
    const distros = [
      makeDistro("spot-on", { "ease-of-use": 5, stability: 4 }),
      makeDistro("far-off", { "ease-of-use": 1, stability: 1 }),
      makeDistro("in-between", { "ease-of-use": 3, stability: 3 }),
    ];

    const result = recommendDistros(
      profileWith([
        preference("ease-of-use", 5, 3),
        preference("stability", 4, 2),
      ]),
      distros,
    );

    const spotOn = result.ranked.find((r) => r.distro.slug === "spot-on");
    const matchedDimensions = spotOn?.matches.map((match) => match.dimension);
    expect(matchedDimensions).toContain("ease-of-use");
    expect(matchedDimensions).toContain("stability");
    for (const match of spotOn?.matches ?? []) {
      expect(match.reason.length).toBeGreaterThan(0);
      expect(["Strong", "Good"]).toContain(match.fit);
    }
    // an exact rating earns Strong, a one-point miss earns Good
    const easeMatch = spotOn?.matches.find((m) => m.dimension === "ease-of-use");
    const stabilityMatch = spotOn?.matches.find(
      (m) => m.dimension === "stability",
    );
    expect(easeMatch?.fit).toBe("Strong");
    expect(stabilityMatch?.fit).toBe("Strong");

    const offByOne = recommendDistros(
      profileWith([preference("stability", 5, 2)]),
      [
        makeDistro("close", { stability: 4 }),
        makeDistro("worse-a", { stability: 1 }),
        makeDistro("worse-b", { stability: 1 }),
      ],
    );
    expect(
      offByOne.ranked[0].matches.find((m) => m.dimension === "stability")?.fit,
    ).toBe("Good");

    const farOff = result.ranked.find((r) => r.distro.slug === "far-off");
    expect(farOff?.matches.map((m) => m.dimension)).not.toContain(
      "ease-of-use",
    );
  });

  it("phrases a mismatched preference as a tradeoff, not a match", () => {
    const distros = [
      makeDistro("spicy", { stability: 2 }),
      makeDistro("solid", { stability: 5 }),
      makeDistro("mid", { stability: 3 }),
    ];

    const result = recommendDistros(
      profileWith([preference("stability", 5, 2)]),
      distros,
    );

    const spicy = result.ranked.find((r) => r.distro.slug === "spicy");
    expect(spicy?.matches).toHaveLength(0);
    expect(spicy?.tradeoffs.length).toBeGreaterThan(0);
    expect(
      spicy?.tradeoffs.some((line) => /stability/i.test(line)),
    ).toBe(true);
  });

  it("warns loudly about an extreme mismatch instead of hiding it", () => {
    const distros = [
      makeDistro("bleeding-edge", { stability: 1 }),
      makeDistro("solid", { stability: 5 }),
      makeDistro("mid", { stability: 3 }),
    ];

    const result = recommendDistros(
      profileWith([preference("stability", 5, 3)]),
      distros,
    );

    const extreme = result.ranked.find(
      (r) => r.distro.slug === "bleeding-edge",
    );
    expect(extreme?.warning).toBeTruthy();
    expect(extreme?.warning).toMatch(/stability/i);
  });

  it("does not warn for a mild one- or two-point miss", () => {
    const distros = [
      makeDistro("slight-miss", { stability: 3 }),
      makeDistro("close", { stability: 4 }),
      makeDistro("solid", { stability: 5 }),
    ];

    const result = recommendDistros(
      profileWith([preference("stability", 5, 1)]),
      distros,
    );

    const slight = result.ranked.find(
      (r) => r.distro.slug === "slight-miss",
    );
    expect(slight?.tradeoffs.length).toBeGreaterThan(0);
    expect(slight?.warning).toBeUndefined();
  });

  it("still surfaces a caveat-heavy distro's own warning when nothing mismatches", () => {
    const cave = {
      headline: "Not a first distro",
      detail: "Expect a manual, high-maintenance install.",
      mostRelevantTo: "everyone" as const,
    };
    const distros = [
      makeDistro("advanced", { "ease-of-use": 5 }, cave),
      makeDistro("plain-a", { "ease-of-use": 5 }),
      makeDistro("plain-b", { "ease-of-use": 4 }),
    ];

    const result = recommendDistros(
      profileWith([preference("ease-of-use", 5, 3)]),
      distros,
    );

    const advanced = result.ranked.find((r) => r.distro.slug === "advanced");
    expect(advanced?.matches.length).toBeGreaterThan(0);
    expect(advanced?.warning).toContain("Not a first distro");
  });

  it("combines an extreme-mismatch warning with the distro's own caveat", () => {
    const cave = {
      headline: "High maintenance",
      detail: "You keep this rolling yourself.",
      mostRelevantTo: "newcomers" as const,
    };
    const distros = [
      makeDistro("bleeding-edge", { stability: 1 }, cave),
      makeDistro("solid", { stability: 5 }),
      makeDistro("mid", { stability: 3 }),
    ];

    const result = recommendDistros(
      profileWith([preference("stability", 5, 3)]),
      distros,
    );

    const extreme = result.ranked.find(
      (r) => r.distro.slug === "bleeding-edge",
    );
    expect(extreme?.warning).toMatch(/stability/i);
    expect(extreme?.warning).toContain("High maintenance");
  });

  it("gives a neutral, stable ranking when the user is not sure about anything", () => {
    // "Not sure / no preference" answers contribute no preferences at all, so
    // the engine has no basis to separate the distros — and must not invent
    // one.
    const distros = [
      makeDistro("first", { "ease-of-use": 1 }),
      makeDistro("second", { "ease-of-use": 5 }),
      makeDistro("third", { "ease-of-use": 3 }),
    ];

    const first = recommendDistros(profileWith([]), distros);
    const second = recommendDistros(profileWith([]), distros);

    expect(first.ranked.map((r) => r.distro.slug)).toEqual([
      "first",
      "second",
      "third",
    ]);
    for (const item of first.ranked) {
      expect(item.matches).toHaveLength(0);
      expect(item.tradeoffs).toHaveLength(0);
      expect(item.overallFit).toBe("Good");
    }
    // deterministic: same input, byte-identical ordering
    expect(second.ranked.map((r) => r.distro.slug)).toEqual(
      first.ranked.map((r) => r.distro.slug),
    );
  });

  it("ignores dimensions the user expressed no opinion about", () => {
    // Gaming differs sharply between the two distros, but the profile says
    // nothing about gaming, so it must not sway the ranking.
    const distros = [
      makeDistro("steady", { "ease-of-use": 5, gaming: 1 }),
      makeDistro("volatile", { "ease-of-use": 4, gaming: 5 }),
      makeDistro("filler", { "ease-of-use": 2, gaming: 3 }),
    ];

    const result = recommendDistros(
      profileWith([preference("ease-of-use", 5, 3)]),
      distros,
    );

    expect(result.ranked.map((r) => r.distro.slug)).toEqual([
      "steady",
      "volatile",
      "filler",
    ]);
  });

  it("keeps dataset order when two distros tie on every preference", () => {
    const distros = [
      makeDistro("alpha", { stability: 4 }),
      makeDistro("beta", { stability: 4 }),
      makeDistro("gamma", { stability: 4 }),
    ];

    const result = recommendDistros(
      profileWith([preference("stability", 4, 2)]),
      distros,
    );

    expect(result.ranked.map((r) => r.distro.slug)).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  it("returns exactly two alternatives, both distinct from the top pick", () => {
    const distros = [
      makeDistro("best", { "ease-of-use": 5 }),
      makeDistro("runner-up", { "ease-of-use": 4 }),
      makeDistro("third", { "ease-of-use": 4 }),
      makeDistro("fourth", { "ease-of-use": 2 }),
    ];

    const result = recommendDistros(
      profileWith([preference("ease-of-use", 5, 3)]),
      distros,
    );

    expect(result.alternatives).toHaveLength(2);
    const alternativeSlugs = result.alternatives.map((a) => a.distro.slug);
    expect(alternativeSlugs).not.toContain(result.topPick.distro.slug);
    expect(new Set(alternativeSlugs).size).toBe(2);
  });

  it("throws a clear error when the dataset cannot yield three picks", () => {
    const distros = [makeDistro("only-a"), makeDistro("only-b")];

    expect(() => recommendDistros(profileWith([]), distros)).toThrow(
      /at least 3/,
    );
  });

  it("never hard-eliminates a distro, even one that badly misfits", () => {
    const distros = [
      makeDistro("terrible-fit", { "ease-of-use": 1, stability: 1 }),
      makeDistro("solid", { "ease-of-use": 5, stability: 5 }),
      makeDistro("decent", { "ease-of-use": 4, stability: 4 }),
    ];

    const result = recommendDistros(
      profileWith([
        preference("ease-of-use", 5, 3),
        preference("stability", 5, 3),
      ]),
      distros,
    );

    expect(result.ranked.map((r) => r.distro.slug)).toContain("terrible-fit");
    expect(
      result.ranked.find((r) => r.distro.slug === "terrible-fit")?.overallFit,
    ).toBe("Partial");
  });

  it("ranks the distro closest to the user's preferences first", () => {
    const distros = [
      makeDistro("steep", { "ease-of-use": 1 }),
      makeDistro("steady", { "ease-of-use": 5 }),
      makeDistro("middle", { "ease-of-use": 3 }),
    ];

    const result = recommendDistros(
      profileWith([preference("ease-of-use", 5, 3)]),
      distros,
    );

    expect(result.topPick.distro.slug).toBe("steady");
    expect(result.alternatives.map((a) => a.distro.slug)).toEqual([
      "middle",
      "steep",
    ]);
    expect(result.ranked.map((r) => r.distro.slug)).toEqual([
      "steady",
      "middle",
      "steep",
    ]);
  });
});


describe("recommendDistros with the curated dataset", () => {
  const newcomerProfile = profileWith([
    preference("ease-of-use", 5, 3),
    preference("stability", 4, 2),
    preference("hardware-support", 5, 2),
    preference("software-availability", 5, 1),
  ]);

  it("ranks all 16 curated distros with a top pick and two alternatives", () => {
    const result = recommendDistros(newcomerProfile, DISTROS);

    expect(result.ranked).toHaveLength(16);
    expect(new Set(result.ranked.map((r) => r.distro.slug)).size).toBe(16);
    expect(result.alternatives).toHaveLength(2);
    expect(
      result.alternatives.map((a) => a.distro.slug),
    ).not.toContain(result.topPick.distro.slug);
    // the top pick is also first in the full ranking
    expect(result.ranked[0].distro.slug).toBe(result.topPick.distro.slug);
  });

  it("uses only qualitative fit labels — no numeric match scores leak out", () => {
    const result = recommendDistros(newcomerProfile, DISTROS);

    const leaves: unknown[] = [];
    const walk = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      if (value !== null && typeof value === "object") {
        Object.values(value).forEach(walk);
        return;
      }
      leaves.push(value);
    };
    for (const { overallFit, matches, tradeoffs, warning } of result.ranked) {
      walk({ overallFit, matches, tradeoffs, warning });
    }

    expect(leaves.every((leaf) => typeof leaf !== "number")).toBe(true);
    for (const rec of result.ranked) {
      expect(FIT_LABELS).toContain(rec.overallFit);
      for (const match of rec.matches) {
        expect(FIT_LABELS).toContain(match.fit);
      }
    }
  });

  it("explains every recommendation with reasons and tradeoffs drawn from curated data", () => {
    const result = recommendDistros(newcomerProfile, DISTROS);

    for (const rec of result.ranked) {
      for (const match of rec.matches) {
        expect(match.reason.trim().length).toBeGreaterThan(0);
      }
      for (const tradeoff of rec.tradeoffs) {
        expect(tradeoff.trim().length).toBeGreaterThan(0);
      }
    }
    // a mainstream-friendly profile should surface some confident match
    expect(result.topPick.overallFit).not.toBe("Partial");
    expect(result.topPick.matches.length).toBeGreaterThan(0);
  });

  it("flags the caveat-heavy distros with a warning, never silently", () => {
    const wantedEverything = profileWith([
      preference("customization", 5, 3),
      preference("community-support", 5, 2),
    ]);
    const result = recommendDistros(wantedEverything, DISTROS);

    for (const slug of ["arch-linux", "nixos", "manjaro"]) {
      const rec = result.ranked.find((r) => r.distro.slug === slug);
      expect(rec?.warning, `expected ${slug} to carry a warning`).toBeTruthy();
    }
  });

  it("ranks experienced answers through the same recommendation shape", () => {
    const optionIds = [
      "development",
      "rolling",
      "arch-aur",
      "new-hardware",
      "from-scratch",
      "live-on-the-edge",
      "tiling",
    ];
    expect(EXPERIENCED_QUIZ.questions).toHaveLength(optionIds.length);
    const answers = EXPERIENCED_QUIZ.questions.map((question, index) => {
      const optionId = optionIds[index];
      expect(question.options.some((option) => option.id === optionId)).toBe(true);
      return { questionId: question.id, optionId };
    });
    const profile = buildPreferenceProfile(EXPERIENCED_QUIZ, answers);
    expect(profile.flow).toBe("experienced");
    expect(profile.preferences.map((p) => p.dimension)).toEqual(
      expect.arrayContaining(["stability", "software-availability", "customization"]),
    );

    const result = recommendDistros(profile, DISTROS);
    expect(result.ranked).toHaveLength(DISTROS.length);
    expect(result.topPick.distro.slug).toBe("arch-linux");
    expect(result.topPick.matches.length).toBeGreaterThan(0);
    expect(result.topPick.warning).toBeTruthy();
    expect(result.alternatives).toHaveLength(2);
    expect(
      new Set([result.topPick, ...result.alternatives].map((r) => r.distro.slug)).size,
    ).toBe(3);
  });

  it("keeps experienced 'not sure' answers neutral", () => {
    const answers = EXPERIENCED_QUIZ.questions.map((question) => {
      const neutral = question.options.find((option) => option.kind === "neutral");
      expect(question.allowNotSure).toBe(true);
      expect(neutral).toBeDefined();
      return { questionId: question.id, optionId: neutral!.id };
    });
    const profile = buildPreferenceProfile(EXPERIENCED_QUIZ, answers);
    expect(profile.preferences).toEqual([]);
    const result = recommendDistros(profile, DISTROS);
    expect(result.ranked.map((r) => r.distro.slug)).toEqual(
      DISTROS.map((d) => d.slug),
    );
    expect(
      result.ranked.every(
        (r) => r.overallFit === "Good" && r.matches.length === 0 && r.tradeoffs.length === 0,
      ),
    ).toBe(true);
  });

  it("keeps 'not sure' answers neutral end-to-end through the newcomer quiz", () => {
    const allNotSure = NEWCOMER_QUIZ.questions.map((question) => ({
      questionId: question.id,
      optionId: "not-sure",
    }));

    const profile = buildPreferenceProfile(NEWCOMER_QUIZ, allNotSure);
    expect(profile.preferences).toHaveLength(0);

    const result = recommendDistros(profile, DISTROS);
    expect(result.ranked.map((r) => r.distro.slug)).toEqual(
      DISTROS.map((d) => d.slug),
    );
    for (const rec of result.ranked) {
      expect(rec.overallFit).toBe("Good");
      expect(rec.matches).toHaveLength(0);
      expect(rec.tradeoffs).toHaveLength(0);
    }
  });
});
