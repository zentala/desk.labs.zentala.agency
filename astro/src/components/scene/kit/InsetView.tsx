/**
 * Scene kit — a magnified inset: the same objects seen by another camera
 * (DESIGN.md §8.10). A drei `<View>` tracking a circular DOM element, with its
 * own narrow lens, the shared light rig and whatever the scene puts inside.
 */
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import type { ScenePalette } from "../scenePalette";
import type { Vec3 } from "./Block";
import { LightRig } from "./World";

function InsetLens({ position, target, fov, track }: { position: Vec3; target: Vec3; fov: number; track: RefObject<HTMLElement | null> }) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const { size, invalidate } = useThree();
  useEffect(() => {
    const c = cam.current;
    if (!c) return;
    c.position.set(...position);
    c.lookAt(new THREE.Vector3(...target));
    c.aspect = size.width / size.height;
    c.fov = fov;
    c.updateProjectionMatrix();
    invalidate();
  }, [position, target, fov, size, invalidate]);
  // re-aim every rendered frame: the portal's first frames can run before the effect above
  useFrame(() => {
    const c = cam.current;
    if (!c) return;
    const rect = track.current?.getBoundingClientRect();
    if (rect && rect.height > 0) {
      const aspect = rect.width / rect.height;
      if (Math.abs(c.aspect - aspect) > 0.001) {
        c.aspect = aspect;
        c.updateProjectionMatrix();
      }
    }
    c.position.set(...position);
    c.lookAt(target[0], target[1], target[2]);
  });
  return <PerspectiveCamera ref={cam} makeDefault fov={fov} near={0.02} far={20} />;
}

export interface InsetViewProps {
  track: RefObject<HTMLElement | null>;
  visible: boolean;
  /** render order among views; the main view is 1 */
  index: number;
  palette: ScenePalette;
  position: Vec3;
  target: Vec3;
  fov: number;
  children: ReactNode;
}

export function InsetView({ track, visible, index, palette, position, target, fov, children }: InsetViewProps) {
  return (
    <View track={track as RefObject<HTMLElement>} visible={visible} index={index}>
      <LightRig palette={palette} />
      {/* a little extra sky: insets look at undersides and side faces the key never reaches */}
      <hemisphereLight intensity={0.5} />
      <InsetLens position={position} target={target} fov={fov} track={track} />
      {children}
    </View>
  );
}
