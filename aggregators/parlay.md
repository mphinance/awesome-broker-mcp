---
name: Parlay
region: Global (prediction-market venues)
status: official
trading: false
server_type: remote
source_url: https://github.com/parlay-run/parlay-mcp
last_verified: 2026-10-09
confidence: medium
---

# Parlay

## Overview

Hosted, read-only prediction-market aggregator. It searches and compares live markets across
Polymarket, Kalshi and Limitless (real money), with Manifold as a separate sentiment-only
signal. It cannot place orders. Built on the open-source PMXT SDK with its trading methods
deliberately not exposed. Run by the parlay.run project; the legal operator is unconfirmed.

## How to connect

Endpoint: `https://mcp.parlay.run/mcp` (Streamable HTTP). A POST `initialize` answered 200 on
2026-10-09 (server v0.2.0, protocol 2025-11-25).

**Claude.ai**: Settings → Connectors → Add custom connector → paste the URL → OAuth.

**Cursor / Claude Code / Cline**: add the URL with header `Authorization: Bearer <token>`;
tokens come from parlay.run/settings/tokens.

You never give it venue API keys.

## Trading scope

None. Six tools, all annotated `readOnlyHint`: `search_markets`, `market_brief`,
`discover_markets`, `compare_markets`, `scan_discrepancies`, `inspect_platform`. Cross-venue
spread and discrepancy feeds are informational, not trade recommendations.

## Safety / guardrails

Read-only by design: no order placement, no positions, no custody, no venue credentials held.
Responses carry risk flags (settlement, liquidity, staleness), match confidence and a
non-recommendation disclaimer. Manifold is excluded from the real-money comparison tools.

## Caveats

- **Not a broker aggregator.** It informs prediction-market research and does not execute.
  To trade these venues use each venue's own tooling (see [Kalshi](../brokers/kalshi.md),
  [Polymarket](../brokers/polymarket.md)).
- The GitHub repo is a connection bundle only (MIT, 6 stars, created 2026-05-08, last push
  2026-05-26, about 4.5 months quiet). The server itself is closed source.
- Metered per its README: Free 15 calls/month, Pro $29/month for 150 calls. May change.
- Young project from one org with one public repo; operator identity unconfirmed.

## Sources

Checked directly on 2026-10-09:

- <https://github.com/parlay-run/parlay-mcp>
- <https://mcp.parlay.run/mcp>
- <https://parlay.run>
