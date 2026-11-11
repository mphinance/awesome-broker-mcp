---
name: Polymarket
region: Global
status: community
trading: true
server_type: local
source_url: https://github.com/BrainDAO/mcp-polymarket
last_verified: 2026-11-11
confidence: medium
---

# Polymarket

## Overview

No first-party Polymarket MCP server was found. The community field is large but
fragmented, with at least six independent implementations of varying quality.
BrainDAO/mcp-polymarket (formerly IQAIcom; 20 stars, published as @iqai/mcp-polymarket on npm,
latest release v0.1.0 on 2026-08-10, which migrated to Polymarket's V2 exchange and pUSD collateral) is trading-capable via an optional
POLYMARKET_PRIVATE_KEY. Read-only alternatives exist for data-only use.

## How to connect

```bash
npx @iqai/mcp-polymarket  (set POLYMARKET_PRIVATE_KEY to enable trading tools; omit for read-only)
```

## Trading scope

Polymarket outcome tokens: market and limit orders, open-order management,
portfolio/position tracking. Trading tools only activate when a wallet private key is
supplied; without it the server is read-only market data.

## Caveats

- NOT official — IQAI/BrainDAO is a third party, not Polymarket. The IQAIcom URL
  redirects to BrainDAO/mcp-polymarket, so the org appears to have been renamed; the
  npm package name @iqai/mcp-polymarket is the stable identifier.
- Trading requires handing a wallet private key to a third-party hobby server that
  signs on-chain orders. This is a materially higher risk posture than an API-key
  broker integration — key compromise means direct loss of wallet funds, with no
  exchange-side revocation.
- For read-only use, aryankeluskar/polymarket-mcp is confirmed and claims high usage
  (self-reported '#6 on Smithery, 50k+ tool calls/month'); it needs no Polymarket
  auth. That usage claim is self-reported and unverified.
- Repos claiming very large tool counts (demwick/polymarket-agent-mcp '48 tools',
  caiovicentino/polymarket-mcp-server '45 tools' with 'enterprise-grade safety')
  appeared in search results but I did NOT fetch them — do not list their specifics
  without verification.
- Region marked Global; I did not verify Polymarket's current US retail availability
  or regulatory status, so do not present a US-eligibility claim from this entry.
- Confidence medium, not high: the negative on an official server rests on search
  absence, and I verified only two of the six community repos.

## Sources

Checked directly on 2026-07-16; repo, v0.1.0 release notes and README re-read 2026-11-11:

- <https://github.com/BrainDAO/mcp-polymarket>
- <https://github.com/aryankeluskar/polymarket-mcp>
