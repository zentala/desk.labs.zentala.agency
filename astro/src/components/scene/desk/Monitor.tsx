/**
 * A 34" ultrawide all-in-one on a slim neck, with a USB-C port on its right
 * side where the sensor cable plugs in (W3-T7). The screen is a canvas
 * texture of the app sized from its projected on-page pixels, so the text is
 * sampled close to 1:1 (`kit/screen.ts`). Insets render it without a screen.
 */
import { useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DeskState, ScenePalette } from "../scenePalette";
import { Block, useCanvasTexture, type Vec3 } from "../kit";
import { drawScreen, SCREEN_DESIGN } from "./screenApp";

/** Physical size: 34" 21:9 panel ≈ 78 × 32.5 cm; body slightly larger. */
export const MONITOR = {
  screen: [0.78, 0.325] as [number, number],
  body: [0.82, 0.365, 0.03] as Vec3,
  neck: [0.06, 0.15, 0.025] as Vec3,
  base: [0.28, 0.012, 0.17] as Vec3,
  /** neck position on the desk (z from desk centre) */
  z: -0.17,
  /** body group z offset from the neck */
  bodyZ: 0.02,
} as const;

/** Body centre height above the desk top. */
function bodyY(heightM: number): number {
  return heightM + MONITOR.base[1] + MONITOR.neck[1] + MONITOR.body[1] / 2 - 0.04;
}

/** World position of the USB-C port on the right side of the body. */
export function monitorPort(heightM: number): Vec3 {
  return [MONITOR.body[0] / 2, bodyY(heightM) - 0.06, MONITOR.z + MONITOR.bodyZ];
}

const MIN_TEXELS = 256;
const MAX_TEXELS = 2048;
const FALLBACK_TEXELS = 1024;

/** Screen width in device pixels as the main camera sees it, rounded so the canvas is not rebuilt every frame. */
function useScreenPixels(heightM: number): number {
  const { camera, size, gl } = useThree();
  const y = bodyY(heightM);
  const z = MONITOR.z + MONITOR.bodyZ + MONITOR.body[2] / 2;
  const left = new THREE.Vector3(-MONITOR.screen[0] / 2, y, z).project(camera);
  const right = new THREE.Vector3(MONITOR.screen[0] / 2, y, z).project(camera);
  const cssPx = (Math.abs(right.x - left.x) / 2) * size.width;
  const px = cssPx * gl.getPixelRatio();
  if (!Number.isFinite(px)) return FALLBACK_TEXELS;
  return Math.min(MAX_TEXELS, Math.max(MIN_TEXELS, Math.ceil(px / 128) * 128));
}

interface ScreenProps {
  heightM: number;
  state: DeskState;
  heightCm: number;
  /** fixed texture width for views whose camera is not the hero lens (insets) */
  fixedPixels?: number;
}

function Screen({ heightM, state, heightCm, fixedPixels }: ScreenProps) {
  const projected = useScreenPixels(heightM);
  const pixelWidth = fixedPixels ?? projected;
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => drawScreen(ctx, w, h, state, heightCm),
    [state, heightCm],
  );
  const texture = useCanvasTexture({
    designWidth: SCREEN_DESIGN.w,
    designHeight: SCREEN_DESIGN.h,
    pixelWidth,
    draw,
    deps: [state, heightCm],
  });
  return (
    <mesh position={[0, 0, MONITOR.body[2] / 2 + 0.001]}>
      <planeGeometry args={MONITOR.screen} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export interface MonitorProps {
  heightM: number;
  state: DeskState;
  heightCm: number;
  palette: ScenePalette;
  /** the cable inset keeps the screen for context; set false to skip the texture */
  withScreen?: boolean;
  /** insets pass a fixed texture width; the hero sizes it from projected pixels */
  screenPixels?: number;
}

export function Monitor({ heightM, state, heightCm, palette, withScreen = true, screenPixels }: MonitorProps) {
  const baseY = heightM + MONITOR.base[1] / 2;
  const neckY = heightM + MONITOR.base[1] + MONITOR.neck[1] / 2;
  const port = monitorPort(heightM);

  return (
    <group position={[0, 0, MONITOR.z]}>
      <Block size={MONITOR.base} position={[0, baseY, 0]} color={palette.ink} finish="satin" />
      <Block size={MONITOR.neck} position={[0, neckY, 0]} color={palette.ink} finish="satin" />
      <group position={[0, bodyY(heightM), MONITOR.bodyZ]}>
        <Block size={MONITOR.body} color={palette.ink} finish="satin" />
        {withScreen && <Screen heightM={heightM} state={state} heightCm={heightCm} fixedPixels={screenPixels} />}
        {/* USB-C port: a slot in the right side face, with the plug seated in it */}
        <Block size={[0.004, 0.009, 0.02]} position={[MONITOR.body[0] / 2 + 0.001, port[1] - bodyY(heightM), 0]} color={palette.inkMuted} castShadow={false} />
        <Block size={[0.024, 0.007, 0.012]} position={[MONITOR.body[0] / 2 + 0.013, port[1] - bodyY(heightM), 0]} color={palette.fabric} />
      </group>
    </group>
  );
}
