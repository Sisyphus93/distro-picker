import type { DistroProfile } from "../types";

export const linuxLite: DistroProfile = {
  slug: "linux-lite",
  name: "Linux Lite",
  monogram: "LL",
  accent: "#8CC63F",
  family: "debian",
  base: "Ubuntu LTS",
  releaseModel: "lts",
  releaseNote:
    "Follows Ubuntu LTS releases, with security updates for about five years.",
  desktops: ["xfce"],
  tagline: "A light, straightforward desktop for everyday computing.",
  summary:
    "Linux Lite is an Ubuntu LTS-based distribution with a customised Xfce desktop, aimed at people moving from Windows and running modest hardware. It focuses on a small, familiar set of tools rather than breadth.",
  bestFor: [
    "Older or low-spec computers",
    "Windows users who want a light, familiar desktop",
    "Simple everyday browsing, email and documents",
  ],
  notIdealFor: [
    "Gamers or users needing current graphics stacks",
    "Developers who need large toolchains",
    "People who want a large, active community",
  ],
  tradeoffs: [
    "The Xfce desktop is functional rather than modern.",
    "The Ubuntu LTS base means older packages.",
    "The community and project are small compared with Mint or Ubuntu.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 5,
      rationale:
        "Everything is set up for everyday use, with a welcome screen that explains the basics.",
    },
    stability: {
      rating: 4,
      rationale: "Ubuntu LTS base plus conservative updates.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "Good on older machines, with a driver tool for NVIDIA and Wi-Fi.",
    },
    "software-availability": {
      rating: 3,
      rationale:
        "Ubuntu repositories plus Lite Software and Flatpak, with a small curated catalogue.",
    },
    customization: {
      rating: 3,
      rationale:
        "Xfce is tweakable; the distro's own tools stay limited by design.",
    },
    "free-software-privacy": {
      rating: 3,
      rationale:
        "No telemetry, though proprietary codecs and apps are included for convenience.",
    },
    gaming: {
      rating: 2,
      rationale:
        "Steam can be installed, but older kernels and Mesa limit modern gaming.",
    },
    lightweight: {
      rating: 5,
      rationale:
        "Runs comfortably on 2 GB of RAM and modest CPUs.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "A small but friendly forum and a detailed manual.",
    },
    "desktop-experience": {
      rating: 3,
      rationale:
        "A familiar, functional Xfce layout without much polish.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "A simple graphical installer with clear steps and an option to keep an existing OS.",
    maintenance:
      "Updates through the Software Updater and Lite Tweaks, with major upgrades every two years.",
    softwareInstall:
      "Lite Software, apt and optional Flatpak.",
    whoWillFeelAtHome:
      "People reviving older laptops for everyday tasks.",
  },
  links: {
    website: "https://www.linuxliteos.com",
    download: "https://www.linuxliteos.com/download.html",
    docs: "https://www.linuxliteos.com/manual/",
  },
  lastReviewed: "2026-11-25",
};
