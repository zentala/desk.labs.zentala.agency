import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scenePalette, stateFill, stateText, type DeskState } from "./scenePalette";

/**
 * DeskScene v1 — hero scene of the scene family (DESIGN.md §8).
 *
 * Procedural, flat-shaded, low-poly: desk (two telescopic columns + top),
 * sensor box with a laser beam whose length follows desk height, a live
 * height readout chip, an oversized monitor whose screen is a CanvasTexture
 * replica of the real NudgeToast, a keyboard and mouse, a rug and two warm
 * props. Two states — SITTING / STANDING — driven by the app's real rules
 * (PLAN.md §13): nudge after 40 min sitting, 1 min up credits 2 min back,
 * 90 min standing suggests sitting again. This demo compresses those minutes
 * into a few seconds for visibility.
 */

const SIT_HEIGHT = 0.72; // m, desk-top height when sitting
const STAND_HEIGHT = 1.12; // m, desk-top height when standing
const SIT_LABEL_CM = 72;
const STAND_LABEL_CM = 112;
const ANIM_MS = 600; // DESIGN.md motion.duration.scene
const DESK_W = 1.4; // m, ~140 cm
const DESK_D = 0.7; // m, ~70 cm

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface DeskRigProps {
  state: DeskState;
  heightM: number;
}

/**
 * Desktop + two telescopic columns (outer sleeve + inner sleeve that extends
 * on stand), foot bars, crossbeam under the top, control paddle at the front
 * edge. Reads as a real electric standing desk. Budget: desk <= 800 tris.
 */
function DeskRig({ state, heightM }: DeskRigProps) {
  const t = (heightM - SIT_HEIGHT) / (STAND_HEIGHT - SIT_HEIGHT); // 0 sitting .. 1 standing
  const outerSleeveH = 0.46; // fixed outer sleeve height
  const outerSleeveY = outerSleeveH / 2;
  const innerSleeveH = heightM - outerSleeveH - 0.02; // grows as desk rises
  const innerSleeveY = outerSleeveH + innerSleeveH / 2;

  return (
    <group>
      {/* desktop */}
      <mesh position={[0, heightM, 0]} castShadow receiveShadow>
        <boxGeometry args={[DESK_W, 0.035, DESK_D]} />
        <meshLambertMaterial color={scenePalette.deskTop} flatShading />
      </mesh>
      {/* accent stripe on the front edge, colored by state */}
      <mesh position={[0, heightM - 0.019, DESK_D / 2 + 0.001]}>
        <boxGeometry args={[DESK_W, 0.008, 0.006]} />
        <meshLambertMaterial color={stateFill(state)} flatShading />
      </mesh>
      {/* crossbeam under the top, connecting the two columns */}
      <mesh position={[0, heightM - 0.06, -DESK_D / 2 + 0.08]} castShadow>
        <boxGeometry args={[DESK_W - 0.16, 0.05, 0.05]} />
        <meshLambertMaterial color={scenePalette.deskFrame} flatShading />
      </mesh>
      {/* control paddle, front edge, centered */}
      <mesh position={[0, heightM - 0.03, DESK_D / 2 - 0.02]} castShadow>
        <boxGeometry args={[0.09, 0.02, 0.035]} />
        <meshLambertMaterial color={scenePalette.ink} flatShading />
      </mesh>

      {/* two telescopic columns, each: T-shaped foot bar + outer sleeve + inner sleeve */}
      {[-0.58, 0.58].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {/* foot bar */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.09, 0.04, 0.5]} />
            <meshLambertMaterial color={scenePalette.deskFrame} flatShading />
          </mesh>
          {/* outer sleeve (fixed) */}
          <mesh position={[0, outerSleeveY, 0]} castShadow>
            <boxGeometry args={[0.075, outerSleeveH, 0.075]} />
            <meshLambertMaterial color={scenePalette.deskFrame} flatShading />
          </mesh>
          {/* inner sleeve (telescopes up on stand), slightly narrower */}
          <mesh position={[0, innerSleeveY, 0]} castShadow>
            <boxGeometry args={[0.05, Math.max(innerSleeveH, 0.02), 0.05]} />
            <meshLambertMaterial color={scenePalette.ink} flatShading />
          </mesh>
        </group>
      ))}
      {/* visible telescope progress: a thin seam indicator on the front column, fades with t */}
      <mesh position={[0, 0.02 + t * 0.001, DESK_D / 2 - 0.34]} visible={false} />
    </group>
  );
}

