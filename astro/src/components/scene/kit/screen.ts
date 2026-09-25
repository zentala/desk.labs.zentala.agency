/**
 * Scene kit — crisp canvas textures for screens (DESIGN.md §8.8).
 *
 * The draw function works in a fixed design space (`designWidth` units wide);
 * the canvas itself is sized from the screen's projected on-page pixels × dpr
 * (`pixelWidth`), so the texture is sampled close to 1:1 with no deep mip
 * levels to blur the text. Redrawn only when `deps` change or fonts load.
 */
import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface CanvasTextureSpec {
  designWidth: number;
  designHeight: number;
  /** canvas width in device pixels; height follows the design aspect */
  pixelWidth: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  deps: readonly unknown[];
}

export function useCanvasTexture({ designWidth, designHeight, pixelWidth, draw, deps }: CanvasTextureSpec): THREE.CanvasTexture {
  const { gl, invalidate } = useThree();
  const pixelHeight = Math.round((pixelWidth * designHeight) / designWidth);

  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = pixelWidth;
    c.height = pixelHeight;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = gl.capabilities.getMaxAnisotropy();
    t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return { canvas: c, texture: t };
  }, [pixelWidth, pixelHeight, gl]);

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const s = pixelWidth / designWidth;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.clearRect(0, 0, designWidth, designHeight);
      draw(ctx, designWidth, designHeight);
      texture.needsUpdate = true;
      invalidate();
    };
    paint();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(paint);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, texture, pixelWidth, designWidth, designHeight, invalidate, ...deps]);

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
