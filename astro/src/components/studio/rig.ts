/**
 * Studio — rig-agnostic pose edits applied AFTER the mixer has posed a
 * skeleton: "swing a bone toward a world direction" and a two-bone IK that
 * puts a hand on a target. Working in world directions (down, forward,
 * toward the parent) means one set of sliders works on every rig, whatever
 * its bones' local axes are.
 */
import * as THREE from "three";

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qw = new THREE.Quaternion();
const _qp = new THREE.Quaternion();

/** Rotate `bone` in WORLD space by `q`, keeping its parent. Updates world matrices below it. */
export function rotateWorld(bone: THREE.Object3D, q: THREE.Quaternion): void {
  bone.getWorldQuaternion(_qw);
  _qw.premultiply(q);
  if (bone.parent) {
    bone.parent.getWorldQuaternion(_qp);
    _qw.premultiply(_qp.invert());
  }
  bone.quaternion.copy(_qw);
  bone.updateMatrixWorld(true);
}

/** Turn `bone` so the direction bone→tip moves `radians` toward `dir` (never past it). */
export function swingToward(bone: THREE.Object3D, tip: THREE.Object3D, dir: THREE.Vector3, radians: number): void {
  if (radians === 0) return;
  bone.getWorldPosition(_a);
  tip.getWorldPosition(_b);
  const from = _b.sub(_a).normalize();
  const angle = from.angleTo(dir);
  if (angle < 1e-4) return;
  const axis = _c.crossVectors(from, dir).normalize();
  if (axis.lengthSq() < 1e-8) return;
  const step = Math.sign(radians) * Math.min(Math.abs(radians), angle);
  rotateWorld(bone, _q.setFromAxisAngle(axis, step));
}

/** Rotate `bone` so the direction bone→tip becomes `to` exactly. */
function aim(bone: THREE.Object3D, tip: THREE.Object3D, to: THREE.Vector3): void {
  bone.getWorldPosition(_a);
  tip.getWorldPosition(_b);
  const from = _b.sub(_a).normalize();
  rotateWorld(bone, _q.setFromUnitVectors(from, to.clone().normalize()));
}

/**
 * Two-bone IK: place `hand` at `target` by rotating `upper` and `fore`,
 * keeping the elbow on the side it already bends to (the clip's bend plane).
 * `weight` blends from the clip's hand position (0) to the target (1).
 */
export function reachTo(upper: THREE.Object3D, fore: THREE.Object3D, hand: THREE.Object3D, target: THREE.Vector3, weight: number): void {
  if (weight <= 0) return;
  const s = upper.getWorldPosition(new THREE.Vector3());
  const e = fore.getWorldPosition(new THREE.Vector3());
  const w = hand.getWorldPosition(new THREE.Vector3());
  const goal = w.clone().lerp(target, Math.min(1, weight));
  const a = s.distanceTo(e);
  const b = e.distanceTo(w);
  const toGoal = goal.clone().sub(s);
  const d = THREE.MathUtils.clamp(toGoal.length(), Math.abs(a - b) + 1e-4, a + b - 1e-4);
  const dir = toGoal.normalize();
  // pole: where the elbow sits now, projected off the shoulder→goal line
  const pole = e.clone().sub(s);
  pole.sub(dir.clone().multiplyScalar(pole.dot(dir)));
  if (pole.lengthSq() < 1e-8) pole.set(0, -1, 0);
  pole.normalize();
  const x = (a * a - b * b + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const elbow = s.clone().add(dir.clone().multiplyScalar(x)).add(pole.multiplyScalar(h));
  aim(upper, fore, elbow.clone().sub(s));
  aim(fore, hand, s.clone().add(dir.multiplyScalar(d)).sub(elbow));
}

/** First descendant bone of `bone` (the tip used to measure its direction). */
export function childBone(bone: THREE.Object3D): THREE.Object3D | null {
  return bone.children.find((c) => (c as THREE.Bone).isBone) ?? null;
}
