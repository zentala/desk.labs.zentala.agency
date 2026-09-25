/**
 * Studio — ready-made rigged figures (public/models/studio/LICENSES.md) driven
 * by the storyboard frame. No clock: every frame sets each clip's time and
 * weight from `u` (`pickClips`) and calls `mixer.update(0)`, so scrubbing to
 * the same `u` gives the same pose. After the clip, `relax` edits the pose
 * (shoulders, spine, knees, fingers) and a two-bone IK rests the wrists on
 * the keyboard while seated. `ourStyle` swaps every material for our neutral
 * figure token with flatShading.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { SITTING, STANDING, type Vec3 } from "../scene/kit";
import type { SceneFrame } from "../scene/kit/timeline";
import { GLTF_FIGURES, pickClips, type GltfKind } from "./figures";
import { applyRelax, type Keyboard } from "./relax";
import type { RelaxParams } from "./settings";

const STAND_HIP_Y = STANDING.hip[1];
const SIT_HIP = new THREE.Vector3(...SITTING.hip);
/** where a figure without enter/exit clips stands at the desk (m) */
const STAND_ROOT = new THREE.Vector3(0, 0, 0.5);

interface GltfFigureProps {
  kind: GltfKind;
  frame: SceneFrame;
  walk: { position: Vec3; yaw: number };
  ourStyle: boolean;
  color: string;
  relax: RelaxParams;
  keyboard: Keyboard;
}

/** Height scale: stylised rigs by their skinned height, realistic ones by hip height. */
function figureScale(scene: THREE.Object3D, hipBone: string, height?: number): number {
  scene.updateMatrixWorld(true);
  if (height) {
    // default (not `precise`) Box3 uses SkinnedMesh.computeBoundingBox, which applies the bones
    const box = new THREE.Box3().setFromObject(scene);
    const h = box.max.y - box.min.y;
    return h > 0 ? height / h : 1;
  }
  const hip = scene.getObjectByName(hipBone);
  const y = hip ? hip.getWorldPosition(new THREE.Vector3()).y : 0;
  return y > 0 ? STAND_HIP_Y / y : 1;
}

function restyle(root: THREE.Object3D, color: string): () => void {
  const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const ours = new THREE.MeshLambertMaterial({ color, flatShading: true });
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    originals.set(m, m.material);
    m.material = ours;
  });
  return () => {
    originals.forEach((mat, mesh) => (mesh.material = mat));
    ours.dispose();
  };
}

export default function GltfFigure({ kind, frame, walk, ourStyle, color, relax, keyboard }: GltfFigureProps) {
  const spec = GLTF_FIGURES[kind];
  const gltf = useGLTF(spec.url);
  const clipSource = useGLTF(spec.clipsUrl ?? spec.url);
  const scene = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);
  const group = useRef<THREE.Group>(null);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const actions = useMemo(
    () => Object.fromEntries(clipSource.animations.map((c) => [c.name, mixer.clipAction(c)])),
    [clipSource.animations, mixer],
  );
  const durations = useMemo(() => Object.fromEntries(clipSource.animations.map((c) => [c.name, c.duration])), [clipSource.animations]);
  const scale = useMemo(() => figureScale(scene, spec.rig.hips, spec.height), [scene, spec.rig.hips, spec.height]);
  const hip = useMemo(() => scene.getObjectByName(spec.rig.hips) ?? null, [scene, spec.rig.hips]);
  const sitRoot = useRef<THREE.Vector3 | null>(null);
  // Every bone as the mixer last left it, before the relax edits. The mixer only writes a bone when
  // its blended value CHANGED since its last write (PropertyMixer.apply), so a paused clip would
  // never undo last frame's edits and they accumulated (5°/frame until the spine lay flat, E005).
  // Restoring this snapshot first makes each frame start from the clip's pose.
  const bones = useMemo(() => {
    const list: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) list.push(o);
    });
    return list;
  }, [scene]);
  const snapshot = useRef<Array<[THREE.Quaternion, THREE.Vector3]> | null>(null);
  const missing = useRef(new Set<string>());

  useEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false; // skinned meshes leave their rest-pose bounds
      }
    });
    return () => void mixer.stopAllAction();
  }, [scene, mixer]);

  useEffect(() => (ourStyle ? restyle(scene, color) : undefined), [scene, ourStyle, color]);

  /** Pose the mixer for a set of picks: every other action off, time and weight set, no clock. */
  const pose = (picks: ReturnType<typeof pickClips>) => {
    if (snapshot.current?.length !== bones.length) snapshot.current = null;
    snapshot.current?.forEach(([q, pos], i) => {
      bones[i].quaternion.copy(q);
      bones[i].position.copy(pos);
    });
    for (const a of Object.values(actions)) a.enabled = false;
    for (const p of picks) {
      const a = actions[p.name];
      if (!a) {
        if (!missing.current.has(p.name)) console.warn(`[studio] ${kind}: no clip "${p.name}"`);
        missing.current.add(p.name);
        continue;
      }
      a.enabled = true;
      a.play();
      a.paused = true;
      a.time = p.time;
      a.setEffectiveWeight(p.weight);
    }
    mixer.update(0);
    snapshot.current = bones.map((b) => [b.quaternion.clone(), b.position.clone()]);
  };

  useFrame(() => {
    const g = group.current;
    if (!g || !hip) return;
    // once per figure: where the root must be for the seated clip's hips to land on our seat
    if (!sitRoot.current) {
      pose([{ name: spec.clips.sit, time: 0, weight: 1 }]);
      g.position.set(0, 0, 0);
      g.rotation.set(0, spec.faceDesk, 0);
      g.updateMatrixWorld(true);
      sitRoot.current = SIT_HIP.clone().sub(hip.getWorldPosition(new THREE.Vector3()));
    }
    const sit = sitRoot.current;
    // with enter/exit clips the character stands up in place; without them, cross-fade and slide
    const standAt = spec.clips.exit ? new THREE.Vector3(sit.x, 0, sit.z) : STAND_ROOT;
    const k = frame.actionT * frame.actionT * (3 - 2 * frame.actionT);
    const root = new THREE.Vector3();
    if (frame.action === "sit") root.copy(sit);
    else if (frame.action === "stand") root.copy(standAt);
    else if (frame.action === "rise" || frame.action === "leave") root.copy(spec.clips.exit ? sit : sit.clone().lerp(standAt, k));
    else if (frame.action === "lower") root.copy(spec.clips.enter ? sit : standAt.clone().lerp(sit, k));
    else root.copy(standAt).add(new THREE.Vector3(...walk.position));

    pose(pickClips(spec.clips, durations, frame.action, frame.actionT, frame.u, relax.talkBlend));
    g.position.copy(root);
    g.rotation.set(0, spec.faceDesk + walk.yaw, 0);
    g.updateMatrixWorld(true);
    applyRelax(scene, spec.rig, relax, { action: frame.action, yaw: walk.yaw, keyboard });
  });

  return (
    <group ref={group} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

Object.values(GLTF_FIGURES).forEach((m) => useGLTF.preload(m.url));
