/**
 * Scene kit — person poses (DESIGN.md §8.5).
 *
 * A pose is a set of joint angles (radians, rotation about the body's X axis:
 * positive swings a hanging limb forward, toward the desk at -Z) plus the hip
 * position in scene space. `standUp(t)` blends SITTING → STANDING the way a
 * person actually gets up: lean and slide the hips forward first, then rise
 * with the knees under the hips, then straighten.
 */
import type { Vec3 } from "./Block";

export interface Pose {
  hip: Vec3;
  torsoLean: number;
  shoulder: number;
  elbow: number;
  thigh: number;
  knee: number;
}

/**
 * Gesture-drawing proportions in metres, 1.75 m tall: the figure is a stack of
 * overlapping ellipsoids (head, ribcage, pelvis, hands, feet) and capsules
 * (neck, waist, limbs). Capsule `length` is the straight part; the total is
 * `length + 2 × radius`. The pelvis sits up inside the ribcage with a waist
 * capsule between them, so the torso reads as one mass. Arms hang from just
 * below the ribcage's widest point, inside its silhouette. Sole = hip.y − 0.95.
 */
export const BODY = {
  head: [0.19, 0.22, 0.2] as Vec3,
  neck: { radius: 0.035, length: 0.05 },
  ribcage: [0.36, 0.4, 0.24] as Vec3,
  waist: { radius: 0.105, length: 0.05 },
  pelvis: [0.3, 0.16, 0.22] as Vec3,
  upperArm: { radius: 0.045, length: 0.22 },
  forearm: { radius: 0.04, length: 0.19 },
  hand: [0.08, 0.03, 0.1] as Vec3,
  thigh: { radius: 0.075, length: 0.32 },
  shin: { radius: 0.055, length: 0.36 },
  foot: [0.09, 0.05, 0.24] as Vec3,
  /** arm pivot: lower and further in than a shoulder cap would be */
  shoulderX: 0.165,
  shoulderY: 0.43,
  hipX: 0.09,
} as const;

/** Sitting at the desk on a 47 cm seat, hands on the keyboard. */
export const SITTING: Pose = {
  hip: [0, 0.5, 0.52],
  torsoLean: -0.06,
  shoulder: 0.5,
  elbow: 0.95,
  thigh: Math.PI / 2,
  knee: -Math.PI / 2,
};

/** Standing at the desk, one step closer, hands on the keyboard at 112 cm. */
export const STANDING: Pose = {
  hip: [0, 0.95, 0.45],
  torsoLean: -0.02,
  shoulder: 0.32,
  elbow: 1.18,
  thigh: 0,
  knee: 0,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smooth(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/** Linear blend of two poses. `t` should already be eased. */
export function blendPose(a: Pose, b: Pose, t: number): Pose {
  return {
    hip: [lerp(a.hip[0], b.hip[0], t), lerp(a.hip[1], b.hip[1], t), lerp(a.hip[2], b.hip[2], t)],
    torsoLean: lerp(a.torsoLean, b.torsoLean, t),
    shoulder: lerp(a.shoulder, b.shoulder, t),
    elbow: lerp(a.elbow, b.elbow, t),
    thigh: lerp(a.thigh, b.thigh, t),
    knee: lerp(a.knee, b.knee, t),
  };
}

/**
 * The stand-up arc for a raw 0..1 `t`: the hips slide forward over the feet
 * in the first half (with a forward lean), the rise happens in the second
 * half with the knees staying under the hips; the arms follow the desk.
 */
export function standUp(t: number): Pose {
  const forward = smooth(Math.min(1, t * 1.7));
  const rise = smooth(Math.max(0, (t - 0.3) / 0.7));
  const lean = -0.34 * Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * (1 - rise * 0.6);
  return {
    hip: [0, lerp(SITTING.hip[1], STANDING.hip[1], rise), lerp(SITTING.hip[2], STANDING.hip[2], forward)],
    torsoLean: lerp(SITTING.torsoLean, STANDING.torsoLean, rise) + lean,
    shoulder: lerp(SITTING.shoulder, STANDING.shoulder, smooth(t)),
    elbow: lerp(SITTING.elbow, STANDING.elbow, smooth(t)),
    thigh: lerp(SITTING.thigh, STANDING.thigh, rise),
    knee: lerp(SITTING.knee, STANDING.knee, rise),
  };
}
