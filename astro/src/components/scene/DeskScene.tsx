import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import type { DeskState } from "./scenePalette";
import {
  SceneCanvas,
  World,
  InsetView,
  Person,
  SITTING,
  STANDING,
  blendPose,
  prefersReducedMotion,
  useScenePalette,
  useScrollProgress,
  scrollToProgress,
  type FigureStyle,
  type Vec3,
} from "./kit";
import { Desk } from "./desk/Desk";
import { Sensor, sensorCenter } from "./desk/Sensor";
import { Monitor, monitorPort } from "./desk/Monitor";
import { Chair, type ChairStyle } from "./desk/Chair";
import { DeskProps } from "./desk/Props";
import { deskHeight, deskHeightCm } from "./desk/dims";
import { Projector, type ProjectedAnchors } from "./callouts/Projector";
import { Callouts, type TrackRefs } from "./callouts/Callouts";
import { useTween, useDirection, useElementSize } from "./desk/hooks";

/**
 * DeskScene v5 — hero scene of the family (DESIGN.md §8), drawn with the kit.
 *
 * One number drives everything: `t` (0 = sitting, 1 = standing). The desk
 * height, the person's pose, the chair, the screen readout and the toast all
 * derive from it. `t` comes from the buttons (600 ms tween) or, in `scroll`
 * mode, from the page scroll through a tall wrapper. One shared canvas holds
 * three drei Views: the hero and two callout insets that are the same objects
 * seen by other cameras. Reduced motion: no tween, no parallax, no scroll drive.
 */

const SCROLL_TRAVEL_VH = 240;
/** scroll mode: the desk is seated for the first 12 % and fully up by 85 % of the travel */
const SCROLL_WINDOW: [number, number] = [0.12, 0.85];
/** |t| within this of an end is "settled": toast and callouts show */
const SETTLE_EPS = 0.02;

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function hasCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/** Settled state at the ends; the travel direction names the transitional state. */
function stateFor(t: number, direction: 1 | -1): DeskState {
  if (t <= SETTLE_EPS) return "sitting";
  if (t >= 1 - SETTLE_EPS) return "standing";
  return direction > 0 ? "rising" : "lowering";
}

type Parts = "all" | "sensor" | "monitor";

interface SceneContentProps {
  t: number;
  state: DeskState;
  breathe: boolean;
  parts: Parts;
  chairStyle: ChairStyle;
  figureStyle: FigureStyle;
  onProject?: (points: ProjectedAnchors) => void;
}

/** The objects, derived from `t`. Insets ask for a subset. */
function SceneContent({ t, state, breathe, parts, chairStyle, figureStyle, onProject }: SceneContentProps) {
  const palette = useScenePalette();
  const { invalidate } = useThree();
  useEffect(() => invalidate(), [t, palette, invalidate]);

  const heightM = deskHeight(t);
  const heightCm = deskHeightCm(t);
  const port = monitorPort(heightM);
  const pose = blendPose(SITTING, STANDING, smoothstep(t));

  return (
    <>
      <Desk heightM={heightM} palette={palette} />
      <Sensor heightM={heightM} palette={palette} port={port} breathe={breathe} withBeam={parts !== "monitor"} />
      {parts !== "sensor" && (
        <Monitor heightM={heightM} state={state} heightCm={heightCm} palette={palette} screenPixels={parts === "all" ? undefined : 1024} />
      )}
      {parts !== "sensor" && <DeskProps heightM={heightM} palette={palette} />}
      {parts === "all" && <Chair t={smoothstep(t)} palette={palette} chairStyle={chairStyle} />}
      {parts === "all" && <Person pose={pose} color={palette.figure} figureStyle={figureStyle} />}
      {parts === "all" && onProject && (
        <Projector anchors={{ sensor: sensorCenter(heightM), cable: port }} onChange={onProject} />
      )}
    </>
  );
}

/** Inset cameras follow the desk: A looks at the sensor from below and behind, B at the port from the right. */
function insetCameras(heightM: number): { sensor: { position: Vec3; target: Vec3 }; cable: { position: Vec3; target: Vec3 } } {
  const s = sensorCenter(heightM);
  const p = monitorPort(heightM);
  return {
    sensor: { position: [s[0] + 0.26, s[1] - 0.3, s[2] - 0.42], target: [s[0] - 0.01, s[1], s[2]] },
    cable: { position: [p[0] + 0.62, p[1] + 0.3, p[2] + 0.5], target: [p[0] - 0.04, p[1] + 0.02, p[2] + 0.02] },
  };
}

export interface DeskSceneProps {
  initialState?: "sitting" | "standing";
  /** drive the desk from page scroll through a tall wrapper (off under reduced motion) */
  scroll?: boolean;
  /** loop sit/stand every 4 s; off under reduced motion */
  autoPlay?: boolean;
  /** zoom callouts: real views of the sensor and the cable */
  callouts?: boolean;
  chairStyle?: ChairStyle;
  figureStyle?: FigureStyle;
}

