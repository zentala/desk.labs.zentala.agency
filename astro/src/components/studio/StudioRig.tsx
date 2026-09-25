/**
 * Studio — the camera: a fixed lens plus free orbit (also from below), the
 * kit's pointer parallax for comparison, and a screenshot hook.
 */
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAMERA } from "../scene/kit";
import type { StudioSettings } from "./settings";

/** Fixed lens + optional orbit. `resetTick` re-aims the camera at the kit's viewpoint. */
export function StudioRig({ settings, resetTick }: { settings: StudioSettings; resetTick: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const { pointer, invalidate } = useThree();

  useEffect(() => {
    const c = cam.current;
    if (!c) return;
    c.position.set(CAMERA.position[0], settings.camHeight, CAMERA.position[2]);
    c.fov = settings.fov;
    c.updateProjectionMatrix();
    if (controls.current) {
      controls.current.target.set(...CAMERA.target);
      controls.current.update();
    } else {
      c.lookAt(new THREE.Vector3(...CAMERA.target));
    }
    invalidate();
  }, [resetTick, settings.camHeight, settings.fov, settings.orbit, invalidate]);

  // screenshot hook: aim the orbit camera at an arbitrary close-up (studio page only)
  useEffect(() => {
    const w = window as unknown as { __studio?: Record<string, unknown> };
    const hook = (w.__studio ??= {});
    hook.look = (position: [number, number, number], target: [number, number, number]) => {
      cam.current?.position.set(...position);
      controls.current?.target.set(...target);
      controls.current?.update();
      invalidate();
    };
  });

  // the kit's pointer parallax, reproduced here so it can be switched against orbit/frameloop
  useEffect(() => {
    if (!settings.parallax) return;
    let raf = 0;
    const tick = () => {
      const c = cam.current;
      if (c && !settings.orbit) {
        const target = new THREE.Vector3(...CAMERA.target);
        const base = new THREE.Vector3(CAMERA.position[0], settings.camHeight, CAMERA.position[2]);
        const yaw = THREE.MathUtils.degToRad(CAMERA.parallaxDeg) * -pointer.x;
        const offset = base.sub(target).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        c.position.copy(target).add(offset);
        c.lookAt(target);
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [settings.parallax, settings.orbit, settings.camHeight, pointer, invalidate]);

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={settings.fov} near={0.05} far={30} position={[CAMERA.position[0], settings.camHeight, CAMERA.position[2]]} />
      {settings.orbit && <OrbitControls ref={controls} makeDefault target={CAMERA.target} enableDamping={false} minDistance={0.4} maxDistance={8} />}
    </>
  );
}
