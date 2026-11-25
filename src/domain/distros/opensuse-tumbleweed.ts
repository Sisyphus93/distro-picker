import type { DistroProfile } from "../types";

export const opensuseTumbleweed: DistroProfile = {
  slug: "opensuse-tumbleweed",
  name: "openSUSE Tumbleweed",
  monogram: "Tw",
  accent: "#73BA25",
  family: "opensuse",
  base: "Upstream (openSUSE project)",
  releaseModel: "rolling",
  releaseNote:
    "Continuous snapshots, each tested by openQA before release; no version upgrades.",
  desktops: ["kde-plasma", "gnome"],
  tagline: "A rolling release with a safety net.",
  summary:
    "openSUSE Tumbleweed is a rolling distribution whose snapshots are automatically tested by openQA before they ship. Btrfs snapshots and snapper let you roll back a bad update, and YaST gives you a graphical control panel for most system settings.",
  bestFor: [
    "KDE Plasma fans who want current software",
    "People who like rolling releases but want rollback safety",
    "Anyone who values graphical system administration through YaST",
  ],
  notIdealFor: [
    "People who want to update rarely",
    "Newcomers who prefer a static, unchanging system",
    "Minimum-footprint installs",
  ],
  tradeoffs: [
    "Snapshots arrive often; skipping updates for long stretches can make the next one large.",
    "Some codecs and drivers come from additional repositories such as Packman and the NVIDIA repository.",
    "The default install is fairly complete, so it is not the slimmest option.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 3,
      rationale:
        "YaST and the installer are friendly, but rolling maintenance and repository choices assume some Linux literacy.",
    },
    stability: {
      rating: 2,
      rationale:
        "Each snapshot is tested, yet the stream of changes means frequent updates and occasional regressions.",
    },
    "hardware-support": {
      rating: 4,
      rationale:
        "Current kernels, Mesa and firmware packages cover new hardware, and NVIDIA has an official repository.",
    },
    "software-availability": {
      rating: 5,
      rationale:
        "The OSS repository, Packman, the Open Build Service and Flatpak give access to almost everything.",
    },
    customization: {
      rating: 4,
      rationale:
        "Any desktop you like, plus deep YaST control and a powerful package manager.",
    },
    "free-software-privacy": {
      rating: 4,
      rationale:
        "Free-software-first defaults with no telemetry; proprietary codecs are opt-in extras.",
    },
    gaming: {
      rating: 3,
      rationale:
        "Steam and Proton work and Mesa is current, but NVIDIA and Wayland combinations occasionally need care.",
    },
    lightweight: {
      rating: 3,
      rationale:
        "The default KDE install is complete rather than minimal.",
    },
    "community-support": {
      rating: 3,
      rationale:
        "Excellent official documentation, wiki and forums, with a somewhat smaller English-speaking community.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "KDE Plasma is the flagship and receives careful attention; GNOME is equally well packaged.",
    },
  },
  whatToExpect: {
    installDifficulty: "straightforward",
    install:
      "A graphical installer with clear summary screens; partitioning defaults to btrfs with snapshots enabled.",
    maintenance:
      "Update frequently and use snapper to roll back if a snapshot misbehaves.",
    softwareInstall:
      "zypper and YaST on the command line or GUI, plus Flatpak and Open Build Service repositories.",
    whoWillFeelAtHome:
      "Experienced desktop users, especially KDE fans who want rolling software with rollback.",
  },
  links: {
    website: "https://www.opensuse.org/",
    download: "https://get.opensuse.org/tumbleweed/",
    docs: "https://doc.opensuse.org/",
  },
  lastReviewed: "2026-11-25",
  caveat: {
    headline: "Updates are a habit, not an event",
    detail:
      "Tumbleweed expects regular updates. Snapshot rollbacks protect you from most breakage, but this is not a set-and-forget system.",
    mostRelevantTo: "newcomers",
  },
};
