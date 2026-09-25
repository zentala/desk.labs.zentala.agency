/**
 * Studio — /lab/studio. A Leva panel drives `StudioSettings`; the canvas shows
 * the desk scene at story progress `u` (`beatAt`, the same function the
 * homepage scroll uses), with a player, a figure switcher, relax sliders and
 * render plugins. Plugins and figures are `lazy()` so each lands in its own
 * chunk; nothing on the public site imports this file.
 */
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import * as THREE from "three";
import { LIGHT, useScenePalette } from "../scene/kit";
import { beatAt } from "../scene/kit/timeline";
import { FIGURE_LABELS, type StudioSettings } from "./settings";
import { StudioScene } from "./StudioScene";
import { StudioRig } from "./StudioRig";
import { studioSchema } from "./studioControls";
import { useTimelinePlayer } from "./useTimelinePlayer";

const Perf = lazy(() => import("./plugins/PerfPlugin"));
const AmbientOcclusion = lazy(() => import("../scene/SceneAO"));
const SoftShadowsPlugin = lazy(() => import("./plugins/SoftShadowsPlugin"));

type Setter = (patch: Partial<StudioSettings & { beat: string }>) => void;

export default function StudioLab() {
  const palette = useScenePalette();
  const [resetTick, setResetTick] = useState(0);
  const resetView = useCallback(() => setResetTick((n) => n + 1), []);
  // Leva's button callbacks are created once; they reach the setter through this holder
  const [jump] = useState(() => ({ to: (_u: number) => {} }));

  const [settings, set] = useControls(() => studioSchema({ resetView, jumpTo: (u) => jump.to(u) })) as unknown as [
    StudioSettings & { beat: string },
    Setter,
  ];
  jump.to = (u) => set({ u, playing: false });

  const frame = useMemo(() => beatAt(settings.u), [settings.u]);
  const beatLabel = `${frame.beat.index} ${frame.beat.name} · ${frame.clock}`;
  useEffect(() => {
    if (settings.beat !== beatLabel) set({ beat: beatLabel });
  }, [beatLabel, settings.beat, set]);
  useTimelinePlayer(settings, set);

  // the screenshot script drives the panel through this hook (studio page only)
  useEffect(() => {
    const w = window as unknown as { __studio?: Record<string, unknown> };
    w.__studio = { ...(w.__studio ?? {}), set, reset: resetView };
  }, [set, resetView]);

  return (
    <div data-studio-root style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div data-studio-canvas style={{ position: "relative", aspectRatio: "1.25", borderRadius: 24, overflow: "hidden", background: "var(--color-bg)" }}>
          <Canvas
            frameloop={settings.frameloop}
            dpr={[1, 2]}
            shadows="percentage"
            gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: LIGHT.exposure }}
            style={{ position: "absolute", inset: 0 }}
          >
            <StudioRig settings={settings} resetTick={resetTick} />
            <Suspense fallback={null}>
              <StudioScene settings={settings} frame={frame} palette={palette} />
              {settings.perf && <Perf />}
              {settings.n8ao && <AmbientOcclusion />}
              {settings.softShadows && <SoftShadowsPlugin />}
            </Suspense>
          </Canvas>
        </div>
        <p data-studio-status style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 8 }}>
          u {settings.u.toFixed(3)} · beat {beatLabel} · {frame.timer} · figure: {FIGURE_LABELS[settings.figure]} ·{" "}
          {settings.ourStyle ? "our style" : "original"} · frameloop {settings.frameloop}
        </p>
      </div>
      <div data-studio-panel style={{ flex: "0 0 320px", position: "sticky", top: 16 }}>
        <Leva fill flat titleBar={{ title: "studio", filter: false, drag: false }} collapsed={false} />
      </div>
    </div>
  );
}
