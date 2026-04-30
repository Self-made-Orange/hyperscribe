# agent-outprint-skills

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![Claude Code plugin](https://img.shields.io/badge/claude--code-plugin-6E56CF.svg)](https://docs.claude.com/en/docs/claude-code)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](#roadmap)

Agent skill that turns semantic JSON into self-contained HTML — no raw markup, no token waste, no external dependencies at runtime.

The model emits a component envelope. The renderer handles layout, theming, validation, and packaging. Output is a single `.html` file that opens offline.

---

## How it works

1. **Agent emits JSON.** Instead of writing HTML, the model picks components from a fixed catalog and fills in props. No styling decisions, no markup.
2. **Renderer validates + builds.** `render.mjs` checks the envelope against the schema, then assembles a fully inlined HTML document — CSS, JS, fonts, all bundled.
3. **File lands on disk.** One `.html` file. No server, no build step, no network at open time.

```json
{
  "a2ui_version": "0.9",
  "catalog": "hyperscribe/v1",
  "parts": [
    {
      "component": "hyperscribe/Page",
      "props": { "title": "Deploy checklist" },
      "children": [
        {
          "component": "hyperscribe/StepList",
          "props": {
            "steps": [
              { "title": "Run test suite",    "state": "done"  },
              { "title": "DB migration",       "state": "doing" },
              { "title": "Deploy to staging", "state": "todo"  }
            ]
          }
        }
      ]
    }
  ]
}
```

```bash
node plugins/hyperscribe/scripts/render.mjs --in envelope.json --out out.html
```

---

## Canvas template

The `canvas` template is a full-viewport agent output dashboard — a persistent page the agent writes to over time rather than regenerating from scratch each run.

```json
{
  "template": "canvas",
  "meta": {
    "title": "Product Analytics",
    "agent": "Claude",
    "topic": "Q1 Report",
    "statement": {
      "eyebrow": "Self-made Orange",
      "text": "One agent. Every output, beautifully rendered.",
      "cta": { "label": "View all outputs", "href": "#canvas-divisions" }
    }
  },
  "featured": {
    "component": "hyperscribe/Chart",
    "props": { "kind": "bar", "data": { ... } }
  },
  "history": [
    {
      "title": "Key Metrics — April",
      "date": "2026-04-30 14:20",
      "description": "MRR and ARR up double digits.",
      "content": { "component": "hyperscribe/KPICard", ... }
    }
  ]
}
```

Structure:
- **Hero carousel** — cycles through `history` items with a featured component in the viewport
- **Editorial statement** — agent identity + CTA
- **Divisions** — scrollable card grid of all past outputs

Supports dark/light mode toggle with `localStorage` persistence.

---

## Components

30+ components across page mode and canvas mode.

| Category | Components |
|---|---|
| Structure | `Page` `Section` `Heading` `Prose` `FileTree` `FileCard` |
| Data | `DataTable` `Chart` `KPICard` `Comparison` |
| Diagrams | `Mermaid` `Sequence` `ArchitectureGrid` `FlowChart` `Quadrant` `Swimlane` `ERDDiagram` |
| Code | `CodeBlock` `CodeDiff` `AnnotatedCode` |
| Narrative | `StepList` `Callout` `Image` |
| Slides | `SlideDeck` `Slide` |
| Canvas / Site | `SiteHeader` `HeroCarousel` `EditorialStatement` `DivisionCard` `SiteFooter` `PressMentions` `ProjectTile` `MosaicGrid` `CountdownTimer` |

Full prop schemas: [`plugins/hyperscribe/references/catalog.md`](plugins/hyperscribe/references/catalog.md)

---

## Themes

11 bundled themes, each with light and dark modes.

| Theme | Character |
|---|---|
| `studio` | Clean enterprise canvas, Airtable Blue accent |
| `midnight` | Purely grayscale, Cal Sans display |
| `void` | Architectural black, Unbounded display, high drama |
| `gallery` | Apple-style cinematic black ↔ light-gray sections |
| `notion` | Warm cream, whisper borders, reading-first |
| `linear` | Dark-native, Inter Variable, Indigo accent |
| `vercel` | Gallery white, Geist + Geist Mono, shadow-as-border |
| `stripe` | Weight-300 luxury headlines, deep navy |
| `supabase` | Dark-native, emerald green, no box-shadows |
| `shadcn-dark` | shadcn/ui dark palette, chart CSS vars |
| `silent-house` | Editorial editorial, monospace utility layer |

```bash
node plugins/hyperscribe/scripts/render.mjs --in envelope.json --out out.html --theme shadcn-dark
```

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

## Slash commands

| Command | Description |
|---|---|
| `/hyperscribe` | General page — diagrams, tables, explainers |
| `/hyperscribe:slides` | Forces `SlideDeck` root |
| `/hyperscribe:diff` | PR / diff review with `CodeDiff` + `ArchitectureGrid` |
| `/hyperscribe:share` | Deploy output to Vercel, return public URL |

---

## Roadmap

- Richer canvas interactions (inline editing, pinning, reordering history)
- More data components (pivot table, timeline, heatmap)
- Agent SDK streaming — partial renders as the envelope arrives

---

## Contributing

Node 20+. Run `npm test` before opening a PR. Keep renderer and catalog in sync when touching component schemas.

Issues: [github.com/Self-made-Orange/agent-outprint-skills/issues](https://github.com/Self-made-Orange/agent-outprint-skills/issues)

---

## License

MIT — see [LICENSE](LICENSE).
