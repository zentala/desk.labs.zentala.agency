---
name: blender-lowpoly-style
description: The "faceted light" art direction of DESIGN.md §8 translated to Blender - facets without bevels, the neutral palette with meaningful colour, the light rig, AO, the sand figure and composition. Use before modelling, lighting or judging any Blender render in this repository.
metadata:
  short-description: Faceted-light low-poly look in Blender
---

# Faceted light in Blender

The authority is [`DESIGN.md` §8](../../../DESIGN.md) (style) and
[`research/visuals/DESK-SCENE-SPEC.md`](../../../research/visuals/DESK-SCENE-SPEC.md) (what is
in the picture). This skill says how to get that look out of Blender, and what Blender may do
better than the web scene. Mechanics (commands, gotchas) are in
[`blender-bpy`](../blender-bpy/SKILL.md).

## The look in one paragraph

Honest low-poly: sharp planes, no bevels, flat shading, one matte finish. Form is defined by
light, so every box shows three values (top, front, side). The world is paper, ink and sand;
colour appears only where it means something - the coral laser and its floor dot, and the app
state on the screens. Real metric proportions; the only simplification allowed is fewer parts.

## Geometry

- **Sharp boxes** for everything made of boards and profiles (`prims.box`, `prims.taper_box`).
  No bevel modifier, no rounded corners - an edge is where two tones meet.
- **Round things are faceted**: `prims.rod` (8 sides; 24 for a clock rim), `prims.blob`
  (icosphere subdivision 1-2), `prims.half_blob` (mouse, cushions). Flat shading always,
  except thin cables, which are smooth 8-sided tubes.
- **Silhouette first** (low-poly lighthouse article): judge the render as a silhouette before
  anything else; spend vertices only where the outline changes.
- **Facets that look sculpted, not generated**: uniform subdivision reads as a mesh; collapse
  decimation of a dense surface gives irregular triangles that read as a hand-made low-poly
  sculpt (the figure uses ratio ≈ 0.045 torso, 0.05 limbs). Avoid "shrink-wrap" uniformity
  (Sunday Sundae character notes).

## The figure

- A **sand mannequin** (`material.figure`), no face, no skin tone, no clothes (§8.5).
- Built from the artist's masses (ellipsoids + tapering capsules) as **metaballs**, so waist,
  shoulders and neck are one continuous skin (fixes the web figure's indents and seams, R-26,
  R-28). Limbs are separate metaball families; the head is part of the torso skin.
- **Canon proportions** from spec §6: 1.75 m, head 22 cm, shoulders ~48 cm across the deltoids,
  hips 36 cm, thigh tapering 17 -> 12 cm, calf 13, ankle 8. Fuller waist, but no paunch: check
  the standing profile.
- **Pose by targets** (`figure.Pose`): pelvis, lean, wrist and ankle targets; two-bone IK with a
  pole for elbows and knees. Relaxed and natural: shoulders slightly dropped, a small head tilt
  toward the screen, one foot forward, feet turned out a little, right hand on the mouse.
- Readable silhouette against both the desk top (lighter) and the chair (darker).

## Colour

