"""Faceted low-poly primitives (DESIGN.md §8.1): sharp boxes, 8-sided rods,
icosphere ellipsoids, half-ellipsoids and tubes. No bevels, flat shading.

Coordinates are Blender-native: metres, Z up, the desk front faces -Y
(three.js scene: x -> x, y -> z, z -> -y). Every builder returns the object;
`parent=` attaches it to a group empty so rigs (chair, desk top) move as one.
"""
from __future__ import annotations

import math

import bmesh
import bpy
from mathutils import Matrix, Vector


def collection(name: str, parent: bpy.types.Collection | None = None) -> bpy.types.Collection:
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    parent = parent or bpy.context.scene.collection
    if c.name not in parent.children:
        parent.children.link(c)
    return c


_ACTIVE: list[bpy.types.Collection] = []


def use_collection(c: bpy.types.Collection):
    _ACTIVE[:] = [c]


def _coll(c):
    if c is not None:
        return c
    return _ACTIVE[0] if _ACTIVE else bpy.context.scene.collection


def group(name: str, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, coll=None) -> bpy.types.Object:
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.05
    e.location = loc
    e.rotation_euler = rot
    _coll(coll).objects.link(e)
    if parent is not None:
        e.parent = parent
    return e


def from_bmesh(name: str, bm: bmesh.types.BMesh, mat, loc=(0, 0, 0), rot=(0, 0, 0),
               parent=None, coll=None, smooth: bool = False, shadow: bool = True) -> bpy.types.Object:
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = smooth
    if mat is not None:
        me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = rot
    _coll(coll).objects.link(ob)
    if parent is not None:
        ob.parent = parent
    if not shadow:
        ob.visible_shadow = False
    return ob


def box(name, size, loc, mat, rot=(0, 0, 0), parent=None, **kw):
    """Sharp box of full size (sx, sy, sz) centred at loc."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    return from_bmesh(name, bm, mat, loc, rot, parent, **kw)


def taper_box(name, length, w_start, w_end, height, loc, mat, rot=(0, 0, 0), parent=None, **kw):
    """Box along +X whose Y width tapers from w_start (at -X) to w_end (at +X)."""
    bm = bmesh.new()
    x0, x1, h = -length / 2, length / 2, height / 2
    pts = [(x0, -w_start / 2), (x1, -w_end / 2), (x1, w_end / 2), (x0, w_start / 2)]
    bot = [bm.verts.new((x, y, -h)) for x, y in pts]
    top = [bm.verts.new((x, y, h)) for x, y in pts]
    bm.faces.new(list(reversed(bot)))
    bm.faces.new(top)
    for i in range(4):
        j = (i + 1) % 4
        bm.faces.new((bot[i], bot[j], top[j], top[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return from_bmesh(name, bm, mat, loc, rot, parent, **kw)


def rod(name, radius, length, loc, mat, sides=8, radius_top=None, rot=(0, 0, 0), parent=None, **kw):
    """Low-segment cylinder/cone along local Z, centred at loc."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=sides,
                          radius1=radius, radius2=radius if radius_top is None else radius_top,
                          depth=length)
    return from_bmesh(name, bm, mat, loc, rot, parent, **kw)


def blob(name, size, loc, mat, subdiv=2, rot=(0, 0, 0), parent=None, **kw):
    """Faceted ellipsoid of full size (sx, sy, sz): an icosphere, stretched."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=0.5)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    return from_bmesh(name, bm, mat, loc, rot, parent, **kw)


def half_blob(name, size, loc, mat, subdiv=2, rot=(0, 0, 0), parent=None, flat_cut=0.0, **kw):
    """Upper half of a faceted ellipsoid, closed flat at the bottom (a mouse, a cushion).
    size = (sx, sy, height); flat_cut shaves that fraction off the top for a flatter back."""
    sx, sy, h = size
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                           plane_co=(0, 0, 0), plane_no=(0, 0, -1), clear_outer=True)
    bmesh.ops.holes_fill(bm, edges=[e for e in bm.edges if e.is_boundary], sides=0)
    bmesh.ops.scale(bm, vec=Vector((sx / 2, sy / 2, h)), verts=bm.verts)
    if flat_cut > 0:
        top = h * (1 - flat_cut)
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                               plane_co=(0, 0, top), plane_no=(0, 0, 1), clear_outer=True)
        bmesh.ops.holes_fill(bm, edges=[e for e in bm.edges if e.is_boundary], sides=0)
    return from_bmesh(name, bm, mat, loc, rot, parent, **kw)


def polygon(name, pts2d, z, mat, loc=(0, 0, 0), parent=None, **kw):
    """A flat n-gon in the XY plane at height z (UI panels, floor dots)."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, z)) for x, y in pts2d]
    bm.faces.new(vs)
    return from_bmesh(name, bm, mat, loc, (0, 0, 0), parent, **kw)


