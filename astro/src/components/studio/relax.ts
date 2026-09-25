/**
 * Studio — "relaxed" pose edits for ready-made rigs, applied after the clip.
 * UAL idles are a combat-ready stance (owner: "looks like it wants to
 * fight"); these offsets drop the shoulders, bring the upper arms in, pitch
 * the spine and neck a few degrees toward the screen, straighten the knees
 * when standing and curl the fingers so the hands are open, not fists. While
 * seated or standing at the desk, a two-bone IK rests both wrists on the keyboard.
 */
import * as THREE from "three";
import type { Vec3 } from "../scene/kit";
import type { FigureAction } from "../scene/kit/timeline";
import type { RigNames } from "./figures";
import { childBone, reachTo, swingToward } from "./rig";
import type { RelaxParams } from "./settings";

/** Where the wrists rest: left and right, world metres. */
export interface Keyboard {
  left: Vec3;
  right: Vec3;
}

interface RelaxContext {
  action: FigureAction;
  /** extra yaw of the walk-out; the figure's forward is -Z turned by it */
  yaw: number;
  keyboard: Keyboard;
}

const DOWN = new THREE.Vector3(0, -1, 0);
const deg = THREE.MathUtils.degToRad;

function bone(root: THREE.Object3D, name: string | undefined): THREE.Object3D | null {
  return name ? root.getObjectByName(name) ?? null : null;
}

/** Swing `name` toward `dir` using its first child bone (or `tipName`) as the tip. */
function swing(root: THREE.Object3D, name: string | undefined, dir: THREE.Vector3, degrees: number, tipName?: string): void {
  const b = bone(root, name);
  if (!b) return;
  const tip = tipName ? bone(root, tipName) : childBone(b);
  if (tip) swingToward(b, tip, dir, deg(degrees));
}

function relaxUpperBody(root: THREE.Object3D, rig: RigNames, p: RelaxParams, forward: THREE.Vector3): void {
  const perSpine = p.spinePitch / Math.max(1, rig.spine.length);
  rig.spine.forEach((name, i) => swing(root, name, forward, perSpine, rig.spine[i + 1] ?? rig.neck));
  swing(root, rig.neck, forward, p.neckPitch);
  for (const side of [0, 1] as const) {
    swing(root, rig.clavicle?.[side], DOWN, p.shoulderDown, rig.upperArm[side]);
    swing(root, rig.upperArm[side], DOWN, p.armIn, rig.foreArm[side]);
  }
}

function straightenKnees(root: THREE.Object3D, rig: RigNames, degrees: number): void {
  for (const side of [0, 1] as const) {
    const thigh = bone(root, rig.thigh[side]);
    const calf = bone(root, rig.calf[side]);
    if (!thigh || !calf) continue;
    const along = calf.getWorldPosition(new THREE.Vector3()).sub(thigh.getWorldPosition(new THREE.Vector3())).normalize();
    swing(root, rig.calf[side], along, degrees);
  }
}

function curlFingers(root: THREE.Object3D, rig: RigNames, degrees: number): void {
  if (!rig.finger || degrees === 0) return;
  const fingers: THREE.Object3D[] = [];
  root.traverse((o) => {
    if (rig.finger?.test(o.name)) fingers.push(o);
  });
  for (const f of fingers) {
    const tip = childBone(f);
    if (tip) swingToward(f, tip, DOWN, deg(degrees));
  }
}

function handsOnKeyboard(root: THREE.Object3D, rig: RigNames, weight: number, keyboard: Keyboard): void {
  const hands = [bone(root, rig.hand[0]), bone(root, rig.hand[1])];
  if (!hands[0] || !hands[1]) return;
  // the hand further toward -X takes the left half: rigs disagree on which side "l" ends up after facing the desk
  const flip = hands[0].getWorldPosition(new THREE.Vector3()).x > hands[1].getWorldPosition(new THREE.Vector3()).x;
  const targets = [new THREE.Vector3(...keyboard.left), new THREE.Vector3(...keyboard.right)];
  for (const side of [0, 1] as const) {
    const upper = bone(root, rig.upperArm[side]);
    const fore = bone(root, rig.foreArm[side]);
    const hand = hands[side];
    if (!upper || !fore || !hand) continue;
    reachTo(upper, fore, hand, targets[flip ? 1 - side : side], weight);
  }
}

export function applyRelax(root: THREE.Object3D, rig: RigNames, p: RelaxParams, ctx: RelaxContext): void {
  const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), ctx.yaw);
  relaxUpperBody(root, rig, p, forward);
  if (ctx.action === "stand" || ctx.action === "walk") straightenKnees(root, rig, p.kneeStraight);
  curlFingers(root, rig, p.fingerCurl);
  // seated and standing work both type; rising, lowering and walking hands follow the clip
  if (ctx.action === "sit" || ctx.action === "stand") handsOnKeyboard(root, rig, p.handsOnKeys, ctx.keyboard);
}
