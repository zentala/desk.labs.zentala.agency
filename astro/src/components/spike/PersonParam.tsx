/**
 * Spike — the kit's sketched figure (`kit/Person.tsx`) with three body
 * parameters exposed (shoulder width, leg thickness, waist) and an optional
 * drei `<Outlines>` on every mesh. Same joints, same poses.
 */
import { Outlines } from "@react-three/drei";
import { BODY, SEGMENTS, type Pose, type Vec3 } from "../scene/kit";

export interface BodyParams {
  shoulderWidth: number;
  legThickness: number;
  waist: number;
}

interface StyleProps {
  color: string;
  smooth: boolean;
  outlines: boolean;
  inkColor: string;
}

/** screen-space so the scaled ellipsoids get the same line as the capsules */
const OUTLINE_PX = 1.5;

function Skin({ color, smooth, outlines, inkColor }: StyleProps) {
  return (
    <>
      {smooth ? <meshLambertMaterial color={color} /> : <meshLambertMaterial color={color} flatShading />}
      {outlines && <Outlines screenspace thickness={OUTLINE_PX} color={inkColor} />}
    </>
  );
}

function Mass({ size, position, detail = 1, ...style }: StyleProps & { size: Vec3; position: Vec3; detail?: 1 | 2 }) {
  return (
    <mesh position={position} scale={[size[0] / 2, size[1] / 2, size[2] / 2]} castShadow receiveShadow>
      {style.smooth ? <sphereGeometry args={[1, SEGMENTS.smoothSphere, SEGMENTS.smoothSphere / 2]} /> : <icosahedronGeometry args={[1, detail]} />}
      <Skin {...style} />
    </mesh>
  );
}

function Segment({ radius, length, ...style }: StyleProps & { radius: number; length: number }) {
  const [cap, radial] = style.smooth ? [SEGMENTS.smoothCapsuleCap, SEGMENTS.smoothCapsuleRadial] : [SEGMENTS.capsuleCap, SEGMENTS.capsuleRadial];
  return (
    <mesh position={[0, -(length / 2 + radius), 0]} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, cap, radial]} />
      <Skin {...style} />
    </mesh>
  );
}

function Arm({ side, pose, shoulderX, ...style }: StyleProps & { side: 1 | -1; pose: Pose; shoulderX: number }) {
  const upperTotal = BODY.upperArm.length + 2 * BODY.upperArm.radius;
  const foreTotal = BODY.forearm.length + 2 * BODY.forearm.radius;
  return (
    <group position={[side * shoulderX, BODY.shoulderY, 0]} rotation={[pose.shoulder, 0, 0]}>
      <Segment {...BODY.upperArm} {...style} />
      <group position={[0, -upperTotal + BODY.upperArm.radius * 0.6, 0]} rotation={[pose.elbow, 0, 0]}>
        <Segment {...BODY.forearm} {...style} />
        <Mass size={BODY.hand} position={[0, -foreTotal + 0.01, -0.015]} {...style} />
      </group>
    </group>
  );
}

function Leg({ side, pose, thighRadius, ...style }: StyleProps & { side: 1 | -1; pose: Pose; thighRadius: number }) {
  const shinRadius = thighRadius * (BODY.shin.radius / BODY.thigh.radius);
  const thighTotal = BODY.thigh.length + 2 * thighRadius;
  const shinTotal = BODY.shin.length + 2 * shinRadius;
  return (
    <group position={[side * BODY.hipX, 0, 0]} rotation={[pose.thigh, 0, 0]}>
      <Segment radius={thighRadius} length={BODY.thigh.length} {...style} />
      <group position={[0, -thighTotal + thighRadius * 0.2, 0]} rotation={[pose.knee, 0, 0]}>
        <Segment radius={shinRadius} length={BODY.shin.length} {...style} />
        <Mass size={BODY.foot} position={[0, -shinTotal + 0.01, -0.06]} {...style} />
      </group>
    </group>
  );
}

export interface PersonParamProps extends StyleProps {
  pose: Pose;
  body: BodyParams;
  /** added to the pose's hip position (the walk-away placement) */
  hipOffset?: Vec3;
}

/** The person, rooted at the hips, facing -Z. */
export function PersonParam({ pose, body, hipOffset = [0, 0, 0], ...style }: PersonParamProps) {
  const neckTotal = BODY.neck.length + 2 * BODY.neck.radius;
  const ribTop = 0.22 + BODY.ribcage[1] / 2;
  const ribcage: Vec3 = [body.shoulderWidth, BODY.ribcage[1], BODY.ribcage[2]];
  const shoulderX = BODY.shoulderX * (body.shoulderWidth / BODY.ribcage[0]);
  const hip: Vec3 = [pose.hip[0] + hipOffset[0], pose.hip[1] + hipOffset[1], pose.hip[2] + hipOffset[2]];
  return (
    <group position={hip}>
      <group rotation={[pose.torsoLean, 0, 0]}>
        <Mass size={BODY.pelvis} position={[0, 0.04, 0]} {...style} />
        <group position={[0, 0.2, -0.005]}>
          <Segment radius={body.waist} length={BODY.waist.length} {...style} />
        </group>
        <Mass size={ribcage} position={[0, 0.3, -0.01]} {...style} />
        <group position={[0, ribTop + neckTotal - 0.03, -0.01]}>
          <Segment {...BODY.neck} {...style} />
        </group>
        <Mass size={BODY.head} position={[0, ribTop + neckTotal + BODY.head[1] / 2 - 0.06, 0]} {...style} detail={2} />
        <Arm side={1} pose={pose} shoulderX={shoulderX} {...style} />
        <Arm side={-1} pose={pose} shoulderX={shoulderX} {...style} />
      </group>
      <Leg side={1} pose={pose} thighRadius={body.legThickness} {...style} />
      <Leg side={-1} pose={pose} thighRadius={body.legThickness} {...style} />
    </group>
  );
}
