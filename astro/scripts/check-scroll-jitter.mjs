#!/usr/bin/env node
/**
 * Regression check for the DeskScene scroll jitter (fix fceef69, `SyncCanvasRect`
 * in src/components/scene/kit/SceneCanvas.tsx; DESK-SCENE-SPEC.md §9).
 *
 * drei `<View>` places each view's scissor from the LIVE tracked element's rect
 * minus the canvas rect R3F holds in `state.size`. When that canvas rect is stale
 * during a scroll, every frame drawn mid-scroll lands offset by the distance
 * scrolled (220 px before the fix). This script serves `dist/`, scrolls
 * /lab/desk-scene/ in a real (headless, SwiftShader) Chromium, and for every
 * scissor call compares it with the live DOM rect of the view it belongs to
 * (the hero `[data-scene-figure]` or a callout ring `[data-callout-ring]`).
 *
 * Fails (exit 1) when the hero view is offset by more than MAX_OFFSET_PX, a
 * callout ring view by more than RING_MAX_OFFSET_PX, or when fewer than
 * MIN_FRAMES hero frames were drawn during the scroll (a check that measured
 * nothing must not pass).
 *
 * Why two limits: the rings are laid out by React from anchors projected in the
 * previous frame, so while the desk moves they trail by a pixel or three. Before
 * the E005 parallax fix (kit/World.tsx `Lens`) they shook by 26.7 px on every
 * scroll step; that is the regression the ring limit catches. The measured
 * residual on 2026-09-25 was 2.9 px (known, BACKLOG).
 *
 * Usage: npm run check:jitter            (builds first if dist/ is missing)
 *        npm run check:jitter -- --build (always rebuild)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const MAX_OFFSET_PX = 2;
const RING_MAX_OFFSET_PX = 4;
const MIN_FRAMES = 10;
const SCROLL_STEPS = 60;
const SCROLL_STEP_PX = 40;
const STEP_MS = 16;
const PAGE = "/lab/desk-scene/";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png" };

if (process.argv.includes("--build") || !fs.existsSync(path.join(DIST, PAGE, "index.html"))) {
  execSync("npx astro build", { cwd: ROOT, stdio: "inherit" });
}

function serve() {
  const server = http.createServer((req, res) => {
    let f = path.join(DIST, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("content-type", TYPES[path.extname(f)] ?? "application/octet-stream");
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/** Runs in the page: records, per scissor call, the offset (CSS px) from the view it matches. */
function instrument() {
  window.__jitter = [];
  // R3F draws views inside requestAnimationFrame; a scissor outside it is a React effect (drei View's one-off clear)
  let inFrame = false;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => { inFrame = true; try { cb(t); } finally { inFrame = false; } });
  const scissor = WebGL2RenderingContext.prototype.scissor;
  WebGL2RenderingContext.prototype.scissor = function (x, y, w, h) {
    const canvas = this.canvas;
    const cr = canvas.getBoundingClientRect();
    const dpr = canvas.width / cr.width;
    const views = [...document.querySelectorAll("[data-scene-figure], [data-callout-ring]")];
    let best = null;
    for (const el of views) {
      const r = el.getBoundingClientRect();
      if (Math.abs(w / dpr - r.width) > 2 || Math.abs(h / dpr - r.height) > 2) continue;
      const dx = x / dpr - (r.left - cr.left);
      const dy = y / dpr - (cr.bottom - r.bottom);
      const off = Math.hypot(dx, dy);
      if (!best || off < best.off) best = { off, inFrame, view: el.hasAttribute("data-scene-figure") ? "hero" : "ring" };
    }
    if (best) window.__jitter.push({ t: performance.now(), ...best });
    return scissor.call(this, x, y, w, h);
  };
}

const server = await serve();
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let failed = false;
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1, reducedMotion: process.env.JITTER_REDUCED ? "reduce" : "no-preference" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript(instrument);
  await page.goto(`http://127.0.0.1:${server.address().port}${PAGE}`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-scene-figure]");
  await page.waitForTimeout(2000);
  const box = await page.locator("[data-scene-figure]").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.evaluate(() => (window.__jitter = []));
  for (let i = 0; i < SCROLL_STEPS; i++) {
    await page.mouse.wheel(0, SCROLL_STEP_PX);
    await page.waitForTimeout(STEP_MS);
  }
  await page.waitForTimeout(300);
  const samples = await page.evaluate(() => window.__jitter);
  const bad = samples.filter((s) => s.off > (s.view === "hero" ? MAX_OFFSET_PX : RING_MAX_OFFSET_PX));
  const max = samples.reduce((m, s) => Math.max(m, s.off), 0);
  const heroFrames = samples.filter((s) => s.view === "hero").length;
  const maxOf = (view) => samples.filter((s) => s.view === view).reduce((m, s) => Math.max(m, s.off), 0);
  console.log(`scrolled ${SCROLL_STEPS * SCROLL_STEP_PX} px: ${samples.length} view draws (${heroFrames} hero)`);
  console.log(`  hero  max offset ${maxOf("hero").toFixed(1)} px (limit ${MAX_OFFSET_PX})`);
  console.log(`  rings max offset ${maxOf("ring").toFixed(1)} px (limit ${RING_MAX_OFFSET_PX})`);
  console.log(`  over the limit: ${bad.length} (${bad.filter((s) => !s.inFrame).length} of them from React effects, outside a frame)`);
  if (errors.length) {
    console.error(`page errors: ${errors.join(" | ")}`);
    failed = true;
  }
  if (heroFrames < MIN_FRAMES) {
    console.error(`FAIL: only ${heroFrames} hero frames drawn during the scroll (need ${MIN_FRAMES}); nothing was measured`);
    failed = true;
  }
  if (bad.length) {
    console.error(`FAIL: ${bad.length} view draws over the limit (max ${max.toFixed(1)} px): a view is drawn away from its element mid-scroll`);
    failed = true;
  }
  if (!failed) console.log("PASS: every view scissor matched its live DOM rect within the limits");
} finally {
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
