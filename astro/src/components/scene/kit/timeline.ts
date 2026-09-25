/**
 * Scene kit — the storyboard as one pure function (DESK-SCENE-SPEC.md §11, R-37).
 *
 * `beatAt(u)` maps the story progress `u ∈ [0, 1]` to everything the scene
 * shows at that moment: desk height, the person's pose and action, the chair,
 * the monitor state and toast, the phone-style timer and the story clock.
 * The homepage scroll and the studio player both call it, so there is one
 * source of truth for the story. No React, no three.js: it is unit-tested.
 */
import type { DeskState } from "../scenePalette";

export type ScreenToast = "none" | "calendar" | "nudge" | "done" | "away";

/** What the figure is doing; ready-made rigs map each action to an animation clip. */
export type FigureAction = "sit" | "rise" | "stand" | "lower" | "leave" | "walk";

export interface Beat {
  /** 1-based, as in the spec table */
  index: number;
  name: string;
  u0: number;
  u1: number;
}

export interface SceneFrame {
  u: number;
  beat: Beat;
  /** 0..1 progress inside the beat */
  local: number;
  /** 0 = desk at sitting height, 1 = standing height */
  deskT: number;
  /** raw `standUp` progress for the procedural figure */
  poseT: number;
  /** 0 = chair at the desk, 1 = pushed back */
  chairT: number;
  state: DeskState;
  toast: ScreenToast;
  action: FigureAction;
  /** 0..1 progress of a transitional action (rise, lower, leave, walk); 0 when settled */
  actionT: number;
  /** story minutes since 14:32 */
  storyMin: number;
  /** "14:40" */
  clock: string;
  /** "Sitting · 32:10" — the phone timer */
  timer: string;
}

/** Spec §11 table, `u` ranges verbatim. */
export const BEATS: readonly Beat[] = [
  { index: 1, name: "work seated", u0: 0, u1: 0.1 },
  { index: 2, name: "nudge", u0: 0.1, u1: 0.2 },
  { index: 3, name: "press up", u0: 0.2, u1: 0.3 },
  { index: 4, name: "rise", u0: 0.3, u1: 0.45 },
  { index: 5, name: "work standing", u0: 0.45, u1: 0.65 },
  { index: 6, name: "done", u0: 0.65, u1: 0.72 },
  { index: 7, name: "lower", u0: 0.72, u1: 0.82 },
  { index: 8, name: "sit again", u0: 0.82, u1: 0.9 },
  { index: 9, name: "away", u0: 0.9, u1: 1 },
];

/** in the away beat, the first part of the beat is getting up; the rest is walking out */
const LEAVE_SHARE = 0.35;
const STORY_START_MIN = 14 * 60 + 32;
const SIT_TIMER_START_MIN = 32;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function ease(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mmss(minutes: number): string {
  const total = Math.max(0, Math.round(minutes * 60));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function hhmm(storyMin: number): string {
  const t = Math.floor(STORY_START_MIN + storyMin);
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** The beat containing `u`; `u = 1` belongs to the last beat. */
export function beatIndexAt(u: number): number {
  const c = clamp01(u);
  const i = BEATS.findIndex((b) => c < b.u1);
  return i === -1 ? BEATS.length - 1 : i;
}

/** Story clock in minutes since 14:32, per beat (spec §11 "Clock" column). */
function storyMinutes(index: number, local: number): number {
  switch (index) {
    case 1: return lerp(0, 8, local);
    case 2: case 3: return 8;
    case 4: return 9;
    case 5: return lerp(9, 29, local);
    case 6: return 29;
    case 7: case 8: return 30;
    default: return 33;
  }
}

type Motion = Pick<SceneFrame, "deskT" | "poseT" | "action" | "actionT" | "state">;

function motion(index: number, local: number): Motion {
  switch (index) {
    case 1: case 2: return { deskT: 0, poseT: 0, action: "sit", actionT: 0, state: "sitting" };
    // the paddle is pressed half-way through: the phone says Rising before the desk moves
    case 3: return { deskT: 0, poseT: 0, action: "sit", actionT: 0, state: local < 0.5 ? "sitting" : "rising" };
    case 4: return { deskT: ease(local), poseT: local, action: "rise", actionT: local, state: "rising" };
    case 5: case 6: return { deskT: 1, poseT: 1, action: "stand", actionT: 0, state: "standing" };
    case 7: return { deskT: 1 - ease(local), poseT: 1 - local, action: "lower", actionT: local, state: "lowering" };
    case 8: return { deskT: 0, poseT: 0, action: "sit", actionT: 0, state: "sitting" };
    default: {
      if (local < LEAVE_SHARE) {
        const k = local / LEAVE_SHARE;
        return { deskT: 0, poseT: k, action: "leave", actionT: k, state: "sitting" };
      }
      return { deskT: 0, poseT: 1, action: "walk", actionT: (local - LEAVE_SHARE) / (1 - LEAVE_SHARE), state: "away" };
    }
  }
}

function toastFor(index: number, local: number, action: FigureAction): ScreenToast {
  if (index === 1 || index === 5) return local > 0.3 && local < 0.6 ? "calendar" : "none";
  if (index === 2) return "nudge";
  if (index === 6) return "done";
  if (index === 9) return action === "walk" ? "away" : "none";
  return "none";
}

function timerFor(index: number, storyMin: number, state: DeskState): string {
  if (index <= 2) return `Sitting · ${mmss(Math.min(40, SIT_TIMER_START_MIN + storyMin))}`;
  if (state === "rising") return "Rising";
  if (state === "lowering") return "Lowering";
  if (index === 5) return `Standing · ${mmss(storyMin - 9)}`;
  if (index === 6) return "Standing · 20:00";
  if (state === "away") return "Away";
  if (index === 3) return "Sitting · 40:00";
  return "Sitting · 00:00";
}

/** Everything the scene shows at story progress `u`. Pure and deterministic. */
export function beatAt(u: number): SceneFrame {
  const c = clamp01(u);
  const beat = BEATS[beatIndexAt(c)];
  const local = clamp01((c - beat.u0) / (beat.u1 - beat.u0));
  const m = motion(beat.index, local);
  const storyMin = storyMinutes(beat.index, local);
  return {
    u: c,
    beat,
    local,
    ...m,
    chairT: ease(m.poseT),
    toast: toastFor(beat.index, local, m.action),
    storyMin,
    clock: hhmm(storyMin),
    timer: timerFor(beat.index, storyMin, m.state),
  };
}

/** The away beat: the person walks from the desk to here (m, x/z), turning toward +X. */
const WALK_OUT = { x: 1.9, z: 0.7 } as const;

/** Walk-out offset (m) and yaw for a frame; zero outside the away beat's walk. */
export function walkOffset(frame: SceneFrame): { position: [number, number, number]; yaw: number } {
  if (frame.action !== "walk") return { position: [0, 0, 0], yaw: 0 };
  const k = frame.actionT;
  return { position: [WALK_OUT.x * k, 0, WALK_OUT.z * k], yaw: (-Math.PI / 2) * Math.min(1, k * 4) };
}

/** The middle of each beat: the posed frames used under reduced motion and by screenshot scripts. */
export function beatMidpoints(): number[] {
  return BEATS.map((b) => (b.u0 + b.u1) / 2);
}
