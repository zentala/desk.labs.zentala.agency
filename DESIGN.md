# DESIGN.md — Open Smart Desk

Status: **v2 draft for owner review, 2026-09-25** (E008d). Supersedes `astro/design.md` (v1, report-only).
Direction: **Warm workshop** (owner-approved base, E008b). Scope: the public website `desk.zentala.io`
(Astro 5 + Tailwind v4 + React 19 islands + three.js scenes). The MoveUp app has its own UI; the
website's notification replica MUST follow the app, never the other way round.

> A friendly workshop companion. It never scolds; it notices. One red laser line is the only sharp
> thing in a soft, flat-shaded world.

**MUST**, **SHOULD** and **MAY** are normative (RFC 2119). Anything not covered here is decided by
the closest rule in this file, then by `C:/code/meblarz/DESIGN.md` as the sibling reference for
*form* (not stack). Contrast ratios in §9 are computed (WCAG 2.x relative luminance), not estimated.

## 0. Tokens (machine-readable)

DTCG-shaped. `$value` is `{ light, dark }` for colour; other groups are theme-independent.
Code lives in `astro/src/styles/global.css` (`@theme`); this block is the source, the CSS is the build.

```json
{
  "$schema": "https://www.designtokens.org/tr/drafts/format/",
  "color": {
    "bg":            { "$type": "color", "$value": { "light": "#FAF7F2", "dark": "#14171C" }, "$description": "page background: warm paper / charcoal" },
    "surface":       { "$type": "color", "$value": { "light": "#FFFFFF", "dark": "#1E2229" }, "$description": "cards, toast, nav" },
    "surface-2":     { "$type": "color", "$value": { "light": "#F1ECE3", "dark": "#272C35" }, "$description": "inset panels, code, quotes" },
    "line":          { "$type": "color", "$value": { "light": "#E4DED4", "dark": "#2C313A" }, "$description": "hairlines, card borders (decorative)" },
    "line-strong":   { "$type": "color", "$value": { "light": "#89837A", "dark": "#6B7280" }, "$description": "input borders, non-text 3:1" },
    "ink":           { "$type": "color", "$value": { "light": "#1F2430", "dark": "#EDEAE3" }, "$description": "primary text" },
    "ink-muted":     { "$type": "color", "$value": { "light": "#5B6270", "dark": "#A3A9B5" }, "$description": "secondary text; the lightest allowed body text" },
    "brand":         { "$type": "color", "$value": { "light": "#E4572E", "dark": "#FF7A55" }, "$description": "Beam Coral: laser, nudge, brand mark (non-text use in light)" },
    "brand-strong":  { "$type": "color", "$value": { "light": "#C9461F", "dark": "#FF7A55" }, "$description": "filled primary button background" },
    "brand-text":    { "$type": "color", "$value": { "light": "#B8401D", "dark": "#FF7A55" }, "$description": "links and brand-coloured text" },
    "on-brand":      { "$type": "color", "$value": { "light": "#FFFFFF", "dark": "#1F2430" }, "$description": "text on brand-strong" },
    "teal":          { "$type": "color", "$value": { "light": "#1C7C74", "dark": "#3FB5A9" }, "$description": "Desk Teal: desk frame, secondary accent, code accents" },
    "teal-text":     { "$type": "color", "$value": { "light": "#176B64", "dark": "#3FB5A9" } },
    "focus":         { "$type": "color", "$value": { "light": "#1C7C74", "dark": "#3FB5A9" }, "$description": "2px ring, 2px offset" },
    "state": {
      "$description": "Each state has fill (non-text: 3D material, bars, icons), tint (chip/badge background) and text (on bg or on tint). Never put `text` on `fill`.",
      "sitting":  { "fill": { "$type": "color", "$value": { "light": "#F5C451", "dark": "#F2B33D" } }, "tint": { "$type": "color", "$value": { "light": "#FBECC4", "dark": "#3D3418" } }, "text": { "$type": "color", "$value": { "light": "#8A5A00", "dark": "#F2B33D" } }, "$description": "amber: normal, clock ticking. Not red, not a failure." },
      "standing": { "fill": { "$type": "color", "$value": { "light": "#4CC77A", "dark": "#4CC77A" } }, "tint": { "$type": "color", "$value": { "light": "#D9F2E2", "dark": "#183A28" } }, "text": { "$type": "color", "$value": { "light": "#1F7A44", "dark": "#4CC77A" } }, "$description": "green: up, earning credit" },
      "walking":  { "fill": { "$type": "color", "$value": { "light": "#8CCBEF", "dark": "#6FB8E8" } }, "tint": { "$type": "color", "$value": { "light": "#DCEEF9", "dark": "#1A3346" } }, "text": { "$type": "color", "$value": { "light": "#1B5E8A", "dark": "#6FB8E8" } }, "$description": "sky: moving, away from the desk but active; also a break" },
      "away":     { "fill": { "$type": "color", "$value": { "light": "#B8C2D1", "dark": "#8C9AAE" } }, "tint": { "$type": "color", "$value": { "light": "#E6EAF0", "dark": "#2A3140" } }, "text": { "$type": "color", "$value": { "light": "#5A6A80", "dark": "#8C9AAE" } }, "$description": "slate: paused, no judgment" },
      "nudge":    { "fill": { "$type": "color", "$value": { "light": "#E4572E", "dark": "#FF7A55" } }, "tint": { "$type": "color", "$value": { "light": "#FBE3DA", "dark": "#43241A" } }, "text": { "$type": "color", "$value": { "light": "#B8401D", "dark": "#FF7A55" } }, "$description": "the gentle ask; shares the brand hue on purpose" },
      "points":   { "fill": { "$type": "color", "$value": { "light": "#FFC83D", "dark": "#FFC83D" } }, "tint": { "$type": "color", "$value": { "light": "#FFF1C2", "dark": "#3F3416" } }, "text": { "$type": "color", "$value": { "light": "#8A6200", "dark": "#FFC83D" } }, "$description": "gold: score, session bonus. Replaces v1 'streak'." },
      "snoozed":  { "fill": { "$type": "color", "$value": { "light": "#C7B9E8", "dark": "#A996E0" } }, "tint": { "$type": "color", "$value": { "light": "#EEE9F8", "dark": "#2E2843" } }, "text": { "$type": "color", "$value": { "light": "#5B4A8A", "dark": "#A996E0" } }, "$description": "lilac: the user's choice, respected" }
    },
    "material": {
      "$description": "3D-only colours that are not UI tokens. Referenced by scene code; never used for text.",
      "desk-top":   { "$type": "color", "$value": { "light": "#E8D9BF", "dark": "#CDBB9E" } },
      "skin":       { "$type": "color", "$value": { "light": "#F0B7A0", "dark": "#F0B7A0" } },
      "sweater":    { "$type": "color", "$value": { "light": "#2F4A9C", "dark": "#2F4A9C" } },
      "pcb":        { "$type": "color", "$value": { "light": "#0F6B3A", "dark": "#0F6B3A" } },
      "copper":     { "$type": "color", "$value": { "light": "#D9B26F", "dark": "#D9B26F" } },
      "screen":     { "$type": "color", "$value": { "light": "#FFFFFF", "dark": "#FFFFFF" } }
    }
  },
  "font": {
    "display": { "$type": "fontFamily", "$value": ["Bricolage Grotesque", "Space Grotesk", "system-ui", "sans-serif"] },
    "body":    { "$type": "fontFamily", "$value": ["Inter", "DM Sans", "system-ui", "sans-serif"] },
    "mono":    { "$type": "fontFamily", "$value": ["JetBrains Mono", "ui-monospace", "monospace"] },
    "size":    { "$type": "dimension", "caption": "0.75rem", "small": "0.875rem", "body": "1rem", "lead": "1.125rem", "h4": "1.375rem", "h3": "1.75rem", "h2": "2.25rem", "h1": "3rem", "hero": "clamp(2.5rem, 6vw, 5rem)" },
    "leading": { "body": 1.55, "heading": 1.1, "mono": 1.5 },
    "tracking": { "heading": "-0.02em", "caption-upper": "0.06em" },
    "weight":  { "body": 400, "label": 500, "button": 600, "heading": 700 },
    "measure": { "$type": "dimension", "$value": "68ch" }
  },
  "space": { "$type": "dimension", "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px", "12": "48px", "16": "64px", "24": "96px", "32": "128px", "section": "96px", "section-lg": "128px", "gutter": "24px", "gutter-lg": "48px", "container": "1200px", "container-prose": "1024px" },
  "radius": { "$type": "dimension", "sm": "6px", "md": "12px", "lg": "20px", "xl": "28px", "pill": "999px" },
  "elevation": {
    "1": { "$type": "shadow", "$value": { "light": "0 1px 2px rgba(31,36,48,.06), 0 0 0 1px #E4DED4", "dark": "0 0 0 1px #2C313A" }, "$description": "cards" },
    "2": { "$type": "shadow", "$value": { "light": "0 12px 32px -12px rgba(31,36,48,.25)", "dark": "0 0 0 1px #2C313A, 0 12px 32px -12px rgba(0,0,0,.6)" }, "$description": "toast, popover" },
    "beam": { "$type": "shadow", "$value": { "light": "0 0 4px #E4572E", "dark": "0 0 6px #FF7A55" }, "$description": "the ONLY glow: laser beam / readout dot" }
  },
  "motion": {
    "duration": { "$type": "duration", "micro": "120ms", "standard": "200ms", "toast-in": "320ms", "toast-out": "200ms", "scene": "600ms", "idle-loop": "4s-8s" },
    "easing":   { "$type": "cubicBezier", "enter": [0.2, 0.8, 0.2, 1], "exit": [0.4, 0, 1, 1], "step": "steps(12)" },
    "spring":   { "allowed-on": ["points-increment", "stand-up-pop"], "damping": 0.8 }
  },
  "breakpoint": { "$type": "dimension", "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px" }
}
```

