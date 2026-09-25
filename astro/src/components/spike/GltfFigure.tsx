/**
 * Spike — ready-made CC0 rigged characters (see public/models/spike/LICENSES.md)
 * on our chair, with their own sit / idle / walk clips. `ourStyle` swaps every
 * material for our neutral figure token with flatShading, so the owner can
 * compare "as shipped" against "in our look". drei `Outlines` needs a parent
 * mesh, so the outline toggle covers the procedural figure only.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { SITTING, STANDING } from "../scene/kit";
import type { FigureAction } from "./settings";

type GltfKind = "robot" | "kenney" | "quaternius";

interface ModelSpec {
  url: string;
  /** the pelvis bone, pinned to our seat when sitting */
  hipBone: string;
  /**
   * Overall height (m) for stylised rigs whose hips sit at under a third of
   * their height (big-head robot, chibi); omitted = scale the hips to our
   * figure's standing hip height, which suits realistic proportions.
   */
  height?: number;
  clips: Record<FigureAction, string>;
  /** clips that end in a held pose rather than loop */
  once: string[];
  /** rotation about Y that makes the model face the desk (-Z) */
  faceDesk: number;
  /** root position when standing / walking, feet on the floor (sitting is pinned by the hips) */
  at: Record<Exclude<FigureAction, "sit">, [number, number, number]>;
}

const MODELS: Record<GltfKind, ModelSpec> = {
  robot: {
    url: "/models/spike/RobotExpressive.glb",
    hipBone: "Hips",
    height: 1.6,
    clips: { sit: "Sitting", stand: "Standing", walk: "Walking" },
    once: ["Sitting", "Standing"],
    faceDesk: Math.PI,
    at: { stand: [0, 0, 0.5], walk: [0.7, 0, 0.9] },
  },
  kenney: {
    url: "/models/spike/KenneyMiniCharacterMaleB.glb",
    hipBone: "torso",
    height: 1.5,
    clips: { sit: "sit", stand: "idle", walk: "walk" },
    once: [],
    faceDesk: Math.PI,
    at: { stand: [0, 0, 0.5], walk: [0.7, 0, 0.9] },
  },
  quaternius: {
    url: "/models/spike/QuaterniusAnimationLibrary.gltf",
    hipBone: "DEF-hips",
    clips: { sit: "Sitting_Idle_Loop", stand: "Idle_Loop", walk: "Walk_Loop" },
    once: [],
    faceDesk: Math.PI,
    at: { stand: [0, 0, 0.5], walk: [0.7, 0, 0.9] },
  },
};

const FADE_S = 0.25;

interface GltfFigureProps {
  kind: GltfKind;
  action: FigureAction;
  ourStyle: boolean;
  color: string;
}

/** our figure's hips: standing height, and where they sit on the chair (kit poses.ts) */
const STAND_HIP_Y = STANDING.hip[1];
const SIT_HIP = new THREE.Vector3(...SITTING.hip);

/** Rest-pose hip height in model units. Bounding boxes lie for rigs whose bones carry the scale (RobotExpressive). */
function restHipY(root: THREE.Object3D, bone: string): number {
  root.updateMatrixWorld(true);
  const hip = root.getObjectByName(bone);
  return hip ? hip.getWorldPosition(new THREE.Vector3()).y : 0;
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
    if (spec.height) {
      // not `precise`: that path reads raw bind-space vertices (149 units on RobotExpressive);
      // the default path uses SkinnedMesh.computeBoundingBox, which applies the bones —
      // after their world matrices exist (stale matrices give the same 149)
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(scene);
      const h = box.max.y - box.min.y;
      return h > 0 ? spec.height / h : 1;
    }
    const y = restHipY(scene, spec.hipBone);
    return y > 0 ? STAND_HIP_Y / y : 1;
  }, [scene, spec.hipBone, spec.height]);
  const hip = useMemo(() => scene.getObjectByName(spec.hipBone) ?? null, [scene, spec.hipBone]);
  const hipNow = useMemo(() => new THREE.Vector3(), []);

  // runs after useAnimations' mixer update (same priority, subscribed earlier): pin the sitting hips to our seat
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    if (action !== "sit" || !hip) {
      g.position.set(...spec.at[action === "sit" ? "stand" : action]);
      return;
    }
    hip.getWorldPosition(hipNow);
    g.position.add(SIT_HIP).sub(hipNow);
  });

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
    <group ref={group} rotation={[0, yaw, 0]} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

Object.values(MODELS).forEach((m) => useGLTF.preload(m.url));
