# Desk scene specification (DeskScene) — what we depict and what must be visible

- **Status:** normative for `astro/src/components/scene/**`; supersedes the scattered notes in
  `.plan/epics/E005-*/wave3/W3-T*-owner-feedback.md`.
- **Style authority:** [`DESIGN.md` §8](../../DESIGN.md) ("faceted light"). This file says *what*
  is in the picture and *what must be seen*; §8 says *how it is drawn*.
- **Decision record:** [ADR-012](../../.plan/ADR/012-3d-desk-illustration.md).
- **Owner:** Paweł. Requirements are numbered `R-nn`; each has a source date, a status
  (`done` / `open` / `partial`) and the file that implements it. MUST / SHOULD / MAY as in RFC 2119.
- **Last reconciled with code:** 2026-09-25, commit `f1570e8` (DeskScene v6).

## 1. What the picture is for

One scene tells the product story in one glance: **a small sensor under a height-adjustable desk
watches the floor with a laser; a USB-C cable takes its reading to the computer; the app on the
screen knows whether you sit or stand and nudges you kindly.** The person, chair and props exist
only to make the desk read as a desk at true scale. The eye order MUST be: product parts (sensor,
beam, cable, screen) → person → furniture.

## 2. The world (metres; origin on the floor under the desk centre; −Z is the back of the desk)

| Object | Size / position | Colour token (`DESIGN.md` §0) | Req. |
|---|---|---|---|
| Floor slab (island) | 2.7 × 0.03 × 2.6, centred x −0.3, z +0.45; right edge inside the frame, near edge spills out | `surface-2` (dark: `line-strong`) | R-36 |
| Rug | 1.9 × 0.006 × 1.4 | `line` (dark: `#5B6270`) | — |
| Desk top | 1.20 × 0.035 × 0.60; top surface at 0.72 (sitting) … 1.12 (standing) | `material.desk-top` | R-01 |
| Columns | at x ±0.44, z −0.02; stages 50 / 64 / 78 mm square, thinnest at the bottom; 12 mm `ink` band under each mouth; T-feet 0.08 × 0.04 × 0.52 | stages `line-strong` / `#4B5160` / dark `line`; feet `ink` | R-03, R-04 |
| Monitor | 34" ultrawide all-in-one; body 0.82 × 0.365 × 0.03, screen 0.78 × 0.325; neck 0.15 tall; base 0.28 × 0.17; neck at z −0.17 | body `ink` (satin) | R-06 |
| Chair | seat 0.46 × 0.06 × 0.44, top at 0.47; backrest 0.42 × 0.40 × 0.05 tilted 8°; five-star base r 0.16; at z 0.58 when sat on | `material.fabric`; post, pan, base `ink` | R-10 |
| Person | 1.75 m, see §6 | `material.figure` | R-11 |
| Keyboard | 0.36 × 0.014 × 0.13 at x −0.06, z 0.11 | `ink`, key plate `ink-muted` | R-13 |
| Mouse | ~0.06 × 0.032 × 0.10 at x 0.20 | `ink` | R-13, R-29 |
| Mug | 8-sided, r 0.04, h 0.095, with handle | `surface` | R-13 |
| Notebook | 0.16 × 0.014 × 0.22 at x 0.47, z 0.13 | `material.fabric` | R-13 |
| Phone (second screen) | ~0.16 × 0.075 × 0.008, landscape, on a small angled stand (≈ 25°) at the right-back of the top (x ≈ 0.30, z ≈ −0.12), screen toward the person | body `ink`, screen `material.screen` | R-38 (open) |
| Wall clock | ⌀ 0.30, on the back wall plane behind the desk (z ≈ −1.2, y ≈ 1.75); hands move with the story | face `surface`, hands `ink` | R-37 (open) |

## 3. The product parts (the part of the picture that carries the story)

### 3.1 Sensor enclosure

- MUST be mounted on the **underside** of the top, 1.5 cm inboard of the right edge, 10 cm from
  the back edge, lens facing down, with a clear line of sight to the floor outside the foot's
  footprint (R-02, R-05).
