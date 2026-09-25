"""The sand figure (DESIGN.md §8.5), modelled the way artists sketch one -
overlapping ellipsoids for the masses, capsules for the limbs - but fused
into one continuous skin with metaballs, then decimated into honest facets.

Why metaballs: the web figure is separate primitives, so the waist indents
and the joints show seams (R-26, R-28). Metaball masses of one family blend
into a single surface; limbs are separate families so an arm resting near
the ribs does not melt into them. The result is converted to a mesh and
decimated (collapse) to a few thousand triangles, which gives irregular,
sculpt-like facets instead of the uniform facets of a subdivided primitive.

Proportions follow the Loomis 8-head canon from DESK-SCENE-SPEC §6
(1.75 m, head 22 cm, shoulders ≈ 48 cm across the deltoids, hips 36 cm,
thigh 44 cm tapering 17 → 12 cm, calf 13 cm, ankle 8 cm).

Posing is by targets, not angles: pelvis position, torso lean, wrist and
ankle targets; elbows and knees are solved with two-bone IK and a pole.
Everything is in Blender coordinates: the person faces +Y (toward the desk).
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector

from . import prims

# Metaball iso-surface radius is ~0.575 × the element radius (threshold 0.6, stiffness 2):
# measured in Blender 5.2 with a lone BALL. Divide surface radii by this.
K = 0.575

BODY = {
    "shoulder_half": 0.19,   # joint centres; deltoid masses add ~5.5 cm each side -> ~49 cm
    "shoulder_up": 0.50,     # above the hip-joint centre
    "hip_half": 0.095,
    "upper_arm": 0.30,
    "forearm": 0.26,
    "thigh": 0.44,
    "shin": 0.43,
    "ankle_h": 0.08,
}


@dataclass
class Pose:
    pelvis: tuple                      # hip-joint centre (x, y, z)
    lean: float = 0.0                  # torso lean, radians, + = forward (toward +Y)
    twist: float = 0.0                 # torso yaw, radians, + = counter-clockwise from above
    head_tilt: float = 0.0             # extra head pitch, + = looks down
    head_turn: float = 0.0
    wrists: dict = field(default_factory=dict)      # side 'L'/'R' -> (x, y, z)
    hand_dirs: dict = field(default_factory=dict)   # side -> direction the fingers point
    ankles: dict = field(default_factory=dict)      # side -> (x, y, z)
    foot_dirs: dict = field(default_factory=dict)
    elbow_poles: dict = field(default_factory=lambda: {"L": (-0.6, -0.4, -1.0), "R": (0.6, -0.4, -1.0)})
    knee_pole: tuple = (0.0, 1.0, 0.25)
    shoulder_shrug: float = 0.0        # lowers (-) or raises (+) the shoulders: relaxed = -0.01


def _torso_frame(pose: Pose) -> Matrix:
    return (Matrix.Rotation(pose.twist, 3, "Z") @ Matrix.Rotation(-pose.lean, 3, "X"))


def _ik(root: Vector, target: Vector, a: float, b: float, pole: Vector) -> tuple[Vector, Vector]:
    """Two-bone IK: returns (middle joint, clamped end)."""
    d_vec = target - root
    d = min(d_vec.length, (a + b) * 0.995)
    u = d_vec.normalized()
    end = root + u * d
    cos_a = max(-1.0, min(1.0, (a * a + d * d - b * b) / (2 * a * d)))
    sin_a = math.sqrt(max(0.0, 1 - cos_a * cos_a))
    p = pole - u * pole.dot(u)
    if p.length < 1e-6:
        p = Vector((0, 0, -1)) - u * u.z
    p.normalize()
    return root + u * (a * cos_a) + p * (a * sin_a), end


def _quat_x_to(direction: Vector) -> Quaternion:
    return Vector((1, 0, 0)).rotation_difference(direction.normalized())


def _basis_quat(forward: Vector, up=Vector((0, 0, 1))) -> Quaternion:
    """Rotation whose local +Y points along `forward` and local +Z is as close to `up` as possible."""
    y = forward.normalized()
    x = y.cross(up)
    if x.length < 1e-6:
        x = Vector((1, 0, 0))
    x.normalize()
    z = x.cross(y).normalized()
    m = Matrix((x, y, z)).transposed()
    return m.to_quaternion()


class _Family:
    """One metaball object = one blend family."""

    def __init__(self, name: str, resolution: float):
        self.mb = bpy.data.metaballs.new(name)
        self.mb.resolution = resolution
        self.mb.render_resolution = resolution
        self.ob = bpy.data.objects.new(name, self.mb)
        bpy.context.scene.collection.objects.link(self.ob)

    def ball(self, co, r, stiffness=2.0):
        e = self.mb.elements.new(type="BALL")
        e.co, e.radius, e.stiffness = co, r / K, stiffness
        return e

    def ellipsoid(self, co, size, rot: Quaternion | None = None, stiffness=2.0):
        """size = full surface dimensions (sx, sy, sz) in the element's local axes."""
        r = max(size) / 2
        e = self.mb.elements.new(type="ELLIPSOID")
        e.co, e.radius, e.stiffness = co, r / K, stiffness
        e.size_x, e.size_y, e.size_z = (s / 2 / r for s in size)
        if rot is not None:
            e.rotation = rot
        return e

    def capsule(self, a, b, r, stiffness=2.0):
        a, b = Vector(a), Vector(b)
        e = self.mb.elements.new(type="CAPSULE")
        e.co = (a + b) / 2
        e.radius = r / K
        e.stiffness = stiffness
        e.size_x = max(0.0005, (b - a).length / 2)
        e.rotation = _quat_x_to(b - a)
        return e

    def taper(self, a, b, r0, r1, steps=3, stiffness=2.0):
        """A tapering limb: short capsules stepping the radius from r0 to r1."""
        a, b = Vector(a), Vector(b)
        for i in range(steps):
            t0, t1 = i / steps, (i + 1) / steps
            self.capsule(a.lerp(b, t0), a.lerp(b, t1), r0 + (r1 - r0) * (t0 + t1) / 2, stiffness)

    def to_mesh(self, name, mat, ratio, parent=None, coll=None):
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(self.ob.evaluated_get(dg))
        bpy.data.objects.remove(self.ob)
        bpy.data.metaballs.remove(self.mb)
        me.name = name + "_dense"
        tmp = bpy.data.objects.new(name + "_tmp", me)
        bpy.context.scene.collection.objects.link(tmp)
        mod = tmp.modifiers.new("decimate", "DECIMATE")
        mod.decimate_type = "COLLAPSE"
        mod.ratio = ratio
        mod.use_collapse_triangulate = True
        dg = bpy.context.evaluated_depsgraph_get()
        low = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
        bpy.data.objects.remove(tmp)
        bpy.data.meshes.remove(me)
        low.name = name
        for p in low.polygons:
            p.use_smooth = False
        low.materials.append(mat)
        ob = bpy.data.objects.new(name, low)
        prims._coll(coll).objects.link(ob)
        if parent is not None:
            ob.parent = parent
        return ob


