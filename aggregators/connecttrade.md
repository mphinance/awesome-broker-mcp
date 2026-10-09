---
name: ConnectTrade
region: US
status: official
trading: true
server_type: remote
source_url: https://connecttrade.com/docs/mcp
last_verified: 2026-10-09
confidence: high
---

# ConnectTrade

## Overview

A hosted, trading-capable, multi-broker aggregator with its own **official MCP server, now
documented for production use**. ConnectTrade is a B2B product: fintech platforms get one
integration across 21 brokers, and AI agents reach those brokers through the MCP server.

From ConnectTrade's own llms.txt: *"The MCP server is available for production use.
Customers with Connect Trade platform credentials and a connected user can get started."*
It works with Claude Code, Cursor, Windsurf, VS Code (Copilot agent mode) and Codex CLI
per their integration guide.

That makes it one of two hosted, trading-capable, multi-broker MCP aggregators in this
directory. The other is [Trade It](trade-agent.md).

> **Correction history.** An earlier version said "there is no MCP server here", keyed on
> `connecttrade.com/openapi.json`, which has no MCP mention. Then a version said "early
> access, guardrails undocumented", which was true of the FAQ at the time. Both are
> superseded: on 2026-10-09 the MCP is described as production-ready, with a public
> integration guide and a documented confirmation flow. A source that cannot disprove a
> claim is not evidence against it, and a vendor's docs move.

## How to connect

Endpoint: `https://mcp.connecttrade.com/mcp` (Streamable HTTP). A POST `initialize`
returns 401 without a token, so it is live and behind auth.

You need **platform credentials** (`client_id` + `client_secret`, issued by ConnectTrade;
the docs point to their contact page) and a provisioned, broker-connected user (`user_id` + `user_secret`).
This is not a consumer signup. Then:

1. Mint a short-lived JWT (1 hour) from `POST https://api.connecttrade.com/auth/tokens/user`
   with `{"scopes": ["read"]}` for read-only or `{"scopes": ["read", "trade"]}` to trade.
2. Register the server with that token as a Bearer header, e.g. Claude Code:

```bash
claude mcp add --transport http connecttrade https://mcp.connecttrade.com/mcp \
  --header "Authorization: Bearer YOUR_JWT_HERE"
```

When the JWT expires MCP calls return 401 and you re-mint. A sample client
(`ct-sample-mcp-client`, FastAPI + Claude API tool calling) is referenced in the guide.

The REST + WebSocket API is also available directly: `https://api.connecttrade.com`,
streams at `wss://stream.connecttrade.com` (account data) and
`wss://mdstream.connecttrade.com` (market data).

## Trading scope

ConnectTrade's own capability matrix (read 2026-10-09) lists **21 brokers**, of which **11
support equities trading** and options: Alpaca, Interactive Brokers, Lightspeed, moomoo,
Public, Sterling Trading Technologies, tastytrade, TradeStation, Tradier, TradeZero and
Webull. Futures: Interactive Brokers, tastytrade, TradeStation, Tradier, Webull. Crypto:
Alpaca, Public, tastytrade, Webull. Paper trading: Alpaca, TradeStation, Tradier, TradeZero.

The other 10 are **read-only connections** (accounts, positions, transactions): Charles
Schwab, Fidelity, and eight banks (Bank of America, Capital One, Chase, Citi, PNC, TD Bank,
U.S. Bank, Wells Fargo). Their llms.txt describes the API as covering equities, single-leg
and multi-leg options, and futures, with order place, replace and cancel.

## Safety / guardrails

Documented in the integration guide:

- **Mandatory two-step confirmation.** `create_order()` returns a `confirmation_id` and a
  human-readable summary; the order is only submitted when `confirm_trade(confirmation_id)`
  is called. Pending orders **expire after 2 minutes**. The guide says "there is no way to
  bypass this."
- **Scopes enforced per tool.** A token without the `trade` scope cannot trade, and trading
  also needs a broker connection created with trading enabled.
- **Rate limits:** 60 requests/min per user across all tools, 30/min on trade tools.
- Broker-side errors (buying power, market closed, bad symbol) pass through.

## Caveats

- **The confirmation is a second tool call.** The guide describes "User confirms → LLM
  calls `confirm_trade`". It does not say how the server verifies a human made that
  decision, so the control is as strong as your client's human-in-the-loop. The guide itself
  tells integrators to build "a confirmation flow for trades".
- B2B only: needs platform credentials from ConnectTrade and an already-connected user.
  Pricing is a separate page and was not read.
- Tool names beyond `create_order` and `confirm_trade` were not listed in the pages read, and
  the server was not exercised with credentials.
- The broker matrix is ConnectTrade's own claim; individual broker capabilities were not
  tested. Their llms.txt says new brokers are added monthly, so expect drift.
- `connecttrade.com/openapi.json` still has no MCP mention. The MCP guide is at
  `/docs/mcp`, which is where to look, not the spec.

## Sources

Checked directly on 2026-10-09:

- <https://connecttrade.com/docs/mcp> (integration guide)
- <https://connecttrade.com/llms.txt>
- <https://connecttrade.com/llms-full.txt> (broker capability matrix, FAQ)
- <https://mcp.connecttrade.com/mcp> (endpoint, 401 without token)

Checked directly on 2026-07-16:

- <https://connecttrade.com/faq>
- <https://connecttrade.com/openapi.json> (no MCP references)
