import type { DistroProfile } from "../types";

export const zorinOs: DistroProfile = {
  slug: "zorin-os",
  name: "Zorin OS",
  monogram: "Zo",
  accent: "#15A6F0",
  family: "debian",
  base: "Ubuntu LTS",
  releaseModel: "lts",
  releaseNote:
    "Each major version follows an Ubuntu LTS release, with security updates for roughly five years.",
  desktops: ["gnome"],
  desktopNote:
    "Zorin Desktop is a customised GNOME shell with Windows- and macOS-style layouts.",
  tagline: "A familiar desktop for people leaving Windows behind.",
  summary:
    "Zorin OS builds on Ubuntu LTS and reshapes GNOME into layouts that mirror Windows or macOS, aiming to make switching feel effortless. A free Core edition covers most needs, while a paid Pro edition adds extra layouts and app bundles.",
  bestFor: [
    "Windows users who want the layout to look and feel the same",
    "Shared family machines",
    "People who value a guided, polished first-run experience",
  ],
  notIdealFor: [
    "Users who want to customise deeply",
    "Free-software purists",
    "Gamers pushing the newest titles and GPUs",
  ],
  tradeoffs: [
    "Some extras, including additional layouts and creative apps, sit behind the paid Pro edition.",
    "The Ubuntu LTS base means older packages than rolling distributions.",
    "Heavy customisation can complicate troubleshooting that assumes stock Ubuntu.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 5,
      rationale:
        "The installer and first-run app are explicitly designed around people switching from Windows or macOS.",
    },
    stability: {
      rating: 4,
      rationale:
        "The Ubuntu LTS base and conservative updates keep things predictable.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "Driver detection covers most laptops and NVIDIA installs through standard tooling, though the newest chips can lag.",
    },
    "software-availability": {
      rating: 3,
      rationale:
        "Ubuntu repositories plus Snap and Flatpak cover mainstream needs, but some curated features push you toward Pro.",
    },
    customization: {
      rating: 3,
      rationale:
        "Layout switching is easy, but deep desktop changes fight the Zorin shell and its paid feature set.",
    },
    "free-software-privacy": {
      rating: 3,
      rationale:
        "No telemetry, but it is a commercial product with proprietary components and upgrade prompts.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam and Proton install cleanly on the Ubuntu base; performance is decent but not specially tuned.",
    },
    lightweight: {
      rating: 3,
      rationale:
        "A polished GNOME-based desktop is happiest with 8 GB of RAM.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "An official help centre and a friendly forum, but a much smaller community than Ubuntu or Mint.",
    },
    "desktop-experience": {
      rating: 5,
      rationale:
        "One of the most coherent, deliberately familiar desktops available.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "A graphical installer with guided partitioning, typically finished in about 20 minutes.",
    maintenance:
      "Updates arrive through the software updater; major version upgrades land every two years.",
    softwareInstall:
      "Zorin's software store plus apt, with both Flatpak and Snap supported.",
    whoWillFeelAtHome:
      "Windows and macOS converts who want a polished, familiar desktop and do not plan to tinker.",
  },
  links: {
    website: "https://zorin.com/os/",
    download: "https://zorin.com/os/download/",
    docs: "https://help.zorin.com",
  },
  lastReviewed: "2026-11-25",
};
