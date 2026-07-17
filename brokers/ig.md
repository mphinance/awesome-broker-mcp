---
name: IG
region: UK / global broker — but the MCP server is live in Australia only
status: official
trading: false
server_type: remote (hosted)
source_url: none found
last_verified: 2026-07-16
confidence: medium
---

# IG

## Overview

IG Australia launched an MCP-powered assistant, "IG Trading: CFD Assistant", that
connects a live IG CFD account to an AI assistant. It is deliberately read-only — no
placing, modifying or closing trades — which IG frames as a compliance choice.
Critically for Claude users: it currently ships only as a ChatGPT App Store app. IG's
site says Claude support is coming "soon", but it is NOT live today.

## How to connect

```bash
Official route: connect via the ChatGPT App Store app "IG Trading: CFD Assistant" using your existing IG login (AU live CFD accounts, no minimum balance). No Claude route yet.
```

## Trading scope

none — strictly read-only: live bid/ask, open positions and working orders, P&L,
margin requirements, client sentiment (% long vs short), OHLC history, activity log,
transaction history, watchlists, portfolio metrics.

## Caveats

- Australia only. It appears on IG's AU site and not on other regional sites.
- ChatGPT only at time of writing — Claude is promised "soon" but is not connectable
  today. For a Claude-based directory this is effectively a not-yet route.
- Read-only by design. Cannot place, modify or close orders.
- I could not locate or fetch any first-party ig.com page documenting the MCP server;
  confirmation rests on trade press (Finance Magnates, LeapRate, itbrief.com.au).
- Community alternative that CAN trade: kea0811/ig-trading-mcp (npm `ig-trading-mcp`
  v1.0.0, 21 tools, `npx ig-trading-mcp serve`). I verified the repo and npm package
  exist. But: only 5 stars, last pushed 2025-08-14, unaudited, and it wants your IG
  username/password in plaintext env vars. Treat as risky — do not point live money at
  it without reading the source.
- github.com/IG-incubator/IG-Skills exists and maps natural language to IG REST
  endpoints including `POST /positions/otc`, but it is Agent Skills definitions, NOT
  an MCP server — and "IG-incubator" is an unverified personal GitHub user account
  (not an org, no company/email set, 1 repo, 0 stars, created and abandoned
  2026-03-10). Do not treat it as official IG.

## Sources

Checked directly on 2026-07-16:

- <https://www.financemagnates.com/forex/ig-australia-launches-mcp-server-opens-its-trading-platform-to-chatgpt/>
- <https://www.leaprate.com/technology/broker-mcp-ai-agent-trading-infrastructure-race-2026/>
- <https://github.com/kea0811/ig-trading-mcp>
- <https://www.npmjs.com/package/ig-trading-mcp>
