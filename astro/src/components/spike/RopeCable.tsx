/**
 * Spike — cable C: a physics rope with @react-three/rapier. A chain of small
 * dynamic bodies linked by rope joints (max-distance constraints), both ends
 * fixed at the sensor connector and the monitor port; gravity does the sag.
 * The chain is drawn as one tube through the body centres, rebuilt per frame.
 * Needs a running frameloop; `<Physics>` loads the rapier WASM on mount.
 */
import { createRef, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { BallCollider, Physics, RigidBody, interactionGroups, useRopeJoint, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import type { Vec3 } from "../scene/kit";

const LINKS = 16;
const RADIUS = 0.0028;
/** collision group with an empty filter: links never collide with anything (the joints hold them) */
const NO_COLLISION = interactionGroups(1, []);

function Link({ a, b, length }: { a: RefObject<RapierRigidBody | null>; b: RefObject<RapierRigidBody | null>; length: number }) {
  useRopeJoint(a as RefObject<RapierRigidBody>, b as RefObject<RapierRigidBody>, [[0, 0, 0], [0, 0, 0], length]);
  return null;
}

interface ChainProps {
  from: Vec3;
  to: Vec3;
  /** extra rope length beyond the chord (m); more slack = deeper hang */
  slack: number;
  color: string;
}

function Chain({ from, to, slack, color }: ChainProps) {
  const refs = useMemo(() => Array.from({ length: LINKS + 1 }, () => createRef<RapierRigidBody>()), []);
  const tube = useRef<THREE.Mesh>(null);
  const chord = useMemo(() => new THREE.Vector3(...to).distanceTo(new THREE.Vector3(...from)), [from, to]);
  const linkLength = (chord + slack) / LINKS;
  const starts = useMemo(
    () => refs.map((_, i) => new THREE.Vector3(...from).lerp(new THREE.Vector3(...to), i / LINKS)),
    [refs, from, to],
  );

  useFrame(() => {
    const mesh = tube.current;
    if (!mesh) return;
    const points = refs.map((r) => {
      const t = r.current?.translation();
      return t ? new THREE.Vector3(t.x, t.y, t.z) : new THREE.Vector3();
    });
    const curve = new THREE.CatmullRomCurve3(points);
    mesh.geometry.dispose();
    mesh.geometry = new THREE.TubeGeometry(curve, LINKS * 3, RADIUS, 6, false);
  });

  return (
    <>
      {refs.map((ref, i) => (
        <RigidBody
          key={i}
          ref={ref}
          type={i === 0 || i === LINKS ? "fixed" : "dynamic"}
          position={starts[i].toArray()}
          colliders={false}
          linearDamping={1.5}
          angularDamping={1}
          canSleep={false}
          collisionGroups={NO_COLLISION}
        >
          <BallCollider args={[RADIUS]} mass={0.002} />
        </RigidBody>
      ))}
      {refs.slice(1).map((ref, i) => (
        <Link key={i} a={refs[i]} b={ref} length={linkLength} />
      ))}
      <mesh ref={tube} castShadow>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(starts), LINKS * 3, RADIUS, 6, false]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </>
  );
}

export interface RopeCableProps extends ChainProps {
  /** remount the chain when the anchors move (desk height) */
  anchorKey: string;
}

export default function RopeCable({ anchorKey, ...props }: RopeCableProps) {
  return (
    <Physics gravity={[0, -9.81, 0]} timeStep={1 / 90}>
      <Chain key={anchorKey} {...props} />
    </Physics>
  );
}
