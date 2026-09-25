"""The app UI as a texture, drawn *in Blender*: flat emissive shapes and text
objects in an orthographic 2D scene, rendered with the Standard view
transform so every token colour lands exactly. No Pillow, no browser.

Layouts mirror `astro/src/components/scene/desk/screenApp.ts` (the monitor,
1000 × 417 design units) and DESK-SCENE-SPEC §3.5 (the phone, 1000 × 470):
height readout -> state chip -> one toast; the phone shows the persistent
elapsed time, the chip and today's stand credit.

Coordinates are canvas-like: x right, y DOWN from the top-left, text y is
the baseline - so numbers can be copied from the canvas code.
"""
from __future__ import annotations

import math
import os

import bmesh
import bpy

from .prims import rounded_rect_pts
from .tokens import REPO, hex_to_srgb, lin, tok

FONT_DIR = REPO / "blender" / "assets" / "fonts"
FONTS = {
    "display": FONT_DIR / "bricolage-grotesque-latin-wght-normal.woff2",
    "body": FONT_DIR / "inter-latin-wght-normal.woff2",
}

STATE_LABEL = {"sitting": "Sitting", "rising": "Rising", "lowering": "Lowering", "standing": "Standing", "away": "Away"}
STATE_TOKEN = {"sitting": "sitting", "standing": "standing", "rising": "away", "lowering": "away", "away": "away"}


def mix(a: str, b: str, t: float) -> str:
    """sRGB mix of two hex colours (what a canvas does with alpha over an opaque colour)."""
    ca, cb = hex_to_srgb(a), hex_to_srgb(b)
    return "#" + "".join(f"{round((x + (y - x) * t) * 255):02X}" for x, y in zip(ca, cb))


class Canvas:
    def __init__(self, w: int, h: int, name: str):
        self.w, self.h, self.name = w, h, name
        self.z = 0.0
        self.objs: list[bpy.types.Object] = []
        self.coll = bpy.data.collections.new(f"UI-{name}")
        bpy.context.scene.collection.children.link(self.coll)

    # -- materials -------------------------------------------------------------------------------
    def _mat(self, hex_colour: str):
        name = f"ui_{hex_colour.upper()}"
        m = bpy.data.materials.get(name)
        if m:
            return m
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = lin(hex_colour)
        em.inputs["Strength"].default_value = 1.0
        nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
        return m

    def _next_z(self):
        self.z += 0.01
        return self.z

    def _link(self, ob):
        self.coll.objects.link(ob)
        self.objs.append(ob)
        return ob

    # -- shapes ----------------------------------------------------------------------------------
    def poly(self, pts, colour):
        z = self._next_z()
        bm = bmesh.new()
        vs = [bm.verts.new((x, -y, z)) for x, y in pts]
        f = bm.faces.new(vs)
        if f.normal.z < 0:
            f.normal_flip()
        me = bpy.data.meshes.new("ui_poly")
        bm.to_mesh(me)
        bm.free()
        me.materials.append(self._mat(colour))
        return self._link(bpy.data.objects.new("ui_poly", me))

    def rect(self, x, y, w, h, colour, r=0.0):
        if r <= 0:
            return self.poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], colour)
        # rounded_rect_pts works in y-up space; feed it y-down by mirroring
        pts = rounded_rect_pts(x, -(y + h), w, h, r)
        return self.poly([(px, -py) for px, py in pts], colour)

    def circle(self, cx, cy, r, colour, seg=48):
        return self.poly([(cx + r * math.cos(2 * math.pi * i / seg), cy + r * math.sin(2 * math.pi * i / seg))
                          for i in range(seg)], colour)

    def line(self, x0, y0, x1, y1, width, colour, seg=8):
        """A stroke with round caps (canvas lineCap='round')."""
        dx, dy = x1 - x0, y1 - y0
        a = math.atan2(dy, dx)
        r = width / 2
        pts = []
        for cx, cy, a0 in ((x1, y1, a - math.pi / 2), (x0, y0, a + math.pi / 2)):
            for i in range(seg + 1):
                t = a0 + math.pi * i / seg
                pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
        return self.poly(pts, colour)

    def text(self, s, x, y, size, colour, font="body", weight=0.0, align="LEFT"):
        """Text with its baseline at y. `weight` thickens the glyphs (the fonts are variable
        woff2 files and Blender uses their default instance): 0 = regular, 1 = bold-ish."""
        cu = bpy.data.curves.new("ui_text", "FONT")
        cu.body = s
        cu.font = bpy.data.fonts.load(str(FONTS[font]), check_existing=True)
        cu.size = size
        cu.align_x = align
        cu.offset = weight * size * 0.018
        cu.resolution_u = 6
        ob = bpy.data.objects.new("ui_text", cu)
        ob.location = (x, -y, self._next_z())
        cu.materials.append(self._mat(colour))
        self._link(ob)
        return ob

    def width(self, ob) -> float:
        bpy.context.view_layer.update()
        return ob.dimensions.x

    # -- render ----------------------------------------------------------------------------------
    def render(self, path: str, px_width: int):
        sc = bpy.context.scene
        cam_d = bpy.data.cameras.new("ui_cam")
        cam_d.type = "ORTHO"
        cam_d.sensor_fit = "HORIZONTAL"
        cam_d.ortho_scale = self.w
        cam = bpy.data.objects.new("ui_cam", cam_d)
        cam.location = (self.w / 2, -self.h / 2, 50)
        self._link(cam)
        prev_cam = sc.camera
        sc.camera = cam
        r = sc.render
        prev = (r.engine, r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath,
                sc.view_settings.view_transform, r.film_transparent)
        r.engine = "BLENDER_EEVEE"
        sc.eevee.taa_render_samples = 16
        r.resolution_x, r.resolution_y = px_width, round(px_width * self.h / self.w)
        r.resolution_percentage = 100
        r.film_transparent = False
        r.image_settings.file_format = "PNG"
        r.image_settings.color_mode = "RGB"
        sc.view_settings.view_transform = "Standard"
        sc.view_settings.look = "None"
        sc.view_settings.exposure = 0
        # hide everything else in the scene for this render
        hidden = [o for o in sc.objects if o not in self.objs and not o.hide_render]
        for o in hidden:
            o.hide_render = True
        os.makedirs(os.path.dirname(path), exist_ok=True)
        r.filepath = path
        bpy.ops.render.render(write_still=True)
        for o in hidden:
            o.hide_render = False
        (r.engine, r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath,
         sc.view_settings.view_transform, r.film_transparent) = prev
        sc.camera = prev_cam
        self.dispose()
        return path

    def dispose(self):
        for ob in self.objs:
            data = ob.data
            bpy.data.objects.remove(ob)
            if data is not None and data.users == 0:
                if isinstance(data, bpy.types.Mesh):
                    bpy.data.meshes.remove(data)
                elif isinstance(data, bpy.types.Curve):
                    bpy.data.curves.remove(data)
                elif isinstance(data, bpy.types.Camera):
                    bpy.data.cameras.remove(data)
        bpy.data.collections.remove(self.coll)
        self.objs.clear()


