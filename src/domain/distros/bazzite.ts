import type { DistroProfile } from "../types";

export const bazzite: DistroProfile = {
  slug: "bazzite",
  name: "Bazzite",
  monogram: "Ba",
  accent: "#7B4BD6",
  family: "fedora",
  base: "Fedora Atomic (Silverblue/Kinoite)",
  releaseModel: "image-based",
  releaseNote:
    "Rolling atomic images built on Fedora Atomic, updated as one tested image with easy rollback.",
  desktops: ["kde-plasma", "gnome"],
  desktopNote:
    "KDE Plasma and GNOME images, plus dedicated Steam Deck, handheld and HTPC variants.",
  tagline: "A gaming-first system that updates like an app.",
  summary:
    "Bazzite is a gaming-focused, image-based distribution built on Fedora Atomic. The entire system updates as one image, Flatpaks install on top, and rollbacks are trivial — which makes it excellent for gaming handhelds, HTPCs and living-room machines, at the cost of traditional tinkering.",
  bestFor: [
    "Gamers, especially on handhelds and living-room PCs",
    "People who want console-like reliability with easy rollback",
    "NVIDIA users who want drivers built into the image",
  ],
  notIdealFor: [
    "Tinkerers who need to modify system packages freely",
    "Users who want a traditional apt or dnf system",
    "Anyone who needs to install kernel modules or deep system changes",
  ],
  tradeoffs: [
    "The immutable model blocks many traditional system modifications.",
    "Layering packages slows updates and drifts from the tested image.",
    "Proprietary drivers and codecs are included, which free-software purists will dislike.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 3,
      rationale:
        "Installation and updates are simple, but the immutable model takes getting used to if you know normal Linux.",
    },
    stability: {
      rating: 4,
      rationale:
        "Tested images update atomically, and a bad update is a rollback away.",
    },
    "hardware-support": {
      rating: 5,
      rationale:
        "Drivers, firmware, HDR and handheld-specific hardware support are baked in, including dedicated NVIDIA images.",
    },
    "software-availability": {
      rating: 3,
      rationale:
        "Flatpak covers desktop apps; layering packages is possible but constrained.",
    },
    customization: {
      rating: 2,
      rationale:
        "You can theme the desktop and use containers, but the base image is locked down.",
    },
    "free-software-privacy": {
      rating: 3,
      rationale:
        "Includes proprietary drivers and codecs by design; there is no telemetry.",
    },
    gaming: {
      rating: 5,
      rationale:
        "Built for gaming: Proton, Gamescope, HDR, controller support and handheld tuning.",
    },
    lightweight: {
      rating: 3,
      rationale:
        "A full desktop image with gaming extras; handheld editions are tuned for efficiency.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "An active Discord, good documentation and a fast-moving community, though young.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "KDE or GNOME images are well configured, with console-like modes available.",
    },
  },
  whatToExpect: {
    installDifficulty: "moderate",
    install:
      "A simple installer, then a rebase onto the right image for your hardware (desktop, Deck or handheld).",
    maintenance:
      "System updates arrive as images and are staged; rebase or roll back with one command.",
    softwareInstall:
      "Flatpak and Flathub first, with Distrobox or containers for anything else.",
    whoWillFeelAtHome:
      "Gamers and handheld owners who want a console-like, low-maintenance Linux.",
  },
  links: {
    website: "https://bazzite.gg",
    download: "https://bazzite.gg/#download",
    docs: "https://docs.bazzite.gg/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "Immutable by design",
    detail:
      "The base system is read-only. Software comes from Flatpak or containers, and system changes are layered on top. Traditional package tweaking and kernel modules are deliberately awkward.",
    mostRelevantTo: "everyone",
  },
};
