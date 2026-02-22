#!/usr/bin/env bash
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
RESET="\033[0m"

info()    { echo -e "${CYAN}[interfacecraft]${RESET} $*"; }
success() { echo -e "${GREEN}[interfacecraft]${RESET} $*"; }

CLAUDE_DIR=".claude"
COMMANDS_DIR="${CLAUDE_DIR}/commands"
HOOKS_DIR="${CLAUDE_DIR}/hooks"

info "Installing interfacecraft.dev skills for Claude Code..."

mkdir -p "${COMMANDS_DIR}" "${HOOKS_DIR}"

# ── skill: figma-to-code ─────────────────────────────────────────────────────
cat > "${COMMANDS_DIR}/figma-to-code.md" << 'SKILL'
# figma-to-code

Convert a Figma frame or component into production-ready code.

## Usage

```
/figma-to-code [frame-name-or-node-id]
```

## Steps

1. Use the `figma-desktop` MCP server to fetch the target frame.
2. Inspect the layer tree, styles (colors, typography, spacing), and component variants.
3. Generate code that matches the design pixel-for-pixel using the project's existing stack
   (detect from `package.json`, file extensions, or ask the user if ambiguous).
4. Prefer semantic HTML + CSS / Tailwind; fall back to the project's component library if one is detected.
5. Extract design tokens (colors, radii, shadows) and emit them as variables / theme entries when appropriate.
6. Output the component file(s) and note any assets that must be exported from Figma manually.
SKILL

# ── skill: review-design ─────────────────────────────────────────────────────
cat > "${COMMANDS_DIR}/review-design.md" << 'SKILL'
# review-design

Review a Figma design for consistency, accessibility, and implementation feasibility.

## Usage

```
/review-design [frame-name-or-node-id]
```

## Steps

1. Fetch the target frame via the `figma-desktop` MCP server.
2. Check for:
   - **Consistency** – spacing, color, and type styles that deviate from the design system.
   - **Accessibility** – color contrast ratios (WCAG AA minimum), touch target sizes (≥ 44×44 px),
     missing alt-text annotations on images, focus order.
   - **Implementation notes** – complex effects (blur, gradients, blend modes) that need extra effort,
     missing states (hover, disabled, error), responsive behavior.
3. Return a structured report with severity labels (error / warning / info) for each finding.
SKILL

# ── skill: sync-design-tokens ────────────────────────────────────────────────
cat > "${COMMANDS_DIR}/sync-design-tokens.md" << 'SKILL'
# sync-design-tokens

Pull the latest design tokens from Figma and update the project's token files.

## Usage

```
/sync-design-tokens
```

## Steps

1. Fetch local styles from the Figma file via the `figma-desktop` MCP server.
2. Map colors, typography, spacing, border-radii, and shadows to the token format
   already used in the project (CSS custom properties, Tailwind config, Style Dictionary, etc.).
3. Diff against the current token file and report what changed before writing.
4. Write updated tokens and show a summary of additions, modifications, and removals.
SKILL

# ── session-start hook ───────────────────────────────────────────────────────
cat > "${HOOKS_DIR}/session-start.sh" << 'HOOK'
#!/usr/bin/env bash
# SessionStart hook – runs at the beginning of every Claude Code session.

# Verify the Figma MCP server is reachable.
if curl -sf --max-time 2 http://127.0.0.1:3845/mcp > /dev/null 2>&1; then
  echo "[interfacecraft] Figma MCP server is online."
else
  echo "[interfacecraft] Warning: Figma MCP server is not reachable (http://127.0.0.1:3845/mcp)."
  echo "[interfacecraft] Open Figma Desktop and enable the MCP server to use design skills."
fi
HOOK
chmod +x "${HOOKS_DIR}/session-start.sh"

# ── register hook in .claude/settings.json ───────────────────────────────────
SETTINGS_FILE="${CLAUDE_DIR}/settings.json"

if [ ! -f "${SETTINGS_FILE}" ]; then
  cat > "${SETTINGS_FILE}" << 'JSON'
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
JSON
  info "Created ${SETTINGS_FILE} with SessionStart hook."
else
  info "${SETTINGS_FILE} already exists — skipping hook registration."
  info "Add the following to your hooks.SessionStart array manually if needed:"
  echo '    { "type": "command", "command": "bash .claude/hooks/session-start.sh" }'
fi

echo ""
success "Skills installed successfully!"
echo ""
echo -e "  ${BOLD}Available skills:${RESET}"
echo "    /figma-to-code       – convert a Figma frame to code"
echo "    /review-design       – accessibility & consistency audit"
echo "    /sync-design-tokens  – pull Figma tokens into your project"
echo ""
echo -e "  ${BOLD}Session hook:${RESET}"
echo "    .claude/hooks/session-start.sh checks Figma MCP on each session."
echo ""
