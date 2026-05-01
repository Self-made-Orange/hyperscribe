import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  defaults,
  parsePreference,
  formatPreference,
  resolvePreferencePath,
  readPreference,
  writePreference
} from "../../plugins/outprint/scripts/lib/preference.mjs";

test("defaults: notion + auto", () => {
  assert.deepEqual(defaults(), { theme: "notion", renderer: "auto" });
});

test("parsePreference: reads YAML frontmatter", () => {
  const src = `---\ntheme: linear\nrenderer: page\n---\n\n# body`;
  assert.deepEqual(parsePreference(src), { theme: "linear", renderer: "page" });
});

test("parsePreference: missing frontmatter returns null", () => {
  assert.equal(parsePreference("no frontmatter here"), null);
});

test("parsePreference: ignores unknown keys", () => {
  const src = `---\ntheme: vercel\nrenderer: canvas\nmode: dark\nout_dir: ~/x\n---`;
  assert.deepEqual(parsePreference(src), { theme: "vercel", renderer: "canvas" });
});

test("parsePreference: trims whitespace around values", () => {
  const src = `---\ntheme:   stripe \nrenderer:  auto  \n---`;
  assert.deepEqual(parsePreference(src), { theme: "stripe", renderer: "auto" });
});

test("parsePreference: missing renderer falls back to default", () => {
  const src = `---\ntheme: supabase\n---`;
  assert.deepEqual(parsePreference(src), { theme: "supabase", renderer: "auto" });
});

test("formatPreference: produces canonical YAML + body", () => {
  const out = formatPreference({ theme: "linear", renderer: "page" });
  assert.match(out, /^---\ntheme: linear\nrenderer: page\ncreated_at: /);
  assert.match(out, /# Hyperscribe preferences/);
  assert.match(out, /Valid values:/);
  // No mode field anywhere — color mode is intentionally not a preference
  assert.doesNotMatch(out, /^mode:/m);
});

test("resolvePreferencePath: project-local wins over global", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const local = join(tmp, ".hyperscribe");
    mkdirSync(local, { recursive: true });
    const localFile = join(local, "preference.md");
    writeFileSync(localFile, "---\ntheme: linear\nrenderer: page\n---");
    const globalFile = join(tmp, "_global_preference.md");
    writeFileSync(globalFile, "---\ntheme: notion\nrenderer: auto\n---");
    const found = resolvePreferencePath({ cwd: tmp, homeFile: globalFile });
    assert.equal(found, localFile);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("resolvePreferencePath: falls back to global when no project-local", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const globalFile = join(tmp, "_global_preference.md");
    writeFileSync(globalFile, "---\ntheme: vercel\nrenderer: auto\n---");
    const found = resolvePreferencePath({ cwd: tmp, homeFile: globalFile });
    assert.equal(found, globalFile);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("resolvePreferencePath: returns null when neither exists", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const found = resolvePreferencePath({ cwd: tmp, homeFile: join(tmp, "nope.md") });
    assert.equal(found, null);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("readPreference: returns parsed values or null", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const p = join(tmp, "pref.md");
    writeFileSync(p, "---\ntheme: stripe\nrenderer: canvas\n---\n");
    assert.deepEqual(readPreference(p), { theme: "stripe", renderer: "canvas" });
    assert.equal(readPreference(join(tmp, "nope.md")), null);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("writePreference: creates parent dir and writes frontmatter", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    const target = join(tmp, "nested", "preference.md");
    writePreference(target, { theme: "linear", renderer: "page" });
    assert.ok(existsSync(target));
    const content = readFileSync(target, "utf8");
    assert.match(content, /theme: linear/);
    assert.match(content, /renderer: page/);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("writePreference: throws on invalid theme", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    assert.throws(() => writePreference(join(tmp, "p.md"), { theme: "studio", renderer: "auto" }), /theme/i);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test("writePreference: throws on invalid renderer", () => {
  const tmp = mkdtempSync(join(tmpdir(), "hs-pref-"));
  try {
    assert.throws(() => writePreference(join(tmp, "p.md"), { theme: "notion", renderer: "rainy" }), /renderer/i);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
