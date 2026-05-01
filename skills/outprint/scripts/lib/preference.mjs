import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const VALID_THEMES    = new Set(["notion", "linear", "vercel", "stripe", "supabase"]);
const VALID_RENDERERS = new Set(["auto", "canvas", "page"]);
// Color mode (light/dark) is intentionally NOT part of preference anymore.
// Both variants are inlined into the output and the toggle button + system
// `prefers-color-scheme` handle switching at view time.

export function defaults() {
  return { theme: "notion", renderer: "auto" };
}

export function parsePreference(src) {
  if (typeof src !== "string") return null;
  const m = src.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return null;
  const body = m[1];
  const out = {};
  for (const line of body.split(/\r?\n/)) {
    const kv = line.match(/^\s*([a-z_][a-z0-9_]*)\s*:\s*(.*?)\s*$/i);
    if (!kv) continue;
    const key = kv[1];
    const val = kv[2];
    if (key === "theme" || key === "renderer") out[key] = val;
  }
  if (!out.theme && !out.renderer) return null;
  return {
    theme:    out.theme    ?? defaults().theme,
    renderer: out.renderer ?? defaults().renderer
  };
}

export function formatPreference({ theme, renderer }) {
  const created = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  return `---
theme: ${theme}
renderer: ${renderer}
created_at: ${created}
---

# Hyperscribe preferences

Edit the values above to change your defaults. Delete this file to re-run
the first-run setup on the next hyperscribe invocation.

Valid values:
  theme:    notion | linear | vercel | stripe | supabase
  renderer: auto | canvas | page
`;
}

export function resolvePreferencePath({ cwd = process.cwd(), homeFile } = {}) {
  const local = resolve(cwd, ".hyperscribe", "preference.md");
  if (existsSync(local)) return local;
  const globalPath = homeFile ?? join(homedir(), ".hyperscribe", "preference.md");
  if (existsSync(globalPath)) return globalPath;
  return null;
}

export function readPreference(path) {
  if (!path || !existsSync(path)) return null;
  const src = readFileSync(path, "utf8");
  return parsePreference(src);
}

export function writePreference(path, { theme, renderer }) {
  if (!VALID_THEMES.has(theme)) {
    throw new Error(`Invalid theme "${theme}". Allowed: ${[...VALID_THEMES].join("|")}`);
  }
  if (!VALID_RENDERERS.has(renderer)) {
    throw new Error(`Invalid renderer "${renderer}". Allowed: ${[...VALID_RENDERERS].join("|")}`);
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, formatPreference({ theme, renderer }), "utf8");
}

export { VALID_THEMES, VALID_RENDERERS };
