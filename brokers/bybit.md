---
name: Bybit
region: Global (not available to US retail)
status: official
trading: true
server_type: local
source_url: https://github.com/bybit-exchange/trading-mcp
last_verified: 2026-07-16
confidence: high
---

# Bybit

## Overview

Bybit publishes an official MCP server under the bybit-exchange GitHub organization,
providing 206 tools across roughly 23 categories spanning market data, trading,
positions, account, asset, user, and real-time WebSocket streams. It runs as a local
stdio process launched by the AI client rather than manually.

## How to connect

```bash
npx -y bybit-official-trading-server@latest (configure in your MCP client; the client manages the stdio process)
```

## Trading scope

Spot, derivatives, and positions. The 'trade' tool category covers create/amend/cancel
orders, batch order operations, order history, and order pre-check. Also exposes
account, asset, copy trading, and WebSocket/WS-trade streams.

## Caveats

- The official server exposes order placement by default — no scope gating comparable
  to Kraken's was observed in the material fetched.
- Several unrelated community Bybit MCP repos also exist (sammcj/bybit-mcp,
  dlwjdtn535/mcp-bybit-server, BCusack/bybit-py-mcp, ethancod1ng/bybit-mcp-server);
  the bybit-exchange org repo is the first-party one.
- Bybit does not serve US retail customers, which limits who can actually use this.
- Tool count (206) is as stated in the repo README; not independently counted.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/bybit-exchange/trading-mcp>
- <https://www.tradingview.com/news/chainwire:3c517c0ef094b:0-bybit-ai-expands-to-infrastructure-layer-with-official-mcp-release-for-multi-agent-trading/>
