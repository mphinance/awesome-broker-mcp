---
name: Alpaca
region: US
status: community
trading: true
server_type: local
source_url: https://github.com/alpacahq/alpaca-mcp-server
last_verified: 2026-07-16
---

# Alpaca

## Overview

Community-maintained but run by Alpaca's own GitHub org (`alpacahq`) — closer to
semi-official than a random third party, though it's still a self-run local server,
not a hosted connector. Actively maintained: 162 commits, 874 stars, 23 open issues.

## How to connect

```
uvx alpaca-mcp-server
```

Two env vars: `ALPACA_API_KEY`, `ALPACA_SECRET_KEY`. No `.env` file or extra init
required.

## Trading scope

Stocks, ETFs, crypto, options, fixed income, indices. Order types: market, limit,
stop, stop-limit, trailing-stop, bracket orders (stocks/crypto); single- and
multi-leg strategies (options). Portfolio, positions, watchlists, real-time data,
news.

## Safety / guardrails

Paper trading is the **default** (`ALPACA_PAPER_TRADE=true` unless you override it).
`ALPACA_TOOLSETS` env var restricts which tool groups are exposed — filtering happens
server-side, not just hidden in the client.

## Caveats

- **This is v2, a complete rewrite.** "None of the V1 tools exist in V2 — tool names,
  parameters, and schemas have changed." If you find an old v1 tutorial, it won't
  match current behavior.
