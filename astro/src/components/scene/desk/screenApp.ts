/**
 * What the all-in-one monitor shows: the Open Smart Desk app. The height
 * readout dominates (W3-T5), a state chip names sitting / rising / lowering /
 * standing, a slim timeline sits at the bottom, and the nudge / confirmation
 * toast appears only in the settled states (copy per E010 §5). Drawn in
 * logical pixels; `useCanvasTexture` handles the 2× texel density.
 *
 * The screen is always the light theme: `material.screen` is white in both
 * modes (DESIGN.md §0), so the app on it uses the light palette.
 */
import { scenePalette as p, stateFill, stateText, stateTint, type DeskState } from "../scenePalette";
import { roundRect, wrapText, SCREEN_FONT } from "../kit";

export const SCREEN_PX = { w: 1170, h: 488 } as const;

const TOAST: Partial<Record<DeskState, { title: string; body: string }>> = {
  sitting: { title: "Time to stand up", body: "40 min sitting. Up for a minute?" },
  standing: { title: "Nice one.", body: "Credit is ticking. Sit whenever you're ready." },
};

const LABEL: Record<DeskState, string> = {
  sitting: "Sitting",
  rising: "Rising",
  lowering: "Lowering",
  standing: "Standing",
};

function drawTopBar(ctx: CanvasRenderingContext2D, w: number) {
  ctx.fillStyle = p.surface;
  ctx.fillRect(0, 0, w, 52);
  ctx.fillStyle = p.line;
  ctx.fillRect(0, 52, w, 2);
  ctx.fillStyle = p.brand;
  ctx.beginPath();
  ctx.arc(34, 26, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.ink;
  ctx.font = `600 20px ${SCREEN_FONT.display}`;
  ctx.textBaseline = "middle";
  ctx.fillText("Open Smart Desk", 54, 27);
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 17px ${SCREEN_FONT.mono}`;
  ctx.textAlign = "right";
  ctx.fillText("14:32", w - 30, 27);
  ctx.textAlign = "left";
}

/** State chip: icon + label, never colour alone (DESIGN.md §3). */
function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number, state: DeskState) {
  const label = LABEL[state];
  ctx.font = `600 26px ${SCREEN_FONT.body}`;
  const chipW = ctx.measureText(label).width + 72;
  ctx.fillStyle = stateTint(p, state);
  roundRect(ctx, x, y, chipW, 48, 24);
  ctx.fill();
  ctx.fillStyle = stateFill(p, state);
  ctx.beginPath();
  ctx.arc(x + 26, y + 24, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = p.surface;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  const cx = x + 26;
  const cy = y + 24;
  if (state === "sitting") {
    ctx.moveTo(cx - 7, cy);
    ctx.lineTo(cx + 7, cy);
  } else if (state === "standing") {
    ctx.moveTo(cx, cy + 7);
    ctx.lineTo(cx, cy - 7);
    ctx.moveTo(cx - 6, cy - 1);
    ctx.lineTo(cx, cy - 7);
    ctx.lineTo(cx + 6, cy - 1);
  } else {
    // moving: two chevrons, up or down
    const d = state === "rising" ? -1 : 1;
    ctx.moveTo(cx - 6, cy - 4 * d);
    ctx.lineTo(cx, cy + 1 * d);
    ctx.lineTo(cx + 6, cy - 4 * d);
    ctx.moveTo(cx - 6, cy + 2 * d);
    ctx.lineTo(cx, cy + 7 * d);
    ctx.lineTo(cx + 6, cy + 2 * d);
  }
  ctx.stroke();
  ctx.fillStyle = stateText(p, state);
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 48, y + 25);
  ctx.textBaseline = "alphabetic";
}

function drawReadout(ctx: CanvasRenderingContext2D, state: DeskState, heightCm: number) {
  const x = 48;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 18px ${SCREEN_FONT.body}`;
  ctx.fillText("DESK HEIGHT", x, 96);
  // the big number: the one thing you can read from across the room
  ctx.fillStyle = p.ink;
  ctx.font = `700 236px ${SCREEN_FONT.display}`;
  ctx.fillText(`${heightCm}`, x - 8, 318);
  const numW = ctx.measureText(`${heightCm}`).width;
  ctx.fillStyle = p.inkMuted;
  ctx.font = `600 64px ${SCREEN_FONT.display}`;
  ctx.fillText("cm", x + numW + 14, 318);
  drawChip(ctx, x, 340, state);
}

function drawTimeline(ctx: CanvasRenderingContext2D, w: number, h: number, state: DeskState) {
  const x = 48;
  const y = h - 40;
  const tw = w - 96;
  const th = 14;
  const live = state === "sitting" || state === "lowering" ? p.sitting : p.standing;
  const segs: Array<[number, string]> = [
    [0.22, p.sitting],
    [0.08, p.standing],
    [0.2, p.sitting],
    [0.06, p.away],
    [0.18, p.sitting],
    [0.08, p.standing],
    [0.1, live],
  ];
  ctx.fillStyle = p.rug;
  roundRect(ctx, x, y, tw, th, 7);
  ctx.fill();
  let cx = x;
  ctx.save();
  roundRect(ctx, x, y, tw, th, 7);
  ctx.clip();
  for (const [frac, color] of segs) {
    ctx.fillStyle = color;
    ctx.fillRect(cx, y, tw * frac + 1, th);
    cx += tw * frac;
  }
  ctx.restore();
  ctx.fillStyle = p.brand;
  for (const f of [0.22, 0.5, 0.82]) {
    ctx.beginPath();
    ctx.moveTo(x + tw * f - 5, y - 5);
    ctx.lineTo(x + tw * f + 5, y - 5);
    ctx.lineTo(x + tw * f, y + 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 16px ${SCREEN_FONT.body}`;
  ctx.fillText("TODAY  ·  3 h 40 sitting  ·  1 h 10 standing  ·  5 changes", x, y - 16);
}

function drawToast(ctx: CanvasRenderingContext2D, w: number, state: DeskState) {
  const toast = TOAST[state];
  if (!toast) return;
  const cardW = 420;
  const cardH = 116;
  const x = w - cardW - 48;
  const y = 88;
  ctx.save();
  ctx.shadowColor = "rgba(31,36,48,0.25)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = p.surface;
  roundRect(ctx, x, y, cardW, cardH, 20);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = state === "sitting" ? p.brand : p.standing;
  roundRect(ctx, x + 16, y + 22, 6, cardH - 44, 3);
  ctx.fill();
  ctx.fillStyle = state === "sitting" ? p.ink : stateText(p, state);
  ctx.font = `600 26px ${SCREEN_FONT.display}`;
  ctx.fillText(toast.title, x + 42, y + 48);
  ctx.fillStyle = p.inkMuted;
  ctx.font = `400 19px ${SCREEN_FONT.body}`;
  wrapText(ctx, toast.body, x + 42, y + 80, cardW - 66, 25);
}

/** Paint the whole app for a state and desk height. */
export function drawScreen(ctx: CanvasRenderingContext2D, w: number, h: number, state: DeskState, heightCm: number) {
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  drawTopBar(ctx, w);
  drawReadout(ctx, state, heightCm);
  drawTimeline(ctx, w, h, state);
  drawToast(ctx, w, state);
}
