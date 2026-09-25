# E008b — Blind design proposal: Open Smart Desk

Designed from first principles, without access to the existing site. Scope: brand, tokens,
type, motion, icons, low-poly 3D art direction, homepage illustration list, alternatives.

## 1. Brand personality

**A friendly workshop companion.** Open-source hardware warmth (exposed PCB, hand-soldered
honesty) meets Duolingo-grade kindness. It never scolds; it notices. The voice is a colleague
who taps your shoulder, not a coach with a whistle. Adjectives: warm, precise, playful, honest,
unhurried. The visual signature is **one red laser line** — the only sharp, saturated element on
a soft, flat-shaded world. Everything else is calm so that the beam and the nudge can be loud.

## 2. Design principles (do / don't)

1. **Notice, don't nag.** Do: soft nudges, rounded cards, celebratory copy for 2-minute stands.
   Don't: red alerts, countdown timers, "you failed" states, guilt metrics (calories, "sedentary!").
2. **One sharp thing per scene.** Do: let the laser beam / the nudge toast be the single saturated
   accent. Don't: multiple competing accent colours, gradients on everything, glow everywhere.
3. **Honest hardware.** Do: show the real board, the USB-C cable, the screw holes; call it a kit.
   Don't: fake glossy renders of a "device", hidden ports, sci-fi holograms.
4. **Small wins are real wins.** Do: streak flames, "2 minutes counts", progress that only goes up.
   Don't: penalties, broken-streak drama, leaderboards.
5. **Flat and legible everywhere.** Do: flat shading, 3–5 tone ramps, strong silhouettes, works at
   64 px and in a screenshot. Don't: PBR realism, noise, texture, photoreal lighting.

## 3. Color system

Warm paper light mode, charcoal-blue dark mode. Semantic states are hue-distinct AND
shape/icon-distinct (never colour alone). Ratios below are WCAG 2.x, measured.

### Core tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#FAF7F2` | `#14171C` | page background (warm paper / charcoal) |
| `--surface` | `#FFFFFF` | `#1E2229` | cards, toasts |
| `--surface-2` | `#F1ECE3` | `#272C35` | inset panels, code blocks |
| `--line` | `#E4DED4` | `#2C313A` | hairlines, borders |
| `--ink` | `#1F2430` | `#EDEAE3` | primary text |
| `--ink-muted` | `#5B6270` | `#A3A9B5` | secondary text |
| `--brand` | `#E4572E` | `#FF7A55` | "Beam Coral" — laser, primary buttons, nudge |
| `--brand-strong` | `#C9461F` | `#FF7A55` | filled button background (light needs the deeper tone) |
| `--brand-text` | `#B8401D` | `#FF7A55` | links, text-on-bg in brand hue |
| `--teal` | `#1C7C74` | `#3FB5A9` | "Desk Teal" — secondary accent, desk frame, code |
| `--teal-text` | `#176B64` | `#3FB5A9` | teal as text |
| `--focus` | `#1C7C74` | `#3FB5A9` | 2 px focus ring, 2 px offset |

### Semantic state tokens (fill / text / icon)

| State | Light fill | Light text | Dark fill+text | Icon | Meaning |
|---|---|---|---|---|---|
| `--state-sitting` | `#F5C451` | `#8A5A00` | `#F2B33D` | seated figure | fine, clock ticking |
| `--state-standing` | `#4CC77A` | `#1F7A44` | `#4CC77A` | upright figure, chevron up | good, counting |
| `--state-away` | `#B8C2D1` | `#5A6A80` | `#8C9AAE` | empty stool | paused, no judgment |
| `--state-nudge` | `#E4572E` | `#B8401D` | `#FF7A55` | hand wave | the gentle ask |
| `--state-streak` | `#FFC83D` | `#8A6200` | `#FFC83D` | flame | habit momentum |
| `--state-snoozed` | `#C7B9E8` | `#5B4A8A` | `#A996E0` | crescent | user's choice, respected |

Sitting is **amber, not red** on purpose: sitting is normal, not a failure. Only the nudge
borrows the brand coral, so "the brand moment" and "the ask" are the same colour.

### Contrast (measured)

