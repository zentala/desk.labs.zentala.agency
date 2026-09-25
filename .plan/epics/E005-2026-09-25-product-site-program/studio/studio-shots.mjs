// Studio + homepage screenshots (dpr 2) from astro/dist; drives /lab/studio through window.__studio.
// Usage: node studio-shots.mjs <outDir> [comma-separated shot filter]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ASTRO = "C:/Users/zentala/code/desk.zentala.io/.plan/worktrees/E005-libs-spike/astro";
const OUT = process.argv[2];
const ONLY = process.argv[3] ? new Set(process.argv[3].split(",")) : null;
const require = createRequire(path.join(ASTRO, "package.json"));
const { chromium } = require("playwright");

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".glb": "model/gltf-binary", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const dist = path.join(ASTRO, "dist");
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
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
const log = [];
const requests = [];
function watch(page, label) {
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") log.push({ page: label, type: m.type(), text: m.text() }); });
  page.on("pageerror", (e) => log.push({ page: label, type: "pageerror", text: String(e) }));
  page.on("requestfailed", (r) => log.push({ page: label, type: "requestfailed", text: r.url() + " " + r.failure()?.errorText }));
  page.on("request", (r) => requests.push({ page: label, url: r.url() }));
}
const want = (name) => !ONLY || [...ONLY].some((o) => name.startsWith(o));

