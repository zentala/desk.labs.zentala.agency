/**
 * Scene kit — the ghost person (DESIGN.md §8.5).
 *
 * Built only from kit blocks in the "ghost" finish. Joints are nested groups
 * so a pose is nothing but angles; see `poses.ts`. Every part is drawn twice
 * (depth pre-pass + equal-depth colour pass) so overlapping limbs read as one
 * translucent body instead of double-blended blobs.
 */
import { Block, GHOST_DEPTH_ORDER, Surface, type Vec3 } from "./Block";
import { BODY, type Pose } from "./poses";
import { SEGMENTS } from "./style";

interface PartProps {
  size: Vec3;
  position: Vec3;
  color: string;
}

function GhostBlock({ size, position, color }: PartProps) {
  return (
    <>
      <Block size={size} position={position} bevel="body" color={color} finish="ghostDepth" renderOrder={GHOST_DEPTH_ORDER} />
      <Block size={size} position={position} bevel="body" color={color} finish="ghost" castShadow={false} />
    </>
  );
}

function GhostHead({ position, color }: { position: Vec3; color: string }) {
  return (
    <>
      <mesh position={position} renderOrder={GHOST_DEPTH_ORDER} castShadow>
        <icosahedronGeometry args={[BODY.headRadius, SEGMENTS.head]} />
        <Surface color={color} finish="ghostDepth" />
      </mesh>
      <mesh position={position}>
        <icosahedronGeometry args={[BODY.headRadius, SEGMENTS.head]} />
        <Surface color={color} finish="ghost" />
      </mesh>
    </>
  );
}

interface LimbProps {
  side: 1 | -1;
  pose: Pose;
  color: string;
}

function Arm({ side, pose, color }: LimbProps) {
  const [, upperLen] = BODY.upperArm;
  const [, foreLen] = BODY.forearm;
  return (
    <group position={[side * BODY.shoulderX, BODY.torso[1] - 0.05, 0]} rotation={[pose.shoulder, 0, 0]}>
      <GhostBlock size={BODY.upperArm} position={[0, -upperLen / 2, 0]} color={color} />
      <group position={[0, -upperLen, 0]} rotation={[pose.elbow, 0, 0]}>
        <GhostBlock size={BODY.forearm} position={[0, -foreLen / 2, 0]} color={color} />
      </group>
    </group>
  );
}

function Leg({ side, pose, color }: LimbProps) {
  const [, thighLen] = BODY.thigh;
  const [, shinLen] = BODY.shin;
  const footH = BODY.foot[1];
  return (
    <group position={[side * BODY.hipX, 0, 0]} rotation={[pose.thigh, 0, 0]}>
      <GhostBlock size={BODY.thigh} position={[0, -thighLen / 2, 0]} color={color} />
      <group position={[0, -thighLen, 0]} rotation={[pose.knee, 0, 0]}>
        <GhostBlock size={BODY.shin} position={[0, -shinLen / 2, 0]} color={color} />
        <GhostBlock size={BODY.foot} position={[0, -shinLen - footH / 2 + 0.01, -0.05]} color={color} />
      </group>
    </group>
  );
}

export interface PersonProps {
  pose: Pose;
  /** token: material.sweater */
  color: string;
}

/** The person, rooted at the hips. Faces -Z (toward the desk). */
export function Person({ pose, color }: PersonProps) {
  const [, torsoH] = BODY.torso;
  return (
    <group position={pose.hip}>
      <group rotation={[pose.torsoLean, 0, 0]}>
        <GhostBlock size={BODY.torso} position={[0, torsoH / 2 + 0.02, 0]} color={color} />
        <GhostBlock size={[0.1, 0.08, 0.1]} position={[0, torsoH + 0.04, 0]} color={color} />
        <GhostHead position={[0, torsoH + 0.07 + BODY.headRadius, 0]} color={color} />
        <Arm side={1} pose={pose} color={color} />
        <Arm side={-1} pose={pose} color={color} />
      </group>
      <Leg side={1} pose={pose} color={color} />
      <Leg side={-1} pose={pose} color={color} />
    </group>
  );
}
