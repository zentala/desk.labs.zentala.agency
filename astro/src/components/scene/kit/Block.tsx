/**
 * Scene kit — the three primitives every scene is drawn with (DESIGN.md §8.1).
 *
 * `Block` bevelled box · `Rod` low-poly cylinder · `Cable` sagging tube.
 * All take a `finish`: "matte" (default), "ghost" (people), "glow" (the beam).
 * Bevel radius is one of `BEVEL.*`; there is no free radius prop on purpose.
 */
import { useMemo, type ReactNode } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BEVEL, GHOST_OPACITY, SEGMENTS } from "./style";

/**
 * "ghost" is drawn in two passes so overlapping limbs never double-blend:
 * `ghostDepth` writes depth only (after all opaque objects), then `ghost`
 * shades exactly the nearest ghost surface (`EqualDepth`).
 */
export type Finish = "matte" | "ghost" | "ghostDepth" | "glow";

/** Render order of the ghost depth pre-pass: after every opaque mesh. */
export const GHOST_DEPTH_ORDER = 1;
export type Vec3 = [number, number, number];

interface FinishProps {
  color: string;
  finish?: Finish;
}

/** Material element for a finish. Glow is unlit and skips tone mapping (§8.3). */
export function Surface({ color, finish = "matte" }: FinishProps) {
  if (finish === "glow") return <meshBasicMaterial color={color} toneMapped={false} />;
  if (finish === "ghostDepth") return <meshBasicMaterial colorWrite={false} />;
  if (finish === "ghost") {
    return (
      <meshLambertMaterial
        color={color}
        flatShading
        transparent
        opacity={GHOST_OPACITY}
        depthWrite={false}
        depthFunc={THREE.EqualDepth}
      />
    );
  }
  return <meshLambertMaterial color={color} flatShading />;
}

interface BlockProps extends FinishProps {
  /** width, height, depth in metres */
  size: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  bevel?: keyof typeof BEVEL;
  castShadow?: boolean;
  receiveShadow?: boolean;
  renderOrder?: number;
  children?: ReactNode;
}

/** Bevelled box. The radius is clamped so tiny parts never invert. */
export function Block({
  size,
  position,
  rotation,
  bevel = "furniture",
  color,
  finish,
  castShadow = true,
  receiveShadow = true,
  renderOrder,
  children,
}: BlockProps) {
  const radius = Math.min(BEVEL[bevel], Math.min(...size) * 0.45);
  return (
    <RoundedBox
      args={size}
      radius={radius}
      bevelSegments={SEGMENTS.bevel}
      creaseAngle={0.4}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      renderOrder={renderOrder}
    >
      <Surface color={color} finish={finish} />
      {children}
    </RoundedBox>
  );
}

interface RodProps extends FinishProps {
  radius: number;
  /** top radius, defaults to `radius` */
  radiusTop?: number;
  length: number;
  position?: Vec3;
  rotation?: Vec3;
  castShadow?: boolean;
}

/** Low-poly cylinder along local Y. */
export function Rod({ radius, radiusTop, length, position, rotation, color, finish, castShadow = true }: RodProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow>
      <cylinderGeometry args={[radiusTop ?? radius, radius, length, SEGMENTS.rod]} />
      <Surface color={color} finish={finish} />
    </mesh>
  );
}

interface CableProps extends FinishProps {
  /** waypoints in scene space; the curve is smoothed through them */
  points: Vec3[];
  radius?: number;
}

/** A thin cable routed through waypoints (Catmull-Rom), e.g. sensor → monitor. */
export function Cable({ points, radius = 0.0028, color, finish }: CableProps) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, Math.max(12, points.length * 8), radius, 6, false);
  }, [points, radius]);
  return (
    <mesh geometry={geometry} castShadow>
      <Surface color={color} finish={finish} />
    </mesh>
  );
}
