import type { DistroProfile } from "../types";

export const manjaro: DistroProfile = {
  slug: "manjaro",
  name: "Manjaro",
  monogram: "Ma",
  accent: "#35BFA4",
  family: "arch",
  base: "Arch Linux",
  releaseModel: "curated-rolling",
  releaseNote:
    "Rolling with its own repositories: Arch updates are held back for testing and released as curated snapshots.",
  desktops: ["kde-plasma", "gnome", "xfce"],
  tagline: "Arch's power with a guided setup.",
  summary:
    "Manjaro takes Arch Linux and adds its own curated repositories, graphical tools and hardware detection. It is easier to install than Arch and ships a working desktop, but it is still a rolling system with its own packaging decisions and a history of controversy.",
  bestFor: [
    "Newer users who want rolling software and an easy install",
    "Hardware where automatic driver detection helps",
    "People who like Arch's package selection but not its manual install",
  ],
  notIdealFor: [
    "Arch purists who want Arch repositories and exact upstream behaviour",
    "Users who need a strictly tested, conservative system",
    "Anyone who wants the largest possible support community",
  ],
  tradeoffs: [
    "Holding back packages can leave AUR builds waiting on newer libraries.",
    "The project has had security and governance incidents in the past.",
    "Community trust is smaller than Ubuntu or Mint, and answers can be inconsistent.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 3,
      rationale:
        "The installer, hardware detection and desktop choices are friendly; rolling maintenance is still on you.",
    },
    stability: {
      rating: 2,
      rationale:
        "Curated snapshots reduce churn, but this remains a rolling system with occasional breakage.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "Manjaro Hardware Detection is genuinely helpful for drivers, kernels and NVIDIA.",
    },
    "software-availability": {
      rating: 4,
      rationale:
        "Arch's package selection in curated repositories, plus the AUR through pamac.",
    },
    customization: {
      rating: 4,
      rationale:
        "Arch-level flexibility with a friendly set of tools.",
    },
    "free-software-privacy": {
      rating: 4,
      rationale:
        "No telemetry and a free-software base, with proprietary drivers as opt-ins.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam and Proton work, with easy driver installation and current Mesa.",
    },
    lightweight: {
      rating: 4,
      rationale:
        "The Xfce and KDE editions are reasonably lean.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "An active forum and wiki, though smaller than Ubuntu or Mint and historically uneven.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "Well-configured KDE, GNOME and Xfce editions.",
    },
  },
  whatToExpect: {
    installDifficulty: "moderate",
    install:
      "A graphical installer with hardware detection; pick your desktop and go.",
    maintenance:
      "Update regularly, and expect periodic AUR rebuilds and occasional manual interventions.",
    softwareInstall:
      "Pamac with AUR support on top of pacman, with Flatpak available.",
    whoWillFeelAtHome:
      "Rolling-curious users who want Arch packages without an Arch install.",
  },
  links: {
    website: "https://manjaro.org",
    download: "https://manjaro.org/download/",
    docs: "https://wiki.manjaro.org/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "Curated rolling, with caveats",
    detail:
      "Manjaro delays Arch packages and mixes in AUR software, so some AUR builds lag or break. Its history includes repository and certificate incidents — check the current status before trusting it with critical work.",
    mostRelevantTo: "everyone",
  },
};
