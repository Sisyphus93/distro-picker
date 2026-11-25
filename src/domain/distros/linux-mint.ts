import type { DistroProfile } from "../types";

export const linuxMint: DistroProfile = {
  slug: "linux-mint",
  name: "Linux Mint",
  monogram: "Mi",
  accent: "#87CF3E",
  family: "debian",
  base: "Ubuntu LTS",
  releaseModel: "lts",
  releaseNote:
    "Follows Ubuntu LTS every two years, with point releases roughly every six months and security updates for about five years.",
  desktops: ["cinnamon", "mate", "xfce"],
  tagline: "A comfortable, familiar desktop with no surprises.",
  summary:
    "Linux Mint takes Ubuntu's long-term base and replaces its packaging and desktop choices with friendlier ones: Cinnamon by default, no Snap, and a classic menu-and-panel layout. It is the most commonly recommended first Linux for people coming from Windows.",
  bestFor: [
    "Windows converts who want a familiar layout",
    "Older-but-capable machines that still need a full desktop",
    "People who want their apps a click away, without surprises",
    "Long-lived workstations and shared family computers",
  ],
  notIdealFor: [
    "Anyone who needs the newest software releases",
    "People set on a rolling-release system",
    "Users who need day-one support for brand-new GPUs",
  ],
  tradeoffs: [
    "Packages track the Ubuntu LTS base, so software is often a year or more old.",
    "Snap is not enabled by default, which can surprise users following Ubuntu guides.",
    "Cinnamon is less extensible than KDE Plasma.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 5,
      rationale:
        "Everything is pre-configured, updates are visible, and the welcome screen walks newcomers through the basics.",
    },
    stability: {
      rating: 4,
      rationale:
        "Built on Ubuntu LTS with conservative updates, so surprises are rare.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "The Driver Manager offers one-click NVIDIA and Wi-Fi drivers, and Hardware Enablement kernels cover most new hardware.",
    },
    "software-availability": {
      rating: 4,
      rationale:
        "Ubuntu's large apt archives plus Flatpak cover mainstream needs; Snap is intentionally left out.",
    },
    customization: {
      rating: 4,
      rationale:
        "Three desktop editions plus themes, applets and desklets make it easy to shape the look.",
    },
    "free-software-privacy": {
      rating: 4,
      rationale:
        "No telemetry and no Snap Store tie-in; proprietary codecs and drivers are optional installs.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam and Proton are a couple of clicks away, with slightly older kernels and Mesa than gaming-first distros.",
    },
    lightweight: {
      rating: 4,
      rationale:
        "Cinnamon is moderate, and the Xfce edition runs comfortably on 2–4 GB of RAM.",
    },
    "community-support": {
      rating: 5,
      rationale:
        "A very large, friendly forum community with clear documentation and a long-standing beginner reputation.",
    },
    "desktop-experience": {
      rating: 5,
      rationale:
        "Cinnamon is one of the most polished and familiar default desktops in Linux.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "A clear graphical installer with a well-explained partition step and an option to keep an existing system.",
    maintenance:
      "Point releases arrive roughly every six months; update from the tray and upgrade major versions in place.",
    softwareInstall:
      "The Software Manager installs apps in a click, apt handles the rest, and Flatpak can be added from the store.",
    whoWillFeelAtHome:
      "Windows switchers, families sharing a machine, and anyone who wants a quiet, well-tested desktop.",
  },
  links: {
    website: "https://linuxmint.com",
    download: "https://linuxmint.com/download.php",
    docs: "https://linuxmint.com/documentation.php",
  },
  lastReviewed: "2026-11-25",
};
