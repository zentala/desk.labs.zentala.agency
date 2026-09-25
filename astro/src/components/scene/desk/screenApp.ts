/**
 * What the all-in-one monitor shows: the Open Smart Desk app, designed for
 * its real on-page size (the screen is ~330 CSS px wide at 1280 px). Four
 * things only: the app mark, the height readout, the state chip and one
 * toast in the settled states. Drawn in a 1000 × 417 design space; the
 * canvas resolution comes from the projected pixels (`kit/screen.ts`).
 *
 * The screen is always the light app (`material.screen` is white in both
 * modes, DESIGN.md §0); it is dimmed 6 % so it sits with the paper scene.
 */
import { scenePalette as p, stateFill, stateText, stateTint, type DeskState } from "../scenePalette";
import { roundRect, wrapText, SCREEN_FONT } from "../kit";

export const SCREEN_DESIGN = { w: 1000, h: 417 } as const;

const TOAST: Partial<Record<DeskState, { title: string; body: string }>> = {
  sitting: { title: "Time to stand up", body: "40 min sitting. Up for a minute?" },
  standing: { title: "Nice one.", body: "Credit is ticking." },
};

const LABEL: Record<DeskState, string> = {
  sitting: "Sitting",
  rising: "Rising",
  lowering: "Lowering",
  standing: "Standing",
};

function drawMark(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = p.brand;
  ctx.beginPath();
  ctx.arc(52, 52, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.inkMuted;
  ctx.font = `600 30px ${SCREEN_FONT.display}`;
  ctx.textBaseline = "middle";
  ctx.fillText("Open Smart Desk", 80, 53);
  ctx.textBaseline = "alphabetic";
}

/** State chip: icon + label, never colour alone (DESIGN.md §3). */
function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number, state: DeskState) {
  const label = LABEL[state];
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

function drawReadout(ctx: CanvasRenderingContext2D, state: DeskState, heightCm: number) {
  const x = 44;
  ctx.fillStyle = p.ink;
  ctx.font = `700 300px ${SCREEN_FONT.display}`;
  ctx.fillText(`${heightCm}`, x - 10, 320);
  const numW = ctx.measureText(`${heightCm}`).width;
  ctx.fillStyle = p.inkMuted;
  ctx.font = `600 84px ${SCREEN_FONT.display}`;
  ctx.fillText("cm", x + numW + 12, 320);
  drawChip(ctx, x + 8, 340, state);
}

function drawToast(ctx: CanvasRenderingContext2D, w: number, h: number, state: DeskState) {
  const toast = TOAST[state];
  if (!toast) return;
  const cardW = 400;
  const cardH = 150;
  const x = w - cardW - 40;
  const y = h - cardH - 36;
  ctx.save();
  ctx.shadowColor = "rgba(31,36,48,0.22)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = p.surface;
  roundRect(ctx, x, y, cardW, cardH, 26);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = state === "sitting" ? p.brand : p.standing;
  roundRect(ctx, x + 22, y + 30, 8, cardH - 60, 4);
  ctx.fill();
  ctx.fillStyle = state === "sitting" ? p.ink : stateText(p, state);
  ctx.font = `600 44px ${SCREEN_FONT.display}`;
  ctx.fillText(toast.title, x + 54, y + 66);
  ctx.fillStyle = p.inkMuted;
  ctx.font = `400 34px ${SCREEN_FONT.body}`;
  wrapText(ctx, toast.body, x + 54, y + 114, cardW - 80, 40);
}

/** Paint the whole app for a state and desk height. */
export function drawScreen(ctx: CanvasRenderingContext2D, w: number, h: number, state: DeskState, heightCm: number) {
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(31,36,48,0.06)";
  ctx.fillRect(0, 0, w, h);
  drawMark(ctx);
  drawReadout(ctx, state, heightCm);
  drawToast(ctx, w, h, state);
}
