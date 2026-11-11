---
name: Hyperliquid
region: Global / onchain (decentralized perps DEX)
status: community
trading: true
server_type: local
source_url: https://github.com/Impa-Ventures/hyperliquid-mcp
last_verified: 2026-11-11
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

## Other community repos (READMEs read 2026-11-11)

None of these is first-party. All three sign onchain transactions with a wallet private key
passed by environment variable, and GitHub detects no license file in any of them. Tool lists
are README claims; we did not run `list_tools`.

- [`caiovicentino/hyperliquid-mcp-server`](https://github.com/caiovicentino/hyperliquid-mcp-server):
  Python, Portuguese README, claims 27 tools in 4 categories incl. place/batch/cancel/modify
  orders, TWAP and leverage. 36 stars, last push 2025-11-10, not archived. README badge says MIT.
- [`edkdev/hyperliquid-mcp`](https://github.com/edkdev/hyperliquid-mcp): Python on the official
  SDK, PyPI `mcp-hyperliquid`, bracket orders, vaults, testnet flag. 24 stars, last push
  2025-10-27, not archived.
- [`GigabrainGG/hyperliquid-mcp`](https://github.com/GigabrainGG/hyperliquid-mcp): FastMCP and
  Poetry, market/limit/bracket orders, TP/SL, spot-perp transfers, testnet flag. 20 stars, last
  push 2026-05-02, not archived.
- [`dwellir-public/hyperliquid-skills`](https://github.com/dwellir-public/hyperliquid-skills): an
  agent skill (not an MCP server) from node vendor Dwellir, not Hyperliquid. Covers HyperEVM
  RPC, Info API and gRPC streaming through Dwellir endpoints; its `hyperliquid-data` variant
  excludes trade execution. MIT, 6 stars, last push 2026-10-20, not archived.

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

Checked directly on 2026-11-11 (README re-read, repo stats re-pulled: still 3 stars, 4 forks, last push 2025-03-25; org search for mcp still 0):

- <https://github.com/Impa-Ventures/hyperliquid-mcp>
- <https://github.com/orgs/hyperliquid-dex/repositories?q=mcp>
- Repo metadata and READMEs for the four repos under "Other community repos" (2026-11-11);
  `gh repo list hyperliquid-dex` shows SDKs and node code only, no MCP or skills repo
