"""The Open Smart Desk scene (research/visuals/DESK-SCENE-SPEC.md) in Blender.

Blender coordinates: metres, Z up, origin on the floor under the desk centre,
the desk front faces -Y and the person sits at -Y facing +Y.
Mapping from the three.js scene: (x, y, z)_three -> (x, -z, y)_blender.

`build(t)` builds the whole world for a stand progress t (0 = sitting at
72 cm, 1 = standing at 112 cm) and returns anchors (points of interest) used by
the camera shots. Owner decisions of 2026-09-25 applied here:
  - sensor enclosure #9D7E7E, tapered, no sticker; cable and emitter at the
    narrow (outboard) end (R-20..R-22)
  - cable lies on surfaces, never through the top, wraps the back edge, enters
    the monitor's side port sideways with the plug rotated 90°, then falls (R-23..R-25)
  - paddle at the far right end with a vertical column of buttons (R-30)
  - rounder mouse (R-29); sharp chair (R-19); relaxed, fuller figure (R-26..R-28)
  - phone as the persistent second screen (R-38) and a wall clock (R-37)
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import bmesh
import bpy
from mathutils import Vector

from lib import figure, prims, screen_ui
from lib.materials import Palette, screen
from lib.prims import blob, box, collection, group, half_blob, rod, taper_box, tube, use_collection

W, D, TH = 1.20, 0.60, 0.035
SIT_H, STAND_H = 0.72, 1.12
COL_X, COL_Y = 0.44, 0.02
STAGE = {"bottom": 0.05, "mid": 0.064, "top": 0.078}

# sensor enclosure (R-20..R-22): tapered, wide end toward the desk centre, narrow end outboard
ENC = dict(length=0.060, wide=0.045, narrow=0.028, height=0.028)
ENC_X = W / 2 - 0.040 - ENC["length"] / 2      # 4 cm inboard (spec: 1.5): room for the plug and the bend at the narrow end
ENC_Y = D / 2 - 0.10                            # 10 cm from the back edge
EMIT_X = ENC_X + ENC["length"] / 2 - 0.011      # emitter at the narrow end

MON = dict(screen=(0.78, 0.325), body=(0.82, 0.03, 0.365), neck=(0.06, 0.025, 0.15),
           base=(0.28, 0.17, 0.012), y=0.17, body_dy=-0.02)
CABLE_R = 0.0028


def desk_height(t: float) -> float:
    return SIT_H + (STAND_H - SIT_H) * t


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


@dataclass
class Story:
    """What the screens and the clock say for a frame."""
    state: str = "sitting"           # sitting | rising | lowering | standing
    height_cm: int = 72
    toast: bool = True
    phone_elapsed: str = "40:00"
    phone_credit: str = "45 min"
    phone_progress: float = 1.0
    clock: tuple = (14, 40)


def story_for(t: float) -> Story:
    if t <= 0.02:
        return Story()
    if t >= 0.98:
        return Story("standing", 112, True, "20:00", "1 h 05", 1.0, (15, 1))
    return Story("rising", round(72 + 40 * t), False, "00:12", "45 min", 0.02, (14, 41))


# ------------------------------------------------------------------------------------------------
# helpers
# ------------------------------------------------------------------------------------------------

def uv_quad(name, w, h, loc, rot, mat, parent=None):
    """A textured quad in the local XZ plane facing -Y (a screen), UV 0..1."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    corners = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    vs = [bm.verts.new((x, 0, z)) for x, z in corners]
    f = bm.faces.new(vs)
    for loop, (u, v) in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]):
        loop[uv].uv = (u, v)
    return prims.from_bmesh(name, bm, mat, loc, rot, parent)


