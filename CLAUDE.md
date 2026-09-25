---
pm-onboarded: "2026-05-24"
pm-version: "0.1.0"
---

# CLAUDE.md — Agent Guidance for desk.zentala.io

## What this repo is

The **research, vision and website repo** for the **Open Smart Desk** project —
an open-source hardware + software system that helps knowledge workers build
a habit of alternating between sitting and standing at their desk.

**This is NOT a desk product. It is a nudge/motivation system.**
The desk raises manually — the user presses the button themselves.
The system detects posture and sends non-annoying, Duolingo-style notifications.

Read the vision before touching anything: [research/vision/MISSION.md](research/vision/MISSION.md)

## Two tracks

| Track | Where | What it is |
|---|---|---|
| **Product** | `PRD.md`, `research/` | Hardware + app design. Research and specs only — no code yet. |
| **Website** | `astro/` (active), `legacy/` (preserved) | The public site for the project. |

The two tracks are independent: website work does not block product work.

## Document status

| What | Where | Status |
|---|---|---|
| **PRD** | `PRD.md` | Product requirements document — start here |
| Hardware v2 spec | `research/hardware-v2-spec.md` | Done |
| PCB commission brief | `research/hardware-v2-pcb-commission-brief.md` | Ready to publish |
| Hardware distribution strategy | [`research/vision/DISTRIBUTION.md`](research/vision/DISTRIBUTION.md) | Considered: self-order from JLCPCB, DIY, staged path to certified kits — not executed |
| Owner's hardware brief | [`.plan/HW.md`](.plan/HW.md) | DIY-kit decision, test batch, open-source publication (Polish) |
| Vision & strategy | `research/vision/` | Done |
| Notification algorithm | `research/algorithm/` | Designed, not coded yet |
| App architecture | `research/architecture/` | Designed, not coded yet — includes sensor-daemon |
| Session handoff | `research/SESSION-2026-06-25.md` | Read this to catch up |
| Task list | `TASKS.md` | Read this for next steps |
| User research quotes | `research/user-quotes.xml` | 26 real quotes from forums |
| Desk scene spec (3D illustration) | [`research/visuals/DESK-SCENE-SPEC.md`](research/visuals/DESK-SCENE-SPEC.md) | Normative: what is depicted, requirements register, storyboard, task breakdown; decisions in [ADR-012](.plan/ADR/012-3d-desk-illustration.md) |
| Website | `astro/` | Active, builds locally — deployment unconfirmed |

---

## Read these first (priority order)

0. **[HANDOFF.md](HANDOFF.md)** — session context dump: current repo state, the approved
   E001 site-rebuild plan, reusable assets, open blockers. **Read before touching anything.**
1. **[PRD.md](PRD.md)** — product requirements: what, why, for whom, out of scope
2. **[TASKS.md](TASKS.md)** — what needs to be done, in order (both tracks)
3. **[research/SESSION-2026-06-25.md](research/SESSION-2026-06-25.md)** — full session handoff, open questions
4. **[research/vision/MISSION.md](research/vision/MISSION.md)** — philosophy, why this exists, who it's for
5. **[research/algorithm/NOTIFICATION-ALGORITHM.md](research/algorithm/NOTIFICATION-ALGORITHM.md)** — state machine, read before touching notification logic
6. **[research/architecture/REPO-ARCHITECTURE.md](research/architecture/REPO-ARCHITECTURE.md)** — sensor-daemon + WS + Electron, build order

---

# Product track

## Research & Vision tree

```
research/
├── SESSION-2026-06-25.md        ← session handoff, open questions, next steps
├── user-quotes.xml              ← 26 real user quotes from forums (market validation)
├── hardware-v2-spec.md          ← RP2040-Zero + ToF breakout spec, BOM, wiring
│
├── vision/
│   ├── MISSION.md               ← philosophy, personas, what we are NOT building
│   ├── ECOSYSTEM.md             ← OEM per-unit model, consortium, flywheel
│   ├── ROADMAP.md               ← Stage 0→5: MVP → Habit Engine → Standard
│   ├── RESEARCH-PLAN.md         ← academic partnership (PW), validation metrics
│   └── LONG-TERM-VISION.md      ← Smart Move, Smart Life, AI health companion
│
├── algorithm/
│   └── NOTIFICATION-ALGORITHM.md  ← state machine (AWAY/SITTING/STANDING/ALERT/SNOOZED)
│
└── architecture/
    ├── REPO-ARCHITECTURE.md     ← monorepo structure, tech stack, build order
    └── FIRMWARE-SPEC.md         ← USB Serial protocol, MicroPython skeleton, I2C wiring
```

## Product summary

**Hardware v2:** RP2040-Zero (~20 PLN) + ToF breakout (~20 PLN) → USB-C to PC

**Two data sources:**
- Desk height from laser → knows if sitting or standing
- Mouse + keyboard OS events → knows if user is at computer

**App:** Electron tray app (TypeScript), OS-native notifications

