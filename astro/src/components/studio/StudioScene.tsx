/**
 * Studio — the desk scene at one storyboard moment (`beatAt(u)`), with a
 * switchable figure. Reuses the kit's desk parts as they are; the light rig
 * is copied so the panel can drive it.
 */
import { Suspense, lazy, useMemo } from "react";
import { ContactShadows } from "@react-three/drei";
import type { ScenePalette } from "../scene/scenePalette";
import { Block, LIGHT, STAGE, standUp } from "../scene/kit";
import { walkOffset, type SceneFrame } from "../scene/kit/timeline";
import { Desk } from "../scene/desk/Desk";
import { Sensor } from "../scene/desk/Sensor";
import { Monitor, monitorPort } from "../scene/desk/Monitor";
import { Chair } from "../scene/desk/Chair";
import { DeskProps } from "../scene/desk/Props";
import { DESK, deskHeight, deskHeightCm } from "../scene/desk/dims";
import { isGltfFigure, type StudioSettings } from "./settings";
import { PersonParam } from "./PersonParam";
import type { Keyboard } from "./relax";

const GltfFigure = lazy(() => import("./GltfFigure"));
const MannequinFigure = lazy(() => import("./MannequinFigure"));

/** wrist rest points on the keyboard (Props.tsx: keyboard centre x −0.06, 19 cm in from the front edge) */
const KEYS = { x: -0.06, halfSpan: 0.1, zFromFront: 0.15, above: 0.04 } as const;

function Lights({ s, palette }: { s: StudioSettings; palette: ScenePalette }) {
  return (
    <>
      <hemisphereLight color={LIGHT.skyColor} groundColor={palette.line} intensity={LIGHT.hemisphereIntensity} />
      <directionalLight
        position={LIGHT.keyPosition}
        intensity={s.keyIntensity}
        color={LIGHT.keyColor}
        castShadow
        shadow-mapSize-width={LIGHT.shadowMapSize}
        shadow-mapSize-height={LIGHT.shadowMapSize}
        shadow-bias={LIGHT.shadowBias}
        shadow-normalBias={LIGHT.shadowNormalBias}
        shadow-radius={LIGHT.shadowRadius}
        shadow-intensity={s.shadowOpacity / LIGHT.contactOpacity}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-1.5}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      <directionalLight position={LIGHT.fillPosition} intensity={s.fillIntensity} color={LIGHT.fillColor} />
      <directionalLight position={LIGHT.rimPosition} intensity={s.rimIntensity} color={LIGHT.rimColor} />
    </>
  );
}

function Floor({ s, palette }: { s: StudioSettings; palette: ScenePalette }) {
  return (
    <group>
      <Block size={[STAGE.width, STAGE.thickness, STAGE.depth]} position={[STAGE.centerX, -STAGE.thickness / 2, STAGE.centerZ]} color={palette.slab} castShadow={false} />
      <Block size={[STAGE.rug.width, STAGE.rug.thickness, STAGE.rug.depth]} position={[STAGE.centerX + 0.2, STAGE.rug.thickness / 2 - 0.001, STAGE.centerZ + 0.05]} color={palette.rug} castShadow={false} />
      <ContactShadows
        position={[STAGE.centerX, STAGE.rug.thickness + 0.002, STAGE.centerZ]}
        opacity={s.shadowOpacity}
        blur={LIGHT.contactBlur}
        far={LIGHT.contactFar}
        resolution={LIGHT.contactResolution}
        scale={[STAGE.width, STAGE.depth]}
        color={palette.ink}
        frames={1}
      />
    </group>
  );
}

function keyboardAt(heightM: number): Keyboard {
  const y = heightM + KEYS.above;
  const z = DESK.depth / 2 - KEYS.zFromFront;
  return { left: [KEYS.x - KEYS.halfSpan, y, z], right: [KEYS.x + KEYS.halfSpan, y, z] };
}

function Figure({ s, frame, palette }: { s: StudioSettings; frame: SceneFrame; palette: ScenePalette }) {
  const walk = walkOffset(frame);
  if (isGltfFigure(s.figure)) {
    return (
      <GltfFigure kind={s.figure} frame={frame} walk={walk} ourStyle={s.ourStyle} color={palette.figure} relax={s} keyboard={keyboardAt(deskHeight(frame.deskT))} />
    );
  }
  if (s.figure === "mannequin") {
    return <MannequinFigure frame={frame} walk={walk} ourStyle={s.ourStyle} color={palette.figure} />;
  }
  const pose = standUp(frame.poseT);
  const body = { shoulderWidth: s.shoulderWidth, legThickness: s.legThickness, waist: s.waist };
  return (
    <group position={[walk.position[0], 0, pose.hip[2] + walk.position[2]]} rotation={[0, walk.yaw, 0]}>
      <group position={[0, 0, -pose.hip[2]]}>
        <PersonParam pose={pose} color={palette.figure} smooth={s.figure === "smooth"} body={body} outlines={s.outlines} inkColor={palette.ink} />
      </group>
    </group>
  );
}

export function StudioScene({ settings: s, frame, palette }: { settings: StudioSettings; frame: SceneFrame; palette: ScenePalette }) {
  const heightM = deskHeight(frame.deskT);
  const port = useMemo(() => monitorPort(heightM), [heightM]);
  const sensorPalette: ScenePalette = { ...palette, sensor: s.sensorColor };
  const story = { toast: frame.toast, timer: frame.timer, clock: frame.clock };

  return (
    <>
      <Lights s={s} palette={palette} />
      <Floor s={s} palette={palette} />
      <Desk heightM={heightM} palette={palette} />
      <Sensor heightM={heightM} palette={sensorPalette} port={port} breathe={false} cableRadius={s.cableRadius} />
      <Monitor heightM={heightM} state={frame.state} heightCm={deskHeightCm(frame.deskT)} palette={palette} story={story} />
      <DeskProps heightM={heightM} palette={palette} />
      <Chair t={frame.chairT} palette={palette} chairStyle="sharp" />
      <Suspense fallback={null}>
        <Figure s={s} frame={frame} palette={palette} />
      </Suspense>
    </>
  );
}
