/**
 * Spike — the one settings object every spike component reads. The Leva panel
 * in `SpikeLab.tsx` produces it; nothing else knows about Leva.
 */
import { LIGHT, CAMERA, BODY } from "../scene/kit";

export type FigureKind = "faceted" | "smooth" | "mannequin" | "robot" | "kenney" | "quaternius";
export type FigureAction = "sit" | "stand" | "walk";
export type CableMode = "catmull" | "catenary" | "rope";
export type Frameloop = "always" | "demand";

export interface SpikeSettings {
  camHeight: number;
  fov: number;
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  shadowOpacity: number;
  /** 0 = sitting height, 1 = standing height */
  deskT: number;
  figure: FigureKind;
  /** ready-made models: original materials (false) or our neutral figure token + flatShading (true) */
  ourStyle: boolean;
  action: FigureAction;
  shoulderWidth: number;
  legThickness: number;
  waist: number;
  sensorColor: string;
  cable: CableMode;
  cableSag: number;
  orbit: boolean;
  parallax: boolean;
  frameloop: Frameloop;
  perf: boolean;
  n8ao: boolean;
  outlines: boolean;
  softShadows: boolean;
}

export const DEFAULTS: SpikeSettings = {
  camHeight: CAMERA.position[1],
  fov: 34,
  keyIntensity: LIGHT.keyIntensity,
  fillIntensity: LIGHT.fillIntensity,
  rimIntensity: LIGHT.rimIntensity,
  shadowOpacity: LIGHT.contactOpacity,
  deskT: 0,
  figure: "faceted",
  ourStyle: true,
  action: "sit",
  shoulderWidth: BODY.ribcage[0],
  legThickness: BODY.thigh.radius,
  waist: BODY.waist.radius,
  sensorColor: "#0F6B3A",
  cable: "catmull",
  cableSag: 0.12,
  orbit: true,
  parallax: false,
  frameloop: "always",
  perf: false,
  n8ao: false,
  outlines: false,
  softShadows: false,
};

export const FIGURE_LABELS: Record<FigureKind, string> = {
  faceted: "ours: faceted",
  smooth: "ours: smooth",
  mannequin: "mannequin.js (GPL-3)",
  robot: "RobotExpressive (CC0)",
  kenney: "Kenney mini (CC0)",
  quaternius: "Quaternius UAL (CC0)",
};

/** ready-made models come from files and have animation clips */
export function isGltfFigure(kind: FigureKind): kind is "robot" | "kenney" | "quaternius" {
  return kind === "robot" || kind === "kenney" || kind === "quaternius";
}
