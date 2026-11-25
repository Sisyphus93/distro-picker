import type { DistroProfile } from "../types";

export const nobara: DistroProfile = {
  slug: "nobara",
  name: "Nobara",
  monogram: "No",
  accent: "#C72127",
  family: "fedora",
  base: "Fedora",
  releaseModel: "point-release",
  releaseNote:
    "Follows Fedora releases, with additional fixes, kernels and gaming packages layered on top.",
  desktops: ["kde-plasma", "gnome"],
  desktopNote:
    "KDE Plasma is the primary edition; a GNOME edition and a Steam Deck/handheld image also exist.",
  tagline: "Fedora tuned for gaming, drivers and media.",
  summary:
    "Nobara is a Fedora remix from the maintainer behind Proton-GE, preconfigured with codecs, drivers, gaming tools and a patched kernel. It aims to remove Fedora's post-install chores for gamers and content creators.",
  bestFor: [
    "Gamers who want Fedora with the extras preinstalled",
    "NVIDIA users who want drivers working out of the box",
    "People who need media codecs without hunting them down",
  ],
  notIdealFor: [
    "Anyone who needs a large, well-documented community",
    "Users who want a minimal, fully free system",
    "People who need enterprise-grade support",
  ],
  tradeoffs: [
    "Custom kernels and patches can lag behind Fedora updates.",
    "The community is small and support is concentrated in chat channels.",
    "Proprietary drivers and codecs ship by default.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 3,
      rationale:
        "Installation is easy, but the custom stack means troubleshooting guides rarely match exactly.",
    },
    stability: {
      rating: 3,
      rationale:
        "Fedora's base is solid; the extra patches and kernels make updates less predictable.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "NVIDIA drivers, codecs and gaming hardware support come preinstalled, though the newest hardware occasionally lands later.",
    },
    "software-availability": {
      rating: 4,
      rationale:
        "Fedora repositories with RPM Fusion enabled, plus Flatpak.",
    },
    customization: {
      rating: 3,
      rationale:
        "KDE or GNOME editions with limited remix breadth.",
    },
    "free-software-privacy": {
      rating: 3,
      rationale:
        "Proprietary drivers and codecs are the point; there is no telemetry, but the stance is pragmatic.",
    },
    gaming: {
      rating: 5,
      rationale:
        "Gaming tweaks, drivers, Proton tooling and codecs are configured for you.",
    },
    lightweight: {
      rating: 3,
      rationale:
        "A full KDE desktop with extras; it is not aimed at low-spec machines.",
    },
    "community-support": {
      rating: 2,
      rationale:
        "A small community, Discord-centric support and a single primary maintainer.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "KDE Plasma configured with gaming-friendly defaults.",
    },
  },
  whatToExpect: {
    installDifficulty: "moderate",
    install:
      "A graphical installer with NVIDIA and codec options preselected.",
    maintenance:
      "Regular Fedora updates plus Nobara's own packages; expect occasional manual fixes.",
    softwareInstall:
      "dnf and the KDE or GNOME software centres, with Flathub enabled.",
    whoWillFeelAtHome:
      "Gamers who want Fedora's base without the setup work and are comfortable with a smaller project.",
  },
  links: {
    website: "https://nobaraproject.org",
    download: "https://nobaraproject.org/download-nobara/",
    docs: "https://wiki.nobaraproject.org/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "Small team, custom stack",
    detail:
      "Nobara is maintained by a very small team and ships its own kernels and patches. Delays after Fedora releases and occasional update rough edges are part of the experience.",
    mostRelevantTo: "everyone",
  },
};
