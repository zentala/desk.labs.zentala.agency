/**
 * The magnified insets: small SVG drawings in the scene's own language
 * (flat fills from tokens via CSS variables, one coral element per inset).
 * Each draws in a 100×100 viewBox that the callout clips to a circle.
 */
import type { ReactNode } from "react";

const INK = "var(--color-ink)";
const MUTED = "var(--color-ink-muted)";
const TOP = "var(--color-material-desk-top)";
const PCB = "var(--color-material-pcb)";
const COPPER = "var(--color-material-copper)";
const CORAL = "var(--color-brand)";
const LINE = "var(--color-line-strong)";
const PAPER = "var(--color-surface-2)";

export type InsetId = "sensor" | "cable" | "laser";

export interface InsetSpec {
  id: InsetId;
  label: string;
  draw: ReactNode;
}

/** Sensor stuck to the underside of the desktop, beam straight down to the floor. */
const SensorInset = (
  <g>
    <rect x="0" y="0" width="100" height="100" fill={PAPER} />
    {/* desktop, seen from the side, with its front-right corner */}
    <rect x="8" y="22" width="84" height="12" fill={TOP} />
    <rect x="8" y="34" width="84" height="2" fill={LINE} />
    {/* sensor box on the underside */}
    <rect x="52" y="36" width="20" height="10" rx="1.5" fill={PCB} />
    <rect x="70" y="38" width="2" height="6" fill={COPPER} />
    <rect x="60" y="45" width="4" height="1.5" fill={INK} />
    {/* beam to the floor */}
    <line x1="62" y1="47" x2="62" y2="88" stroke={CORAL} strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="62" cy="89" rx="6" ry="2" fill={CORAL} opacity="0.35" />
    <circle cx="62" cy="89" r="2.2" fill={CORAL} />
    {/* floor */}
    <rect x="0" y="92" width="100" height="8" fill={LINE} opacity="0.5" />
  </g>
);

/** One thin cable from the sensor up over the back edge and into the all-in-one. */
const CableInset = (
  <g>
    <rect x="0" y="0" width="100" height="100" fill={PAPER} />
    {/* all-in-one monitor, from behind */}
    <rect x="46" y="18" width="46" height="34" rx="3" fill={INK} />
    <rect x="65" y="52" width="8" height="12" fill={INK} />
    <rect x="56" y="63" width="26" height="4" rx="2" fill={INK} />
    {/* USB-C port + plug */}
    <rect x="52" y="40" width="9" height="4" rx="2" fill={MUTED} />
    <rect x="42" y="40.5" width="9" height="3" rx="1.5" fill={LINE} />
    {/* cable path from the sensor (bottom-left) */}
    <path d="M14 84 C 14 70, 20 62, 30 58 S 40 44, 42 42" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    <rect x="8" y="80" width="14" height="8" rx="1.5" fill={PCB} />
    <rect x="20" y="82" width="2" height="4" fill={COPPER} />
    {/* desktop edge the cable goes over */}
    <rect x="0" y="66" width="34" height="6" fill={TOP} />
  </g>
);

/** The beam is longer when the desk is up: height tells sitting from standing. */
const LaserInset = (
  <g>
    <rect x="0" y="0" width="100" height="100" fill={PAPER} />
    {/* low desk */}
    <rect x="8" y="58" width="34" height="6" fill={TOP} />
    <rect x="12" y="64" width="4" height="24" fill={MUTED} />
    <line x1="30" y1="64" x2="30" y2="88" stroke={CORAL} strokeWidth="2" strokeLinecap="round" />
    <circle cx="30" cy="89" r="2" fill={CORAL} />
    {/* high desk */}
    <rect x="58" y="24" width="34" height="6" fill={TOP} />
    <rect x="62" y="30" width="4" height="58" fill={MUTED} />
    <line x1="80" y1="30" x2="80" y2="88" stroke={CORAL} strokeWidth="2" strokeLinecap="round" />
    <circle cx="80" cy="89" r="2" fill={CORAL} />
    {/* arrow between them */}
    <path d="M44 52 L 56 40" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <path d="M56 46 L 56 40 L 50 40" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="0" y="92" width="100" height="8" fill={LINE} opacity="0.5" />
  </g>
);

export const INSETS: InsetSpec[] = [
  { id: "sensor", label: "Sensor on the underside, looking at the floor", draw: SensorInset },
  { id: "cable", label: "USB-C cable to the computer", draw: CableInset },
  { id: "laser", label: "Laser measures desk height → sitting or standing", draw: LaserInset },
];
