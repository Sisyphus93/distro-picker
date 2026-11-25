# Distro Picker Website (v1)

Status: ready-for-agent

## Problem Statement

People who want to use Linux—whether they are brand new to it or already experienced—often struggle to choose a distribution that fits their needs. Newcomers face overwhelming jargon, too many options, and conflicting advice, which can lead to choice paralysis or a poor first experience. Experienced users want a faster way to compare credible options against specific technical preferences (release model, package ecosystem, hardware support, customization, etc.) without wading through generic "top 10" lists. Both groups need a trustworthy, transparent way to narrow the field and understand why a distro fits or does not fit.

## Solution

Build a static, client-side website that helps users choose a Linux distro through a hybrid experience: a guided quiz for newcomers and experienced users (with tailored flows), plus a browsable/filterable catalog with side-by-side comparison. The site provides opinionated-but-transparent recommendations: a top pick, close alternatives, clear reasons, tradeoffs, and official links. All recommendation logic is explainable and powered by a shared dimension model and curated distro dataset. The v1 is a static Vite + React + TypeScript + Tailwind CSS site with no backend.

## User Stories

1. As a visitor, I want to immediately understand what the site does, so that I know it can help me choose a Linux distro.
2. As a visitor, I want to choose between “I’m new to Linux” and “I already use Linux” entry paths, so that I get an experience matched to my knowledge level.
3. As a visitor, I want to access the distro catalog directly from the home page, so that I can browse without taking the quiz.
4. As a newcomer, I want plain-language quiz questions, so that I can answer without understanding Linux jargon.
5. As an experienced Linux user, I want technically direct quiz questions, so that I can express preferences like release model, package ecosystem, and maintenance tolerance.
6. As a quiz taker, I want to answer one question at a time with a progress indicator, so that the quiz feels manageable and I know how much is left.
7. As a quiz taker, I want an “I’m not sure / no preference” option on most questions, so that I am not forced into inaccurate answers.
8. As a quiz taker, I want to move back to previous questions, so that I can change my answers before seeing results.
9. As a quiz taker, I want to see clear, concise answer options for each question, so that I can choose confidently.
10. As a newcomer, I want questions about my intended use case, comfort with troubleshooting/terminal, stability vs freshness, hardware/NVIDIA concerns, software/app ease, desktop look preference, and proprietary software/drivers stance, so that the recommendation reflects what matters to me.
11. As an experienced user, I want questions about workload, release model preference, package/software ecosystem priorities, hardware/GPU needs, customization vs curated defaults, stability/tinkering tolerance, and desktop/workflow preference, so that the recommendation reflects my technical priorities.
12. As a quiz taker, I want my answers mapped to a consistent set of evaluation dimensions, so that recommendations are explainable and comparable.
13. As a user who completes the quiz, I want to see a clear top distro pick, so that I have a confident starting point.
14. As a user who completes the quiz, I want to see 2 close alternatives, so that I can consider nearby options if the top pick is not perfect.
15. As a user viewing results, I want to see why the top pick fits me, so that I understand the recommendation rationale.
16. As a user viewing results, I want to see key tradeoffs and “not ideal for” caveats for recommended distros, so that I can make an informed decision.
17. As a user viewing results, I want qualitative fit indicators (Strong/Good/Partial) instead of fake-precision percentages, so that the recommendation feels honest and transparent.
18. As a user viewing results, I want to see which of my preferences matched and which involved tradeoffs, so that I can trust the outcome.
19. As a user viewing results, I want official links (website, download, docs) for recommended distros, so that I can take the next step safely.
20. As a user viewing results, I want a short “What to expect” summary for recommended distros, so that I know what installation and day-to-day use may feel like.
21. As a user, I want to retake the quiz or adjust my answers, so that I can explore how different preferences change the recommendation.
22. As an experienced user, I want to browse a curated catalog of distros, so that I can explore options without relying only on the quiz.
23. As a catalog user, I want to search distros by name, so that I can quickly find a specific distro.
24. As a catalog user, I want to filter distros by key dimensions (ease of setup/use, stability vs freshness, hardware/NVIDIA friendliness, software/package availability, customization/tinkering, privacy/proprietary-software stance, gaming readiness, performance/resource needs, community/docs/support, desktop experience), so that I can narrow options to my needs.
25. As a catalog user, I want to sort distros by useful criteria (e.g., beginner-friendly, lightweight, gaming-ready, stable), so that I can scan the catalog efficiently.
26. As a catalog user, I want to select up to 3 distros for side-by-side comparison, so that I can evaluate tradeoffs directly.
27. As a catalog user, I want the comparison view to show the same shared profile fields and dimension ratings, so that comparisons are consistent and fair.
28. As a user, I want to view a dedicated distro detail page, so that I can understand a distro in depth before choosing it.
29. As a user on a distro detail page, I want to see the distro’s name, logo, family/base, release model, default desktop(s), and short description, so that I get essential context quickly.
30. As a user on a distro detail page, I want to see “Best for”, “Not ideal for”, and key tradeoffs, so that I understand where the distro shines and where it may disappoint.
31. As a user on a distro detail page, I want to see dimension ratings with short rationale, so that I can understand how the distro evaluates against the shared criteria.
32. As a user on a distro detail page, I want to see “What to expect” details (install difficulty, maintenance/update style, software install experience, who will feel at home), so that I can anticipate the real-world experience.
33. As a user on a distro detail page, I want official website, download, and documentation links, so that I can move to trusted sources.
34. As a user, I want to see a “Last reviewed” date on distro profiles, so that I can judge how current the curated information is.
35. As a user, I want a “How we recommend” / Methodology page, so that I can understand how the quiz, dimensions, scoring, and curation work.
36. As a user, I want the methodology to explain that data is manually curated and static in v1, so that I understand the scope and limitations of the recommendations.
37. As a user, I want the site to be welcoming and easy to use as a newcomer, so that I do not feel intimidated by Linux.
38. As an experienced user, I want the site to feel credible and technically grounded, so that I can trust its comparisons and recommendations.
39. As a user on mobile, tablet, or desktop, I want the site to be responsive, so that I can use the quiz and catalog comfortably on any device.
40. As a keyboard or assistive-technology user, I want the site to have accessible navigation, form controls, focus states, and semantic structure, so that I can complete the quiz and browse distros.
41. As a user, I want fast page loads and interactions, so that the tool feels lightweight and reliable.
42. As a user, I want clear navigation between Home, Quiz, Results, Catalog, Distro detail, and Methodology, so that I can move around the site easily.
43. As a maintainer, I want distro data stored in a typed local dataset, so that adding/updating distro profiles is straightforward and safe.
44. As a maintainer, I want quiz questions and dimension mappings defined as structured data, so that the quiz can be adjusted without rewriting UI logic.
45. As a maintainer, I want recommendation logic separated from UI components, so that scoring behavior can be tested and evolved independently.
46. As a maintainer, I want the v1 to be a static build with no backend dependencies, so that it is easy to deploy and host anywhere.
47. As a user, I want the curated v1 catalog to include well-known, actively maintained distros across beginner and advanced use cases, so that the recommendations are relevant and credible.
48. As a user considering an advanced or caveat-heavy distro, I want clear warnings/caveats (e.g., maintenance expectations, not ideal for first-time users), so that I do not choose it by accident.

