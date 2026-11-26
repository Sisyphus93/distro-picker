import { describe, expect, it } from "vitest";
import { getDistroBySlug } from "../domain";
import { formatReviewedDate, presentDistro } from "./distro-presentation";

describe("formatReviewedDate", () => {
  it("formats an ISO date for people", () => {
    expect(formatReviewedDate("2026-11-25")).toBe("25 Nov 2026");
  });

  it("returns invalid input unchanged", () => {
    expect(formatReviewedDate("not-a-date")).toBe("not-a-date");
  });
});

describe("presentDistro", () => {
  it("formats family, release model, desktops fallback, caveat, expectations, and links for Arch Linux", () => {
    const arch = getDistroBySlug("arch-linux");
    expect(arch).toBeDefined();

    const presented = presentDistro(arch!);
    expect(presented.familyLabel).toBe("Arch");
    expect(presented.releaseModelLabel).toBe("Rolling release");
    expect(presented.desktopLabels).toEqual([]);
    expect(presented.desktopsLabel).toBe("No default desktop");
    expect(presented.installDifficultyLabel).toBe("Involved");
    expect(presented.caveat).toEqual({
      headline: arch!.caveat!.headline,
      detail: arch!.caveat!.detail,
      mostRelevantTo: "newcomers",
      audienceLabel: "Newcomer caution",
      isForNewcomers: true,
    });
    expect(presented.expectationFacts.map((fact) => fact.label)).toEqual([
      "Install",
      "Day-to-day maintenance",
      "Getting software",
      "Who feels at home",
    ]);
    expect(presented.expectationFacts[0].badge).toBe("Involved");
    expect(presented.officialLinks.map((link) => link.label)).toEqual([
      "Website",
      "Download",
      "Docs",
    ]);
  });

  it("labels universal caveats as 'Worth knowing' and formats multiple desktops", () => {
    const manjaro = getDistroBySlug("manjaro");
    expect(manjaro).toBeDefined();

    const presented = presentDistro(manjaro!);
    expect(presented.desktopsLabel).toBe("KDE Plasma, GNOME, Xfce");
    expect(presented.caveat).toEqual({
      headline: manjaro!.caveat!.headline,
      detail: manjaro!.caveat!.detail,
      mostRelevantTo: "everyone",
      audienceLabel: "Worth knowing",
      isForNewcomers: false,
    });
  });

  it("returns null caveat when the Distro has none", () => {
    const ubuntu = getDistroBySlug("ubuntu");
    expect(ubuntu).toBeDefined();

    const presented = presentDistro(ubuntu!);
    expect(presented.caveat).toBeNull();
    expect(presented.desktopsLabel).toBe("GNOME");
  });
});
