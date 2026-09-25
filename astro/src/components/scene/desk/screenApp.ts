/**
 * What the all-in-one monitor shows: the Open Smart Desk app. State readout,
 * today's posture timeline, a small stats row and the nudge / confirmation
 * toast (owner feedback item 8; copy per E010 §5). Drawn in logical pixels;
 * `useCanvasTexture` handles the 2× texel density.
 *
 * The screen is always the light theme: `material.screen` is white in both
 * modes (DESIGN.md §0), so the app on it uses the light palette.
 */
import { scenePalette as p, stateFill, stateText, stateTint, type DeskState } from "../scenePalette";
import { roundRect, wrapText, SCREEN_FONT } from "../kit";

export const SCREEN_PX = { w: 1170, h: 488 } as const;

const TOAST = {
  sitting: { title: "Time to stand up", body: "40 min sitting. Up for a minute?" },
  standing: { title: "Nice one.", body: "Credit is ticking. Sit whenever you're ready." },
} as const;

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

function drawReadout(ctx: CanvasRenderingContext2D, state: DeskState, heightCm: number) {
  const x = 40;
  const y = 92;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 15px ${SCREEN_FONT.body}`;
  ctx.fillText("DESK NOW", x, y);

  // state chip: icon + label, never colour alone (DESIGN.md §3)
  const label = state === "sitting" ? "Sitting" : "Standing";
  ctx.font = `600 22px ${SCREEN_FONT.body}`;
  const chipW = ctx.measureText(label).width + 62;
  ctx.fillStyle = stateTint(p, state);
  roundRect(ctx, x, y + 18, chipW, 40, 20);
  ctx.fill();
  ctx.fillStyle = stateFill(p, state);
  ctx.beginPath();
  ctx.arc(x + 22, y + 38, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = p.surface;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (state === "sitting") {
    ctx.moveTo(x + 16, y + 38);
    ctx.lineTo(x + 28, y + 38);
  } else {
    ctx.moveTo(x + 22, y + 44);
    ctx.lineTo(x + 22, y + 32);
    ctx.moveTo(x + 17, y + 37);
    ctx.lineTo(x + 22, y + 32);
    ctx.lineTo(x + 27, y + 37);
  }
  ctx.stroke();
  ctx.fillStyle = stateText(p, state);
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 42, y + 39);

  // the big number
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.ink;
  ctx.font = `700 118px ${SCREEN_FONT.display}`;
  ctx.fillText(`${heightCm}`, x - 4, y + 178);
  const numW = ctx.measureText(`${heightCm}`).width;
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 40px ${SCREEN_FONT.display}`;
  ctx.fillText("cm", x + numW + 12, y + 178);
}

function drawTimeline(ctx: CanvasRenderingContext2D, state: DeskState) {
  const x = 40;
  const y = 318;
  const w = 640;
  const h = 26;
  ctx.fillStyle = p.inkMuted;
  ctx.font = `500 15px ${SCREEN_FONT.body}`;
  ctx.fillText("TODAY", x, y - 14);
  // segments: sitting (amber) / standing (green) / away (slate) — 3:40 sat, 1:10 stood so far
  const segs: Array<[number, string]> = [
    [0.22, p.sitting],
    [0.08, p.standing],
    [0.2, p.sitting],
    [0.06, p.away],
    [0.18, p.sitting],
    [0.08, p.standing],
    [0.1, state === "sitting" ? p.sitting : p.standing],
  ];
  let cx = x;
  ctx.save();
  roundRect(ctx, x, y, w, h, 8);
  ctx.clip();
  for (const [frac, color] of segs) {
    ctx.fillStyle = color;
    ctx.fillRect(cx, y, w * frac + 1, h);
    cx += w * frac;
  }
  ctx.restore();
  ctx.fillStyle = p.rug;
  ctx.fillRect(cx, y, x + w - cx, h);
  // three nudge marks
  ctx.fillStyle = p.brand;
  for (const f of [0.22, 0.5, 0.82]) {
    ctx.beginPath();
    ctx.moveTo(x + w * f - 6, y - 4);
    ctx.lineTo(x + w * f + 6, y - 4);
    ctx.lineTo(x + w * f, y + 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = p.inkMuted;
  ctx.font = `400 16px ${SCREEN_FONT.body}`;
  ctx.fillText("3 h 40 sitting  ·  1 h 10 standing  ·  5 posture changes", x, y + h + 26);
}

function drawStats(ctx: CanvasRenderingContext2D, w: number) {
  const cards: Array<[string, string]> = [
    ["Points", "12"],
    ["Stand credit", "18 min"],
  ];
  let x = w - 40 - 2 * 200 - 16;
  for (const [label, value] of cards) {
    ctx.fillStyle = p.surface;
    roundRect(ctx, x, 84, 200, 96, 14);
    ctx.fill();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = p.inkMuted;
    ctx.font = `500 15px ${SCREEN_FONT.body}`;
    ctx.fillText(label.toUpperCase(), x + 20, 114);
    ctx.fillStyle = p.ink;
    ctx.font = `700 38px ${SCREEN_FONT.display}`;
    ctx.fillText(value, x + 20, 160);
    x += 216;
  }
}

function drawToast(ctx: CanvasRenderingContext2D, w: number, h: number, state: DeskState) {
  const toast = TOAST[state];
  const cardW = 400;
  const cardH = 108;
  const x = w - cardW - 40;
  const y = h - cardH - 40;
  ctx.save();
  ctx.shadowColor = "rgba(31,36,48,0.25)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = p.surface;
  roundRect(ctx, x, y, cardW, cardH, 20);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = state === "sitting" ? p.brand : p.standing;
  roundRect(ctx, x + 14, y + 20, 6, cardH - 40, 3);
  ctx.fill();
  ctx.fillStyle = state === "sitting" ? p.ink : stateText(p, state);
  ctx.font = `600 24px ${SCREEN_FONT.display}`;
  ctx.fillText(toast.title, x + 38, y + 44);
  ctx.fillStyle = p.inkMuted;
  ctx.font = `400 18px ${SCREEN_FONT.body}`;
  wrapText(ctx, toast.body, x + 38, y + 74, cardW - 60, 24);
}

/** Paint the whole app for a state and desk height. */
export function drawScreen(ctx: CanvasRenderingContext2D, w: number, h: number, state: DeskState, heightCm: number) {
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  drawTopBar(ctx, w);
  drawReadout(ctx, state, heightCm);
  drawTimeline(ctx, state);
  drawStats(ctx, w);
  drawToast(ctx, w, h, state);
}