# ------------------------------------------------------------------------------------------------
# App pieces
# ------------------------------------------------------------------------------------------------

def _chip(c: Canvas, x, y, state, h=76, size=42):
    st = STATE_TOKEN[state]
    label = STATE_LABEL[state]
    probe = c.text(label, x + h, y + h / 2 + size * 0.36, size, tok(f"state.{st}.text"), weight=0.6)
    w = c.width(probe) + h + 42
    c.z -= 0.02  # draw the pill under the label
    c.rect(x, y, w, h, tok(f"state.{st}.tint"), r=h / 2)
    probe.location.z = c._next_z() + 0.05
    cx, cy = x + h * 0.53, y + h / 2
    ir = h * 0.26
    c.circle(cx, cy, ir, tok(f"state.{st}.fill"))
    s = tok("surface")
    lw = h * 0.08
    k = ir * 0.55
    if state == "sitting":
        c.line(cx - k, cy, cx + k, cy, lw, s)
    elif state == "standing":
        c.line(cx, cy + k, cx, cy - k, lw, s)
        c.line(cx - k * 0.8, cy - k * 0.2, cx, cy - k, lw, s)
        c.line(cx + k * 0.8, cy - k * 0.2, cx, cy - k, lw, s)
    elif state in ("rising", "lowering"):
        d = -1 if state == "rising" else 1  # canvas y points down: rising chevrons point up
        for off in (-0.45, 0.45):
            y_tip = cy + (off + 0.3 * d) * k
            y_arm = cy + (off - 0.3 * d) * k
            c.line(cx - k * 0.8, y_arm, cx, y_tip, lw, s)
            c.line(cx + k * 0.8, y_arm, cx, y_tip, lw, s)
    else:  # away: pause bars
        c.line(cx - k * 0.35, cy - k * 0.7, cx - k * 0.35, cy + k * 0.7, lw, s)
        c.line(cx + k * 0.35, cy - k * 0.7, cx + k * 0.35, cy + k * 0.7, lw, s)
    return w