def uv_disc(name, r, loc, rot, mat, sides=48, parent=None):
    """A textured disc in the local XZ plane facing -Y (the clock face)."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    pts = [(r * math.cos(2 * math.pi * i / sides), r * math.sin(2 * math.pi * i / sides)) for i in range(sides)]
    vs = [bm.verts.new((x, 0, z)) for x, z in pts]
    f = bm.faces.new(vs)
    if f.normal.y > 0:
        f.normal_flip()
    for loop in f.loops:
        x, _, z = loop.vert.co
        loop[uv].uv = (0.5 + x / (2 * r), 0.5 + z / (2 * r))
    return prims.from_bmesh(name, bm, mat, loc, rot, parent)


def torus(name, major, minor, loc, rot, mat, seg=8, sides=5, parent=None):
    bm = bmesh.new()
    rings = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        c = Vector((major * math.cos(a), 0, major * math.sin(a)))
        n = c.normalized()
        ring = []
        for j in range(sides):
            b = 2 * math.pi * j / sides
            p = c + n * (minor * math.cos(b)) + Vector((0, minor * math.sin(b), 0))
            ring.append(bm.verts.new(p))
        rings.append(ring)
    for i in range(seg):
        for j in range(sides):
            a, b = rings[i], rings[(i + 1) % seg]
            bm.faces.new((a[j], b[j], b[(j + 1) % sides], a[(j + 1) % sides]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return prims.from_bmesh(name, bm, mat, loc, rot, parent)


def cyclorama(name, mat, wall_y=1.25, cove=0.45, half_w=25.0, front=-12.0, top=10.0, steps=12):
    """Seamless studio sweep: floor, a curved cove, the back wall."""
    prof = [(front, 0.0), (wall_y - cove, 0.0)]
    for i in range(1, steps):
        a = math.pi / 2 * i / steps
        prof.append((wall_y - cove + cove * math.sin(a), cove - cove * math.cos(a)))
    prof += [(wall_y, cove), (wall_y, top)]
    bm = bmesh.new()
    left = [bm.verts.new((-half_w, y, z)) for y, z in prof]
    right = [bm.verts.new((half_w, y, z)) for y, z in prof]
    for i in range(len(prof) - 1):
        bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        if f.normal.z < -0.1 or f.normal.y > 0.1:
            f.normal_flip()
    ob = prims.from_bmesh(name, bm, mat, smooth=True)
    return ob


# ------------------------------------------------------------------------------------------------
# parts
# ------------------------------------------------------------------------------------------------

def build_world(p: Palette, clock_tex: str | None):
    c = collection("World")
    use_collection(c)
    cyclorama("GEO-backdrop", p.paper)
    box("GEO-slab", (2.7, 2.6, 0.03), (-0.3, -0.45, 0.015), p.slab)
    box("GEO-rug", (1.9, 1.4, 0.006), (0.0, -0.25, 0.033), p.rug)
    if clock_tex:
        # wall clock (R-37): a faceted 24-sided body, the face as a texture
        wall = 1.25
        cz, cx = 1.52, -0.30
        rod("GEO-clock-body", 0.15, 0.035, (cx, wall - 0.0175, cz), p.line_strong, sides=24,
            rot=(math.pi / 2, 0, 0))
        uv_disc("GEO-clock-face", 0.138, (cx, wall - 0.0355, cz), (0, 0, 0),
                _clock_mat(clock_tex), sides=48)


def _clock_mat(path):
    """The clock face is paper, not a light: a lit (non-emissive) image material."""
    m = bpy.data.materials.get("MAT-clock-face") or bpy.data.materials.new("MAT-clock-face")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    for n in list(nt.nodes):
        if n.type == "TEX_IMAGE":
            nt.nodes.remove(n)
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path, check_existing=True)
    tex.image.reload()
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.6
    bsdf.inputs["Specular IOR Level"].default_value = 0.3
    return m


def build_desk(p: Palette, h: float):
    c = collection("Desk")
    use_collection(c)
    under = h - TH
    box("GEO-desk-top", (W, D, TH), (0, 0, h - TH / 2), p.desk_top)
    for side in (-1, 1):
        x = side * COL_X
        box(f"GEO-foot{side:+d}", (0.08, 0.52, 0.04), (x, COL_Y, 0.02), p.ink)
        bot_len = 0.36 - 0.04
        box(f"GEO-stage-bottom{side:+d}", (STAGE["bottom"],) * 2 + (bot_len,), (x, COL_Y, 0.04 + bot_len / 2), p.ink)
        top_top = under - 0.02
        top_bot = top_top - 0.28
        mid_top = top_bot + 0.06
        mid_len = mid_top - 0.30
        box(f"GEO-stage-mid{side:+d}", (STAGE["mid"],) * 2 + (mid_len,), (x, COL_Y, 0.30 + mid_len / 2), p.stage_mid)
        box(f"GEO-stage-top{side:+d}", (STAGE["top"],) * 2 + (0.28,), (x, COL_Y, top_bot + 0.14), p.ink_muted)
        # shadow bands under each mouth (DESIGN.md §8.6)
        box(f"GEO-band-a{side:+d}", (STAGE["bottom"] + 0.002,) * 2 + (0.012,), (x, COL_Y, 0.30 - 0.006), p.ink, shadow=False)
        box(f"GEO-band-b{side:+d}", (STAGE["mid"] + 0.002,) * 2 + (0.012,), (x, COL_Y, top_bot - 0.006), p.ink, shadow=False)
        box(f"GEO-bracket{side:+d}", (0.12, 0.5, 0.02), (x, COL_Y, under - 0.01), p.ink_muted)
    box("GEO-crossbar", (2 * COL_X - 0.12, 0.04, 0.02), (0, COL_Y, under - 0.01), p.ink_muted)
    # the desk's own control box under the top (the paddle and the motors wire into it)
    box("GEO-control-box", (0.20, 0.07, 0.03), (0.16, 0.10, under - 0.015), p.ink)
    build_paddle(p, h)


def build_paddle(p: Palette, h: float):
    """Paddle at the far right end, under the front edge, with a vertical column of four memory
    buttons and an up/down rocker below (R-30). Faces the person (-Y)."""
    under = h - TH
    x, bw, bd, bh = 0.525, 0.046, 0.026, 0.13
    front = -D / 2 - 0.004
    y = front + bd / 2
    box("GEO-paddle", (bw, bd, bh), (x, y, under - bh / 2), p.ink_muted)
    for i in range(4):
        z = under - 0.020 - i * 0.021
        box(f"GEO-paddle-mem{i + 1}", (0.026, 0.004, 0.015), (x, front - 0.0015, z), p.line, shadow=False)
    # rocker: up and down halves with a gap; small raised chevrons in ink
    for i, (zc, name) in enumerate(((under - 0.101, "up"), (under - 0.119, "down"))):
        box(f"GEO-paddle-{name}", (0.030, 0.005, 0.016), (x, front - 0.002, zc), p.line, shadow=False)
        d = 1 if name == "up" else -1
        prims.polygon(f"GEO-paddle-{name}-mark",
                      [(-0.005, -0.003 * d), (0.005, -0.003 * d), (0.0, 0.004 * d)], 0.0, p.ink,
                      loc=(x, front - 0.0046, zc), shadow=False).rotation_euler = (math.pi / 2, 0, 0)
    # a small height display at the top of the paddle
    box("GEO-paddle-display", (0.030, 0.003, 0.009), (x, front - 0.001, under - 0.006), p.ink, shadow=False)
    # its cable: out of the back, flat under the top, into the control box (not ours: ink, thinner)
    pts = [(x, y + bd / 2, under - 0.07), (x, y + bd / 2 + 0.012, under - 0.06, 0.01), (x, y + bd / 2 + 0.012, under - 0.004, 0.01),
           (0.43, -0.12, under - 0.004, 0.04), (0.29, 0.10, under - 0.004, 0.03), (0.26, 0.10, under - 0.004)]
    tube("GEO-paddle-cable", pts, 0.0022, p.ink)


def port_pos(h):
    body_z = h + MON["base"][2] + MON["neck"][2] + MON["body"][2] / 2 - 0.04
    return Vector((MON["body"][0] / 2, MON["y"] + MON["body_dy"], body_z - 0.06)), body_z


def build_monitor(p: Palette, h: float, screen_tex: str):
    c = collection("Monitor")
    use_collection(c)
    port, body_z = port_pos(h)
    y = MON["y"]
    by = y + MON["body_dy"]
    box("GEO-monitor-base", MON["base"], (0, y, h + MON["base"][2] / 2), p.ink_satin)
    box("GEO-monitor-neck", MON["neck"], (0, y + 0.01, h + MON["base"][2] + MON["neck"][2] / 2), p.ink_satin)
    box("GEO-monitor-body", MON["body"], (0, by, body_z), p.ink_satin)
    sw, sh = MON["screen"]
    uv_quad("GEO-monitor-screen", sw, sh, (0, by - MON["body"][1] / 2 - 0.0006, body_z + 0.004), (0, 0, 0),
            screen("MAT-monitor-screen", screen_tex, strength=0.94))
    # USB-C on the right side face: vertical slot, plug rotated 90° (flat side vertical) (R-25)
    box("GEO-port-slot", (0.002, 0.0045, 0.010), (port.x + 0.0005, port.y, port.z), p.ink_muted, shadow=False)
    box("GEO-plug-monitor", (0.022, 0.007, 0.012), (port.x + 0.011, port.y, port.z), p.fabric)
    box("GEO-plug-monitor-boot", (0.008, 0.0055, 0.0085), (port.x + 0.026, port.y, port.z), p.fabric)
    return port


def build_sensor(p: Palette, h: float):
    c = collection("Sensor")
    use_collection(c)
    under = h - TH
    zc = under - ENC["height"] / 2
    taper_box("GEO-sensor-case", ENC["length"], ENC["wide"], ENC["narrow"], ENC["height"],
              (ENC_X, ENC_Y, zc), p.case)
    # mounting flange line: a slim darker lid seam where the case meets the desk
    taper_box("GEO-sensor-lid", ENC["length"] + 0.004, ENC["wide"] + 0.004, ENC["narrow"] + 0.004, 0.003,
              (ENC_X, ENC_Y, under - 0.0015), p.ink_muted)
    # the emitter/lens at the narrow end, on the underside (R-22)
    box("GEO-sensor-window", (0.012, 0.014, 0.0016), (EMIT_X, ENC_Y, under - ENC["height"] - 0.0008), p.ink, shadow=False)
    rod("GEO-sensor-lens", 0.0032, 0.0016, (EMIT_X, ENC_Y, under - ENC["height"] - 0.0018), p.stage_mid, sides=12, shadow=False)
    # USB-C plug entering the narrow end, rotated 90° like at the monitor
    nx = ENC_X + ENC["length"] / 2
    box("GEO-plug-sensor", (0.012, 0.007, 0.012), (nx + 0.006, ENC_Y, zc + 0.002), p.fabric)
    box("GEO-plug-sensor-boot", (0.006, 0.0055, 0.0085), (nx + 0.015, ENC_Y, zc + 0.002), p.fabric)
    return Vector((nx + 0.018, ENC_Y, zc + 0.002)), Vector((EMIT_X, ENC_Y, under - ENC["height"] - 0.002))


def cable_points(h, sensor_out: Vector, port: Vector):
    """Sensor -> monitor: out of the narrow end with a short natural droop, back up flat under
    the top, to the back edge, around it, along the back edge on the desktop, then to the
    monitor's side, where it rises and turns into the port sideways (so, read from the port: it
    leaves sideways, then falls). A 4th value is the bend radius at that corner."""
    r = CABLE_R
    under = h - TH
    back = D / 2
    top = h + r
    s = sensor_out
    px = port.x + 0.047
    return [
        (s.x, s.y, s.z),
        (s.x + 0.008, s.y, s.z - 0.003, 0.006),
        (s.x + 0.014, s.y + 0.022, under - 0.020, 0.014),   # droops out of the outlet
        (0.590, s.y + 0.055, under - r, 0.025),             # back up, flat under the top
        (0.590, back - 0.004, under - r, 0.006),
        (0.588, back + r, under - r, 0.005),                # around the back edge
        (0.586, back + r, h + r, 0.005),
        (0.574, back - 0.016, top, 0.012),                  # onto the desktop
        (0.470, back - 0.020, top, 0.03),                   # along the back edge
        (px, port.y + 0.02, top, 0.035),
        (px, port.y, port.z, 0.03),                         # up beside the monitor
        (port.x + 0.030, port.y, port.z),                   # into the plug, sideways
    ]


def build_cable(p: Palette, h, sensor_out, port):
    use_collection(collection("Sensor"))
    return tube("GEO-sensor-cable", cable_points(h, sensor_out, port), CABLE_R, p.ink, sides=8)


def build_beam(p: Palette, emit: Vector):
    use_collection(collection("Sensor"))
    floor = 0.036
    length = emit.z - floor
    rod("GEO-beam", 0.0015, length, (emit.x, emit.y, floor + length / 2), p.beam, sides=8, shadow=False)
    prims.disc("GEO-beam-dot", 0.022, (emit.x, emit.y, floor + 0.0012), p.dot, sides=20, shadow=False)
    prims.disc("GEO-beam-halo", 0.06, (emit.x, emit.y, floor + 0.0006), p.halo, sides=24, shadow=False)
    return Vector((emit.x, emit.y, floor))


def build_props(p: Palette, h: float, phone_tex: str):
    c = collection("Props")
    use_collection(c)
    # keyboard with real key rows
    kx, ky = -0.06, -0.11
    box("GEO-keyboard", (0.36, 0.13, 0.012), (kx, ky, h + 0.006), p.ink)
    pitch = 0.0226
    for row in range(5):
        yy = ky - 0.046 + row * pitch
        if row == 0:
            box("GEO-key-space", (0.12, 0.018, 0.006), (kx - 0.01, yy, h + 0.015), p.ink_muted, shadow=False)
            for i, xx in enumerate((-0.15, -0.125, -0.10, 0.08, 0.105, 0.13, 0.155)):
                box(f"GEO-key-0-{i}", (0.019, 0.018, 0.006), (kx + xx, yy, h + 0.015), p.ink_muted, shadow=False)
            continue
        n = 14 if row < 4 else 14
        for i in range(n):
            xx = -0.147 + i * pitch
            box(f"GEO-key-{row}-{i}", (0.019, 0.018, 0.006), (kx + xx, yy, h + 0.015), p.ink_muted, shadow=False)
    # rounder mouse (R-29): a faceted half-ellipsoid, a little flattened on top
    half_blob("GEO-mouse", (0.064, 0.108, 0.036), (0.20, -0.12, h), p.ink, subdiv=2, rot=(0, 0, -0.08))
    # mug (8-sided, cream) with a faceted handle toward the camera
    rod("GEO-mug", 0.037, 0.095, (-0.42, 0.04, h + 0.0475), p.surface, sides=8, radius_top=0.04)
    torus("GEO-mug-handle", 0.024, 0.007, (-0.38, 0.04, h + 0.05), (0, 0, 0), p.surface)
    # notebook, closed, a little rotated
    box("GEO-notebook", (0.16, 0.22, 0.014), (0.40, -0.15, h + 0.007), p.fabric, rot=(0, 0, 0.18))
    # phone in landscape on an angled stand at the right-back (R-38)
    stand = group("RIG-phone", (0.27, 0.07, h), (0, 0, -0.18))
    box("GEO-phone-stand-base", (0.10, 0.07, 0.006), (0, 0.0, 0.003), p.ink_muted, parent=stand)
    lean = math.radians(25)
    box("GEO-phone-stand-back", (0.08, 0.005, 0.085), (0, 0.022, 0.045), p.ink_muted, rot=(-lean, 0, 0), parent=stand)
    box("GEO-phone-stand-lip", (0.10, 0.012, 0.012), (0, -0.018, 0.012), p.ink_muted, parent=stand)
    ph = group("RIG-phone-body", (0, 0.002, 0.047), (-lean, 0, 0), parent=stand)
    box("GEO-phone", (0.160, 0.008, 0.075), (0, 0, 0), p.ink, parent=ph)
    uv_quad("GEO-phone-screen", 0.150, 0.0705, (0, -0.0042, 0), (0, 0, 0),
            screen("MAT-phone-screen", phone_tex, strength=0.94), parent=ph)
    return stand


def build_chair(p: Palette, t: float):
    c = collection("Chair")
    use_collection(c)
    seat_top = 0.47
    rig = group("RIG-chair", (-0.15 * t, -0.58 - 0.45 * t, 0), (0, 0, 0.4 * t))
    box("GEO-chair-seat", (0.46, 0.44, 0.06), (0, 0, seat_top - 0.03), p.fabric, parent=rig)
    back = group("RIG-chair-back", (0, -0.19, seat_top - 0.03), (0.14, 0, 0), parent=rig)
    box("GEO-chair-spine", (0.06, 0.03, 0.16), (0, 0, 0.06), p.ink, parent=back)
    box("GEO-chair-backrest", (0.42, 0.05, 0.40), (0, 0, 0.30), p.fabric, parent=back)
    col_len = seat_top - 0.06 - 0.06
    rod("GEO-chair-column", 0.026, col_len, (0, 0, 0.06 + col_len / 2), p.ink_satin, sides=8,
        radius_top=0.022, parent=rig)
    box("GEO-chair-pan", (0.24, 0.24, 0.02), (0, 0, seat_top - 0.07), p.ink, parent=rig)
    for i in range(5):
        a = i / 5 * 2 * math.pi + math.pi / 10
        leg = group(f"RIG-chair-leg{i}", (0, 0, 0), (0, 0, a), parent=rig)
        box(f"GEO-chair-leg{i}", (0.30, 0.045, 0.03), (0.16, 0, 0.045), p.ink_satin, parent=leg)
        blob(f"GEO-chair-caster{i}", (0.05, 0.05, 0.05), (0.29, 0, 0.025), p.ink, subdiv=1, parent=leg)
    return rig


# ------------------------------------------------------------------------------------------------
# the person
# ------------------------------------------------------------------------------------------------

def pose_sitting(h: float) -> figure.Pose:
    return figure.Pose(
        pelvis=(0.03, -0.60, 0.55), lean=0.03, head_tilt=0.10, shoulder_shrug=-0.012,
        wrists={"L": (-0.135, -0.215, h + 0.032), "R": (0.192, -0.19, h + 0.036)},
        hand_dirs={"L": (0.08, 1, -0.28), "R": (0.0, 1, -0.18)},
        ankles={"L": (-0.13, -0.14, 0.085), "R": (0.17, -0.20, 0.085)},
        foot_dirs={"L": (-0.18, 1, 0), "R": (0.22, 1, 0)},
        elbow_poles={"L": (-0.8, -0.2, -1.0), "R": (0.9, -0.2, -1.0)},
        knee_pole=(0.0, 1.0, 0.6),
    )


def pose_standing(h: float) -> figure.Pose:
    return figure.Pose(
        pelvis=(0.03, -0.50, 0.935), lean=0.02, head_tilt=0.06, shoulder_shrug=-0.012, twist=0.02,
        wrists={"L": (-0.135, -0.215, h + 0.032), "R": (0.192, -0.19, h + 0.036)},
        hand_dirs={"L": (0.08, 1, -0.28), "R": (0.0, 1, -0.18)},
        ankles={"L": (-0.115, -0.52, 0.085), "R": (0.16, -0.47, 0.085)},
        foot_dirs={"L": (-0.2, 1, 0), "R": (0.28, 1, 0)},
        elbow_poles={"L": (-0.6, -0.3, -1.0), "R": (0.7, -0.3, -1.0)},
        knee_pole=(0.0, 1.0, 0.0),
    )


def pose_for(t: float, h: float) -> figure.Pose:
    """stand-up arc: slide + lean first, then rise (DESIGN.md §8.5)."""
    a, b = pose_sitting(h), pose_standing(h)
    if t <= 0:
        return a
    if t >= 1:
        return b
    fwd = smooth(min(1, t * 1.7))
    rise = smooth(max(0, (t - 0.3) / 0.7))
    L = lambda u, v, k: tuple(x + (y - x) * k for x, y in zip(u, v))  # noqa: E731
    lean = a.lean + (b.lean - a.lean) * rise + 0.34 * math.sin(math.pi * t) * (1 - rise * 0.6)
    pel = (a.pelvis[0], a.pelvis[1] + (b.pelvis[1] - a.pelvis[1]) * fwd, a.pelvis[2] + (b.pelvis[2] - a.pelvis[2]) * rise)
    return figure.Pose(
        pelvis=pel, lean=lean, head_tilt=a.head_tilt, shoulder_shrug=a.shoulder_shrug,
        wrists={k: L(a.wrists[k], b.wrists[k], 1) for k in a.wrists},
        hand_dirs=a.hand_dirs,
        ankles={k: L(a.ankles[k], b.ankles[k], fwd) for k in a.ankles},
        foot_dirs={k: L(a.foot_dirs[k], b.foot_dirs[k], rise) for k in a.foot_dirs},
        elbow_poles=a.elbow_poles,
        knee_pole=L(a.knee_pole, b.knee_pole, rise),
    )


def build_person(p: Palette, t: float, h: float, detail: float = 1.0):
    use_collection(collection("Person"))
    return figure.build(pose_for(t, h), p.figure, name="person", detail=detail)


# ------------------------------------------------------------------------------------------------
# entry point
# ------------------------------------------------------------------------------------------------

def clear():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob)
    for coll in list(bpy.data.collections):
        bpy.data.collections.remove(coll)
    for blocks in (bpy.data.meshes, bpy.data.curves, bpy.data.metaballs, bpy.data.materials, bpy.data.images):
        for b in list(blocks):
            if b.users == 0:
                blocks.remove(b)


def textures(out_dir: str, t: float, story: Story | None = None) -> dict:
    s = story or story_for(t)
    tag = f"{s.state}-{s.height_cm}"
    return {
        "screen": screen_ui.monitor(f"{out_dir}/monitor_{tag}.png", s.state, s.height_cm, toast=s.toast),
        "phone": screen_ui.phone(f"{out_dir}/phone_{tag}.png", s.state if s.state in ("sitting", "standing") else "away",
                                 s.phone_elapsed, s.phone_credit, s.phone_progress),
        "clock": screen_ui.clock_face(f"{out_dir}/clock_{s.clock[0]:02d}{s.clock[1]:02d}.png", *s.clock),
    }


def build(t: float = 0.0, out_dir: str = "", figure_detail: float = 1.0, tex: dict | None = None) -> dict:
    """Build the full scene for stand progress t. Returns anchors for camera shots."""
    clear()
    tex = tex or textures(f"{out_dir}/textures", t)
    h = desk_height(t)
    p = Palette()
    build_world(p, tex["clock"])
    build_desk(p, h)
    port = build_monitor(p, h, tex["screen"])
    sensor_out, emit = build_sensor(p, h)
    build_cable(p, h, sensor_out, port)
    dot = build_beam(p, emit)
    build_props(p, h, tex["phone"])
    build_chair(p, smooth(t))
    build_person(p, t, h, figure_detail)
    return {
        "h": h,
        "sensor": Vector((ENC_X, ENC_Y, h - TH - ENC["height"] / 2)),
        "emitter": emit,
        "dot": dot,
        "port": port,
        "paddle": Vector((0.525, -D / 2, h - TH - 0.07)),
        "phone": Vector((0.27, 0.07, h + 0.05)),
    }
