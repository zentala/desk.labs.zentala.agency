// Jitter probe for /lab/desk-scene: counts rendered frames (main-view scissor calls) during
// pointer moves and page scroll, and measures the main view's scissor offset against live DOM rects.
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const ASTRO = "C:/Users/zentala/code/desk.zentala.io/.plan/worktrees/E005-libs-spike/astro";
const require = createRequire(path.join(ASTRO, "package.json")); const { chromium } = require("playwright");
const dist = path.join(ASTRO, "dist");
const server = http.createServer((req, res) => { let f = path.join(dist, decodeURIComponent(new URL(req.url, "http://x").pathname)); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html"); if (!fs.existsSync(f)) { res.statusCode = 404; return res.end(); } res.setHeader("content-type", f.endsWith(".js") ? "text/javascript" : f.endsWith(".html") ? "text/html" : f.endsWith(".css") ? "text/css" : "application/octet-stream"); fs.createReadStream(f).pipe(res); });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
const errors = []; page.on("pageerror", (e) => errors.push(String(e))); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.addInitScript(() => {
  window.__frames = [];
  const orig = WebGL2RenderingContext.prototype.scissor;
  WebGL2RenderingContext.prototype.scissor = function (x, y, w, h) {
    const fig = document.querySelector("[data-scene-figure]"); const cv = this.canvas;
    if (fig && cv && cv.getBoundingClientRect) {
      const tr = fig.getBoundingClientRect(), cr = cv.getBoundingClientRect(), dpr = cv.width / cr.width;
      if (Math.abs(w - tr.width * dpr) < 2) window.__frames.push({ t: performance.now(), err: Math.round(y - (cr.bottom - tr.bottom) * dpr) });
    }
    return orig.call(this, x, y, w, h);
  };
});
await page.goto(`http://127.0.0.1:${server.address().port}/lab/desk-scene/`, { waitUntil: "networkidle" });
await page.waitForSelector("[data-scene-figure]"); await page.waitForTimeout(2500);
const box = await page.locator("[data-scene-figure]").boundingBox();
const window_ = async (label, fn) => {
  await page.evaluate(() => (window.__frames = [])); const t0 = Date.now(); await fn(); const ms = Date.now() - t0;
  const f = await page.evaluate(() => window.__frames);
  const fr = []; for (const x of f) { const last = fr[fr.length - 1]; if (last && x.t - last.t < 3) last.err = Math.max(last.err, Math.abs(x.err)); else fr.push({ t: x.t, err: Math.abs(x.err) }); }
  const errs = fr.map((x) => x.err); const bad = errs.filter((e) => e > 1).length; f.length = 0; f.push(...fr);
  if (process.env.SERIES) console.log("   series:", fr.map((x) => x.err).join(","));
  console.log(`${label.padEnd(34)} ${ms} ms  frames=${f.length} (${(f.length / ms * 1000).toFixed(1)}/s)  scissor-offset>1px: ${bad}, max ${errs.length ? Math.max(...errs) : 0}px`);
};
await window_("idle 1.5 s", () => page.waitForTimeout(1500));
await window_("pointer sweep 60 moves @16ms", async () => { for (let i = 0; i < 60; i++) { await page.mouse.move(box.x + 50 + i * 12, box.y + box.height / 2); await page.waitForTimeout(16); } });
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
await page.mouse.move(box.x + box.width / 2, box.y + 40);
await window_("wheel scroll 30 x 20px @16ms", async () => { for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 20); await page.waitForTimeout(16); } });
console.log("page errors:", errors.length, errors.slice(0, 3));
await browser.close(); server.close();
