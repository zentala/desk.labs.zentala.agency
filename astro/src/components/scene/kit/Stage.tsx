/**
 * Scene kit — the world every scene stands in (DESIGN.md §8.3, §8.4).
 *
 * `Stage` = Canvas with the kit renderer settings + `LightRig` + `Slab` +
 * contact shadows + `Lens` (constant horizontal fov, pointer parallax).
 * Scenes render their objects as children and never add lights or cameras.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { ScenePalette } from "../scenePalette";
import { Block } from "./Block";
import { CAMERA, LIGHT, STAGE } from "./style";

function LightRig({ palette }: { palette: ScenePalette }) {
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
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-1.5}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
    </>
  );
}

/** Floor island: a bevelled slab plus a thinner rug on top. Top surface is y = 0. */
function Slab({ palette }: { palette: ScenePalette }) {
  return (
    <group>
      <Block
        size={[STAGE.width, STAGE.thickness, STAGE.depth]}
        position={[0, -STAGE.thickness / 2, STAGE.centerZ]}
        color={palette.slab}
        castShadow={false}
      />
      <Block
        size={[STAGE.rug.width, STAGE.rug.thickness, STAGE.rug.depth]}
        position={[0.05, STAGE.rug.thickness / 2 - 0.001, STAGE.centerZ + 0.05]}
        color={palette.rug}
        castShadow={false}
      />
      <ContactShadows
        position={[0, STAGE.rug.thickness + 0.002, STAGE.centerZ]}
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
function Lens({ parallax, lift }: { parallax: boolean; lift: number }) {
  const { camera, size, pointer, gl, invalidate } = useThree();
  const target = useRef(new THREE.Vector3(...CAMERA.target));
  const base = useRef(new THREE.Vector3(...CAMERA.position));
  target.current.y = CAMERA.target[1] + CAMERA.maxLift * Math.min(1, Math.max(0, lift));

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const distance = base.current.distanceTo(target.current);
    const byHeight = 2 * Math.atan(CAMERA.frame.height / 2 / distance);
    const byWidth = 2 * Math.atan(CAMERA.frame.width / 2 / distance / aspect);
    cam.fov = THREE.MathUtils.radToDeg(Math.max(byHeight, byWidth));
    cam.aspect = aspect;
    cam.updateProjectionMatrix();
    cam.position.copy(base.current);
    cam.lookAt(target.current);
  }, [camera, size, lift]);

  useEffect(() => {
    if (!parallax) return;
    const el = gl.domElement;
    const poke = () => invalidate();
    el.addEventListener("pointermove", poke);
    return () => el.removeEventListener("pointermove", poke);
  }, [parallax, gl, invalidate]);

  useFrame(() => {
    if (!parallax) return;
    const yaw = THREE.MathUtils.degToRad(CAMERA.parallaxDeg) * -pointer.x;
    const pitch = THREE.MathUtils.degToRad(CAMERA.parallaxDeg * 0.4) * -pointer.y;
    const offset = base.current.clone().sub(target.current);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const right = new THREE.Vector3().crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
    offset.applyAxisAngle(right, pitch);
    camera.position.copy(target.current).add(offset);
    camera.lookAt(target.current);
  });
  return null;
}

export interface StageProps {
  palette: ScenePalette;
  /** pointer parallax; off for touch and reduced motion */
  parallax?: boolean;
  /** 0..1 camera target lift (§8.4), e.g. follows the person standing up */
  lift?: number;
  /** kept "demand": scenes call `invalidate()` when something changes */
  children: ReactNode;
}

export function Stage({ palette, parallax = true, lift = 0, children }: StageProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{ position: CAMERA.position, fov: 34, near: 0.1, far: 30 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: LIGHT.exposure,
      }}
      style={{ background: "transparent" }}
    >
      <LightRig palette={palette} />
      <Slab palette={palette} />
      <Lens parallax={parallax} lift={lift} />
      {children}
    </Canvas>
  );
}
