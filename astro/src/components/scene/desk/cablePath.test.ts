import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { CABLE_RADIUS, cablePath } from "./sensorGeometry";
import { monitorPort } from "./monitorGeometry";
import { DESK, deskHeight } from "./dims";

/** the owner's rule: the tube's surface stays at least 3 mm off the desktop */
const MIN_CLEARANCE = CABLE_RADIUS + 0.003;
const SAMPLES = 4000;

/** Distance from a point to the desktop box (0 inside). */
function distanceToDesktop(p: THREE.Vector3, heightM: number): number {
  const box = new THREE.Box3(
    new THREE.Vector3(-DESK.width / 2, heightM - DESK.topThickness, -DESK.depth / 2),
    new THREE.Vector3(DESK.width / 2, heightM, DESK.depth / 2),
  );
  return box.distanceToPoint(p);
}

/** Samples the same curve `kit/Block.tsx` Cable builds its tube around. */
function minClearance(heightM: number): { min: number; at: THREE.Vector3 } {
  const curve = new THREE.CatmullRomCurve3(cablePath(heightM, monitorPort(heightM)).map((p) => new THREE.Vector3(...p)));
  let min = Infinity;
  let at = new THREE.Vector3();
  for (let i = 0; i <= SAMPLES; i++) {
    const p = curve.getPoint(i / SAMPLES);
    const d = distanceToDesktop(p, heightM);
    if (d < min) {
      min = d;
      at = p;
    }
  }
  return { min, at };
}

describe("cablePath clearance", () => {
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    it(`never enters the desktop (desk t=${t})`, () => {
      const { min, at } = minClearance(deskHeight(t));
      expect(min, `closest sample at ${at.toArray().map((v) => v.toFixed(4)).join(", ")}`).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    });
  }
});
