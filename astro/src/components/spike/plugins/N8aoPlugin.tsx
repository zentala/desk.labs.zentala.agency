/** Spike — screen-space ambient occlusion via @react-three/postprocessing + n8ao. */
import { EffectComposer, N8AO } from "@react-three/postprocessing";

export default function N8aoPlugin() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO aoRadius={0.35} intensity={2} distanceFalloff={0.6} quality="medium" />
    </EffectComposer>
  );
}
