/**
 * Scene kit — the world every scene stands in (DESIGN.md §8.3, §8.4).
 *
 * `World` = the light rig (key, fill, rim, low sky), the slab with contact
 * shadows, and the `Lens`: a
 * `makeDefault` camera that fits `CAMERA.frame` in every aspect ratio and adds
 * a pointer parallax. Rendered inside a drei `<View>`; scenes add objects only.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { ScenePalette } from "../scenePalette";
import { Block } from "./Block";
import { CAMERA, LIGHT, STAGE } from "./style";

/** Key + fill + rim + sky. Only the key casts. */
export function LightRig({ palette }: { palette: ScenePalette }) {
  return (
    <>
      <hemisphereLight color={LIGHT.skyColor} groundColor={palette.line} intensity={LIGHT.hemisphereIntensity} />
      <directionalLight
        position={LIGHT.keyPosition}
        intensity={LIGHT.keyIntensity}
        color={LIGHT.keyColor}
        castShadow
        shadow-mapSize-width={LIGHT.shadowMapSize}
        shadow-mapSize-height={LIGHT.shadowMapSize}
        shadow-bias={LIGHT.shadowBias}
        shadow-normalBias={LIGHT.shadowNormalBias}
        shadow-radius={LIGHT.shadowRadius}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-1.5}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      <directionalLight position={LIGHT.fillPosition} intensity={LIGHT.fillIntensity} color={LIGHT.fillColor} />
      <directionalLight position={LIGHT.rimPosition} intensity={LIGHT.rimIntensity} color={LIGHT.rimColor} />
    </>
  );
}

/** Floor island: a sharp slab plus a thinner rug on top. Top surface is y = 0. */
export function Slab({ palette }: { palette: ScenePalette }) {
  return (
    <group>
      <Block
        size={[STAGE.width, STAGE.thickness, STAGE.depth]}
        position={[STAGE.centerX, -STAGE.thickness / 2, STAGE.centerZ]}
        color={palette.slab}
        castShadow={false}
      />
      <Block
        size={[STAGE.rug.width, STAGE.rug.thickness, STAGE.rug.depth]}
        position={[STAGE.centerX + 0.2, STAGE.rug.thickness / 2 - 0.001, STAGE.centerZ + 0.05]}
        color={palette.rug}
        castShadow={false}
      />
      <ContactShadows
        position={[STAGE.centerX, STAGE.rug.thickness + 0.002, STAGE.centerZ]}
        opacity={LIGHT.contactOpacity}
        blur={LIGHT.contactBlur}
        far={LIGHT.contactFar}
        resolution={LIGHT.contactResolution}
        scale={[STAGE.width, STAGE.depth]}
        color={palette.ink}
      />
    </group>
  );
}

/** Fits `CAMERA.frame` at the target in every aspect ratio and adds a ±4° pointer parallax. */
export function Lens({ parallax, lift, portrait }: { parallax: boolean; lift: number; portrait: boolean }) {
  const { size, invalidate } = useThree();
  const cam = useRef<THREE.PerspectiveCamera>(null);
  // Viewport-normalised pointer, not R3F's: drei's View recomputes `pointer` from the tracked
  // element's LAST-frame rect, so while the page scrolls under a still mouse (Chrome fires
  // synthetic moves) the pitch flipped between two values every frame and the camera, the
  // callout anchors and their rings shook by ~25 px (scripts/check-scroll-jitter.mjs).
  const viewPointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!parallax) return;
    const onMove = (e: PointerEvent) => {
      viewPointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      viewPointer.current.y = 1 - (e.clientY / window.innerHeight) * 2;
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [parallax, invalidate]);
  const target = useRef(new THREE.Vector3(...CAMERA.target));
  const base = useRef(new THREE.Vector3(...CAMERA.position));
  target.current.y = CAMERA.target[1] + CAMERA.maxLift * Math.min(1, Math.max(0, lift));
  // portrait: shift the target right so the chair's backrest clears the left edge (review C2)
  target.current.x = CAMERA.target[0] + (portrait ? 0.1 : 0);

  useEffect(() => {
    const c = cam.current;
    if (!c) return;
    const aspect = size.width / size.height;
    const distance = base.current.distanceTo(target.current);
    const byHeight = 2 * Math.atan(CAMERA.frame.height / 2 / distance);
    const byWidth = 2 * Math.atan(CAMERA.frame.width / 2 / distance / aspect);
    c.fov = THREE.MathUtils.radToDeg(Math.max(byHeight, byWidth));
    c.aspect = aspect;
    c.updateProjectionMatrix();
    c.position.copy(base.current);
    c.lookAt(target.current);
    invalidate();
  }, [size, lift, portrait, invalidate]);

  useFrame(() => {
    const c = cam.current;
    if (!c) return;
    if (size.width > 0 && Math.abs(c.aspect - size.width / size.height) > 0.001) {
      c.aspect = size.width / size.height;
      c.updateProjectionMatrix();
    }
    if (!parallax) return;
    const yaw = THREE.MathUtils.degToRad(CAMERA.parallaxDeg) * -viewPointer.current.x;
    const pitch = THREE.MathUtils.degToRad(CAMERA.parallaxDeg * 0.4) * -viewPointer.current.y;
    const offset = base.current.clone().sub(target.current);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const right = new THREE.Vector3().crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
    offset.applyAxisAngle(right, pitch);
    c.position.copy(target.current).add(offset);
    c.lookAt(target.current);
  });

  return <PerspectiveCamera ref={cam} makeDefault position={CAMERA.position} fov={34} near={0.1} far={30} />;
}

export interface WorldProps {
  palette: ScenePalette;
  /** pointer parallax; off for touch and reduced motion */
  parallax?: boolean;
  /** 0..1 camera target lift (§8.4), e.g. follows the person standing up */
  lift?: number;
  /** narrow (4:5) frame */
  portrait?: boolean;
  children: ReactNode;
}

export function World({ palette, parallax = true, lift = 0, portrait = false, children }: WorldProps) {
  return (
    <>
      <LightRig palette={palette} />
      <Slab palette={palette} />
      <Lens parallax={parallax} lift={lift} portrait={portrait} />
      {children}
    </>
  );
}
