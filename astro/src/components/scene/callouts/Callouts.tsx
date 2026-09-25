/**
 * Zoom callouts (DESIGN.md §8.10): circular insets that are real views of the
 * same objects from other cameras, a leader line to the projected 3D anchor
 * and one short label. The rings live in a paper column beside the hero (or
 * a row under it on narrow screens), never over the hero, so the shared
 * canvas can be clipped to "hero rectangle + circles" and the square View
 * scissor never shows. This component owns only the DOM: rings the Views
 * track, leaders and labels. Placement is `placeCallouts()`, shared with the
 * canvas clip-path in DeskScene.
 */
import type { CSSProperties, RefObject } from "react";
import type { ProjectedAnchors } from "./Projector";

export type CalloutId = "sensor" | "cable";

export interface CalloutSpec {
  id: CalloutId;
  label: string;
}

export const CALLOUTS: CalloutSpec[] = [
  { id: "cable", label: "USB-C plug in the monitor's side port" },
  { id: "sensor", label: "Sensor under the desktop, seen from below" },
];

export const CIRCLE_PX = 128;
export const LIST_CIRCLE_PX = 88;
const LABEL_W = 200;
const LABEL_H = 40;
/** vertical distance between ring centres in the column: circle + label + breathing room */
const MIN_GAP = CIRCLE_PX + LABEL_H + 28;

export interface PlacedCallout {
  spec: CalloutSpec;
  anchor: { x: number; y: number; visible: boolean } | null;
  cx: number;
  cy: number;
  labelAbove: boolean;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Column layout: ring centres on the column's axis, at the anchor's height,
 * de-overlapped and kept inside the frame. The label goes on the side the
 * leader does not come from, so a line never crosses its own text.
 */
export function placeCallouts(anchors: ProjectedAnchors, columnX: number, height: number): PlacedCallout[] {
  const r = CIRCLE_PX / 2;
  const top = r + LABEL_H + 12;
  const bottom = height - r - LABEL_H - 12;
  const wanted = CALLOUTS.map((spec) => {
    const a = anchors[spec.id] ?? null;
    return { spec, anchor: a, cx: columnX, cy: clamp(a ? a.y : height / 2, top, bottom) };
  });
  wanted.sort((p, q) => p.cy - q.cy);
  for (let i = 1; i < wanted.length; i++) wanted[i].cy = Math.max(wanted[i].cy, wanted[i - 1].cy + MIN_GAP);
  const overflow = wanted.length ? wanted[wanted.length - 1].cy - bottom : 0;
  if (overflow > 0) for (const p of wanted) p.cy -= overflow;
  return wanted.map((p) => ({ ...p, labelAbove: !!p.anchor && p.anchor.y > p.cy + 8 }));
}

const ringStyle: CSSProperties = {
  borderRadius: "50%",
  boxShadow: "var(--shadow-2), 0 0 0 1.5px var(--color-line-strong)",
  background: "transparent",
  flex: "none",
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  lineHeight: 1.3,
  fontWeight: 500,
  color: "var(--color-ink)",
  textAlign: "center",
  width: LABEL_W,
  height: LABEL_H,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export type TrackRefs = Record<CalloutId, RefObject<HTMLDivElement | null>>;

export interface CalloutsProps {
  layout: "column" | "list";
  visible: boolean;
  placed: PlacedCallout[];
  /** box size in CSS px (column only) */
  width: number;
  height: number;
  tracks: TrackRefs;
}

export function Callouts({ layout, visible, placed, width, height, tracks }: CalloutsProps) {
  if (layout === "list") {
    return (
      <ul style={{ listStyle: "none", padding: "16px 16px 20px", margin: 0, display: "grid", gap: 14 }}>
        {CALLOUTS.map((spec) => (
          <li key={spec.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div ref={tracks[spec.id]} data-callout-ring style={{ ...ringStyle, width: LIST_CIRCLE_PX, height: LIST_CIRCLE_PX }} aria-hidden="true" />
            <span style={{ ...labelStyle, textAlign: "left", width: "auto", height: "auto", fontSize: 14 }}>{spec.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  const r = CIRCLE_PX / 2;
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
        {placed.map((p) => {
          if (!p.anchor || !p.anchor.visible) return null;
          const dx = p.anchor.x - p.cx;
          const dy = p.anchor.y - p.cy;
          const len = Math.hypot(dx, dy) || 1;
          const ex = p.cx + (dx / len) * (r + 2);
          const ey = p.cy + (dy / len) * (r + 2);
          return (
            <g key={p.spec.id} stroke="var(--color-ink-muted)" fill="none">
              <line x1={p.anchor.x} y1={p.anchor.y} x2={ex} y2={ey} strokeWidth={1.5} />
              <circle cx={p.anchor.x} cy={p.anchor.y} r={5} fill="none" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      {placed.map((p) => (
        <div key={p.spec.id}>
          <div ref={tracks[p.spec.id]} data-callout-ring style={{ ...ringStyle, position: "absolute", left: p.cx - r, top: p.cy - r, width: CIRCLE_PX, height: CIRCLE_PX }} aria-hidden="true" />
          <span
            style={{
              ...labelStyle,
              position: "absolute",
              left: p.cx - LABEL_W / 2,
              top: p.labelAbove ? p.cy - r - LABEL_H - 6 : p.cy + r + 6,
            }}
          >
            {p.spec.label}
          </span>
        </div>
      ))}
    </div>
  );
}