// ---------- studio ----------
const page = await browser.newPage({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 2 });
watch(page, "studio");
await page.goto(`${base}/lab/studio/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__studio?.set && window.__studio?.look && document.querySelector("[data-studio-canvas] canvas"));
await page.waitForTimeout(1500);
const canvas = page.locator("[data-studio-canvas]");
const set = async (patch, settle = 700) => { await page.evaluate((p) => window.__studio.set(p), patch); await page.waitForTimeout(settle); };
const look = async (pos, target, settle = 500) => { await page.evaluate(([p, t]) => window.__studio.look(p, t), [pos, target]); await page.waitForTimeout(settle); };
const reset = async () => { await page.evaluate(() => window.__studio.reset()); await page.waitForTimeout(400); };
async function shot(name, whole = false) {
  if (!want(name)) return null;
  const file = path.join(OUT, `${name}.png`);
  if (whole) await page.screenshot({ path: file, timeout: 120000 });
  else await page.screenshot({ path: file, clip: await canvas.boundingBox(), timeout: 120000 });
  console.log("shot", name);
  return file;
}
const BASE = { playing: false, figure: "faceted", ourStyle: true, n8ao: false, perf: false, outlines: false, softShadows: false, cableRadius: 0.0028 };

// timeline at 5 beats (our figure)
const BEATS5 = [[1, 0.05, "work"], [2, 0.15, "nudge"], [4, 0.4, "rise"], [6, 0.685, "done"], [9, 0.97, "away"]];
await set({ ...BASE });
for (const [i, u, n] of BEATS5) { await set({ u }, 900); await shot(`timeline-b${i}-${n}`); }

// figure candidates: original vs our style, seated and standing
for (const figure of ["ual", "ubcMale", "ubcFemale", "kaykit", "rocketbox", "mannequin"]) {
  await set({ ...BASE, figure, ourStyle: false, u: 0.05 }, 3500);
  await shot(`figure-${figure}-original-sit`);
  await set({ ourStyle: true }, 900); await shot(`figure-${figure}-ours-sit`);
  await set({ u: 0.55 }, 1200); await shot(`figure-${figure}-ours-stand`);
  await set({ ourStyle: false }, 900); await shot(`figure-${figure}-original-stand`);
}
// relax on/off and the hands-on-keyboard close-up (UAL)
await set({ ...BASE, figure: "ual", ourStyle: true, u: 0.05 }, 2500);
await look([1.0, 1.15, 0.55], [-0.05, 0.85, 0.2]); await shot("relax-ual-sit-close-relaxed");
await set({ shoulderDown: 0, armIn: 0, spinePitch: 0, neckPitch: 0, kneeStraight: 0, fingerCurl: 0, talkBlend: 0, handsOnKeys: 0 }, 900); await shot("relax-ual-sit-close-raw-clip");
await set({ shoulderDown: 7, armIn: 6, spinePitch: 5, neckPitch: 6, kneeStraight: 8, fingerCurl: 12, talkBlend: 0.2, handsOnKeys: 1 }, 600);
await reset();
await set({ u: 0.55 }, 1200); await shot("relax-ual-stand-relaxed");
await set({ shoulderDown: 0, armIn: 0, spinePitch: 0, neckPitch: 0, kneeStraight: 0, fingerCurl: 0 }, 900); await shot("relax-ual-stand-raw-clip");
await set({ shoulderDown: 7, armIn: 6, spinePitch: 5, neckPitch: 6, kneeStraight: 8, fingerCurl: 12 }, 600);

// determinism: same u, same image (UAL mid-clip and our figure mid-rise)
const same = [];
for (const [figure, u] of [["ual", 0.62], ["ual", 0.38], ["faceted", 0.4]]) {
  await set({ ...BASE, figure, u }, 2500);
  const a = await shot(`determinism-${figure}-u${u}-a`);
  await set({ u: 0.2 }, 800); await set({ u: 0.9 }, 800); await set({ u }, 1500);
  const b = await shot(`determinism-${figure}-u${u}-b`);
  if (a && b) same.push({ figure, u, identical: Buffer.compare(fs.readFileSync(a), fs.readFileSync(b)) === 0 });
}

// cable clearance close-ups (seated and standing desk), default and a thicker cable
await set({ ...BASE, figure: "faceted", u: 0.05 }, 900);
await look([0.95, 0.92, -0.75], [0.5, 0.7, -0.3]); await shot("cable-back-edge-sit");
await look([0.95, 0.95, 0.15], [0.42, 0.8, -0.2]); await shot("cable-monitor-bend-sit");
await set({ u: 0.55 }, 900);
await look([0.95, 1.32, -0.75], [0.5, 1.1, -0.3]); await shot("cable-back-edge-stand");
await look([0.95, 1.35, 0.15], [0.42, 1.2, -0.2]); await shot("cable-monitor-bend-stand");
await set({ u: 0.05, cableRadius: 0.005 }, 900);
await look([0.95, 0.92, -0.75], [0.5, 0.7, -0.3]); await shot("cable-back-edge-sit-radius-5mm");
await set({ cableRadius: 0.0028 }, 300);
await look([0.55, 0.62, -0.15], [0.55, 0.69, -0.2]); await shot("sensor-enclosure-9d7e7e");
await reset();

// panel with the timeline folder, whole viewport
await set({ ...BASE, u: 0.15 }, 900);
if (want("panel-timeline")) { await page.screenshot({ path: path.join(OUT, "panel-timeline.png") }); console.log("shot panel-timeline"); }
// player: play for 2 s and prove u advanced
await set({ u: 0.1, speed: 2, playing: true }, 2000);
const played = await page.evaluate(() => document.querySelector("[data-studio-status]")?.textContent ?? "");
await set({ playing: false }, 300);
await page.close();

// ---------- homepage with N8AO (desktop) and without (mobile) ----------
async function home(label, opts, file) {
  const p = await browser.newPage(opts);
  watch(p, label);
  await p.goto(`${base}/`, { waitUntil: "networkidle" });
  const fig = p.locator("[data-scene-figure]").first();
  await fig.scrollIntoViewIfNeeded();
  await p.waitForTimeout(4000);
  if (want(file)) { await p.screenshot({ path: path.join(OUT, `${file}.png`), clip: await fig.boundingBox(), timeout: 120000 }); console.log("shot", file); }
  await p.close();
}
await home("home-desktop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, "home-n8ao-desktop");
await home("home-desktop-reduced", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" }, "home-no-ao-reduced-motion");
await home("home-mobile", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }, "home-no-ao-mobile");

const ao = (label) => requests.some((r) => r.page === label && /SceneAO/.test(r.url));
const summary = {
  consoleErrors: log.filter((e) => e.type !== "warning").length,
  consoleWarnings: log.filter((e) => e.type === "warning").length,
  entries: log,
  determinism: same,
  playerStatusAfter2s: played,
  n8aoChunkLoaded: { desktop: ao("home-desktop"), reducedMotion: ao("home-desktop-reduced"), mobile: ao("home-mobile") },
};
fs.writeFileSync(path.join(OUT, "run-summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, entries: log.map((e) => `${e.page} ${e.type} ${e.text.slice(0, 160)}`) }, null, 2));
await browser.close();
server.close();
