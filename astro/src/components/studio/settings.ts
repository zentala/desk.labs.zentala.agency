/**
 * Studio — the one settings object every studio component reads. The Leva
 * panel in `studioControls.ts` produces it; nothing else knows about Leva.
 */
import { LIGHT, CAMERA, BODY } from "../scene/kit";
import { CABLE_RADIUS } from "../scene/desk/sensorGeometry";
import { scenePalette } from "../scene/scenePalette";
import type { GltfKind } from "./figures";

export type FigureKind = "faceted" | "smooth" | "mannequin" | GltfKind;
export type Frameloop = "always" | "demand";

/** Pose edits applied after the animation clip (degrees unless noted); ready-made rigs only. */
export interface RelaxParams {
  shoulderDown: number;
  armIn: number;
  spinePitch: number;
  neckPitch: number;
  kneeStraight: number;
  fingerCurl: number;
  /** 0..1 of `Sitting_Talking_Loop` blended into the seated idle */
  talkBlend: number;
  /** 0..1: IK weight putting the wrists on the keyboard while working (seated or standing) */
  handsOnKeys: number;
}

export interface StudioSettings extends RelaxParams {
  camHeight: number;
  fov: number;
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  shadowOpacity: number;
  /** story progress, 0..1 (`beatAt`) */
  u: number;
  playing: boolean;
  /** 1 = the whole story in `STORY_SECONDS` */
  speed: number;
  loop: boolean;
  figure: FigureKind;
  /** ready-made models: original materials (false) or our neutral figure token + flatShading (true) */
  ourStyle: boolean;
  shoulderWidth: number;
  legThickness: number;
  waist: number;
  sensorColor: string;
  cableRadius: number;
  orbit: boolean;
  parallax: boolean;
  frameloop: Frameloop;
  perf: boolean;
  n8ao: boolean;
  outlines: boolean;
  softShadows: boolean;
}

/** Tuned by eye in the studio on the UAL mannequin; the owner can move them. */
export const RELAX_DEFAULTS: RelaxParams = {
  shoulderDown: 7,
  armIn: 6,
  spinePitch: 5,
  neckPitch: 6,
  kneeStraight: 8,
  fingerCurl: 12,
  talkBlend: 0.2,
  handsOnKeys: 1,
};

export const DEFAULTS: StudioSettings = {
  ...RELAX_DEFAULTS,
  camHeight: CAMERA.position[1],
  fov: 34,
  keyIntensity: LIGHT.keyIntensity,
  fillIntensity: LIGHT.fillIntensity,
  rimIntensity: LIGHT.rimIntensity,
  shadowOpacity: LIGHT.contactOpacity,
  u: 0.05,
  playing: false,
  speed: 1,
  loop: true,
  figure: "faceted",
  ourStyle: true,
  shoulderWidth: BODY.ribcage[0],
  legThickness: BODY.thigh.radius,
  waist: BODY.waist.radius,
  sensorColor: scenePalette.sensor,
  cableRadius: CABLE_RADIUS,
  orbit: true,
  parallax: false,
  frameloop: "always",
  perf: false,
  n8ao: true,
  outlines: false,
  softShadows: false,
};

export const FIGURE_LABELS: Record<FigureKind, string> = {
  faceted: "ours: faceted",
  smooth: "ours: smooth",
  mannequin: "mannequin.js (GPL-3, lab only)",
  ual: "Quaternius UAL mannequin (CC0)",
  ubcMale: "Quaternius UBC male (CC0)",
  ubcFemale: "Quaternius UBC female (CC0)",
  kaykit: "KayKit mannequin (CC0)",
  rocketbox: "Rocketbox Male_Adult_01 (MIT)",
};

/** ready-made models come from files and have animation clips */
export function isGltfFigure(kind: FigureKind): kind is GltfKind {
  return kind === "ual" || kind === "ubcMale" || kind === "ubcFemale" || kind === "kaykit" || kind === "rocketbox";
}
