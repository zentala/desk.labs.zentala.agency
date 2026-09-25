/**
 * Scene kit — the one shared canvas (DESIGN.md §8.4, §8.10).
 *
 * It covers its positioned parent and draws nothing by itself: every picture
 * is a drei `<View>` tracking a DOM element (the main figure, each callout
 * inset), so the hero and its magnified insets are the same objects seen by
 * different cameras. Events come from the tracked elements, not the canvas.
 */
import type { ReactNode, RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LIGHT } from "./style";

const CANVAS_HEIGHT = "250%";
/** runs before every drei View (their priorities are their `index`, 1 and up) */
const BEFORE_VIEWS = 0;

/**
 * Keeps the canvas rect current inside the frame being drawn.
 *
 * A View places its scissor from the LIVE tracked rect minus the canvas rect
 * held in `state.size`, which R3F only re-measures after the debounced scroll
 * settles (and then through a React render). Every frame drawn mid-scroll used
 * that stale rect and landed offset by the distance scrolled — up to 220 px on
 * /lab/desk-scene (E005 libs spike). The View holds the very same `size`
 * object, so refreshing `top`/`left` in place fixes the frame being drawn;
 * the debounced measurement still replaces the object once scrolling stops.
 */
function SyncCanvasRect() {
  useFrame((state) => {
    const rect = state.gl.domElement.getBoundingClientRect();
    const size = state.size as { top: number; left: number };
    size.top = rect.top;
    size.left = rect.left;
  }, BEFORE_VIEWS);
  return null;
}

export interface SceneCanvasProps {
  /** the element whose descendants are tracked by the views; the canvas is absolutely positioned inside it */
  eventSource: RefObject<HTMLElement | null>;
  /** CSS clip-path: the hero rectangle plus the inset circles, so square View scissors never show */
  clipPath?: string;
  children: ReactNode;
}

export function SceneCanvas({ eventSource, clipPath, children }: SceneCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      shadows="percentage"
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      // views position their scissors from the canvas rect; keep it current while the page scrolls
      resize={{ scroll: true, debounce: { scroll: 50, resize: 0 } }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: LIGHT.exposure,
      }}
      // Taller than its box on purpose: drei's View compares a tracked element's
      // viewport `top` with the canvas HEIGHT to decide "offscreen", so a ring low
      // in a box that sits low on the page would be skipped. Rendering is
      // scissored per view, so the extra area costs memory, not fill rate.
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: CANVAS_HEIGHT, pointerEvents: "none", clipPath }}
    >
      <SyncCanvasRect />
      {children}
    </Canvas>
  );
}
