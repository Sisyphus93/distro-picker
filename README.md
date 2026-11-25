# Distro Picker

A static, client-side guide to finding a Linux distribution that fits your needs. Built with Vite, React, TypeScript, and Tailwind CSS.

## Getting started

```sh
npm install
npm run dev
```

Run `npm run typecheck` to check types and `npm run build` to create the static site in `dist/`. Run `npm run preview` to serve the build locally.

The quiz, results, catalog, distro detail, and methodology pages are currently placeholders for upcoming work. The audience paths are `/quiz/newcomer` and `/quiz/experienced`; distro detail routes use `/distros/:slug`.

The app uses client-side routing. A production static host must serve `index.html` as a fallback for requests to routes such as `/catalog` and `/distros/ubuntu`.

## Domain model and curated data

`src/domain/` is the single source of truth shared by the quiz, recommendation engine, catalog, comparison and detail views:

- `dimensions.ts` — the ten evaluation dimensions and the meaning of ratings 1–5.
- `types.ts` — distro profile, dimension ratings, "what to expect", official links and recommendation result shapes.
- `desktops.ts`, `families.ts`, `release-models.ts` — shared vocabulary for profile fields.
- `quiz/` — newcomer and experienced question sets, the "not sure" option, and `buildPreferenceProfile`, which turns answers into the engine's input.
- `distros/` — one file per curated distro, plus lookup helpers in `index.ts`.
- `integrity.ts` — validates the dataset and quiz flows.

Every distro is rated 1–5 on every dimension with a short rationale. A rating of 1 sits at the dimension's `lowLabel`, a rating of 5 at its `highLabel`; quiz answers target the same scale, so scoring needs no distro-specific rules.

To add or update a distro, edit its file in `src/domain/distros/`, fill in every required field, and run `npm run dev` — the app validates the dataset on startup in development. `npm run typecheck` catches structural omissions.