- Current geometry: a 60 × 28 × 45 mm box. Target geometry (R-20..R-22): a **tapered enclosure**,
  wider end toward the desk centre, **narrower end outboard**; the **USB-C cable enters the
  narrower end** and the **downward laser emitter sits at that same end**, so cable and beam share
  the end the camera sees.
- Colour: the case MUST be a **natural neutral** (`material.fabric`, or a new `material.case`
  token in §0 if the owner wants it warmer); green (`material.pcb`) is allowed only for a visible
  PCB edge or window, never for the case (R-20). The yellow/copper "sticker" block MUST go (R-21).
- The beam is a 3 mm `brand` rod from the emitter to the floor, with a coral dot (r 22 mm) and a
  soft halo (r 50 mm) on the floor; it breathes 0.85 → 1 opacity over 2 s (§8.7).
- Acceptance: in every settled frame the enclosure is visible under the right edge; the beam and
  its floor dot are visible at every scroll position (R-33); the case is not green.

### 3.2 Cable

- One smooth tube (r 2.8 mm, `ink`) from the enclosure's cable end to the monitor's side port.
- Route (MUST lie on surfaces, no free-air arcs; R-07, review B3): out of the enclosure's narrow
  end → lies on the enclosure and **bends down naturally** from the outlet (R-24) → under the top
  to the back edge → around the edge → along the back edge on the desktop → up the monitor's
  right side → into the port.
- MUST be visibly **continuous** in both settled frames (R-23: on the seated side it currently
  reads as broken where it rounds the back edge).
- At the monitor the **USB-C plug is rotated 90°** (flat side vertical) and the cable **leaves the
  port sideways**, then falls down along the side (R-25) — not a straight drop from the plug.
- A connector body at each end (`material.fabric`, 12 × 7 × 14 mm).

### 3.3 Monitor screen UI (the app)

- A canvas texture sized from its projected on-page pixels (§8.8); always the light app
  (`material.screen` is white in both themes), dimmed 6 % to sit with the paper.
- Content, in this order of size: **height readout** ("72" … "112" + "cm", tabular, ticks while
  the desk moves) → **state chip** with icon + label (Sitting / Rising / Lowering / Standing;
  `state.*` tint and text, `away` for the moving states) → **one toast** in its own right-hand
  column, only in the settled states ("Time to stand up / 40 min sitting. Up for a minute?" when
  sitting; "Nice one. / Credit is ticking." when standing). Nothing else.
- Acceptance: readable at 1280 px and dpr 1; the toast never overlaps the number or the unit;
  no state information floats in 3D (R-08).

### 3.4 Desk paddle (the desk's own system, not ours)

- A paddle under the front edge with 4 memory buttons + up/down and its own cable to the right
  column (R-03). Target (R-30): the buttons are **vertical** (a column of four, rocker below)
  and the paddle sits **almost at the right end** of the desk (x ≈ +0.52), still under the edge.
  Today it is too close to the person and in their way; at the right end the person reaches
  sideways to press it (R-39) without the arm crossing the keyboard.

### 3.5 Phone as the second screen (R-38, open)

- An old phone in **landscape** on a small angled stand on the desk, running the same app. It is
  the **persistent** status display: elapsed time in the current state (mm:ss, ticking), the
  state chip, today's stand credit. The monitor shows only **transient** notifications (the
  toast), which appear and disappear; the phone never blanks.
- Placement: right-back of the top, angled toward the person, never between the camera and the
  sensor edge, never hiding the cable run. It gets its own hotspot and inset (§5).
- Screen: same canvas-texture approach as the monitor, design space 1000 × 470, type sized for
  ~120 CSS px of on-page width — one number, one chip, one line.

## 4. Camera views and insets

