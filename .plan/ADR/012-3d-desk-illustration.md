# ADR-012: Procedural 3D desk illustration in "faceted light", with live insets

- **Status**: accepted
- **Date**: 2026-09-25
- **Epic**: E005 (wave 3, W3-T3 … W3-T9)
- **Spec**: [research/visuals/DESK-SCENE-SPEC.md](../../research/visuals/DESK-SCENE-SPEC.md);
  style: [DESIGN.md §8](../../DESIGN.md)

## Context

The site needs one illustration that explains the product in a glance: a sensor under a
height-adjustable desk, a laser to the floor, a cable to the computer, an app that knows sitting
from standing. It must animate (the desk rises as the page scrolls), live in both colour themes,
ship as an Astro island with a static fallback, and stay on the site's paper-and-ink language.
Six versions were built and reviewed by the owner in one day (W3-T3 → W3-T8). Each round
changed the direction; this record fixes the decisions so the next rounds build on them.

## Decision

1. **Procedural three.js / react-three-fiber, no external models.** Everything — desk, sensor,
   monitor, chair, person, props — is drawn from a small kit of primitives
   (`astro/src/components/scene/kit/`): sharp box, low-poly rod, faceted ellipsoid, faceted
   capsule, smooth tube. Colours come from `DESIGN.md` §0 tokens through one palette file; no
   hex elsewhere. The scene chunk is dynamic-imported (≈ 264 kB gzip) and a WebP render of the
   same code is the no-JS fallback.
2. **Art direction "faceted light".** Crisp low-poly with **no bevels**; round things are faceted
   (icosahedra, 7-sided capsules, 8-sided rods); `flatShading` everywhere except the cable and
   the optional smooth figure. **Form is modelled by light**: key + cool fill + rim + a low sky so
   every box shows three tones; PCF-soft key shadow and light contact shadows; Neutral tone
   mapping. Neutral furniture; colour only where it means something (coral beam, PCB, app
   states on the screen).
3. **The person is sketched, not boxed.** Overlapping ellipsoids and capsules in gesture-drawing
   proportions (Loomis 8-head canon is the target in the spec), a sand tone, no face. Default
   `faceted`; a `smooth` variant exists for evaluation (a hybrid is under review).
4. **Callout insets are real renders.** One shared canvas per island; the hero and each inset are
   drei `View`s with their own cameras, so an inset shows the same objects from below or from
   the side. Insets sit in a paper column beside the hero (a row under it on phones) and the
   canvas is clipped to hero + circles, so the square View scissor never shows. Leader lines and
   labels stay HTML/SVG. (This reverses the earlier "SVG drawings" decision in DESIGN.md §14.)
5. **Variants with an owner's default.** Chair `sharp` (default) / `rounded`; figure `faceted`
   (default) / `smooth`. The lab page (`/lab/desk-scene`) carries the A/B toggles; the homepage
   uses the defaults.
6. **The spec is the contract.** What is depicted and what must be visible lives in
   `research/visuals/DESK-SCENE-SPEC.md` with numbered requirements, a storyboard and a task
   breakdown; DESIGN.md §8 stays the style guide.

## Alternatives

- **"Chamfered clay"** (v2: bevelled blocks, ACES, chair in state amber, navy ghost figure) —
  rejected by the owner: rounded corners served nothing and ACES muddied the paper; the sharper
  v1.5 with every face shaded read as more natural.
- **Hand-drawn / illustrator feel** (proposed for v3) — rejected before implementation: the
  illustration should use what the technology does well, not imitate drawing.
- **Ink outlines** (inverted hull, A/B in v4) — rejected: the contour muddied the facets.
- **`Environment` + `Lightformer`s** for satin highlights (v5) — rejected: +19.7 kB gzip for a
  highlight nobody could see at hero size.
- **`AccumulativeShadows` + `RandomizedLight`** (v5) — not adopted: it must re-accumulate whenever
  the desk moves, which fights `frameloop="demand"`.
- **SVG drawings as insets** (v3–v4) — replaced: the owner wants the same objects, not a picture
  of them.
- **Ghost (translucent) figure** (v2) — replaced by a solid figure; the ghost finish remains in
  the kit for "away" scenes.
- **A separate canvas per inset** — rejected: three WebGL contexts and duplicated scene state;
  drei `View` shares one context.
- **Box mannequin** (v3) — replaced by ellipsoids/capsules: "nobody is made of boxes".

## Consequences

Positive:

- one code path produces the hero, the insets and the static fallback;
- the kit constants absorb art-direction changes (v2 → v3 → v4 were mostly constants);
- the same objects appear in every inset, so callouts cannot drift from the scene;
- no assets to license or load; the scene is ~10 kB of our code on top of three/fiber/drei.

Trade-offs:

- drei `View` has a wrong "offscreen" check (viewport `top` vs canvas height); the canvas is
  2.5× its box height as a workaround until upstream fixes it;
- three Views triple the draw calls in settled states; fine on integrated GPUs so far, not
  measured on low-end phones;
- the figure's anatomy is still hand-tuned; the spec's canon table is the reference for R-26..28;
- the spec's storyboard (phone, clock, hotspots, orbit) is ~60 points of work not yet built.

## Amendment 2026-09-25 — N8AO and one storyboard timeline (E005 studio)

Status: accepted by the owner after the library spike (`/lab/studio`).

- **N8AO adopted** for the hero view (`SceneAO.tsx`, `@react-three/postprocessing` + `n8ao`).
  It is its own lazy chunk (≈ 96 kB gzip) mounted only on wide desktop screens (≥ 1024 px,
  fine pointer, ≥ 6 cores) and never under reduced motion or on mobile, so the homepage's
  eager bundle does not grow by it. This relaxes "no post-processing" for desktop only.
- **One timeline.** `kit/timeline.ts` `beatAt(u)` is the single, pure storyboard driver
  (spec §11): the homepage scroll (DeskScene scroll mode) and the studio player both call it.
  Ready-made figures in the studio are posed from `u` with `mixer.update(0)`, never from a
  clock, so the same `u` gives the same image (verified by screenshot byte equality).
- **Rejected:** Rapier rope and catenary cables (the owner kept Catmull-Rom), RobotExpressive
  and Kenney (stylised, not a person), Theatre.js (R3F v8 peer, AGPL studio).
- **Still procedural on the site:** the homepage keeps our faceted figure; ready-made CC0/MIT
  candidates (Quaternius UAL + Base Characters, KayKit, Rocketbox) live in the studio until the
  owner picks one (licences: `astro/public/models/studio/LICENSES.md`).

## History

| Version | Round | What changed | Result |
|---|---|---|---|
| v1 | W3-T3 | first procedural scene: teal frame, floating chip, mug and plant | "not bad for a first pass" |
| v2 | W3-T4 | kit + style guide; chamfered clay; ghost person; scroll rise | "big step up"; bevels and colours rejected |
| v3 | W3-T5 | faceted light; neutral colours; underside sensor; SVG callouts; Rising state | "OK, not the worst"; sharper wanted |
| v4 | W3-T6 | no bevels; ellipsoid figure; column tones; mug + plant; homepage section; outline A/B rejected | approved plan for v5 |
| v5 | W3-T7 | drei View insets; chair/figure variants; port cable; lighter shadows; sharp screen | independent review: 15 A + 15 B points |
| v6 | W3-T8 | review fixes: column insets + clip-path, one-mass torso, stand-up arc, toast column, cable on surfaces | owner's evening corrections → spec (this ADR) |
