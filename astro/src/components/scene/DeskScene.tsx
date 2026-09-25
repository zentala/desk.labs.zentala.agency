import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import type { DeskState } from "./scenePalette";
import {
  SceneCanvas,
  World,
  InsetView,
  Person,
  standUp,
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
import { Callouts, placeCallouts, CIRCLE_PX, LIST_CIRCLE_PX, type PlacedCallout, type TrackRefs } from "./callouts/Callouts";
import { useTween, useDirection, useElementSize } from "./desk/hooks";

/**
 * DeskScene v6 — hero scene of the family (DESIGN.md §8), drawn with the kit.
 *
 * One number drives everything: `t` (0 = sitting, 1 = standing). The desk
 * height, the person's pose, the chair, the screen readout and the toast all
 * derive from it. `t` comes from the buttons (600 ms tween) or, in `scroll`
 * mode, from the page scroll through a tall wrapper. One shared canvas holds
 * three drei Views: the hero, and two callout insets in a paper column beside
 * it (a row under it on narrow screens). The canvas is clipped to the hero
 * rectangle plus the inset circles, so the square View scissors never show.
 * Reduced motion: no tween, no parallax, no scroll drive.
 */

const SCROLL_TRAVEL_VH = 240;
/** scroll mode: the desk is seated for the first 12 % and fully up by 85 % of the travel */
const SCROLL_WINDOW: [number, number] = [0.12, 0.85];
/** |t| within this of an end is "settled": toast and callouts show */
const SETTLE_EPS = 0.02;
/** the callout column beside the hero, CSS px */
const COLUMN_PX = 236;

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
  const pose = standUp(t);
  const s = sensorCenter(heightM);

  return (
    <>
      <Desk heightM={heightM} palette={palette} topOnly={parts !== "all"} />
      <Sensor heightM={heightM} palette={palette} port={port} breathe={breathe} withBeam={parts !== "monitor"} />
      {parts !== "sensor" && <Monitor heightM={heightM} state={state} heightCm={heightCm} palette={palette} withScreen={parts === "all"} />}
      {parts === "all" && <DeskProps heightM={heightM} palette={palette} />}
      {parts === "all" && <Chair t={smoothstep(t)} palette={palette} chairStyle={chairStyle} />}
      {parts === "all" && <Person pose={pose} color={palette.figure} figureStyle={figureStyle} />}
      {parts === "all" && onProject && (
        <Projector anchors={{ sensor: [s[0] + 0.05, s[1] - 0.01, s[2] + 0.02], cable: [port[0] + 0.03, port[1], port[2]] }} onChange={onProject} />
      )}
    </>
  );
}

/** Inset cameras follow the desk: A looks up at the sensor from below and behind, B down at the seated plug from front-right so the side face is a thin edge. */
function insetCameras(heightM: number): Record<"sensor" | "cable", { position: Vec3; target: Vec3 }> {
  const s = sensorCenter(heightM);
  const p = monitorPort(heightM);
  return {
    sensor: { position: [s[0] + 0.2, s[1] - 0.2, s[2] - 0.34], target: [s[0] - 0.005, s[1] + 0.005, s[2] + 0.01] },
    cable: { position: [p[0] + 0.19, p[1] + 0.07, p[2] + 0.14], target: [p[0] + 0.012, p[1] - 0.014, p[2] - 0.004] },
  };
}

/** `clip-path: path()` for the canvas: the hero rectangle plus every ring circle (nonzero union). */
function canvasClip(hero: { width: number; height: number }, rings: Array<{ cx: number; cy: number; r: number }>): string {
  const circles = rings.map(({ cx, cy, r }) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`).join("");
  return `path("M0 0H${hero.width}V${hero.height}H0Z${circles}")`;
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
  const boxSize = useElementSize(boxRef);
  const [anchors, setAnchors] = useState<ProjectedAnchors>({});
  const [listRings, setListRings] = useState<Array<{ cx: number; cy: number; r: number }>>([]);
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

  // narrow layout: the list rings are laid out by the browser; read them for the clip-path
  useEffect(() => {
    if (!narrow || !callouts) return;
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const b = box.getBoundingClientRect();
      const rings = [tracks.sensor.current, tracks.cable.current].flatMap((el) => {
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2, r: r.width / 2 }];
      });
      setListRings(rings);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrow, callouts, boxSize.width]);

  const t = scrollMode
    ? Math.min(1, Math.max(0, (progress - SCROLL_WINDOW[0]) / (SCROLL_WINDOW[1] - SCROLL_WINDOW[0])))
    : tweenT;
  const direction = useDirection(t);
  const state = stateFor(t, direction);
  const settled = state === "sitting" || state === "standing";
  const cams = insetCameras(deskHeight(t));

  const columnLayout = callouts && !narrow;
  const placed: PlacedCallout[] = columnLayout ? placeCallouts(anchors, mainSize.width + COLUMN_PX / 2, mainSize.height) : [];
  const rings = columnLayout ? placed.map((p) => ({ cx: p.cx, cy: p.cy, r: CIRCLE_PX / 2 })) : narrow && callouts ? listRings : [];
  const clip = mainSize.width > 0 ? canvasClip(mainSize, rings.length ? rings : [{ cx: -1, cy: -1, r: LIST_CIRCLE_PX / 2 }]) : undefined;

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
        display: "flex",
        flexDirection: narrow ? "column" : "row",
      }}
    >
      <div
        ref={mainRef}
        data-scene-figure
        role="img"
        aria-label={`Desk scene: ${state}, desk at ${deskHeightCm(t)} cm`}
        style={{ position: "relative", zIndex: 1, flex: "1 1 auto", aspectRatio: narrow ? "4 / 5" : "1.25" }}
      />
      {columnLayout && <div style={{ flex: `0 0 ${COLUMN_PX}px` }} aria-hidden="true" />}
      {columnLayout && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
          <Callouts layout="column" visible={settled} placed={placed} width={boxSize.width} height={boxSize.height} tracks={tracks} />
        </div>
      )}
      {callouts && narrow && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <Callouts layout="list" visible={settled} placed={[]} width={0} height={0} tracks={tracks} />
        </div>
      )}
      <SceneCanvas eventSource={boxRef} clipPath={clip}>
        <View track={mainRef as RefObject<HTMLElement>} index={1}>
          <World palette={palette} parallax={!reduced && !coarse} lift={smoothstep(t)} portrait={narrow}>
            {content("all", setAnchors)}
          </World>
        </View>
        {callouts && (
          <InsetView track={tracks.sensor} visible={settled || narrow} index={2} palette={palette} fov={13} {...cams.sensor}>
            {content("sensor")}
          </InsetView>
        )}
        {callouts && (
          <InsetView track={tracks.cable} visible={settled || narrow} index={3} palette={palette} fov={16} {...cams.cable}>
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
