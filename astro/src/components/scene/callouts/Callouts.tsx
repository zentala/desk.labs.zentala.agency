/**
 * Zoom callouts (DESIGN.md §8.10): circular insets that are real views of the
 * same objects from other cameras, a leader line to the projected 3D anchor
 * and one short label. This component owns only the DOM: the circle (which a
 * drei `<View>` tracks and paints into), the ring, the leader and the label.
 * `layout="overlay"` places each inset at anchor + offset inside the frame;
 * `layout="list"` (narrow screens) is a row of the same circles under it.
 */
import type { CSSProperties, RefObject } from "react";
import type { ProjectedAnchors } from "./Projector";

export type CalloutId = "sensor" | "cable";

export interface CalloutSpec {
  id: CalloutId;
  label: string;
}

export const CALLOUTS: CalloutSpec[] = [
  { id: "sensor", label: "Sensor under the desktop, seen from below" },
  { id: "cable", label: "USB-C cable into the monitor" },
];

export const CIRCLE_PX = 128;
const LABEL_W = 190;
/** vertical distance between inset centres in a column: circle + two label lines */
const MIN_GAP = CIRCLE_PX + 52;
/** inset centre = anchor + offset × frame size, per callout */
const OFFSETS: Record<CalloutId, [number, number]> = {
  cable: [0.17, -0.3],
  sensor: [0.18, 0.05],
};

const ringStyle: CSSProperties = {
  position: "relative",
  borderRadius: "50%",
  boxShadow: "var(--shadow-2), 0 0 0 1.5px var(--color-line-strong)",
  background: "transparent",
  flex: "none",
};

/**
 * The View paints the tracked square; this covers its corners with paper so
 * only the circle shows (a `<View>` scissor is always rectangular).
 */
function Ring({ size, track }: { size: number; track: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={track} style={{ ...ringStyle, width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, display: "block" }}>
        <path d="M0 0H100V100H0Z M50 0A50 50 0 1 0 50 100A50 50 0 1 0 50 0Z" fill="var(--color-bg)" fillRule="evenodd" />
      </svg>
    </div>
  );
}

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  lineHeight: 1.3,
  fontWeight: 500,
  color: "var(--color-ink)",
  textAlign: "center",
  width: LABEL_W,
};

export type TrackRefs = Record<CalloutId, RefObject<HTMLDivElement | null>>;

export interface CalloutsProps {
  layout: "overlay" | "list";
  visible: boolean;
  anchors: ProjectedAnchors;
  /** canvas size in CSS px (overlay only) */
  width: number;
  height: number;
  /** the circle elements the inset views track */
  tracks: TrackRefs;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function Callouts({ layout, visible, anchors, width, height, tracks }: CalloutsProps) {
  if (layout === "list") {
    return (
      <ul style={{ listStyle: "none", padding: "16px 16px 20px", margin: 0, display: "grid", gap: 14 }}>
        {CALLOUTS.map((spec) => (
          <li key={spec.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Ring size={88} track={tracks[spec.id]} />
            <span style={{ ...labelStyle, textAlign: "left", width: "auto", fontSize: 14 }}>{spec.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  const r = CIRCLE_PX / 2;
  const top = r + 8;
  const bottom = height - r - 60;
  const wanted = CALLOUTS.flatMap((spec) => {
    const a = anchors[spec.id];
    if (!a) return [];
    const [ox, oy] = OFFSETS[spec.id];
    return [{ spec, a, cx: clamp(a.x + ox * width, r + 8, width - r - 8), cy: clamp(a.y + oy * height, top, bottom) }];
  });
  wanted.sort((p, q) => p.cy - q.cy);
  for (let i = 1; i < wanted.length; i++) wanted[i].cy = Math.max(wanted[i].cy, wanted[i - 1].cy + MIN_GAP);
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
            top: p.labelAbove ? "auto" : p.cy - r,
            bottom: p.labelAbove ? height - (p.cy + r) : "auto",
            display: "flex",
            flexDirection: p.labelAbove ? "column-reverse" : "column",
            alignItems: "center",
            gap: 6,
            width: CIRCLE_PX,
          }}
        >
          <Ring size={CIRCLE_PX} track={tracks[p.spec.id]} />
          <span style={{ ...labelStyle, marginLeft: -(LABEL_W - CIRCLE_PX) / 2 }}>{p.spec.label}</span>
        </div>
      ))}
    </div>
  );
}
