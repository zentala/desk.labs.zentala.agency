# Blender workspace (agent-driven, headless)

Reproducible Blender renders of the Open Smart Desk scene, driven by Python
scripts, not by hand. The scene is the same world as the web illustration
(`astro/src/components/scene/`), specified by
[`research/visuals/DESK-SCENE-SPEC.md`](../research/visuals/DESK-SCENE-SPEC.md)
and styled by [`DESIGN.md` §8](../DESIGN.md) ("faceted light").

Agents: read [`.claude/skills/blender-bpy/SKILL.md`](../.claude/skills/blender-bpy/SKILL.md)
(how to drive Blender here, gotchas, the verify loop) and
[`.claude/skills/blender-lowpoly-style/SKILL.md`](../.claude/skills/blender-lowpoly-style/SKILL.md)
(the art direction in Blender terms) before changing anything.

## Blender install (this workstation)

| What | Value |
|---|---|
| Version | Blender **5.2.2 LTS** (portable zip `blender-5.2.2-windows-x64.zip`, hash `d13f752e3b9c`) |
| Executable | `C:/Users/zentala/tools/blender/blender-5.2.2-windows-x64/blender.exe` |
| Install type | Portable, user-level: the official zip extracted there; no installer, no registry, no PATH change |
| Python | bundled 3.13 (`bpy` is only available inside Blender) |
| GPU | NVIDIA RTX 4070, Cycles via OptiX (auto-selected; falls back to CUDA, then CPU) |
| Installed | 2026-09-25 |

On another machine, set `BLENDER` to your executable and use the same commands.
Blender ≥ 4.2 should work (Khronos PBR Neutral view transform); 5.x is what this was built on.

## Run

```bash
BLENDER=C:/Users/zentala/tools/blender/blender-5.2.2-windows-x64/blender.exe

# quick look while iterating: EEVEE, half size (≈ 1 s per shot after the first)
"$BLENDER" -b --factory-startup -P blender/render.py -- --engine eevee --percent 50 --out blender/out/iter

# finals: Cycles, 128 samples + OpenImageDenoise (≈ 6 s per 1920×1200 shot on an RTX 4070)
"$BLENDER" -b --factory-startup -P blender/render.py -- --engine cycles --samples 128 \
    --out .plan/epics/E005-2026-09-25-product-site-program/blender --blend --glb blender/out/desk-scene.glb

# one shot only / transparent PNG for compositing on the page / rise animation
"$BLENDER" -b --factory-startup -P blender/render.py -- --shots hero-sitting --engine cycles --transparent
"$BLENDER" -b --factory-startup -P blender/render.py -- --engine cycles --samples 32 --size 1280x800 \
    --anim blender/out/rise.mp4 --frames 120 --no-ao
```

Always pass `--factory-startup` (ignores the user's Blender preferences and add-ons) and run
from the repository root. Everything after `--` belongs to `render.py`; see its docstring.

Shots: `hero-sitting`, `hero-standing`, `sensor` (from below: case, lens, beam, cable),
`port` (USB-C in the monitor's side port), `paddle` (vertical buttons at the right end).

## Layout

```
blender/
├── render.py              CLI: build -> light -> camera -> render / export
├── lib/
│   ├── tokens.py          colours parsed from DESIGN.md §0 (+ dated owner overrides)
│   ├── materials.py       matte / satin / glow / halo / screen materials; the scene Palette
│   ├── prims.py           faceted primitives: box, taper_box, rod, blob, half_blob, tube (filleted cable)
│   ├── figure.py          the sand figure: metaball masses -> one skin -> decimated facets; 2-bone IK
│   ├── screen_ui.py       the app UI (monitor, phone, clock) drawn in Blender as flat emissive shapes + text
│   ├── lighting.py        the faceted-light rig: key/fill/rim suns + low world
│   ├── camera.py          look-at cameras with frame-fit field of view
│   ├── render_settings.py EEVEE / Cycles / colour management / AO multiply in the compositor
│   └── export.py          GLB export + triangle count
├── scenes/desk.py         the desk scene; `build(t)` for stand progress t (0 = sitting, 1 = standing)
├── assets/fonts/          Bricolage Grotesque + Inter (SIL OFL 1.1, licences beside them)
└── out/                   renders, textures, .blend, .glb (gitignored)
```

## Conventions

- **Blender coordinates**: metres, Z up, origin on the floor under the desk centre, the desk
  front faces -Y, the person sits at -Y facing +Y. From the three.js scene:
  `(x, y, z)_three -> (x, -z, y)_blender`. The GLB exporter converts back to Y-up, so the GLB
  lands in three.js coordinates.
- **Names**: `GEO-*` meshes, `RIG-*` empties (groups that move together), `LGT-*` lights,
  `CAM-*` cameras, `MAT-*` special materials; palette materials use the token role name.
- **Colours only from tokens** (`lib/tokens.py` reads `DESIGN.md` §0). A colour that is an owner
  decision but not yet a token goes in `tokens.OVERRIDES` with its date and requirement id.
- **The script is the model.** No hand edits in the Blender UI that are not written back into
  code; a saved `.blend` is an inspection artefact, never a source.
- **Verify by looking**: render, open the PNG, critique, change 3-5 things, repeat
  (see the `blender-bpy` skill).

## Deviations from the spec (recorded, not silent)

- Sensor enclosure sits **4 cm** inboard of the right edge (spec §3.1: 1.5 cm). With the cable
  entering the narrow outboard end (R-22), 1.5 cm left no room for the plug and its bend: the
  plug stuck out past the edge and the cable had to wrap the edge. The beam still clears the foot.
- Wall clock at z 1.52 m (spec: ≈ 1.75) so it stays inside the hero frame in both states.
- A small control box under the top receives the paddle cable (the web scene runs it to the
  column); it keeps the desk's own wiring visibly separate from ours.