## 1. Product context

Open Smart Desk is a small open-source sensor under a height-adjustable desk plus a quiet tray app
(MoveUp). It does not move the desk. It knows the desk height and whether you are at the keyboard,
nudges after **40 minutes of present sitting**, and credits **every minute up as two minutes of sitting
cancelled** (MoveUp defaults, E005 PLAN §13). The website is a **pre-launch product page** with an
engineering build-log behind it. Audience: remote developers with a desk they stopped raising,
tinkerers, people who once stood and stopped. Tone: a colleague who taps your shoulder.

## 2. Direction: Warm workshop

- Warm paper light mode by default; charcoal-blue dark mode by `prefers-color-scheme`
  (a manual toggle MAY be added later; if added, it MUST persist and MUST respect the OS default first).
- **One sharp thing per scene:** the coral laser beam or the nudge toast is the only saturated element.
  Everything else is calm so that the beam and the ask can be loud.
- **Honest hardware:** real board, real cable, real screw holes. It is a kit, not a "device".
- **Sitting is amber, not red.** Sitting is normal. Only the nudge borrows the brand hue.
- Flat shading, 3–5 tone ramps, strong silhouettes, legible at 64 px and in a screenshot.

### Principles (do / don't)

| # | Principle | Do | Don't |
|---|---|---|---|
| 1 | Notice, don't nag | soft toast, calm copy, "1 minute counts" | red alerts, countdowns, "you failed", guilt metrics (calories, "sedentary!") |
| 2 | One sharp thing | coral beam **or** coral toast per view | multiple accents, gradients, glow on buttons/cards |
| 3 | Honest hardware | exposed PCB, USB-C, BOM numbers | glossy renders, hidden ports, holograms |
| 4 | Small wins are real | points that only go up, posture-change rate | penalties, broken-streak drama, leaderboards, streaks (the app has none) |
| 5 | Flat and legible | vertex colours, hemisphere + one key light | PBR, noise, texture, photoreal |
| 6 | Evidence, not claims | every number carries a source | fabricated metrics, testimonials, counters |

