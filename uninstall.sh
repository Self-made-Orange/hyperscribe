#!/usr/bin/env bash
# Hyperscribe uninstaller.
# Removes all hyperscribe skills from every agent directory in one shot.
# Works with installations made via `npx skills add Atipico1/hyperscribe`.

set -e

SKILLS=(hyperscribe hyperscribe-slides hyperscribe-diff hyperscribe-share)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}Hyperscribe — uninstaller${NC}"
echo ""

if ! command -v npx >/dev/null 2>&1; then
  echo -e "${RED}✗${NC} npx not found on PATH. Install Node.js 20+ first." >&2
  exit 127
fi

# `skills remove` with multiple names + --yes skips prompts.
# `--agent '*'` targets every detected agent. Combined they purge every install.
echo -e "${BLUE}→${NC} Removing ${SKILLS[*]} from every agent (project + global)..."

# Project scope (if inside a project with ./.<agent>/skills/)
npx --yes skills remove --yes --agent '*' "${SKILLS[@]}" 2>/dev/null || true

# Global scope
npx --yes skills remove --global --yes --agent '*' "${SKILLS[@]}" 2>/dev/null || true

echo ""
echo -e "${GREEN}✓${NC} Uninstall complete."
echo ""
echo "If you also installed via Claude Code plugin marketplace, remove it with:"
echo "  /plugin uninstall hyperscribe@hyperscribe-marketplace"
echo ""
echo "Rendered output files live at ~/.hyperscribe/out/ and are NOT removed."
echo "Delete them manually if desired:  rm -rf ~/.hyperscribe"
echo ""
