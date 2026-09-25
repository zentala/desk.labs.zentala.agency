/**
 * Zoom callouts (DESIGN.md §8.10): circular magnified insets with a leader
 * line to a projected 3D anchor and a short label. Pure HTML/SVG over the
 * canvas, so the text is real text. `layout="overlay"` places each inset at
 * anchor + offset, clamped into the frame; `layout="list"` (narrow screens)
 * stacks the same insets under the scene without leader lines.
 */
import type { CSSProperties } from "react";
import { INSETS, type InsetId } from "./insets";
import type { ProjectedAnchors } from "./Projector";

const CIRCLE_PX = 112;
const LABEL_W = 190;
/** vertical distance between inset centres in a column: circle + two label lines */
const MIN_GAP = CIRCLE_PX + 52;
/** inset centre = anchor + offset × frame size, per callout */
const OFFSETS: Record<InsetId, [number, number]> = {
  cable: [0.16, -0.32],
  sensor: [0.17, -0.02],
  laser: [0.15, 0.1],
};

const circleStyle: CSSProperties = {
  width: CIRCLE_PX,
  height: CIRCLE_PX,
  borderRadius: "50%",
  overflow: "hidden",
  background: "var(--color-surface)",
  boxShadow: "var(--shadow-2), 0 0 0 1.5px var(--color-line-strong)",
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  lineHeight: 1.3,
  fontWeight: 500,
  color: "var(--color-ink)",
  textAlign: "center",
  width: LABEL_W,
};

function Inset({ id, size = CIRCLE_PX }: { id: InsetId; size?: number }) {
  const spec = INSETS.find((i) => i.id === id)!;
  return (
    <div style={{ ...circleStyle, width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {spec.draw}
      </svg>
    </div>
  );
}

export interface CalloutsProps {
  layout: "overlay" | "list";
  visible: boolean;
  anchors: ProjectedAnchors;
  /** canvas size in CSS px (overlay only) */
  width: number;
  height: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function Callouts({ layout, visible, anchors, width, height }: CalloutsProps) {
  if (layout === "list") {
    return (
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "12px 0 0",
          display: "grid",
          gap: 12,
          opacity: visible ? 1 : 0.5,
          transition: "opacity var(--duration-toast-in) var(--ease-enter)",
        }}
      >
        {INSETS.map((spec) => (
          <li key={spec.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Inset id={spec.id} size={64} />
            <span style={{ ...labelStyle, textAlign: "left", width: "auto", fontSize: 14 }}>{spec.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  const r = CIRCLE_PX / 2;
  const top = r + 8;
  const bottom = height - r - 60;
  const wanted = INSETS.flatMap((spec) => {
    const a = anchors[spec.id];
    if (!a) return [];
    const [ox, oy] = OFFSETS[spec.id];
    return [{ spec, a, cx: clamp(a.x + ox * width, r + 8, width - r - 8), cy: clamp(a.y + oy * height, top, bottom) }];
  });
  // one column: keep circle + label clear of the next inset, then pull back into the frame
  wanted.sort((p, q) => p.cy - q.cy);
  for (let i = 1; i < wanted.length; i++) {
    wanted[i].cy = Math.max(wanted[i].cy, wanted[i - 1].cy + MIN_GAP);
  }
  const overflow = wanted.length ? wanted[wanted.length - 1].cy - bottom : 0;
  if (overflow > 0) for (const p of wanted) p.cy -= overflow;
  const placed = wanted.map((p) => {
    const dx = p.a.x - p.cx;
    const dy = p.a.y - p.cy;
    const len = Math.hypot(dx, dy) || 1;
    // the label sits on the side the leader does not come from, so the line never crosses text
    const labelAbove = dy > 0.35 * Math.abs(dx) && p.cy - r - 44 > 0;
    return { ...p, labelAbove, edgeX: p.cx + (dx / len) * (r + 2), edgeY: p.cy + (dy / len) * (r + 2) };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity var(--duration-toast-in) var(--ease-enter)",
      }}
      aria-hidden={!visible}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {placed.map((p) =>
          p.a.visible ? (
            <g key={p.spec.id} stroke="var(--color-ink-muted)" fill="none">
              <line x1={p.a.x} y1={p.a.y} x2={p.edgeX} y2={p.edgeY} strokeWidth={1.5} />
              <circle cx={p.a.x} cy={p.a.y} r={5} fill="var(--color-surface)" strokeWidth={1.5} />
              <circle cx={p.a.x} cy={p.a.y} r={2} fill="var(--color-ink-muted)" stroke="none" />
            </g>
          ) : null,
        )}
      </svg>
      {placed.map((p) => (
          <div
            key={p.spec.id}
            style={{
              position: "absolute",
              left: p.cx - r,
              top: p.cy - r,
              display: "flex",
              flexDirection: p.labelAbove ? "column-reverse" : "column",
              alignItems: "center",
              gap: 6,
              width: CIRCLE_PX,
              ...(p.labelAbove ? { top: "auto", bottom: height - (p.cy + r) } : {}),
            }}
          >
            <Inset id={p.spec.id} />
            <span style={{ ...labelStyle, marginLeft: -(LABEL_W - CIRCLE_PX) / 2 }}>{p.spec.label}</span>
          </div>
      ))}
    </div>
  );
}
