/**
 * Spike — cable B: a free-hanging catenary between the sensor connector and
 * the monitor port, with the sag as a parameter. The chord is straight in
 * plan; the hang is a normalised cosh profile scaled to `sag`.
 */
import { useMemo } from "react";
import * as THREE from "three";
import type { Vec3 } from "../scene/kit";

const SAMPLES = 32;
/** how "pointy" the hang is: cosh(k·u) over u ∈ [-1, 1] */
const K = 1.6;
const RADIUS = 0.0028;

/** 0 at the ends, 1 in the middle, catenary-shaped. */
function hang(u: number): number {
  const c = Math.cosh(K);
  return (c - Math.cosh(K * (2 * u - 1))) / (c - 1);
}

export function catenaryPoints(from: Vec3, to: Vec3, sag: number): THREE.Vector3[] {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    const p = a.clone().lerp(b, u);
    p.y -= sag * hang(u);
    points.push(p);
  }
  return points;
}

export function CatenaryCable({ from, to, sag, color }: { from: Vec3; to: Vec3; sag: number; color: string }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(catenaryPoints(from, to, sag));
    return new THREE.TubeGeometry(curve, 48, RADIUS, 8, false);
  }, [from, to, sag]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshLambertMaterial color={color} />
    </mesh>
  );
}
