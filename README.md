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
