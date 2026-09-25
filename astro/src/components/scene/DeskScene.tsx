import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { scenePalette, stateFill, stateText, type DeskState } from "./scenePalette";

/**
 * DeskScene v1 — hero scene of the scene family (DESIGN.md §8).
 *
 * Procedural, flat-shaded, low-poly: desk (two telescopic legs + top),
 * sensor box with a laser beam whose length follows desk height, a live
 * height readout, an oversized monitor whose screen shows a NudgeToast
 * replica, and a keyboard. Two states — SITTING / STANDING — driven by the
 * app's real rules (PLAN.md §13): nudge after 40 min sitting, 1 min up
 * credits 2 min back, 90 min standing suggests sitting again. This demo
 * compresses those minutes into a few seconds for visibility.
 */

const SIT_HEIGHT = 0.72; // m, desk-top height when sitting
const STAND_HEIGHT = 1.12; // m, desk-top height when standing
const SIT_LABEL_CM = 72;
const STAND_LABEL_CM = 112;
const ANIM_MS = 600; // DESIGN.md motion.duration.scene

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface DeskRigProps {
  state: DeskState;
  heightM: number;
}

/** Two telescopic legs + desktop, flat-shaded, low poly (budget: desk <= 800 tris). */
function DeskRig({ state, heightM }: DeskRigProps) {
  const legHeight = heightM - 0.03;
  const legY = legHeight / 2;
  return (
    <group>
      {/* desktop */}
      <mesh position={[0, heightM, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.04, 0.7]} />
        <meshLambertMaterial color={scenePalette.deskTop} flatShading />
      </mesh>
      {/* accent stripe on the front edge, colored by state */}
      <mesh position={[0, heightM - 0.021, 0.351]}>
        <boxGeometry args={[1.4, 0.01, 0.006]} />
        <meshLambertMaterial color={stateFill(state)} flatShading />
      </mesh>
      {/* two telescopic legs */}
      {[-0.6, 0.6].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, legY, -0.28]} castShadow>
            <boxGeometry args={[0.06, legHeight, 0.06]} />
            <meshLambertMaterial color={scenePalette.deskFrame} flatShading />
          </mesh>
          <mesh position={[0, legY, 0.28]} castShadow>
            <boxGeometry args={[0.06, legHeight, 0.06]} />
            <meshLambertMaterial color={scenePalette.deskFrame} flatShading />
          </mesh>
          <mesh position={[0, legHeight - 0.01, 0]} castShadow>
            <boxGeometry args={[0.06, 0.02, 0.62]} />
            <meshLambertMaterial color={scenePalette.deskFrame} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Sensor box under the desktop + laser beam to the floor (beam is the product's proof, DESIGN.md §8). */
function SensorAndBeam({ heightM }: { heightM: number }) {
  const beamLength = heightM - 0.02;
  return (
    <group position={[0, heightM - 0.045, 0.34]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.03, 0.05]} />
        <meshLambertMaterial color={scenePalette.pcb} flatShading />
      </mesh>
      <mesh position={[0, -0.017, 0]}>
        <boxGeometry args={[0.06, 0.004, 0.03]} />
        <meshLambertMaterial color={scenePalette.copper} flatShading />
      </mesh>
      {/* laser beam: thin cylinder, emissive brand color, only point-light-like element */}
      <mesh position={[0, -(beamLength / 2) - 0.015, 0]}>
        <cylinderGeometry args={[0.003, 0.003, beamLength, 8]} />
        <meshBasicMaterial color={scenePalette.brand} />
      </mesh>
      {/* floor dot */}
      <mesh position={[0, -beamLength - 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.02, 12]} />
        <meshBasicMaterial color={scenePalette.brand} />
      </mesh>
    </group>
  );
}

/** Oversized monitor (owner request) whose screen shows a NudgeToast replica via <Html>. */
function Monitor({ heightM, state }: { heightM: number; state: DeskState }) {
  const toastCopy =
    state === "sitting"
      ? { title: "Time to stand", body: "40 minutes sitting. A minute up buys two back." }
      : { title: "Standing confirmed", body: "Nice — credit is ticking. Sit whenever you're ready." };

  return (
    <group position={[0, heightM + 0.02, -0.15]}>
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.4, 0.03]} />
        <meshLambertMaterial color={scenePalette.ink} flatShading />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.56, 0.34]} />
        <meshBasicMaterial color={scenePalette.screen} />
      </mesh>
      <mesh position={[0, -0.24, 0]}>
        <boxGeometry args={[0.04, 0.08, 0.04]} />
        <meshLambertMaterial color={scenePalette.ink} flatShading />
      </mesh>
      <Html
        transform
        position={[0.14, -0.06, 0.017]}
        scale={0.016}
        occlude={false}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            width: 220,
            background: "#FFFFFF",
            borderLeft: `4px solid ${scenePalette.brand}`,
            borderRadius: 12,
            boxShadow: "0 12px 32px -12px rgba(31,36,48,.25)",
            padding: "10px 12px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: stateText(state) }}>{toastCopy.title}</div>
          <div style={{ fontSize: 11, color: "#5B6270", marginTop: 4 }}>{toastCopy.body}</div>
        </div>
      </Html>
    </group>
  );
}