### Rejected alternatives

- **B. Lab notebook** (mono-heavy, blueprint blue, grid paper, cyan laser) — developer-native and cheap,
  but reads as a tinkerer-only tool and makes the nudge feel like a system alert. Its mono survives for specs.
- **C. Duolingo maximal** (lime/purple, mascot, bubbly type) — nails friendliness but makes a €500-desk
  owner's sensor look like a toy and weakens the honest-hardware story.
- **Keep v1 dark-green** (current site) — competent but generic "dark SaaS"; green glow on buttons and
  near-black backgrounds contradict "paper + one beam". Its report structure and container rhythm are kept (§13).

## 3. Colour rules

- Tokens name roles, not hues. Components MUST NOT introduce hex literals when a token exists.
- `brand` (light `#E4572E`) is 3.45:1 on paper: **non-text only** (beam, icons ≥ 24 px, large text ≥ 24 px/19 px bold).
  Text in the brand hue MUST use `brand-text`; filled buttons MUST use `brand-strong` + `on-brand`.
- In dark mode the filled button is coral with **ink text** (`on-brand` = `#1F2430`, 6.03:1), not white.
- `teal` is the secondary accent: desk frame, focus ring, code highlights, secondary button border.
  It is not a second CTA colour.
- State colours are hue-distinct **and** shape/label-distinct. Adjacent state fills are 1.1–1.3:1 against
  each other (measured), so a timeline or chip MUST carry an icon or label; colour alone is never the signal.
