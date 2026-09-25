/**
 * Scene kit — public surface (DESIGN.md §8).
 *
 * Every scene imports from here and nowhere else under `kit/`:
 *   Stage            the world: renderer, lamp, slab, contact shadows, lens
 *   Block/Blob/Capsule/Rod/Cable  the primitives (sharp box, faceted ellipsoid/capsule, rod, tube)
 *   Person + poses   the ghost silhouette and its joint angles
 *   useCanvasTexture crisp screen textures
 *   useScrollProgress scroll-driven scenes
 *   style            segments, light, camera, stage, motion constants
 */
export { Stage } from "./Stage";
export { Block, Blob, Capsule, Rod, Cable, Surface, GHOST_DEPTH_ORDER, type Vec3, type Finish } from "./Block";
export { Person } from "./Person";
export { BODY, SITTING, STANDING, blendPose, type Pose } from "./poses";
export { useCanvasTexture, roundRect, wrapText, SCREEN_FONT, TEXEL_SCALE } from "./screen";
export { useScrollProgress, scrollToProgress } from "./motion";
export {
  SEGMENTS,
  GHOST_OPACITY,
  LIGHT,
  CAMERA,
  STAGE,
  MOTION,
  easeEnter,
  prefersReducedMotion,
  useScenePalette,
} from "./style";
