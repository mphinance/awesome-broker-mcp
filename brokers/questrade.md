---
name: Questrade
region: Canada
status: community
trading: false
server_type: local
source_url: https://github.com/zachmelin/QuestradeMCP
last_verified: 2026-07-16
confidence: high
---

# Questrade

## Overview

No official Questrade MCP server exists, but several independent community servers do,
and all of them are read-only. The most prominent is zachmelin/QuestradeMCP (published
to npm as questrade-mcp-server), exposing get_accounts, get_positions, get_balances,
get_orders, search_symbols, get_symbol, get_quotes, get_candles and refresh_token over
Questrade's OAuth2 REST API. Notably, Questrade's own REST API does support order
placement (POST /v1/accounts/:id/orders), so an execution-capable server is buildable
— but no shipping server enables it.

## How to connect

```bash
npx questrade-mcp-server (or npm install -g questrade-mcp-server)
```

## Trading scope

none — every verified server is read-only

## Caveats

- Unofficial. The zachmelin README carries an explicit disclaimer: not affiliated
  with, endorsed by, or supported by Questrade Inc.
- Read-only. Mathuran/questrade-mcp (Deno/TypeScript) contains place_order and
  cancel_order tools in the codebase but they are DISABLED — do not describe it as
  trading-capable.
- At least five community repos exist (zachmelin/QuestradeMCP, Mathuran/questrade-mcp,
  DrWheelicus/questrade-mcp-server, e88z4/questrade-mcp, harinivenkat02/QuestradeMCP),
  varying widely in maturity. Only the first two were inspected.
- Questrade refresh tokens are single-use; token persistence to
  ~/.questrade-mcp/tokens.json is a known operational friction point, and a token
  consumed by another process forces manual regeneration.
- questrade.com/api returned HTTP 403 to automated fetch, so the absence of an
  official Questrade MCP offering is inferred from search results plus the community
  repos' own 'unofficial' disclaimers, not from a directly fetched first-party page.
- Strong DIY-wrapper candidate: the official OAuth REST API covers order placement, so
  a first-party-grade execution server is achievable.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/zachmelin/QuestradeMCP>
- <https://github.com/mathuran/questrade-mcp>
- <https://www.pulsemcp.com/servers/gh-mathuran-questrade>