/** Sensor box under the FRONT edge of the desktop, clearly visible from camera + laser beam to floor. */
function SensorAndBeam({ heightM }: { heightM: number }) {
  const beamLength = heightM - 0.06;
  return (
    <group position={[0, heightM - 0.05, DESK_D / 2 - 0.06]}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.035, 0.055]} />
        <meshLambertMaterial color={scenePalette.pcb} flatShading />
      </mesh>
      {/* tiny green PCB edge visible along the bottom-front */}
      <mesh position={[0, -0.019, 0.026]}>
        <boxGeometry args={[0.08, 0.005, 0.006]} />
        <meshLambertMaterial color={scenePalette.copper} flatShading />
      </mesh>
      {/* laser beam: thin cylinder, emissive brand color */}
      <mesh position={[0, -(beamLength / 2) - 0.018, 0]}>
        <cylinderGeometry args={[0.0035, 0.0035, beamLength, 8]} />
        <meshBasicMaterial color={scenePalette.brand} />
      </mesh>
      {/* floor dot, glowing */}
      <mesh position={[0, -beamLength - 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.026, 16]} />
        <meshBasicMaterial color={scenePalette.brand} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, -beamLength - 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color={scenePalette.brand} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

const SCREEN_PX = { w: 512, h: 320 };

/** Draws the monitor screen contents (wallpaper, taskbar, windows, NudgeToast replica) onto a canvas. */
function drawScreen(ctx: CanvasRenderingContext2D, state: DeskState) {
  const { w, h } = SCREEN_PX;
  // wallpaper — warm paper gradient from tokens
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#F3ECDF");
  grad.addColorStop(1, scenePalette.bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // a couple of window rectangles
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = scenePalette.line;
  ctx.lineWidth = 2;
  ctx.fillRect(28, 24, 220, 150);
  ctx.strokeRect(28, 24, 220, 150);
  ctx.fillRect(266, 60, 190, 110);
  ctx.strokeRect(266, 60, 190, 110);
  // window title bars
  ctx.fillStyle = scenePalette.line;
  ctx.fillRect(28, 24, 220, 18);
  ctx.fillRect(266, 60, 190, 18);
  // window body lines (fake content)
  ctx.strokeStyle = "#D8D2C6";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(40, 60 + i * 18);
    ctx.lineTo(40 + 160 - i * 10, 60 + i * 18);
    ctx.stroke();
  }

  // taskbar
  ctx.fillStyle = scenePalette.ink;
  ctx.fillRect(0, h - 26, w, 26);
  ctx.fillStyle = scenePalette.brand;
  ctx.beginPath();
  ctx.arc(20, h - 13, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFFAA";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(48 + i * 30, h - 18, 20, 10);
  }

  // NudgeToast card, bottom-right, real copy per state (E010 §5, §2.1)
  const toast =
    state === "sitting"
      ? { title: "Time to stand up", body: "40 min sitting. Up for a minute?", accent: stateFill("sitting") }
      : { title: "Nice one.", body: "Credit is ticking. Sit whenever you're ready.", accent: stateFill("standing") };

  const cardW = 260;
  const cardH = 78;
  const cardX = w - cardW - 18;
  const cardY = h - 26 - cardH - 14;

  // drop shadow
  ctx.save();
  ctx.shadowColor = "rgba(31,36,48,0.28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, cardX, cardY, cardW, cardH, 14);
  ctx.fill();
  ctx.restore();

  // left accent rule, state-colored
  ctx.fillStyle = toast.accent;
  roundRect(ctx, cardX, cardY, 5, cardH, 3);
  ctx.fill();

  ctx.fillStyle = stateText(state);
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.fillText(toast.title, cardX + 20, cardY + 30);

  ctx.fillStyle = "#5B6270";
  ctx.font = "400 14px system-ui, sans-serif";
  wrapText(ctx, toast.body, cardX + 20, cardY + 54, cardW - 36, 18);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line, x, cy);
      line = word + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cy);
}

