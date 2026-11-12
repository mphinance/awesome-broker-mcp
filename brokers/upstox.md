---
name: Upstox
region: India
status: official
trading: false
server_type: remote (hosted)
source_url: https://upstox.com/developer/api-documentation/mcp-integration/
last_verified: 2026-11-11
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
- Endpoint probe 2026-11-11: an unauthenticated initialize POST to https://mcp.upstox.com/mcp returned HTTP 401 with a Bearer OAuth `www-authenticate` header and protected-resource metadata, consistent with the OAuth claim. No credentials were sent and no tools were called.
- Correction: the earlier claim that no first-party repo exists is stale. The official `upstox` org has [`mcp-server-upstox-api`](https://github.com/upstox/mcp-server-upstox-api) (last push 2026-08-19, no license or description on the API). Its README is a clone-and-run local setup (Cloudflare Worker project, `localhost:8787`, you supply your own API key and secret). Its `src/tools` file list is read-only style (profile, funds and margin, holdings, positions, order book, order details, order history, trades, IPO and mutual fund getters; no place-order file). Source was not read, and it is not confirmed that this is the code behind the hosted server.
- Separate from the MCP: the docs page now says a distinct `upstox-skill` (Claude Code and Codex agent skill, Python SDK, daily access token) can place and manage orders. Repo `upstox/upstox-skills` (last push 2026-06-09) describes "Order Execution: Place, modify, and manage live orders". That is a skill, not the MCP server, so `trading: false` for the MCP stands.

## Community repos (not endorsed by Upstox)

Upstox's own server is read-only, but at least one community server exposes an order tool. READMEs read 2026-11-11; stars and pushes from the GitHub API the same day. Source code was not read, so "can trade" below is the README's claim, not a verified tool registration. All three are small, have no license file, and handle Upstox API keys and access tokens.

- **[adibhattar95/upstox-mcp-server](https://github.com/adibhattar95/upstox-mcp-server)** (local; 5 stars, last push 2025-09-10, no license). **Can place orders:** the README lists `place_order_tool` alongside profile, funds and margin, holdings, market price and brokerage-charge tools. Its setup steps point at an Upstox *sandbox* app, which limits blast radius if you follow them as written. No order confirmation step is described. Stale for over a year.
- **[Manu3511/UPSTOX-MCP-Server](https://github.com/Manu3511/UPSTOX-MCP-Server)** (hosted by you, SSE, e.g. on Render; 2 stars, last push 2026-07-01, no license). Read-only per its README: `login_upstox`, profile, holdings, positions, funds and a P&L summary; the author states it cannot place orders. The access token lives in server memory, so a public deploy means your Upstox token sits on a free-tier host.
- **[Finance-LLMs/Upstox-MCP-Server](https://github.com/Finance-LLMs/Upstox-MCP-Server)** (local, SSE on port 8787; 1 star, last push 2025-09-06, no license). Read-only per its README: profile, funds and margin, holdings, positions, MTF positions, order book, order details, order history and trades. Its README says there is no official Upstox MCP server, which is out of date.

## Sources

Checked directly on 2026-07-16 and re-read 2026-11-11:

- <https://upstox.com/developer/api-documentation/mcp-integration/> (confirms read-only quote, OAuth, daily re-authorization, plugin marketplace commands, active non-dormant account)
- <https://mcp.upstox.com/mcp> (initialize probe, 401)
- <https://github.com/upstox/mcp-server-upstox-api>, <https://github.com/upstox/upstox-skills>, <https://github.com/upstox/upstox-plugin-marketplace> (GitHub API and READMEs)

The three community repos above were not re-checked this session, so their 2026-11-11 figures stand from the earlier pass.
