/**
 * Scene kit — the one shared canvas (DESIGN.md §8.4, §8.10).
 *
 * It covers its positioned parent and draws nothing by itself: every picture
 * is a drei `<View>` tracking a DOM element (the main figure, each callout
 * inset), so the hero and its magnified insets are the same objects seen by
 * different cameras. Events come from the tracked elements, not the canvas.
 */
import type { ReactNode, RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { LIGHT } from "./style";

export interface SceneCanvasProps {
  /** the element whose descendants are tracked by the views; the canvas is absolutely positioned inside it */
  eventSource: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function SceneCanvas({ eventSource, children }: SceneCanvasProps) {
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
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {children}
    </Canvas>
  );
}