## Implementation Decisions

- **Project form**: Build a static, client-side v1 with no backend, accounts, comments, or community-submitted data. Deliver as a complete Vite + React + TypeScript + Tailwind CSS project in `/home/user/distro-picker`.
- **Routing/pages**: v1 includes Home (two-path entry), Quiz (newcomer and experienced flows), Results, Catalog, Distro detail, and Methodology/How we recommend. Navigation should make these areas easy to move between.
- **Core interaction model**: Hybrid. Newcomers and experienced users choose an explicit entry path. Each path gets a tailored 6–8 question quiz, one question at a time, with progress indicator and “I’m not sure / no preference” on most questions. Experienced users also have direct access to catalog/compare.
- **Shared dimension model**: Use a single shared model for quiz scoring, distro profiles, filters, and comparison. Dimensions: Ease of setup/use; Stability vs freshness (release model); Hardware/NVIDIA friendliness; Software/package availability; Customization/tinkering; Privacy/proprietary-software stance; Gaming readiness; Performance/resource needs; Community/docs/support; Desktop experience.
- **Recommendation engine module**: Implement recommendation logic as pure TypeScript functions/modules separated from React UI. Inputs: user preference profile derived from quiz answers + curated distro dataset. Outputs: ranked results with qualitative fit (`Strong`/`Good`/`Partial`), top pick, 2 close alternatives, match reasons, tradeoffs/caveats. “Not sure” answers are neutral. No hard eliminations in v1; extreme mismatches are surfaced as strong caveats.
- **Quiz data model**: Define newcomer and experienced question sets as structured data mapped to dimensions/weights. Keep question copy editable without changing engine logic. Draft question structure follows the agreed grilling outcome (newcomer plain-language scenarios; experienced direct technical preferences).
- **Distro dataset**: Curated typed local dataset of 16 distros: Ubuntu, Linux Mint, Zorin OS, Pop!_OS, Fedora Workstation, Debian, openSUSE Tumbleweed, Arch Linux, EndeavourOS, Manjaro, MX Linux, elementary OS, Nobara, Bazzite, NixOS, Linux Lite. Inclusion criteria: actively maintained, clear target audience, reputable official distribution channel, broad relevance.
- **Distro profile schema**: Each distro profile includes name, logo, family/base, release model, default desktop(s), short description, Best for, Not ideal for, key tradeoffs, dimension ratings with short rationale, What to expect (install difficulty, maintenance/update style, software install experience, who will feel at home), official website/download/docs links, and Last reviewed date.
- **Results presentation**: Top pick + 2 close alternatives. Show why it fits, tradeoffs, “why not others”/caveats where useful, qualitative fit indicators, and official links. Avoid numeric percentage scores.
- **Catalog/comparison**: Catalog supports search, dimension-based filters, sorting, and side-by-side comparison of up to 3 distros. Comparison uses the same shared profile fields/dimension ratings.
- **Methodology/trust**: Include a “How we recommend” page/section explaining dimensions, quiz mapping, scoring approach, curation criteria, caveat-heavy distro handling, and that v1 data is manually curated/static with “Last reviewed” dates.
- **Visual/design direction**: Clean, modern, trustworthy. Neutral/light base with a confident accent color, generous spacing, clear typography, friendly but not childish microcopy, subtle Linux-themed cues. No default hacker-terminal aesthetic; dark mode out of scope for v1.
- **Accessibility/responsiveness**: Responsive layout for mobile/tablet/desktop. Semantic structure, keyboard navigable controls, visible focus states, and accessible labels for quiz, filters, and comparison controls.
- **No file-path/code-snippet brittleness**: This spec intentionally avoids specific file paths inside the future project and avoids code snippets; implementation may choose module boundaries that satisfy the decisions above.

