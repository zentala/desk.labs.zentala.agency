/**
 * DeskScene material palette.
 *
 * Values are copied from the DTCG tokens in DESIGN.md §0 (single source of
 * truth). Scene code MUST NOT contain hex literals outside this file —
 * DESIGN.md §8: "Scene code reads these from one `scene-palette.ts` that
 * imports the token values; no hex in scene files."
 *
 * Only the light-mode values are used for the 3D scene: DESIGN.md §8 says
 * dark mode swaps `bg`, `desk-top` and the beam only, so those three entries
 * carry a `.dark` variant and everything else stays constant across themes.
 */

export interface ScenePalette {
  /** token: color.bg (light/dark) — floor and wall */
  bg: string;
  bgDark: string;
  /** token: color.teal — desk frame / legs */
  deskFrame: string;
  /** token: color.material.desk-top (light/dark) — desktop surface */
  deskTop: string;
  deskTopDark: string;
  /** token: color.ink — monitor housing and keyboard body */
  ink: string;
  /** token: color.material.screen — monitor screen background */
  screen: string;
  /** token: color.material.pcb — sensor box body */
  pcb: string;
  /** token: color.material.copper — sensor box trim */
  copper: string;
  /** token: color.brand (light/dark), emissive — laser beam + dot */
  brand: string;
  brandDark: string;
  /** token: color.state.sitting.fill — SITTING state accent */
  sitting: string;
  /** token: color.state.standing.fill — STANDING state accent */
  standing: string;
  /** token: color.line — hairline / ground grid */
  line: string;
}

export const scenePalette: ScenePalette = {
  bg: "#FAF7F2",
  bgDark: "#14171C",
  deskFrame: "#1C7C74",
  deskTop: "#E8D9BF",
  deskTopDark: "#CDBB9E",
  ink: "#1F2430",
  screen: "#FFFFFF",
  pcb: "#0F6B3A",
  copper: "#D9B26F",
  brand: "#E4572E",
  brandDark: "#FF7A55",
  sitting: "#F5C451",
  standing: "#4CC77A",
  line: "#E4DED4",
};

export type DeskState = "sitting" | "standing";

/** token: color.state.<state>.fill — used for the desk-top accent stripe and toast rule. */
export function stateFill(state: DeskState): string {
  return state === "sitting" ? scenePalette.sitting : scenePalette.standing;
}

/** token: color.state.<state>.text — used for the height readout and toast title. */
export function stateText(state: DeskState): string {
  return state === "sitting" ? "#8A5A00" : "#1F7A44";
}
