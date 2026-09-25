// Spike screenshots: serves astro/dist, drives the Leva panel via window.__spike, saves PNGs at dpr 2.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ASTRO = "C:/Users/zentala/code/desk.zentala.io/.plan/worktrees/E005-libs-spike/astro";
const OUT = process.argv[2] || "C:/Users/zentala/code/desk.zentala.io/.plan/worktrees/E005-libs-spike/.plan/epics/E005-2026-09-25-product-site-program/spike";
const ONLY = process.argv[3] ? new Set(process.argv[3].split(",")) : null;
const require = createRequire(path.join(ASTRO, "package.json"));
const { chromium } = require("playwright");

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".bin": "application/octet-stream", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".wasm": "application/wasm" };
const dist = path.join(ASTRO, "dist");
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(dist, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.statusCode = 404; res.end("nope " + p); return; }
  res.setHeader("content-type", TYPES[path.extname(f)] || "application/octet-stream");
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on("console", (m) => { if (m.text().startsWith("[spike]")) console.log("  page:", m.text()); if (m.type() === "error" || m.type() === "warning") errors.push({ type: m.type(), text: m.text() }); });
page.on("pageerror", (e) => errors.push({ type: "pageerror", text: String(e) }));
page.on("requestfailed", (r) => errors.push({ type: "requestfailed", text: r.url() + " " + r.failure()?.errorText }));

await page.goto(`${base}/lab/spike/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__spike && document.querySelector("[data-spike-canvas] canvas"));
await page.waitForTimeout(1500);
const canvas = page.locator("[data-spike-canvas]");

async function set(patch, settle = 900) {
  await page.evaluate((p) => window.__spike.set(p), patch);
  await page.waitForTimeout(settle);
}
async function shot(name) {
  if (ONLY && !ONLY.has(name)) return;
  const b = await canvas.boundingBox();
  await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: b, timeout: 120000 });
  console.log("shot", name);
}
const RESET = { figure: "faceted", ourStyle: true, action: "sit", cable: "catmull", perf: false, n8ao: false, outlines: false, softShadows: false, deskT: 0 };

// humans
await set({ ...RESET, figure: "faceted" }); await shot("human-faceted-sit");
await set({ figure: "smooth" }); await shot("human-smooth-sit");
await set({ figure: "faceted", action: "stand", deskT: 1 }); await shot("human-faceted-stand");
await set({ action: "sit", deskT: 0 });
for (const kind of ["robot", "kenney", "quaternius", "mannequin"]) {
  await set({ figure: kind, ourStyle: false, action: "sit" }, 2500); await shot(`human-${kind}-original-sit`);
  await set({ ourStyle: true }, 800); await shot(`human-${kind}-ours-sit`);
  await set({ action: "stand", deskT: 1 }, 1800); await shot(`human-${kind}-ours-stand`);
  await set({ action: "walk" }, 1500); await shot(`human-${kind}-ours-walk`);
  await set({ action: "sit", deskT: 0 }, 800);
}
// cables: whole scene, then a close-up of the sensor-to-monitor run
const CLOSE = [[1.25, 0.95, 0.75], [0.42, 0.78, -0.12]];
async function cableShots(mode, settle) {
  await set({ ...RESET, figure: "faceted", cable: mode, cableSag: 0.12 }, settle);
  await shot(`cable-${mode === "catmull" ? "A-catmull" : mode === "catenary" ? "B-catenary" : "C-rope"}`);
  await page.evaluate((c) => window.__spike.look(...c), CLOSE); await page.waitForTimeout(settle === 4000 ? 1500 : 500);
  await shot(`cable-${mode === "catmull" ? "A-catmull" : mode === "catenary" ? "B-catenary" : "C-rope"}-close`);
  await page.evaluate(() => window.__spike.reset()); await page.waitForTimeout(300);
}
await cableShots("catmull", 1200); await cableShots("catenary", 900); await cableShots("rope", 4000);
// plugins
await set({ ...RESET, cable: "catmull", perf: true }, 1500); await shot("plugin-r3f-perf");
await set({ perf: false, n8ao: true }, 2000); await shot("plugin-n8ao");
await set({ n8ao: false, outlines: true }, 1000); await shot("plugin-outlines");
const FIG = [[0.9, 1.3, 1.3], [0, 0.9, 0.4]];
await page.evaluate((c) => window.__spike.look(...c), FIG); await page.waitForTimeout(600); await shot("plugin-outlines-close");
await set({ outlines: false, n8ao: true }, 2000); await shot("plugin-n8ao-close");
await set({ n8ao: false }, 300); await page.evaluate(() => window.__spike.reset()); await page.waitForTimeout(400);
await set({ outlines: false, softShadows: true }, 1500); await shot("plugin-softshadows");
await set({ softShadows: false, figure: "kenney", ourStyle: true, n8ao: true, action: "sit" }, 2500); await shot("plugin-n8ao-kenney");
await set({ ...RESET });
// panel open: viewport screenshot
if (!ONLY || ONLY.has("panel-leva")) { await page.screenshot({ path: path.join(OUT, "panel-leva.png") }); console.log("shot panel-leva"); }
// orbit: drag right ~half a turn (behind), then drag up (camera goes below the floor line)
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
async function drag(dx, dy, steps = 20) { await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= steps; i++) { await page.mouse.move(cx + (dx * i) / steps, cy + (dy * i) / steps); await page.waitForTimeout(16); } await page.mouse.up(); await page.waitForTimeout(400); }
await drag(box.width * 0.45, 0); await shot("orbit-behind");
await drag(0, -box.height * 0.12); await shot("orbit-low-behind");
await drag(0, -box.height * 0.3); await shot("orbit-below-behind");
await page.mouse.move(cx, cy); await page.mouse.wheel(0, 400); await page.waitForTimeout(600);
await page.evaluate(() => window.__spike.reset()); await page.waitForTimeout(600);
await shot("orbit-reset");

fs.writeFileSync(path.join(OUT, "console-errors.json"), JSON.stringify(errors, null, 2));
console.log("console entries:", errors.length, "errors:", errors.filter((e) => e.type !== "warning").length, "warnings:", errors.filter((e) => e.type === "warning").length);
for (const e of errors) console.log(" ", e.type, e.text.slice(0, 300));
await browser.close();
server.close();