- `state.*.text` goes on `bg`, `surface` or the matching `tint`. It MUST NOT sit on `fill`
  (standing-text on standing-fill is 2.49:1 — fails).
- Green (`standing`) is no longer the link colour. Links are `brand-text`, underlined.

## 4. Typography

- Display: **Bricolage Grotesque** variable (opsz), 600–700, `-0.02em`, line-height 1.1. Hero uses opsz 96.
- Body/UI: **Inter** variable. 400 body, 500 labels, 600 buttons. `font-variant-numeric: tabular-nums`
  on every timer, height readout, score and stat.
- Mono: **JetBrains Mono** 400/500 for serial protocol, BOM, code, the laser readout ("72 cm → 112 cm").
- Scale is 1.25-ratio (see `font.size`). Body 16/1.55, max measure 68ch, body text never lighter than `ink-muted`.
- Fonts MUST be self-hosted (`astro/public/fonts/`, `woff2`, `font-display: swap`) with recorded licence
  (all three are OFL). The v1 Google Fonts `@import` goes away. Until the files land, the v1 pair
  (Space Grotesk / DM Sans) is the declared fallback in the stacks above, so nothing breaks mid-migration.
- Headings are sentence case. No all-caps except `caption-upper` eyebrows (12 px, 500, `+0.06em`).

## 5. Layout, spacing, shape, elevation

- 4 px base, scale in `space`. Section rhythm 96 px (128 px on `lg`). Container 1200 px, prose 1024 px.
  Gutters 24 px mobile / 48 px desktop. 12-column grid on `lg`, single column below `md`.
- Radii: `sm` 6 (inputs, chips-as-tags), `md` 12 (cards, buttons), `lg` 20 (toast, feature panels),
  `xl` 28 (hero scene frame), `pill` 999 **only for state chips** so a state always looks like a state.
  Buttons are `md`, not pills (v1 pills are dropped).
- Elevation is flat-first: `elevation.1` for cards, `elevation.2` for the toast and popovers, nothing else.
  Dark mode replaces shadow with a 1 px `line` border plus a `surface-2` lift. **The only glow is `elevation.beam`.**
- Card inside card is forbidden. Sections are separated by rhythm and hairlines, not by nested surfaces.

## 6. Motion

- Durations and easings from `motion`. Enter uses `easing.enter`, exit `easing.exit`.
- The nudge toast slides up 8 px and fades in over 320 ms. It MUST NOT shake, bounce or pulse red.
- Points increment: one scale to 1.08 and back (micro). Low-poly confetti: max 6 triangles, once per
  session bonus, never per stand.
- Laser: constant, opacity breathing 0.85→1 over 2 s; readout ticks with tabular numbers when the desk moves.
- Scroll-linked camera moves follow scroll position; they MUST NOT hijack scroll speed or lock the page.
- `prefers-reduced-motion: reduce` MUST: freeze 3D idle loops to a posed frame, replace scroll-driven camera
  with per-section steps, reduce toast to fade-only, drop confetti and springs, and disable `hover:-translate-y`.
  Global guard lives in `global.css`; components do not opt out.

## 7. Components

Shared rules: semantic HTML first; icons from `lucide-react` at 24 px grid, 1.75 px stroke, rounded joins;
custom icons only for the seven state glyphs (seated figure, upright figure, walking figure, empty stool,
hand wave, coin, crescent) and hardware (sensor, USB-C, desk-up chevron). No emoji in chrome.
Every interactive element uses `.focus-ring`. Every button is a `<button>` or `<a>`, never a `<div>`.

### LaunchCTA

One component, state from `astro/src/data/site.ts` (`launch: 'prelaunch' | 'launch' | 'launch-kit'`), never
from the section that renders it. Analytics events are constant (`cta_primary`, `cta_secondary`) with a `state` attribute.

| State | Primary (brand-strong) | Secondary (teal outline) | Micro-copy (ink-muted, 14 px) |
|---|---|---|---|
| `prelaunch` | Notify me at launch (email field + button, one row on `md`) | Build it yourself (DIY) → `/diy` | One email when the app ships. No newsletter. |
| `launch` | Download the app → `/app` | Get the sensor → `/diy` or shop | Free and open source. Sensor optional. |
| `launch-kit` | Order the sensor kit | Download the app | Ships from Poland. (only when true) |

