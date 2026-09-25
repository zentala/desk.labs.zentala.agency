/**
 * Studio — plays the storyboard: advances `u` by wall-clock time × speed
 * while `playing`, wraps or stops at the end. The scene itself never reads
 * the clock: it only sees `u`, which keeps scrubbing deterministic.
 */
import { useEffect, useRef } from "react";
import { STORY_SECONDS } from "./figures";

interface PlayerState {
  u: number;
  playing: boolean;
  speed: number;
  loop: boolean;
}

export function useTimelinePlayer(state: PlayerState, set: (patch: Partial<PlayerState>) => void): void {
  const live = useRef(state);
  live.current = state;

  useEffect(() => {
    if (!state.playing) return;
    let raf = 0;
    let last = performance.now();
    let u = live.current.u;
    let seen = u;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      // a scrub while playing moves the playhead; a stale echo of our own last value does not
      const external = live.current.u;
      if (external !== seen && external !== u) u = external;
      seen = external;
      u += (dt * live.current.speed) / STORY_SECONDS;
      if (u >= 1) {
        if (!live.current.loop) {
          set({ u: 1, playing: false });
          return;
        }
        u -= 1;
      }
      set({ u });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.playing, set]);
}
