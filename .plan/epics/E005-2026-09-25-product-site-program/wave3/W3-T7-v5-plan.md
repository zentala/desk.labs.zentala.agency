# Plan: DeskScene v5 — owner feedback + premium rendering + visual review

## Context

Paweł reviewed DeskScene v4, which is on http://desk.internal/ and `/lab/desk-scene`. He wants these changes:

- **Chair.** The rounded cushion sits on a square pan that sticks out, and the backrest is not rounded. He wants **two variants**: fully rounded, and the earlier sharp chair.
- **Person.**
  - Remove the shoulder "balls".
  - The arms should start slightly lower.
  - He asks whether the person can be **smoothly round (not low-poly)** while the rest stays low-poly.
- **Plant.** It hides the cable. The cable must visibly run **from the sensor straight into the side of the monitor**, not disappear behind it. Move or replace the plant.
- **Callouts.** Today the circles are hand-drawn SVGs unrelated to the scene (`scene/callouts/insets.tsx`). They must become **real views of the same 3D objects from other cameras**:
  - the sensor seen from below and behind, with the cable leaving it;
  - the cable entering the monitor.

  Drop the "height change" circle, since the animation already shows it. The laser hitting the floor is already visible in the main view.
- **Shadows.** The person and desk shadows are slightly too strong.
- **Screen.** It is not sharp and does not match the scene. The cause, from the code:
  - it is a 2340×976 `CanvasTexture` on an unlit `meshBasicMaterial`;
  - it is shrunk 4–8× into low mip levels, so the text blurs;
  - the text was sized for a 1170 px layout.
- **Research.** Find how to make three.js illustrations look premium, and find skills.
  - Done: there are no local 3D skills.
  - External R3F skill packs exist.
  - The ranked techniques are listed below.
- Then a **visual review**.

## Approach

Implementation is done by Fable. It is the same agent that built the kit and v1–v4, and it is resumed with that context. It works in worktree `desk.zentala.io/.plan/worktrees/E005-wave2`, branch `e005-wave2`, fast-forwarded to `dev`, and stages only explicit paths.

### 1. References (read-only)
- R3F skill packs as inspiration, not installed:
  - `github.com/EnzeD/r3f-skills` (r3f-lighting)
  - `github.com/OpenAEC-Foundation/Three.js-Claude-Skill-Package`
- drei docs for `View`, `AccumulativeShadows`, `Environment`/`Lightformer`.

### 2. Owner fixes (MUST)

**Chair** (`scene/desk/Chair.tsx`)
- Add a `chairStyle` prop:
  - `rounded`: the seat and the backrest are faceted cushions, and the pan is hidden inside the seat;
  - `sharp`: the v1.5 boxy chair.
- The lab page gets an A/B toggle. The homepage uses the owner's pick, defaulting to `sharp`.

**Person** (`scene/kit/Person.tsx`, `poses.ts`)
- Remove the shoulder caps, and move the arm pivots down and inwards.
- Add a `figureStyle` prop:
  - `faceted`: the current figure;
  - `smooth`: a new `matteSmooth` finish in `kit/Block.tsx` `Surface`, higher-segment spheres and capsules, and a clay/mannequin tone. This is the architectural-model convention: a smooth figure in a faceted world.
- The lab page gets an A/B toggle.

**Cable and plant** (`scene/desk/Sensor.tsx`, `Monitor.tsx`, `Props.tsx`)
- A smooth tube runs from the sensor along the desk edge straight into a **visible USB-C port on the monitor's side**, with a connector at each end.
- Move the plant to the left end of the desk, or drop it.

**Shadows** (`scene/kit/Stage.tsx`, `style.ts`)
- Lower the ContactShadows opacity from 0.4 to about 0.25 and soften the key light's shadow.
- Try `AccumulativeShadows` + `RandomizedLight`. Keep it only if it stays correct while the desk rises.

**Screen** (`scene/desk/screenApp.ts`, `kit/screen.ts`, `Monitor.tsx`)
- Redesign the screen UI for its real on-page size: fewer elements, much bigger type (height, state chip, one toast).
- Size the canvas from the projected pixels × dpr, and avoid blur from deep mip levels.
- Match the scene's palette and exposure.

**Callouts: real 3D insets** (`scene/callouts/*`, `kit/Stage.tsx`, `DeskScene.tsx`)
- Use one shared canvas and drei `<View>`, with a reusable `<SceneContent t>`. Each view has its own narrow-fov camera.
- **Inset A (large):** the sensor from below and behind, showing the PCB, the lens and the cable leaving it.
- **Inset B:** the cable plugging into the monitor's side port.
- Crop to a circle with a CSS mask. Keep the SVG leader lines and labels.
- Delete `insets.tsx` and the height inset.
- On mobile, stack the insets under the scene.
- Record in DESIGN.md that this reverses the decision at DESIGN.md:556.

### 3. Premium pass (SHOULD, cheapest items with the most impact)
- A rim light that separates the figure and the monitor from the background.
- `Environment` with a few `Lightformer`s for subtle highlights on edges and the monitor bezel. No HDR download.
- Keep `NeutralToneMapping`. Outlines stay rejected: the owner already said no.
- Report the bundle cost of each addition.

### 4. Visual review (independent)
A fresh reviewer (Fable, clean context) runs the `design-review` and `design:design-critique` skills.
- Input: the screenshots, the owner's feedback list, DESIGN.md §8, and the homepage context.
- Output: ranked findings with Importance and Points.

Fable then fixes the confirmed findings in one round.

### 5. Land
- I review the screenshots.
- Update DESIGN.md §8.
- Fast-forward `dev` under the lease and rebuild the static site.
- Add a v5 note to E005 `PLAN.md`.
- No push without the owner's go-ahead.

## Critical files
- `astro/src/components/scene/DeskScene.tsx`
- `scene/kit/*`
- `scene/desk/{Chair,Sensor,Monitor,Props,screenApp}`
- `scene/callouts/*`
- `pages/lab/desk-scene.astro`
- `components/report/HowItWorksScene.astro`
- `DESIGN.md`

Versions: drei ^10.7.8, fiber ^9.8.1, three ^0.186.1, React 19.

## Verification
- `npx tsc --noEmit -p astro`: the only allowed error is the known `rss.xml.ts` one.
- `CI=true npm run build` is green. Report the gzip size change against 260.9 kB.
- Playwright against the built `dist` at dpr 2 shows 0 console errors. Screenshots go to `wave3/` as `desk-scene-v5-*`:
  - sitting;
  - standing;
  - mid-scroll;
  - mobile;
  - dark;
  - chair A/B;
  - figure A/B;
  - the inset;
  - the homepage section.
- The screen text is readable at 1280 px and dpr 1.
- After the rebuild, `desk.internal` serves the new chunk: check the content through Caddy on :2080.