| View | What it shows | Lens | Status |
|---|---|---|---|
| Hero | front-right ¾, eye height 1.35 m, target (0.05, 0.86, 0.15), frame 2.15 × 1.85 m, 6 cm target lift as the person stands; ±4° pointer parallax | fit-to-frame (≈ 35° at 1.25:1) | done |
| Inset A | the sensor from below and behind: enclosure, lens, beam, the cable leaving the narrow end; desk top as the only context | 13° | done; re-frame after R-20..R-22 |
| Inset B | the seated plug in the monitor's side port from front-right-above; no screen text | 16° | done; re-frame after R-25 |
| Inset C | the phone on its stand, screen readable (elapsed time + state) | 16° | open (R-38) |
| Inset D | the paddle with vertical buttons, the hand pressing the up button | 16° | open (R-39) |
| Free orbit + zoom | the hero from any side: front, back, from below (to see the sensor); dolly in/out within limits | same lens | open (R-32, R-41) |

- Insets are real views of the same objects (drei `View`, one shared canvas) in a paper column
  beside the hero (a row under it on narrow screens); the canvas is clipped to hero + circles
  (§8.10). They MUST show their subject at ≥ 50 % of the disc, contain no text, and their
  leaders MUST NOT cross their labels.
- R-34 (open): each inset MUST be re-checked at sitting, standing and mid-scroll, in light and
  dark, at 1280 and 390 px, and its framing fixed per state where needed (the cameras already
  follow the desk height).

## 5. Interaction model

- One number `t` drives the desk; the storyboard (§11) extends it to a **timeline** `u`
  (0 … 1 over the whole scroll story) from which `t`, the clock, the screens and the pose are
  derived. Buttons "Sit down / Stand up" remain the reduced-motion path and jump between beats.
