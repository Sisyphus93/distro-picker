import type { DistroProfile } from "../types";

export const debian: DistroProfile = {
  slug: "debian",
  name: "Debian",
  monogram: "De",
  accent: "#A80030",
  family: "debian",
  base: "Upstream project",
  releaseModel: "point-release",
  releaseNote:
    "A new stable release roughly every two years, with about five years of security support via Debian LTS.",
  desktops: ["gnome"],
  desktopNote:
    "GNOME is the default; the installer offers many other desktops, and a netinst image lets you start minimal.",
  tagline: "The universal operating system, built to last.",
  summary:
    "Debian is a volunteer-built distribution with one of the largest free-software archives in existence. Its stable release changes slowly and predictably, which makes it a dependable base for servers, workstations and the many distributions built on top of it.",
  bestFor: [
    "People who want a rock-solid, long-lived system",
    "Free-software-minded users (the default install is 100% free)",
    "Servers and workstations where predictability beats novelty",
  ],
  notIdealFor: [
    "Anyone who needs the newest kernels, drivers or apps",
    "Newcomers who want hand-holding on codecs and hardware",
    "Gamers chasing the latest GPU features",
  ],
  tradeoffs: [
    "Stable software can be years behind current releases.",
    "NVIDIA drivers and some media codecs need non-free repositories enabled.",
    "Volunteer support can be terse compared with commercial distributions.",
  ],
  ratings: {
    "ease-of-use": {
      rating: 3,
      rationale:
        "The installer assumes more knowledge, and post-install choices such as codecs and drivers are yours to make.",
    },
    stability: {
      rating: 5,
      rationale:
        "Stable is tested for months and supported for years; it is the benchmark for predictability.",
    },
    "hardware-support": {
      rating: 3,
      rationale:
        "Non-free firmware ships by default now, but NVIDIA and brand-new chips often need manual work or backports.",
    },
    "software-availability": {
      rating: 5,
      rationale:
        "Roughly 60,000 packages in the main archive plus contrib and non-free, with Flatpak on top.",
    },
    customization: {
      rating: 4,
      rationale:
        "You choose your desktop, services and package set; little is forced on you.",
    },
    "free-software-privacy": {
      rating: 5,
      rationale:
        "The default install is entirely free software with no telemetry.",
    },
    gaming: {
      rating: 3,
      rationale:
        "Steam works, but older kernels and Mesa limit newer titles unless you enable backports or use Flatpak.",
    },
    lightweight: {
      rating: 4,
      rationale:
        "A minimal install is tiny; the default GNOME desktop is middling.",
    },
    "community-support": {
      rating: 4,
      rationale:
        "Deep, meticulous documentation and mailing lists; answers are accurate but expect self-reliance.",
    },
    "desktop-experience": {
      rating: 4,
      rationale:
        "Standard GNOME, with many other desktops equally well supported.",
    },
  },
  whatToExpect: {
    installDifficulty: "moderate",
    install:
      "Text-based and graphical installers are both offered, with explicit partitioning and desktop choices.",
    maintenance:
      "Point releases every couple of months and a major upgrade every two years or so.",
    softwareInstall:
      "apt with Synaptic as an optional GUI, plus Flatpak for sandboxed apps.",
    whoWillFeelAtHome:
      "Sysadmins, experienced desktop users and anyone who values longevity over newness.",
  },
  links: {
    website: "https://www.debian.org",
    download: "https://www.debian.org/download",
    docs: "https://www.debian.org/doc/",
  },
  lastReviewed: "2026-11-25",
};