## Testing Decisions

- **What makes a good test**: Tests should verify external behavior and observable outcomes, not implementation details. They should assert the recommendation engine’s inputs/outputs and scoring/ranking behavior through its public module interface. Tests should be deterministic, readable, and focused on user-facing decision behavior (fit labels, reasons, caveats, neutrality of “not sure”).
- **Primary seam**: The recommendation engine as a pure TypeScript module. This is the confirmed v1 testing seam. Inputs: user preference profile derived from quiz answers + curated distro dataset. Outputs: ranked recommendations with qualitative fit, top pick, 2 close alternatives, match reasons, and tradeoffs/caveats.
- **Modules to test**: The recommendation/scoring engine and its public result-shaping behavior. Adjacent pure mapping helpers — quiz answer-to-dimension mapping, catalog/search/URL-state and navigation-state helpers — may be tested through their public functions, but without introducing UI/DOM coupling. Distro dataset/schema validation can be lightly covered only where it protects external behavior (e.g., required fields needed by scoring), but the core focus is engine behavior.
- **Prior art**: None in this workspace yet; this is a greenfield project. Tests should follow common Vitest/TypeScript unit-test patterns for pure functions once the project is scaffolded.
- **Not in v1 test scope**: React component rendering tests, browser E2E tests, visual regression tests, and deployment/infrastructure tests.

## Out of Scope

- User accounts, saved profiles, login, or syncing results across devices.
- Backend services, databases, APIs, or community-submitted distro data.
- Real-time distro release tracking, automatic data refresh, or scraped/live package metadata.
- Numeric match percentages or black-box AI-generated recommendations.
- Full installation tutorials, command-line walkthroughs, or distro-specific support forums.
- Dark mode (can be considered later; not in v1).
- Comprehensive coverage of all Linux distros; v1 is limited to the 16 curated distros.
- Localization/internationalization beyond English in v1 (unless added later).
- UI/E2E/visual regression testing in v1.

## Further Notes

- The site must serve both newcomers and experienced Linux users without diluting either experience: newcomers get simple guided language; experienced users get direct controls and comparison.
- Caveat-heavy or advanced distros (e.g., Arch Linux, NixOS, Manjaro) should be included but clearly labeled with who they are for and what tradeoffs/maintenance expectations they carry.
- The “Last reviewed” field is important for trust because the dataset is static/manually curated.
- After spec publication, implementation can proceed in `/home/user/distro-picker` as confirmed during grilling, following this spec and the confirmed single testing seam.
