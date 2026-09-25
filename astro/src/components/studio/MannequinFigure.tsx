/**
 * Studio — boytchev's mannequin.js (npm `mannequin-js` 5.2, GPL-3.0). The
 * package builds its own full-screen renderer, scene and camera at import
 * time (`src/scene.js` runs `initStage()` on load and every Mannequin adds
 * itself to that scene), so we import it lazily, tear that stage down and
 * re-parent the figure into our canvas. Posed by joint setters (degrees).
 */
import { useEffect, useState } from "react";
import * as THREE from "three";
import type { SceneFrame } from "../scene/kit/timeline";

type Posture = "sit" | "stand" | "walk";

/** The library is posed, not animated: snap to the nearer end of a transition. */
function postureOf(frame: SceneFrame): Posture {
  if (frame.action === "walk") return "walk";
  if (frame.action === "sit") return "sit";
  if (frame.action === "stand") return "stand";
  const up = frame.action === "lower" ? 1 - frame.actionT : frame.actionT;
  return up < 0.5 ? "sit" : "stand";
}

interface MannequinLike extends THREE.Group {
  turn: number;
  bend: number;
  torso: { bend: number };
  head: { nod: number };
  l_leg: { raise: number; straddle: number };
  r_leg: { raise: number; straddle: number };
  l_knee: { bend: number };
  r_knee: { bend: number };
  l_arm: { raise: number; straddle: number };
  r_arm: { raise: number; straddle: number };
  l_elbow: { bend: number };
  r_elbow: { bend: number };
  stepOnGround(): void;
}

interface MannequinModule {
  Male: new (height?: number) => MannequinLike;
  getStage(): { renderer: THREE.WebGLRenderer; scene: THREE.Scene };
  getGroundLevel(): number;
}

const HEIGHT_M = 1.75;

let modulePromise: Promise<MannequinModule> | null = null;

/** Import once; on first import, dispose the library's own stage. */
function loadMannequin(): Promise<MannequinModule> {
  if (!modulePromise) {
    modulePromise = import("mannequin-js/src/mannequin.js").then((mod) => {
      const m = mod as unknown as MannequinModule;
      const stage = m.getStage();
      stage.renderer.setAnimationLoop(null);
      stage.renderer.domElement.remove();
      stage.renderer.dispose();
      // the library also appends a `user-scalable=no` viewport meta and a favicon link
      document.querySelectorAll('meta[name="viewport"][content*="user-scalable=no"]').forEach((el) => el.remove());
      return m;
    });
  }
  return modulePromise;
}

function pose(man: MannequinLike, action: Posture): void {
  const sit = action === "sit";
  // the library's default is -90 (facing +Z, its own camera); +90 faces our desk at -Z
  man.turn = 90;
  man.bend = sit ? 4 : 0;
  man.torso.bend = sit ? 2 : 1;
  man.head.nod = sit ? -8 : -4;
  man.l_leg.raise = sit ? 88 : action === "walk" ? 18 : 0;
  man.r_leg.raise = sit ? 88 : action === "walk" ? -18 : 0;
  man.l_knee.bend = sit ? 92 : action === "walk" ? 30 : 0;
  man.r_knee.bend = sit ? 92 : action === "walk" ? 10 : 0;
  man.l_arm.raise = sit ? 42 : 20;
  man.r_arm.raise = sit ? 42 : 20;
  man.l_elbow.bend = sit ? 70 : action === "walk" ? 30 : 95;
  man.r_elbow.bend = sit ? 70 : action === "walk" ? 30 : 95;
  man.l_arm.straddle = 8;
  man.r_arm.straddle = 8;
  man.updateMatrixWorld(true);
}

function restyle(root: THREE.Object3D, color: string): () => void {
  const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const ours = new THREE.MeshLambertMaterial({ color, flatShading: true });
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    originals.set(mesh, mesh.material);
    mesh.material = ours;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
  return () => {
    originals.forEach((mat, mesh) => (mesh.material = mat));
    ours.dispose();
  };
}

export interface MannequinFigureProps {
  frame: SceneFrame;
  walk: { position: [number, number, number]; yaw: number };
  ourStyle: boolean;
  color: string;
}

export default function MannequinFigure({ frame, walk, ourStyle, color }: MannequinFigureProps) {
  const action = postureOf(frame);
  const [man, setMan] = useState<MannequinLike | null>(null);
  const [ground, setGround] = useState(0);

  useEffect(() => {
    let alive = true;
    loadMannequin().then((mod) => {
      if (!alive) return;
      const figure = new mod.Male(HEIGHT_M);
      mod.getStage().scene.remove(figure);
      setGround(mod.getGroundLevel());
      setMan(figure);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!man) return;
    pose(man, action);
  }, [man, action]);

  useEffect(() => {
    if (!man || !ourStyle) return;
    return restyle(man, color);
  }, [man, ourStyle, color]);

  if (!man) return null;
  // the library rests the feet at its ground level; sit height comes from the chair seat (0.47 m)
  const y = action === "sit" ? -ground - 0.02 - 0.48 : -ground;
  const at: [number, number, number] = action === "sit" ? [0, y, 0.62] : [walk.position[0], y, 0.5 + walk.position[2]];
  const yaw = walk.yaw;
  return (
    <group position={at} rotation={[0, yaw, 0]}>
      <primitive object={man} />
    </group>
  );
}
