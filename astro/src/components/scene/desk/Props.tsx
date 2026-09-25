/**
 * Desk props you can name without a label (DESIGN.md §8.6): keyboard with a
 * key plate, mouse, a coral mug with a handle, a closed notebook. Nothing else.
 */
import type { ScenePalette } from "../scenePalette";
import { Block, Rod } from "../kit";
import { DESK } from "./dims";

export interface PropsProps {
  heightM: number;
  palette: ScenePalette;
}

export function DeskProps({ heightM, palette }: PropsProps) {
  const front = DESK.depth / 2;
  return (
    <group position={[0, heightM, 0]}>
      {/* keyboard */}
      <Block size={[0.36, 0.014, 0.13]} position={[-0.06, 0.007, front - 0.19]} bevel="small" color={palette.ink} />
      <Block
        size={[0.335, 0.005, 0.105]}
        position={[-0.06, 0.016, front - 0.19]}
        bevel="small"
        color={palette.inkMuted}
        castShadow={false}
      />
      {/* mouse */}
      <Block size={[0.06, 0.032, 0.1]} position={[0.2, 0.016, front - 0.18]} bevel="small" color={palette.ink} />
      <Block
        size={[0.05, 0.004, 0.06]}
        position={[0.2, 0.033, front - 0.19]}
        bevel="small"
        color={palette.inkMuted}
        castShadow={false}
      />
      {/* mug with handle */}
      <group position={[-0.46, 0, front - 0.24]}>
        <Rod radius={0.037} radiusTop={0.04} length={0.095} position={[0, 0.0475, 0]} color={palette.brand} />
        <mesh position={[-0.05, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.024, 0.007, 6, 10]} />
          <meshLambertMaterial color={palette.brand} flatShading />
        </mesh>
      </group>
      {/* closed notebook */}
      <Block
        size={[0.16, 0.014, 0.22]}
        position={[0.42, 0.007, 0.0]}
        rotation={[0, 0.18, 0]}
        bevel="small"
        color={palette.sweater}
      />
    </group>
  );
}
