# 02: Shared domain model and curated distro dataset

**What to build:** A typed shared domain model and curated local dataset that power the whole v1 experience. The model covers the 10 evaluation dimensions, distro profile schema, quiz question/answer/preference structures, and recommendation result shapes. The dataset includes all 16 curated distros with complete profile content, using the same shared fields that will drive quiz scoring, catalog filters, comparison, and detail pages.

**Blocked by:** 01: Project scaffold, app shell, and home page.

**Status:** ready-for-agent

- [ ] Typed structures exist for the 10 shared dimensions: Ease of setup/use, Stability vs freshness, Hardware/NVIDIA friendliness, Software/package availability, Customization/tinkering, Privacy/proprietary-software stance, Gaming readiness, Performance/resource needs, Community/docs/support, Desktop experience.
- [ ] Typed distro profile schema includes name, logo/identifier, family/base, release model, default desktop(s), short description, Best for, Not ideal for, key tradeoffs, dimension ratings with short rationale, What to expect (install difficulty, maintenance/update style, software install experience, who will feel at home), official website/download/docs links, and Last reviewed date.
- [ ] Typed quiz structures exist for both audience flows, including questions, answer options, “not sure/no preference”, and mappings to dimension preferences/weights.
- [ ] Curated dataset includes all 16 v1 distros: Ubuntu, Linux Mint, Zorin OS, Pop!_OS, Fedora Workstation, Debian, openSUSE Tumbleweed, Arch Linux, EndeavourOS, Manjaro, MX Linux, elementary OS, Nobara, Bazzite, NixOS, Linux Lite.
- [ ] Each distro entry is complete enough to render detail/catalog/comparison views and feed the recommendation engine (no missing required profile fields).
- [ ] Caveat-heavy/advanced distros (at minimum Arch Linux, NixOS, Manjaro) include clear “who it’s for / not ideal for / tradeoff” caveats.
- [ ] Data compiles under TypeScript and is importable by the app without runtime errors.
