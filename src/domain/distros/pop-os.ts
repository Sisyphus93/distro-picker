import type { DistroProfile } from "../types";

export const popOs: DistroProfile = {
  slug: "pop-os",
  name: "Pop!_OS",
  monogram: "Po",
  accent: "#48B9C7",
  family: "debian",
  base: "Ubuntu LTS",
  releaseModel: "lts",
  releaseNote:
    "Built on Ubuntu LTS releases; System76 publishes version upgrades on its own schedule rather than Ubuntu's.",
  desktops: ["cosmic"],
  desktopNote:
    "Earlier releases shipped GNOME with Pop Shell tiling; current releases use COSMIC, System76's own desktop.",
  tagline: "A focused, tiling-friendly desktop for people who make things.",
  summary:
    "Pop!_OS is System76's Ubuntu-based distribution, tuned for developers, creators and gamers. Its installer asks what you plan to do and sets the machine up accordingly, and recent releases introduce COSMIC, System76's own desktop with strong tiling and keyboard navigation.",
  bestFor: [
    "Developers and makers who like tiling windows",
    "System76 hardware, or any machine where NVIDIA should be handled up front",
    "Gamers who want a clean Ubuntu base without Snap-first defaults",
  ],
  notIdealFor: [
    "People who need mature, heavily documented desktop behaviour",
    "Users who want the largest possible troubleshooting community",
    "Anyone who prefers a traditional floating-window desktop",
  ],
  tradeoffs: [
    "COSMIC is young compared with GNOME and KDE Plasma.",
    "Ubuntu-specific guides do not always match Pop!_OS's defaults.",
    "Version upgrades arrive on System76's schedule, not Ubuntu's.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 4,
      rationale:
        "The installer is excellent and picks drivers for you, but COSMIC's workflow is a change if you expect a Windows-style panel.",
    },
    stability: {
      rating: 4,
      rationale:
        "Ubuntu LTS base with tracked upgrades; hybrid-graphics laptops occasionally see regressions.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "NVIDIA and hybrid graphics are handled at install time and System76 hardware is tuned — other laptops vary.",
    },
    "software-availability": {
      rating: 4,
      rationale:
        "Ubuntu archives, Flatpak and the Pop!_Shop in one place; Snap support exists but is not pushed.",
    },
    customization: {
      rating: 4,
      rationale:
        "COSMIC is configurable and tiling-first, though its theming ecosystem is younger than KDE's.",
    },
    "free-software-privacy": {
      rating: 4,
      rationale:
        "No telemetry and free-software-first defaults, with proprietary drivers and codecs as opt-ins.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam, Proton and GPU drivers work well, and System76 sells gaming machines with it pre-installed.",
    },
    lightweight: {
      rating: 3,
      rationale:
        "Modern GNOME and COSMIC desktops prefer 8 GB of RAM or more.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "Helpful support channels and System76's knowledge base, but a smaller community than Ubuntu or Mint.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "COSMIC is polished and fast with excellent tiling, though still maturing.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "The installer asks whether to customise for work or gaming and installs the matching toolset.",
    maintenance:
      "Regular updates plus in-place version upgrades; a recovery partition makes rollbacks easier.",
    softwareInstall:
      "The Pop!_Shop in one place, with apt and Flathub behind it.",
    whoWillFeelAtHome:
      "Developers, students on System76 machines, and gamers who want Ubuntu without Snap friction.",
  },
  links: {
    website: "https://pop.system76.com",
    download: "https://system76.com/pop/download",
    docs: "https://support.system76.com/articles/pop-os/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "A young desktop",
    detail:
      "COSMIC is newer than GNOME or KDE, so some apps and settings may still feel unfinished. Expect occasional rough edges while it matures.",
    mostRelevantTo: "newcomers",
  },
};
