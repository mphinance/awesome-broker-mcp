---
name: Upstox
region: India
status: official
trading: false
server_type: remote (hosted)
source_url: https://upstox.com/developer/api-documentation/mcp-integration/
last_verified: 2026-07-16
confidence: high
---

# Upstox

## Overview

Upstox ships an official hosted MCP server at https://mcp.upstox.com/mcp, distributed
for Claude via an official plugin marketplace (upstox/upstox-plugin-marketplace). It
is explicitly read-only: it exposes holdings, orders, positions, mutual funds, account
funds, profile and market data context, but the docs state you cannot place orders,
modify positions or execute trades through the AI assistant. Auth is OAuth.

## How to connect

```bash
Claude Code: /plugin marketplace add upstox/upstox-plugin-marketplace then /plugin install upstox-mcp@upstox-plugins-official. Direct endpoint: https://mcp.upstox.com/mcp
```

## Trading scope

none — read-only by design

## Caveats

- Read-only by design — Upstox docs state plainly: 'You cannot place orders, modify
  positions, or execute trades through the AI assistant.' Not an execution route.
- Requires an active, non-dormant Upstox trading account.
- OAuth authorization must be re-done daily — Upstox requires daily reconnection for
  security, which makes it awkward for unattended/automated use.
- No first-party public GitHub repo found for the server itself; it is a hosted
  service, so the implementation is not auditable.

## Community repos (not endorsed by Upstox)

Upstox's own server is read-only, but at least one community server exposes an order tool. READMEs read 2026-11-11; stars and pushes from the GitHub API the same day. Source code was not read, so "can trade" below is the README's claim, not a verified tool registration. All three are small, have no license file, and handle Upstox API keys and access tokens.

- **[adibhattar95/upstox-mcp-server](https://github.com/adibhattar95/upstox-mcp-server)** (local; 5 stars, last push 2025-09-10, no license). **Can place orders:** the README lists `place_order_tool` alongside profile, funds and margin, holdings, market price and brokerage-charge tools. Its setup steps point at an Upstox *sandbox* app, which limits blast radius if you follow them as written. No order confirmation step is described. Stale for over a year.
- **[Manu3511/UPSTOX-MCP-Server](https://github.com/Manu3511/UPSTOX-MCP-Server)** (hosted by you, SSE, e.g. on Render; 2 stars, last push 2026-07-01, no license). Read-only per its README: `login_upstox`, profile, holdings, positions, funds and a P&L summary; the author states it cannot place orders. The access token lives in server memory, so a public deploy means your Upstox token sits on a free-tier host.
- **[Finance-LLMs/Upstox-MCP-Server](https://github.com/Finance-LLMs/Upstox-MCP-Server)** (local, SSE on port 8787; 1 star, last push 2025-09-06, no license). Read-only per its README: profile, funds and margin, holdings, positions, MTF positions, order book, order details, order history and trades. Its README says there is no official Upstox MCP server, which is out of date.

## Sources

Checked directly on 2026-07-16:

- <https://upstox.com/developer/api-documentation/mcp-integration/>
