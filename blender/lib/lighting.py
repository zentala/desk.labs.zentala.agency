"""The faceted-light rig (DESIGN.md §8.3) in Blender terms.

Three suns plus a low warm world, tuned so the top, the front (-Y) and the
right side (+X) of every box read as three different values:
  key  - upper-left-front, warm, the only shadow caster; a 7° sun disc gives
         a soft penumbra (three.js used PCF-soft; Cycles does it for real)
  fill - right-back, cool, no shadow: the +X faces the camera sees
  rim  - behind-right, white, no shadow: separates head, shoulders and the
         monitor's top edge from the paper
  world- the "sky": a warm, low constant that GI bounces (Cycles) - this is
         where Blender beats the web rig: real bounce light and contact AO.
Directions are converted from the three.js rig: (x, y, z)_three -> (x, -z, y).
"""
from __future__ import annotations

import math

import bpy
from mathutils import Vector

from .tokens import lin

RIG = {
    # name: (from-position, colour, strength W/m², sun angle deg, casts shadow)
    "key": ((-2.5, -3.0, 4.5), "#FFF9F2", 4.6, 6.0, True),
    "fill": ((4.0, 1.5, 2.5), "#DDE6F2", 0.7, 10.0, False),
    "rim": ((1.5, 4.0, 3.0), "#FFFFFF", 1.4, 5.0, False),
}
WORLD = ("#DCE4EE", 0.34)  # slightly cool: GI off the warm paper supplies the warmth


def _sun(name, frm, colour, strength, angle_deg, shadow, target=(0, 0, 0.6)):
    ld = bpy.data.lights.get(name) or bpy.data.lights.new(name, "SUN")
    ld.color = lin(colour)[:3]
    ld.energy = strength
    ld.angle = math.radians(angle_deg)
    ld.use_shadow = shadow
    ob = bpy.data.objects.get(name) or bpy.data.objects.new(name, ld)
    if ob.name not in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.link(ob)
    d = Vector(target) - Vector(frm)
    ob.location = frm
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob


def world(colour=WORLD[0], strength=WORLD[1]):
    w = bpy.data.worlds.get("studio") or bpy.data.worlds.new("studio")
    w.use_nodes = True  # deprecated in 5.x (always on), harmless
    bg = w.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = lin(colour)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w
    return w


def rig(scale: float = 1.0, overrides: dict | None = None):
    """Build the rig; `scale` multiplies all strengths (exposure trim per shot)."""
    cfg = dict(RIG)
    cfg.update(overrides or {})
    lights = {}
    for name, (frm, colour, strength, angle, shadow) in cfg.items():
        lights[name] = _sun(f"LGT-{name}", frm, colour, strength * scale, angle, shadow)
    world()
    return lights
