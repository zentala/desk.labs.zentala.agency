/**
 * Projects world-space anchor points to canvas pixels every rendered frame
 * and reports them to the HTML overlay (DESIGN.md §8.10 callouts). Lives
 * inside the Canvas; the overlay lives outside it, so text stays real text.
 */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "../kit";

export interface ScreenPoint {
  x: number;
  y: number;
  /** false when the point is behind the camera or outside the frame */
  visible: boolean;
}

export type ProjectedAnchors = Record<string, ScreenPoint>;

export interface ProjectorProps {
  anchors: Record<string, Vec3>;
  onChange: (points: ProjectedAnchors) => void;
}

const MIN_DELTA_PX = 0.5;

export function Projector({ anchors, onChange }: ProjectorProps) {
  const { camera, size } = useThree();
  const last = useRef<ProjectedAnchors>({});
  const v = useRef(new THREE.Vector3());

  useFrame(() => {
    const next: ProjectedAnchors = {};
    let changed = false;
    for (const [id, p] of Object.entries(anchors)) {
      v.current.set(p[0], p[1], p[2]).project(camera);
      const x = ((v.current.x + 1) / 2) * size.width;
      const y = ((1 - v.current.y) / 2) * size.height;
      const visible = v.current.z < 1 && x >= 0 && x <= size.width && y >= 0 && y <= size.height;
      next[id] = { x, y, visible };
      const prev = last.current[id];
      if (!prev || Math.abs(prev.x - x) > MIN_DELTA_PX || Math.abs(prev.y - y) > MIN_DELTA_PX || prev.visible !== visible) {
        changed = true;
      }
    }
    if (changed) {
      last.current = next;
      onChange(next);
    }
  });
  return null;
}
