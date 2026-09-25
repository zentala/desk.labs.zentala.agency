/** Studio — drei PCSS soft shadows (patches the shadow shader chunk while mounted). */
import { SoftShadows } from "@react-three/drei";

export default function SoftShadowsPlugin() {
  return <SoftShadows size={12} samples={12} focus={0.6} />;
}