MUST NOT render an email form without a working backend (PLAN §8.3). The `prelaunch` field is
`type="email"`, labelled, with inline error in `nudge.text` and the value preserved on error.

### NudgeToast (notification replica)

Replicates the MoveUp toast; the app is the source of truth for copy and layout (blocker: PLAN §8.4).
Surface `surface`, radius `lg`, `elevation.2`, 4 px left rule in `nudge.fill` (the one allowed coloured
border, because it *is* the brand moment), icon hand-wave, title 16/600, body 14/400, two actions:
primary text button "Standing up" and quiet "Later" (→ `snoozed`). Default copy (until verified in the app):
*"40 minutes sitting. A minute up buys two back."* Used in the 3D monitor via CSS3DRenderer and inline in `/how-it-works`.
No sound icon, no countdown, no red.

### StatCard (fact with source)

For `/why-stand` and the homepage proof. Number in `display` 36–48 px tabular, unit in `ink-muted`, one-line
claim, and a **mandatory** `<cite>` line: author/year, linked, in `small` mono. A StatCard without `source`
MUST fail typecheck (`source: { label, href }` required). Max 4 per row on `lg`, 1 per row on mobile.
No icons-in-circles, no coloured top border.

### StateChip

`pill`, `tint` background, `text` colour, filled 16 px state icon, label. Used in timelines, scene overlays,
the how-it-works cycle. Height 28 px; never used as a button.

### Section

`<section>` with optional eyebrow (`caption-upper`), h2 (`h2` size), lead (`lead`, `ink-muted`, max 68ch),
then content. Left-aligned by default; centred only for the hero and the final CTA. Alternate `bg` / `surface-2`
bands sparingly (max every third section). A scene island MAY sit beside or below the copy, never behind it.

### Nav and footer

Nav: `surface`, 1 px `line` bottom, 64 px tall, wordmark left (`display` 600), links `body` 500, one
LaunchCTA-primary compact (40 px) on the right, hamburger below `md` with a real `<dialog>`/disclosure.
Sticky, no blur/glass. Footer: `surface-2`, three columns (product, build, project), licence line,
"Engineering build-log" link, no newsletter form (the CTA already exists), no social wall.

### Build-log report components (kept from v1)

`ProjectMasthead`, `WorkstreamLedger`, `VersionList`, `DecisionRecord` (Context · Considered · Rejected ·
Why · Decision · Trade-off · Mitigation), `Figure` (real asset, alt, visible caption), `PhotoGallery`,
`ArchiveLink`, `ReportNav` live under `/build-log`. They keep `container-prose` (1024 px), row-based ledgers,
and the rule that unknown evidence renders as an explicit open item. They are re-skinned to the new tokens:
`report-surface → surface`, `report-muted → ink-muted`, `report-divider → line`, `status-* → state.*` where a
match exists (in-use → standing, in-review → sitting, planned → walking, in-design → snoozed, archived → away).
Build-log pages MUST NOT import LaunchCTA email mode, StatCard marketing variants, or any 3D island.

## 8. 3D art direction (three.js / react-three-fiber)

**Family rule:** every scene is the same room, same camera family, same six materials, same character rig.
Change the pose and the toast, never the world.

- **Stack:** `three` + `@react-three/fiber` v9 (React 19) + `drei` where it saves code; procedural geometry
  for desk, sensor, monitor, stool, cable; CC0/CC-BY character with recorded licence and source in
  `astro/public/models/LICENSES.md`. Copy patterns from `meblarz` `scene-viewport`, not the package (E009).
- **Materials:** `MeshLambertMaterial`, `flatShading: true`, vertex colours, zero image textures.
  Mapping: floor/wall → `bg`; desk top → `material.desk-top`; desk frame → `teal`; stool seat → `state.sitting.fill`;
  character → `material.skin` + `material.sweater` (a sweater, not a suit); monitor → `ink`; screen → `material.screen`;
  PCB → `material.pcb` + `material.copper`; laser → `brand` emissive with `elevation.beam`. Dark mode swaps `bg`,
  `desk-top` and the beam only. Scene code reads these from one `scene-palette.ts` that imports the token values;
  no hex in scene files.
