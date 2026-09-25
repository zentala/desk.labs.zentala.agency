/**
 * Scene kit — scroll progress for scroll-driven scenes (DESIGN.md §8.7).
 *
 * `useScrollProgress(ref)` returns 0..1 as the page scrolls through the
 * referenced element's travel (its height minus the viewport). It never
 * touches scroll position or speed; it only reads it.
 */
import { useEffect, useState, type RefObject } from "react";

export function useScrollProgress(ref: RefObject<HTMLElement | null>, enabled: boolean): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      const next = Math.min(1, Math.max(0, -rect.top / travel));
      setProgress((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ref, enabled]);

  return progress;
}

/** Scroll the page so the element's travel is at `progress` (0..1). */
export function scrollToProgress(el: HTMLElement, progress: number, smooth: boolean) {
  const travel = el.offsetHeight - window.innerHeight;
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: top + travel * progress, behavior: smooth ? "smooth" : "auto" });
}
