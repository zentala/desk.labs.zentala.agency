/**
 * A 34" ultrawide all-in-one with rounded corners on a slim neck (owner
 * feedback item 7). The screen is a crisp canvas texture of the app
 * (`screenApp.ts`); it is the only place state is shown (item 8, 9).
 */
import { useCallback } from "react";
import type { DeskState, ScenePalette } from "../scenePalette";
import { Block, useCanvasTexture } from "../kit";
import { drawScreen, SCREEN_PX } from "./screenApp";

/** Physical size: 34" 21:9 panel ≈ 80 × 34 cm; body slightly larger. */
export const MONITOR = {
  screen: [0.78, 0.325] as [number, number],
  body: [0.82, 0.365, 0.03] as [number, number, number],
  neck: [0.06, 0.15, 0.025] as [number, number, number],
  base: [0.28, 0.012, 0.17] as [number, number, number],
  /** neck position on the desk (z from desk centre) */
  z: -0.17,
} as const;

export interface MonitorProps {
  heightM: number;
  state: DeskState;
  heightCm: number;
  palette: ScenePalette;
}

export function Monitor({ heightM, state, heightCm, palette }: MonitorProps) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => drawScreen(ctx, w, h, state, heightCm),
    [state, heightCm],
  );
  const texture = useCanvasTexture({ width: SCREEN_PX.w, height: SCREEN_PX.h, draw, deps: [state, heightCm] });

  const baseY = heightM + MONITOR.base[1] / 2;
  const neckY = heightM + MONITOR.base[1] + MONITOR.neck[1] / 2;
  const bodyY = heightM + MONITOR.base[1] + MONITOR.neck[1] + MONITOR.body[1] / 2 - 0.04;

  return (
    <group position={[0, 0, MONITOR.z]}>
      <Block size={MONITOR.base} position={[0, baseY, 0]} color={palette.ink} />
      <Block size={MONITOR.neck} position={[0, neckY, 0]} color={palette.ink} />
      <group position={[0, bodyY, 0.02]}>
        <Block size={MONITOR.body} color={palette.ink} />
        <mesh position={[0, 0, MONITOR.body[2] / 2 + 0.001]}>
          <planeGeometry args={MONITOR.screen} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
