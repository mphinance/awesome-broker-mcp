---
name: Kalshi
region: US
status: community
trading: true
server_type: local
source_url: https://github.com/9crusher/mcp-server-kalshi
last_verified: 2026-07-16
confidence: high
---

# Kalshi

## Overview

No first-party Kalshi MCP server exists. Several community servers do, and they are
unusually mature for this category — the most credible is 9crusher/mcp-server-kalshi
(22 stars), which wraps the Kalshi REST API and supports full order lifecycle. It
authenticates with a Kalshi API key plus an RSA private key, defaults to the demo
sandbox, and gates order-placing tools behind confirm=true (without it, tools return a
preview payload and place nothing).

## How to connect

```bash
uvx mcp-server-kalshi  (also runs via Docker; env: KALSHI_ENV, KALSHI_API_KEY, KALSHI_PRIVATE_KEY_PATH)
```

## Trading scope

Kalshi event contracts (binary Yes/No markets): create/amend/cancel/decrease orders,
list orders, portfolio positions. Demo sandbox by default; real money requires
KALSHI_ENV=prod.

## Caveats

- NOT official. A search-engine summary asserted 9crusher/mcp-server-kalshi was 'the
  official implementation' — fetching the repo directly disproves this. It is
  maintained by an individual (9crusher) with no Kalshi affiliation, and the README
  makes no official claim. Do not list it as first-party.
- I did not fetch kalshi.com or Kalshi's API docs directly, so 'no official server
  exists' is inferred from the absence of any first-party result across two searches
  rather than from a first-party denial.
- Community field is crowded and low-adoption: alexandermazza/kalshi-trading-mcp
  (confirmed, but only 2 stars, pip install kalshi-trading-mcp), IQAIcom/mcp-kalshi,
  yakub268/kalshi-mcp, joinQuantish/kalshi-mcp all appeared in results. Star counts in
  the low double digits at best — treat all as hobby-grade for real-money use.
- This server can move real money. The confirm=true gate and demo default are the
  author's own safety choices, not exchange-enforced guarantees.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/9crusher/mcp-server-kalshi>
- <https://github.com/alexandermazza/kalshi-trading-mcp>
