---
name: Kalshi
region: US
status: official + community
trading: true
server_type: remote (official, read-only) or local community
source_url: https://docs.kalshi.com/getting_started/mcp
last_verified: 2026-11-11
confidence: high
---

# Kalshi

## Overview

**Kalshi now runs an official hosted MCP connector** at `https://api.elections.kalshi.com/mcp`
(Streamable HTTP, per [docs.kalshi.com/getting_started/mcp](https://docs.kalshi.com/getting_started/mcp)).
It is **read-only for trading**: public market tools need no account; portfolio and price-alert
tools use OAuth (scopes `read::mcp_portfolio`, `read::mcp_alerts`, `write::mcp_alerts`, no API
key pasted). The docs state it "does not place or cancel orders, transfer funds, or save trade
drafts"; `get_market_links` returns links so you submit the order on Kalshi yourself. It
covers prediction markets and perps, and can create, replace and delete price alerts.
To place orders from an agent you still need a community server. Those are unusually mature
for this category; the most credible is 9crusher/mcp-server-kalshi
(32 stars, v0.2.4 on 2026-08-23, last push 2026-09-19), which wraps the Kalshi REST API and supports full order lifecycle. It
authenticates with a Kalshi API key plus an RSA private key, defaults to the demo
sandbox, and gates order-placing tools behind confirm=true (without it, tools return a
preview payload and place nothing).

## How to connect

```bash
# Official, read-only: add remote MCP server https://api.elections.kalshi.com/mcp (OAuth for account tools)
# Community, can trade:
uvx mcp-server-kalshi  (also runs via Docker; env: KALSHI_ENV, KALSHI_API_KEY, KALSHI_PRIVATE_KEY_PATH)
```

## Trading scope

Kalshi event contracts (binary Yes/No markets): create/amend/cancel/decrease orders,
list orders, portfolio positions. Demo sandbox by default; real money requires
KALSHI_ENV=prod.

## Caveats

- 9crusher/mcp-server-kalshi is NOT official. A search-engine summary asserted it was 'the
  official implementation' — fetching the repo directly disproves this. It is
  maintained by an individual (9crusher) with no Kalshi affiliation, and the README
  makes no official claim. Do not list it as first-party.
- The official connector's account OAuth needs a client supporting OAuth Client ID Metadata
  Documents (CIMD) or one registered with Kalshi; dynamic client registration is not
  advertised, and a Kalshi API key is not an OAuth client secret (per its docs).
- Official connector docs read 2026-11-11; we did not connect to it.
- Community field is crowded and low-adoption: alexandermazza/kalshi-trading-mcp
  (confirmed, but only 2 stars, pip install kalshi-trading-mcp), IQAIcom/mcp-kalshi,
  yakub268/kalshi-mcp, joinQuantish/kalshi-mcp all appeared in results. Star counts in
  the low double digits at best — treat all as hobby-grade for real-money use.
- This server can move real money. The confirm=true gate and demo default are the
  author's own safety choices, not exchange-enforced guarantees.

## Sources

Checked directly on 2026-07-16; official connector docs re-read 2026-11-11:

- <https://docs.kalshi.com/getting_started/mcp>

- <https://github.com/9crusher/mcp-server-kalshi>
- <https://github.com/alexandermazza/kalshi-trading-mcp>
