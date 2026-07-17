---
name: Tradovate
region: US
status: community
trading: true
server_type: local (stdio; Go binary or Node)
source_url: https://github.com/0xjmp/mcp-tradovate
last_verified: 2026-07-16
confidence: high
---

# Tradovate

## Overview

No official Tradovate MCP server, despite Tradovate being owned by NinjaTrader Group.
Multiple community servers exist and are confirmed in GitHub's index. The most
established is 0xjmp/mcp-tradovate (16 stars, Go, MIT, by Jake Peterson), offering
auth, order placement/cancellation/fill tracking, market data, position viewing and
risk controls (daily loss limits, drawdown caps, position sizing).
ozmnf4/tradovate-mcp (2 stars, JS) also places orders via a tv_place_order tool.

## How to connect

```bash
npx -y @smithery/cli install @0xjmp/mcp-tradovate --client claude — or clone https://github.com/0xjmp/mcp-tradovate, build with Go, and put Tradovate credentials in .env.
```

## Trading scope

Futures via the Tradovate API — market and limit orders with configurable
time-in-force, plus order modify/cancel and position viewing.

## Caveats

- No official first-party MCP server.
- 0xjmp/mcp-tradovate's latest release is v0.0.10 dated March 7 2025 — roughly 16
  months stale as of July 2026. Verify it still works against the current Tradovate
  API before trusting it with orders.
- Other in-index options are small/unproven: alexanimal/tradovate-mcp-server (1 star),
  lwsinclair/TradovateMCPServer (0 stars), ocrosby/market-bridge (5 stars, Python,
  bridges Tradovate/Bookmap/Thinkorswim for /ES data).
- I did not fetch a first-party Tradovate page confirming their MCP stance, so the 'no
  official server' finding rests on absence of evidence in search plus GitHub — hence
  no source_url.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/0xjmp/mcp-tradovate>
- <https://github.com/ozmnf4/tradovate-mcp>
- <https://github.com/search?q=tradovate+mcp&type=repositories>
