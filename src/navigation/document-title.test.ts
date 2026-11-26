import { describe, expect, it } from "vitest";
import { getDistroBySlug } from "../domain";
import { titleForPath } from "./document-title";

describe("document title", () => {
  it("names each core route", () => {
    expect(titleForPath("/")).toBe(
      "Distro Picker — Find your place in Linux",
    );
    expect(titleForPath("/quiz")).toBe("Choose a quiz path · Distro Picker");
    expect(titleForPath("/quiz/newcomer")).toBe(
      "Newcomer quiz · Distro Picker",
    );
    expect(titleForPath("/quiz/experienced")).toBe(
      "Experienced quiz · Distro Picker",
    );
    expect(titleForPath("/results")).toBe("Your results · Distro Picker");
    expect(titleForPath("/catalog")).toBe("Explore distros · Distro Picker");
    expect(titleForPath("/compare")).toBe("Compare distros · Distro Picker");
    expect(titleForPath("/methodology")).toBe(
      "How we recommend · Distro Picker",
    );
  });

  it("uses the distro's name for profile routes", () => {
    const distro = getDistroBySlug("ubuntu");
    expect(distro).toBeDefined();
    expect(titleForPath("/distros/ubuntu")).toBe(
      `${distro?.name} · Distro Picker`,
    );
  });

  it("falls back for unknown pages, unknown profiles and trailing slashes", () => {
    expect(titleForPath("/nope")).toBe("Page not found · Distro Picker");
    expect(titleForPath("/distros/not-a-distro")).toBe(
      "Profile not found · Distro Picker",
    );
    expect(titleForPath("/catalog/")).toBe("Explore distros · Distro Picker");
    expect(titleForPath("")).toBe("Distro Picker — Find your place in Linux");
  });
});
