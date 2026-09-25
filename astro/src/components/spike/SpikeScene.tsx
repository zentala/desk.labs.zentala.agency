/**
 * Spike — the desk with a switchable figure and cable. Reuses the kit's desk
 * parts as they are; the light rig is copied so the panel can drive it.
 */
import { Suspense, lazy, useMemo } from "react";
import { ContactShadows } from "@react-three/drei";
import type { ScenePalette } from "../scene/scenePalette";
import { Block, Cable, LIGHT, STAGE, standUp } from "../scene/kit";
import { Desk } from "../scene/desk/Desk";
import { Sensor, cablePath } from "../scene/desk/Sensor";
import { Monitor, monitorPort } from "../scene/desk/Monitor";
import { Chair } from "../scene/desk/Chair";
import { DeskProps } from "../scene/desk/Props";
import { deskHeight, deskHeightCm } from "../scene/desk/dims";
import { isGltfFigure, type SpikeSettings } from "./settings";
import { PersonParam } from "./PersonParam";
import { CatenaryCable } from "./CatenaryCable";

const GltfFigure = lazy(() => import("./GltfFigure"));
const MannequinFigure = lazy(() => import("./MannequinFigure"));
const RopeCable = lazy(() => import("./RopeCable"));

function Lights({ s, palette }: { s: SpikeSettings; palette: ScenePalette }) {
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

function Floor({ s, palette }: { s: SpikeSettings; palette: ScenePalette }) {
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

/** The action decides the figure's pose; for our figure the desk height blends the pose too. */
function actionT(s: SpikeSettings): number {
  return s.action === "sit" ? 0 : 1;
}

function Figure({ s, palette }: { s: SpikeSettings; palette: ScenePalette }) {
  const body = { shoulderWidth: s.shoulderWidth, legThickness: s.legThickness, waist: s.waist };
  if (isGltfFigure(s.figure)) {
    return <GltfFigure kind={s.figure} action={s.action} ourStyle={s.ourStyle} color={palette.figure} />;
  }
  if (s.figure === "mannequin") {
    return <MannequinFigure action={s.action} ourStyle={s.ourStyle} color={palette.figure} />;
  }
  if (s.action === "walk") {
    // no walk pose for the procedural figure: stand it a step away from the desk, turned toward the door
    return (
      <group position={[0.7, 0, 0.9]} rotation={[0, Math.PI * 0.75, 0]}>
        <PersonParam pose={standUp(1)} color={palette.figure} smooth={s.figure === "smooth"} body={body} outlines={s.outlines} inkColor={palette.ink} hipOffset={[0, 0, -0.45]} />
      </group>
    );
  }
  return <PersonParam pose={standUp(actionT(s))} color={palette.figure} smooth={s.figure === "smooth"} body={body} outlines={s.outlines} inkColor={palette.ink} />;
}

export function SpikeScene({ settings: s, palette }: { settings: SpikeSettings; palette: ScenePalette }) {
  const heightM = deskHeight(s.deskT);
  const port = useMemo(() => monitorPort(heightM), [heightM]);
  const sensorPalette: ScenePalette = { ...palette, pcb: s.sensorColor };
  const path = useMemo(() => cablePath(heightM, port), [heightM, port]);
  const chairT = s.action === "sit" ? 0 : 1;

  return (
    <>
      <Lights s={s} palette={palette} />
      <Floor s={s} palette={palette} />
      <Desk heightM={heightM} palette={palette} />
      <Sensor heightM={heightM} palette={sensorPalette} port={port} breathe={false} withCable={false} />
      <Monitor heightM={heightM} state={s.action === "sit" ? "sitting" : "standing"} heightCm={deskHeightCm(s.deskT)} palette={palette} />
      <DeskProps heightM={heightM} palette={palette} />
      <Chair t={chairT} palette={palette} chairStyle="sharp" />
      <Suspense fallback={null}>
        <Figure s={s} palette={palette} />
      </Suspense>
      {s.cable === "catmull" && <Cable points={path} color={palette.ink} />}
      {s.cable === "catenary" && <CatenaryCable from={path[0]} to={path[path.length - 1]} sag={s.cableSag} color={palette.ink} />}
      {s.cable === "rope" && (
        <Suspense fallback={null}>
          <RopeCable from={path[0]} to={path[path.length - 1]} slack={s.cableSag} color={palette.ink} anchorKey={`${heightM}`} />
        </Suspense>
      )}
    </>
  );
}