- **Poly budget:** desk ≤ 800 tris, stool ≤ 200, monitor ≤ 300, sensor ≤ 150, character ≤ 1500; hero scene ≤ 4000
  tris, ≤ 6 draw calls; 60 fps on integrated GPU; `dpr` capped at 1.5.
- **Lighting:** one `HemisphereLight` (sky `#FFFFFF`, ground `line`, 0.9) + one `DirectionalLight` key from
  upper-left-front (0.7, 1024 shadow map, only character and desk cast). No point lights except the laser emissive.
- **Camera:** 35 mm perspective, eye height, 3/4 view from front-left, no dutch angle. Hero: orbit ±6° on pointer,
  none on touch. Section scenes: fixed lens, framing changes only.
- **Character:** genderless, ~7 heads tall, two dot eyes, hoodie/sweater, socks. Rig: sit, stand-up (0.8 s),
  walk-away, jumping jacks (1.2 s loop), stretch. Chunky keyframes with `steps(12)` feel.
- **Laser:** thin cylinder from sensor to floor, coral dot on the floor, floating mono readout of real heights
  (e.g. 72 cm / 112 cm). The beam is the product's proof; it is in every scene, even the empty-desk one.
- **Scene family (E009):** hero (sit → toast → stand, points +1), how-it-knows triptych, the kit exploded,
  the not-a-nag 8-hour timeline (amber/green/sky/slate segments, three nudge marks, silence after the third),
  away = empty stool, walk-away footer loop, jumping-jacks easter egg. No "streak" scene (the app has no streaks).
- **Delivery:** every scene is an Astro island with `client:visible`, dynamic-imported so `three` is its own chunk
  and never enters the shared bundle. Each scene ships a static **WebP render of the same scene** (`<img>` with alt)
  as the no-JS/`reduced-motion`/pre-hydration fallback, rendered headless from the same code, 2× and 1× sizes,
  `loading="lazy"` except the hero (eager, it is the LCP). Build-log, blog and `/why-stand` load no 3D.

## 9. Accessibility

Minimum WCAG 2.2 AA. Measured ratios (WCAG 2.x, sRGB):

| Pair | Light | Dark | Verdict |
|---|---|---|---|
| `ink` / `bg` | 14.52 | 14.95 | AAA |
| `ink-muted` / `bg` | 5.74 | 7.61 | AA |
| `ink-muted` / `surface-2` | 5.21 | 6.76 | AA |
| `brand-text` / `bg` | 5.19 | 6.99 | AA |
| `brand-text` / `surface-2` | 4.71 | 6.21 (on surface) | AA |
| `on-brand` / `brand-strong` (button) | 4.80 | 6.03 | AA |
| white / `brand` (light) | 3.68 | — | large text/icons only |
| `teal-text` / `bg` | 5.91 | 7.18 | AA |
| `focus` / `bg`, `focus` / `surface` | 4.70 / 5.02 | 7.18 | ≥ 3:1 non-text |
| `line-strong` / `bg` (input border) | 3.51 | 3.72 | ≥ 3:1 non-text |
| `line` / `bg` | 1.25 | 1.38 | decorative only |
| `sitting.text` / `tint`, / `bg` | 5.05 / 5.55 | 6.63 / 9.66 | AA |
| `standing.text` / `tint`, / `bg` | 4.52 / 5.01 | 5.83 / 8.35 | AA |
| `walking.text` / `tint`, / `bg` | 5.85 / 6.52 | 6.04 / 8.29 | AA |
| `away.text` / `tint`, / `bg` | 4.57 / 5.16 | 4.56 / 6.29 | AA |
| `nudge.text` / `tint`, / `bg` | 4.51 / 5.19 | 5.42 / 6.99 | AA |
| `points.text` / `tint`, / `bg` | 4.86 / 5.13 | 7.92 / 11.62 | AA |
| `snoozed.text` / `tint`, / `bg` | 6.32 / — | 5.41 / 6.95 | AA |
| `ink` on `sitting.fill` / `standing.fill` | 9.53 / 7.21 | — | AA (only if text ever sits on a fill) |
| **`standing.text` on `standing.fill`** | **2.49** | — | **FAIL — forbidden** |
| state fills vs each other | 1.10–1.32 | — | need icon + label |

- Focus: `.focus-ring` = 2 px `focus` ring, 2 px offset, on **every** interactive element (v1 covered 6 files; now global).
- Touch targets ≥ 44 × 44 px; nav links and chips get padding, not a smaller hit area.
- Every scene island has an `aria-label` describing the pose and a text equivalent of the toast nearby.
  Canvas is `role="img"`; interaction is optional, never required to read content.
