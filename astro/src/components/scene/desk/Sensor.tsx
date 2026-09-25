/**
 * Our sensor: a box in `material.sensor` on the UNDERSIDE of the desktop near the
 * back-right corner, lens facing down, clear line of sight to the floor.
 * One smooth cable leaves its back through a connector, runs under the top
 * to the back edge, around it, along the back edge and up the monitor's
 * right side into its USB-C port (W3-T8). The beam is the one glow.
 */
import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import type { ScenePalette } from "../scenePalette";
import { Block, Cable, Rod, MOTION, type Vec3 } from "../kit";
import { BOX, CABLE_RADIUS, SENSOR_X, SENSOR_Z, cablePath, sensorCenter } from "./sensorGeometry";

export { SENSOR_X, SENSOR_Z, CABLE_RADIUS, sensorCenter, cablePath } from "./sensorGeometry";

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
  /** where the cable ends: the monitor's side port */
  port: Vec3;
  breathe: boolean;
  /** insets skip the beam and its floor dot */
  withBeam?: boolean;
  /** the studio can hide the cable; default true */
  withCable?: boolean;
  /** tube radius; the studio's thickness slider, default `CABLE_RADIUS` */
  cableRadius?: number;
}

export function Sensor({ heightM, palette, port, breathe, withBeam = true, withCable = true, cableRadius = CABLE_RADIUS }: SensorProps) {
  const [, boxY] = sensorCenter(heightM);
  const beamTop = boxY - BOX[1] / 2;
  const beamLen = beamTop - DOT_Y;
  const opacity = useBreath(breathe && withBeam);
  const cable = useMemo(() => cablePath(heightM, port), [heightM, port]);

  return (
    <group>
      <group position={[SENSOR_X, boxY, SENSOR_Z]}>
        {/* plain enclosure: the copper pads read as a yellow sticker (owner, E005 studio) */}
        <Block size={BOX} color={palette.sensor} />
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
      {withCable && <Cable points={cable} radius={cableRadius} color={palette.ink} />}
    </group>
  );
}
