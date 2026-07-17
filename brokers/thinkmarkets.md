---
name: ThinkMarkets
region: Australia / UK (global client base)
status: official
trading: true
server_type: remote (hosted)
source_url: none found
last_verified: 2026-07-16
confidence: medium
---

# ThinkMarkets

## Overview

ThinkMarkets launched "ChelseaAI", a first-party MCP server that connects a live
ThinkTrader account to an MCP-compatible assistant. It is execution-capable: with full
permissions the AI can place, modify and close real orders, though it can never touch
funds. ThinkMarkets explicitly names Claude as its recommended client. Launched 2 June
2026 for live and demo ThinkTrader accounts.

## How to connect

```bash
Connect via ThinkTrader (www.thinktrader.com) — choose your permission level (read-only vs full access) before connecting, then link your MCP-compatible assistant. Setup is claimed to take under two minutes.
```

## Trading scope

CFDs on the ThinkTrader platform — place, modify and close orders. 26 tools spanning
market data, position management, order execution and account info. Deposits,
withdrawals and transfers are excluded by design.

## Caveats

- I could NOT fetch ThinkMarkets' own pages —
  www.thinkmarkets.com/en/ai-trading/chelsea-ai/ and
  /en/trading-academy/ai-trading/what-is-mcp/ both return HTTP 403 (Cloudflare). Those
  first-party URLs appear in search results and are almost certainly real, but I did
  not read them, so setup details are unverified at source.
- No endpoint URL or config snippet is published in any source I could read —
  confirmation rests on trade press, including a Finance Magnates exclusive interview
  with CEO Nauman Anees.
- ThinkTrader only. ThinkMarkets' CEO explicitly said it is not supported on
  third-party platforms (i.e. no MT4/MT5).
- The "26 tools" figure and the Claude-free-tier detail come from syndicated PR
  coverage, not from a first-party page I read.
- Permission scoping is opt-in: read-only is available, so execution is not forced on.

## Sources

Checked directly on 2026-07-16:

- <https://www.financemagnates.com/forex/exclusive-thinkmarkets-launches-mcp-server-ai-can-execute-traders-but-not-access-funds/>
- <https://www.tradingview.com/news/financemagnates:68d0db3ca094b:0-exclusive-thinkmarkets-launches-mcp-server-ai-can-execute-trades-but-not-access-funds/>
- <https://www.universenewsnetwork.com/2026/06/02/thinkmarkets-pairs-chelseaai-with-claude-to-bring-cfd-trading-to-ai-chats/>
- <https://www.leaprate.com/technology/broker-mcp-ai-agent-trading-infrastructure-race-2026/>
