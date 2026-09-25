import { describe, expect, it } from "vitest";
import { BEATS, beatAt, beatIndexAt, beatMidpoints } from "./timeline";

describe("beatAt", () => {
  it("covers [0, 1] with the nine spec beats, contiguous", () => {
    expect(BEATS).toHaveLength(9);
    expect(BEATS[0].u0).toBe(0);
    expect(BEATS[8].u1).toBe(1);
    BEATS.slice(1).forEach((b, i) => expect(b.u0).toBe(BEATS[i].u1));
  });

  it("is pure: the same u gives the same frame", () => {
    for (let i = 0; i <= 200; i++) expect(beatAt(i / 200)).toEqual(beatAt(i / 200));
  });

  it("names the beat for each midpoint", () => {
    expect(beatMidpoints().map((u) => beatAt(u).beat.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(beatIndexAt(1)).toBe(8);
    expect(beatAt(-1).u).toBe(0);
  });

  it("follows the storyboard", () => {
    expect(beatAt(0.15)).toMatchObject({ toast: "nudge", deskT: 0, state: "sitting", timer: "Sitting · 40:00", clock: "14:40" });
    expect(beatAt(0.375)).toMatchObject({ action: "rise", state: "rising" });
    expect(beatAt(0.55)).toMatchObject({ deskT: 1, action: "stand", state: "standing" });
    expect(beatAt(0.68)).toMatchObject({ toast: "done", timer: "Standing · 20:00", clock: "15:01" });
    expect(beatAt(0.77)).toMatchObject({ action: "lower", state: "lowering" });
    expect(beatAt(0.86)).toMatchObject({ deskT: 0, action: "sit", toast: "none" });
    expect(beatAt(0.98)).toMatchObject({ action: "walk", state: "away", toast: "away", deskT: 0 });
  });

  it("moves the desk only in the rise and lower beats, monotonically", () => {
    let prev = -1;
    for (let u = 0.3; u <= 0.45; u += 0.005) {
      const t = beatAt(u).deskT;
      expect(t).toBeGreaterThanOrEqual(prev);
      prev = t;
    }
    expect(beatAt(0.29).deskT).toBe(0);
    expect(beatAt(0.46).deskT).toBe(1);
  });
});
