# agent-outprint-skills

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![Claude Code plugin](https://img.shields.io/badge/claude--code-plugin-6E56CF.svg)](https://docs.claude.com/en/docs/claude-code)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](#roadmap)

Agent skill that turns semantic JSON into self-contained HTML — no raw markup, no token waste, no external dependencies at runtime.

The model emits a component envelope. The renderer handles layout, theming, validation, and packaging. Output is a single `.html` file that opens offline.

---

## Why

LLMs are bad at HTML. Token cost is high, output is inconsistent, and a single misplaced `</div>` breaks everything. This project flips the contract:

- **The model emits semantic data only** — picks components from a fixed catalog, fills in props. No CSS, no class names, no markup.
- **The renderer owns presentation** — `render.mjs` validates the schema, picks a theme, inlines all CSS / fonts / JS, and writes one HTML file.
- **The output ships offline** — no CDN, no build step, no server. Open the file, see the result.

---

## Quick start

```bash
git clone https://github.com/Self-made-Orange/agent-outprint-skills.git
cd agent-outprint-skills

cat > /tmp/hello.json <<'EOF'
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "parts": [{
    "component": "hyperscribe/Page",
    "props": { "title": "Deploy checklist" },
    "children": [{
      "component": "hyperscribe/StepList",
      "props": { "steps": [
        { "title": "Run test suite",   "state": "done"  },
        { "title": "DB migration",     "state": "doing" },
        { "title": "Deploy to staging","state": "todo"  }
      ]}
    }]
  }]
}
EOF

node plugins/hyperscribe/scripts/render.mjs --in /tmp/hello.json --out /tmp/hello.html
open /tmp/hello.html      # macOS — use xdg-open on Linux
```

That's the whole loop: write semantic JSON, run the renderer, open the HTML.

---

## Two render modes

A doc is either a **page** (a single document) or a **canvas** (a persistent agent dashboard). The renderer picks based on envelope shape.

### Page mode — `parts[]`

A traditional one-shot document. Every component sits inside a `Page` (or `SlideDeck`). Render once, open.

```json
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "parts": [{
    "component": "hyperscribe/Page",
    "props": { "title": "Q1 metrics" },
    "children": [ /* Section, Chart, DataTable, KPICard, ... */ ]
  }]
}
```

### Canvas mode — `template: "canvas"`

A full-viewport dashboard the agent appends to over time. Hero carousel cycles through past outputs; current run becomes the featured slide.

```json
{
  "template": "canvas",
  "meta": {
    "title": "Product Analytics",
    "agent": "Claude",
    "statement": {
      "eyebrow": "Self-made Orange",
      "text": "One agent. Every output, beautifully rendered.",
      "cta": { "label": "View all outputs", "href": "#canvas-divisions" }
    }
  },
  "featured": { "component": "hyperscribe/Chart",    "props": { "kind": "bar" } },
  "history":  [{ "title": "April KPIs", "date": "2026-04-30",
                 "content": { "component": "hyperscribe/KPICard", "props": {} } }]
}
```

### Choosing a mode

| Use page mode when… | Use canvas mode when… |
|---|---|
| Single render, single artifact | Same agent runs repeatedly, you want a thread of outputs |
| Document, report, recap, slide deck | Dashboard, ongoing brief, "what did the agent do this week" |
| Send a one-off file | Persistent landing surface for the agent |

The renderer is decided automatically (`auto`) but you can force either side:

```bash
node plugins/hyperscribe/scripts/render.mjs --in envelope.json --out out.html --renderer page
node plugins/hyperscribe/scripts/render.mjs --in envelope.json --out out.html --renderer canvas
```

---

## Components

34 components across page mode, slide mode, and canvas / site mode.

| Category | Components |
|---|---|
| Structure | `Page` `Section` `Heading` `Prose` `FileTree` `FileCard` |
| Data | `DataTable` `Chart` `KPICard` `Comparison` |
| Diagrams | `Mermaid` `Sequence` `ArchitectureGrid` `FlowChart` `Quadrant` `Swimlane` `ERDDiagram` |
| Code | `CodeBlock` `CodeDiff` `AnnotatedCode` |
| Narrative | `StepList` `Callout` `Image` |
| Slides | `SlideDeck` `Slide` |
| Canvas / Site | `SiteHeader` `HeroCarousel` `EditorialStatement` `DivisionCard` `SiteFooter` `PressMentions` `ProjectTile` `MosaicGrid` `CountdownTimer` |

Components carry **semantic data only** — styling props (`color`, `backgroundColor`, `fontSize`, `className`, …) are rejected by the schema. If you want a red warning box, ask for `Callout severity="warn"`, never a hex code.

Full prop schemas: [`plugins/hyperscribe/references/catalog.md`](plugins/hyperscribe/references/catalog.md).

---

## Themes

5 bundled themes — each strictly per their public DESIGN.md tokens. Every output inlines both light and dark variants; the toggle button + system `prefers-color-scheme` switch them at view time, so color mode is **not** a setting.

| Theme | Character |
|---|---|
| `notion` | Warm cream surfaces, whisper borders, Notion Blue accent — reading-first |
| `linear` | Dark-native canvas, Inter Variable + cv01/ss03, indigo accent |
| `vercel` | Gallery white, Geist + Geist Mono, shadow-as-border |
| `stripe` | Weight-300 luxury headlines, deep navy `#061b31`, blue-tinted shadow |
| `supabase` | Dark-native, emerald `#3ecf8e` accent, NO box-shadows (border hierarchy) |

Default: `notion`. Override per call:

```bash
node plugins/hyperscribe/scripts/render.mjs --in envelope.json --out out.html --theme stripe
```

Themes live as pure CSS-variable overrides under [`plugins/hyperscribe/themes/`](plugins/hyperscribe/themes/). Each defines tokens under `[data-theme="<name>"]` (light) and `[data-theme="<name>"][data-mode="dark"]` (dark).

---

## Configuration

User preferences live in `~/.hyperscribe/preference.md` (global) or `./.hyperscribe/preference.md` (project-local; takes priority).

```yaml
---
theme: notion
renderer: auto
created_at: 2026-04-30T...
---
```

| Field | Values | Default | Purpose |
|---|---|---|---|
| `theme` | `notion` `linear` `vercel` `stripe` `supabase` | `notion` | Brand-aligned theme |
| `renderer` | `auto` `canvas` `page` | `auto` | Force renderer; `auto` infers from envelope |

The skill prompts for these on first run via `Step 0` in `SKILL.md` and writes the file. Delete it to re-prompt.

### CLI flags

| Flag | Effect |
|---|---|
| `--theme <name>` | Override theme for this call |
| `--renderer <auto\|canvas\|page>` | Override renderer for this call |
| `--mode <light\|dark\|auto>` | Force initial color mode (rare; the toggle handles it) |
| `--in <path>` | JSON input (or pipe via stdin) |
| `--out <path>` | HTML output |
| `--title <s>` | Override `Page.title` |
| `--validate-only` | Validate JSON, do not render |

Run `--help` for the full list.

---

## Install

### Claude Code

```
/plugin marketplace add Self-made-Orange/agent-outprint-skills
/plugin install hyperscribe@hyperscribe-marketplace
```

### Any agent (Codex, Cursor, Gemini CLI, …)

```bash
npx skills add Self-made-Orange/agent-outprint-skills
```

### Manual

```bash
git clone https://github.com/Self-made-Orange/agent-outprint-skills.git
cd agent-outprint-skills
node plugins/hyperscribe/scripts/render.mjs --in envelope.json --out out.html
```

---

## Slash commands (Claude Code)

| Command | Description |
|---|---|
| `/hyperscribe` | General page — diagrams, tables, explainers |
| `/hyperscribe:slides` | Forces `SlideDeck` root |
| `/hyperscribe:diff` | PR / diff review with `CodeDiff` + `ArchitectureGrid` |
| `/hyperscribe:share` | Deploy output to Vercel, return public URL |

---

## Project structure

```
.
├── plugins/hyperscribe/        # Renderer + components + themes
│   ├── scripts/
│   │   ├── render.mjs            # CLI entry — page-mode renderer
│   │   ├── canvas.mjs            # canvas-mode renderer
│   │   ├── components/           # ~34 component renderers
│   │   └── lib/                  # schema validation, theme loader, preference parser
│   ├── assets/                   # base.css + per-component CSS + interactive.js
│   ├── themes/                   # 5 brand themes
│   ├── spec/catalog.json         # component catalog (source of truth)
│   ├── references/catalog.md    # human-readable prop docs
│   └── skills/hyperscribe/       # Claude Code skill bundle
├── skills/                     # Mirror for non-plugin agent runtimes
│   ├── hyperscribe/              # base skill (page + canvas)
│   ├── hyperscribe-slides/       # slide-deck variant
│   ├── hyperscribe-diff/         # PR review variant
│   └── hyperscribe-share/        # Vercel deploy variant
├── tools/claw/                 # Optional Slack/agent wrapper (see tools/claw/README.md)
├── tests/                      # Unit + golden-snapshot tests
└── benchmark/                  # Token-cost comparison vs hand-written HTML
```

---

## Optional tooling — `tools/claw/`

`tools/claw/hyperscribe-render` is a bash wrapper for agent runtimes that need:

- **Forced theme/mode defaults** when the LLM drops them
- **Envelope diversity check** — rejects flat prose-only outputs (skip with `--allow-prose-only`)
- **Opt-in canvas wrap** (`--canvas-wrap`) — converts page envelope to canvas template

See [`tools/claw/README.md`](tools/claw/README.md) for install and env vars. Not needed for direct `render.mjs` use.

---

## Roadmap

- Richer canvas interactions (inline editing, pinning, reordering history)
- More data components (pivot table, timeline, heatmap)
- Agent SDK streaming — partial renders as the envelope arrives

---

## Contributing

Node 20+. Run `npm test` before opening a PR. Keep the renderer (`render.mjs`) and the catalog (`spec/catalog.json` + `references/catalog.md`) in sync when touching component schemas.

Issues: [github.com/Self-made-Orange/agent-outprint-skills/issues](https://github.com/Self-made-Orange/agent-outprint-skills/issues)

---

## License

MIT — see [LICENSE](LICENSE).
