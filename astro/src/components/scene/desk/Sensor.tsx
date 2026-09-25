/**
 * Our sensor: a PCB-green box on the UNDERSIDE of the desktop near the
 * back-right corner, facing down, with a clear line of sight to the floor
 * (W3-T5 item 5). One thin cable runs under the top, around the back edge
 * and along it into the all-in-one monitor. The beam is the one glow.
 */
import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import type { ScenePalette } from "../scenePalette";
import { Block, Cable, Rod, MOTION, type Vec3 } from "../kit";
import { DESK } from "./dims";

const BOX: Vec3 = [0.06, 0.028, 0.045];
/** 1.5 cm inboard of the right edge, 10 cm in from the back edge; clears the foot (x ≤ 0.48). */
export const SENSOR_X = DESK.width / 2 - BOX[0] / 2 - 0.015;
export const SENSOR_Z = -DESK.depth / 2 + 0.1;
const DOT_Y = 0.008;

/** World-space points the callouts point at, for a given desk height. */
export function sensorAnchors(heightM: number, monitorZ: number): { sensor: Vec3; cable: Vec3; laser: Vec3 } {
  const underside = heightM - DESK.topThickness;
  void monitorZ;
  return {
    sensor: [SENSOR_X + 0.03, underside - BOX[1] / 2, SENSOR_Z],
    cable: [0.42, heightM + 0.004, -DESK.depth / 2 + 0.03],
    laser: [SENSOR_X, (underside + DOT_Y) * 0.5, SENSOR_Z],
  };
}

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
  const underside = heightM - DESK.topThickness;
  const boxY = underside - BOX[1] / 2;
  const beamTop = boxY - BOX[1] / 2;
  const beamLen = beamTop - DOT_Y;
  const opacity = useBreath(breathe);
  const back = -DESK.depth / 2;

  const cable = useMemo<Vec3[]>(
    () => [
      [SENSOR_X - 0.01, underside - 0.014, SENSOR_Z - 0.02],
      [SENSOR_X - 0.03, underside - 0.008, back + 0.02],
      [SENSOR_X - 0.05, underside + 0.012, back - 0.018],
      [SENSOR_X - 0.08, heightM + 0.004, back + 0.025],
      [0.25, heightM + 0.004, back + 0.03],
      [0.04, heightM + 0.006, monitorZ - 0.06],
      [0.0, heightM + 0.09, monitorZ - 0.02],
    ],
    [heightM, underside, monitorZ, back],
  );

  return (
    <group>
      <group position={[SENSOR_X, boxY, SENSOR_Z]}>
        <Block size={BOX} color={palette.pcb} />
        {/* copper pads on the two faces the camera sees: the "honest PCB" detail */}
        <Block
          size={[0.004, 0.016, 0.03]}
          position={[BOX[0] / 2 + 0.001, 0, 0]}
          color={palette.copper}
          castShadow={false}
        />
        <Block
          size={[0.04, 0.016, 0.004]}
          position={[0, 0, BOX[2] / 2 + 0.001]}
          color={palette.copper}
          castShadow={false}
        />
        {/* the lens: a small dark square on the underside, where the beam leaves */}
        <Block
          size={[0.012, 0.003, 0.012]}
          position={[0, -BOX[1] / 2 - 0.001, 0]}
          color={palette.ink}
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
