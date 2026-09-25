/**
 * Small hooks for DeskScene: the button tween, travel direction and the
 * figure's CSS size (for the callout overlay).
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MOTION, easeEnter } from "../kit";

/** Tweens `t` toward a target over `MOTION.sceneMs` with the enter easing. */
export function useTween(reduced: boolean): [number, (target: number) => void, (v: number) => void] {
  const [t, setT] = useState(0);
  const raf = useRef(0);
  const go = useCallback(
    (target: number) => {
      window.cancelAnimationFrame(raf.current);
      if (reduced) {
        setT(target);
        return;
      }
      const from = t;
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / MOTION.sceneMs);
        setT(from + (target - from) * easeEnter(k));
        if (k < 1) raf.current = window.requestAnimationFrame(step);
      };
      raf.current = window.requestAnimationFrame(step);
    },
    [reduced, t],
  );
  useEffect(() => () => window.cancelAnimationFrame(raf.current), []);
  return [t, go, setT];
}

/** Tracks which way `t` last moved so the screen can say Rising or Lowering. */
export function useDirection(t: number): 1 | -1 {
  const prev = useRef(t);
  const dir = useRef<1 | -1>(1);
  if (t !== prev.current) {
    dir.current = t > prev.current ? 1 : -1;
    prev.current = t;
  }
  return dir.current;
}

/** CSS size of an element, kept current with a ResizeObserver. */
export function useElementSize(ref: RefObject<HTMLElement | null>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

