/**
 * Scene kit — the simple person (DESIGN.md §8.5), built the way a figure is
 * sketched: overlapping faceted ellipsoids for the masses (head, ribcage,
 * pelvis, shoulder caps, hands, feet) and faceted capsules for the limbs.
 * No boxes. Joints are nested groups so a pose is nothing but angles; see
 * `poses.ts`. The ghost finish is kept for scenes that need "someone was here".
 */
import { Blob, Capsule, GHOST_DEPTH_ORDER, type Finish, type Vec3 } from "./Block";
import { BODY, type Pose } from "./poses";

interface MassProps {
  size: Vec3;
  position: Vec3;
  color: string;
  finish: Finish;
  detail?: 1 | 2;
}

/** An ellipsoid mass; ghost masses get the depth pre-pass so overlaps never double-blend. */
function Mass({ size, position, color, finish, detail = 1 }: MassProps) {
  if (finish !== "ghost") return <Blob size={size} position={position} color={color} detail={detail} />;
  return (
    <>
      <Blob size={size} position={position} color={color} detail={detail} finish="ghostDepth" renderOrder={GHOST_DEPTH_ORDER} />
      <Blob size={size} position={position} color={color} detail={detail} finish="ghost" castShadow={false} />
    </>
  );
}

interface LimbSegmentProps {
  radius: number;
  length: number;
  /** y of the joint this segment hangs from (segment extends toward -Y) */
  color: string;
  finish: Finish;
}

/** A capsule hanging from the local origin toward -Y. */
function Segment({ radius, length, color, finish }: LimbSegmentProps) {
  const position: Vec3 = [0, -(length / 2 + radius), 0];
  if (finish !== "ghost") return <Capsule radius={radius} length={length} position={position} color={color} />;
  return (
    <>
      <Capsule radius={radius} length={length} position={position} color={color} finish="ghostDepth" renderOrder={GHOST_DEPTH_ORDER} />
      <Capsule radius={radius} length={length} position={position} color={color} finish="ghost" castShadow={false} />
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
  const upperTotal = BODY.upperArm.length + 2 * BODY.upperArm.radius;
  const foreTotal = BODY.forearm.length + 2 * BODY.forearm.radius;
  return (
    <group position={[side * BODY.shoulderX, BODY.shoulderY, 0]} rotation={[pose.shoulder, 0, 0]}>
      <Mass size={BODY.shoulderCap} position={[side * 0.005, 0.005, 0]} color={color} finish={finish} />
      <Segment {...BODY.upperArm} color={color} finish={finish} />
      <group position={[0, -upperTotal + BODY.upperArm.radius * 0.6, 0]} rotation={[pose.elbow, 0, 0]}>
        <Segment {...BODY.forearm} color={color} finish={finish} />
        <Mass size={BODY.hand} position={[0, -foreTotal + 0.01, -0.015]} color={color} finish={finish} />
      </group>
    </group>
  );
}

function Leg({ side, pose, color, finish }: LimbProps) {
  const thighTotal = BODY.thigh.length + 2 * BODY.thigh.radius;
  const shinTotal = BODY.shin.length + 2 * BODY.shin.radius;
  return (
    <group position={[side * BODY.hipX, 0, 0]} rotation={[pose.thigh, 0, 0]}>
      <Segment {...BODY.thigh} color={color} finish={finish} />
      <group position={[0, -thighTotal + BODY.thigh.radius * 0.2, 0]} rotation={[pose.knee, 0, 0]}>
        <Segment {...BODY.shin} color={color} finish={finish} />
        <Mass size={BODY.foot} position={[0, -shinTotal + 0.01, -0.06]} color={color} finish={finish} />
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
  const neckTotal = BODY.neck.length + 2 * BODY.neck.radius;
  const ribTop = 0.22 + BODY.ribcage[1] / 2;
  return (
    <group position={pose.hip}>
      <group rotation={[pose.torsoLean, 0, 0]}>
        <Mass size={BODY.pelvis} position={[0, 0.06, 0]} color={color} finish={finish} />
        <Mass size={BODY.ribcage} position={[0, 0.3, -0.01]} color={color} finish={finish} />
        <group position={[0, ribTop + neckTotal - 0.03, -0.01]}>
          <Segment {...BODY.neck} color={color} finish={finish} />
        </group>
        <Mass size={BODY.head} position={[0, ribTop + neckTotal + BODY.head[1] / 2 - 0.06, 0]} color={color} finish={finish} detail={2} />
        <Arm side={1} pose={pose} color={color} finish={finish} />
        <Arm side={-1} pose={pose} color={color} finish={finish} />
      </group>
      <Leg side={1} pose={pose} color={color} finish={finish} />
      <Leg side={-1} pose={pose} color={color} finish={finish} />
    </group>
  );
}