/** Oversized monitor (~1.4x real), standing ON the desktop, facing the camera. Screen = CanvasTexture. */
function Monitor({ heightM, state }: { heightM: number; state: DeskState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const { invalidate } = useThree();

  if (!canvasRef.current) {
    const c = document.createElement("canvas");
    c.width = SCREEN_PX.w;
    c.height = SCREEN_PX.h;
    canvasRef.current = c;
  }
  if (!textureRef.current) {
    textureRef.current = new THREE.CanvasTexture(canvasRef.current);
    textureRef.current.colorSpace = THREE.SRGBColorSpace;
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawScreen(ctx, state);
    if (textureRef.current) textureRef.current.needsUpdate = true;
    // frameloop="demand" needs an explicit poke so this redraw actually paints
    // (a state-only commit does not guarantee the following GL frame lands).
    invalidate();
    const id = window.setTimeout(invalidate, 50);
    return () => window.clearTimeout(id);
  }, [state, invalidate]);

  // monitor size: real 24" widescreen ~0.53x0.30m, oversized 1.4x -> ~0.74x0.42
  const screenW = 0.74;
  const screenH = 0.42;
  const standH = 0.16;
  const baseY = heightM + 0.017; // sits on desktop

  return (
    <group position={[0, baseY, -DESK_D / 2 + 0.16]}>
      {/* stand foot, flat on desk */}
      <mesh position={[0, 0.004, 0]} castShadow>
        <boxGeometry args={[0.18, 0.008, 0.12]} />
        <meshLambertMaterial color={scenePalette.ink} flatShading />
      </mesh>
      {/* stand neck */}
      <mesh position={[0, standH / 2, 0]} castShadow>
        <boxGeometry args={[0.03, standH, 0.03]} />
        <meshLambertMaterial color={scenePalette.ink} flatShading />
      </mesh>
      {/* monitor body, facing +Z (camera side), centered above the stand */}
      <group position={[0, standH + screenH / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[screenW, screenH, 0.025]} />
          <meshLambertMaterial color={scenePalette.ink} flatShading />
        </mesh>
        <mesh position={[0, 0, 0.014]}>
          <planeGeometry args={[screenW - 0.03, screenH - 0.03]} />
          <meshBasicMaterial map={textureRef.current} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Keyboard({ heightM }: { heightM: number }) {
  return (
    <group>
      <mesh position={[-0.07, heightM + 0.012, DESK_D / 2 - 0.14]} castShadow>
        <boxGeometry args={[0.34, 0.014, 0.12]} />
        <meshLambertMaterial color={scenePalette.ink} flatShading />
      </mesh>
      {/* mouse */}
      <mesh position={[0.2, heightM + 0.013, DESK_D / 2 - 0.13]} castShadow>
        <boxGeometry args={[0.05, 0.02, 0.08]} />
        <meshLambertMaterial color={scenePalette.ink} flatShading />
      </mesh>
    </group>
  );
}

/** A mug and a small plant to avoid an empty-looking desktop (DESIGN.md warmth). */
function DeskProps({ heightM }: { heightM: number }) {
  return (
    <group>
      {/* mug */}
      <mesh position={[-0.48, heightM + 0.03, DESK_D / 2 - 0.2]} castShadow>
        <cylinderGeometry args={[0.028, 0.024, 0.05, 10]} />
        <meshLambertMaterial color={scenePalette.brand} flatShading />
      </mesh>
      {/* plant pot */}
      <mesh position={[0.5, heightM + 0.025, -DESK_D / 2 + 0.12]} castShadow>
        <cylinderGeometry args={[0.035, 0.03, 0.045, 8]} />
        <meshLambertMaterial color={scenePalette.pcb} flatShading />
      </mesh>
      {/* plant leaves, a couple of low-poly cones */}
      <mesh position={[0.5, heightM + 0.09, -DESK_D / 2 + 0.12]} castShadow>
        <coneGeometry args={[0.045, 0.11, 6]} />
        <meshLambertMaterial color="#4F8F5B" flatShading />
      </mesh>
    </group>
  );
}

const CHIP_PX = { w: 300, h: 90 };

/** Draws the height/state chip (icon + label + height, never colour alone) onto a canvas. */
function drawChip(ctx: CanvasRenderingContext2D, heightCm: number, state: DeskState) {
  const { w, h } = CHIP_PX;
  ctx.clearRect(0, 0, w, h);
  const fill = stateFill(state);
  const text = stateText(state);
  const label = state === "sitting" ? "Sitting" : "Standing";

  ctx.save();
  ctx.shadowColor = "rgba(31,36,48,0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#FFFFFFF0";
  roundRect(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2);
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 3;
  ctx.strokeStyle = fill;
  roundRect(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2);
  ctx.stroke();

  // state icon: filled circle + directional mark, never colour-only signal (paired with text label)
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(38, h / 2, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (state === "sitting") {
    ctx.moveTo(30, h / 2);
    ctx.lineTo(46, h / 2);
  } else {
    ctx.moveTo(38, h / 2 + 8);
    ctx.lineTo(38, h / 2 - 8);
    ctx.moveTo(32, h / 2 - 2);
    ctx.lineTo(38, h / 2 - 8);
    ctx.moveTo(44, h / 2 - 2);
    ctx.lineTo(38, h / 2 - 8);
  }
  ctx.stroke();

  ctx.fillStyle = text;
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`${label} · ${heightCm} cm`, 64, h / 2 + 1);
}

/** Height/state chip, rendered as a canvas-texture plane so it always rasterizes (Html never painted, see brief pt.2). */
function HeightLabel({ heightCm, state }: { heightCm: number; state: DeskState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const { invalidate } = useThree();

  if (!canvasRef.current) {
    const c = document.createElement("canvas");
    c.width = CHIP_PX.w;
    c.height = CHIP_PX.h;
    canvasRef.current = c;
  }
  if (!textureRef.current) {
    textureRef.current = new THREE.CanvasTexture(canvasRef.current);
    textureRef.current.colorSpace = THREE.SRGBColorSpace;
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawChip(ctx, heightCm, state);
    if (textureRef.current) textureRef.current.needsUpdate = true;
    invalidate();
    const id = window.setTimeout(invalidate, 50);
    return () => window.clearTimeout(id);
  }, [heightCm, state, invalidate]);

  // fixed yaw so the plane faces the static camera position (DESIGN.md §8: fixed 3/4 lens, no per-frame lookup needed)
  const yaw = Math.atan2(1.7 - 0.62, 2.35 - 0.25);
  const aspect = CHIP_PX.w / CHIP_PX.h;
  const planeH = 0.13;
  const planeW = planeH * aspect;

  return (
    <mesh position={[0.62, SIT_HEIGHT + 0.5, 0.25]} rotation={[0, yaw, 0]}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial map={textureRef.current} transparent toneMapped={false} />
    </mesh>
  );
}

function SceneLights() {
  return (
    <>
      {/* warm hemisphere: warm sky tint over the amber floor tone */}
      <hemisphereLight color="#FFF4E2" groundColor={scenePalette.deskTop} intensity={0.95} />
      <directionalLight
        position={[-3, 5, 3]}
        intensity={0.65}
        color="#FFEFD8"
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
      <DeskProps heightM={height} />
      <HeightLabel heightCm={heightCm} state={state} />
    </>
  );
}

/** Warm floor + a subtle rug under the desk. */
function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshLambertMaterial color="#EFE3CE" flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.15]} receiveShadow>
        <circleGeometry args={[1.1, 24]} />
        <meshLambertMaterial color="#DCC9A6" flatShading transparent opacity={0.7} />
      </mesh>
    </>
  );
}

/** Subtle idle camera sway, disabled entirely under prefers-reduced-motion. */
function CameraSway({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(1.7, 1.45, 2.35));
  useFrame(({ clock }) => {
    if (!enabled) return;
    const t = clock.getElapsedTime();
    camera.position.x = base.current.x + Math.sin(t * 0.25) * 0.06;
    camera.position.y = base.current.y + Math.sin(t * 0.18) * 0.02;
    camera.lookAt(0, 0.95, 0);
  });
  return null;
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
          camera={{ position: [1.7, 1.45, 2.35], fov: 38 }}
          onCreated={({ camera }) => camera.lookAt(0, 0.95, 0)}
          gl={{ antialias: true }}
        >
          <SceneLights />
          <Floor />
          <AnimatedRig state={state} />
          <CameraSway enabled={!reduced} />
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