Light: ink/bg 14.5:1; ink-muted/bg 5.7:1; brand-text/bg 5.2:1; white on `--brand-strong` 4.8:1
(white on plain `--brand` is only 3.7:1 → large text/icons only); teal-text/bg 5.9:1;
sitting-text 5.6:1; standing-text 5.0:1; away-text 5.2:1; nudge-text 5.2:1; streak-text 5.1:1.
Dark: ink/bg 15.0:1; ink-muted/bg 7.6:1; brand/bg 7.0:1 (and ink on brand 7.0:1, so dark
buttons use ink text on coral); teal 7.2:1; sitting 9.7:1; standing 8.4:1; away 6.3:1;
nudge 7.0:1; streak 11.6:1. All body/text pairs ≥ 4.5:1 (AA); fills used as chips carry
the matching `-text` token, never white text on amber/green/gold.

## 4. Typography

- **Display / headings:** `Bricolage Grotesque` (Google Fonts, variable, opsz). Weight 600–700,
  optical size 96 for hero, tight tracking (-0.02em). Friendly, slightly quirky, not corporate.
- **Body / UI:** `Inter` (variable). 400 body, 500 labels, 600 buttons. Tabular figures for
  timers and streaks (`font-variant-numeric: tabular-nums`).
- **Mono (specs, protocol, code):** `JetBrains Mono` 400/500 — speaks to the developer audience.
- Scale (rem, 1.25 ratio, base 16px / line 1.55): 12 caption · 14 small · 16 body · 18 lead ·
  22 h4 · 28 h3 · 36 h2 · 48 h1 · 64/80 hero (clamp with vw). Headings line-height 1.1.
- Max measure 68ch. Body text never lighter than `--ink-muted`.

## 5. Spacing, radii, elevation

- Spacing scale (4px base): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Section rhythm 96/128.
- Container 1200px, 24px gutters mobile, 48px desktop. 12-col grid.
- Radii: `--r-sm` 6 (chips, inputs) · `--r-md` 12 (cards, buttons) · `--r-lg` 20 (toasts, feature
  panels) · `--r-xl` 28 (hero canvas frame) · pill 999 for tags. Buttons are 12, not pills — the
  pill is reserved for state chips so a state always looks like a state.
- Elevation (flat-first, two levels only):
  `--shadow-1`: `0 1px 2px rgba(31,36,48,.06), 0 0 0 1px var(--line)` (cards)
  `--shadow-2`: `0 12px 32px -12px rgba(31,36,48,.25)` (the nudge toast, popovers)
  Dark mode: replace shadows with a 1px `--line` border + `--surface-2` lift. No glows except the
  laser (a 4px coral bloom on the beam only).

## 6. Motion

- Durations: micro 120ms (hover, toggles) · standard 200ms (cards, chips) · toast 320ms in /
  200ms out · scene transitions 600ms · idle 3D loops 4–8 s.
- Easing: `cubic-bezier(.2,.8,.2,1)` (ease-out-quint-ish) for enter; `cubic-bezier(.4,0,1,1)`
  for exit; springs only for the streak flame and the stand-up "pop" (mild, damping .8).
- The nudge toast **slides up 8px and fades**; it never shakes, bounces or pulses red.
- Streak counter increments with a 1-frame scale to 1.08 and back; confetti is 6 low-poly
  triangles max, once per milestone, not per stand.
- Laser beam: constant, with a slow 2 s breathing opacity 0.85→1; the measured-height readout
  ticks with tabular numbers when the desk moves.
- `prefers-reduced-motion`: all 3D idle loops freeze to a posed frame, scroll-driven camera
  becomes step-based on section change, toast fades only, no confetti, no spring.
- Scroll: camera moves are tied to scroll position, but never hijack scroll speed.

## 7. Iconography

- Style: 24px grid, 1.75px stroke, rounded caps and joins, 2px corner radius — a "soft
  technical" line set. Filled variants only for the six state icons (so states read at 16px).
- Base set: Lucide (open, matches stroke language) + custom: seated figure, standing figure,
  empty stool, laser sensor, USB-C plug, desk-up chevron, flame, hand wave, crescent.
- State icons double as the 3D character's silhouette poses — same shapes at every scale.
- Never use emoji in UI chrome; emoji allowed in blog prose only.

## 8. 3D art direction (three.js, low-poly, flat shading)

