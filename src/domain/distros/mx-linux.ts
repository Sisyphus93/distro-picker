import type { DistroProfile } from "../types";

export const mxLinux: DistroProfile = {
  slug: "mx-linux",
  name: "MX Linux",
  monogram: "MX",
  accent: "#1F6FB2",
  family: "debian",
  base: "Debian stable",
  releaseModel: "point-release",
  releaseNote:
    "Tracks Debian stable, adding its own tools and updates; major versions follow Debian's roughly two-year cycle.",
  desktops: ["xfce", "kde-plasma", "fluxbox"],
  tagline: "Debian stable, made friendly and light.",
  summary:
    "MX Linux sits on Debian stable and adds its own repository, MX Tools and a highly regarded Xfce setup. It is light, reliable and aimed at people who want a traditional desktop that runs well on modest hardware.",
  bestFor: [
    "Older or modest machines that still need a full desktop",
    "People who want Debian stability with friendlier tools",
    "Users who like Xfce and fine-grained control over services",
  ],
  notIdealFor: [
    "Gamers who need current GPU drivers and kernels",
    "People who want the newest applications",
    "Anyone looking for the largest beginner community",
  ],
  tradeoffs: [
    "Debian-stable software is older, especially graphics and kernels.",
    "Gaming needs Flatpak Steam and usually newer Mesa.",
    "MX's own tools and repositories add a layer to learn.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 4,
      rationale:
        "The installer and MX Tools are approachable, with unusually good documentation for newcomers.",
    },
    stability: {
      rating: 4,
      rationale:
        "Debian stable plus cautious MX updates; very few surprises.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "MX Tools includes driver and kernel helpers, and older hardware is well supported.",
    },
    "software-availability": {
      rating: 4,
      rationale:
        "Debian repositories plus the MX test repository, backports and Flatpak.",
    },
    customization: {
      rating: 4,
      rationale:
        "Services, kernels and desktops are all adjustable through MX Tools.",
    },
    "free-software-privacy": {
      rating: 5,
      rationale:
        "Free-software-first with no telemetry; firmware and codecs are clear opt-ins.",
    },
    gaming: {
      rating: 2,
      rationale:
        "Steam works, but older kernels and Mesa hold back recent titles.",
    },
    lightweight: {
      rating: 5,
      rationale:
        "The Xfce and Fluxbox editions run comfortably on 2 GB of RAM.",
    },
    "community-support": {
      rating: 4,
      rationale:
        "An active forum, a detailed manual and a long-standing reputation for helping newcomers.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "Xfce is carefully configured with a familiar panel layout; KDE and Fluxbox editions exist too.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "A graphical installer with clear options; the live session lets you test hardware first.",
    maintenance:
      "Regular updates through the MX updater, with major upgrades arriving alongside new Debian bases.",
    softwareInstall:
      "MX Package Installer, apt and Flatpak, with popular apps curated.",
    whoWillFeelAtHome:
      "People with older hardware, Debian fans who want a friendlier desktop, and Xfce users.",
  },
  links: {
    website: "https://mxlinux.org",
    download: "https://mxlinux.org/download-links/",
    docs: "https://mxlinux.org/wiki/",
  },
  lastReviewed: "2026-11-25",
};
