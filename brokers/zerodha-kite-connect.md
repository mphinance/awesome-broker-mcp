---
name: Zerodha (Kite Connect)
region: India
status: official
trading: true
server_type: remote (hosted) + local (self-host Go binary)
source_url: https://github.com/zerodha/kite-mcp-server
last_verified: 2026-07-16
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

## Sources

Checked directly on 2026-07-16:

- <https://github.com/zerodha/kite-mcp-server>
- <https://raw.githubusercontent.com/zerodha/kite-mcp-server/master/README.md>