def disc(name, radius, loc, mat, sides=24, parent=None, **kw):
    pts = [(radius * math.cos(2 * math.pi * i / sides), radius * math.sin(2 * math.pi * i / sides))
           for i in range(sides)]
    ob = polygon(name, pts, 0.0, mat, loc, parent, **kw)
    return ob


def rounded_rect_pts(x, y, w, h, r, seg=8):
    """Corner-rounded rectangle outline (x, y = lower-left) as 2D points, counter-clockwise."""
    r = min(r, w / 2, h / 2)
    pts = []
    corners = [(x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)]
    for cx, cy, a0 in corners:
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def fillet_path(points, bend=0.012, samples=6):
    """Polyline with rounded corners: straight runs and neat bends, the way a cable lies when
    it is routed along edges (Bezier auto handles overshoot and make a cable wiggle).
    A point may carry its own bend radius as a 4th value."""
    pts = [Vector(p[:3]) for p in points]
    radii = [p[3] if len(p) > 3 else bend for p in points]
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        a, p, c = pts[i - 1], pts[i], pts[i + 1]
        l1, l2 = (p - a).length, (c - p).length
        if l1 < 1e-6 or l2 < 1e-6:
            continue
        r = min(radii[i], 0.49 * l1, 0.49 * l2)
        s0 = p - (p - a).normalized() * r
        s1 = p + (c - p).normalized() * r
        for k in range(samples + 1):
            t = k / samples
            out.append((1 - t) ** 2 * s0 + 2 * (1 - t) * t * p + t * t * s1)
    out.append(pts[-1])
    return out


def tube(name, points, radius, mat, sides=8, smooth=True, parent=None, coll=None, bend=0.012):
    """A cable through the given points (filleted polyline), converted to a mesh so it exports
    to glTF. The tube lies on surfaces only if the points do (DESK-SCENE-SPEC §3.2)."""
    path = fillet_path(points, bend)
    cu = bpy.data.curves.new(name + "_curve", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = max(0, (sides - 4) // 2)
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(path) - 1)
    for pt, p in zip(sp.points, path):
        pt.co = (p.x, p.y, p.z, 1.0)
    tmp = bpy.data.objects.new(name + "_tmp", cu)
    bpy.context.scene.collection.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp)
    bpy.data.curves.remove(cu)
    me.name = name
    for p in me.polygons:
        p.use_smooth = smooth
    me.materials.clear()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    _coll(coll).objects.link(ob)
    if parent is not None:
        ob.parent = parent
    return ob


def look_rotation(direction: Vector, up: str = "Z"):
    """Euler rotation turning local +Z toward direction."""
    return direction.to_track_quat("Z", "Y" if up == "Z" else "Z").to_euler()


def segment_rod(name, a, b, radius, mat, sides=8, parent=None, **kw):
    a, b = Vector(a), Vector(b)
    d = b - a
    rot = d.to_track_quat("Z", "Y").to_euler()
    return rod(name, radius, d.length, (a + b) / 2, mat, sides=sides, rot=rot, parent=parent, **kw)


def apply_parent_transforms(objs):
    """Bake world matrices into objects (used before glTF export when empties are dropped)."""
    for ob in objs:
        mw = ob.matrix_world.copy()
        ob.parent = None
        ob.matrix_world = mw


def identity() -> Matrix:
    return Matrix.Identity(4)
