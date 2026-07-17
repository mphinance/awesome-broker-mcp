---
name: Hyperliquid
region: Global / onchain (decentralized perps DEX)
status: community
trading: true
server_type: local
source_url: https://github.com/Impa-Ventures/hyperliquid-mcp
last_verified: 2026-07-16
confidence: medium
---

# Hyperliquid

## Overview

Hyperliquid has no first-party MCP server — a search of the official hyperliquid-dex
GitHub organization for 'mcp' returns zero repositories. Multiple community servers
exist. Impa-Ventures/hyperliquid-mcp is confirmed live (TypeScript, wraps the
Hyperliquid SDK) and can place and cancel real orders.

## How to connect

```bash
pnpm install -g hyperliquid-mcp (or via npx in Claude Desktop config; Node 22+)
```

## Trading scope

Perpetuals and spot on the Hyperliquid DEX. Impa-Ventures/hyperliquid-mcp exposes
place_order (limit, market, conditional), cancel_order, and transfer_spot_perp, plus
market data tools (get_l2_book, get_candle_snapshot) — 13+ tools total.

## Caveats

- No official Hyperliquid MCP server: verified via
  https://github.com/orgs/hyperliquid-dex/repositories?q=mcp returning 0 repositories.
- The verified community repo has only 3 stars and 4 forks — very low adoption signal
  for something that signs onchain transactions.
- At least six competing community repos exist (edkdev, 6rz6, midodimori, moner124,
  caiovicentino, mektigboy); only Impa-Ventures was fetched and verified.
- Unlike a CEX API key, Hyperliquid trading requires exposing a wallet/agent private
  key to third-party code. This is a materially higher risk profile than the CEX
  entries and should be flagged prominently to users.
- An npm package @hyperliquid-ai/mcp-server appeared in search results; the
  'hyperliquid-ai' npm scope was NOT verified as affiliated with Hyperliquid and
  should not be assumed official.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/Impa-Ventures/hyperliquid-mcp>
- <https://github.com/orgs/hyperliquid-dex/repositories?q=mcp>
