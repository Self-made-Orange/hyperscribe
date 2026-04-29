/**
 * Canvas renderer — silent-house design frame + dynamic component slots.
 *
 * JSON shape:
 * {
 *   "template": "canvas",
 *   "meta": { "title": "...", "date": "..." },
 *   "featured": { "component": "hyperscribe/Chart", "props": {...} },
 *   "history": [
 *     { "title": "...", "date": "...", "content": { "component": "...", "props": {...} } }
 *   ]
 * }
 *
 * Renders using the silent-house theme so the fixed nav, typography, and
 * dark surface tokens all come from the same stylesheet as sh.html.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTree } from "./lib/tree.mjs";
import { SiteHeader } from "./components/site-header.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function loadCss(relPath) {
  const p = resolve(PLUGIN_ROOT, relPath);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

function typeLabel(componentName = "") {
  return componentName
    .replace("hyperscribe/", "")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
}

function componentFileBase(componentName) {
  return componentName
    .replace(/^hyperscribe\//, "")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function renderCanvas(doc, REGISTRY) {
  const meta    = doc.meta    || {};
  const feat    = doc.featured;
  const history = Array.isArray(doc.history) ? doc.history : [];

  const ctx = {};
  ctx.renderNode = (node) => renderTree(node, REGISTRY, ctx);

  // ── Nav ─────────────────────────────────────────────────────────────
  const navHtml = SiteHeader({
    brand: meta.title || "Canvas",
    links: []
  });

  // ── Featured stage ───────────────────────────────────────────────────
  const featHtml = feat
    ? renderTree(feat, REGISTRY, ctx)
    : `<div class="hs-canvas-stage-empty">No content yet.</div>`;

  const featLabel = feat ? typeLabel(feat.component) : "";
  const featMeta = (featLabel || meta.date)
    ? `<div class="hs-canvas-stage-meta">${
        featLabel
          ? `<span class="hs-hero-slide-subtitle">${escapeHtml(featLabel)}</span>`
          : ""
      }${
        meta.date
          ? `<span class="hs-canvas-stage-date">${escapeHtml(meta.date)}</span>`
          : ""
      }</div>`
    : "";

  const stageHtml = `
<section class="hs-canvas-stage">
  <div class="hs-canvas-stage-inner">
    ${featHtml}
  </div>
  ${featMeta}
</section>`;

  // ── History feed ─────────────────────────────────────────────────────
  const histItemsHtml = history.map((item, i) => {
    const contentHtml = item.content
      ? renderTree(item.content, REGISTRY, ctx)
      : "";
    const label = item.content ? typeLabel(item.content.component) : "";
    return `
<article class="hs-canvas-history-item" id="cv-item-${i}">
  <header class="hs-canvas-history-header">
    <div class="hs-canvas-history-meta-row">
      ${label    ? `<span class="hs-canvas-history-label">${escapeHtml(label)}</span>`   : ""}
      ${item.date ? `<span class="hs-canvas-history-date">${escapeHtml(item.date)}</span>` : ""}
    </div>
    <h2 class="hs-canvas-history-title">${escapeHtml(item.title || "Untitled")}</h2>
  </header>
  <div class="hs-canvas-history-content">${contentHtml}</div>
</article>`;
  }).join("\n");

  const histSectionHtml = history.length
    ? `
<section class="hs-canvas-history">
  <span class="hs-canvas-history-eyebrow">Previous outputs</span>
  ${histItemsHtml}
</section>`
    : "";

  // ── CSS ──────────────────────────────────────────────────────────────
  // Load silent-house theme + base + component-specific CSS.
  // canvas-stage.css covers the stage layout and history feed layout,
  // using var(--hs-*) tokens from the silent-house theme throughout.
  const shTheme        = loadCss("themes/silent-house.css");
  const baseCss        = loadCss("assets/base.css");
  const siteHeaderCss  = loadCss("assets/components/site-header.css");
  // Include hero-carousel CSS so .hs-hero-slide-subtitle token is styled
  const heroSliceCss   = loadCss("assets/components/hero-carousel.css");
  const canvasStageCss = loadCss("assets/components/canvas-stage.css");

  // Collect component-specific CSS for both featured and all history content
  const usedComponents = new Set();
  if (feat?.component) usedComponents.add(feat.component);
  history.forEach(h => { if (h.content?.component) usedComponents.add(h.content.component); });
  // Also recurse into children for Section wrappers etc.
  function collectDeep(node) {
    if (!node || typeof node !== "object") return;
    if (typeof node.component === "string") usedComponents.add(node.component);
    if (Array.isArray(node.children)) node.children.forEach(collectDeep);
  }
  if (feat) collectDeep(feat);
  history.forEach(h => { if (h.content) collectDeep(h.content); });

  let componentCss = "";
  for (const comp of usedComponents) {
    const fb = componentFileBase(comp);
    const p  = resolve(PLUGIN_ROOT, "assets/components", fb + ".css");
    if (existsSync(p)) componentCss += "\n/* " + comp + " */\n" + readFileSync(p, "utf8");
  }

  const css = [shTheme, baseCss, siteHeaderCss, heroSliceCss, canvasStageCss, componentCss]
    .filter(Boolean).join("\n");

  // ── Interactive JS ───────────────────────────────────────────────────
  const interactiveJs = readFileSync(resolve(PLUGIN_ROOT, "assets/interactive.js"), "utf8");

  return `<!doctype html>
<html lang="en" data-theme="silent-house" data-mode="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(meta.title || "Canvas")}</title>
  <style>${css}</style>
</head>
<body>

${navHtml}

${stageHtml}

${histSectionHtml}

<script>${interactiveJs}</script>
</body>
</html>
`;
}
