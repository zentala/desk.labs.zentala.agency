# Backlog

## Program map

- [ROADMAP.md](ROADMAP.md) — the whole program: streams, critical path, the two homes.

## Epics

- [E001 — Site rebuild: consolidation + funnel/infra plumbing + cutover](epics/E001-2026-07-15-site-rebuild/PLAN.md) — planned, approved; infra scope after the 2026-07-28 split.
- [E002 — Versioned status-report content system + article v0.2](epics/E002-2026-07-28-status-report/PLAN.md) — planned; the portfolio/article half of the old E001.
- [E003 — TS Circuit carrier board for Hardware v2](epics/E003-2026-09-01-tscircuit-carrier-board/PLAN.md) — in progress; candidate source and review portal exist, physical evidence and external review are pending.

## Active

- Finish cleanup after separating the repository into explicit legacy and active website tracks.
- Move or rewrite legacy root documentation so it does not describe the Astro app.
- Confirm the real deployment state of `desk.zentala.io`.
- Define a temporary preview deployment for Astro, likely `dev.` or `demo.`.
- Replace the placeholder waitlist implementation with a real integration.
- Add tests and a basic DX pipeline for `astro/`.

## Notes

- Keep the old website as migration input or archive material unless a later decision says otherwise.
- Do not delete legacy assets before the new information architecture is stable.

## 2026-09-01 — Hardware v3 sensor and haptic variants

Build follow-on Open Smart Desk PCB variants from JLCPCB-available parts after
the E003 carrier-board review is complete. These variants should remain
compatible with the same desktop application and USB data model where practical:

- **Presence/vibration experiment:** add a vibration or accelerometer sensor and
  test the hypothesis that desk vibration can help distinguish a person actively
  working at the desk from an empty desk. Treat this as an experiment, not a
  product assumption: compare it with keyboard/mouse activity and test false
  positives from desk motors, typing, floor movement and nearby equipment.
- **Haptic feedback experiment:** add a small vibration motor/actuator to test
  whether a local physical nudge helps a user change posture. Define intensity,
  duration, opt-out behaviour and noise/comfort constraints before productizing.
- **Button-panel board:** design a separate board for desk-facing controls such
  as up/down buttons and related user input. Clarify later whether it observes
  controls only or integrates with a particular desk controller; do not assume
  mains or motor-control scope.
- **Reusable board family:** retain a common USB protocol, firmware/application
  compatibility, manufacturing documentation and review-portal structure so the
  simple carrier board, extended sensor board and button panel can evolve as one
  product family.

Before promoting any item to an epic, choose the exact sensors/actuator,
validate voltage/current requirements, confirm JLCPCB availability and assembly
constraints, and obtain an external electronics review.

## 2026-09-02 — Product truth, enclosure, and future site presentation

Defer all changes to the current pre-order landing page until the carrier-board
design and enclosure are ready to show. Treat the current page as an outdated
funnel, not as the product's final public presentation.

When product and physical-design evidence is ready, revisit the website with
these requirements:

- **Describe the complete system accurately.** The value is a desktop
  application plus a small desk-height sensor, not a sensor alone. The sensor
  measures desk height and sends it to the computer. The desktop application
  combines that height signal with local mouse/keyboard activity to determine
  whether the person is active at the computer, count relevant sitting and
  standing time, and send context-aware motivation to change position. Avoid
  wording that implies that the sensor itself tracks time, presence or user
  activity.
- **Reconsider product naming and open-source positioning.** Explore a concise
  name/headline around "Haters' Table" and the idea of a desk sensor with a
  companion application that motivates the user to stand. Decide explicitly
  what is open source (software, hardware designs, protocol, or none of these)
  only after deciding the commercial and certification model; do not make a
  broad open-source claim by default.
- **Refresh visual hierarchy.** Replace the compressed display treatment used
  for "Open Source Desk Sensor" and "Your Standing Desk" with a more distinctive
  and readable headline font, while keeping the current body-text direction if
  it remains appropriate. Use Lucide-style outline icons in place of Unicode
  emoji/symbol icons throughout: section headings, the timeline, form fields
  such as the email input, and related UI. Colour icons intentionally rather
  than relying on text glyphs.
- **Fix timeline spacing.** In "How this started", give the content cards a
  visible gap from the vertical timeline line instead of allowing the boxes to
  touch it. Re-evaluate the full section's rhythm after the copy and imagery
  are updated.
- **Use physical proof on the site.** After the PCB is manufactured from the
  project design, design an enclosure around the actual board and connector
  geometry. Then photograph/render the assembled device and show the real board,
  enclosure and installation on the website. Do not market a finished physical
  product before this evidence exists.
- **Revisit commercial offer only after prototype evidence.** Park the current
  multi-tier pre-order/pricing discussion. Later evaluate a single product offer
  rather than Basic/Pro tiers; the working starting hypothesis is one "Basic"
  device around EUR 200, with a possible price nearer EUR 79 considered only as
  an alternative. Account for JLCPCB manufacturing, enclosure, support,
  fulfilment, taxes, margin, and the cost and scope of applicable European
  conformity/compliance work before publishing a price or accepting pre-orders.
  Do not use fabricated preorder counts, scarcity, testimonials, results or
  checkout links.
