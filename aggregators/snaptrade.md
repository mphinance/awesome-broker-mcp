---
name: SnapTrade
region: US (broker coverage varies)
status: official
trading: false
server_type: remote
source_url: https://docs.snaptrade.com/docs/mcp-server
last_verified: 2026-07-16
---

# SnapTrade

## Overview

Hosted, official MCP server aggregating multiple brokers behind one endpoint.
**Confirmed read-only** — the docs state it directly: *"The MCP server is read-only.
It can retrieve account data and generate a link to connect a new brokerage, but it
cannot place trades, move money, or change account settings."*

## How to connect

Hosted endpoint: `https://mcp.snaptrade.com/mcp`

**Claude**: Settings → Connectors → Add custom connector → paste the URL.
**ChatGPT**: Settings → Developer mode → create a developer-mode app with the URL.

**Auth**: OAuth 2.0 authorization-code + PKCE, with Dynamic Client Registration
(RFC 7591) and token introspection (RFC 7662). Your SnapTrade `userId`/`userSecret`
and brokerage credentials are never exposed to the AI assistant — SnapTrade resolves
identity from the token, not the credentials.

Per your original notes, broker coverage includes Robinhood, Schwab, Fidelity,
Vanguard, E*TRADE, Alpaca, Tradier, Trading 212 — the docs page fetched didn't itself
enumerate the broker list, so that coverage claim traces to your notes, not this
source_url directly.

## Trading scope

None. 18 tools, all annotated read vs write for AI clients, but write capability is
absent from the server entirely — not just gated.

## Safety / guardrails

Read-scoped tokens only, short-lived, revocable anytime from the SnapTrade
dashboard.

## Caveats

- If you want trading through SnapTrade's underlying API (not just their hosted
  read-only MCP), the DIY path is
  [`dangelov/mcp-snaptrade`](https://github.com/dangelov/mcp-snaptrade) — not
  independently verified, listed for reference only.
