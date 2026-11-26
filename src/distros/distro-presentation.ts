import {
  getDesktop,
  getFamily,
  getReleaseModel,
  INSTALL_DIFFICULTY_LABELS,
  type DistroCaveat,
  type DistroProfile,
} from "../domain";

export interface PresentedCaveat {
  headline: string;
  detail: string;
  mostRelevantTo: DistroCaveat["mostRelevantTo"];
  audienceLabel: "Newcomer caution" | "Worth knowing";
  isForNewcomers: boolean;
}

export type OfficialLinkKind = "website" | "download" | "docs";

export interface PresentedOfficialLink {
  kind: OfficialLinkKind;
  label: "Website" | "Download" | "Docs";
  href: string;
  ariaLabel: string;
}

export interface PresentedExpectationFact {
  id: "install" | "maintenance" | "softwareInstall" | "whoWillFeelAtHome";
  label: string;
  body: string;
  badge?: string;
}

export interface PresentedDistro {
  familyLabel: string;
  releaseModelLabel: string;
  desktopLabels: readonly string[];
  desktopsLabel: string;
  reviewedDateLabel: string;
  installDifficultyLabel: string;
  caveat: PresentedCaveat | null;
  expectationFacts: readonly PresentedExpectationFact[];
  officialLinks: readonly PresentedOfficialLink[];
}

/**
 * Formats an ISO date (YYYY-MM-DD) for people, falling back to the raw value
 * when it is not a valid date. JavaScript normalises impossible calendar dates
 * (e.g. 2026-02-30) instead of rejecting them, so check the parsed date
 * round-trips to the same day before presenting it as fact.
 */
export function formatReviewedDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== isoDate
  ) {
    return isoDate;
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function presentCaveat(caveat: DistroCaveat | undefined): PresentedCaveat | null {
  if (!caveat) {
    return null;
  }
  const isForNewcomers = caveat.mostRelevantTo === "newcomers";
  return {
    headline: caveat.headline,
    detail: caveat.detail,
    mostRelevantTo: caveat.mostRelevantTo,
    audienceLabel: isForNewcomers ? "Newcomer caution" : "Worth knowing",
    isForNewcomers,
  };
}

/**
 * Resolves all shared display labels, official links, living-with expectations,
 * and Caveat framing for one Distro so catalog, comparison, detail, results,
 * and methodology agree everywhere.
 */
export function presentDistro(distro: DistroProfile): PresentedDistro {
  const desktopLabels = distro.desktops.map(
    (desktopId) => getDesktop(desktopId).label,
  );
  const installDifficultyLabel =
    INSTALL_DIFFICULTY_LABELS[distro.whatToExpect.installDifficulty];

  return {
    familyLabel: getFamily(distro.family).label,
    releaseModelLabel: getReleaseModel(distro.releaseModel).label,
    desktopLabels,
    desktopsLabel:
      desktopLabels.length > 0 ? desktopLabels.join(", ") : "No default desktop",
    reviewedDateLabel: formatReviewedDate(distro.lastReviewed),
    installDifficultyLabel,
    caveat: presentCaveat(distro.caveat),
    expectationFacts: [
      {
        id: "install",
        label: "Install",
        badge: installDifficultyLabel,
        body: distro.whatToExpect.install,
      },
      {
        id: "maintenance",
        label: "Day-to-day maintenance",
        body: distro.whatToExpect.maintenance,
      },
      {
        id: "softwareInstall",
        label: "Getting software",
        body: distro.whatToExpect.softwareInstall,
      },
      {
        id: "whoWillFeelAtHome",
        label: "Who feels at home",
        body: distro.whatToExpect.whoWillFeelAtHome,
      },
    ],
    officialLinks: [
      {
        kind: "website",
        label: "Website",
        href: distro.links.website,
        ariaLabel: `${distro.name} website (opens in a new tab)`,
      },
      {
        kind: "download",
        label: "Download",
        href: distro.links.download,
        ariaLabel: `${distro.name} download (opens in a new tab)`,
      },
      {
        kind: "docs",
        label: "Docs",
        href: distro.links.docs,
        ariaLabel: `${distro.name} docs (opens in a new tab)`,
      },
    ],
  };
}
