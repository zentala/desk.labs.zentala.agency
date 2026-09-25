/**
 * An office chair in the kit language, kept quiet (DESIGN.md §8.2). Two
 * variants (W3-T7): `rounded` — faceted cushions for seat and back with the
 * pan hidden inside the seat; `sharp` — the boxy v1.5 chair. Both share the
 * graphite spine, satin ink column and five-star base. When the person
 * stands, the chair rolls back a little and turns, the way a pushed chair does.
 */
import type { ScenePalette } from "../scenePalette";
import { Blob, Block, Rod } from "../kit";

export type ChairStyle = "rounded" | "sharp";

const SEAT_TOP = 0.47;
const SEAT = [0.46, 0.07, 0.44] as const;
const BACK = [0.42, 0.4, 0.05] as const;
/** seat centre z when the person sits: hip z + a little, see poses.ts */
export const CHAIR_Z = 0.58;

function Cushions({ palette, chairStyle }: { palette: ScenePalette; chairStyle: ChairStyle }) {
  if (chairStyle === "sharp") {
    return (
      <>
        <Block size={[...SEAT]} position={[0, SEAT_TOP - SEAT[1] / 2, 0]} color={palette.fabric} />
        <group position={[0, SEAT_TOP - 0.03, SEAT[2] / 2 - 0.03]} rotation={[0.14, 0, 0]}>
          <Block size={[0.06, 0.16, 0.03]} position={[0, 0.06, 0]} color={palette.frame} />
          <Block size={[...BACK]} position={[0, BACK[1] / 2 + 0.1, 0]} color={palette.fabric} />
        </group>
      </>
    );
  }
  return (
    <>
      {/* seat cushion: a flattened icosahedron; the pan is a smaller box inside it, never visible */}
      <Blob size={[SEAT[0] + 0.02, SEAT[1] * 1.5, SEAT[2] + 0.02]} detail={2} position={[0, SEAT_TOP - SEAT[1] * 0.6, 0]} color={palette.fabric} />
      <Block size={[SEAT[0] - 0.14, 0.02, SEAT[2] - 0.14]} position={[0, SEAT_TOP - SEAT[1] - 0.008, 0]} color={palette.frame} castShadow={false} />
      <group position={[0, SEAT_TOP - 0.03, SEAT[2] / 2 - 0.03]} rotation={[0.14, 0, 0]}>
        <Block size={[0.06, 0.16, 0.03]} position={[0, 0.06, 0]} color={palette.frame} />
        {/* backrest cushion: a wide, flat ellipsoid */}
        <Blob size={[BACK[0] + 0.02, BACK[1] + 0.02, BACK[2] * 1.4]} detail={2} position={[0, BACK[1] / 2 + 0.1, 0]} color={palette.fabric} />
      </group>
    </>
  );
}

export interface ChairProps {
  /** 0 = at the desk, 1 = pushed back */
  t: number;
  palette: ScenePalette;
  chairStyle?: ChairStyle;
}

export function Chair({ t, palette, chairStyle = "sharp" }: ChairProps) {
  const z = CHAIR_Z + 0.3 * t;
  const yaw = 0.35 * t;
  const columnLen = SEAT_TOP - SEAT[1] - 0.06;
  return (
    <group position={[0.02 * t, 0, z]} rotation={[0, yaw, 0]}>
      <Cushions palette={palette} chairStyle={chairStyle} />
      <Rod radius={0.026} radiusTop={0.022} length={columnLen} position={[0, 0.06 + columnLen / 2, 0]} color={palette.ink} finish="satin" />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 10;
        const r = 0.16;
        return (
          <group key={i} rotation={[0, -a, 0]}>
            <Block size={[0.3, 0.03, 0.045]} position={[r, 0.045, 0]} color={palette.ink} finish="satin" />
            <Blob size={[0.05, 0.05, 0.05]} position={[r + 0.13, 0.025, 0]} color={palette.ink} />
          </group>
        );
      })}
    </group>
  );
}
