import type { DistroProfile } from "../types";

export const nixos: DistroProfile = {
  slug: "nixos",
  name: "NixOS",
  monogram: "Ni",
  accent: "#5277C3",
  family: "independent",
  base: "Upstream (NixOS project)",
  releaseModel: "point-release",
  releaseNote:
    "Stable releases roughly every six months, supported for about seven months, plus a rolling unstable branch.",
  desktops: [],
  desktopNote:
    "No default desktop — you declare GNOME, KDE Plasma, Xfce or a window manager in configuration.nix.",
  tagline: "Your whole system, written down.",
  summary:
    "NixOS builds the entire system from a declarative configuration using the Nix package manager. Every change is reproducible and rollable-back, which makes it uniquely powerful for developers and homelabs — and uniquely demanding for newcomers.",
  bestFor: [
    "Developers who want reproducible environments",
    "People running homelabs or fleets of machines",
    "Users who value atomic upgrades and rollbacks above all",
  ],
  notIdealFor: [
    "First-time Linux users",
    "People who want to install software by following ordinary guides",
    "Machines where you cannot afford to learn a new configuration language",
  ],
  tradeoffs: [
    "The Nix language and configuration model take real time to learn.",
    "Some proprietary or unusual software needs packaging work.",
    "Documentation is extensive but scattered and often assumes prior knowledge.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 1,
      rationale:
        "Nothing is configured through a GUI; you edit configuration files and rebuild the system.",
    },
    stability: {
      rating: 4,
      rationale:
        "Stable channels are conservative, and every generation can be rolled back at boot.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "Hardware support is good and declarative once configured, though NVIDIA requires specific options.",
    },
    "software-availability": {
      rating: 5,
      rationale:
        "nixpkgs is one of the largest package collections in existence, with isolated development environments.",
    },
    customization: {
      rating: 5,
      rationale:
        "Essentially every part of the system is expressed in configuration.",
    },
    "free-software-privacy": {
      rating: 4,
      rationale:
        "Free-software-first defaults with no telemetry; proprietary packages are opt-in.",
    },
    gaming: {
      rating: 3,
      rationale:
        "Steam and Proton are available declaratively, but gaming needs configuration.",
    },
    lightweight: {
      rating: 4,
      rationale:
        "A minimal system is small, though the Nix store grows quickly.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "A large, knowledgeable community and excellent manuals, but help assumes you are learning Nix.",
    },
    "desktop-experience": {
      rating: 2,
      rationale:
        "The desktop is whatever you declare and configure.",
    },
  },
  whatToExpect: {
    installDifficulty: "involved",
    install:
      "The graphical or terminal installer sets up a basic system; then you write configuration.nix and rebuild.",
    maintenance:
      "Edit the configuration, rebuild and switch; roll back to any previous generation from the boot menu.",
    softwareInstall:
      "Declare packages in configuration.nix, use nix-shell for temporary environments, or install Flatpaks.",
    whoWillFeelAtHome:
      "Developers, homelabbers and anyone who wants their system defined as code.",
  },
  links: {
    website: "https://nixos.org",
    download: "https://nixos.org/download/",
    docs: "https://nixos.org/manual/nixos/stable/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "A different way to run Linux",
    detail:
      "Nearly everything is configured in one file using the Nix language. That is powerful once learned, but most tutorials, PPA-style installs and habits from other distros do not apply.",
    mostRelevantTo: "newcomers",
  },
};
