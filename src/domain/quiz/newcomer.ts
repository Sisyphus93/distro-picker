import { notSureOption, target, type QuizFlow } from "./types";

/**
 * Newcomer flow: plain-language scenario questions, no jargon.
 *
 * Each answer maps to positions on the shared 1–5 dimension scale. The
 * mapping only expresses how much a quality matters, never a specific distro.
 */
export const NEWCOMER_QUIZ: QuizFlow = {
  audience: "newcomer",
  title: "New to Linux? Start here.",
  intro:
    "Seven plain-language questions about how you use a computer. There’s no jargon and no wrong answers — you can change anything later.",
  questions: [
    {
      id: "newcomer-use-case",
      dimension: "software-availability",
      prompt: "What will you mostly use your computer for?",
      helpText:
        "Pick the closest match. You can always try something different later.",
      allowNotSure: true,
      options: [
        {
          id: "everyday",
          kind: "preference",
          label: "Everyday browsing, email and documents",
          targets: [target("ease-of-use", 5, 2), target("software-availability", 3, 1)],
        },
        {
          id: "school-or-office",
          kind: "preference",
          label: "School, office or paperwork",
          description: "Word processing, spreadsheets, printing and video calls.",
          targets: [
            target("software-availability", 4, 2),
            target("hardware-support", 4, 1),
          ],
        },
        {
          id: "gaming",
          kind: "preference",
          label: "Gaming",
          description: "Steam, modern games, maybe a dedicated graphics card.",
          targets: [target("gaming", 5, 3), target("hardware-support", 4, 2)],
        },
        {
          id: "making-things",
          kind: "preference",
          label: "Making things: coding, art, music or video",
          targets: [
            target("software-availability", 5, 2),
            target("hardware-support", 4, 1),
          ],
        },
        {
          id: "older-computer",
          kind: "preference",
          label: "Giving an older computer a second life",
          targets: [target("lightweight", 5, 3), target("ease-of-use", 4, 1)],
        },
        notSureOption(),
      ],
    },
    {
      id: "newcomer-troubleshooting",
      dimension: "ease-of-use",
      prompt: "How do you feel about fixing things if they go wrong?",
      helpText:
        "There’s no wrong answer — this only shapes how much hand-holding we look for.",
      allowNotSure: true,
      options: [
        {
          id: "avoid-terminal",
          kind: "preference",
          label: "I’d rather not touch a terminal",
          description: "I want things set up and working without a puzzle.",
          targets: [
            target("ease-of-use", 5, 3),
            target("customization", 2, 1),
          ],
        },
        {
          id: "follow-instructions",
          kind: "preference",
          label: "I can follow instructions and paste a command if needed",
          targets: [
            target("ease-of-use", 4, 2),
            target("customization", 3, 1),
          ],
        },
        {
          id: "happy-tinkering",
          kind: "preference",
          label: "I’m happy to learn and fix things myself",
          targets: [
            target("ease-of-use", 3, 1),
            target("customization", 4, 2),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "newcomer-stability",
      dimension: "stability",
      prompt: "How do you feel about updates and new software versions?",
      helpText:
        "Stable systems change slowly. Fresh ones get new features sooner, but ask more of you.",
      allowNotSure: true,
      options: [
        {
          id: "keep-it-working",
          kind: "preference",
          label: "Keep it working — I don’t need the newest versions",
          targets: [target("stability", 5, 3)],
        },
        {
          id: "balanced",
          kind: "preference",
          label: "A balance of stability and freshness",
          targets: [target("stability", 3, 2)],
        },
        {
          id: "newest",
          kind: "preference",
          label: "I want the newest software as soon as it’s out",
          targets: [target("stability", 1, 3)],
        },
        notSureOption(),
      ],
    },
    {
      id: "newcomer-hardware",
      dimension: "hardware-support",
      prompt: "Is there anything special about your computer’s hardware?",
      helpText:
        "Graphics cards are the place where Linux setups most often need a hand.",
      allowNotSure: true,
      options: [
        {
          id: "nvidia",
          kind: "preference",
          label: "It has an NVIDIA graphics card",
          description: "I’d like the driver to just work.",
          targets: [target("hardware-support", 5, 3)],
        },
        {
          id: "brand-new",
          kind: "preference",
          label: "It’s quite new — a recent laptop or recent parts",
          targets: [target("hardware-support", 4, 2)],
        },
        {
          id: "older-or-low-spec",
          kind: "preference",
          label: "It’s on the older or low-spec side",
          targets: [
            target("lightweight", 5, 3),
            target("hardware-support", 3, 1),
          ],
        },
        {
          id: "standard",
          kind: "preference",
          label: "Nothing unusual — a standard laptop or desktop",
          targets: [target("hardware-support", 3, 1)],
        },
        notSureOption(),
      ],
    },
    {
      id: "newcomer-software",
      dimension: "software-availability",
      prompt: "What do you need from software?",
      helpText:
        "This helps us tell the difference between “a browser is enough” and “I need a specific app”.",
      allowNotSure: true,
      options: [
        {
          id: "browser-and-basics",
          kind: "preference",
          label: "A browser and a handful of well-known apps",
          targets: [
            target("software-availability", 3, 1),
            target("ease-of-use", 4, 1),
          ],
        },
        {
          id: "specific-apps",
          kind: "preference",
          label: "Specific apps — or the closest thing to them",
          targets: [target("software-availability", 5, 2)],
        },
        {
          id: "app-store",
          kind: "preference",
          label: "I like browsing an app store and installing in one click",
          targets: [
            target("software-availability", 5, 3),
            target("ease-of-use", 4, 1),
          ],
        },
        {
          id: "install-from-anywhere",
          kind: "preference",
          label: "I’m comfortable installing apps from outside a store",
          targets: [
            target("software-availability", 4, 1),
            target("customization", 3, 1),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "newcomer-desktop",
      dimension: "desktop-experience",
      prompt: "What kind of desktop would feel most comfortable?",
      helpText:
        "This is about look and workflow, not brand loyalty — and it’s easy to change later.",
      allowNotSure: true,
      options: [
        {
          id: "familiar",
          kind: "preference",
          label: "Something familiar and comfortably set up",
          description: "A Windows-like layout is absolutely fine.",
          targets: [
            target("desktop-experience", 5, 3),
            target("ease-of-use", 4, 1),
          ],
        },
        {
          id: "own-layout",
          kind: "preference",
          label: "Room to arrange things my own way",
          targets: [
            target("customization", 4, 2),
            target("desktop-experience", 3, 1),
          ],
        },
        {
          id: "minimal",
          kind: "preference",
          label: "Something minimal — rough edges are fine",
          targets: [
            target("desktop-experience", 2, 2),
            target("lightweight", 4, 1),
          ],
        },
        notSureOption(),
      ],
    },
    {
      id: "newcomer-proprietary",
      dimension: "free-software-privacy",
      prompt: "How do you feel about proprietary software and drivers?",
      helpText:
        "Some hardware and media need closed-source drivers or codecs to work fully.",
      allowNotSure: true,
      options: [
        {
          id: "just-work",
          kind: "preference",
          label: "If proprietary drivers make things work, use them",
          targets: [
            target("free-software-privacy", 2, 3),
            target("hardware-support", 4, 1),
          ],
        },
        {
          id: "pragmatic",
          kind: "preference",
          label: "I prefer free software, but I’ll use proprietary when it helps",
          targets: [target("free-software-privacy", 3, 2)],
        },
        {
          id: "free-software-first",
          kind: "preference",
          label: "Free software and privacy matter a lot to me",
          targets: [target("free-software-privacy", 5, 3)],
        },
        notSureOption(),
      ],
    },
  ],
};