**One family rule:** every scene is the same room, same camera family, same six materials,
same character rig. Change the pose and the toast, never the world.

- **Materials (all `MeshLambert`/flat, no metalness/roughness maps):**
  paper `#FAF7F2` (floor, wall), desk top `#E8D9BF` warm birch, desk frame `--teal #1C7C74`,
  stool seat `--state-sitting #F5C451`, character `#F0B7A0` skin + `#2F4A9C` sweater (a
  sweater, not a suit), monitor `#1F2430` with screen `#FFFFFF`, cable/PCB `#0F6B3A` green
  solder mask with `#D9B26F` copper pads, laser `--brand #E4572E` emissive with 4px bloom.
  Dark mode swaps only paper→`#1E2229`, desk top→`#CDBB9E`; the beam gets brighter (`#FF7A55`).
- **Poly budget:** desk ≤ 800 tris, stool ≤ 200, monitor ≤ 300, sensor ≤ 150, character ≤ 1500,
  full hero scene ≤ 4000 tris, ≤ 6 draw calls per scene, one 512px shared palette texture
  (vertex colours preferred; zero image textures otherwise). Target 60fps on integrated GPU.
- **Lighting:** one hemisphere light (sky `#FFFFFF`, ground `#E4DED4`, 0.9) + one directional
  key from upper-left-front (0.7, soft shadow 1024 map, only the character and desk cast).
  No point lights except the laser emissive. Shadows are flat, slightly warm.
- **Camera:** 35mm perspective, eye height, 3/4 view from the front-left; no dutch angle.
  Hero: slow orbit ±6° on mouse. Section scenes: fixed, same lens, framing changes only.
- **Character:** genderless, ~7 heads tall, no facial features except two dot eyes, a hoodie/
  sweater, socks. Rig: sit, stand-up (0.8 s), walk-away, jumping jacks (loop 1.2 s), stretch.
  Movement is chunky and keyframed (12 fps feel via step easing) to match low-poly.
- **Laser beam:** a thin cylinder from sensor to floor, with a small `#E4572E` dot on the
  floor and a floating readout "72 cm / 112 cm" in mono — the beam is the product's proof.
- **Nudge on the monitor:** a real HTML toast composited in the bottom-right of the screen
  plane (CSS3DRenderer or a texture), using the actual UI toast component — the 3D world and
  the app UI share tokens, which is what makes it feel like one product.

## 9. Homepage illustration list

1. **Hero:** full scene, character sitting, beam on, toast just appeared: "45 min sitting.
   Stand for 2 minutes?" — interactive orbit; click the toast → character stands, streak +1.
2. **How it knows (3-panel):** sensor under desk with beam (a); desk raised, readout jumps (b);
   character standing, state chip flips amber→green (c).
3. **The kit:** exploded low-poly PCB + ToF module + USB-C cable, labelled, exact-board honest.
4. **Not a nag (timeline):** 8-hour bar with amber/green/away segments and 3 nudge marks.
5. **Away = no guilt:** empty stool, beam still on, chip "away", toast absent.
6. **Streak:** 7 tiny desks in a row, flame grows; day 4 is a 2-minute stand — still counts.
7. **Jumping jacks (easter egg):** character doing jacks on the standing pause; used for the
   "even 2 minutes" section.
8. **Open source:** monitor showing a terminal with the serial protocol, PCB on the desk.
9. **Walk-away loop** for the footer / 404: character leaves, beam keeps measuring an empty desk.

## 10. Alternatives considered

- **B. "Lab notebook" (mono-heavy, blueprint blue, grid paper, cyan laser).** Very developer-
  native and cheap to build, but it reads as a tool for tinkerers only; it undercuts the habit/
  warmth promise and would make the nudge feel like a system alert. Kept its mono for specs.
- **C. "Duolingo maximal" (saturated lime/purple, big mascot, bubbly type).** Nails
  friendliness and streak energy, but a mascot-first look makes the sensor look like a toy and
  weakens the "honest hardware" story for people who already own a €500 desk.
- **Chosen: A. "Warm workshop"** — paper background, one coral beam, teal frame, soft-technical
  icons. It holds both truths at once: real open hardware and a kind habit companion, and the
  single-accent rule gives the 3D scenes and the UI toast an unmistakable shared signature.
