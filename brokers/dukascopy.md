---
name: Dukascopy
region: Switzerland (site excludes Belgium, Israel, Russia, Turkey, Canada and the UK from solicitation)
status: official
trading: true
server_type: remote
source_url: https://ai.dukascopy.com/
last_verified: 2026-11-11
confidence: medium
---

# Dukascopy

## Overview

Dukascopy Bank's hosted MCP server for JForex accounts, on Dukascopy's own `ai.dukascopy.com` site. Today it supports JForex **demo** accounts only. Live trading is listed as "summer-autumn 2026" and no live endpoint is published. Dukascopy calls it "an experimental prototype".

## How to connect

Create a free JForex demo account, then add `https://demo-mcp.dukascopy.com/mcp` as an MCP server in your client (Claude: Settings, Connectors; ChatGPT Business: Settings, Apps with Developer Mode; Cursor and VS Code: MCP Servers). Log in through the secure Dukascopy window that opens. JForex does not need to be open.

Endpoint probe, 2026-11-11: unauthenticated JSON-RPC `initialize` to the demo URL returns `401` with `www-authenticate: Bearer resource_metadata=".../.well-known/oauth-protected-resource"`. Live and gated. A guessed `mcp.dukascopy.com/mcp` returned 404, so there is no live host at that name.

Auth: OAuth style login in a Dukascopy window; the page says the password is never shared with the AI.

## Trading scope

Described capabilities (tool names not published): account balance and exposure, orders and positions, market analysis, market orders, proportional positions, SL and TP calculation, partial closes. Per the FAQ only JForex Demo is supported; live, MT4, MT5 and Binary accounts are not.

## Safety / guardrails

- The page describes no confirmation step and no built-in guardrails.
- Dukascopy says the agent's actions "operate outside Dukascopy's control", suggestions are not financial advice, and the trader bears sole responsibility.
- Connecting is free; standard trading conditions and commissions apply.

## Caveats

- Demo only today, so no real order can be placed yet. Re-check when the live endpoint ships.
- No tool list, no launch date, no confirmation behaviour documented.
- Setup text lists ChatGPT Business while the FAQ says ChatGPT Desktop; treat client support as per client docs.

## Sources

Read directly on 2026-11-11: <https://ai.dukascopy.com/>