**Core differentiator:** Knows if you ACTUALLY stood up (not just ignored the notification).
All other reminder apps are blind to whether you acted. We have the sensor.

**Business model:** Open source software + OEM sensor kit sold to desk manufacturers
per unit (recurring revenue). See [research/vision/ECOSYSTEM.md](research/vision/ECOSYSTEM.md).

**Hardware component tooling:** For tscircuit component/footprint work, read
[the repository tscircuit ecosystem guide](research/hardware/tscircuit-ecosystem.md)
and use the local [tscircuit-hardware skill](.claude/skills/tscircuit-hardware/SKILL.md).
The ecosystem includes reusable `@tsci/*` packages, JLCPCB/KiCad imports,
GitHub libraries and custom `@tscircuit/footprinter` components, but it is not
a single catalogue of every breakout-module variant. Exact board geometry must
still be matched and reviewed against source evidence.

## What to build next

**Immediate (before any code):**
1. Review [research/algorithm/NOTIFICATION-ALGORITHM.md](research/algorithm/NOTIFICATION-ALGORITHM.md) with the creator
2. Agree on sitting threshold, snooze duration, max repeats

**Then (in order):**
1. New repo: `smart-desk` (monorepo — firmware + shared + app)
2. Start with `packages/shared/src/types.ts` (shared TypeScript types)
3. Then `packages/app/src/engine/state-machine.ts` (pure logic, write tests first)
4. See full build order: [research/architecture/REPO-ARCHITECTURE.md](research/architecture/REPO-ARCHITECTURE.md)

---

# Website track

## Current state

- `astro/` is the actively developed website. The build works locally.
- The old static website has been moved into `legacy/` and is preserved until
  migration decisions are complete.
- Production deployment for the Astro site is not yet confirmed — see `TASKS.md`.

## Stack

- **Active app**: Astro 5 static site in `astro/`
- **Styling**: Tailwind CSS v4
- **Components**: React (TSX) for interactive sections
- **Analytics**: Plausible
- **Blog**: Astro Content Collections (Markdown)
- **Legacy app**: preserved in `legacy/`

## Development

- Local development: `cd astro && npm run dev`
- Build: `cd astro && npm run build`
- Preview build: `cd astro && npm run preview`
- Package manager: **npm** (not pnpm)

## Local static-site deployment

This repo uses the [`astro-static-site`](C:\Users\zentala\.agents\skills\astro-static-site\SKILL.md) pattern. The domains are `desk.internal`, `lp.desk.internal` and `old.desk.internal`; commits build ignored static artifacts, and shared Caddy/idomains serves them. Do not run Astro dev servers or add PM3 application services here.

## File structure

- `astro/` — active Astro project
  - `src/pages/` — page routes (`index.astro`, `blog/`)
  - `src/components/` — React components (Hero, Pricing, FAQ, WaitlistForm, ExitPopup, StickyCTA, etc.)
  - `src/layouts/` — page layouts (`BlogPost.astro`)
  - `src/data/` — shared config (`pricing.ts` — canonical pricing source)
  - `src/utils/` — shared utilities (`analytics.ts`, `validation.ts`)
  - `src/content/blog/` — blog posts (Markdown with frontmatter)
  - `src/styles/` — global CSS (Tailwind)
  - `public/` — static assets (images, favicon)
- `legacy/` — preserved legacy website generation and supporting assets

## Key components

| Component | Purpose |
|-----------|---------|
| `Hero.tsx` | Primary headline + CTAs |
| `Pricing.tsx` | 3-tier product cards with pre-order progress |
| `WaitlistForm.tsx` | Email capture (hero + footer) |
| `ExitPopup.tsx` | Exit-intent email popup (desktop) |
| `StickyCTA.tsx` | Fixed bottom bar with pre-order link |
| `FAQ.tsx` | Expandable Q&A section |
| `ReferralProgram.tsx` | Share & save referral mechanic |
| `Story.tsx` | Founder story section |
| `SocialProof.tsx` | Trust signals |

## Conventions

- Prices imported from `src/data/pricing.ts` — never hardcoded in components
- Analytics via `trackEvent()` from `src/utils/analytics.ts`
- Email validation via `isValidEmail()` from `src/utils/validation.ts`
- All code, comments, and docs in English

## Blog content

- Posts in `src/content/blog/` as Markdown
- Frontmatter: title, description, date, author, tags
- Schema defined in `src/content.config.ts`

**Content caveat:** the site still describes v1 hardware (relay board) — outdated
versus the product vision above. Updating it is not a priority until the app ships.

---

## CLAUDE file layout

- root `CLAUDE.md` (this file) — repository-level structure and coordination
- `astro/CLAUDE.md` — the active Astro app
- `legacy/CLAUDE.md` — the preserved legacy site and archive rules

## Project management

This repo uses the `.plan/` structure for persistent planning and architecture notes.
Use `TASKS.md` as the quick human-readable entry point and `.plan/` for working state.