- **Replace misleading comparisons and claims.** Revisit the existing
  "EUR 800 spent on a motorized standing desk" story and use a more credible
  benchmark if it is retained (the suggested direction was roughly EUR 200).
  All metrics, testimonials, comparisons, availability and claims must be
  verifiable or omitted.

Before creating a sales page or spending on certification, run a staged
validation path: finish the desktop application enough for personal daily use,
collect real usage evidence, complete a manufacturable PCB and enclosure,
make a small number of prototypes, test installation and retention with real
users, and obtain a scoped compliance quote for the intended product and
markets. Use the evidence to decide between an open reference design,
open-source software with paid hardware, a limited paid hardware product, or
stopping the hardware sale while keeping the software/research public.

## 2026-09-02 — MoveUp and a block-based public progress page

The desktop application already exists under the name **MoveUp**. Use that
name in future product and website work rather than treating the companion app
as hypothetical or unnamed. Locate and record the application's source,
current build/run state, supported operating systems, and the evidence that can
truthfully be shown on the project page before making public claims about it.

Restore the useful information architecture of the earlier block-based R&D
site, whose source remains in repository history (commit `a65a569`, "Initialize
Astro site and add W1 summary"). The public homepage should make current project
progress legible at a glance through separate, honest blocks, for example:

- MoveUp desktop application: what already works, what is being completed, and
  what evidence/screenshots exist;
- sensor and carrier board: design, manufacture and review status;
- enclosure: not started / design / prototype / validated, with real images
  when available;
- real-world testing: own daily use, prototype users and findings;
- next milestone and open decisions.

Reuse the earlier page's pattern of describing what worked, what failed, costs,
hardware, software and next steps, but rewrite it from verified current facts.
Do not carry forward obsolete v0.1 claims about automatic desk control, old
hardware architecture or an unfinished device as if they described the current
product.

- [x] **`astro/src/styles/global.css` dark-mode tokens never activate** — RESOLVED W3-T4 (2026-09-25): dark values moved to a plain `@media (prefers-color-scheme: dark) { :root { … } }` override; page-scoped workaround in `lab/desk-scene.astro` removed; verified with Playwright `colorScheme` light/dark on `/` and `/lab/desk-scene/` (html bg `rgb(250,247,242)` vs `rgb(20,23,28)`). — the
  `@theme { ... }` block that overrides `--color-bg`, `--color-ink`, etc. for
  dark mode is nested inside `@media (prefers-color-scheme: dark) { }`
  (around line 148). Tailwind v4 does not scope a nested `@theme` correctly
  (unsupported inside other at-rules, gets hoisted), so every page using
  `bg-bg`/`text-ink`/etc. utilities resolves to the DARK hex values
  unconditionally, regardless of actual OS preference — confirmed via
  `matchMedia('(prefers-color-scheme: dark)').matches === false` while
  `getComputedStyle(document.body).backgroundColor` still returned the dark
  `#14171C`. Found while fixing `astro/src/pages/lab/desk-scene.astro`
  (W3-T3), where it manifested as "the lab page still renders dark v1
  styles"; worked around there with a page-scoped `<style>` override, not a
  site-wide fix. Real fix: move the dark values to plain `:root`-level custom
  properties inside the media query (not `@theme`), or use Tailwind v4's
  `light-dark()` support if applicable, then re-audit every page that
  currently looks fine only because it happens to render dark-on-dark or
  hasn't been checked against actual `prefers-color-scheme: light`.
  (Importance: High — silently wrong on every real light-mode visitor; Points: 3)

- [ ] **`astro/src/pages/updates/rss.xml.ts` fails `tsc --noEmit`** — `Parameter 'context' implicitly has an 'any' type` (line 3); the repo has no typecheck script, so nobody sees it, but it makes `npx tsc --noEmit -p astro` permanently red and hides new errors. Found during W3-T4 (2026-09-25). Fix: type the param as `APIContext` from `astro`. (Importance: Low, Points: 1)

## E005 scene studio follow-ups (2026-09-26)

- Callout ring residual of 2.9–3.6 px: the callout layout lags the view by one frame. `check:jitter` uses a 4 px ring limit and may flake. Importance: Medium · Points: 3
- React #418 hydration mismatch in DeskScene under reduced motion. The initial state depends on `prefersReducedMotion`; also present on dev. Importance: Medium · Points: 2
- drei `Outlines` has `screenspace` inverted; workaround in `studio/PersonParam.tsx`. Report upstream. Importance: Low · Points: 1
- Product decision: should the homepage `HowItWorksScene` use the `beatAt(u)` scroll story instead of button mode? Importance: Medium · Points: ?
- `public/models/studio` is ~14.6 MB (UBC PNG textures). Decimate or convert to WebP before any public use. Importance: Medium · Points: 2
