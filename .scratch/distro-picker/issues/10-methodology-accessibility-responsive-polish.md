# 10: Methodology page, accessibility, and responsive polish

**What to build:** A “How we recommend” / Methodology page and a final v1 polish pass across core experiences. The methodology explains the shared dimensions, quiz mapping, scoring approach, curation criteria, caveat handling, and the limitations of manually curated/static v1 data. The polish pass ensures the key pages are responsive, accessible, consistent, and trustworthy.

**Blocked by:** 06: Results page with transparent recommendations; 07: Catalog with search, filters, and sort; 09: Distro detail page.

**Status:** completed

- [x] Methodology/How we recommend page exists and explains the 10 shared dimensions, how quiz answers map to them, the weighted/neutral-“not sure” scoring approach, and the qualitative Strong/Good/Partial fit model (no percentages).
- [x] Methodology explains curation criteria for the 16-distro set, how caveat-heavy/advanced distros are handled, and that v1 data is manually curated/static with “Last reviewed” dates.
- [x] Core pages (Home, Quiz, Results, Catalog, Comparison, Distro detail, Methodology) have consistent navigation, visual hierarchy, and responsive layouts for mobile/tablet/desktop.
- [x] Accessibility pass covers semantic structure, keyboard navigation, visible focus states, form/control labels, and understandable interactive states for quiz, filters, and comparison controls.
- [x] Copy/tone is consistent: welcoming for newcomers, credible for experienced users, and transparent about tradeoffs/limitations.
- [x] Project builds successfully as a static site and key routes are verifiable in the built output/local preview.

## Comments

Implemented on `arena/1cd1904b-distro-picker`.

- `/methodology` is now a real, data-driven “How we recommend” page: all ten dimensions with both ends of the 1–5 scale, the two quiz flows with question counts and the dimensions each can express, how answers carry a target position and weight, why “I’m not sure” stays neutral, the weighted-gap scoring model with thresholds shared from the engine (`SCORING_RULES`), the Strong/Good/Partial labels with meanings, explicit “no percentages / no eliminations” copy, curation criteria, the 16-profile set with per-distro “Last reviewed” dates, caveat handling, and v1 limitations.
- Polish across the app: shared “How we recommend” navigation label, a real 404 page instead of placeholder copy, per-route document titles, footer navigation landmark, skip-link focus target, global focus-visible rings for links/buttons/form controls, WCAG AA contrast for muted text, a live quiz answer hint plus `aria-required`, a comparison-full notice next to the toggles, keyboard-reachable scroll regions for wide tables, a tablet scroll hint, and a 760px header breakpoint so navigation never crowds.
- Verification: `npm test`, `npm run typecheck`, `npm run build`, and `npm run preview` route checks for `/`, `/catalog`, `/methodology`, `/distros/ubuntu`, `/quiz/newcomer`, `/quiz/experienced`, `/results`, `/compare?distros=ubuntu,debian` and an unknown route (all 200 with hashed assets).
- Review follow-up on `arena/a1b87ff9-distro-picker`: the comparison table now shows each distro's caveat headline and detail, so caveat-heavy distros are labelled on every view; the React rendering test files were removed to align with the spec's pure-function testing seam (the spec now names the adjacent pure helpers that remain covered).
