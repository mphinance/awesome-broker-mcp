---
name: Zerodha (Kite Connect)
region: India
status: official
trading: true
server_type: remote (hosted) + local (self-host Go binary)
source_url: https://github.com/zerodha/kite-mcp-server
last_verified: 2026-11-11
confidence: high
---

# Zerodha (Kite Connect)

## Overview

Zerodha publishes an official first-party MCP server at
github.com/zerodha/kite-mcp-server, with a hosted endpoint at
https://mcp.kite.trade/mcp. The codebase includes place_order, modify_order and
cancel_order tools alongside holdings, positions, margins, mutual funds and live
quotes. The hosted endpoint explicitly excludes the destructive trading operations, so
placing orders through it requires self-hosting with your own Kite Connect API key and
secret.

## How to connect

```bash
Hosted (read-only): npx mcp-remote https://mcp.kite.trade/mcp — no API key needed, OAuth login to Kite. Self-host for trading: run the Go server with your own Kite Connect API key + secret.
```

## Trading scope

Indian equities, F&O, currency, commodities (NSE/BSE/MCX) — but order placement only
on a self-hosted instance; the official hosted endpoint excludes trading tools

## Caveats

- Hosted mcp.kite.trade is effectively read-only: the README states it 'excludes
  potentially destructive trading operations for security'. Order placement requires
  self-hosting.
- The README does not enumerate exactly which tools are stripped from the hosted
  version — the read-only claim is Zerodha's own wording, not a verified tool list.
- Self-hosting needs a paid Kite Connect subscription (API key + secret).
- Auth is Zerodha OAuth2 with TOTP 2FA; tokens are short-lived and require periodic
  re-login.
- An EXCLUDED_TOOLS env var (e.g.
  EXCLUDED_TOOLS=place_order,modify_order,cancel_order) lets self-hosters build their
  own read-only instance.

## Other repos

- **zerodha/kite-cli** (official, MIT, 12 stars, created 2026-10-14, last push 2026-11-11, latest release v0.2.2): a CLI and terminal UI for Kite, not an MCP server. Ships an official agent skill (`skills/kite/SKILL.md`) that Claude Code and Codex can install, structured `--json` output, and a `docs/guide/agents.md` page. Trading commands preview requests before submission unless `--confirm` is passed; per its docs, sign-in stays interactive so the agent never sees your password, 2FA code or token. README and agents guide read 2026-11-11.
- **vatsalgohil14/kite-mcp** (community, Rust, 55 tools over Kite Connect v3, 0 stars, no license file, created 2026-11-01, last push 2026-11-01): local stdio server. Per its README, mutating tools return a preview plus a `confirm_token` and need `confirm_action` within 2 minutes (`require_confirmation` defaults to true). Unaudited and a young repo.

## Sources

Re-read 2026-11-11: README claims unchanged (hosted endpoint excludes destructive trading
operations; EXCLUDED_TOOLS). Repo has 330 stars; latest tags are v0.4.0-dev pre-releases; latest
commit on the default branch 2026-07-10 ("add authorize interstitial for legacy mcp login").

Checked directly on 2026-07-16:

- <https://github.com/zerodha/kite-mcp-server>
- <https://raw.githubusercontent.com/zerodha/kite-mcp-server/master/README.md>
