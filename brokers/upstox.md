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
- Correction: the earlier claim that no first-party repo exists is stale. The official `upstox` org has [`mcp-server-upstox-api`](https://github.com/upstox/mcp-server-upstox-api) (last push 2026-08-19, no license or description on the API). Its README is a clone-and-run local setup (Cloudflare Worker project, `localhost:8787`, you supply your own API key and secret). Its `src/tools` file list is read-only style (profile, funds and margin, holdings, positions, order book, order details, order history, trades, IPO and mutual fund getters; no place-order file). Re-checked 2026-11-11 in the code: `src/tools/index.ts` exports 18 getters (profile, funds and margin, holdings, positions, MTF positions, order book and details and history, trades, mutual fund holdings, orders and SIPs, IPOs and IPO orders), every one registered with read-only annotations and calling Upstox with `GET`; no place, modify or cancel order tool exists. Auth is a Cloudflare Workers OAuth provider that exchanges your own app's client ID and secret (`.dev.vars`) for an Upstox token, the README documents only `localhost:8787`, and the repo's `package.json` names it `upstox-mcp-server`. Nothing in the repo ties it to the hosted `mcp.upstox.com` server, so it is the official org's self-hosted read-only server, not confirmed as the hosted server's code.
- Separate from the MCP: the docs page now says a distinct `upstox-skill` (Claude Code and Codex agent skill, Python SDK, daily access token) can place and manage orders. Repo `upstox/upstox-skills` (last push 2026-06-09) describes "Order Execution: Place, modify, and manage live orders". That is a skill, not the MCP server, so `trading: false` for the MCP stands.

## Community repos (not endorsed by Upstox)

Upstox's own server is read-only, but at least one community server exposes an order tool. READMEs read 2026-11-11; stars and pushes from the GitHub API the same day. Source code was not read for the first three, so "can trade" there is the README's claim, not a verified tool registration; the later two were checked in code as noted. All are small, have no license file, and handle Upstox API keys and access tokens.

- **[adibhattar95/upstox-mcp-server](https://github.com/adibhattar95/upstox-mcp-server)** (local; 5 stars, last push 2025-09-10, no license). **Can place orders:** the README lists `place_order_tool` alongside profile, funds and margin, holdings, market price and brokerage-charge tools. Its setup steps point at an Upstox *sandbox* app, which limits blast radius if you follow them as written. No order confirmation step is described. Stale for over a year.
- **[Manu3511/UPSTOX-MCP-Server](https://github.com/Manu3511/UPSTOX-MCP-Server)** (hosted by you, SSE, e.g. on Render; 2 stars, last push 2026-07-01, no license). Read-only per its README: `login_upstox`, profile, holdings, positions, funds and a P&L summary; the author states it cannot place orders. The access token lives in server memory, so a public deploy means your Upstox token sits on a free-tier host.
- **[Finance-LLMs/Upstox-MCP-Server](https://github.com/Finance-LLMs/Upstox-MCP-Server)** (local, SSE on port 8787; 1 star, last push 2025-09-06, no license). Read-only per its README: profile, funds and margin, holdings, positions, MTF positions, order book, order details, order history and trades. Its README says there is no official Upstox MCP server, which is out of date.
- **[venkateshTechmates/UpstoxMcp](https://github.com/venkateshTechmates/UpstoxMcp)** (hosted by you, HTTP and SSE, written for Render; 0 stars, last push 2026-05-15, no license). **Can place orders:** 12 tools including `place_order` and `cancel_order`, plus profile, funds, quotes, positions, holdings, order and trade books and historical candles. `UPSTOX_ENV` defaults to `sandbox` and the README says live mode is real money. I read the README and grepped `server.py` (not a full audit): the access token, API key and secret are env vars, there is no confirmation step on `place_order`, CORS is `allow_origins=*`, and I saw no inbound auth check, so a public Render URL would let anyone who finds it reach a server holding your token. Keep it on sandbox.
- **[rahul91-ai/upstox-custom-mcp](https://github.com/rahul91-ai/upstox-custom-mcp)** (hosted by you, streamable HTTP via FastMCP; 0 stars, last push 2026-08-23, no license, no README). Three files only. `server.py` registers 8 read-only tools (LTP, full quote, option chain, historical candles, holdings, positions, funds, profile) and no order tool. It reads one token from `UPSTOX_ANALYTICS_TOKEN`. Minimal and unvetted; I read the code, there is no documentation.
- **[Sambhram1/upstox-skill](https://github.com/Sambhram1/upstox-skill)**: **skipped as unusable.** The repo is one `SKILL.md` that documents an MCP server living at a hardcoded `C:/Users/...` path on the author's machine (including `place/manage orders`); the server code is not published, so there is nothing to run or review.

## Sources

Checked directly on 2026-07-16 and re-read 2026-11-11:

- <https://upstox.com/developer/api-documentation/mcp-integration/> (confirms read-only quote, OAuth, daily re-authorization, plugin marketplace commands, active non-dormant account)
- <https://mcp.upstox.com/mcp> (initialize probe, 401)
- <https://github.com/upstox/mcp-server-upstox-api>, <https://github.com/upstox/upstox-skills>, <https://github.com/upstox/upstox-plugin-marketplace> (GitHub API and READMEs)

The first three community repos above were not re-checked this session, so their 2026-11-11 figures stand from the earlier pass. The venkateshTechmates, rahul91-ai and Sambhram1 repos and the official `upstox/mcp-server-upstox-api` code were read via the GitHub API on 2026-11-11.
