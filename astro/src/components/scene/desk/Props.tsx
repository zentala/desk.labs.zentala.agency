/**
 * Desk props you can name without a label (DESIGN.md §8.6): keyboard with a
 * key plate, mouse, a faceted cream mug with a handle, a closed notebook and
 * a small low-poly plant in a pot. Neutral except the plant's desaturated
 * sage (`material.plant`): colour is reserved for meaning (DESIGN.md §8.2).
 */
import type { ScenePalette } from "../scenePalette";
import { Blob, Block, Rod } from "../kit";
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
      <Block size={[0.36, 0.014, 0.13]} position={[-0.06, 0.007, front - 0.19]} color={palette.ink} />
      <Block
        size={[0.335, 0.005, 0.105]}
        position={[-0.06, 0.016, front - 0.19]}
        color={palette.inkMuted}
        castShadow={false}
      />
      {/* mouse */}
      <Block size={[0.06, 0.032, 0.1]} position={[0.2, 0.016, front - 0.18]} color={palette.ink} />
      <Block
        size={[0.05, 0.004, 0.06]}
        position={[0.2, 0.033, front - 0.19]}
        color={palette.inkMuted}
        castShadow={false}
      />
      {/* mug with handle */}
      <group position={[0.34, 0, front - 0.33]}>
        <Rod radius={0.037} radiusTop={0.04} length={0.095} position={[0, 0.0475, 0]} color={palette.surface} />
        <mesh position={[-0.05, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.024, 0.007, 5, 8]} />
          <meshLambertMaterial color={palette.surface} flatShading />
        </mesh>
      </group>
      {/* small plant: faceted pot, three stretched icosahedron leaves */}
      <group position={[0.5, 0, -0.19]}>
        <Rod radius={0.03} radiusTop={0.036} length={0.07} position={[0, 0.035, 0]} color={palette.fabric} />
        <Blob size={[0.07, 0.17, 0.07]} position={[0, 0.15, 0]} rotation={[0.1, 0, -0.15]} color={palette.plant} />
        <Blob size={[0.06, 0.13, 0.06]} position={[0.035, 0.12, 0.015]} rotation={[0.2, 0, 0.55]} color={palette.plant} />
        <Blob size={[0.06, 0.12, 0.06]} position={[-0.03, 0.11, -0.02]} rotation={[-0.3, 0, -0.6]} color={palette.plant} />
      </group>
      {/* closed notebook */}
      <Block
        size={[0.16, 0.014, 0.22]}
        position={[0.47, 0.007, 0.13]}
        rotation={[0, 0.18, 0]}
        color={palette.fabric}
      />
    </group>
  );
}