- Materials come from tokens only (`lib/materials.Palette`): paper `bg`, slab `surface-2`,
  rug `line`, desk `material.desk-top`, hardware `ink` / `ink-muted` / `#4B5160` stages,
  chair and notebook `material.fabric`, figure `material.figure`, case `material.case`
  (#9D7E7E, owner 2026-09-25, no sticker), mug `surface`.
- **One sharp thing**: the coral beam (emission, 3 mm rod) and its floor dot + halo. No other
  emissive colour in the room; screens are emissive but show the light app.
- State colours never leave the screens (monitor and phone textures from `screen_ui`).
- Check colour by sampling pixels: the wall should land near `bg`, the figure near its token.
  Limited palettes read best when value contrast carries the form (arttypes.com low-poly notes).

## Light (DESIGN.md §8.3 in Cycles terms)

- **Key**: sun from upper-left-front (Blender (-2.5, -3, 4.5)), near-white warm `#FFF9F2`,
  ~4.6, sun angle 6° for a soft penumbra; the only shadow caster.
- **Fill**: sun from right-back, cool `#DDE6F2`, ~0.7, no shadow - it gives the +X faces their
  middle value.
- **Rim**: sun from behind-right, white, ~1.4, no shadow - separates head, shoulders and the
  monitor top from the paper (Creative Shrimp: rim/kicker traces the edge and separates the
  subject from the background).
- **World**: slightly cool, low (`#DCE4EE`, 0.34). GI off the warm paper supplies the warmth;
  a warm world on warm paper turns the whole picture sepia.
- Warm key + cool fill is the classic stylized split (exp-points lighthouse, Vagon product
  lighting); flat, frontal light makes every facet the same value and low-poly turns to noise.
- **AO**: Cycles gives real contact occlusion; `render_settings.ao_boost` multiplies the AO pass
  in the compositor (factor 0.7, distance 0.3 m) for the N8AO-like crease darkening the owner
  welcomed. Keep it subtle: it must deepen contacts, not draw outlines.
- View transform **Khronos PBR Neutral**, exposure 0.

## Composition

- The same front-right three-quarter camera family as the web (§8.4): hero from
  (2.75, -2.05, 1.35) at eye height, frame-fit ~1.8-1.95 m tall at the target. The standing
  frame is taller: the head must never be cropped, and the beam's floor dot is always in (R-33).
- A **clean studio sweep** (floor + cove + wall in paper) with the slab island and the rug on
  it; the wall hosts only the clock (R-37). Diorama feel: the viewer looks slightly down on a
  small, complete world (exp-points).
- Eye order: product parts (sensor, beam, cable, screen) -> person -> furniture. Close-ups
  show one subject at ≥ 50 % of the frame, with the desk top as the only context; move the
  camera until nothing big and dark (a knee, a bracket) sits between the lens and the subject.

## What Blender does better than the web scene (use it)

- Real soft shadows, bounce light and contact occlusion (Cycles) - the "three tones per box"
  comes for free and the objects sit on the floor.
- A sculpted single-skin figure instead of separate primitives.
- Crisp screen UIs at any resolution (the UI is drawn as geometry, then baked).
- A real studio backdrop and emissive laser light on the floor.

## What it does worse (do not pretend otherwise)

- Stills and baked video, not interactive: no scroll-driven desk, no orbit, no hover.
- The PNGs are 2 MB each; the site would need WebP/AVIF and responsive sizes.
- Baked screen textures carry one state each; the live site draws its screen per frame.

## Sources (read 2026-09-25; techniques adapted, nothing copied)

- Low Poly Lighthouse - "Silhouette is everything", exp-points.com (no licence stated; ideas
  only): silhouette first, warm key + cool fill + accent, diorama framing.
  https://www.exp-points.com/blender-low-poly-lighthouse-stylized
- Sunday Sundae, "How to make low poly characters" (ideas only): avoid uniform shrink-wrap
  facets, spend detail where it reads. https://sundaysundae.co/how-to-make-low-poly-characters/
- Creative Shrimp, character lighting techniques (ideas only): key off-axis above, soft large
  sources, rim/kicker for separation. https://www.creativeshrimp.com/character-lighting-techniques.html
- Vagon, product lighting in Blender (ideas only): key/fill/rim roles for product shots.
  https://vagon.io/blog/mastering-product-lighting-in-blender-techniques-for-stunning-3d-renders
- arttypes.com, low-poly art (ideas only): value contrast carries facets; flat light reads as noise.
  https://arttypes.com/types/low-poly-art
- cc-blender-skill, RobLe3 (MIT): three-point recipes by subject class; the note that faces from
  primitives fail (we keep the figure faceless). https://github.com/RobLe3/cc-blender-skill
- Base meshes considered and not used: Blender Studio Human Base Meshes (CC0,
  https://www.cgchannel.com/2023/06/download-blender-studios-free-human-base-meshes/) and
  OpenGameArt CC0 low-poly humans. A base mesh needs rigging and weight painting to pose; the
  metaball figure is posed by numbers, is fully ours and has no licence to track.
