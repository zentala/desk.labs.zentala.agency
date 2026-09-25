/**
 * DeskScene dimensions in metres (DESIGN.md §8.6, owner feedback W3-T4).
 * `heightM` everywhere means the height of the desk's TOP SURFACE.
 */
export const DESK = {
  width: 1.2,
  depth: 0.6,
  topThickness: 0.035,
  sitHeight: 0.72,
  standHeight: 1.12,
  sitCm: 72,
  standCm: 112,
  /** column centre offsets */
  columnX: 0.44,
  columnZ: -0.02,
  /** telescopic stages, thinnest at the bottom, +14 mm per stage (owner round 2) */
  stage: { bottom: 0.05, mid: 0.064, top: 0.078 },
  bottomStageTop: 0.36,
  midStageBottom: 0.3,
  topStageLength: 0.28,
  foot: [0.08, 0.04, 0.52] as [number, number, number],
  bracket: [0.12, 0.02, 0.5] as [number, number, number],
} as const;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Desk top-surface height for a 0..1 stand progress. */
export function deskHeight(t: number): number {
  return lerp(DESK.sitHeight, DESK.standHeight, t);
}

/** Height in whole centimetres for the on-screen readout. */
export function deskHeightCm(t: number): number {
  return Math.round(lerp(DESK.sitCm, DESK.standCm, t));
}
