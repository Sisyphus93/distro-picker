import type { DistroProfile } from "../types";

export const archLinux: DistroProfile = {
  slug: "arch-linux",
  name: "Arch Linux",
  monogram: "Ar",
  accent: "#1793D1",
  family: "arch",
  base: "Upstream (Arch Linux project)",
  releaseModel: "rolling",
  releaseNote:
    "Rolling: packages follow upstream closely, with no releases and no version upgrades.",
  desktops: [],
  desktopNote:
    "No default desktop — you choose during installation (archinstall offers GNOME, KDE Plasma, Xfce and others), or build your own.",
  tagline: "You build it. You understand it.",
  summary:
    "Arch Linux is a minimal, rolling distribution that installs only what you ask for, backed by the Arch Wiki and the AUR. It gives you complete control and very current software — and expects you to read, understand and maintain your own system.",
  bestFor: [
    "Experienced users who want a minimal, self-built system",
    "People who want the AUR's enormous package selection",
    "Anyone who values the Arch Wiki and learning how Linux fits together",
  ],
  notIdealFor: [
    "First-time Linux users",
    "Machines that must not break on a Tuesday",
    "Anyone who wants a supported, hands-off desktop",
  ],
  tradeoffs: [
    "Installation and maintenance are manual by design.",
    "Rolling updates occasionally require reading the news before upgrading.",
    "There is no official desktop or default application set.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 1,
      rationale:
        "There is no default desktop, no guided post-install and no support promise; the wiki is your installer.",
    },
    stability: {
      rating: 2,
      rationale:
        "Packages are current and generally sane, but upstream breakage happens and you fix it.",
    },
    "hardware-support": {
      rating: 3,
      rationale:
        "Latest kernels and Mesa help with new hardware, but drivers, firmware and NVIDIA setup are manual.",
    },
    "software-availability": {
      rating: 5,
      rationale:
        "The official repositories plus the AUR cover almost any package, however obscure.",
    },
    customization: {
      rating: 5,
      rationale:
        "You choose the bootloader, desktop, services and every package.",
    },
    "free-software-privacy": {
      rating: 5,
      rationale:
        "Nothing is installed unless you ask for it, with no telemetry and no proprietary components by default.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam, Proton and current Mesa are available and perform well once set up.",
    },
    lightweight: {
      rating: 5,
      rationale:
        "A minimal install can run in a few hundred megabytes of RAM.",
    },
    "community-support": {
      rating: 4,
      rationale:
        "The Arch Wiki is arguably the best Linux documentation there is; community support assumes effort on your side.",
    },
    "desktop-experience": {
      rating: 2,
      rationale: "There is no desktop until you build one.",
    },
  },
  whatToExpect: {
    installDifficulty: "involved",
    install:
      "Boot the ISO and follow the wiki, or use archinstall for a guided base install; expect to partition and configure by hand.",
    maintenance:
      "Update frequently, check the Arch news feed before large upgrades, and expect to resolve occasional package conflicts.",
    softwareInstall:
      "pacman, plus an AUR helper such as paru or yay, plus Flatpak if you want it.",
    whoWillFeelAtHome:
      "Experienced Linux users who enjoy understanding and maintaining their own system.",
  },
  links: {
    website: "https://archlinux.org",
    download: "https://archlinux.org/download/",
    docs: "https://wiki.archlinux.org/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "Not a first distro",
    detail:
      "Arch is a do-it-yourself system: you choose and configure nearly everything, and you are your own support line. Updates can require manual intervention, and nothing is tested for you.",
    mostRelevantTo: "newcomers",
  },
};
