import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useThree } from "@react-three/fiber";
import type { DeskState } from "./scenePalette";
import {
  Stage,
  Person,
  SITTING,
  STANDING,
  blendPose,
  prefersReducedMotion,
  useScenePalette,
  useScrollProgress,
  scrollToProgress,
} from "./kit";
import { Desk } from "./desk/Desk";
import { Sensor, sensorAnchors } from "./desk/Sensor";
import { Monitor, MONITOR } from "./desk/Monitor";
import { Chair } from "./desk/Chair";
import { DeskProps } from "./desk/Props";
import { deskHeight, deskHeightCm } from "./desk/dims";
import { Projector, type ProjectedAnchors } from "./callouts/Projector";
import { Callouts } from "./callouts/Callouts";
import { useTween, useDirection, useElementSize } from "./desk/hooks";

/**
 * DeskScene v3 — hero scene of the family (DESIGN.md §8), drawn with the kit.
 *
 * One number drives everything: `t` (0 = sitting, 1 = standing). The desk
 * height, the person's pose, the chair, the screen readout and the toast all
 * derive from it. `t` comes from the buttons (600 ms tween) or, in `scroll`
 * mode, from the page scroll through a tall wrapper — the scroll IS the
 * stand-up moment. While the desk travels the screen says Rising / Lowering.
 * Zoom callouts (HTML over the canvas) appear in the settled states.
 * Reduced motion: no tween, no parallax, no scroll drive.
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

interface SceneContentProps {
  t: number;
  state: DeskState;
  breathe: boolean;
  onProject: (points: ProjectedAnchors) => void;
}

/** Everything inside the canvas, derived from `t`. */
function SceneContent({ t, state, breathe, onProject }: SceneContentProps) {
  const palette = useScenePalette();
  const { invalidate } = useThree();
  useEffect(() => invalidate(), [t, palette, invalidate]);

  const heightM = deskHeight(t);
  const heightCm = deskHeightCm(t);
  const pose = blendPose(SITTING, STANDING, smoothstep(t));

  return (
    <>
      <Desk heightM={heightM} palette={palette} />
      <Sensor heightM={heightM} palette={palette} monitorZ={MONITOR.z} breathe={breathe} />
      <Monitor heightM={heightM} state={state} heightCm={heightCm} palette={palette} />
      <DeskProps heightM={heightM} palette={palette} />
      <Chair t={smoothstep(t)} palette={palette} />
      <Person pose={pose} color={palette.figure} />
      <Projector anchors={sensorAnchors(heightM, MONITOR.z)} onChange={onProject} />
    </>
  );
}

export interface DeskSceneProps {
  initialState?: "sitting" | "standing";
  /** drive the desk from page scroll through a tall wrapper (off under reduced motion) */
  scroll?: boolean;
  /** loop sit/stand every 4 s; off under reduced motion */
  autoPlay?: boolean;
  /** zoom callouts explaining the sensor, the cable and the beam */
  callouts?: boolean;
}

export default function DeskScene({
  initialState = "sitting",
  scroll = false,
  autoPlay = false,
  callouts = true,
}: DeskSceneProps) {
  const [reduced] = useState(prefersReducedMotion);
  const [coarse] = useState(hasCoarsePointer);
  const [narrow, setNarrow] = useState(false);
  const palette = useScenePalette();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const figureSize = useElementSize(figureRef);
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

  const figure = (
    <div
      ref={figureRef}
      data-scene-figure
      style={{
        position: "relative",
        aspectRatio: narrow ? "4 / 5" : "16 / 10",
        borderRadius: 28,
        overflow: "hidden",
        // CSS variable, not `palette.bg`: the island is server-rendered light and
        // React does not patch a hydration mismatch in inline styles.
        background: "var(--color-bg)",
        touchAction: "pan-y",
      }}
      role="img"
      aria-label={`Desk scene: ${state}, desk at ${deskHeightCm(t)} cm`}
    >
      <Stage palette={palette} parallax={!reduced && !coarse} lift={smoothstep(t)}>
        <SceneContent t={t} state={state} breathe={!reduced} onProject={setAnchors} />
      </Stage>
      {callouts && !narrow && (
        <Callouts layout="overlay" visible={settled} anchors={anchors} width={figureSize.width} height={figureSize.height} />
      )}
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

  const listCallouts = callouts && narrow && (
    <Callouts layout="list" visible={settled} anchors={anchors} width={0} height={0} />
  );

  if (!scrollMode) {
    return (
      <div>
        {figure}
        {buttons}
        {listCallouts}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} data-scene-scroll style={{ height: `${SCROLL_TRAVEL_VH}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {figure}
        {buttons}
        {listCallouts}
      </div>
    </div>
  );
}
