import { useState, type CSSProperties } from "react";
import DeskScene from "./DeskScene";
import type { ChairStyle } from "./desk/Chair";
import type { FigureStyle } from "./kit";

/**
 * Lab wrapper for /lab/desk-scene: the scroll-driven scene plus the owner's
 * A/B toggles (chair rounded/sharp, figure faceted/smooth). Not used on the site.
 */
export default function DeskSceneLab() {
  const [chairStyle, setChairStyle] = useState<ChairStyle>("sharp");
  const [figureStyle, setFigureStyle] = useState<FigureStyle>("faceted");

  const toggle = (active: boolean): CSSProperties => ({
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-line-strong)",
    background: active ? "var(--color-surface-2)" : "transparent",
    color: "var(--color-ink)",
    fontWeight: active ? 600 : 400,
    cursor: active ? "default" : "pointer",
  });

  return (
    <div>
      <div data-lab-toggles style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12, fontSize: 14 }}>
        <span style={{ color: "var(--color-ink-muted)" }}>Chair</span>
        <button type="button" data-chair="rounded" style={toggle(chairStyle === "rounded")} onClick={() => setChairStyle("rounded")}>rounded</button>
        <button type="button" data-chair="sharp" style={toggle(chairStyle === "sharp")} onClick={() => setChairStyle("sharp")}>sharp</button>
        <span style={{ color: "var(--color-ink-muted)", marginLeft: 12 }}>Figure</span>
        <button type="button" data-figure="faceted" style={toggle(figureStyle === "faceted")} onClick={() => setFigureStyle("faceted")}>faceted</button>
        <button type="button" data-figure="smooth" style={toggle(figureStyle === "smooth")} onClick={() => setFigureStyle("smooth")}>smooth</button>
      </div>
      <DeskScene scroll chairStyle={chairStyle} figureStyle={figureStyle} />
    </div>
  );
}
