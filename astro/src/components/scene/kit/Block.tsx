/**
 * Scene kit — the primitives every scene is drawn with (DESIGN.md §8.1).
 *
 * `Block` sharp box · `Rod` low-poly cylinder · `Blob` faceted ellipsoid ·
 * `Capsule` faceted capsule · `Cable` sagging tube. No bevels anywhere: an
 * edge is an edge (owner decision W3-T6). Round things are faceted spheres.
 * All take a `finish`: "matte" (default), "ghost" (people), "glow" (the beam).
 */
import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { GHOST_OPACITY, SEGMENTS } from "./style";


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

interface PlacedProps extends FinishProps {
  position?: Vec3;
  rotation?: Vec3;
  castShadow?: boolean;
  receiveShadow?: boolean;
  renderOrder?: number;
  children?: ReactNode;
}

interface BlockProps extends PlacedProps {
  /** width, height, depth in metres */
  size: Vec3;
}

/** Sharp box. */
export function Block({ size, position, rotation, color, finish, castShadow = true, receiveShadow = true, renderOrder, children }: BlockProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow} renderOrder={renderOrder}>
      <boxGeometry args={size} />
      <Surface color={color} finish={finish} />
      {children}
    </mesh>
  );
}

interface BlobProps extends PlacedProps {
  /** full diameters in metres (x, y, z): a sphere when equal, an ellipsoid otherwise */
  size: Vec3;
  /** icosahedron detail: 1 (80 faces) for limbs, 2 (320) for a head */
  detail?: 1 | 2;
}

/** Faceted ellipsoid: an icosahedron stretched to `size`. */
export function Blob({ size, detail = 1, position, rotation, color, finish, castShadow = true, receiveShadow = true, renderOrder }: BlobProps) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={[size[0] / 2, size[1] / 2, size[2] / 2]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      renderOrder={renderOrder}
    >
      <icosahedronGeometry args={[1, detail]} />
      <Surface color={color} finish={finish} />
    </mesh>
  );
}

interface CapsuleProps extends PlacedProps {
  radius: number;
  /** straight length between the hemisphere centres; total = length + 2 × radius */
  length: number;
}

/** Faceted capsule along local Y. */
export function Capsule({ radius, length, position, rotation, color, finish, castShadow = true, receiveShadow = true, renderOrder }: CapsuleProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow} renderOrder={renderOrder}>
      <capsuleGeometry args={[radius, length, SEGMENTS.capsuleCap, SEGMENTS.capsuleRadial]} />
      <Surface color={color} finish={finish} />
    </mesh>
  );
}

interface RodProps extends PlacedProps {
  radius: number;
  /** top radius, defaults to `radius` */
  radiusTop?: number;
  length: number;
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
