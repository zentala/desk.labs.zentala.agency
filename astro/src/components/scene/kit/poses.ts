/**
 * Scene kit — person poses (DESIGN.md §8.5).
 *
 * A pose is a set of joint angles (radians, rotation about the body's X axis:
 * positive swings a hanging limb forward, toward the desk at -Z) plus the hip
 * position in scene space. Poses blend linearly by `t`; the caller eases `t`.
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

/** Body proportions in metres: 1.75 m, ~7 heads (§8.5). */
export const BODY = {
  headRadius: 0.11,
  torso: [0.34, 0.55, 0.2] as Vec3,
  upperArm: [0.085, 0.3, 0.085] as Vec3,
  forearm: [0.075, 0.27, 0.075] as Vec3,
  thigh: [0.15, 0.44, 0.15] as Vec3,
  shin: [0.12, 0.42, 0.12] as Vec3,
  foot: [0.1, 0.05, 0.24] as Vec3,
  shoulderX: 0.225,
  hipX: 0.09,
} as const;

/** Sitting at the desk on a 47 cm seat, forearms on the keyboard. */
export const SITTING: Pose = {
  hip: [0, 0.545, 0.6],
  torsoLean: -0.06,
  shoulder: 0.35,
  elbow: 1.25,
  thigh: Math.PI / 2,
  knee: -Math.PI / 2,
};

/** Standing at the desk, one step closer, forearms at 112 cm. */
export const STANDING: Pose = {
  hip: [0, 0.915, 0.45],
  torsoLean: -0.02,
  shoulder: 0.28,
  elbow: 1.15,
  thigh: 0,
  knee: 0,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Blend two poses. `t` should already be eased. */
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