- Reduced motion per §6. Reduced transparency: no blur exists to remove.
- Colour is never the only carrier of state; StateChip always has icon + label.
- Testing: axe in CI on the built pages is the safety net; hero, LaunchCTA and nav are checked by keyboard in
  a real browser per release.

## 10. Content voice (from E006)

- Core message: *Your desk already goes up. Now something knows if you do.* Pillars: **It knows you actually
  stood up · A nudge, not an alarm · Open source. Local data. Your desk.**
- Numbers on the site follow MoveUp defaults: **40 min** sitting → nudge; **1 min** minimum break; **1 min up =
  2 min of sitting cancelled**; 15 min = full break bonus; **90 min** standing → "sit down" nudge; the KPI is the
  **posture-change rate** (≥ 1/h green, ≥ 0.5/h amber); scoring is points, not streaks. The story is
  "change position", not "stand two minutes".
- Every statistic carries a citation (StatCard `source` is required). No number without a link; no rounding a
  study into a slogan; `/why-stand` carries "not medical advice".
- **What not to say:** testimonials, counters, star ratings, press logos, "pre-orders 73 %"; medical claims
  ("cures back pain", "burns X kcal"); "smart desk", "automatic", "AI" in the hero; "streaks", "XP", "levels";
  kit prices, OEM, consortium, grants; shame ("you've been sitting 2 hours!!"); launch dates or platforms the repo
  does not confirm; DIY price in PLN (EUR or no amount, owner decision).
- Register: second person, present tense, short sentences, one idea per line. Celebrate the minute up; never
  score the minute down. Sentence case everywhere.

## 11. Anti-patterns (AI slop and ours)

Purple/indigo gradients · gradient buttons · glow on anything but the beam · glassmorphism/blur · three-column
icon-in-circle grids · everything centred · uniform bubbly radius · card inside card · coloured left border on cards
(except the toast) · decorative blobs and waves · emoji as UI · stock 3D "device" renders · PBR/metallic materials ·
mascot-first layouts · hero copy like "Unlock the power of…" · red for sitting · countdowns · fabricated metrics,
testimonials, counters, social walls · JSON-LD `Product` with prices for an unsold product · `client:load` for 3D ·
Google Fonts CDN · hex literals in components · `<div onClick>` buttons · hover-only actions · streak flames.

## 12. Agent instructions

1. Read this file before any UI change. `astro/CLAUDE.md` covers structure; this file covers look, motion, voice.
2. Tokens live **only** in `astro/src/styles/global.css` under `@theme` (Tailwind v4 CSS-first) with names mirrored
   from §0: `--color-bg`, `--color-surface`, `--color-ink`, `--color-brand-strong`, `--color-state-sitting-fill`,
   `--color-state-sitting-tint`, `--color-state-sitting-text`, `--radius-md`, `--shadow-1`, `--font-display`, etc.
   Dark values go in `@media (prefers-color-scheme: dark)` overriding the same custom properties, so utilities such
   as `bg-bg text-ink border-line bg-state-sitting-tint` work in both themes without `dark:` prefixes.
3. Use utilities generated from tokens (`bg-surface`, `text-ink-muted`, `rounded-md`, `shadow-1`). Never `bg-[#…]`.
   Shared primitives (`.btn-primary`, `.btn-secondary`, `.focus-ring`, `.section-container`, `.report-container`)
   stay in `@layer components`; extend them, do not re-implement inline.
4. 3D code reads colours from `astro/src/scenes/scene-palette.ts`, which imports the same values. No hex in scenes.
5. New component only if two real consumers exist or an accessibility contract needs it. Prefer native HTML.
6. Before you claim a colour pair is accessible, compute it (§9 method); do not eyeball.
7. Do not add: a font, an accent colour, a shadow level, a radius, an animation library, or a UI kit
   (Radix/shadcn/etc.) without an ADR and a row in §14.
8. Sample prompts: *"Build the hero per DESIGN.md §7 Section + §8 hero scene, prelaunch LaunchCTA."* ·
   *"Re-skin `/build-log` per §7 build-log mapping; no 3D."* · *"Add a StatCard row for /why-stand with sources from E007."*
