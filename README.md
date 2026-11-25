# Distro Picker

A static, client-side guide to finding a Linux distribution that fits your needs. Built with Vite, React, TypeScript, and Tailwind CSS.

## Getting started

```sh
npm install
npm run dev
```

Run `npm run typecheck` to check types, `npm test` to run the unit tests, and `npm run build` to create the static site in `dist/`. Run `npm run preview` to serve the build locally.

The quiz, results and catalog are implemented; the distro detail and methodology pages are still placeholders for upcoming work. The audience paths are `/quiz/newcomer` and `/quiz/experienced`; distro detail routes use `/distros/:slug`.

The catalog (`/catalog`) keeps its search, priority filters, sort and up-to-three comparison selection in the URL (`?q=`, repeated `?dim=`, `?sort=`, repeated `?compare=`), so a filtered view can be shared or reloaded. Comparison ids are passed to `/compare?distros=slug,slug`; that view is a stub until its own ticket lands.

The app uses client-side routing. A production static host must serve `index.html` as a fallback for requests to routes such as `/catalog` and `/distros/ubuntu`.

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
