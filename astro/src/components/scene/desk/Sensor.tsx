/**
 * Our sensor: a PCB-green box clamped to the back-right side edge of the top,
 * beam straight down to the floor, one thin cable along the back edge into
 * the all-in-one monitor (owner feedback items 1–2, DESIGN.md §8.6).
 * The beam is the one glow in the scene.
 */
import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import type { ScenePalette } from "../scenePalette";
import { Block, Cable, Rod, MOTION, type Vec3 } from "../kit";
import { DESK } from "./dims";

const BOX: Vec3 = [0.06, 0.03, 0.045];
const SENSOR_X = DESK.width / 2 + BOX[0] / 2 + 0.002;
const SENSOR_Z = -DESK.depth / 2 + 0.07;
const DOT_Y = 0.008;

/** Beam opacity breathes 0.85 → 1 over 2 s (DESIGN.md §8.7); off under reduced motion. */
function useBreath(enabled: boolean): number {
  const { invalidate } = useThree();
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const s = ((performance.now() - start) / 1000) % MOTION.beamBreatheS;
      setPhase(s / MOTION.beamBreatheS);
      invalidate();
    }, 100);
    return () => window.clearInterval(id);
  }, [enabled, invalidate]);
  return enabled ? 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(phase * Math.PI * 2)) : 1;
}

export interface SensorProps {
  heightM: number;
  palette: ScenePalette;
  /** monitor neck position on the desk, where the cable ends */
  monitorZ: number;
  breathe: boolean;
}

export function Sensor({ heightM, palette, monitorZ, breathe }: SensorProps) {
  const boxY = heightM - BOX[1] / 2 + 0.002;
  const beamTop = boxY - BOX[1] / 2;
  const beamLen = beamTop - DOT_Y;
  const opacity = useBreath(breathe);

  const cable = useMemo<Vec3[]>(
    () => [
      [SENSOR_X - 0.01, heightM + 0.004, SENSOR_Z - 0.012],
      [DESK.width / 2 - 0.03, heightM + 0.004, -DESK.depth / 2 + 0.035],
      [0.25, heightM + 0.004, -DESK.depth / 2 + 0.03],
      [0.04, heightM + 0.006, monitorZ - 0.06],
      [0.0, heightM + 0.09, monitorZ - 0.02],
    ],
    [heightM, monitorZ],
  );

  return (
    <group>
      <group position={[SENSOR_X, boxY, SENSOR_Z]}>
        <Block size={BOX} bevel="small" color={palette.pcb} />
        {/* copper edge on the outer face: the "honest PCB" detail */}
        <Block
          size={[0.004, 0.02, 0.034]}
          position={[BOX[0] / 2 + 0.001, -0.002, 0]}
          bevel="small"
          color={palette.copper}
          castShadow={false}
        />
        {/* clamp lip over the top edge */}
        <Block
          size={[0.05, 0.006, 0.03]}
          position={[-0.02, BOX[1] / 2 + 0.003, 0]}
          bevel="small"
          color={palette.pcb}
          castShadow={false}
        />
      </group>
      <Rod
        radius={0.003}
        length={beamLen}
        position={[SENSOR_X, beamTop - beamLen / 2, SENSOR_Z]}
        color={palette.brand}
        finish="glow"
        castShadow={false}
      />
      <mesh position={[SENSOR_X, DOT_Y, SENSOR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.022, 16]} />
        <meshBasicMaterial color={palette.brand} toneMapped={false} transparent opacity={opacity} />
      </mesh>
      <mesh position={[SENSOR_X, DOT_Y - 0.001, SENSOR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color={palette.brand} toneMapped={false} transparent opacity={0.2 * opacity} />
      </mesh>
      <Cable points={cable} color={palette.ink} />
    </group>
  );
}