def _shadowed_card(c: Canvas, x, y, w, h, r, bg):
    ink = tok("ink")
    for i, (grow, dy, a) in enumerate(((22, 16, 0.025), (14, 13, 0.04), (7, 10, 0.06), (2, 6, 0.08))):
        c.rect(x - grow, y - grow + dy, w + 2 * grow, h + 2 * grow, mix(bg, ink, a), r=r + grow)
    c.rect(x, y, w, h, tok("surface"), r=r)


TOASTS = {
    "sitting": ("Time to stand up", ["40 min sitting.", "Up for a minute?"]),
    "standing": ("Nice one.", ["Credit is ticking.", "20 min standing."]),
}


def monitor(path: str, state: str, height_cm: int, px_width: int = 2400, toast: bool = True) -> str:
    W, H = 1000, 417
    c = Canvas(W, H, "monitor")
    bg = mix(tok("bg"), tok("ink"), 0.06)
    c.rect(0, 0, W, H, bg)
    x = 44
    c.text("DESK HEIGHT", x + 4, 74, 30, tok("ink-muted"), weight=0.4)
    num = c.text(f"{height_cm}", x - 8, 300, 250, tok("ink"), font="display", weight=1.0)
    nw = c.width(num)
    c.text("cm", x - 8 + nw + 16, 300, 76, tok("ink-muted"), font="display", weight=0.6)
    _chip(c, x + 4, 326, state)
    if toast and state in TOASTS:
        title, body = TOASTS[state]
        cw, ch = 420, 168
        tx, ty = W - cw - 36, 40
        _shadowed_card(c, tx, ty, cw, ch, 26, bg)
        accent = tok("brand") if state == "sitting" else tok("state.standing.fill")
        c.rect(tx + 22, ty + 30, 8, ch - 60, accent, r=4)
        c.text(title, tx + 54, ty + 66, 40, tok("ink") if state == "sitting" else tok("state.standing.text"),
               font="display", weight=0.7)
        for i, line in enumerate(body):
            c.text(line, tx + 54, ty + 112 + i * 40, 32, tok("ink-muted"))
    return c.render(path, px_width)


def phone(path: str, state: str, elapsed: str, credit: str, progress: float, px_width: int = 1400) -> str:
    """The persistent status display (R-38): elapsed time, state chip, today's credit."""
    W, H = 1000, 470
    c = Canvas(W, H, "phone")
    c.rect(0, 0, W, H, tok("bg"))
    st = STATE_TOKEN[state]
    _chip(c, 56, 48, state, h=84, size=46)
    c.text(elapsed, 44, 330, 230, tok("ink"), font="display", weight=1.0)
    c.text("in this state", 60, 392, 34, tok("ink-muted"))
    # progress toward the limit (sitting) or the goal (standing)
    c.rect(60, 418, 560, 16, tok("line"), r=8)
    fill = tok("state.nudge.fill") if (state == "sitting" and progress >= 1) else tok(f"state.{st}.fill")
    c.rect(60, 418, max(16, 560 * min(1.0, progress)), 16, fill, r=8)
    # right column: today's stand credit
    c.rect(680, 48, 1, 386, tok("line"))
    c.text("TODAY", 720, 118, 32, tok("ink-muted"), weight=0.4)
    c.text(credit, 716, 240, 84, tok("ink"), font="display", weight=0.9)
    c.text("standing", 722, 300, 34, tok("ink-muted"))
    c.circle(746, 372, 26, tok("state.points.fill"))
    c.text("+1", 790, 386, 40, tok("state.points.text"), font="display", weight=0.8)
    return c.render(path, px_width)


def clock_face(path: str, hh: int, mm: int, px: int = 1024) -> str:
    """Wall clock face texture (R-37): ticks and hands, no numerals."""
    S = 1000
    c = Canvas(S, S, "clock")
    c.rect(0, 0, S, S, tok("bg"))
    c.circle(500, 500, 500, tok("line-strong"), seg=96)
    c.circle(500, 500, 478, tok("surface"), seg=96)
    for i in range(60):
        a = math.radians(i * 6 - 90)
        r0 = 420 if i % 5 == 0 else 440
        wd = 16 if i % 5 == 0 else 6
        c.line(500 + r0 * math.cos(a), 500 + r0 * math.sin(a), 500 + 455 * math.cos(a), 500 + 455 * math.sin(a),
               wd, tok("ink") if i % 5 == 0 else tok("line-strong"))
    ha = math.radians((hh % 12 + mm / 60) * 30 - 90)
    ma = math.radians(mm * 6 - 90)
    c.line(500, 500, 500 + 250 * math.cos(ha), 500 + 250 * math.sin(ha), 30, tok("ink"))
    c.line(500, 500, 500 + 390 * math.cos(ma), 500 + 390 * math.sin(ma), 18, tok("ink"))
    c.circle(500, 500, 24, tok("brand"))
    return c.render(path, px)
