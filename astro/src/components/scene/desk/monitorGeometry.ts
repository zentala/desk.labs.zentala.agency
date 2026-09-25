/** Monitor geometry without React or three.js (pure, unit-testable): size, body height, USB-C port. */
import type { Vec3 } from "../kit";

/** Physical size: 34" 21:9 panel ≈ 78 × 32.5 cm; body slightly larger. */
export const MONITOR = {
  screen: [0.78, 0.325] as [number, number],
  body: [0.82, 0.365, 0.03] as Vec3,
  neck: [0.06, 0.15, 0.025] as Vec3,
  base: [0.28, 0.012, 0.17] as Vec3,
  /** neck position on the desk (z from desk centre) */
  z: -0.17,
  /** body group z offset from the neck */
  bodyZ: 0.02,
} as const;

/** Body centre height above the desk top. */
export function bodyY(heightM: number): number {
  return heightM + MONITOR.base[1] + MONITOR.neck[1] + MONITOR.body[1] / 2 - 0.04;
}

/** World position of the USB-C port on the right side of the body. */
export function monitorPort(heightM: number): Vec3 {
  return [MONITOR.body[0] / 2, bodyY(heightM) - 0.06, MONITOR.z + MONITOR.bodyZ];
}
