---
name: TradeZero
region: US
status: official
trading: true
server_type: remote
source_url: https://developer.tradezero.com/docs/documentation/mcp
last_verified: 2026-11-11
confidence: medium
---

# TradeZero

## Overview

TradeZero launched an **official hosted MCP server on 2026-08-08** (per its developer
changelog). It sits on the same host as the TradeZero Trading API and signs you in with
OAuth 2.0 using your TradeZero login. It can place real orders. Earlier versions of this
entry said no MCP exists; that is wrong as of 2026-08-08.

> **Correction history.** The 2026-07-16 and 2026-10-09 versions said "no MCP server exists"
> and routed readers to ConnectTrade. TradeZero's own docs now list a first-party MCP
> (listed in its llms.txt as `MCP server: https://webapi.tradezero.com/mcp`). Nothing was
> tested with credentials; this is read from TradeZero's docs.

## How to connect

Endpoint: `https://webapi.tradezero.com/mcp` (remote, Streamable HTTP).

```bash
claude mcp add --scope user --transport http tradezero https://webapi.tradezero.com/mcp
```

Then run `/mcp`, select tradezero and complete OAuth. The docs say not to put API keys in
the client; for Claude web and Grok connectors, leave the OAuth client ID and secret empty.
OAuth scopes are not listed. The guide also covers Claude, ChatGPT, Perplexity, Grok,
Cursor and VS Code. ChatGPT Free, Plus and Pro are not supported (Business, Enterprise or
Edu with Developer mode, web only). TradeZero Canada accounts were added on 2026-09-29.

## Trading scope

Per the MCP guide: 21 tools, 14 read and 7 write.

- Read: `list_accounts`, `get_account`, `get_account_pnl`, `get_positions`,
  `get_closed_positions`, `get_routes`, `get_todays_orders`, `get_order`,
  `get_historical_orders`, `get_historical_orders_paginated`, `is_easy_to_borrow`,
  `get_locate_inventory`, `get_locate_history`, `get_cash_transactions`.
- Write: `create_order`, `cancel_order`, `cancel_all_orders`, `locate_quote`,
  `accept_locate`, `cancel_locate`, `sell_locate`.

Equity, option and multi-leg (`Mleg`) orders; Market, Limit, Stop and StopLimit. Short
locates need a live account. **No market data**: the server returns no quotes, chains or
charts, so you supply limit prices.

## Safety / guardrails

- The guide tells users to keep write-approval prompts on in the client. We found no
  server-side confirmation step like a preview token; treat the control as client-side.
- Paper vs live is decided by which TradeZero login you authorize. The guide says to read
  `accountType` (Paper or Live) before any write, and to call `get_routes` before live
  placement.
- Live orders are real and carry the same fees and risk as the TradeZero platforms;
  `accept_locate` incurs a fee. The guide calls six of the seven writes destructive.
- Order submit is not final: `200 OK` can carry `orderStatus: "Rejected"`, so poll
  `get_order` for a terminal state.

## Caveats

- Read from docs only; we did not authenticate or call a tool.
- No stated OAuth scopes, so you cannot narrow the grant below full account access from
  what we read.
- TradeZero, Inc. does not accept customers from the US, Canada or Bahamas; the guide points
  those users to TradeZero America or TradeZero Canada.
- The Trading API FAQ says the program is for self-directed traders on their own account and
  warns against relying on fully unattended systems.
- Still reachable via the [ConnectTrade aggregator](../aggregators/connecttrade.md) (equities,
  options, paper per its matrix) if you are a fintech platform; that route needs ConnectTrade
  platform credentials and is not the individual route.
- shner-elmo/tradezero-api is a community Python package that automates the TradeZero web
  platform; it is not an MCP server.

## Sources

Checked directly on 2026-11-11:

- <https://developer.tradezero.com/docs/documentation/mcp> (tool list, setup, guardrails)
- <https://developer.tradezero.com/docs/changelog> (MCP launch 2026-08-08)
- <https://developer.tradezero.com/llms.txt> (MCP server line)
- <https://developer.tradezero.com/docs/documentation>
- <https://connecttrade.com/llms-full.txt> (capability matrix)