- **Hotspots, not permanent callouts (R-40, open):** each point of interest — sensor, paddle,
  USB-C port, phone — gets a subtle pulsing hotspot (a 10 px `brand` ring at 40 % opacity,
  2 s breathe, `line-strong` on hover) at its projected anchor. Clicking or tapping a hotspot
  opens that element's inset (or zooms the hero camera to it); clicking elsewhere closes it.
  A **"Show all callouts"** toggle shows every inset at once (today's behaviour). Nothing is
  shown permanently by default. Keyboard: hotspots are buttons in tab order with `aria-label`.
- **Free orbit and zoom (R-32, R-41, open):** drag to orbit (front, back, from below), wheel or
  pinch to dolly within limits (distance 1.6–4.5 m, pitch −25° … +60°); touch orbit only after a
  press-and-hold so page scroll is never stolen. **Coexistence with scroll (R-42, open):** the
  scroll story owns the camera by default; the first orbit gesture pauses scroll-camera control
  (the story keeps driving the desk, people and screens); a **"Reset view"** button returns the
  camera to the story and re-enables scroll control. The beam's floor dot MUST stay in frame or
  the camera re-frames after the gesture ends (R-33).
- Rising / Lowering states while `t` is between 2 % and 98 %; the toast only when settled.
- R-31 (open): the preview MUST NOT jitter on interaction (suspects: per-frame camera re-aim in
  `Lens`/`InsetLens`, the `resize.scroll` remeasure and the callout re-layout on every projected
  anchor change; measure before fixing).
- R-33 (open): the laser hitting the floor MUST be visible at every scroll position — more floor
  in frame (lower target and/or a taller frame at the sitting end).
- R-35 (open): on large screens the illustration SHOULD be about twice its current size and use
  most of the viewport (homepage section: full container width, hero height ≥ 70 vh at ≥ 1280 px).

## 6. The person (target proportions)

The artist canon (Loomis' 8-head figure; 1.75 m → head length 22 cm) is the target. The current
figure and the delta are listed so R-26..R-28 can be closed against numbers, not taste.

| Part | Canon target | Current (`kit/poses.ts`) | Delta |
|---|---|---|---|
| Height / head | 8 heads; head 22 × 19 × 20 cm | 1.75 m; head 22 × 19 × 20 | ok |
| Shoulders | 2.0–2.3 heads ≈ 44–50 cm across the deltoids | ribcage 36 wide, arm pivots at ±16.5 | **too narrow** (R-27): ribcage 40 wide, pivots ±19 with a deltoid mass ⌀ 11 |
| Ribcage | ~1.6 heads tall from clavicle to waist | 40 × 36 × 24 | widen to 40 |
| Waist → hips | one continuous mass; hips 1.6–1.8 heads ≈ 35–40 cm wide | waist capsule r 10.5; pelvis 30 × 16 × 22 | **indents at the waist** (R-26): waist r ≥ 13, pelvis 36 × 20 × 24 overlapping the ribcage by 6 cm |
| Neck | ⅓ head tall, ⌀ ~10 cm, starts inside the ribcage top | capsule r 3.5 starting above the ribcage | thicker (r 5), starts 3 cm lower (R-28) |
| Upper arm | 1.5 heads (33 cm), ⌀ 9–10 cm | 22 + 2·4.5 = 31, ⌀ 9 | ok |
| Forearm + hand | 1.25 + 0.75 heads (27 + 17 cm) | 27; hand 10 | ok |
| Thigh | 2 heads (44 cm) hip → knee; ⌀ 17 at the top tapering to 12 | 32 + 2·7.5 = 47, ⌀ 15 uniform | **too thin and flat** (R-27): taper 17 → 12, fuller mass at the top |
| Lower leg | 2 heads (44 cm) knee → floor incl. foot; calf ⌀ 13, ankle ⌀ 8 | 36 + 2·5.5 = 47, ⌀ 11 uniform | calf mass ⌀ 13, ankle ⌀ 8 |
| Foot | 1 head long (22–24 cm), 9 wide | 24 × 5 × 9 | ok |

- R-28 (open, hybrid): keep the **faceted** legs (better silhouette) and take the **smooth**
  variant's hips and head; the hips need a real pelvis mass (see table) either way.
- Poses: `SITTING` (hips 0.50 m up, 0.52 back), `STANDING` (0.95, 0.45), `standUp(t)` = lean and
  slide forward first, then rise with the knees under the hips. Hands on the keyboard in both
  settled poses; feet on the floor always.
- Style (§8.5): sand figure, no face, no skin tone, no clothing, no shoulder caps; `faceted` is
  the default; `smooth` stays a lab variant until R-28 is decided.

## 7. The chair

- `sharp` (default, R-19): boxy 6 cm seat, 8° backrest, `ink` post, pan and five-star base.
- `rounded` (lab variant): the faceted seat cushion is good; the flat square pan under it MUST go
  (R-18); the backrest MUST be proportionate to the seat (≥ 0.44 wide, ≥ 0.45 tall) — the person
  never leans on it, so it may be thin but not small.
- When the person stands the chair rolls 45 cm back and 15 cm left and turns 23°, so the empty
  chair is never the biggest dark mass in the frame (review B2).
- R-44 (open, lower priority): chair choreography — pushed back as the person stands (beat 4),
  pulled back in as they sit down again (beat 8); the push happens in the first half of the
  stand-up arc, the pull in the last half of the sit-down.

## 8. Requirements register

Status is per the code at the "last reconciled" commit above. `open` items are the owner's
2026-09-25 evening corrections plus what the review left partial.

| ID | Requirement | Source | Status | Implemented in |
|---|---|---|---|---|
| R-01 | Desk 120 × 60 cm, 3.5 cm top, 72 → 112 cm travel | W3-T4 #4 + round 2 | done | `desk/dims.ts` |
| R-02 | Sensor on the underside, back-right, beam to the floor clear of the foot | W3-T4 #1, W3-T5 #5 | done | `desk/Sensor.tsx` |
| R-03 | Desk paddle with 4 memory + up/down and its own cable to the column; two visibly separate systems | W3-T4 #3 | done | `desk/Desk.tsx` |
| R-04 | Nested column stages, thinnest at the bottom, +14 mm per stage, flush crossbar, each stage its own tone with a shadow band | W3-T4 round 2, W3-T6 #4 | done | `desk/Desk.tsx`, `scenePalette.ts` |
| R-05 | Beam visible in every scene with a floor dot | DESIGN §8 | done | `desk/Sensor.tsx` |
| R-06 | Big ultrawide all-in-one; USB-C port on its side | W3-T4 #7, W3-T7 | done | `desk/Monitor.tsx` |
| R-07 | Cable from the sensor into the monitor port, on surfaces; it never enters the desktop (centre line ≥ radius + 3 mm; wraps the back edge outside the 35 mm top; bend waypoint before the climb) | W3-T4 #2, W3-T7, review B3, owner E005 studio | done | `desk/sensorGeometry.ts` `cablePath`, `desk/cablePath.test.ts` (vitest) |
| R-08 | State and toast only on the screen; dominant readout; Rising/Lowering states | W3-T4 #8–9, W3-T5, W3-T6 | done | `desk/screenApp.ts`, `DeskScene.tsx` |
| R-09 | Scroll-driven rise with buttons as the accessible fallback | W3-T4 #11 | done | `DeskScene.tsx`, `kit/motion.ts` |
| R-10 | A chair; the person sits / stands; sharp and rounded variants with a lab toggle | W3-T4 #10, W3-T7 | done | `desk/Chair.tsx`, `DeskSceneLab.tsx` |
| R-11 | Person sketched from ellipsoids and capsules; faceted by default, smooth variant | W3-T6 #3, W3-T7 | done | `kit/Person.tsx`, `kit/poses.ts` |
| R-12 | No bevels; faceted round things; sharp edges | W3-T6 #1–2 | done | `kit/Block.tsx` |
| R-13 | Recognisable neutral props only: keyboard, mouse, mug, notebook (plant dropped) | W3-T6 #5, review A5 | done | `desk/Props.tsx` |
| R-14 | Callout insets are real views of the same objects: sensor and cable; no text inside | W3-T7 | done | `callouts/*`, `kit/InsetView.tsx` |
| R-15 | Insets never show a square scissor; leaders never cross labels | review A3, A8 | done | `DeskScene.tsx` `canvasClip`, `callouts/Callouts.tsx` |
| R-16 | Faceted-light rig: key + fill + rim + low sky; three tones per box; soft shadows | W3-T5 correction, review A7 | done | `kit/World.tsx`, `kit/style.ts` |
| R-17 | Homepage "How it works" section with the scene | W3-T6 #8 | done | `components/report/HowItWorksScene.astro` |
| R-18 | Rounded chair: drop the flat square pan; backrest proportionate to the seat | 2026-09-25 evening | **open** | `desk/Chair.tsx` |
| R-19 | Sharp chair is the default everywhere | 2026-09-25 evening | done | `DeskScene.tsx`, `DeskSceneLab.tsx` |
| R-20 | Enclosure NOT green: natural neutral case (`material.sensor` `#9D7E7E`, owner pick in the studio); green only for a PCB | 2026-09-25 evening, E005 studio | done | `desk/Sensor.tsx`, `scenePalette.ts`, `DESIGN.md` §0 |
| R-21 | Remove the yellow "sticker" block on the enclosure (the copper pads) | 2026-09-25 evening | done | `desk/Sensor.tsx` |
| R-22 | Cable enters the narrower end of the enclosure; the laser emitter sits at that end | 2026-09-25 evening | **open** | `desk/Sensor.tsx` |
| R-23 | Cable continuity on the seated side (no visible break) | 2026-09-25 evening | **open** | `desk/Sensor.tsx` `cablePath` |
| R-24 | Cable lies on the enclosure and bends down naturally from the outlet | 2026-09-25 evening | **open** | `desk/Sensor.tsx` |
| R-25 | USB-C plug rotated 90° at the monitor; cable leaves sideways, then falls | 2026-09-25 evening | **open** | `desk/Monitor.tsx`, `desk/Sensor.tsx` |
| R-26 | Fill the waist indents: one torso mass | 2026-09-25 evening | **open** | `kit/poses.ts`, `kit/Person.tsx` |
| R-27 | Shoulders wider; legs thicker with taper; canon proportions (§6) | 2026-09-25 evening | **open** | `kit/poses.ts`, `kit/Person.tsx` |
| R-28 | Fix the neck and the arm/shoulder join; evaluate a hybrid figure (faceted legs, smooth hips and head); hips need work either way | 2026-09-25 evening | **open** | `kit/Person.tsx` |
| R-29 | Mouse rounder (not a cigarette pack) | 2026-09-25 evening | **open** | `desk/Props.tsx` |
| R-30 | Paddle buttons vertical; paddle almost at the right end of the desk | 2026-09-25 evening | **open** | `desk/Desk.tsx` |
| R-31 | No jitter on interaction: stale canvas rect mid-scroll (`SyncCanvasRect`, fceef69) and the parallax pitch flipping under a still mouse while scrolling (`Lens` reads the viewport pointer) | 2026-09-25 evening | done | `kit/SceneCanvas.tsx`, `kit/World.tsx` `Lens`; guarded by `npm run check:jitter` |
| R-32 | Free orbit rotation (front, back, below) in addition to scroll and buttons | 2026-09-25 evening | partial — in `/lab/studio` only; not on the homepage | `studio/StudioRig.tsx`; `kit/World.tsx`, `DeskScene.tsx` |
| R-33 | Laser floor dot visible at every scroll position; more floor in frame | 2026-09-25 evening | **open** | `kit/style.ts` `CAMERA` |
| R-34 | Insets look good in every state, theme and width | 2026-09-25 evening | **open** | `DeskScene.tsx` `insetCameras` |
| R-35 | Illustration ~2× larger on big screens, using much more of the viewport | 2026-09-25 evening | **open** | `components/report/HowItWorksScene.astro`, `DeskScene.tsx` |
| R-36 | Floor slab as an island inside the frame (no corner slicing) | review B6 | partial | `kit/style.ts` `STAGE` |
| R-37 | Longer scroll story with the beats of §11; visible time cues (wall clock with moving hands and/or a ticking timer) | 2026-09-25 addendum | partial — `beatAt(u)` drives the scroll (600 vh) and the studio player; timer on the monitor chip and a story clock on the screen; no wall clock, no phone yet | `kit/timeline.ts` (+ test), `DeskScene.tsx`, `desk/screenApp.ts` |
| R-38 | Phone as the persistent second screen on an angled stand; monitor shows transient notifications only | 2026-09-25 addendum | **open** | new `desk/Phone.tsx`, `desk/screenApp.ts` (split) |
| R-39 | The person visibly presses the paddle button to raise and lower the desk; paddle at the right end, out of the way | 2026-09-25 addendum | **open** | `kit/poses.ts` (reach pose), `desk/Desk.tsx` |
| R-40 | Hotspots on sensor, paddle, USB-C port, phone; click opens that inset; "show all" toggle; nothing permanent by default | 2026-09-25 addendum | **open** | `callouts/*`, `DeskScene.tsx` |
| R-41 | Zoom (dolly) with limits, mouse and touch | 2026-09-25 addendum | **open** | `kit/World.tsx` |
| R-42 | Orbit and scroll coexist: orbit pauses scroll-camera control; "Reset view" returns it | 2026-09-25 addendum | **open** | `kit/World.tsx`, `DeskScene.tsx` |
| R-43 | Away scenario: the person walks away, the app shows Away and the limit resets | 2026-09-25 addendum | partial — beat 9: stands, turns, slides out (no gait on our figure; ready-made rigs walk); screen shows Away / Timer paused | `kit/timeline.ts` `walkOffset`, `desk/screenApp.ts` |
| R-44 | Chair choreography: pushed back on standing, pulled in on sitting | 2026-09-25 addendum | **open** (lower priority) | `desk/Chair.tsx` |
| R-45 | Ambient occlusion (N8AO, `quality="medium"`) on the hero, desktop only: off under reduced motion, touch, < 1024 px or < 6 cores; its own lazy chunk (≈ 96 kB gzip) | owner, E005 studio | done | `SceneAO.tsx`, `DeskScene.tsx` |
| R-46 | A scene studio: play / scrub the storyboard, switch figures (original vs our style), tune the pose, sensor colour and cable; lab only, noindex | owner, E005 studio | done | `pages/lab/studio.astro`, `components/studio/*` |
| R-47 | A relaxed, natural ready-made figure (not a combat stance), hands on the keyboard while working | owner, E005 studio | partial — relax offsets + two-bone IK in the studio; not on the homepage | `studio/relax.ts`, `studio/rig.ts` |
| R-48 | Cable thickness adjustable in the studio; the site default stays `CABLE_RADIUS` (2.8 mm) until the owner picks | owner, E005 studio | done | `studio/studioControls.ts`, `desk/sensorGeometry.ts` |

## 9. Acceptance criteria per object

Checked on screenshots at 1280 × 900 dpr 2, 1280 dpr 1 and 390 × 844, in light and dark, at
sitting, standing and mid-scroll (`.plan/epics/E005-*/wave3/`).

- **Desk:** three tones on every column stage; no visible tube under the top; the paddle is under
  the front-right edge with vertical buttons (R-30); the top is sand, the frame grey.
- **Sensor:** neutral case, no sticker; cable and emitter at the narrow end; beam and floor dot in
  frame in every screenshot including mid-scroll (R-33).
- **Cable:** one continuous line from enclosure to port, lying on surfaces; sideways exit at the
  port; no stiff arcs.
- **Monitor / screen:** readout, chip and toast legible; toast clear of the unit; no text in
  inset B.
- **Chair:** sharp by default; never the biggest dark mass; never cropped.
- **Person:** proportions within the §6 targets; one torso mass; hands on the keyboard; feet on
  the floor; the rising frame reads as getting up.
- **Insets:** subject ≥ 50 % of the disc; clean circle edge; leaders clear of labels; correct in
  both themes and on mobile.
- **Viewer:** no jitter; orbit works with mouse and touch without stealing page scroll; reduced
  motion snaps; console errors 0; scene chunk ≤ 275 kB gzip.
- **Scroll stability (automated):** `npm run check:jitter` (`astro/scripts/check-scroll-jitter.mjs`)
  scrolls `/lab/desk-scene/` in headless Chromium and passes only if the hero view is drawn
  within 2 px of its element and each callout ring within 4 px, in every frame, with at least
  10 hero frames measured. It fails on the pre-fix code (hero 40 px without `SyncCanvasRect`;
  rings 26.7 px with the old parallax).
- **Cable (automated):** `npm test` — `cablePath.test.ts` samples the Catmull-Rom curve at five
  desk heights and fails if any point comes within radius + 3 mm of the desktop box.
- **Story (automated):** `npm test` — `timeline.test.ts`: nine contiguous beats, pure, desk
  moves only in beats 4 and 7.

## 10. Change log

- 2026-09-25 — E005 studio (branch `e005-libs-spike`): R-07, R-20, R-21, R-31 done; R-37, R-43
  partial (`beatAt`); R-45..R-48 added (N8AO on desktop, scene studio, relaxed figure, cable
  thickness); automated checks added to §9.
- 2026-09-25 — v1, reconciled with DeskScene v6 (`f1570e8`); R-18 and R-20..R-35 recorded as
  open from the owner's evening review; R-37..R-44, the storyboard (§11) and the task breakdown
  (§12) added from the owner's addendum the same evening.

## 11. Scroll storyboard (R-37)

The story runs over one long scroll section (target ≈ 600 vh; today 240 vh). `u` is the scroll
progress through it. Times on the clock are story time, not real time; the phone timer ticks at
story speed. Each beat names the scene, the monitor, the phone and the clock.

| # | `u` range | Scene | Monitor (transient) | Phone (persistent) | Clock |
|---|---|---|---|---|---|
| 1 | 0.00–0.10 | Person works seated; hands on the keyboard; desk at 72 cm | a brief neutral notification card slides in and out (e.g. "Calendar: 1 event") | "Sitting · 32:10" ticking, chip amber | 14:32 → 14:40 |
| 2 | 0.10–0.20 | Still seated; the timer nears the limit | **"Time to stand up — 40 min sitting. Up for a minute?"** stays | "Sitting · 40:00", chip amber, thin progress ring full | 14:40 |
| 3 | 0.20–0.30 | Person **reaches right and presses the paddle's up button** (hand on the paddle, R-39); the desk starts rising | toast fades | "Rising", chip slate | 14:40 |
| 4 | 0.30–0.45 | Desk 72 → 112 cm; `standUp` arc; the chair is pushed back (R-44) | readout ticks 72 → 112 | "Rising · 112 cm" | 14:41 |
| 5 | 0.45–0.65 | Person stands and works; time visibly passes (the phone timer runs, the clock hands move, the monitor content changes once or twice) | occasional small notifications | "Standing · 00:00 → 20:00", chip green | 14:41 → 15:01 |
| 6 | 0.65–0.72 | Still standing | **"20 minutes standing done — nice work."** with the credit earned | "Standing · 20:00", chip green, +1 point | 15:01 |
| 7 | 0.72–0.82 | Person presses the paddle's down button; the desk lowers; the chair is pulled back in | readout ticks 112 → 72 | "Lowering" | 15:02 |
| 8 | 0.82–0.90 | Person sits again; hands back on the keyboard | quiet | "Sitting · 00:00", chip amber, credit shown | 15:02 |
| 9 | 0.90–1.00 | **Away scenario (R-43):** the person stands, turns and walks out of frame; the chair stays; the beam keeps measuring an empty desk | "Away — timer paused" | "Away", chip slate, timer paused, limit reset | 15:05 |

- Reduced motion: nine posed frames, one per beat, switched by the buttons and by the section's
  scroll snap points; no tweens.
- The hero camera may make small moves per beat (a few degrees, a slight dolly for beat 3 toward
  the paddle) but never leaves the front-right family (§8.4); insets are not part of the story
  timeline — they are opened by hotspots.

## 12. Proposed task breakdown (for splitting into implementation tasks)

Points on the Fibonacci scale; Importance High / Medium / Low. Waves are ordered so each wave
lands a visibly better scene on the site.

### Wave A — fix what is wrong today (Importance High, 21 pts → AO route)

| Task | Requirements | Imp. | Pts |
|---|---|---|---|
| A1 Sensor enclosure: neutral tapered case, no sticker, cable and emitter at the narrow end; re-frame inset A | R-20, R-21, R-22 | High | 5 |
| A2 Cable: continuity, natural bend from the outlet, 90° plug and sideways exit; re-frame inset B | R-23, R-24, R-25 | High | 3 |
| A3 Figure proportions to §6: shoulders, waist, hips, neck, legs with taper; hybrid evaluated | R-26, R-27, R-28 | High | 8 |
| A4 Paddle to the right end with vertical buttons; rounder mouse; rounded-chair pan and backrest | R-30, R-29, R-18 | Medium | 3 |
| A5 Floor dot always in frame; jitter measured and removed | R-33, R-31 | High | 2 |

### Wave B — viewer (Importance High, 13 pts → subagents)

| Task | Requirements | Imp. | Pts |
|---|---|---|---|
| B1 Free orbit + zoom with limits, touch-safe; "Reset view"; coexistence with scroll | R-32, R-41, R-42 | High | 8 |
| B2 Hotspots + click-to-open insets + "show all" toggle; keyboard access | R-40 | High | 3 |
| B3 Homepage section ~2× larger, full-width; inset re-check matrix (state × theme × width) | R-35, R-34 | Medium | 2 |

### Wave C — the story (Importance Medium, 21 pts → AO route)

| Task | Requirements | Imp. | Pts |
|---|---|---|---|
| C1 Timeline `u` with beat table, scroll section ≈ 600 vh, reduced-motion beat frames | R-37 (beats 1–8 scaffolding) | High | 5 |
| C2 Phone on stand with its own persistent app screen + inset C | R-38 | Medium | 5 |
| C3 Wall clock with moving hands; ticking timers on phone and monitor; monitor content changes while standing | R-37 (time cues) | Medium | 3 |
| C4 Reach-and-press pose for the paddle (up and down); inset D | R-39 | Medium | 5 |
| C5 Chair choreography (push out / pull in) | R-44 | Low | 3 |

### Wave D — away (Importance Low, 8 pts → subagents)

| Task | Requirements | Imp. | Pts |
|---|---|---|---|
| D1 Walk-away pose and beat 9; Away state on both screens; limit reset | R-43 | Low | 8 |

Total: 63 pts across four waves. Wave A first; B and C are independent of each other after A.
