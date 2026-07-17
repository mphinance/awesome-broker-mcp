---
name: Deriv
region: Global (ex-US) — Malta / Cyprus
status: community
trading: false
server_type: local (stdio; uv or Docker)
source_url: https://tradersview.deriv.com/
last_verified: 2026-07-16
confidence: medium
---

# Deriv

## Overview

Deriv has no official MCP server. Trade press lumps Deriv into the broker-MCP wave
because of its TradersView product, but I fetched tradersview.deriv.com and it is a
login-free web market-analysis dashboard with zero references to Model Context
Protocol and no trading — it is not an MCP route at all. The only actual MCP option is
a stale two-tool read-only personal project.

## How to connect

```bash
uv run server.py  (or: docker build -t deriv-api-mcp .) — requires DERIV_API_TOKEN in a .env file; then add to your Claude config.
```

## Trading scope

none — read-only, and barely that: 2 tools (`get_active_symbols`,
`get_account_balance`).

## Caveats

- Correcting a common error: LeapRate and similar coverage frame Deriv's TradersView
  as its MCP play. It is not. I fetched the site — no MCP endpoint, no Model Context
  Protocol mention, no order placement. It is a marketing/acquisition dashboard.
- No official Deriv MCP server found anywhere (web, GitHub, npm).
- The community repo is minimal and abandoned: 0 stars, 4 commits, last push
  2025-01-07 (~18 months stale). Verified via GitHub API.
- The `raju-deriv` GitHub handle suggests a Deriv employee, but the repo sits under a
  personal account, not a Deriv org — treat as community/personal, NOT official,
  despite aggregator sites (mcpmarket, skywork) mislabeling it "the official
  implementation".
- Only 2 read-only tools. It cannot place trades. This is a demo, not a usable trading
  route.
- DIY-wrapper candidate: Deriv's WebSocket API is public and well documented.

## Sources

Checked directly on 2026-07-16:

- <https://tradersview.deriv.com/>
- <https://github.com/raju-deriv/mcp-deriv-api-server>
- <https://www.leaprate.com/technology/broker-mcp-ai-agent-trading-infrastructure-race-2026/>
- <https://fxnewsgroup.com/forex-news/retail-forex/deriv-launches-tradersview-ai-based-market-intelligence-platform/>