def build(pose: Pose, mat, name: str = "person", resolution: float = 0.011,
          detail: float = 1.0, coll=None) -> list[bpy.types.Object]:
    """Build the posed figure; returns its mesh objects (torso, arms, legs, head).
    `detail` scales the decimation ratio (1.0 ≈ 5-6 k triangles in total)."""
    B = BODY
    P = Vector(pose.pelvis)
    F = _torso_frame(pose)

    def T(x, y, z):  # torso-local offset -> world
        return P + F @ Vector((x, y, z))

    up = F @ Vector((0, 0, 1))
    fwd = F @ Vector((0, 1, 0))
    rot = F.to_quaternion()
    objs = []

    # ---- torso family: pelvis, belly/waist, ribcage, deltoids, neck -----------------------------
    tor = _Family(f"{name}Torso", resolution)
    tor.ellipsoid(T(0, -0.005, 0.05), (0.36, 0.225, 0.24), rot)              # pelvis 36 wide
    tor.ellipsoid(T(0, 0.005, 0.19), (0.325, 0.205, 0.22), rot)              # waist r ≥ 13: fuller, no paunch
    tor.ellipsoid(T(0, 0.0, 0.35), (0.40, 0.235, 0.34), rot)                 # ribcage 40 wide
    tor.ellipsoid(T(0, 0.0, 0.44), (0.36, 0.20, 0.11), rot)                  # upper chest / trapezius
    sh_z = B["shoulder_up"] + pose.shoulder_shrug
    for s in (-1, 1):
        tor.ball(T(s * B["shoulder_half"], -0.005, sh_z), 0.058, stiffness=1.6)  # deltoid mass ⌀ ~11
    tor.capsule(T(0, 0.0, 0.47), T(0, 0.02, 0.60), 0.046)                    # neck r 5, starts low
    # ---- head: part of the torso skin, so neck and skull are one sculpted mass (no seam)
    neck_top = T(0, 0.02, 0.60)
    head_rot = (F @ Matrix.Rotation(pose.head_turn, 3, "Z") @ Matrix.Rotation(-pose.head_tilt, 3, "X"))
    head_c = neck_top + head_rot @ Vector((0, 0.015, 0.085))
    tor.ellipsoid(head_c, (0.19, 0.21, 0.23), head_rot.to_quaternion(), stiffness=3.0)
    tor.ellipsoid(head_c + head_rot @ Vector((0, 0.035, -0.07)), (0.12, 0.11, 0.08), head_rot.to_quaternion(),
                  stiffness=1.5)  # jaw mass, faceless
    objs.append(tor.to_mesh(f"{name}_torso", mat, 0.045 * detail, coll=coll))

    # ---- arms ------------------------------------------------------------------------------------
    for side, s in (("L", -1), ("R", 1)):
        if side not in pose.wrists:
            continue
        S = T(s * B["shoulder_half"], -0.01, sh_z - 0.02)
        W_target = Vector(pose.wrists[side])
        pole = Vector(pose.elbow_poles.get(side, (s * 0.6, -0.4, -1.0)))
        E, W = _ik(S, W_target, B["upper_arm"], B["forearm"], pole)
        arm = _Family(f"{name}Arm{side}", resolution)
        arm.taper(S, E, 0.052, 0.042, steps=3)            # upper arm ⌀ 10 -> 8.4
        arm.ellipsoid(S.lerp(E, 0.3), (0.092, 0.13, 0.092), _basis_quat(E - S))  # soft upper-arm mass
        arm.taper(E, W, 0.041, 0.030, steps=3)            # forearm tapers to the wrist
        arm.ellipsoid(E.lerp(W, 0.3), (0.078, 0.11, 0.07), _basis_quat(W - E))
        hdir = Vector(pose.hand_dirs.get(side, (W - E)))
        hq = _basis_quat(hdir)
        hand_c = W + hdir.normalized() * 0.055
        arm.ellipsoid(hand_c, (0.085, 0.115, 0.034), hq, stiffness=2.4)  # mitten hand
        objs.append(arm.to_mesh(f"{name}_arm{side}", mat, 0.05 * detail, coll=coll))

    # ---- legs ------------------------------------------------------------------------------------
    for side, s in (("L", -1), ("R", 1)):
        H = P + F @ Vector((s * B["hip_half"], 0, 0))
        A_target = Vector(pose.ankles[side])
        K_, A = _ik(H, A_target, B["thigh"], B["shin"], Vector(pose.knee_pole))
        leg = _Family(f"{name}Leg{side}", resolution)
        leg.taper(H, K_, 0.088, 0.058, steps=4)          # thigh ⌀ 17.6 -> 11.6
        leg.ellipsoid(H.lerp(K_, 0.3), (0.17, 0.2, 0.17), _basis_quat(K_ - H))  # fuller mass at the top
        leg.ball(K_, 0.058)
        leg.taper(K_, A, 0.052, 0.038, steps=4)          # shin to ankle ⌀ 7.6
        # calf mass: behind the shin, a third of the way down
        shin_dir = (A - K_).normalized()
        behind = -Vector(pose.foot_dirs.get(side, (0, 1, 0))).normalized()
        leg.ellipsoid(K_.lerp(A, 0.3) + behind * 0.02, (0.12, 0.2, 0.13), _basis_quat(shin_dir, behind))
        fdir = Vector(pose.foot_dirs.get(side, (0, 1, 0)))
        fdir.z = 0
        fdir.normalize()
        foot_c = Vector((A.x, A.y, 0.035)) + fdir * 0.065
        leg.ellipsoid(foot_c, (0.095, 0.25, 0.075), _basis_quat(fdir), stiffness=2.4)
        leg.ball(A + Vector((0, 0, -0.01)), 0.042)
        objs.append(leg.to_mesh(f"{name}_leg{side}", mat, 0.05 * detail, coll=coll))

    return objs
