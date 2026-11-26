import type { DistroProfile } from "../types";

export const elementaryOs: DistroProfile = {
  slug: "elementary-os",
  name: "elementary OS",
  monogram: "El",
  accent: "#3689E6",
  family: "debian",
  base: "Ubuntu LTS",
  releaseModel: "lts",
  releaseNote:
    "Major versions follow Ubuntu LTS releases, with security updates for roughly five years.",
  desktops: ["pantheon"],
  tagline: "A considered desktop that stays out of your way.",
  summary:
    "elementary OS pairs an Ubuntu LTS base with Pantheon, a carefully designed desktop, and its own curated app store. It is opinionated and polished, with a strong design philosophy that trades flexibility for consistency.",
  bestFor: [
    "People who value a beautiful, consistent desktop",
    "Design-minded users who want a curated app experience",
    "Anyone who prefers a macOS-like workflow",
  ],
  notIdealFor: [
    "Gamers or users who need the latest packages",
    "Tinkerers who want to change everything",
    "People who depend on software outside its curated store",
  ],
  tradeoffs: [
    "The curated AppCenter means fewer apps are available by default.",
    "Pantheon is hard to customise beyond its design language.",
    "The Ubuntu LTS base means older kernels and graphics stacks.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 4,
      rationale:
        "The installer and first-run experience are extremely polished, though some hardware setup still needs terminal work.",
    },
    stability: {
      rating: 4,
      rationale: "Ubuntu LTS base with conservative updates.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "NVIDIA drivers are offered during install; very new hardware trails Ubuntu slightly.",
    },
    "software-availability": {
      rating: 2,
      rationale:
        "A small curated store plus Ubuntu repositories; many apps need Flatpak or terminal work.",
    },
    customization: {
      rating: 2,
      rationale:
        "Pantheon follows a strong design language, and deep changes fight the desktop.",
    },
    "free-software-privacy": {
      rating: 4,
      rationale:
        "No telemetry and a privacy-conscious store, though the base includes proprietary firmware.",
    },
    gaming: {
      rating: 2,
      rationale:
        "Steam works, but the older base and limited focus make it a poor gaming default.",
    },
    lightweight: {
      rating: 4,
      rationale: "Pantheon is efficient on 4 GB of RAM.",
    },
    "community-support": {
      rating: 2,
      rationale:
        "A small community with paid support options; documentation is thin outside official docs.",
    },
    "desktop-experience": {
      rating: 5,
      rationale:
        "Pantheon is one of the most cohesive desktops in Linux.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "A guided installer with encryption and NVIDIA options, followed by a polished first-run app.",
    maintenance:
      "Updates through AppCenter and system updates, with major upgrades every two years.",
    softwareInstall:
      "AppCenter (Flatpak-based, pay-what-you-want) plus apt for the rest.",
    whoWillFeelAtHome:
      "Design-conscious users who want a calm, coherent desktop and do not mind a smaller app catalogue.",
  },
  links: {
    website: "https://elementary.io",
    download: "https://elementary.io/#download",
    docs: "https://docs.elementary.io/",
  },
  lastReviewed: "2026-11-25",
};
