import { notSureOption, target, type QuizFlow } from "./types";

/**
 * Experienced flow: direct technical preferences.
 *
 * Package-manager and desktop answers are mapped through the qualities they
 * imply (breadth, tinkering, resource use) because the shared dimension model
 * describes qualities, not brands or tools.
 */
export const EXPERIENCED_QUIZ: QuizFlow = {
  audience: "experienced",
  title: "Find a distro that fits how you work.",
  intro:
    "Seven direct questions about workloads, release models and workflows. Answer honestly — the recommendation is only as good as the preferences behind it.",
  questions: [
    {
      id: "experienced-workload",
      dimension: "software-availability",
      prompt: "What is your primary workload?",
      allowNotSure: true,
      options: [
        {
          id: "development",
          kind: "preference",
          label: "Software development, containers and virtual machines",
          targets: [
            target("software-availability", 5, 2),
            target("stability", 3, 2),
          ],
        },
        {
          id: "gaming",
          kind: "preference",
          label: "Gaming and modern GPU features",
          targets: [
            target("gaming", 5, 3),
            target("hardware-support", 5, 2),
          ],
        },
        {
          id: "servers",
          kind: "preference",
          label: "Servers, self-hosting and long uptimes",
          targets: [
            target("stability", 5, 3),
            target("community-support", 4, 1),
          ],
        },
        {
          id: "creative",
          kind: "preference",
          label: "Audio, video or graphics work",
          targets: [
            target("software-availability", 4, 2),
            target("hardware-support", 4, 2),
          ],
        },
        {
          id: "general-desktop",
          kind: "preference",
          label: "General desktop use, mixed workloads",
          targets: [
            target("ease-of-use", 4, 2),
            target("stability", 3, 1),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "experienced-release-model",
      dimension: "stability",
      prompt: "Which release model do you prefer?",
      helpText:
        "Think about how much churn you want to absorb between rebuilds.",
      allowNotSure: true,
      options: [
        {
          id: "lts",
          kind: "preference",
          label: "LTS/stable — rare upgrades, predictable behaviour",
          targets: [target("stability", 5, 3)],
        },
        {
          id: "point-release",
          kind: "preference",
          label: "Scheduled point releases — a planned upgrade every 6–12 months",
          targets: [target("stability", 3, 2)],
        },
        {
          id: "rolling",
          kind: "preference",
          label: "Rolling — continuous access to current packages",
          targets: [target("stability", 1, 3)],
        },
        {
          id: "atomic",
          kind: "preference",
          label: "Atomic images — staged updates and easy rollback",
          targets: [
            target("stability", 4, 2),
            target("customization", 2, 1),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "experienced-package-ecosystem",
      dimension: "software-availability",
      prompt: "What matters most in a package ecosystem?",
      helpText:
        "There is no universally “best” ecosystem — this is about which workflow you are happiest maintaining.",
      allowNotSure: true,
      options: [
        {
          id: "debian-tooling",
          kind: "preference",
          label: "Debian/Ubuntu tooling — .deb, apt, PPAs",
          targets: [target("software-availability", 4, 2)],
        },
        {
          id: "rpm-tooling",
          kind: "preference",
          label: "RPM tooling — dnf or zypper, COPR or OBS",
          targets: [target("software-availability", 4, 2)],
        },
        {
          id: "arch-aur",
          kind: "preference",
          label: "AUR and Arch packaging — near-limitless community packages",
          targets: [
            target("software-availability", 5, 2),
            target("customization", 4, 2),
          ],
        },
        {
          id: "nix-declarative",
          kind: "preference",
          label: "Nix — declarative configuration and reproducible builds",
          targets: [
            target("customization", 5, 2),
            target("stability", 4, 1),
          ],
        },
        {
          id: "flatpak-first",
          kind: "preference",
          label: "Flatpak-first — sandboxed apps that work across distros",
          targets: [
            target("software-availability", 4, 2),
            target("ease-of-use", 4, 1),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "experienced-hardware",
      dimension: "hardware-support",
      prompt: "What does your hardware demand?",
      allowNotSure: true,
      options: [
        {
          id: "nvidia",
          kind: "preference",
          label: "NVIDIA proprietary drivers must work cleanly",
          targets: [target("hardware-support", 5, 3)],
        },
        {
          id: "new-hardware",
          kind: "preference",
          label: "Recent GPU or very new hardware — I need current kernels and Mesa",
          targets: [target("hardware-support", 4, 3)],
        },
        {
          id: "older-hardware",
          kind: "preference",
          label: "Older or limited hardware — efficiency matters",
          targets: [
            target("lightweight", 5, 3),
            target("hardware-support", 3, 1),
          ],
        },
        {
          id: "standard-hardware",
          kind: "preference",
          label: "Nothing exotic — mainstream hardware",
          targets: [target("hardware-support", 3, 1)],
        },
        notSureOption(),
      ],
    },
    {
      id: "experienced-customization",
      dimension: "customization",
      prompt: "How much control do you want over the base system?",
      allowNotSure: true,
      options: [
        {
          id: "from-scratch",
          kind: "preference",
          label: "Build it up myself — window manager, dotfiles, minimal base",
          targets: [target("customization", 5, 3)],
        },
        {
          id: "tweakable-base",
          kind: "preference",
          label: "A solid base I can tweak as needed",
          targets: [target("customization", 4, 2)],
        },
        {
          id: "sane-defaults",
          kind: "preference",
          label: "Sane defaults, minimal fiddling",
          targets: [
            target("customization", 2, 2),
            target("ease-of-use", 4, 1),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "experienced-maintenance",
      dimension: "stability",
      prompt: "What is your maintenance style?",
      allowNotSure: true,
      options: [
        {
          id: "set-and-forget",
          kind: "preference",
          label: "Set and forget — I don’t want to babysit updates",
          targets: [
            target("stability", 5, 3),
            target("ease-of-use", 3, 1),
          ],
        },
        {
          id: "occasional-fixes",
          kind: "preference",
          label: "Occasional fixes are fine; I keep up with changes",
          targets: [target("stability", 3, 2)],
        },
        {
          id: "live-on-the-edge",
          kind: "preference",
          label: "I enjoy fixing breakage and living on the edge",
          targets: [
            target("stability", 1, 2),
            target("customization", 5, 1),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "experienced-desktop",
      dimension: "desktop-experience",
      prompt: "What desktop or workflow do you want?",
      allowNotSure: true,
      options: [
        {
          id: "gnome",
          kind: "preference",
          label: "GNOME — modern, keyboard-driven workflow",
          targets: [target("desktop-experience", 4, 2)],
        },
        {
          id: "kde-plasma",
          kind: "preference",
          label: "KDE Plasma — traditional layout, deep configurability",
          targets: [
            target("desktop-experience", 4, 2),
            target("customization", 4, 1),
          ],
        },
        {
          id: "tiling",
          kind: "preference",
          label: "A tiling window manager or minimal setup I control",
          targets: [
            target("customization", 5, 2),
            target("desktop-experience", 2, 2),
          ],
        },
        {
          id: "lightweight-classic",
          kind: "preference",
          label: "A lightweight classic desktop — Xfce or MATE",
          targets: [
            target("lightweight", 4, 2),
            target("desktop-experience", 3, 1),
          ],
        },
        notSureOption("No strong preference"),
      ],
    },
  ],
};