export default function DeskScene({
  initialState = "sitting",
  scroll = false,
  autoPlay = false,
  callouts = true,
  chairStyle = "sharp",
  figureStyle = "faceted",
}: DeskSceneProps) {
  const [reduced] = useState(prefersReducedMotion);
  const [coarse] = useState(hasCoarsePointer);
  const [narrow, setNarrow] = useState(false);
  const palette = useScenePalette();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const tracks: TrackRefs = { sensor: useRef<HTMLDivElement>(null), cable: useRef<HTMLDivElement>(null) };
  const mainSize = useElementSize(mainRef);
  const [anchors, setAnchors] = useState<ProjectedAnchors>({});
  const scrollMode = scroll && !reduced;
  const progress = useScrollProgress(wrapperRef, scrollMode);
  const [tweenT, go, setT] = useTween(reduced);

  useEffect(() => setT(initialState === "standing" ? 1 : 0), [initialState, setT]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!autoPlay || reduced || scrollMode) return;
    const id = window.setInterval(() => go(tweenT < 0.5 ? 1 : 0), 4000);
    return () => window.clearInterval(id);
  }, [autoPlay, reduced, scrollMode, go, tweenT]);

  const t = scrollMode
    ? Math.min(1, Math.max(0, (progress - SCROLL_WINDOW[0]) / (SCROLL_WINDOW[1] - SCROLL_WINDOW[0])))
    : tweenT;
  const direction = useDirection(t);
  const state = stateFor(t, direction);
  const settled = state === "sitting" || state === "standing";
  const cams = insetCameras(deskHeight(t));

  const setState = (next: "sitting" | "standing") => {
    const target = next === "standing" ? 1 : 0;
    if (scrollMode && wrapperRef.current) {
      scrollToProgress(wrapperRef.current, target === 1 ? SCROLL_WINDOW[1] + 0.03 : 0, true);
    } else {
      go(target);
    }
  };

  const buttonStyle = (active: boolean, fill: string): CSSProperties => ({
    padding: "10px 18px",
    borderRadius: 12,
    border: "1px solid var(--color-line)",
    background: active ? fill : "transparent",
    color: active ? palette.ink : "var(--color-ink)",
    fontWeight: 600,
    cursor: active ? "default" : "pointer",
  });

  const content = (parts: Parts, onProject?: (p: ProjectedAnchors) => void) => (
    <SceneContent t={t} state={state} breathe={!reduced} parts={parts} chairStyle={chairStyle} figureStyle={figureStyle} onProject={onProject} />
  );

  const figure = (
    <div
      ref={boxRef}
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        // CSS variable, not `palette.bg`: the island is server-rendered light and
        // React does not patch a hydration mismatch in inline styles.
        background: "var(--color-bg)",
        touchAction: "pan-y",
      }}
    >
      <div
        ref={mainRef}
        data-scene-figure
        role="img"
        aria-label={`Desk scene: ${state}, desk at ${deskHeightCm(t)} cm`}
        style={{ position: "relative", zIndex: 1, aspectRatio: narrow ? "4 / 5" : "16 / 10" }}
      >
        {callouts && !narrow && (
          <Callouts layout="overlay" visible={settled} anchors={anchors} width={mainSize.width} height={mainSize.height} tracks={tracks} />
        )}
      </div>
      {callouts && narrow && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <Callouts layout="list" visible={settled} anchors={anchors} width={0} height={0} tracks={tracks} />
        </div>
      )}
      <SceneCanvas eventSource={boxRef}>
        <View track={mainRef as RefObject<HTMLElement>} index={1}>
          <World palette={palette} parallax={!reduced && !coarse} lift={smoothstep(t)}>
            {content("all", setAnchors)}
          </World>
        </View>
        {callouts && (
          <InsetView track={tracks.sensor} visible={settled || narrow} index={2} palette={palette} fov={22} {...cams.sensor}>
            {content("sensor")}
          </InsetView>
        )}
        {callouts && (
          <InsetView track={tracks.cable} visible={settled || narrow} index={3} palette={palette} fov={18} {...cams.cable}>
            {content("monitor")}
          </InsetView>
        )}
      </SceneCanvas>
    </div>
  );

  const buttons = (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button type="button" className="focus-ring" onClick={() => setState("sitting")} disabled={state === "sitting"} style={buttonStyle(state === "sitting", palette.sitting)}>
        Sit down
      </button>
      <button type="button" className="focus-ring" onClick={() => setState("standing")} disabled={state === "standing"} style={buttonStyle(state === "standing", palette.standing)}>
        Stand up
      </button>
    </div>
  );

  if (!scrollMode) {
    return (
      <div>
        {figure}
        {buttons}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} data-scene-scroll style={{ height: `${SCROLL_TRAVEL_VH}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {figure}
        {buttons}
      </div>
    </div>
  );
}
