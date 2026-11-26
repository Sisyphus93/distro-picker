import type { DistroProfile } from "../types";

export const endeavouros: DistroProfile = {
  slug: "endeavouros",
  name: "EndeavourOS",
  monogram: "En",
  accent: "#7F3FBF",
  family: "arch",
  base: "Arch Linux",
  releaseModel: "rolling",
  releaseNote:
    "Rolling, following Arch's repositories with a small, friendly set of defaults and tools.",
  desktops: ["kde-plasma"],
  desktopNote:
    "KDE Plasma is the default; the installer also offers GNOME, Xfce and window-manager setups.",
  tagline: "Arch, with a front door.",
  summary:
    "EndeavourOS is Arch Linux with a graphical installer, sensible defaults and a welcoming community. It keeps Arch's rolling packages and AUR access while removing the most painful part of setup, though maintenance still expects Arch literacy.",
  bestFor: [
    "People curious about Arch who want a working desktop first",
    "KDE Plasma users who like rolling releases",
    "Experienced users who want AUR access with fewer manual steps",
  ],
  notIdealFor: [
    "Complete beginners",
    "Anyone who wants a support contract or hand-holding",
    "Machines that cannot tolerate occasional rolling-release surprises",
  ],
  tradeoffs: [
    "Rolling updates still require attention and occasional manual fixes.",
    "The community is small; the Arch Wiki is the real manual.",
    "Fewer custom tools than Manjaro or a fully hand-built Arch setup.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 2,
      rationale:
        "The installer gets you to a working desktop in minutes, but day-to-day maintenance assumes you know Arch.",
    },
    stability: {
      rating: 2,
      rationale:
        "Arch packages with a light layer of defaults; breakage is rare but possible and yours to fix.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "Current kernels, Mesa and firmware; NVIDIA can be installed during setup with the included helper.",
    },
    "software-availability": {
      rating: 5,
      rationale:
        "Arch repositories and the AUR, with pamac or yay ready to use.",
    },
    customization: {
      rating: 5,
      rationale:
        "Arch-level control, with a modest set of EndeavourOS tools you can ignore.",
    },
    "free-software-privacy": {
      rating: 5,
      rationale:
        "A free-software base with no telemetry; proprietary extras are opt-in.",
    },
    gaming: {
      rating: 4,
      rationale:
        "Steam, Proton and current graphics stacks work well after a straightforward setup.",
    },
    lightweight: {
      rating: 4,
      rationale:
        "A minimal KDE install with few extras; lighter desktops are one installer option away.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "A small but genuinely helpful forum and wiki; Arch resources fill the gaps.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "KDE Plasma is preconfigured thoughtfully, with other desktops one installer option away.",
    },
  },
  whatToExpect: {
    installDifficulty: "moderate",
    install:
      "Boot the live environment and use the graphical installer; choose your desktop and let it install.",
    maintenance:
      "Frequent updates; check Arch news before major upgrades and be ready to troubleshoot.",
    softwareInstall:
      "pacman, plus yay or pamac for the AUR, with Flatpak available.",
    whoWillFeelAtHome:
      "Experienced users stepping toward Arch who want a working desktop from the start.",
  },
  links: {
    website: "https://endeavouros.com",
    download: "https://endeavouros.com/#download",
    docs: "https://discovery.endeavouros.com/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "Arch underneath",
    detail:
      "The installer is friendly, but this is still a rolling Arch system: you update often and resolve issues yourself. It is not a beginner distro in disguise.",
    mostRelevantTo: "newcomers",
  },
};
