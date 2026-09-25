---
name: blender-bpy
description: Drive Blender headless with bpy scripts in this repository - build, light, render, inspect and export the desk scene reproducibly. Use for any Blender render, scene change, GLB export or new shot.
metadata:
  short-description: Headless Blender scripting and the render-inspect loop
---

# Blender via headless bpy scripts

Use this skill whenever a task touches `blender/`: a new shot, a scene change, a render for
review, a GLB for the web, or a new reusable helper. Style questions (colour, light, facets,
composition) belong to the sibling skill
[`blender-lowpoly-style`](../blender-lowpoly-style/SKILL.md); read both.

Start with [`blender/README.md`](../../../blender/README.md) (install path, commands, layout,
coordinate conventions, recorded deviations) and the scene spec
[`research/visuals/DESK-SCENE-SPEC.md`](../../../research/visuals/DESK-SCENE-SPEC.md).

## Why headless scripts (and not MCP) here

| Approach | Verdict for agents in this repo |
|---|---|
| `blender -b --factory-startup -P script.py -- args` + `bpy` | **Default.** No GUI, no socket, no add-on install; every picture is reproducible from a commit; runs the same on Windows, Linux CI and a render box; the script *is* the model. |
| blender-mcp (ahujasid/blender-mcp, MIT) - GUI add-on opens TCP :9876, `uvx blender-mcp` bridges to the agent | Optional, for interactive exploration with a human watching. Needs a running GUI, the add-on enabled and "Start MCP Server" clicked; state lives in an unsaved session; the socket runs arbitrary Python with no auth. Anything worth keeping must be written back into `blender/` scripts anyway. |
| Blender Python API docs | https://docs.blender.org/api/current/ - check it for version changes (5.x moved several APIs, see gotchas). |

## Operating rules

- **Run from the repo root** with `--factory-startup`: user preferences and add-ons must never
  change a render. Put your arguments after `--`.
- **The script is the model.** Never ship a change made by hand in the UI; a `.blend` in
  `blender/out/blend/` is for inspection only.
- **Colours come from `DESIGN.md` §0** via `lib/tokens.py`. A new owner colour decision goes to
  `tokens.OVERRIDES` with a date and requirement id until it becomes a token.
- **Measurements are constants at the top of the scene module**, in metres, Blender axes
  (Z up, desk front -Y). Port numbers from the three.js scene with `(x, y, z) -> (x, -z, y)`.
- **Everything visible exports**: build meshes (convert curves/metaballs to meshes, as `prims.tube`
  and `figure.build` do) with Principled BSDF materials, so the GLB matches the render.
- **Record deviations from the spec** in `blender/README.md`, never silently.

## The verify loop (mandatory)

1. Change 3-5 things, not 20 (blender-forge's rule: small passes compare cleanly).
2. Iterate with EEVEE at half size:
   `"$BLENDER" -b --factory-startup -P blender/render.py -- --engine eevee --percent 50 --out blender/out/iterN`
3. **Open every PNG with the Read tool and critique it as a demanding art director**, in this
   order: silhouette and framing -> big masses and proportions -> product parts legible (sensor,
   beam, cable, screen) -> details -> colour. Write the critique down before fixing.
4. Measure, don't guess, when colour is in question: sample pixels (Pillow is available in the
   system Python) and compare with the token hex.
5. Finals with Cycles (`--engine cycles --samples 128`, OIDN denoise): ~6 s per 1920x1200 shot
   on the RTX 4070. Re-inspect the finals; a final is not done until you have looked at it.

## Gotchas (Blender 5.2, found the hard way)

- **Relative output paths** do not land where you expect in background mode: `render.py`
  makes `--out` absolute. Do the same in any new script.
- **Colour management**: use `Khronos PBR Neutral` (matches three.js `NeutralToneMapping`);
  UI textures render with `Standard` so emissive token colours land exactly. AgX desaturates
  the coral and the paper; Standard clips highlights in the 3D scene.
