/**
 * Scene kit — the simple person (DESIGN.md §8.5), built the way a figure is
 * sketched: overlapping ellipsoids for the masses (head, ribcage, pelvis,
 * hands, feet) and capsules for the limbs. No boxes, no shoulder caps.
 * `figureStyle="faceted"` keeps the low-poly facets; `"smooth"` is the
 * architectural-model convention — a smooth clay figure in a faceted world.
 * Joints are nested groups so a pose is nothing but angles; see `poses.ts`.
 */
import { Blob, Capsule, GHOST_DEPTH_ORDER, type Finish, type Vec3 } from "./Block";
import { BODY, type Pose } from "./poses";

export type FigureStyle = "faceted" | "smooth";

interface StyleProps {
  color: string;
  finish: Finish;
  smooth: boolean;
}

interface MassProps extends StyleProps {
  size: Vec3;
  position: Vec3;
  detail?: 1 | 2;
}

/** An ellipsoid mass; ghost masses get the depth pre-pass so overlaps never double-blend. */
function Mass({ size, position, color, finish, smooth, detail = 1 }: MassProps) {
  if (finish !== "ghost") return <Blob size={size} position={position} color={color} detail={detail} smooth={smooth} />;
  return (
    <>
      <Blob size={size} position={position} color={color} detail={detail} smooth={smooth} finish="ghostDepth" renderOrder={GHOST_DEPTH_ORDER} />
      <Blob size={size} position={position} color={color} detail={detail} smooth={smooth} finish="ghost" castShadow={false} />
    </>
  );
}

interface SegmentProps extends StyleProps {
  radius: number;
  length: number;
}

/** A capsule hanging from the local origin toward -Y. */
function Segment({ radius, length, color, finish, smooth }: SegmentProps) {
  const position: Vec3 = [0, -(length / 2 + radius), 0];
  if (finish !== "ghost") return <Capsule radius={radius} length={length} position={position} color={color} smooth={smooth} />;
  return (
    <>
      <Capsule radius={radius} length={length} position={position} color={color} smooth={smooth} finish="ghostDepth" renderOrder={GHOST_DEPTH_ORDER} />
      <Capsule radius={radius} length={length} position={position} color={color} smooth={smooth} finish="ghost" castShadow={false} />
    </>
  );
}

interface LimbProps extends StyleProps {
  side: 1 | -1;
  pose: Pose;
}

function Arm({ side, pose, ...style }: LimbProps) {
  const upperTotal = BODY.upperArm.length + 2 * BODY.upperArm.radius;
  const foreTotal = BODY.forearm.length + 2 * BODY.forearm.radius;
  return (
    <group position={[side * BODY.shoulderX, BODY.shoulderY, 0]} rotation={[pose.shoulder, 0, 0]}>
      <Segment {...BODY.upperArm} {...style} />
      <group position={[0, -upperTotal + BODY.upperArm.radius * 0.6, 0]} rotation={[pose.elbow, 0, 0]}>
        <Segment {...BODY.forearm} {...style} />
        <Mass size={BODY.hand} position={[0, -foreTotal + 0.01, -0.015]} {...style} />
      </group>
    </group>
  );
}

function Leg({ side, pose, ...style }: LimbProps) {
  const thighTotal = BODY.thigh.length + 2 * BODY.thigh.radius;
  const shinTotal = BODY.shin.length + 2 * BODY.shin.radius;
  return (
    <group position={[side * BODY.hipX, 0, 0]} rotation={[pose.thigh, 0, 0]}>
      <Segment {...BODY.thigh} {...style} />
      <group position={[0, -thighTotal + BODY.thigh.radius * 0.2, 0]} rotation={[pose.knee, 0, 0]}>
        <Segment {...BODY.shin} {...style} />
        <Mass size={BODY.foot} position={[0, -shinTotal + 0.01, -0.06]} {...style} />
      </group>
    </group>
  );
}

export interface PersonProps {
  pose: Pose;
  /** token: material.figure (solid) or the ghost colour */
  color: string;
  finish?: Finish;
  figureStyle?: FigureStyle;
}

/** The person, rooted at the hips. Faces -Z (toward the desk). */
export function Person({ pose, color, finish = "matte", figureStyle = "faceted" }: PersonProps) {
  const style: StyleProps = { color, finish, smooth: figureStyle === "smooth" };
  const neckTotal = BODY.neck.length + 2 * BODY.neck.radius;
  const ribTop = 0.22 + BODY.ribcage[1] / 2;
  return (
    <group position={pose.hip}>
      <group rotation={[pose.torsoLean, 0, 0]}>
        <Mass size={BODY.pelvis} position={[0, 0.06, 0]} {...style} />
        <Mass size={BODY.ribcage} position={[0, 0.3, -0.01]} {...style} />
        <group position={[0, ribTop + neckTotal - 0.03, -0.01]}>
          <Segment {...BODY.neck} {...style} />
        </group>
        <Mass size={BODY.head} position={[0, ribTop + neckTotal + BODY.head[1] / 2 - 0.06, 0]} {...style} detail={2} />
        <Arm side={1} pose={pose} {...style} />
        <Arm side={-1} pose={pose} {...style} />
      </group>
      <Leg side={1} pose={pose} {...style} />
      <Leg side={-1} pose={pose} {...style} />
    </group>
  );
}
