/**
 * Spike — /lab/spike. A Leva panel drives `SpikeSettings`; the canvas shows
 * the desk with a switchable figure, cable model and render plugins. Plugins
 * are `lazy()` so each one lands in its own chunk and its cost is readable
 * from the build output. Nothing on the site imports this file.
 */
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Leva, button, folder, useControls } from "leva";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAMERA, LIGHT, useScenePalette } from "../scene/kit";
import { DEFAULTS, FIGURE_LABELS, type SpikeSettings } from "./settings";
import { SpikeScene } from "./SpikeScene";

const Perf = lazy(() => import("./plugins/PerfPlugin"));
const AmbientOcclusion = lazy(() => import("./plugins/N8aoPlugin"));
const SoftShadowsPlugin = lazy(() => import("./plugins/SoftShadowsPlugin"));

/** Fixed lens + optional orbit. `resetTick` re-aims the camera at the kit's viewpoint. */
function Rig({ settings, resetTick }: { settings: SpikeSettings; resetTick: number }) {
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

  // screenshot hook: aim the orbit camera at an arbitrary close-up (spike page only)
  useEffect(() => {
    const hook = (window as unknown as { __spike?: Record<string, unknown> }).__spike;
    if (!hook) return;
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

export default function SpikeLab() {
  const palette = useScenePalette();
  const [resetTick, setResetTick] = useState(0);

  const [settings, set] = useControls(() => ({
    camera: folder({
      camHeight: { value: DEFAULTS.camHeight, min: -0.5, max: 4, step: 0.01, label: "height (m)" },
      fov: { value: DEFAULTS.fov, min: 15, max: 80, step: 1 },
      orbit: { value: DEFAULTS.orbit, label: "orbit controls" },
      parallax: { value: DEFAULTS.parallax, label: "pointer parallax" },
      frameloop: { value: DEFAULTS.frameloop, options: ["always", "demand"] },
      "reset view": button(() => setResetTick((n) => n + 1)),
    }),
    light: folder({
      keyIntensity: { value: DEFAULTS.keyIntensity, min: 0, max: 4, step: 0.05, label: "key" },
      fillIntensity: { value: DEFAULTS.fillIntensity, min: 0, max: 2, step: 0.05, label: "fill" },
      rimIntensity: { value: DEFAULTS.rimIntensity, min: 0, max: 3, step: 0.05, label: "rim" },
      shadowOpacity: { value: DEFAULTS.shadowOpacity, min: 0, max: 1, step: 0.01, label: "shadow opacity" },
    }),
    desk: folder({
      deskT: { value: DEFAULTS.deskT, min: 0, max: 1, step: 0.01, label: "height (0 sit → 1 stand)" },
      sensorColor: { value: DEFAULTS.sensorColor, label: "sensor colour" },
    }),
    figure: folder({
      figure: { value: DEFAULTS.figure, options: Object.fromEntries(Object.entries(FIGURE_LABELS).map(([k, v]) => [v, k])) },
      ourStyle: { value: DEFAULTS.ourStyle, label: "our style (restyled)" },
      action: { value: DEFAULTS.action, options: ["sit", "stand", "walk"] },
      shoulderWidth: { value: DEFAULTS.shoulderWidth, min: 0.26, max: 0.5, step: 0.005, label: "shoulder width" },
      legThickness: { value: DEFAULTS.legThickness, min: 0.04, max: 0.12, step: 0.0025, label: "leg thickness" },
      waist: { value: DEFAULTS.waist, min: 0.06, max: 0.16, step: 0.0025 },
    }),
    cable: folder({
      cable: { value: DEFAULTS.cable, options: { "A: Catmull-Rom (current)": "catmull", "B: catenary sag": "catenary", "C: rapier rope": "rope" } },
      cableSag: { value: DEFAULTS.cableSag, min: 0, max: 0.4, step: 0.005, label: "sag (m)" },
    }),
    plugins: folder({
      perf: { value: DEFAULTS.perf, label: "r3f-perf" },
      n8ao: { value: DEFAULTS.n8ao, label: "N8AO (postprocessing)" },
      outlines: { value: DEFAULTS.outlines, label: "drei Outlines (figure)" },
      softShadows: { value: DEFAULTS.softShadows, label: "drei SoftShadows" },
    }),
  })) as unknown as [SpikeSettings, (patch: Partial<SpikeSettings>) => void];

  // the screenshot script drives the panel through this hook (spike page only)
  useEffect(() => {
    (window as unknown as { __spike?: unknown }).__spike = { set, reset: () => setResetTick((n) => n + 1) };
  }, [set]);

  return (
    <div data-spike-root style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
      <div data-spike-canvas style={{ position: "relative", aspectRatio: "1.25", borderRadius: 24, overflow: "hidden", background: "var(--color-bg)" }}>
        <Canvas
          frameloop={settings.frameloop}
          dpr={[1, 2]}
          shadows="percentage"
          gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: LIGHT.exposure }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Rig settings={settings} resetTick={resetTick} />
          <Suspense fallback={null}>
            <SpikeScene settings={settings} palette={palette} />
            {settings.perf && <Perf />}
            {settings.n8ao && <AmbientOcclusion />}
            {settings.softShadows && <SoftShadowsPlugin />}
          </Suspense>
        </Canvas>
      </div>
      <p data-spike-status style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 8 }}>
        figure: {FIGURE_LABELS[settings.figure]} · {settings.ourStyle ? "our style" : "original"} · {settings.action} · cable {settings.cable} · frameloop {settings.frameloop}
      </p>
      </div>
      <div data-spike-panel style={{ flex: "0 0 300px", position: "sticky", top: 16 }}>
        <Leva fill flat titleBar={{ title: "spike", filter: false, drag: false }} collapsed={false} />
      </div>
    </div>
  );
}
