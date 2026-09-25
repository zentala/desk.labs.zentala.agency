/**
 * Scene kit — crisp canvas textures for screens (DESIGN.md §8.8).
 *
 * The canvas is drawn at `TEXEL_SCALE`× the logical size, with anisotropic
 * filtering at the device maximum, and redrawn only when `deps` change or the
 * web fonts finish loading. Draw functions work in logical pixels.
 */
import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const TEXEL_SCALE = 2;

export interface CanvasTextureSpec {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  deps: readonly unknown[];
}

export function useCanvasTexture({ width, height, draw, deps }: CanvasTextureSpec): THREE.CanvasTexture {
  const { gl, invalidate } = useThree();

  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width * TEXEL_SCALE;
    c.height = height * TEXEL_SCALE;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = gl.capabilities.getMaxAnisotropy();
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    return { canvas: c, texture: t };
  }, [width, height, gl]);

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(TEXEL_SCALE, 0, 0, TEXEL_SCALE, 0, 0);
      ctx.clearRect(0, 0, width, height);
      draw(ctx, width, height);
      texture.needsUpdate = true;
      invalidate();
    };
    paint();
    // Fonts may land after the first paint; repaint once they are ready.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(paint);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, texture, width, height, invalidate, ...deps]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

/** Rounded rectangle path (no fill/stroke). */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Word-wrapped text; returns the y after the last line. */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cy);
  return cy + lineHeight;
}

/** Font stacks matching DESIGN.md §4 (the fontsource families are loaded by fonts.css). */
export const SCREEN_FONT = {
  display: "'Bricolage Grotesque Variable', 'Space Grotesk', system-ui, sans-serif",
  body: "'Inter Variable', 'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;
