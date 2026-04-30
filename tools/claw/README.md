# claw / hyperscribe wrapper tooling

Slack/agent-side helpers for invoking `agent-outprint-skills` from the claw bot.

## Files

- `hyperscribe-render` — wrapper that calls `plugins/hyperscribe/scripts/render.mjs`
- `canvas-wrap.py` — auto-converts general envelope (`parts[]`) to canvas template

## Wrapper behaviors (on top of vanilla `render.mjs`)

1. **Force `--theme` / `--mode` defaults** when LLM drops them.
2. **Envelope diversity check** — rejects flat prose-only envelopes (Section + Prose only). Pass `--allow-prose-only` to skip.
3. **Auto canvas-wrap** — general envelope (`a2ui_version` + `parts[Page]`) becomes `featured` = `Page.children[0]`, `history[]` = `Page.children[1..]`. Skipped for site-mode (SiteHeader / etc.) and slide-mode (SlideDeck). Pass `--no-canvas-wrap` to opt out.

## Install (user-local)

    ln -s "$(pwd)/tools/claw/hyperscribe-render" ~/.local/bin/hyperscribe-render
    chmod +x tools/claw/canvas-wrap.py
    export HYPERSCRIBE_REPO="$(pwd)"

## Env

| var | default | purpose |
|---|---|---|
| HYPERSCRIBE_REPO | ~/src/agent-outprint-skills | this checkout |
| CLAW_HYPERSCRIBE_THEME | notion | default theme when caller drops --theme |
| CLAW_HYPERSCRIBE_MODE | auto | default mode when caller drops --mode |

## Flags (claw-only, not forwarded)

- `--allow-prose-only` — skip diversity check
- `--no-canvas-wrap` — skip canvas auto-wrap (force page mode)

## Origin

Forked from claw bot wrapper (2026-04-30). Wrapper lives at `~/.local/bin/hyperscribe-render` in the bot's runtime; this directory tracks it as part of agent-outprint-skills so the canvas-wrap behavior travels with the source.
