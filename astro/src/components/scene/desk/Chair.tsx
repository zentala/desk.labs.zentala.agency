/**
 * An office chair in the same block language (owner feedback item 10):
 * amber seat and back (`state.sitting.fill`, DESIGN.md §8.2), ink gas column
 * and five-star base. When the person stands, the chair rolls back a little
 * and turns, the way a pushed chair does.
 */
import type { ScenePalette } from "../scenePalette";
import { Block, Rod } from "../kit";

const SEAT_TOP = 0.47;
const SEAT = [0.46, 0.06, 0.44] as const;
const BACK = [0.44, 0.42, 0.045] as const;

export interface ChairProps {
  /** 0 = at the desk, 1 = pushed back */
  t: number;
  palette: ScenePalette;
}

export function Chair({ t, palette }: ChairProps) {
  const z = 0.62 + 0.3 * t;
  const yaw = 0.35 * t;
  return (
    <group position={[0.02 * t, 0, z]} rotation={[0, yaw, 0]}>
      <Block size={[...SEAT]} position={[0, SEAT_TOP - SEAT[1] / 2, 0]} color={palette.sitting} />
      {/* backrest on a short ink spine that rises from the seat's rear edge */}
      <group position={[0, SEAT_TOP - 0.03, SEAT[2] / 2 - 0.03]} rotation={[0.14, 0, 0]}>
        <Block size={[0.06, 0.16, 0.03]} position={[0, 0.06, 0.0]} bevel="small" color={palette.ink} />
        <Block size={[...BACK]} position={[0, BACK[1] / 2 + 0.1, 0.0]} color={palette.sitting} />
      </group>
      <Rod radius={0.026} radiusTop={0.022} length={SEAT_TOP - SEAT[1] - 0.06} position={[0, 0.06 + (SEAT_TOP - SEAT[1] - 0.06) / 2, 0]} color={palette.ink} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 10;
        const r = 0.16;
        return (
          <group key={i} rotation={[0, -a, 0]}>
            <Block size={[0.3, 0.03, 0.045]} position={[r, 0.045, 0]} bevel="small" color={palette.ink} />
            <mesh position={[r + 0.13, 0.025, 0]} castShadow>
              <icosahedronGeometry args={[0.025, 1]} />
              <meshLambertMaterial color={palette.ink} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
