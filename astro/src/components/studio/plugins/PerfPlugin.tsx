/** Studio — r3f-perf overlay (fps, draw calls, triangles). Dev-only candidate. */
import { Perf } from "r3f-perf";

export default function PerfPlugin() {
  return <Perf position="bottom-left" minimal={false} />;
}