- **Warm light + warm paper + GI = sepia.** Cycles bounce multiplies the paper colour. Keep the
  world slightly cool and the key near-white; check that the wall samples near `bg` (#FAF7F2).
- **Coordinate sign errors** are the most common bug: three.js +Z (toward the viewer) is Blender
  -Y. A light "from front-left" is at negative Y. The first iteration here had the key behind
  the desk because of exactly this.
- **Compositor API changed in 5.x**: no `scene.node_tree`; create a `CompositorNodeTree`, give
  it an output socket via `ng.interface.new_socket(...)`, use `NodeGroupOutput`, assign
  `scene.compositing_node_group`. Mix is `ShaderNodeMix` (`data_type="RGBA"`; colour inputs are
  indices 6 and 7, result is output 2). `CompositorNodeMixRGB` no longer exists.
- **Video output moved in 5.x**: `image_settings.file_format = "FFMPEG"` fails until you set
  `image_settings.media_type = "VIDEO"`. Render animations to PNG frames first, encode after
  (`render.py --anim ... --encode-only` re-encodes without re-rendering).
- **`use_nodes`** on materials/worlds is deprecated (always on) - harmless to set, do not rely on it.
- **`bpy.types.RenderSettings` engine enum** lists only `BLENDER_EEVEE` in a factory-startup
  introspection; `"CYCLES"` still works once the cycles add-on is loaded (it is by default).
- **Cycles GPU**: set `preferences.addons["cycles"].preferences.compute_device_type` and enable
  the devices *before* rendering (`render_settings.gpu_devices`). The HIP warning on NVIDIA is noise.
- **Metaballs**: the iso-surface radius is ~0.575 x the element radius (threshold 0.6,
  stiffness 2). Separate families = separate object base names; use them so arms do not melt
  into the ribs. Convert with `bpy.data.meshes.new_from_object(ob.evaluated_get(depsgraph))`.
- **Bezier auto handles overshoot** and make cables wiggle; use `prims.tube`, which fillets a
  polyline (straight runs, neat bends, optional per-corner radius).
- **Text width** for layout: create the text object, `bpy.context.view_layer.update()`, then
  read `ob.dimensions.x`.
- **Fonts**: `.woff2` loads fine (`bpy.data.fonts.load`); variable fonts use their default
  instance, so fake weight with the text `offset` (see `screen_ui.Canvas.text`).
- **One scene for everything**: `screen_ui` renders the textures in the same scene by hiding
  the rest and restoring settings, so no context overrides are needed in background mode.
- **Scan-scope hook**: do not `find` outside allowed roots to locate outputs; print paths from
  the script instead.

## GLB for the web

`--glb path.glb` exports the sitting scene: Y-up, applied transforms, WebP textures, no
cameras or lights. Report size and triangles (printed as `GLB {...}`). Draco compression is a
later step (three.js `DRACOLoader`); keep textures ≤ 2048 px. The screen textures are baked
per state; the site will likely keep drawing its own canvas screen instead.

## Sources (read 2026-09-25; ideas adapted, no text copied)

- blender-forge, dfadify-web - MIT - https://github.com/dfadify-web/blender-forge :
  "the script is the model", measured constants, quick low-sample renders, 3-5 changes per pass.
- cc-blender-skill, RobLe3 - MIT - https://github.com/RobLe3/cc-blender-skill : naming prefixes
  (GEO-/MAT-/LGT-), render PNGs first and encode video afterwards, sample/denoise defaults.
- blender-mcp, ahujasid - MIT - https://github.com/ahujasid/blender-mcp : the MCP alternative
  and its security note (unauthenticated socket, arbitrary code).
- claudedesignskills `blender-web-pipeline`, freshtechbro - licence not stated, so only general
  facts used (Principled-only materials, apply transforms, ≤ 2048 textures, Draco later) -
  https://github.com/freshtechbro/claudedesignskills
- Blender Python API - https://docs.blender.org/api/current/
