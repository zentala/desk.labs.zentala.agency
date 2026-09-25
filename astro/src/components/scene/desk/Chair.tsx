/**
 * An office chair in the kit language, kept quiet: a faceted seat cushion
 * (flattened icosahedron) on a graphite pan, a sharp fabric backrest on a
 * graphite spine, ink column and five-star base (DESIGN.md §8.2). When the person stands,
 * the chair rolls back a little and turns, the way a pushed chair does.
 */
import type { ScenePalette } from "../scenePalette";
import { Blob, Block, Rod } from "../kit";

const SEAT_TOP = 0.47;
const SEAT = [0.46, 0.07, 0.44] as const;
const BACK = [0.42, 0.4, 0.05] as const;
/** seat centre z when the person sits: hip z + a little, see poses.ts */
export const CHAIR_Z = 0.58;

export interface ChairProps {
  /** 0 = at the desk, 1 = pushed back */
  t: number;
  palette: ScenePalette;
}

export function Chair({ t, palette }: ChairProps) {
  const z = CHAIR_Z + 0.3 * t;
  const yaw = 0.35 * t;
  const columnLen = SEAT_TOP - SEAT[1] - 0.06;
  return (
    <group position={[0.02 * t, 0, z]} rotation={[0, yaw, 0]}>
      {/* faceted cushion: a flattened icosahedron over a thin sharp pan */}
      <Blob size={[SEAT[0] + 0.02, SEAT[1] * 1.3, SEAT[2] + 0.02]} detail={1} position={[0, SEAT_TOP - SEAT[1] * 0.65, 0]} color={palette.fabric} />
      <Block size={[SEAT[0] - 0.06, 0.02, SEAT[2] - 0.06]} position={[0, SEAT_TOP - SEAT[1] - 0.005, 0]} color={palette.frame} />
      {/* backrest on a short graphite spine that rises from the seat's rear edge */}
      <group position={[0, SEAT_TOP - 0.03, SEAT[2] / 2 - 0.03]} rotation={[0.14, 0, 0]}>
        <Block size={[0.06, 0.16, 0.03]} position={[0, 0.06, 0.0]} color={palette.frame} />
        <Block size={[...BACK]} position={[0, BACK[1] / 2 + 0.1, 0.0]} color={palette.fabric} />
      </group>
      <Rod radius={0.026} radiusTop={0.022} length={columnLen} position={[0, 0.06 + columnLen / 2, 0]} color={palette.ink} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 10;
        const r = 0.16;
        return (
          <group key={i} rotation={[0, -a, 0]}>
            <Block size={[0.3, 0.03, 0.045]} position={[r, 0.045, 0]} color={palette.ink} />
            <Blob size={[0.05, 0.05, 0.05]} position={[r + 0.13, 0.025, 0]} color={palette.ink} />
          </group>
        );
      })}
    </group>
  );
}
