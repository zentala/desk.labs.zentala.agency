/**
 * Our sensor: a PCB-green box on the UNDERSIDE of the desktop near the
 * back-right corner, lens facing down, clear line of sight to the floor.
 * One smooth cable leaves its back through a connector, runs under the top
 * to the back edge, around it, along the back edge and up the monitor's
 * right side into its USB-C port (W3-T8). The beam is the one glow.
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

/** Centre of the sensor box for a desk height. */
export function sensorCenter(heightM: number): Vec3 {
  return [SENSOR_X, heightM - DESK.topThickness - BOX[1] / 2, SENSOR_Z];
}

/**
 * Waypoints from the sensor's back connector to the monitor port: under the
 * top to the back edge, around it, along the back edge on the desktop to the
 * monitor's right side, then straight up that side into the port. It lies on
 * surfaces the whole way; nothing arcs through the air.
 */
export function cablePath(heightM: number, port: Vec3): Vec3[] {
  const underside = heightM - DESK.topThickness;
  const back = -DESK.depth / 2;
  const onTop = heightM + 0.004;
  const sideX = port[0] + 0.006;
  return [
    [SENSOR_X - 0.01, underside - 0.014, SENSOR_Z - BOX[2] / 2 - 0.012],
    [SENSOR_X - 0.03, underside - 0.008, back + 0.02],
    [SENSOR_X - 0.05, underside + 0.012, back - 0.018],
    [SENSOR_X - 0.08, onTop, back + 0.025],
    [sideX + 0.03, onTop, back + 0.03],
    [sideX, onTop + 0.01, port[2] - 0.04],
    [sideX, port[1] - 0.06, port[2] - 0.01],
    [sideX, port[1] - 0.015, port[2]],
    [port[0] + 0.024, port[1], port[2]],
  ];
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
  /** where the cable ends: the monitor's side port */
  port: Vec3;
  breathe: boolean;
  /** insets skip the beam and its floor dot */
  withBeam?: boolean;
  /** the lab spike draws its own cable variants; default true */
  withCable?: boolean;
}

export function Sensor({ heightM, palette, port, breathe, withBeam = true, withCable = true }: SensorProps) {
  const [, boxY] = sensorCenter(heightM);
  const beamTop = boxY - BOX[1] / 2;
  const beamLen = beamTop - DOT_Y;
  const opacity = useBreath(breathe && withBeam);
  const cable = useMemo(() => cablePath(heightM, port), [heightM, port]);

  return (
    <group>
      <group position={[SENSOR_X, boxY, SENSOR_Z]}>
        <Block size={BOX} color={palette.pcb} />
        {/* copper pads on the two faces the camera sees: the "honest PCB" detail */}
        <Block size={[0.004, 0.016, 0.03]} position={[BOX[0] / 2 + 0.001, 0, 0]} color={palette.copper} castShadow={false} />
        <Block size={[0.04, 0.016, 0.004]} position={[0, 0, BOX[2] / 2 + 0.001]} color={palette.copper} castShadow={false} />
        {/* the lens on the underside, where the beam leaves */}
        <Block size={[0.012, 0.003, 0.012]} position={[0, -BOX[1] / 2 - 0.001, 0]} color={palette.ink} castShadow={false} />
        {/* USB-C connector on the back face */}
        <Block size={[0.012, 0.007, 0.014]} position={[-0.01, 0, -BOX[2] / 2 - 0.006]} color={palette.fabric} />
      </group>
      {withBeam && (
        <>
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
        </>
      )}
      {withCable && <Cable points={cable} color={palette.ink} />}
    </group>
  );
}
