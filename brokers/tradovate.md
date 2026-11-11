---
name: Tradovate
region: US
status: official + community
trading: true
server_type: remote (official, shared with NinjaTrader) or local community (stdio; Go binary or Node)
source_url: https://docs.ninjatrader.com/mcp
last_verified: 2026-11-11
confidence: high
---

# Tradovate

## Overview

**An official hosted MCP server now exists**, run by NinjaTrader Group (Tradovate's owner):
[docs.ninjatrader.com/mcp](https://docs.ninjatrader.com/mcp). Its docs say it is "available
only to Tradovate and NinjaTrader users", and its endpoints are on Tradovate's own domain
(`mcp-demo.tradovateapi.com/mcp`, `mcp-live.tradovateapi.com/mcp`). Details (OAuth 2.1, 29
tools, order placement, risk settings, per-tool permissions) are on the
[NinjaTrader entry](ninjatrader.md). Older community servers also exist; the most
established is 0xjmp/mcp-tradovate (22 stars, Go, MIT, by Jake Peterson), offering
auth, order placement/cancellation/fill tracking, market data, position viewing and
risk controls (daily loss limits, drawdown caps, position sizing).
ozmnf4/tradovate-mcp (2 stars, JS) also places orders via a tv_place_order tool.
CrossTrade's hosted MCP (Elite tier) also has a `Tv_` tool group for linked Tradovate accounts.

## How to connect

```bash
Official (Demo first): claude mcp add tradovate-demo --transport http https://mcp-demo.tradovateapi.com/mcp   # Live: https://mcp-live.tradovateapi.com/mcp
Community: npx -y @smithery/cli install @0xjmp/mcp-tradovate --client claude, or clone https://github.com/0xjmp/mcp-tradovate, build with Go, and put Tradovate credentials in .env.
```

## Trading scope

Official server: futures and event contracts, with `place_order`, `modify_order`, `cancel_order`
and `close_position` (see the NinjaTrader entry). Community 0xjmp server: futures via the
Tradovate API, market and limit orders with configurable time-in-force, plus order modify/cancel
and position viewing.

## Caveats

- Official server docs read 2026-11-11; not connected to or tested with orders. Guardrails: server-side per-tool permissions, destructive-action hints, separate Demo and Live endpoints (see the NinjaTrader entry).
- 0xjmp/mcp-tradovate's latest release is v0.0.10 dated March 7 2025, roughly 20
  months stale as of November 2026. Verify it still works against the current Tradovate
  API before trusting it with orders.
- Other in-index options are small/unproven: alexanimal/tradovate-mcp-server (1 star),
  lwsinclair/TradovateMCPServer (0 stars), ocrosby/market-bridge (5 stars, Python,
  bridges Tradovate/Bookmap/Thinkorswim for /ES data).

## Sources

Checked directly on 2026-07-16; official docs re-read 2026-11-11:

- <https://docs.ninjatrader.com/mcp>
- <https://docs.ninjatrader.com/mcp/connect>
- <https://github.com/0xjmp/mcp-tradovate>
- <https://github.com/ozmnf4/tradovate-mcp>
- <https://github.com/search?q=tradovate+mcp&type=repositories>
