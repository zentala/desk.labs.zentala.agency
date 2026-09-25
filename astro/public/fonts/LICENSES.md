# Font licences

All three DESIGN.md §0/§4 fonts are self-hosted via `@fontsource*` npm packages
(no Google Fonts CDN request). Vite/Astro bundles the woff2 files from these
packages into the build output (`dist/_astro/*.woff2`) at build time, so the
served files never round-trip through a third-party host.

| Font | Package | Version | Licence |
|---|---|---|---|
| Bricolage Grotesque (variable) | `@fontsource-variable/bricolage-grotesque` | 5.3.0 | SIL Open Font License 1.1 |
| Inter (variable) | `@fontsource-variable/inter` | 5.3.0 | SIL Open Font License 1.1 |
| JetBrains Mono | `@fontsource/jetbrains-mono` | 5.3.0 | SIL Open Font License 1.1 |

Full licence text ships with each package at
`node_modules/@fontsource*/<font>/LICENSE` and is reproduced there verbatim
(SIL OFL 1.1, copyright the respective upstream project authors). See
`astro/src/styles/global.css` for the `@import` statements that pull these
packages in.
