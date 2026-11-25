# Distro Picker

A static, client-side guide to finding a Linux distribution that fits your needs. Built with Vite, React, TypeScript, and Tailwind CSS.

## Getting started

```sh
npm install
npm run dev
```

Run `npm run typecheck` to check types, `npm test` to run the unit tests, and `npm run build` to create the static site in `dist/`. Run `npm run preview` to serve the build locally.

The quiz, results, catalog, comparison, distro detail and methodology pages are implemented. The audience paths are `/quiz/newcomer` and `/quiz/experienced`; distro detail routes use `/distros/:slug`.

The catalog (`/catalog`) keeps its search, priority filters, sort and up-to-three comparison selection in the URL (`?q=`, repeated `?dim=`, `?sort=`, repeated `?compare=`), so a filtered view can be shared or reloaded. The comparison view (`/compare?distros=slug,slug`) presents the shared profile fields and all ten ratings side by side. Opening it from the catalog and returning preserves the catalog's search, filters, sort and scroll position, while reflecting any removals. Direct comparison links open independently and return to an unfiltered catalog with the current selection.

The detail page (`/distros/:slug`) renders the full shared profile for each of the 16 curated distros: identity and context, "Best for" / "Not ideal for" / key tradeoffs, all ten dimension ratings with rationales and scale labels, "What to expect", official website/download/docs links and the "Last reviewed" date. Advanced and caveat-heavy profiles show newcomer-specific caution. Breadcrumbs and a context-aware back link return to the exact catalog view (search, filters, sort, comparison selection and scroll position), results, comparison or home; direct links fall back to the catalog. Previous/next distro links carry that context along. Navigation context is validated in `src/navigation/profile-origin.ts`.

The methodology page (`/methodology`) explains the shared model end to end: the ten dimensions and what both ends of the 1–5 scale mean, how quiz answers map to dimensions, positions and weights, why “I’m not sure” stays neutral, how weighted gaps become Strong/Good/Partial labels without percentages, the curation criteria for the 16-distro set, how caveat-heavy distros are labelled wherever they appear, and the limits of manually curated/static v1 data. Its content is derived from the same domain data the app runs on — dimensions, quiz flows, fit labels, scoring rules, the dataset and each profile’s review date — so the explanation cannot drift from the behaviour it describes.

Every route sets its own document title (`src/navigation/document-title.ts`), and the current page is marked with `aria-current` in the main navigation. The layout has one shared header, footer and skip link; focus-visible rings cover links, buttons and form controls; the quiz uses a labelled native radio group with a live answer hint; catalog filters use a labelled search field, sort select and checkbox fieldset; and the comparison table has a caption, scoped headers and a keyboard-reachable scroll region. Muted text was darkened to meet WCAG AA contrast, motion is disabled under `prefers-reduced-motion`, and navigation reflows below 760px while wide tables scroll with a sticky first column on small screens.

The app uses client-side routing. A production static host must serve `index.html` as a fallback for requests to routes such as `/catalog` and `/distros/ubuntu`. `npm run preview` does this for the built site, so every key route can be checked locally after `npm run build`.

## Domain model and curated data

`src/domain/` is the single source of truth shared by the quiz, recommendation engine, catalog, comparison and detail views:

- `dimensions.ts` — the ten evaluation dimensions and the meaning of ratings 1–5.
- `types.ts` — distro profile, dimension ratings, "what to expect", official links and recommendation result shapes.
- `desktops.ts`, `families.ts`, `release-models.ts` — shared vocabulary for profile fields.
- `quiz/` — newcomer and experienced question sets, the "not sure" option, and `buildPreferenceProfile`, which turns answers into the engine's input.
- `distros/` — one file per curated distro, plus lookup helpers in `index.ts`.
- `catalog.ts` — pure catalog querying (name search, priority filters, sort options) and the notable-strengths helper the catalog cards use. Tested in `catalog.test.ts`.
- `comparison.ts` — the three-distro comparison selection rules shared by the catalog and the comparison view. Tested in `comparison.test.ts`.
- `integrity.ts` — validates the dataset and quiz flows.
- `recommendation/` — the recommendation engine: pure TypeScript, no UI dependencies. It takes the quiz-derived preference profile plus the curated dataset and returns a ranked list with qualitative fit labels (`Strong`/`Good`/`Partial`), a top pick, two close alternatives, match reasons and tradeoffs/caveats. “Not sure” answers are neutral, there are no hard eliminations in v1, and no numeric match scores are produced. Tested through its public interface in `recommendation/engine.test.ts`.

Every distro is rated 1–5 on every dimension with a short rationale. A rating of 1 sits at the dimension's `lowLabel`, a rating of 5 at its `highLabel`; quiz answers target the same scale, so scoring needs no distro-specific rules.

To add or update a distro, edit its file in `src/domain/distros/`, fill in every required field, and run `npm run dev` — the app validates the dataset on startup in development. `npm run typecheck` catches structural omissions.
