# Hardware Distribution Strategy

**Status:** considered strategy, not yet executed. Written 2026-09-25. No board has
been ordered through this path and no `/diy` page exists yet. Numbers are estimates
dated to the research; re-check before publishing anything.

> **Not legal advice.** The legal position below is the project's own reading of EU
> texts and Commission guidance. Points marked **[UNCERTAIN]** must be confirmed with
> a lawyer or a notified body before any board is sold or handed out by the project.

## The idea

At first there is no way to buy the sensor. The project publishes pre-configured
fabrication files per board variant (Gerber, JLCPCB BOM and CPL, exact order settings,
enclosure files). Anyone uploads them to JLCPCB, orders ~5 fully assembled boards
(JLCPCB's practical minimum), prints or orders the 3D enclosure, keeps one and gives
the rest to friends and family. Each builder is legally the maker of a device for own
use, the owner never ships hardware, and every order seeds four more users —
organic, viral spread without a shop, stock or certification. This extends the
owner's original decision in [.plan/HW.md](../../.plan/HW.md): a deliberate DIY
"build it yourself" kit so the project does not certify a finished device, open-source
publication, a small test batch for testers, later batches only when demand exists.
Certified kits and the OEM channel ([ECOSYSTEM.md](ECOSYSTEM.md)) come later.

## Board variants and which one is "the DIY board"

Variants are defined in ADR-003 (`.plan/ADR/003-three-hardware-board-variants.md`).

| Variant | What | DIY-order role |
|---|---|---|
| **A** — modules | RP2040-Zero + blue ToF breakout soldered onto a carrier | Workshop reference and "with a soldering iron" path. Breakouts are not in the JLC library, so JLC cannot assemble it fully |
| **B** — chip-down | RP2040 (`C2040`), flash, crystal, LDO, USB-C, ESD, VL53L1X (`C190004`) on board | **Proposed self-order variant**: single-sided, Economic PCBA, zero soldering by the user |
| **C** — B + feedback | B plus accelerometer and 3 V buzzer | Optional second release once B is proven |
| **D** — ESP32-C3 wireless | Radio module | Experimental, own use only. Any sale triggers RED + EN 18031 |

## Stages

| Stage | What happens | Entry criteria | Exit criteria | Legal load |
|---|---|---|---|---|
| **0. Now** | Variant A as internal reference; no public "order" button. Owner's test batch (5 pcs, per HW.md) goes to named testers as research samples | — | Firmware + app work on A with testers; variant B designed | None beyond tester consent |
| **1. DIY self-order** | Publish variant B release package + enclosure; `/diy` page with step-by-step JLC order guide; optional mirror on PCBWay Shared Projects (deep link + 10% author commission) | ADR-002 external review passed; owner ordered one batch of 5 **exactly per `ORDER.md`** and it passed tests (rotations, USB, sensor, firmware flash) | Several independent builds reported working; no critical issue open | Minimal (S1/S2 below); site sells nothing |
| **2. Community** | Gallery of builds, `alternates.csv` maintained via PRs, weekly CI check of LCSC stock, printable "you got one" card with QR to setup + app | Stage 1 stable | ≥ 20 independent builds without critical reports; measurable demand for ready-made units | Same as stage 1 |
| **3. Kits / ready boards** | Sell via Tindie, Elecrow (build + ship) or Crowd Supply (Mouser fulfillment, EU VAT handled) | Stage 2 demand; registered business; EMC pre-compliance test | Repeatable supply, returns handled | Full: CE (EMC + RoHS), GPSR, WEEE (BDO), DoC, PL/EN manual |
| **4. Certified product / OEM** | Finished product or OEM sensor kit for desk makers (per-unit model, ECOSYSTEM.md) | OEM agreement | — | Owner/OEM, plus CRA from 12.2027 |

ECOSYSTEM.md's "Phase 2: sell pre-assembled kit, 150–200 PLN" maps to stage 3 here;
its "Phase 1: DIY instructions, free" maps to stages 0–2.

## What we publish per release

One folder per variant and version, e.g. `hardware/releases/v2.0-B/`:

- `gerbers-v2.0-B.zip` — uploaded to JLC as-is.
- `bom-jlcpcb-v2.0-B.csv` — `Comment, Designator, Footprint, JLCPCB Part #` (LCSC `Cxxxx`) on every placed row; non-parts (holes, test pads) excluded or DNP.
- `cpl-jlcpcb-v2.0-B.csv` — `Designator, Mid X, Mid Y, Rotation, Layer` in mm.
- `ORDER.md` — exact JLC form settings with screenshots (2 layers, 1.6 mm, LeadFree HASL, Economic PCBA, one side, confirm placement, check U1/U2/J1 rotations, prefer DDP shipping).
- `alternates.csv` — LCSC substitutes per part, plus the date the BOM was last verified.
- `enclosure/` — STEP + 3MF with print profile (PETG, no supports); JLC3DP as an alternative.
- Firmware UF2 (drag-and-drop), `checksums.txt`, `LICENSE` (CERN-OHL-S-2.0 or -P).
- Silkscreen: project name, version, URL, "Class 1 Laser Product". **No CE mark.**

Tooling: tscircuit exports Gerber/BOM/PnP (`tsci export`); parts pinned via
`supplierPartNumbers={{ jlcpcb: "C…" }}`. Headers may not match JLC templates 1:1 →
add a `jlc-normalize` script and a CI header check. Every release is checked in the
JLC placement preview; pin-1 rotation handling in tscircuit changed recently.

## Costs (estimate, JLC pricing page as of 2026-09; prices move)

| Item | Estimate for 5 assembled B boards to PL |
|---|---|
| 5× small 2-layer PCB | $2–5 |
| Economic PCBA setup + stencil | ~$10 |
| Extended-part fees (6–8 unique ICs × $3.07) | ~$18–25 |
| Parts × 5 (RP2040 ~$1, VL53L1X ~$4–6, rest ~$2) | ~$35–45 |
| Shipping to PL | ~$10–25 |
| VAT 23% via IOSS | ~$18–25 |
| New EU temporary duty from 2026-07-01: €3 per HS code in a parcel ≤ €150 | €3–6 |
| Carrier clearance fee if not DDP | €12–45+ |
| **Total** | **≈ $100–140 → ~€20–28 per board**, enclosure excluded |

For comparison the module-based BOM in [PRD.md](../../PRD.md) is ~60–80 PLN per unit,
but it requires hand soldering. Choosing JLC "Preferred Extended" parts may cut the
fixed fees (unverified). Recommend DDP so the courier does not collect at the door.

## Legal position (summary — not legal advice)

"Making available on the market" covers any supply in the course of a commercial
activity, **paid or free of charge** (GPSR 2023/988 art. 3; Blue Guide). Equipment
built for own use is not placed on the market (EMC guide).

| Scenario | Assessment |
|---|---|
| S1. User downloads files, orders 5 boards for themselves | Low risk. User builds for own use; publishing files is information, not a product |
| S2. That user gives 4 boards to family/friends for free | Probably not placing on the market (occasional, private). **[UNCERTAIN]** — the 2022 Blue Guide dropped the C2C sentence; the "occasional hobbyist" wording may no longer hold as written |
| S3. Owner orders 50 boards and gives them away under the Open Smart Desk brand, from a site that shows pricing and pre-order | **High risk, [UNCERTAIN].** Free samples promoting a future product look like commercial activity |
| S4. Owner sells boards/kits | Placing on the market: CE (EMC + RoHS), GPSR, WEEE, technical file |
| S5. Crowd Supply / Elecrow sells under the owner's brand | Owner remains manufacturer and issues the DoC |

Acts that apply on sale: EMC 2014/30/EU (self-assessment, no R&D kit exemption for us),
RoHS, GPSR (risk analysis, maker address, batch ID, PL manual), WEEE (BDO registration),
laser class 1 per IEC 60825-1 only with ST-recommended settings (firmware must lock
emitter parameters), new PLD 2024/2853 from 2026-12-09 (covers software; commercial
FOSS included), CRA from 12.2027 **[UNCERTAIN scope for a simple USB sensor]**. LVD does
not apply (5 V). RED applies only to variant D.

Consequences for now:
- **The owner should not hand out boards himself yet** beyond named testers under written consent as research samples — and even that is **[UNCERTAIN]**.
- **Keep `/diy` separate from pricing and pre-order**: own page, no "buy" button, no prices "from us".
- Disclaimer on `/diy` and in `ORDER.md`: files AS IS for hobbyist/evaluation use; you are the manufacturer of what you build; not a finished consumer product; not CE-marked by the project. A disclaimer does not remove liability if placing on the market actually occurs.
- No CE mark on silkscreen or enclosure. Publish a basic risk analysis (LDO heat, USB cable, laser).

## Risks

| Risk | Level | Mitigation |
|---|---|---|
| A BOM part sold out on order day | High | `alternates.csv`, weekly stock check in CI, "verified on" date on `/diy` |
| Rotation/footprint error in first release | High | Owner's own batch per `ORDER.md` before publishing; ADR-002 external review |
| Owner's giveaways deemed placing on the market | Medium, [UNCERTAIN] | No owner giveaways at stage 1; `/diy` separated from pre-order; legal consult |
| Real cost above expectations (~€100+ upfront) | Medium | Honest cost table; "order with four friends" framing |
| Variant D (radio) spread widely | Medium | Mark experimental, own use only, no giveaways |
| Laser outside class 1 via firmware changes | Low | Lock emitter parameters; warning in README |
| EU customs rules keep changing | Medium | Date the cost table; recommend DDP |

## Decisions pending for the owner

1. Make **variant B** the official self-order DIY variant (A stays the soldering path)?
2. Require the owner's own test batch ordered exactly per `ORDER.md` **before** `/diy` goes public?
3. Mirror on PCBWay Shared Projects (deep link + 10% commission) alongside JLC?
4. Hardware licence: CERN-OHL-S-2.0 (strong reciprocal) or -P (permissive)?
5. Book a legal consult on S2/S3 and tester samples before stage 1, or only before stage 3?
6. Remove or visually separate `Pricing.tsx`/pre-order from the site while `/diy` exists?
7. Release C (feedback) as a second DIY variant, or keep one board until stage 2?

## Sources

- [.plan/HW.md](../../.plan/HW.md) — owner's hardware brief and DIY-kit decision (Polish).
- [.plan/epics/E005-2026-09-25-product-site-program/wave2/E012-jlcpcb-diy-distribution.md](../../.plan/epics/E005-2026-09-25-product-site-program/wave2/E012-jlcpcb-diy-distribution.md) — full research: precedents, JLC mechanics, fees, customs, legal analysis, `/diy` page outline, external links (Polish).
- [ECOSYSTEM.md](ECOSYSTEM.md) — revenue phases and OEM per-unit model.
- [PRD.md](../../PRD.md) — module-based BOM.
- `.plan/ADR/002-external-review-before-pcb-fabrication.md`, `003-three-hardware-board-variants.md`, `004-standardize-hardware-v2-on-rp2040-zero.md`.
- Owner's idea, 2026-09-25: pre-configured JLC files, order ~5, keep one, give the rest away; no other way to buy at first; possibly several variants.
