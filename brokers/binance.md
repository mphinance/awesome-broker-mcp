---
name: Binance
region: Global (Binance.com; Binance.US is a separate entity)
status: community
trading: true
server_type: local
source_url: https://github.com/TermiX-official/binance-mcp
last_verified: 2026-11-11
confidence: medium
---

# Binance

## Overview

Binance has no first-party MCP server. A search of the official Binance GitHub
organization for 'mcp' still returns zero repositories (re-checked 2026-11-11). Numerous community implementations
exist, of which TermiX-official/binance-mcp (97 stars, TypeScript) is confirmed live
and supports placing spot market orders via Claude Desktop; its source also has TWAP and
VP algo-order tools for spot and futures. The repo has not been pushed to since 2025-04-16.

## How to connect

```bash
git clone https://github.com/TermiX-official/binance-mcp && npm install && npm run build && npm start (requires Binance API key/secret, Node 16+)
```

## Trading scope

Varies by repo. TermiX-official/binance-mcp covers spot market orders plus TWAP
algorithmic execution. Other community repos claim broader coverage (spot, wallets,
staking, convert, algo trading), unverified.

## Caveats

- No official Binance MCP server: verified via
  https://github.com/orgs/binance/repositories?q=mcp returning 0 repositories.
- At least eight competing community repos exist (ethancod1ng, AnalyticAce, nirholas,
  snjyor, berlinbra, py7hagoras, pawneetdev, node2flow-th). Quality, maintenance, and
  trading coverage were not individually verified — only TermiX-official was fetched.
- Handing live Binance API keys with trade permissions to an unaudited third-party
  repo is the material risk here; none of these are vetted by Binance.
- Binance.US is a legally separate exchange; a community repo
  (nirholas/Binance-US-MCP) was seen in search results but was not fetched or
  verified.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/TermiX-official/binance-mcp>
- <https://github.com/orgs/binance/repositories?q=mcp>