function Keyboard({ heightM }: { heightM: number }) {
  return (
    <mesh position={[0, heightM + 0.011, 0.15]} castShadow>
      <boxGeometry args={[0.32, 0.012, 0.11]} />
      <meshLambertMaterial color={scenePalette.ink} flatShading />
    </mesh>
  );
}

function HeightLabel({ heightCm, state }: { heightCm: number; state: DeskState }) {
  return (
    <Html position={[0.78, SIT_HEIGHT + 0.3, 0]} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 13,
          color: stateText(state),
          background: "#FFFFFFE0",
          padding: "2px 6px",
          borderRadius: 6,
          whiteSpace: "nowrap",
        }}
      >
        {heightCm} cm
      </div>
    </Html>
  );
}

function SceneLights() {
  return (
    <>
      <hemisphereLight color="#ffffff" groundColor={scenePalette.line} intensity={0.9} />
      <directionalLight
        position={[-3, 5, 3]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

/** Drives the animated height + label count; frameloop stays "demand" except mid-animation. */
function AnimatedRig({
  state,
  onSettled,
}: {
  state: DeskState;
  onSettled?: () => void;
}) {
  const target = state === "sitting" ? SIT_HEIGHT : STAND_HEIGHT;
  const heightRef = useRef(target);
  const [height, setHeight] = useState(target);
  const reduced = useMemo(prefersReducedMotion, []);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    if (reduced) {
      heightRef.current = target;
      setHeight(target);
      onSettled?.();
      return;
    }
    fromRef.current = heightRef.current;
    startRef.current = null;
  }, [state, reduced, target, onSettled]);

  useFrame((_, delta) => {
    if (reduced) return;
    if (Math.abs(heightRef.current - target) < 0.0005) return;
    const dir = target > fromRef.current ? 1 : -1;
    const distance = Math.abs(target - fromRef.current);
    const speed = distance / (ANIM_MS / 1000);
    heightRef.current += dir * speed * delta;
    if ((dir === 1 && heightRef.current >= target) || (dir === -1 && heightRef.current <= target)) {
      heightRef.current = target;
      onSettled?.();
    }
    setHeight(heightRef.current);
  });

  const heightCm = Math.round(
    SIT_LABEL_CM + ((height - SIT_HEIGHT) / (STAND_HEIGHT - SIT_HEIGHT)) * (STAND_LABEL_CM - SIT_LABEL_CM)
  );

  return (
    <>
      <DeskRig state={state} heightM={height} />
      <SensorAndBeam heightM={height} />
      <Monitor heightM={height} state={state} />
      <Keyboard heightM={height} />
      <HeightLabel heightCm={heightCm} state={state} />
    </>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 6]} />
      <meshLambertMaterial color={scenePalette.bg} flatShading />
    </mesh>
  );
}

export interface DeskSceneProps {
  /** Initial state; defaults to "sitting" (DESIGN.md hero: sit -> toast -> stand). */
  initialState?: DeskState;
  /** Auto-play the sit/stand loop; disabled automatically under prefers-reduced-motion. */
  autoPlay?: boolean;
}

export default function DeskScene({ initialState = "sitting", autoPlay = false }: DeskSceneProps) {
  const [state, setState] = useState<DeskState>(initialState);
  const reduced = useMemo(prefersReducedMotion, []);

  useEffect(() => {
    if (!autoPlay || reduced) return;
    const id = window.setInterval(() => {
      setState((s) => (s === "sitting" ? "standing" : "sitting"));
    }, 4000);
    return () => window.clearInterval(id);
  }, [autoPlay, reduced]);

  return (
    <div>
      <div
        style={{
          aspectRatio: "16 / 10",
          borderRadius: 20,
          overflow: "hidden",
          background: scenePalette.bg,
        }}
        role="img"
        aria-label={`Desk scene, currently ${state}`}
      >
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          shadows
          camera={{ position: [1.9, 1.55, 2.7], fov: 35 }}
          onCreated={({ camera }) => camera.lookAt(0, 0.85, 0)}
          gl={{ antialias: true }}
        >
          <SceneLights />
          <Floor />
          <AnimatedRig state={state} />
        </Canvas>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          className="focus-ring"
          onClick={() => setState("sitting")}
          disabled={state === "sitting"}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${scenePalette.line}`,
            background: state === "sitting" ? scenePalette.sitting : "transparent",
            cursor: state === "sitting" ? "default" : "pointer",
          }}
        >
          Sit down
        </button>
        <button
          type="button"
          className="focus-ring"
          onClick={() => setState("standing")}
          disabled={state === "standing"}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${scenePalette.line}`,
            background: state === "standing" ? scenePalette.standing : "transparent",
            cursor: state === "standing" ? "default" : "pointer",
          }}
        >
          Stand up
        </button>
      </div>
    </div>
  );
}
