"""Camera presets (DESIGN.md §8.4): the front-right three-quarter family.

`frame_fit` sets a vertical field of view so a frame of the given height at
the target fills the picture - the same idea as `kit/Stage.tsx`.
Blender coordinates: the three.js hero camera (2.75, 1.35, 2.05) looking at
(0.05, 0.86, 0.15) becomes (2.75, -2.05, 1.35) -> (0.05, -0.15, 0.86).
"""
from __future__ import annotations

import math

import bpy
from mathutils import Vector


def camera(name: str, pos, target, vfov_deg: float | None = None, lens_mm: float | None = None,
           frame_h: float | None = None, clip=(0.01, 60.0), ortho_scale: float | None = None):
    cd = bpy.data.cameras.get(name) or bpy.data.cameras.new(name)
    ob = bpy.data.objects.get(name) or bpy.data.objects.new(name, cd)
    if ob.name not in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.link(ob)
    ob.location = pos
    d = Vector(target) - Vector(pos)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    cd.clip_start, cd.clip_end = clip
    cd.sensor_fit = "VERTICAL"
    if ortho_scale is not None:
        cd.type = "ORTHO"
        cd.ortho_scale = ortho_scale
    elif frame_h is not None:
        cd.angle_y = 2 * math.atan(frame_h / 2 / d.length)
    elif vfov_deg is not None:
        cd.angle_y = math.radians(vfov_deg)
    elif lens_mm is not None:
        cd.lens = lens_mm
    return ob


# Named shots. pos/target in Blender coordinates; frame_h in metres at the target.
SHOTS = {
    # Hero: front-right ¾ at eye height 1.35 m (DESIGN.md §8.4); frame a bit taller than
    # the web lens so the beam's floor dot is always in (R-33).
    "hero": dict(pos=(2.75, -2.05, 1.35), target=(0.05, -0.15, 0.80), frame_h=2.1),
}


def use(ob):
    bpy.context.scene.camera = ob
    return ob
