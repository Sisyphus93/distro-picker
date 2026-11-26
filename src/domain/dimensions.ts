/**
 * The ten shared evaluation dimensions.
 *
 * One model powers quiz scoring, distro profiles, catalog filters,
 * comparison and the methodology page. Every distro is rated 1–5 on each
 * dimension; `lowLabel` describes a rating of 1, `highLabel` a rating of 5.
 */
export type DimensionId =
  | "ease-of-use"
  | "stability"
  | "hardware-support"
  | "software-availability"
  | "customization"
  | "free-software-privacy"
  | "gaming"
  | "lightweight"
  | "community-support"
  | "desktop-experience";

export interface DimensionMeta {
  id: DimensionId;
  /** Full label for detail pages, comparison tables and the methodology. */
  label: string;
  /** Compact label for cards, chips and filters. */
  shortLabel: string;
  /** What a high rating on this dimension actually means. */
  description: string;
  /** Meaning of a rating of 1. */
  lowLabel: string;
  /** Meaning of a rating of 5. */
  highLabel: string;
  /** Plain-language wording used by quiz questions and filter controls. */
  preferencePrompt: string;
}

export const DIMENSIONS: readonly DimensionMeta[] = [
  {
    id: "ease-of-use",
    label: "Ease of setup & use",
    shortLabel: "Ease of use",
    description:
      "How much knowledge the installer and day-to-day use demand — and how likely a newcomer is to get stuck.",
    lowLabel: "Needs real effort",
    highLabel: "Beginner-friendly",
    preferencePrompt: "How important is an easy setup and day-to-day use?",
  },
  {
    id: "stability",
    label: "Stability vs freshness",
    shortLabel: "Stability",
    description:
      "Where the distro sits between slow, well-tested releases and a constant stream of new software.",
    lowLabel: "Bleeding edge",
    highLabel: "Rock solid",
    preferencePrompt: "How much do you value stability over brand-new software?",
  },
  {
    id: "hardware-support",
    label: "Hardware & NVIDIA friendliness",
    shortLabel: "Hardware",
    description:
      "How reliably laptops, Wi-Fi, GPUs (especially NVIDIA) and Secure Boot work without manual fixes.",
    lowLabel: "Manual setup",
    highLabel: "Works out of the box",
    preferencePrompt:
      "How important is it that hardware and NVIDIA drivers just work?",
  },
  {
    id: "software-availability",
    label: "Software & package availability",
    shortLabel: "Software",
    description:
      "How broad and convenient the software options are: distro repositories, Flatpak, PPAs, AUR, proprietary apps.",
    lowLabel: "Limited selection",
    highLabel: "Vast selection",
    preferencePrompt: "How important is access to a wide range of software?",
  },
  {
    id: "customization",
    label: "Customization & tinkering",
    shortLabel: "Customization",
    description:
      "How far you can bend the system to your liking, from themes and layouts to building it up from scratch.",
    lowLabel: "Curated & fixed",
    highLabel: "Endlessly configurable",
    preferencePrompt: "How much do you want to customise and tinker?",
  },
  {
    id: "free-software-privacy",
    label: "Free software & privacy stance",
    shortLabel: "Privacy",
    description:
      "How much proprietary software, drivers and telemetry a distro ships or nudges you toward.",
    lowLabel: "Proprietary by default",
    highLabel: "Free software first",
    preferencePrompt:
      "How much do free software and privacy influence your choice?",
  },
  {
    id: "gaming",
    label: "Gaming readiness",
    shortLabel: "Gaming",
    description:
      "How much works out of the box for Steam, Proton, modern GPUs, controllers and gaming-specific tweaks.",
    lowLabel: "Not a focus",
    highLabel: "Gaming-first",
    preferencePrompt: "How important is gaming on this machine?",
  },
  {
    id: "lightweight",
    label: "Performance & resource needs",
    shortLabel: "Performance",
    description:
      "How comfortable the distro is on modest hardware — its appetite for RAM, CPU and disk space.",
    lowLabel: "Demanding",
    highLabel: "Very lightweight",
    preferencePrompt: "How important is running well on modest hardware?",
  },
  {
    id: "community-support",
    label: "Community, docs & support",
    shortLabel: "Community",
    description:
      "How much help is available: official documentation, forums, chat communities, commercial support and answers you can find.",
    lowLabel: "Thin support",
    highLabel: "Deep support",
    preferencePrompt: "How important is deep community support and documentation?",
  },
  {
    id: "desktop-experience",
    label: "Desktop experience",
    shortLabel: "Desktop",
    description:
      "How refined and coherent the default desktop feels — and whether you get a configured desktop at all.",
    lowLabel: "Build-your-own",
    highLabel: "Polished & coherent",
    preferencePrompt:
      "How important is a polished desktop that works out of the box?",
  },
];

const DIMENSION_BY_ID = new Map<DimensionId, DimensionMeta>(
  DIMENSIONS.map((dimension) => [dimension.id, dimension]),
);

export function getDimension(id: DimensionId): DimensionMeta {
  const dimension = DIMENSION_BY_ID.get(id);
  if (!dimension) {
    throw new Error(`Unknown dimension: ${id}`);
  }
  return dimension;
}

/** Stable display/scoring order for dimensions (index in `DIMENSIONS`). */
export function dimensionRank(id: DimensionId): number {
  const index = DIMENSIONS.findIndex((dimension) => dimension.id === id);
  return index === -1 ? DIMENSIONS.length : index;
}
