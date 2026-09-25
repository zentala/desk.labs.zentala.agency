import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Guards DESIGN.md §3/§13: components must use the v2 token utilities
// (`text-ink`, `text-ink-muted`, `border-line`, `state.*`, ...) and never the
// v1 dark-only classes or a plugin's own grey scale. `components/scene/**` is
// exempt (3D materials read `scenePalette.ts`, not Tailwind utilities).
const SRC_ROOT = join(__dirname, "..");
const SCENE_DIR = join(SRC_ROOT, "components", "scene");
const SCAN_EXTENSIONS = [".astro", ".tsx", ".ts"];

const FORBIDDEN_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "text-white", pattern: /text-white/g },
  { name: "-gray-<n>", pattern: /-gray-\d/g },
  { name: "-slate-", pattern: /-slate-/g },
  { name: "-zinc-", pattern: /-zinc-/g },
  { name: "prose-invert", pattern: /prose-invert/g },
  { name: "dark-<n> (v1 alias)", pattern: /dark-[0-9]/g },
  { name: "brand-green", pattern: /brand-green/g },
  { name: "text-muted (bare, not text-ink-muted)", pattern: /text-muted\b(?<!ink-muted)/g },
  { name: "report-surface|muted|divider (v1 alias)", pattern: /report-(surface|muted|divider)/g },
  {
    name: "status-in-use|in-review|planned|in-design|archived (v1 alias)",
    pattern: /status-(in-use|in-review|planned|in-design|archived)/g,
  },
];

function collectFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (full === SCENE_DIR) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, files);
    } else if (SCAN_EXTENSIONS.some((ext) => full.endsWith(ext)) && !full.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("v2 theme tokens (DESIGN.md §3, §13)", () => {
  const files = collectFiles(SRC_ROOT);

  it("scans a non-trivial number of source files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("contains no v1/plugin colour classes outside components/scene/**", () => {
    const violations: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (const { name, pattern } of FORBIDDEN_PATTERNS) {
        lines.forEach((line, index) => {
          pattern.lastIndex = 0;
          if (pattern.test(line)) {
            violations.push(`${relative(SRC_ROOT, file)}:${index + 1} — ${name}`);
          }
        });
      }
    }

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
