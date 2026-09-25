/**
 * Studio — the ready-made figure candidates (licences: public/models/studio/LICENSES.md).
 * Bone names are as three.js's GLTFLoader exposes them: spaces become `_`
 * and dots are dropped (`upperarm.l` → `upperarml`).
 */
import type { FigureAction } from "../scene/kit/timeline";

export type GltfKind = "ual" | "ubcMale" | "ubcFemale" | "kaykit" | "rocketbox";

/** Left/right pairs are [left, right]. */
export interface RigNames {
  hips: string;
  /** lowest first; each is swung toward the screen by `spinePitch` */
  spine: string[];
  neck: string;
  clavicle?: [string, string];
  upperArm: [string, string];
  foreArm: [string, string];
  hand: [string, string];
  thigh: [string, string];
  calf: [string, string];
  /** finger bones curled by `fingerCurl` */
  finger?: RegExp;
}

/** Clip names for the timeline's actions. Missing enter/exit = cross-fade sit ↔ stand by weight. */
export interface ClipNames {
  sit: string;
  /** blended into `sit` by the `talkBlend` slider */
  sitTalk?: string;
  exit?: string;
  enter?: string;
  stand: string;
  walk?: string;
}

export interface GltfSpec {
  url: string;
  /** clips live in another file with the same joint names (UBC bodies use the UAL clips) */
  clipsUrl?: string;
  label: string;
  licence: string;
  /** rotation about Y that makes the model face the desk (-Z) */
  faceDesk: number;
  /** overall height for stylised rigs; omitted = scale the hips to our standing hip height */
  height?: number;
  rig: RigNames;
  clips: ClipNames;
}

const UE_RIG: RigNames = {
  hips: "pelvis",
  spine: ["spine_01", "spine_02", "spine_03"],
  neck: "neck_01",
  clavicle: ["clavicle_l", "clavicle_r"],
  upperArm: ["upperarm_l", "upperarm_r"],
  foreArm: ["lowerarm_l", "lowerarm_r"],
  hand: ["hand_l", "hand_r"],
  thigh: ["thigh_l", "thigh_r"],
  calf: ["calf_l", "calf_r"],
  finger: /^(index|middle|ring|pinky)_0[123]_[lr]$/,
};

const UAL_CLIPS: ClipNames = {
  sit: "Sitting_Idle_Loop",
  sitTalk: "Sitting_Talking_Loop",
  exit: "Sitting_Exit",
  enter: "Sitting_Enter",
  stand: "Idle_Loop",
  walk: "Walk_Loop",
};

const UAL_URL = "/models/studio/ual-mannequin.glb";

export const GLTF_FIGURES: Record<GltfKind, GltfSpec> = {
  ual: { url: UAL_URL, label: "Quaternius UAL mannequin (CC0)", licence: "CC0", faceDesk: Math.PI, rig: UE_RIG, clips: UAL_CLIPS },
  ubcMale: {
    url: "/models/studio/ubc-male.glb",
    clipsUrl: UAL_URL,
    label: "Quaternius UBC male (CC0)",
    licence: "CC0",
    faceDesk: Math.PI,
    rig: UE_RIG,
    clips: UAL_CLIPS,
  },
  ubcFemale: {
    url: "/models/studio/ubc-female.glb",
    clipsUrl: UAL_URL,
    label: "Quaternius UBC female (CC0)",
    licence: "CC0",
    faceDesk: Math.PI,
    rig: UE_RIG,
    clips: UAL_CLIPS,
  },
  kaykit: {
    url: "/models/studio/kaykit-mannequin.glb",
    label: "KayKit mannequin (CC0)",
    licence: "CC0",
    faceDesk: Math.PI,
    height: 1.6,
    rig: {
      hips: "hips",
      spine: ["spine", "chest"],
      neck: "head",
      upperArm: ["upperarml", "upperarmr"],
      foreArm: ["lowerarml", "lowerarmr"],
      hand: ["wristl", "wristr"],
      thigh: ["upperlegl", "upperlegr"],
      calf: ["lowerlegl", "lowerlegr"],
    },
    clips: { sit: "Sit_Chair_Idle", exit: "Sit_Chair_StandUp", enter: "Sit_Chair_Down", stand: "Idle_A", walk: "Walking_A" },
  },
  rocketbox: {
    url: "/models/studio/rocketbox-male-adult-01.glb",
    label: "Microsoft Rocketbox Male_Adult_01 (MIT)",
    licence: "MIT",
    faceDesk: Math.PI,
    rig: {
      hips: "Bip01_Pelvis",
      spine: ["Bip01_Spine", "Bip01_Spine1", "Bip01_Spine2"],
      neck: "Bip01_Neck",
      clavicle: ["Bip01_L_Clavicle", "Bip01_R_Clavicle"],
      upperArm: ["Bip01_L_UpperArm", "Bip01_R_UpperArm"],
      foreArm: ["Bip01_L_Forearm", "Bip01_R_Forearm"],
      hand: ["Bip01_L_Hand", "Bip01_R_Hand"],
      thigh: ["Bip01_L_Thigh", "Bip01_R_Thigh"],
      calf: ["Bip01_L_Calf", "Bip01_R_Calf"],
      finger: /^Bip01_[LR]_Finger\d+$/,
    },
    clips: { sit: "Sit_Chair_Breathe", stand: "Idle_Neutral" },
  },
};

/** A clip and its time (s), plus an optional second clip blended in by weight. */
export interface ClipPick {
  name: string;
  time: number;
  weight: number;
}

/** story seconds per unit of `u` for looping clips: the whole storyboard plays in this long */
export const STORY_SECONDS = 40;

function loopTime(u: number, duration: number): number {
  return duration > 0 ? (u * STORY_SECONDS) % duration : 0;
}

/**
 * Which clips pose the figure at a timeline moment. Pure: the same `u` gives
 * the same clips and times, so scrubbing is deterministic.
 */
export function pickClips(
  clips: ClipNames,
  durations: Record<string, number>,
  action: FigureAction,
  actionT: number,
  u: number,
  talkBlend: number,
): ClipPick[] {
  const dur = (name: string) => durations[name] ?? 0;
  const loop = (name: string, weight = 1): ClipPick => ({ name, time: loopTime(u, dur(name)), weight });
  const once = (name: string, k: number): ClipPick => ({ name, time: Math.min(k, 0.999) * dur(name), weight: 1 });
  const sitting = (): ClipPick[] =>
    clips.sitTalk && talkBlend > 0 ? [loop(clips.sit, 1 - talkBlend), loop(clips.sitTalk, talkBlend)] : [loop(clips.sit)];
  switch (action) {
    case "sit":
      return sitting();
    case "stand":
      return [loop(clips.stand)];
    case "rise":
    case "leave":
      return clips.exit ? [once(clips.exit, actionT)] : [loop(clips.sit, 1 - actionT), loop(clips.stand, actionT)];
    case "lower":
      return clips.enter ? [once(clips.enter, actionT)] : [loop(clips.stand, 1 - actionT), loop(clips.sit, actionT)];
    case "walk":
      return [loop(clips.walk ?? clips.stand)];
  }
}
