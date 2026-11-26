import { describe, expect, it } from "vitest";
import { getDistroBySlug, type DistroProfile } from "../domain";
import { formatReviewedDate, presentDistro } from "./distro-presentation";

function requireDistro(slug: string): DistroProfile {
  const distro = getDistroBySlug(slug);
  expect(distro).toBeDefined();
  return distro!;
}

/**
 * A Distro whose presentation-relevant fields are known literals, so expected
 * values come from an independent source of truth instead of recomputing the
 * module's own lookups. Ubuntu is the base because it carries no Caveat.
 */
function presentationFixture(
  overrides: Partial<DistroProfile> = {},
): DistroProfile {
  return {
    ...requireDistro("ubuntu"),
    slug: "testbed-linux",
    name: "Testbed Linux",
    family: "arch",
    releaseModel: "image-based",
    desktops: ["kde-plasma", "xfce"],
    whatToExpect: {
      installDifficulty: "moderate",
      install: "Install copy.",
      maintenance: "Maintenance copy.",
      softwareInstall: "Software copy.",
      whoWillFeelAtHome: "Audience copy.",
    },
    links: {
      website: "https://testbed.example",
      download: "https://testbed.example/download",
      docs: "https://testbed.example/docs",
    },
    lastReviewed: "2026-11-25",
    caveat: undefined,
    ...overrides,
  };
}

describe("formatReviewedDate", () => {
  it("formats an ISO date for people", () => {
    expect(formatReviewedDate("2026-11-25")).toBe("25 Nov 2026");
    expect(formatReviewedDate("2024-02-29")).toBe("29 Feb 2024");
  });

  it("returns invalid input unchanged", () => {
    expect(formatReviewedDate("not-a-date")).toBe("not-a-date");
    expect(formatReviewedDate("")).toBe("");
  });

  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "2026-1-5"])(
    "passes impossible or non-ISO date %s through unchanged",
    (raw) => {
      expect(formatReviewedDate(raw)).toBe(raw);
    },
  );
});

describe("presentDistro", () => {
  it("resolves every shared label, expectation, link and Caveat from one view model", () => {
    expect(presentDistro(presentationFixture())).toEqual({
      familyLabel: "Arch",
      releaseModelLabel: "Image-based (atomic)",
      desktopLabels: ["KDE Plasma", "Xfce"],
      desktopsLabel: "KDE Plasma, Xfce",
      reviewedDateLabel: "25 Nov 2026",
      installDifficultyLabel: "Moderate",
      caveat: null,
      expectationFacts: [
        {
          id: "install",
          label: "Install",
          badge: "Moderate",
          body: "Install copy.",
        },
        {
          id: "maintenance",
          label: "Day-to-day maintenance",
          body: "Maintenance copy.",
        },
        {
          id: "softwareInstall",
          label: "Getting software",
          body: "Software copy.",
        },
        {
          id: "whoWillFeelAtHome",
          label: "Who feels at home",
          body: "Audience copy.",
        },
      ],
      officialLinks: [
        {
          kind: "website",
          label: "Website",
          href: "https://testbed.example",
          ariaLabel: "Testbed Linux website (opens in a new tab)",
        },
        {
          kind: "download",
          label: "Download",
          href: "https://testbed.example/download",
          ariaLabel: "Testbed Linux download (opens in a new tab)",
        },
        {
          kind: "docs",
          label: "Docs",
          href: "https://testbed.example/docs",
          ariaLabel: "Testbed Linux docs (opens in a new tab)",
        },
      ],
    });
  });

  it.each([
    ["newcomers", "Newcomer caution", true],
    ["everyone", "Worth knowing", false],
  ] as const)(
    "frames a %s Caveat as '%s'",
    (mostRelevantTo, audienceLabel, isForNewcomers) => {
      const presented = presentDistro(
        presentationFixture({
          caveat: {
            headline: "Read this first",
            detail: "Expect to do some work.",
            mostRelevantTo,
          },
        }),
      );

      expect(presented.caveat).toEqual({
        headline: "Read this first",
        detail: "Expect to do some work.",
        mostRelevantTo,
        audienceLabel,
        isForNewcomers,
      });
    },
  );

  it("returns a null Caveat when the Distro has none", () => {
    expect(presentDistro(presentationFixture()).caveat).toBeNull();
    expect(presentDistro(requireDistro("ubuntu")).caveat).toBeNull();
  });

  it.each([
    ["arch-linux", [], "No default desktop"],
    ["manjaro", ["KDE Plasma", "GNOME", "Xfce"], "KDE Plasma, GNOME, Xfce"],
    ["ubuntu", ["GNOME"], "GNOME"],
  ] as const)(
    "resolves %s desktops with the shared fallback",
    (slug, desktopLabels, desktopsLabel) => {
      const presented = presentDistro(requireDistro(slug));
      expect(presented.desktopLabels).toEqual(desktopLabels);
      expect(presented.desktopsLabel).toBe(desktopsLabel);
    },
  );

  it.each([
    ["arch-linux", "Arch", "Rolling release", "Involved"],
    ["ubuntu", "Debian / Ubuntu", "Long-term support", "Straightforward"],
    ["manjaro", "Arch", "Curated rolling", "Moderate"],
  ] as const)(
    "resolves family, release, review date and install labels for %s",
    (slug, familyLabel, releaseModelLabel, installDifficultyLabel) => {
      const presented = presentDistro(requireDistro(slug));
      expect(presented.familyLabel).toBe(familyLabel);
      expect(presented.releaseModelLabel).toBe(releaseModelLabel);
      expect(presented.reviewedDateLabel).toBe("25 Nov 2026");
      expect(presented.installDifficultyLabel).toBe(installDifficultyLabel);
    },
  );

  it("maps curated living-with prose onto the unified expectation labels", () => {
    const arch = requireDistro("arch-linux");
    const facts = presentDistro(arch).expectationFacts;

    expect(
      facts.map((fact) => [fact.id, fact.label, fact.badge]),
    ).toEqual([
      ["install", "Install", "Involved"],
      ["maintenance", "Day-to-day maintenance", undefined],
      ["softwareInstall", "Getting software", undefined],
      ["whoWillFeelAtHome", "Who feels at home", undefined],
    ]);
    expect(facts.map((fact) => fact.body)).toEqual([
      arch.whatToExpect.install,
      arch.whatToExpect.maintenance,
      arch.whatToExpect.softwareInstall,
      arch.whatToExpect.whoWillFeelAtHome,
    ]);
  });

  it("announces official links as new-tab destinations using the Distro name", () => {
    expect(presentDistro(requireDistro("ubuntu")).officialLinks).toEqual([
      {
        kind: "website",
        label: "Website",
        href: "https://ubuntu.com",
        ariaLabel: "Ubuntu website (opens in a new tab)",
      },
      {
        kind: "download",
        label: "Download",
        href: "https://ubuntu.com/download/desktop",
        ariaLabel: "Ubuntu download (opens in a new tab)",
      },
      {
        kind: "docs",
        label: "Docs",
        href: "https://help.ubuntu.com",
        ariaLabel: "Ubuntu docs (opens in a new tab)",
      },
    ]);
  });

  it("tags curated Caveats uniformly across both audiences", () => {
    expect(presentDistro(requireDistro("arch-linux")).caveat).toMatchObject({
      headline: "Not a first distro",
      audienceLabel: "Newcomer caution",
      isForNewcomers: true,
    });
    expect(presentDistro(requireDistro("manjaro")).caveat).toMatchObject({
      headline: "Curated rolling, with caveats",
      audienceLabel: "Worth knowing",
      isForNewcomers: false,
    });
  });
});