9. Definition of Done for a UI change: typecheck, `npm run build` green, axe clean on changed pages, keyboard pass,
   reduced-motion pass, both themes screenshotted (before/after), bundle size noted if a scene was touched.

## 13. Migration from v1 tokens

| v1 (`global.css`) | v2 | Note |
|---|---|---|
| `--color-dark-900/800/700` (page, surface, card) | `bg` / `surface` / `surface-2` (dark values) | dark becomes a theme, not the default |
| `--color-dark-600/500` (borders) | `line` / `line-strong` | |
| `--color-brand-green` (CTA + links) | `brand-strong` (CTA), `brand-text` (links) | green stops being the brand |
| `--color-brand-green-light` (hover) | `brand` (hover of `brand-strong` in light: `#E4572E`; dark: lighten 6 %) | |
| `--color-muted` `#94a3b8` | `ink-muted` | |
| `--shadow-glow` | removed; `elevation.beam` for the laser only | |
| `--shadow-card` | `elevation.1` | |
| `--color-report-surface/muted/divider` | `surface` / `ink-muted` / `line` | aliases MAY stay one release |
| `--color-status-in-use/in-review/planned/in-design/archived` | `state.standing/sitting/walking/snoozed/away .text` | same meaning, new hue |
| Space Grotesk / DM Sans via Google CDN | Bricolage Grotesque / Inter self-hosted; v1 pair as fallback | |
| `rounded-full` buttons | `rounded-md` (12 px) | pill reserved for StateChip |
| `.btn-primary` `hover:-translate-y-0.5` | kept, guarded by reduced-motion | |
| `.focus-ring` (6 files) | global on every interactive element | |
| undefined `ink`/`fog`/`card`/`shadow-soft` classes in dead components | delete the components (E008a rec. 1); `ink` now exists with a different meaning, so grep first | |
| `preorder-count.json`, SocialProof, SocialWall, ReferralProgram, Product JSON-LD | removed, not migrated | PLAN §7 |

Keep from v1: single `@theme` source, report/LP import boundary (now build-log/product), Astro-only report
components, `container-prose` 1024 px, decision-record fields, Lucide-only icons, row-based ledgers.

## 14. Decisions

| Date | Decision | Rejected | Why |
|---|---|---|---|
| 2026-09-25 | Warm workshop as base | Lab notebook, Duolingo maximal, keep dark-green | holds "honest hardware" and "kind companion" at once; single accent gives 3D and UI one signature |
| 2026-09-25 | Light default, dark by OS preference | dark-only (v1) | paper reads as a workshop; dark stays for developers' OS settings |
| 2026-09-25 | Coral = brand + nudge; teal = secondary/focus | green brand (v1), coral + purple | the ask and the brand are the same moment; green is freed for "standing" |
| 2026-09-25 | Sitting is amber | sitting red | sitting is normal, not failure (principle 1) |
| 2026-09-25 | `points` and `walking` replace `streak` | keep streak token from E008b | MoveUp has points and posture changes, no streaks (PLAN §13) |
| 2026-09-25 | State tokens split into fill/tint/text | E008b fill+text pairs | measured: text on fill fails AA in light (2.49:1) |
| 2026-09-25 | Bricolage + Inter + JetBrains Mono, self-hosted | Space Grotesk + DM Sans via CDN | warmer display, better numerals, no third-party request |
| 2026-09-25 | Buttons 12 px radius, pill only for chips | pill buttons (v1) | a state must look like a state |
| 2026-09-25 | Flat-shaded procedural 3D, `client:visible`, WebP fallback | Blender renders only; `client:load` | one code path = scene + image; no 3D in the shared bundle |
| 2026-09-25 | Tokens as DTCG JSON in this file, built into `@theme` | separate `tokens.json` | one file for humans and agents; split later if a build step needs it |

## 15. Sources

- [W3C DTCG token format](https://www.designtokens.org/tr/drafts/format/) · [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) ·
  [Focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance) · [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [Tailwind v4 theme variables](https://tailwindcss.com/docs/theme) · [Astro client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) · [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) · [Inter](https://rsms.me/inter/) · [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- Internal: `C:/code/meblarz/DESIGN.md` (form), E005 `PLAN.md` §12–13, wave1 `E006`, `E008a`, `E008b`, `E008c`.

Open for the owner: DIY price format (EUR vs none), dark-mode toggle (yes/no), real MoveUp toast copy and layout,
build-log route name (`/build-log` per PLAN §12 vs `/journal` in E006), CC0 character source.
