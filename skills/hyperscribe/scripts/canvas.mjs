/**
 * Canvas renderer — silent-house carousel frame + agent output slides.
 *
 * JSON shape:
 * {
 *   "template": "canvas",
 *   "meta": {
 *     "title": "Q1 Analysis",
 *     "date": "2026-04-30",
 *     "agent": "Claude",       // shown bottom-left e.g. "CLAUDE"
 *     "topic": "Revenue"       // shown bottom-left e.g. "REVENUE"
 *   },
 *   "featured": { "component": "hyperscribe/Chart", "props": {...} },
 *   "history": [
 *     { "title": "...", "date": "...", "content": { "component": "...", "props": {...} } }
 *   ]
 * }
 *
 * Layout mirrors sh.html:
 *   - Fixed transparent nav → frosted glass on scroll
 *   - Nav links = slide titles (clicking switches slide + counter)
 *   - Full-viewport dark stage with slides (crossfade like HeroCarousel)
 *   - Bottom-left: AGENT · COMPONENT TYPE + slide title
 *   - Bottom-right: counter  N / total
 *   - Brand = "Self made Orange"
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTree } from "./lib/tree.mjs";

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
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toUpperCase();
}

function componentFileBase(componentName) {
  return componentName
    .replace(/^hyperscribe\//, "")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// Carousel + scroll + nav JS, all self-contained
const CANVAS_JS = `
(function () {
  var slides   = Array.from(document.querySelectorAll('[data-canvas-slide]'));
  var navLinks = Array.from(document.querySelectorAll('[data-canvas-nav]'));
  var counter  = document.querySelector('.hs-hero-counter');
  var total    = slides.length;
  var current  = 0;

  function show(n) {
    current = ((n % total) + total) % total;
    slides.forEach(function (s, i) {
      s.classList.toggle('hs-hero-slide-active', i === current);
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('hs-canvas-nav-active',
        parseInt(a.getAttribute('data-canvas-nav'), 10) === current);
    });
    if (counter) counter.textContent = (current + 1) + ' / ' + total;
  }

  navLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(parseInt(a.getAttribute('data-canvas-nav'), 10));
    });
  });

  // Frosted-glass nav on scroll
  var hdr = document.querySelector('.hs-site-header');
  if (hdr) {
    window.addEventListener('scroll', function () {
      hdr.classList.toggle('hs-scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  show(0);
}());
`.trim();

export function renderCanvas(doc, REGISTRY) {
  const meta    = doc.meta    || {};
  const feat    = doc.featured;
  const history = Array.isArray(doc.history) ? doc.history : [];

  const ctx = {};
  ctx.renderNode = (node) => renderTree(node, REGISTRY, ctx);

  // ── Build slide list ─────────────────────────────────────────────────
  // Slide 0 = featured, slides 1..N = history items
  const slides = [];

  if (feat) {
    slides.push({
      title:      meta.title || "Untitled",
      subtitle:   typeLabel(feat.component),
      date:       meta.date  || "",
      contentHtml: renderTree(feat, REGISTRY, ctx),
    });
  }

  history.forEach(item => {
    slides.push({
      title:      item.title || "Untitled",
      subtitle:   item.content ? typeLabel(item.content.component) : "",
      date:       item.date  || "",
      contentHtml: item.content ? renderTree(item.content, REGISTRY, ctx) : "",
    });
  });

  const total = slides.length;

  // ── Nav ──────────────────────────────────────────────────────────────
  // Brand always "Self made Orange"; links = slide titles
  const navLinksHtml = slides.length > 1
    ? `<ul class="hs-site-header-nav">
        ${slides.map((s, i) =>
          `<li><a href="#" data-canvas-nav="${i}"${i === 0 ? ' class="hs-canvas-nav-active"' : ""}>${escapeHtml(s.title)}</a></li>`
        ).join("")}
      </ul>`
    : "";

  const navHtml = `<header class="hs-site-header">
  <a class="hs-site-header-brand">Self made Orange</a>
  ${navLinksHtml}
</header>`;

  // ── Slide HTML ───────────────────────────────────────────────────────
  const agentLabel = [
    meta.agent ? escapeHtml(meta.agent.toUpperCase()) : "",
    meta.topic ? escapeHtml(meta.topic.toUpperCase()) : "",
  ].filter(Boolean).join(" · ");

  const slidesHtml = slides.map((s, i) => {
    const subtitleParts = [agentLabel, s.subtitle].filter(Boolean).join(" · ");
    const metaHtml = (subtitleParts || s.title)
      ? `<div class="hs-hero-slide-meta">
          ${subtitleParts ? `<span class="hs-hero-slide-subtitle">${subtitleParts}</span>` : ""}
          ${s.title ? `<span class="hs-hero-slide-title">${escapeHtml(s.title)}</span>` : ""}
        </div>`
      : "";
    return `
<div class="hs-hero-slide${i === 0 ? " hs-hero-slide-active" : ""}" data-canvas-slide="${i}">
  <div class="hs-canvas-slide-body">
    <div class="hs-canvas-slide-inner">
      ${s.contentHtml}
    </div>
  </div>
  ${metaHtml}
</div>`;
  }).join("\n");

  const stageHtml = `
<section class="hs-hero-carousel">
  <div class="hs-hero-stage">
    ${slidesHtml}
    <div class="hs-hero-overlay">
      <span></span>
      <span class="hs-hero-counter">1 / ${total}</span>
    </div>
  </div>
</section>`;

  // ── CSS ──────────────────────────────────────────────────────────────
  const shTheme       = loadCss("themes/silent-house.css");
  const baseCss       = loadCss("assets/base.css");
  const siteHeaderCss = loadCss("assets/components/site-header.css");
  const heroCss       = loadCss("assets/components/hero-carousel.css");
  const canvasCss     = loadCss("assets/components/canvas-stage.css");

  // Collect all used component CSS
  const usedComponents = new Set();
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

  // Extra CSS: slide body centering + active nav link style
  const extraCss = `
/* Canvas slide body — centered scrollable content inside full-viewport slide */
.hs-canvas-slide-body {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(72px, 10vh, 100px) clamp(20px, 4vw, 80px) clamp(80px, 12vh, 120px);
  overflow-y: auto;
}
.hs-canvas-slide-inner {
  width: 100%;
  max-width: 1100px;
}
/* Flatten inner page/section wrappers */
.hs-canvas-slide-inner .hs-page { max-width: none; padding: 0; margin: 0; }
.hs-canvas-slide-inner .hs-page-main { padding: 0; max-width: none; }
.hs-canvas-slide-inner .hs-section { padding: 0; border-top: none; max-width: none; }
.hs-canvas-slide-inner .hs-section-title {
  font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
  font-family: var(--hs-font-mono); color: var(--hs-color-fg-muted);
  padding: 0; border-top: none; margin-bottom: 24px;
}
/* Active nav link */
[data-theme="silent-house"] .hs-site-header-nav a.hs-canvas-nav-active {
  opacity: 1;
  border-bottom: 1px solid rgba(255,255,255,0.5);
  padding-bottom: 2px;
}
`;

  const css = [shTheme, baseCss, siteHeaderCss, heroCss, canvasCss, componentCss, extraCss]
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

<script>${interactiveJs}</script>
<script>${CANVAS_JS}</script>
</body>
</html>
`;
}
