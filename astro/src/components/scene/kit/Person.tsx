/**
 * Scene kit — the simple person (DESIGN.md §8.5).
 *
 * A sand mannequin built from kit blocks and a faceted head, modelled by the
 * light rig like everything else. Joints are nested groups so a pose is
 * nothing but angles; see `poses.ts`. `finish="ghost"` gives the translucent
 * variant for scenes that need "someone was here".
 */
import { Block, Surface, GHOST_DEPTH_ORDER, type Finish, type Vec3 } from "./Block";
import { BODY, type Pose } from "./poses";
import { SEGMENTS } from "./style";

interface PartProps {
  size: Vec3;
  position: Vec3;
  color: string;
  finish: Finish;
}

/** A body part; ghost parts get the depth pre-pass so limbs never double-blend. */
function Part({ size, position, color, finish }: PartProps) {
  if (finish !== "ghost") {
    return <Block size={size} position={position} bevel="body" color={color} />;
  }
  return (
    <>
      <Block size={size} position={position} bevel="body" color={color} finish="ghostDepth" renderOrder={GHOST_DEPTH_ORDER} />
      <Block size={size} position={position} bevel="body" color={color} finish="ghost" castShadow={false} />
    </>
  );
}

function Head({ position, color, finish }: { position: Vec3; color: string; finish: Finish }) {
  const geometry = <icosahedronGeometry args={[BODY.headRadius, SEGMENTS.head]} />;
  if (finish !== "ghost") {
    return (
      <mesh position={position} castShadow>
        {geometry}
        <Surface color={color} />
      </mesh>
    );
  }
  return (
    <>
      <mesh position={position} renderOrder={GHOST_DEPTH_ORDER} castShadow>
        {geometry}
        <Surface color={color} finish="ghostDepth" />
      </mesh>
      <mesh position={position}>
        {geometry}
        <Surface color={color} finish="ghost" />
      </mesh>
    </>
  );
}

interface LimbProps {
  side: 1 | -1;
  pose: Pose;
  color: string;
  finish: Finish;
}

function Arm({ side, pose, color, finish }: LimbProps) {
  const [, upperLen] = BODY.upperArm;
  const [, foreLen] = BODY.forearm;
  return (
    <group position={[side * BODY.shoulderX, BODY.torso[1] - 0.04, 0]} rotation={[pose.shoulder, 0, 0]}>
      <Part size={BODY.upperArm} position={[0, -upperLen / 2, 0]} color={color} finish={finish} />
      <group position={[0, -upperLen, 0]} rotation={[pose.elbow, 0, 0]}>
        <Part size={BODY.forearm} position={[0, -foreLen / 2, 0]} color={color} finish={finish} />
        <Part size={BODY.hand} position={[0, -foreLen - 0.01, -0.01]} color={color} finish={finish} />
      </group>
    </group>
  );
}

function Leg({ side, pose, color, finish }: LimbProps) {
  const [, thighLen] = BODY.thigh;
  const [, shinLen] = BODY.shin;
  const footH = BODY.foot[1];
  return (
    <group position={[side * BODY.hipX, 0, 0]} rotation={[pose.thigh, 0, 0]}>
      <Part size={BODY.thigh} position={[0, -thighLen / 2, 0]} color={color} finish={finish} />
      <group position={[0, -thighLen, 0]} rotation={[pose.knee, 0, 0]}>
        <Part size={BODY.shin} position={[0, -shinLen / 2, 0]} color={color} finish={finish} />
        <Part size={BODY.foot} position={[0, -shinLen - footH / 2 + 0.01, -0.05]} color={color} finish={finish} />
      </group>
    </group>
  );
}

export interface PersonProps {
  pose: Pose;
  /** token: material.figure (solid) or the ghost colour */
  color: string;
  finish?: Finish;
}

/** The person, rooted at the hips. Faces -Z (toward the desk). */
export function Person({ pose, color, finish = "matte" }: PersonProps) {
  const [, torsoH] = BODY.torso;
  return (
    <group position={pose.hip}>
      <group rotation={[pose.torsoLean, 0, 0]}>
        <Part size={BODY.torso} position={[0, torsoH / 2 + 0.02, 0]} color={color} finish={finish} />
        <Part size={BODY.neck} position={[0, torsoH + 0.04, 0]} color={color} finish={finish} />
        <Head position={[0, torsoH + 0.06 + BODY.headRadius, 0]} color={color} finish={finish} />
        <Arm side={1} pose={pose} color={color} finish={finish} />
        <Arm side={-1} pose={pose} color={color} finish={finish} />
      </group>
      <Leg side={1} pose={pose} color={color} finish={finish} />
      <Leg side={-1} pose={pose} color={color} finish={finish} />
    </group>
  );
}
