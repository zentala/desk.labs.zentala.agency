/**
 * The desk: top, two telescopic columns on T-feet, side brackets with a flush
 * crossbar, and the desk's own control paddle wired to the right column
 * (DESIGN.md §8.6). Frame in the neutral "hardware grey" (§8.2). Nothing of
 * ours is on this component — the sensor lives in `Sensor.tsx` so the two
 * systems are visibly separate.
 */
import { useMemo } from "react";
import type { ScenePalette } from "../scenePalette";
import { Block, Cable, type Vec3 } from "../kit";
import { DESK } from "./dims";

interface ColumnProps {
  x: number;
  underside: number;
  color: string;
}

/** One leg: foot + three nested stages, the bottom one thinnest. */
function Column({ x, underside, color }: ColumnProps) {
  const z = DESK.columnZ;
  const { bottom, mid, top } = DESK.stage;
  const bottomLen = DESK.bottomStageTop - DESK.foot[1];
  const topStageTop = underside - DESK.bracket[1];
  const topStageBottom = topStageTop - DESK.topStageLength;
  const midTop = topStageBottom + 0.06;
  const midLen = midTop - DESK.midStageBottom;
  return (
    <group position={[x, 0, z]}>
      <Block size={DESK.foot} position={[0, DESK.foot[1] / 2, 0]} color={color} />
      <Block
        size={[bottom, bottomLen, bottom]}
        position={[0, DESK.foot[1] + bottomLen / 2, 0]}
        bevel="small"
        color={color}
      />
      <Block
        size={[mid, midLen, mid]}
        position={[0, DESK.midStageBottom + midLen / 2, 0]}
        bevel="small"
        color={color}
      />
      <Block
        size={[top, DESK.topStageLength, top]}
        position={[0, topStageBottom + DESK.topStageLength / 2, 0]}
        bevel="small"
        color={color}
      />
      <Block
        size={DESK.bracket}
        position={[0, underside - DESK.bracket[1] / 2, 0]}
        bevel="small"
        color={color}
      />
    </group>
  );
}

/** The desk's own controller: 4 memory buttons + up/down rocker, front-right, cabled to the right column. */
function Paddle({ underside, palette }: { underside: number; palette: ScenePalette }) {
  const x = 0.36;
  const front = DESK.depth / 2;
  const bodyZ = front + 0.005; // body 7 cm deep, protrudes 4 cm past the edge
  const buttonZ = front + 0.022;
  const buttonY = underside - 0.002;
  const cable = useMemo<Vec3[]>(
    () => [
      [x, underside - 0.012, front - 0.03],
      [x + 0.03, underside - 0.03, 0.12],
      [DESK.columnX, underside - 0.03, DESK.columnZ + 0.02],
      [DESK.columnX, underside - 0.14, DESK.columnZ],
    ],
    [underside],
  );
  return (
    <group>
      <Block size={[0.1, 0.016, 0.07]} position={[x, underside - 0.008, bodyZ]} bevel="small" color={palette.frame} />
      {[-0.036, -0.021, -0.006, 0.009].map((dx) => (
        <Block
          key={dx}
          size={[0.012, 0.005, 0.014]}
          position={[x + dx, buttonY, buttonZ]}
          bevel="small"
          color={palette.line}
          castShadow={false}
        />
      ))}
      <Block
        size={[0.014, 0.006, 0.026]}
        position={[x + 0.034, buttonY, buttonZ]}
        bevel="small"
        color={palette.line}
        castShadow={false}
      />
      <Cable points={cable} color={palette.ink} />
    </group>
  );
}

export interface DeskProps {
  heightM: number;
  palette: ScenePalette;
}

export function Desk({ heightM, palette }: DeskProps) {
  const underside = heightM - DESK.topThickness;
  return (
    <group>
      <Block
        size={[DESK.width, DESK.topThickness, DESK.depth]}
        position={[0, heightM - DESK.topThickness / 2, 0]}
        color={palette.deskTop}
      />
      <Column x={-DESK.columnX} underside={underside} color={palette.frame} />
      <Column x={DESK.columnX} underside={underside} color={palette.frame} />
      {/* slim crossbar flush under the top, hidden from above (owner round 2) */}
      <Block
        size={[DESK.columnX * 2 - DESK.bracket[0], DESK.bracket[1], 0.04]}
        position={[0, underside - DESK.bracket[1] / 2, DESK.columnZ]}
        bevel="small"
        color={palette.frame}
      />
      <Paddle underside={underside} palette={palette} />
    </group>
  );
}
