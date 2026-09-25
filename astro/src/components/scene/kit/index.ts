/**
 * Scene kit — public surface (DESIGN.md §8).
 *
 * Every scene imports from here and nowhere else under `kit/`:
 *   SceneCanvas      the one shared canvas; every picture is a drei View
 *   World            the hero world: light rig, studio, slab, lens
 *   InsetView        a magnified inset: same objects, another camera
 *   Block/Blob/Capsule/Rod/Cable  the primitives (sharp box, faceted ellipsoid/capsule, rod, tube)
 *   Person + poses   the sketched figure (faceted or smooth) and its joint angles
 *   useCanvasTexture crisp screen textures sized from projected pixels
 *   useScrollProgress scroll-driven scenes
 *   style            segments, light, camera, stage, motion constants
 */
export { SceneCanvas } from "./SceneCanvas";
export { World, LightRig, Slab, Lens } from "./World";
export { InsetView } from "./InsetView";
export { Block, Blob, Capsule, Rod, Cable, Surface, GHOST_DEPTH_ORDER, type Vec3, type Finish } from "./Block";
export { Person, type FigureStyle } from "./Person";
export { BODY, SITTING, STANDING, blendPose, standUp, type Pose } from "./poses";
export { useCanvasTexture, roundRect, wrapText, SCREEN_FONT } from "./screen";
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
