/**
 * Sensor geometry without React or three.js: the enclosure's place under the
 * desktop and the cable's waypoints to the monitor port. Pure, so the cable's
 * clearance is unit-tested (`cablePath.test.ts`).
 */
import type { Vec3 } from "../kit";
import { DESK } from "./dims";

export const BOX: Vec3 = [0.06, 0.028, 0.045];
/** 1.5 cm inboard of the right edge, 10 cm in from the back edge; clears the foot (x ≤ 0.48). */
export const SENSOR_X = DESK.width / 2 - BOX[0] / 2 - 0.015;
export const SENSOR_Z = -DESK.depth / 2 + 0.1;

/** Centre of the sensor box for a desk height. */
export function sensorCenter(heightM: number): Vec3 {
  return [SENSOR_X, heightM - DESK.topThickness - BOX[1] / 2, SENSOR_Z];
}

/** Cable tube radius (m); the studio can override it, the site uses this. */
export const CABLE_RADIUS = 0.0028;
/** centre line to any desktop face: radius + 3 mm and a little for the spline's sag */
const CABLE_GAP = CABLE_RADIUS + 0.0045;
/** the on-top run sits a hair higher: the spline sags ~1 mm between its waypoints */
const ON_TOP_GAP = CABLE_GAP + 0.0015;

/**
 * Waypoints from the sensor's back connector to the monitor port: under the
 * top to the back edge, around it OUTSIDE the 35 mm top (behind the edge,
 * then over the corner), along the back edge on the desktop to the monitor's
 * right side, a bend waypoint so the spline does not dip into the top before
 * it climbs, then straight up that side into the port. The Catmull-Rom curve
 * through these points never enters the desktop box (vitest: cablePath.test.ts).
 */
export function cablePath(heightM: number, port: Vec3): Vec3[] {
  const underside = heightM - DESK.topThickness;
  const back = -DESK.depth / 2;
  const onTop = heightM + ON_TOP_GAP;
  const sideX = port[0] + 0.006;
  const behind = back - CABLE_GAP;
  return [
    [SENSOR_X - 0.01, underside - 0.014, SENSOR_Z - BOX[2] / 2 - 0.012],
    [SENSOR_X - 0.03, underside - 0.012, back + 0.03],
    [SENSOR_X - 0.045, underside - CABLE_GAP, back - 0.004],
    [SENSOR_X - 0.055, underside + 0.01, behind],
    [SENSOR_X - 0.065, heightM - 0.006, behind],
    [SENSOR_X - 0.08, onTop, back - 0.002],
    [SENSOR_X - 0.1, onTop, back + 0.025],
    [sideX + 0.03, onTop, back + 0.03],
    [sideX + 0.004, onTop, port[2] - 0.075],
    [sideX, onTop + 0.02, port[2] - 0.04],
    [sideX, port[1] - 0.06, port[2] - 0.01],
    [sideX, port[1] - 0.015, port[2]],
    [port[0] + 0.024, port[1], port[2]],
  ];
}
