/**
 * Spike — ready-made CC0 rigged characters (see public/models/spike/LICENSES.md)
 * on our chair, with their own sit / idle / walk clips. `ourStyle` swaps every
 * material for our neutral figure token with flatShading, so the owner can
 * compare "as shipped" against "in our look". drei `Outlines` needs a parent
 * mesh, so the outline toggle covers the procedural figure only.
 */
import { useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import type { FigureAction } from "./settings";

type GltfKind = "robot" | "kenney" | "quaternius";

interface ModelSpec {
  url: string;
  /** scene-space height the model is scaled to (m) */
  height: number;
  clips: Record<FigureAction, string>;
  /** clips that end in a held pose rather than loop */
  once: string[];
  /** rotation about Y that makes the model face the desk (-Z) */
  faceDesk: number;
  /** root position per action, feet on the floor */
  at: Record<FigureAction, [number, number, number]>;
}

const MODELS: Record<GltfKind, ModelSpec> = {
  robot: {
    url: "/models/spike/RobotExpressive.glb",
    height: 1.6,
    clips: { sit: "Sitting", stand: "Standing", walk: "Walking" },
    once: ["Sitting", "Standing"],
    faceDesk: 0,
    at: { sit: [0, 0, 0.62], stand: [0, 0, 0.5], walk: [0.7, 0, 0.9] },
  },
  kenney: {
    url: "/models/spike/KenneyMiniCharacterMaleB.glb",
    height: 1.5,
    clips: { sit: "sit", stand: "idle", walk: "walk" },
    once: [],
    faceDesk: 0,
    at: { sit: [0, 0, 0.6], stand: [0, 0, 0.5], walk: [0.7, 0, 0.9] },
  },
  quaternius: {
    url: "/models/spike/QuaterniusAnimationLibrary.gltf",
    height: 1.75,
    clips: { sit: "Sitting_Idle_Loop", stand: "Idle_Loop", walk: "Walk_Loop" },
    once: [],
    faceDesk: Math.PI,
    at: { sit: [0, 0, 0.64], stand: [0, 0, 0.5], walk: [0.7, 0, 0.9] },
  },
};

const FADE_S = 0.25;

interface GltfFigureProps {
  kind: GltfKind;
  action: FigureAction;
  ourStyle: boolean;
  color: string;
}

/** Rest-pose height with skinning applied (geometry bounds alone are wrong for rig-scaled meshes like RobotExpressive). */
function skinnedHeight(root: THREE.Object3D): number {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  root.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isMesh) return;
    if (mesh.isSkinnedMesh) {
      mesh.computeBoundingBox();
      if (mesh.boundingBox) box.union(mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
    } else {
      box.expandByObject(mesh);
    }
  });
  return box.max.y - box.min.y;
}

/** Restyle every mesh to one flat-shaded Lambert in our token; returns the undo. */
function restyle(root: THREE.Object3D, color: string): () => void {
  const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const ours = new THREE.MeshLambertMaterial({ color, flatShading: true });
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const m = o as THREE.Mesh;
      originals.set(m, m.material);
      m.material = ours;
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return () => {
    originals.forEach((mat, mesh) => (mesh.material = mat));
    ours.dispose();
  };
}

export default function GltfFigure({ kind, action, ourStyle, color }: GltfFigureProps) {
  const spec = MODELS[kind];
  const gltf = useGLTF(spec.url);
  const scene = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);
  const group = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(gltf.animations, scene);

  const scale = useMemo(() => {
    const h = skinnedHeight(scene);
    const plain = new THREE.Box3().setFromObject(scene);
    console.info(`[spike] ${kind}: skinned height ${h.toFixed(3)}, plain box ${(plain.max.y - plain.min.y).toFixed(3)} (y ${plain.min.y.toFixed(2)}..${plain.max.y.toFixed(2)}) → scale ${(spec.height / h).toFixed(3)}`);
    return h > 0 ? spec.height / h : 1;
  }, [scene, spec.height, kind]);

  useEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        // skinned meshes move outside their rest-pose bounds
        o.frustumCulled = false;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!ourStyle) return;
    return restyle(scene, color);
  }, [scene, ourStyle, color]);

  useEffect(() => {
    const name = spec.clips[action];
    const a = actions[name];
    if (!a) {
      console.warn(`[spike] ${kind}: no clip "${name}"; have ${Object.keys(actions).join(", ")}`);
      return;
    }
    a.reset();
    if (spec.once.includes(name)) {
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
    } else {
      a.setLoop(THREE.LoopRepeat, Infinity);
    }
    a.fadeIn(FADE_S).play();
    return () => {
      a.fadeOut(FADE_S);
    };
  }, [actions, action, spec, kind, mixer]);

  const yaw = spec.faceDesk + (action === "walk" ? Math.PI * 0.75 : 0);
  return (
    <group ref={group} position={spec.at[action]} rotation={[0, yaw, 0]} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

Object.values(MODELS).forEach((m) => useGLTF.preload(m.url));
