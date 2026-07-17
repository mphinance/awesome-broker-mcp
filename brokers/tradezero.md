---
name: TradeZero
region: US
status: none
trading: false
server_type: n/a
source_url: https://developer.tradezero.com/docs/documentation
last_verified: 2026-07-16
confidence: high
---

# TradeZero

## Overview

No MCP server exists for TradeZero, official or community — a GitHub search for
'tradezero mcp' returns 0 results, and TradeZero's own developer documentation makes
no mention of MCP, AI agents or Claude. Notably, TradeZero recently launched an
official Developer API (REST + WebSocket at https://webapi.tradezero.com) covering
equities, multi-leg options, short locates, account data and real-time streams,
generated from an OpenAPI definition. That makes it arguably the strongest DIY-wrapper
candidate in this cluster, but no such wrapper exists today.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- GitHub search for 'tradezero mcp' returned an explicit 0 results.
- REST/WebSocket API only — an API is not an MCP server. Status is 'none' by the
  directory's own rule.
- DIY-wrapper candidate (strong): the official API has an OpenAPI definition, supports
  market/limit/stop equity orders, single- and multi-leg options, and short locate
  quote/accept — a documented modern surface an MCP wrapper could sit on.
- shner-elmo/tradezero-api exists as a community Python package, but it automates the
  TradeZero *web platform* and is not an MCP server; it also appears to predate the
  official API.
- Region nuance not fully resolved: TradeZero America serves US customers while
  TradeZero International is Bahamas-based. Listed as US for the retail-broker
  context.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/search?q=tradezero+mcp&type=repositories>
- <https://developer.tradezero.com/docs/documentation>
