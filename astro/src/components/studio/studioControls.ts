/**
 * Studio — the Leva panel schema. Every key maps 1:1 onto `StudioSettings`
 * (plus the read-only `beat` label); `StudioLab.tsx` owns the panel.
 */
import { button, folder } from "leva";
import { BEATS } from "../scene/kit/timeline";
import { DEFAULTS, FIGURE_LABELS } from "./settings";

const figureOptions = Object.fromEntries(Object.entries(FIGURE_LABELS).map(([k, v]) => [v, k]));
const beatJumps = Object.fromEntries(BEATS.map((b) => [`${b.index} ${b.name}`, (b.u0 + b.u1) / 2]));

export interface ControlActions {
  resetView: () => void;
  jumpTo: (u: number) => void;
}

export function studioSchema(actions: ControlActions) {
  return {
    timeline: folder({
      u: { value: DEFAULTS.u, min: 0, max: 1, step: 0.001, label: "u (scrub)" },
      beat: { value: "", editable: false, label: "beat" },
      playing: { value: DEFAULTS.playing, label: "play" },
      speed: { value: DEFAULTS.speed, min: 0.1, max: 4, step: 0.1 },
      loop: { value: DEFAULTS.loop },
      ...Object.fromEntries(Object.entries(beatJumps).map(([label, u]) => [`→ ${label}`, button(() => actions.jumpTo(u))])),
    }),
    figure: folder({
      figure: { value: DEFAULTS.figure, options: figureOptions },
      ourStyle: { value: DEFAULTS.ourStyle, label: "our style (restyled)" },
      shoulderWidth: { value: DEFAULTS.shoulderWidth, min: 0.26, max: 0.5, step: 0.005, label: "ours: shoulders" },
      legThickness: { value: DEFAULTS.legThickness, min: 0.04, max: 0.12, step: 0.0025, label: "ours: legs" },
      waist: { value: DEFAULTS.waist, min: 0.06, max: 0.16, step: 0.0025, label: "ours: waist" },
    }),
    relax: folder({
      shoulderDown: { value: DEFAULTS.shoulderDown, min: -10, max: 20, step: 0.5, label: "shoulders down °" },
      armIn: { value: DEFAULTS.armIn, min: -10, max: 25, step: 0.5, label: "upper arms in °" },
      spinePitch: { value: DEFAULTS.spinePitch, min: -10, max: 20, step: 0.5, label: "spine to screen °" },
      neckPitch: { value: DEFAULTS.neckPitch, min: -15, max: 25, step: 0.5, label: "neck to screen °" },
      kneeStraight: { value: DEFAULTS.kneeStraight, min: 0, max: 25, step: 0.5, label: "knees straighter °" },
      fingerCurl: { value: DEFAULTS.fingerCurl, min: 0, max: 45, step: 1, label: "finger curl °" },
      talkBlend: { value: DEFAULTS.talkBlend, min: 0, max: 1, step: 0.05, label: "seated: talking mix" },
      handsOnKeys: { value: DEFAULTS.handsOnKeys, min: 0, max: 1, step: 0.05, label: "hands on keys (IK)" },
    }),
    camera: folder({
      camHeight: { value: DEFAULTS.camHeight, min: -0.5, max: 4, step: 0.01, label: "height (m)" },
      fov: { value: DEFAULTS.fov, min: 15, max: 80, step: 1 },
      orbit: { value: DEFAULTS.orbit, label: "orbit controls" },
      parallax: { value: DEFAULTS.parallax, label: "pointer parallax" },
      frameloop: { value: DEFAULTS.frameloop, options: ["always", "demand"] },
      "reset view": button(actions.resetView),
    }),
    light: folder({
      keyIntensity: { value: DEFAULTS.keyIntensity, min: 0, max: 4, step: 0.05, label: "key" },
      fillIntensity: { value: DEFAULTS.fillIntensity, min: 0, max: 2, step: 0.05, label: "fill" },
      rimIntensity: { value: DEFAULTS.rimIntensity, min: 0, max: 3, step: 0.05, label: "rim" },
      shadowOpacity: { value: DEFAULTS.shadowOpacity, min: 0, max: 1, step: 0.01, label: "shadow opacity" },
    }),
    desk: folder({
      sensorColor: { value: DEFAULTS.sensorColor, label: "sensor colour" },
      cableRadius: { value: DEFAULTS.cableRadius, min: 0.001, max: 0.008, step: 0.0001, label: "cable radius (m)" },
    }),
    plugins: folder({
      perf: { value: DEFAULTS.perf, label: "r3f-perf" },
      n8ao: { value: DEFAULTS.n8ao, label: "N8AO (as on the site)" },
      outlines: { value: DEFAULTS.outlines, label: "drei Outlines (ours)" },
      softShadows: { value: DEFAULTS.softShadows, label: "drei SoftShadows" },
    }),
  };
}
