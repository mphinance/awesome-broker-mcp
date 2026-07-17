---
name: Trade Agent
region: US (broker coverage) + crypto
status: official
trading: true
server_type: remote
source_url: https://mcpservers.org/servers/Trade-Agent/trade-agent-mcp
last_verified: 2026-07-16
---

# Trade Agent

## Overview

Hosted, trading-capable multi-broker aggregator. Product name "Trade Agent," company
site is **tradeit.app** (Trade It) — worth noting because your original brief listed
the domain as `mcp.thetradeagent.ai`, which didn't come up anywhere in what I found.
Could be a rebrand, a marketing alias, or the earlier note being stale — flagging
rather than guessing. Confirm before publishing this as authoritative.

## How to connect

Hosted endpoints:
- Streamable HTTP: `https://mcp.tradeit.app/mcp`
- SSE: `https://mcp.tradeit.app/sse`

Create an account at tradeit.app, start the Pro plan free trial, connect your
brokerage, point your MCP client at one of the URLs above. Auth via browser-based
OAuth flow.

## Trading scope

**Brokers**: Robinhood, Charles Schwab, E*TRADE, Webull, Public, tastytrade.
**Crypto**: Coinbase, Kraken.

Stock/crypto buy/sell, limit/stop orders, options spreads, straddles, multi-leg
strategies.

## Safety / guardrails

**Draft-first model**, same pattern as the official IBKR connector: `create_trade` /
`create_options_trade` builds a draft; the agent must show order details and get
explicit confirmation before calling `execute_trade` — the docs explicitly instruct
against auto-executing right after drafting. Trade It "cannot withdraw funds,
transfer assets, or take custody — it can only place trades." Ambiguous order
parameters trigger a clarification request rather than a best-guess fill.

## Caveats

- **Domain discrepancy noted above — verify `tradeit.app` vs. `thetradeagent.ai`
  before connecting anything to this.**
- Requires a Pro plan (free trial available) — not free-tier accessible.
