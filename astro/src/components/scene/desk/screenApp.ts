/**
 * What the all-in-one monitor shows: the Open Smart Desk app, designed for
 * its real on-page size (the screen is ~330 CSS px wide at 1280 px). Three
 * things only: the height readout, the state chip and one toast in its own
 * column in the settled states (the app mark was ~8 px at hero size: dropped). Drawn in a 1000 × 417 design space; the
 * canvas resolution comes from the projected pixels (`kit/screen.ts`).
 *
 * The screen is always the light app (`material.screen` is white in both
 * modes, DESIGN.md §0); it is dimmed 6 % so it sits with the paper scene.
 */
import { scenePalette as p, stateFill, stateText, stateTint, type DeskState } from "../scenePalette";
import { roundRect, wrapText, SCREEN_FONT } from "../kit";
import type { ScreenToast } from "../kit/timeline";

/** What the story timeline adds to the screen (`beatAt`): the toast, the phone-style timer label and the clock. */
export interface ScreenStory {
  toast: ScreenToast;
  timer: string;
  clock: string;
}

interface ToastCard {
  title: string;
  body: string;
  accent: "brand" | "standing" | "muted" | "away";
}

const STORY_TOAST: Record<Exclude<ScreenToast, "none">, ToastCard> = {
  calendar: { title: "Calendar", body: "1 event at 15:00.", accent: "muted" },
  nudge: { title: "Time to stand up", body: "40 min sitting. Up for a minute?", accent: "brand" },
  done: { title: "20 min standing done", body: "Nice work. +1 credit.", accent: "standing" },
  away: { title: "Away", body: "Timer paused.", accent: "away" },
};

export const SCREEN_DESIGN = { w: 1000, h: 417 } as const;

/** Without a story (the button scene), each settled state has one toast. */
const STATE_TOAST: Partial<Record<DeskState, ToastCard>> = {
  sitting: STORY_TOAST.nudge,
  standing: { title: "Nice one.", body: "Credit is ticking.", accent: "standing" },
};

const LABEL: Record<DeskState, string> = {
  sitting: "Sitting",
  rising: "Rising",
  lowering: "Lowering",
  standing: "Standing",
  away: "Away",
};

/** State chip: icon + label, never colour alone (DESIGN.md §3). */
function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number, state: DeskState, label = LABEL[state]) {
  const h = 76;
  ctx.font = `600 42px ${SCREEN_FONT.body}`;
  const w = ctx.measureText(label).width + 118;
  ctx.fillStyle = stateTint(p, state);
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  const cx = x + 40;
  const cy = y + h / 2;
  ctx.fillStyle = stateFill(p, state);
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = p.surface;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (state === "sitting") {
    ctx.moveTo(cx - 11, cy);
    ctx.lineTo(cx + 11, cy);
  } else if (state === "standing") {
    ctx.moveTo(cx, cy + 11);
    ctx.lineTo(cx, cy - 11);
    ctx.moveTo(cx - 9, cy - 2);
    ctx.lineTo(cx, cy - 11);
    ctx.lineTo(cx + 9, cy - 2);
  } else if (state === "away") {
    // pause: two bars
    ctx.moveTo(cx - 5, cy - 10);
    ctx.lineTo(cx - 5, cy + 10);
    ctx.moveTo(cx + 5, cy - 10);
    ctx.lineTo(cx + 5, cy + 10);
  } else {
    const d = state === "rising" ? -1 : 1;
    ctx.moveTo(cx - 10, cy - 6 * d);
    ctx.lineTo(cx, cy + 2 * d);
    ctx.lineTo(cx + 10, cy - 6 * d);
    ctx.moveTo(cx - 10, cy + 4 * d);
    ctx.lineTo(cx, cy + 12 * d);
    ctx.lineTo(cx + 10, cy + 4 * d);
  }
  ctx.stroke();
  ctx.fillStyle = stateText(p, state);
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 76, cy + 1);
  ctx.textBaseline = "alphabetic";
}

function drawReadout(ctx: CanvasRenderingContext2D, state: DeskState, heightCm: number, chipLabel?: string) {
  const x = 44;
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 30px ${SCREEN_FONT.body}`;
  ctx.fillText("DESK HEIGHT", x + 4, 74);
  ctx.fillStyle = p.ink;
  ctx.font = `700 250px ${SCREEN_FONT.display}`;
  ctx.fillText(`${heightCm}`, x - 8, 300);
  const numW = ctx.measureText(`${heightCm}`).width;
  ctx.fillStyle = p.inkMuted;
  ctx.font = `600 76px ${SCREEN_FONT.display}`;
  ctx.fillText("cm", x + numW + 10, 300);
  drawChip(ctx, x + 4, 326, state, chipLabel);
}

function accentColor(accent: ToastCard["accent"]): string {
  if (accent === "brand") return p.brand;
  if (accent === "standing") return p.standing;
  if (accent === "away") return p.away;
  return p.inkMuted;
}

function drawToast(ctx: CanvasRenderingContext2D, w: number, toast: ToastCard | undefined) {
  if (!toast) return;
  // its own column on the right, clear of the readout and the unit
  const cardW = 380;
  const cardH = 150;
  const x = w - cardW - 36;
  const y = 40;
  ctx.save();
  ctx.shadowColor = "rgba(31,36,48,0.22)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = p.surface;
  roundRect(ctx, x, y, cardW, cardH, 26);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = accentColor(toast.accent);
  roundRect(ctx, x + 22, y + 30, 8, cardH - 60, 4);
  ctx.fill();
  ctx.fillStyle = toast.accent === "standing" ? stateText(p, "standing") : p.ink;
  ctx.font = `600 44px ${SCREEN_FONT.display}`;
  ctx.fillText(toast.title, x + 54, y + 66);
  ctx.fillStyle = p.inkMuted;
  ctx.font = `400 34px ${SCREEN_FONT.body}`;
  wrapText(ctx, toast.body, x + 54, y + 114, cardW - 80, 40);
}

function drawClock(ctx: CanvasRenderingContext2D, w: number, h: number, clock: string) {
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 30px ${SCREEN_FONT.body}`;
  ctx.textAlign = "right";
  ctx.fillText(clock, w - 40, h - 34);
  ctx.textAlign = "left";
}

/** Paint the whole app for a state and desk height; `story` adds the timeline's toast, timer and clock. */
export function drawScreen(ctx: CanvasRenderingContext2D, w: number, h: number, state: DeskState, heightCm: number, story?: ScreenStory) {
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(31,36,48,0.06)";
  ctx.fillRect(0, 0, w, h);
  drawReadout(ctx, state, heightCm, story?.timer);
  drawToast(ctx, w, story ? (story.toast === "none" ? undefined : STORY_TOAST[story.toast]) : STATE_TOAST[state]);
  if (story) drawClock(ctx, w, h, story.clock);
}
