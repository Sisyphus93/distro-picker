import type { DistroProfile } from "../types";

export const ubuntu: DistroProfile = {
  slug: "ubuntu",
  name: "Ubuntu",
  monogram: "Ub",
  accent: "#E95420",
  family: "debian",
  base: "Debian (Ubuntu archive)",
  releaseModel: "lts",
  releaseNote:
    "LTS releases every two years with five years of standard support; interim releases every six months.",
  desktops: ["gnome"],
  tagline: "The safest first step into Linux.",
  summary:
    "Ubuntu is the most widely used desktop Linux distribution and the one most guides, hardware vendors and tutorials assume. It pairs a tested Debian-derived base with a polished GNOME desktop and Canonical's commercial support.",
  bestFor: [
    "First-time Linux users who want the widest safety net of guides",
    "Laptops and desktops where hardware should work without argument",
    "People who want a predictable long-term base for work",
    "Gaming setups that follow mainstream tutorials",
  ],
  notIdealFor: [
    "Anyone who wants a fully free-software system",
    "Tinkerers who dislike Snap packaging or opinionated defaults",
    "Very old machines that need a genuinely light desktop",
  ],
  tradeoffs: [
    "Snap packaging can feel slower and less transparent than native packages.",
    "GNOME and Ubuntu's customisations are opinionated and not everyone's taste.",
    "Interim releases only receive nine months of support.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 5,
      rationale:
        "Installer, hardware detection and documentation are built for people who have never installed an operating system.",
    },
    stability: {
      rating: 4,
      rationale:
        "LTS releases are supported for five years, though the occasional point-update regression still happens.",
    },
    "hardware-support": {
      rating: 5,
      rationale:
        "Ubuntu is tested on more laptops than any other distro; NVIDIA drivers and Secure Boot work through the standard installer.",
    },
    "software-availability": {
      rating: 5,
      rationale:
        "Huge apt archives plus Snap, Flatpak and PPAs cover almost everything, including proprietary apps.",
    },
    customization: {
      rating: 3,
      rationale:
        "GNOME can be themed and rearranged with extensions, but Ubuntu's take is deliberately opinionated.",
    },
    "free-software-privacy": {
      rating: 3,
      rationale:
        "Mostly free software, but the Snap Store, some drivers and some bundled apps are proprietary.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam and Proton work well, and most Linux gaming guides target Ubuntu first.",
    },
    lightweight: {
      rating: 3,
      rationale:
        "A full GNOME desktop with snaps is comfortable with 8 GB of RAM, not on very old hardware.",
    },
    "community-support": {
      rating: 5,
      rationale:
        "The largest community in Linux: official docs, Ask Ubuntu, forums and paid support.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "Coherent, polished GNOME experience, though some users dislike its defaults.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "A guided graphical installer, usually finished in 15–20 minutes, with options to fetch drivers and codecs during setup.",
    maintenance:
      "Install once and update through the Software Updater; LTS versions need a major upgrade every two to five years.",
    softwareInstall:
      "Ubuntu Software (Snap) and the apt command line, with Flatpak available after a short setup.",
    whoWillFeelAtHome:
      "First-time users, office and student machines, and anyone who wants the largest safety net of guides.",
  },
  links: {
    website: "https://ubuntu.com",
    download: "https://ubuntu.com/download/desktop",
    docs: "https://help.ubuntu.com",
  },
  lastReviewed: "2026-11-25",
};
