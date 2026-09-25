# Architecture

## Product and hardware research track

The repository also contains the Open Smart Desk product research and the
TS-Circuit carrier-board review workspace in `hardware/e003-carrier/`. E003 is
the current review candidate: it generates four board variants and a static
portal, but it is not fabrication-ready. Its physical evidence, exact module
geometry, support-part sourcing, routing and qualified external review remain
explicit gates.

E004 defines the planned next architecture for that workspace. It is not yet
implemented: reusable typed components feed a composed variant configuration,
which resolves a canonical netlist, placement plan and routing result before
the tscircuit renderer and review portal consume them. See E004 `PLAN.md` and
ADR-006 through ADR-011 for the ownership boundaries and decisions. The target
uses a functional core, typed physical geometry and one versioned resolved
design whose maturity is computed from evidence and verification gates.

## Repository Shape

This repository currently contains two parallel website layers:

1. Legacy root website
   - preserved in `legacy/`
   - `legacy/index.html`
   - `legacy/style.css`
   - legacy assets and notes

2. Active Astro website
   - `astro/`
   - Astro 5 static site
   - React islands for interactive sections
   - current focus of development

## 3D desk scene

`astro/src/components/scene/kit/timeline.ts` (`beatAt(u)`) is the single storyboard driver for the
homepage scroll and the `/lab/studio` player (ADR-012 amendment); N8AO is a lazy desktop-only chunk.

## Near-Term Direction

- Preserve the legacy root website as historical or migration material.
- Make the Astro app the explicit active implementation.
- Separate docs, deployment notes, and ownership so contributors do not confuse the two.
