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
> tested with credentials; this is read from TradeZero's docs. An unauthenticated
> `initialize` POST to the endpoint returns 401 with OAuth protected-resource metadata
> (probed 2026-11-11).

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
- Order submit is not final: the guide says to poll `get_order` until a terminal status
  (including `Rejected`) and not to cancel a Rejected order. (An earlier claim that a `200 OK`
  can carry `orderStatus: "Rejected"` is not on the MCP guide; unverified.)

## Caveats

- Read from docs only; we did not authenticate or call a tool.
- No stated OAuth scopes, so you cannot narrow the grant below full account access from
  what we read.
- TradeZero, Inc. does not accept customers from the US, Canada or Bahamas; the guide points
  those users to TradeZero America or TradeZero Canada.
- The docs legal disclaimer says TradeZero provides API tools for self-directed trading and
  that clients "should not rely exclusively on unattended systems".
- Still reachable via the [ConnectTrade aggregator](../aggregators/connecttrade.md) (equities,
  options, paper per its matrix) if you are a fintech platform; that route needs ConnectTrade
  platform credentials and is not the individual route.
- shner-elmo/tradezero-api is a community Python package that automates the TradeZero web
  platform; it is not an MCP server.

## Other repos (not endorsed by TradeZero)

- **[abigaillhiggins/tradezero-mcp](https://github.com/abigaillhiggins/tradezero-mcp)** (community, local Python 3.11+ stdio server; 0 stars, last push 2026-08-12, MIT, not archived; README read 2026-11-11, source not read). A **read-only trading-journal** server, not an order route. It syncs fills and the cash ledger into a local SQLite journal and serves nine tools: `sync_now`, account snapshot, open positions, fills, FIFO round trips, stats, cost reconciliation, and local diary notes. Its README says the HTTP client implements only GET against a whitelist of read paths, so order placement has no transport in the process, and that TradeZero API keys are unscoped (no read-only keys, per its 2026-08-10 check), which is the reason it enforces read-only itself. That unscoped-key claim is worth knowing even if you use TradeZero's official server instead. **Caution:** it still holds a full-power TradeZero API key and secret in a local `.env`, and it is a zero-star, single-author repo.

## Sources

Checked directly on 2026-11-11:

- <https://developer.tradezero.com/docs/documentation/mcp> (tool list, setup, guardrails)
- <https://developer.tradezero.com/docs/changelog> (MCP launch 2026-08-08)
- <https://developer.tradezero.com/llms.txt> (MCP server line)
- <https://developer.tradezero.com/docs/documentation> (legal disclaimer)
- <https://connecttrade.com/llms-full.txt> (capability matrix)
