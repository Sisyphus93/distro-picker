import type { DistroProfile } from "../types";

export const fedoraWorkstation: DistroProfile = {
  slug: "fedora-workstation",
  name: "Fedora Workstation",
  monogram: "Fe",
  accent: "#294172",
  family: "fedora",
  base: "Upstream (Fedora project)",
  releaseModel: "point-release",
  releaseNote:
    "A new version roughly every six months, with 13 months of support for each release.",
  desktops: ["gnome"],
  tagline: "New Linux technology, upstream and well tested.",
  summary:
    "Fedora Workstation is the reference desktop for a lot of modern Linux: the latest GNOME, Wayland by default, current kernels and toolchains. It stays close to upstream and ships only free software by default, leaving codecs and NVIDIA drivers as deliberate add-ons.",
  bestFor: [
    "Developers who want current languages and toolchains",
    "Recent hardware that benefits from the newest kernels and graphics stacks",
    "People who prefer upstream GNOME and modern standards",
  ],
  notIdealFor: [
    "Beginners who expect every codec and driver to be present",
    "People who want long, quiet release cycles",
    "Anyone looking for a gaming-first setup",
  ],
  tradeoffs: [
    "13 months of support per release means upgrading every 6–12 months.",
    "Proprietary codecs and NVIDIA drivers require RPM Fusion.",
    "Free-software-first defaults leave some media and hardware needing extra setup.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 4,
      rationale:
        "The installer is clean and GNOME is well integrated, but codecs and NVIDIA still mean following a guide.",
    },
    stability: {
      rating: 3,
      rationale:
        "Releases are well tested, but the six-month cadence and current kernels keep you closer to the edge.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "Excellent support for new hardware and Secure Boot; NVIDIA requires the RPM Fusion driver.",
    },
    "software-availability": {
      rating: 4,
      rationale:
        "Large repositories, first-class Flatpak support and COPR, with proprietary apps from Flathub.",
    },
    customization: {
      rating: 3,
      rationale:
        "Stock GNOME with limited default theming; spins and remixes cover other desktops.",
    },
    "free-software-privacy": {
      rating: 4,
      rationale:
        "Free software only by default with no telemetry in Workstation, and clear opt-ins for anything proprietary.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam via Flathub or RPM Fusion and current Mesa make it a strong gaming base, with occasional codec gaps.",
    },
    lightweight: {
      rating: 3,
      rationale:
        "GNOME and a full workstation load suit 8 GB of RAM and up.",
    },
    "community-support": {
      rating: 4,
      rationale:
        "Excellent documentation, active forums and an upstream-first culture; help is technical rather than hand-holding.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "Clean, consistent GNOME with the latest Wayland improvements.",
    },
  },
  whatToExpect: {
    installDifficulty: "moderate",
    install:
      "A straightforward installer, followed by a short post-install step for codecs and NVIDIA drivers.",
    maintenance:
      "Update often, and upgrade to the next release every 6–12 months with a terminal-assisted upgrade.",
    softwareInstall:
      "GNOME Software with Flatpak, dnf on the command line, and RPM Fusion for extras.",
    whoWillFeelAtHome:
      "Developers, early adopters and people who like their desktop close to upstream Linux.",
  },
  links: {
    website: "https://fedoraproject.org/workstation/",
    download: "https://fedoraproject.org/workstation/download/",
    docs: "https://docs.fedoraproject.org/",
  },
  lastReviewed: "2026-11-25",
};
