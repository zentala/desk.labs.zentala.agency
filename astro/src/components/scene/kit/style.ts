/**
 * Scene kit — style constants (DESIGN.md §8).
 *
 * Kit rules, in one place:
 * 1. Every solid is a bevelled box (`Block`) or a low-segment cylinder (`Rod`)
 *    with a radius from `BEVEL`; never a per-mesh radius.
 * 2. One matte finish (`MeshLambertMaterial`, flat shading). Form is modelled
 *    by light, not by bevels: key + fill + sky give every face its own tone.
 *    The beam is the only glow.
 * 3. One light rig (`LIGHT`), one lens (`CAMERA`), one stage slab (`STAGE`).
 * 4. Colours come from `scenePalette.ts` via `useScenePalette()`; no hex here.
 * 5. Metric units everywhere; real proportions, fewer parts, never bigger parts.
 */
import { useEffect, useState } from "react";
import { resolvePalette, type ScenePalette } from "../scenePalette";

/** Bevel radii in metres (§8.1): just enough to catch a highlight line, never enough to soften form. */
export const BEVEL = {
  /** desk top, monitor body, chair seat, slab */
  furniture: 0.004,
  /** keyboard, sensor, paddle, buttons, small props */
  small: 0.0015,
  /** person limbs and torso */
  body: 0.01,
} as const;

/** Segments for bevels and cylinders — enough to catch light, few enough to stay faceted. */
export const SEGMENTS = {
  bevel: 3,
  rod: 12,
  head: 2,
} as const;

/** Ghost silhouette opacity (§8.5). */
export const GHOST_OPACITY = 0.55;

/**
 * Light rig (§8.3). Key from upper-left-front lights tops and front (+Z)
 * faces; a cooler fill from the right-back lights the +X faces the camera
 * sees; the sky is low so the three faces of every box read as three tones.
 */
export const LIGHT = {
  skyColor: "#FFF4E2",
  keyColor: "#FFEFD8",
  fillColor: "#DDE6F2",
  hemisphereIntensity: 0.85,
  keyIntensity: 1.8,
  keyPosition: [-2.5, 4.5, 3] as [number, number, number],
  fillIntensity: 0.7,
  fillPosition: [4, 2.5, -1.5] as [number, number, number],
  shadowMapSize: 2048,
  shadowBias: -0.0005,
  contactOpacity: 0.4,
  contactBlur: 2.4,
  contactFar: 1.8,
  contactResolution: 512,
  exposure: 1.0,
} as const;

/** Lens and viewpoint (§8.4). */
export const CAMERA = {
  /** the box (m) at the target that must fit in every aspect ratio; fov is derived from it */
  frame: { width: 2.2, height: 2.15 },
  position: [2.75, 1.35, 2.05] as [number, number, number],
  target: [0.05, 0.82, 0.15] as [number, number, number],
  /** the target rises by this much (m) at `lift` = 1, e.g. as the person stands up */
  maxLift: 0.12,
  parallaxDeg: 4,
} as const;

/** Stage slab (§8.4). */
export const STAGE = {
  width: 3.2,
  depth: 2.6,
  thickness: 0.03,
  /** the slab's far edge is in frame (an island); its near edge spills out of the frame */
  centerZ: 0.45,
  rug: { width: 1.9, depth: 1.4, thickness: 0.006 },
} as const;

/** Motion (§8.7, DESIGN.md §0 motion.duration.scene, easing.enter). */
export const MOTION = {
  sceneMs: 600,
  beamBreatheS: 2,
} as const;

/** cubic-bezier(0.2, 0.8, 0.2, 1) approximated for JS tweens (DESIGN.md easing.enter). */
export function easeEnter(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Palette for the current OS colour scheme; re-resolves when the scheme flips. */
export function useScenePalette(): ScenePalette {
  const [dark, setDark] = useState(prefersDark);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return resolvePalette(dark);
}
