/**
 * Scene kit — the primitives every scene is drawn with (DESIGN.md §8.1).
 *
 * `Block` sharp box · `Rod` low-poly cylinder · `Blob` faceted ellipsoid ·
 * `Capsule` faceted capsule · `Cable` smooth tube. No bevels anywhere: an
 * edge is an edge. Round things are faceted unless `smooth` is set (the
 * smooth figure, §8.5). Finishes: "matte" (default, flat), "matteSmooth",
 * "satin" (the few parts that catch the studio), "ghost", "glow" (the beam).
 */
import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { GHOST_OPACITY, SEGMENTS } from "./style";

/**
 * "ghost" is drawn in two passes so overlapping limbs never double-blend:
 * `ghostDepth` writes depth only (after all opaque objects), then `ghost`
 * shades exactly the nearest ghost surface (`EqualDepth`).
 */
export type Finish = "matte" | "matteSmooth" | "satin" | "ghost" | "ghostDepth" | "glow";

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
  if (finish === "satin") return <meshStandardMaterial color={color} flatShading roughness={0.55} metalness={0.05} />;
  if (finish === "matteSmooth") return <meshLambertMaterial color={color} />;
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
  /** smooth sphere instead of a faceted icosahedron (the smooth figure only) */
  smooth?: boolean;
}

/** Faceted ellipsoid: an icosahedron stretched to `size` (or a smooth sphere when `smooth`). */
export function Blob({ size, detail = 1, smooth = false, position, rotation, color, finish, castShadow = true, receiveShadow = true, renderOrder }: BlobProps) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={[size[0] / 2, size[1] / 2, size[2] / 2]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      renderOrder={renderOrder}
    >
      {smooth ? <sphereGeometry args={[1, SEGMENTS.smoothSphere, SEGMENTS.smoothSphere / 2]} /> : <icosahedronGeometry args={[1, detail]} />}
      <Surface color={color} finish={finish ?? (smooth ? "matteSmooth" : "matte")} />
    </mesh>
  );
}

interface CapsuleProps extends PlacedProps {
  radius: number;
  /** straight length between the hemisphere centres; total = length + 2 × radius */
  length: number;
  smooth?: boolean;
}

/** Faceted capsule along local Y (smooth when `smooth`). */
export function Capsule({ radius, length, smooth = false, position, rotation, color, finish, castShadow = true, receiveShadow = true, renderOrder }: CapsuleProps) {
  const [cap, radial] = smooth ? [SEGMENTS.smoothCapsuleCap, SEGMENTS.smoothCapsuleRadial] : [SEGMENTS.capsuleCap, SEGMENTS.capsuleRadial];
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow} renderOrder={renderOrder}>
      <capsuleGeometry args={[radius, length, cap, radial]} />
      <Surface color={color} finish={finish ?? (smooth ? "matteSmooth" : "matte")} />
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

/** A thin smooth cable routed through waypoints (Catmull-Rom), e.g. sensor → monitor port. */
export function Cable({ points, radius = 0.0028, color, finish = "matteSmooth" }: CableProps) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 8, false);
  }, [points, radius]);
  return (
    <mesh geometry={geometry} castShadow>
      <Surface color={color} finish={finish} />
    </mesh>
  );
}
