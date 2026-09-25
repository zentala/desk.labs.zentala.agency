/**
 * Scene palette — the ONLY file under `scene/` allowed to contain hex values.
 *
 * Values mirror the DTCG tokens in DESIGN.md §0 (single source of truth) and
 * the material mapping in DESIGN.md §8.2. Dark mode swaps `bg`, `slab`, `rug`,
 * `line`, `ghost`, `deskTop` and `brand` only; everything else is theme-independent so
 * the world stays the same room in both themes.
 */

/** Settled states plus the two transitional ones the screen shows while the desk moves. */
export type DeskState = "sitting" | "rising" | "lowering" | "standing";

/** Colours that differ between light and dark (DESIGN.md §8.2). */
interface ThemedColors {
  /** token: color.bg — page / horizon */
  bg: string;
  /** stage slab: light `surface-2`, dark `line-strong` (a dark floor under a lamp goes black) */
  slab: string;
  /** rug on the slab: light `line`, dark `surface-2` */
  rug: string;
  /** token: color.line — hemisphere ground */
  line: string;
  /** person ghost (kit finish kept for later scenes): light `material.sweater`, dark `state.away.fill` */
  ghost: string;
  /** token: color.material.desk-top */
  deskTop: string;
  /** token: color.brand — beam, dot, mug */
  brand: string;
}

/** Colours shared by both themes. */
interface FixedColors {
  /** token: color.teal — kept for UI parity; the scene does not use it (DESIGN.md §8.2) */
  teal: string;
  /** token: color.ink-muted — desk frame, chair shell, monitor stand: the neutral "hardware grey" */
  frame: string;
  /** token: color.material.fabric — chair seat and back, notebook: warm neutral */
  fabric: string;
  /** token: color.material.figure — the simple person, a sand figure */
  figure: string;
  /** token: color.material.plant — the one desk plant, a desaturated sage that cannot be mistaken for PCB green */
  plant: string;
  /** column stages, top → bottom: dark `line-strong`, a step between, dark `line` (DESIGN.md §8.6) */
  stageTop: string;
  stageMid: string;
  stageBottom: string;
  /** token: color.ink — monitor, keyboard, chair base, cables */
  ink: string;
  /** token: color.ink-muted — key plate, mouse top, secondary UI text */
  inkMuted: string;
  /** token: color.material.screen */
  screen: string;
  /** token: color.material.pcb */
  pcb: string;
  /** token: color.material.copper */
  copper: string;
  /** token: color.material.sweater — person ghost, notebook */
  sweater: string;
  /** token: color.state.sitting.fill — chair */
  sitting: string;
  /** token: color.state.standing.fill */
  standing: string;
  /** token: color.state.sitting.text / standing.text — screen UI only */
  sittingText: string;
  standingText: string;
  /** token: color.state.sitting.tint / standing.tint — screen UI only */
  sittingTint: string;
  standingTint: string;
  /** token: color.surface — screen UI cards */
  surface: string;
  /** token: color.state.away.fill / tint / text (light) — screen UI: timeline + the moving-desk chip */
  away: string;
  awayTint: string;
  awayText: string;
}

export type ScenePalette = ThemedColors & FixedColors;

const LIGHT: ThemedColors = {
  bg: "#FAF7F2",
  slab: "#F1ECE3",
  rug: "#E4DED4",
  line: "#E4DED4",
  ghost: "#2F4A9C",
  deskTop: "#E8D9BF",
  brand: "#E4572E",
};

const DARK: ThemedColors = {
  bg: "#14171C",
  slab: "#6B7280",
  rug: "#5B6270",
  line: "#2C313A",
  ghost: "#8C9AAE",
  deskTop: "#CDBB9E",
  brand: "#FF7A55",
};

const FIXED: FixedColors = {
  teal: "#1C7C74",
  frame: "#5B6270",
  plant: "#8FA08A",
  stageTop: "#6B7280",
  stageMid: "#4B5160",
  stageBottom: "#2C313A",
  fabric: "#7D7770",
  figure: "#CDBE9F",
  ink: "#1F2430",
  inkMuted: "#5B6270",
  screen: "#FFFFFF",
  pcb: "#0F6B3A",
  copper: "#D9B26F",
  sweater: "#2F4A9C",
  sitting: "#F5C451",
  standing: "#4CC77A",
  sittingText: "#8A5A00",
  standingText: "#1F7A44",
  sittingTint: "#FBECC4",
  standingTint: "#D9F2E2",
  surface: "#FFFFFF",
  away: "#B8C2D1",
  awayTint: "#E6EAF0",
  awayText: "#5A6A80",
};

/** Resolve the full palette for a theme. */
export function resolvePalette(dark: boolean): ScenePalette {
  return { ...(dark ? DARK : LIGHT), ...FIXED };
}

/** Light palette, for code paths that run before the theme is known (SSR, tests). */
export const scenePalette: ScenePalette = resolvePalette(false);

/** token: color.state.<state>.fill; the moving desk borrows `away` (slate: neutral, no judgment). */
export function stateFill(p: ScenePalette, state: DeskState): string {
  if (state === "sitting") return p.sitting;
  if (state === "standing") return p.standing;
  return p.away;
}

/** token: color.state.<state>.text — screen UI text only, never on `fill`. */
export function stateText(p: ScenePalette, state: DeskState): string {
  if (state === "sitting") return p.sittingText;
  if (state === "standing") return p.standingText;
  return p.awayText;
}

/** token: color.state.<state>.tint — screen UI chip background. */
export function stateTint(p: ScenePalette, state: DeskState): string {
  if (state === "sitting") return p.sittingTint;
  if (state === "standing") return p.standingTint;
  return p.awayTint;
}
