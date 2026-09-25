/**
 * N8AO screen-space ambient occlusion for the hero view (ADR-012 amendment,
 * owner decision in the E005 studio). Lazy: DeskScene imports this file with
 * `lazy()` only on wide desktop screens, so phones, touch and reduced motion
 * never download @react-three/postprocessing + n8ao.
 */
import { EffectComposer, N8AO } from "@react-three/postprocessing";

/** tuned in /lab/studio: contact darkening under the desk and chair without haloing the figure */
const AO = { radius: 0.35, intensity: 2, distanceFalloff: 0.6 } as const;

export default function SceneAO() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO aoRadius={AO.radius} intensity={AO.intensity} distanceFalloff={AO.distanceFalloff} quality="medium" />
    </EffectComposer>
  );
}
