// For each page: static + dynamic import graph of its island chunks; flags spike-only libs.
import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
const DIST = process.argv[2];
const A = path.join(DIST, "_astro");
const importsOf = (f) => {
  const src = fs.readFileSync(path.join(A, f), "utf8");
  const stat = [...src.matchAll(/(?:import|from)\s*["']\.\/([^"']+\.js)["']/g)].map((m) => m[1]);
  const dyn = [...src.matchAll(/import\(\s*["']\.\/([^"']+\.js)["']\s*\)/g)].map((m) => m[1]);
  // vite's preload helper lists deps as "_astro/x.js" strings
  const pre = [...src.matchAll(/["']_astro\/([^"']+\.js)["']/g)].map((m) => m[1]);
  return { stat, dyn: [...dyn, ...pre] };
};
const gz = (f) => zlib.gzipSync(fs.readFileSync(path.join(A, f))).length / 1024;
const MARKERS = { leva: /leva__|useControls|LevaPanel/, rapier: /rapier/i, n8ao: /N8AOPass|n8ao/i, "r3f-perf": /r3f-perf|PerfHeadless/, mannequin: /mannequin/i, postprocessing: /EffectComposer/ };
function walk(entry, followDynamic) {
  const seen = new Set(); const q = [entry];
  while (q.length) { const f = q.pop(); if (seen.has(f) || !fs.existsSync(path.join(A, f))) continue; seen.add(f); const { stat, dyn } = importsOf(f); q.push(...stat, ...(followDynamic ? dyn : [])); }
  return seen;
}
for (const page of process.argv.slice(3)) {
  const html = fs.readFileSync(path.join(DIST, page, "index.html"), "utf8");
  const entries = [...new Set([...html.matchAll(/\/_astro\/([^"' ]+\.js)/g)].map((m) => m[1]))];
  const eager = new Set(); const all = new Set();
  entries.forEach((e) => { walk(e, false).forEach((x) => eager.add(x)); walk(e, true).forEach((x) => all.add(x)); });
  const kb = (s) => [...s].reduce((n, f) => n + gz(f), 0).toFixed(1);
  const flagged = [...all].flatMap((f) => { const src = fs.readFileSync(path.join(A, f), "utf8"); return Object.entries(MARKERS).filter(([, re]) => re.test(src)).map(([k]) => `${k}@${f}`); });
  console.log(`\n== /${page} entries=${entries.length} eager=${eager.size} (${kb(eager)} kB gz) reachable=${all.size} (${kb(all)} kB gz)`);
  console.log("  reachable:", [...all].sort().join(", "));
  console.log("  spike markers:", flagged.length ? flagged.join(", ") : "none");
}
