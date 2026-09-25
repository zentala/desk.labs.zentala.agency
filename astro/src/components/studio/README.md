# Scene studio (`/lab/studio`)

A lab page (noindex) for tuning the desk scene. Nothing on the public site imports this folder;
every heavy dependency (Leva, r3f-perf, mannequin.js, GLTF figures) is a lazy chunk that only
this page loads.

## What it does

- **Timeline.** Plays or scrubs the storyboard: `u` → `beatAt(u)` from
  `../scene/kit/timeline.ts`, the same function the homepage scroll uses (spec §11). Play /
  pause, speed, loop, a `u` slider, the current beat and a jump button per beat.
- **Figures.** Ours (faceted, smooth), mannequin.js (GPL-3, lab only) and ready-made CC0 / MIT
  rigs (`figures.ts`; licences in `public/models/studio/LICENSES.md`), each as "original" or
  "our style" (materials replaced by `material.figure`, flat shading).
- **Deterministic poses.** Ready-made rigs never read a clock: every frame sets each clip's time
  and weight from `u` (`pickClips`) and calls `mixer.update(0)`. The same `u` gives the same
  image; the screenshot run checks this by byte equality.
- **Relax.** `relax.ts` edits the clip's pose in world directions (shoulders down, arms in, spine
  and neck toward the screen, knees straighter, fingers curled) and a two-bone IK (`rig.ts`) rests
  the wrists on the keyboard while working. All exposed as sliders.
- **Desk.** Sensor colour (defaults to `material.sensor`) and cable radius (defaults to
  `CABLE_RADIUS`); N8AO, drei Outlines, SoftShadows and r3f-perf toggles; free orbit (also from
  below) with a reset.

`window.__studio` (`set`, `reset`, `look`) exists for the screenshot script only.

## Checks

| Command (in `astro/`) | What it proves |
|---|---|
| `npm test` | `beatAt` is pure and follows the storyboard; the cable never comes within radius + 3 mm of the desktop (`scene/desk/cablePath.test.ts`) |
| `npm run check:jitter` | scrolls `/lab/desk-scene/` in headless Chromium (serves `dist/`, builds if missing) and fails if the hero view is drawn > 2 px or a callout ring > 4 px away from its element in any frame, or if fewer than 10 hero frames were measured. Guards `SyncCanvasRect` (fceef69) and the viewport-pointer parallax in `kit/World.tsx`. |

## Rebuilding the models

`build-models.mjs` (kept with the E005 studio screenshots under
`.plan/epics/E005-2026-09-25-product-site-program/studio/`) rebuilds the GLBs from the original
downloads with gltf-transform: it keeps only the clips the timeline uses, copies clips between
files by joint name and drops normal / roughness maps. Rocketbox FBX files go through FBX2glTF
(npm `fbx2gltf`) first. Record any new model's source and licence text in `LICENSES.md` before
committing it.
