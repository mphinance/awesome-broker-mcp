---
name: SnapTrade
region: US (broker coverage varies)
status: official
trading: true
server_type: remote
source_url: https://docs.snaptrade.com/docs/mcp-server
last_verified: 2026-11-11
---

# SnapTrade

## Overview

Hosted, official MCP servers aggregating multiple brokers. As of 2026-11-11 the docs
describe two servers: a read-only **portfolio** server and a **trading** server that adds
order preview, placement and cancellation. Neither can move money or change account
settings. (An earlier version of this page said the server was read-only; the docs now
document a trading server.) For SnapTrade Personal users only, not developer or partner
API keys; a free Personal account with at least one linked brokerage is required.

## How to connect

Hosted endpoints:

- Portfolio (read-only): `https://agent.snaptrade.com/mcp/portfolio`
- Trading: `https://agent.snaptrade.com/mcp/trading`
- `https://mcp.snaptrade.com/mcp` remains an alias of the portfolio server for existing connectors.

**Claude**: Settings → Connectors → Add custom connector → paste the URL.
**ChatGPT**: chatgpt.com/plugins → + → Add custom MCP server, set authentication to OAuth.

**Auth**: OAuth 2.0 authorization-code + PKCE, with Dynamic Client Registration
(RFC 7591) and token introspection (RFC 7662). Tokens are scoped `read` on the portfolio server; the trading server adds `trade` when you approve trading. Your SnapTrade `userId`/`userSecret`
and brokerage credentials are never exposed to the AI assistant — SnapTrade resolves
identity from the token, not the credentials.

Broker coverage: the MCP docs page does not enumerate brokers (it mentions Alpaca as an
example and tastytrade for futures). Use the `list_supported_brokerages` tool or
SnapTrade's Brokerage Integrations page. The earlier list (Robinhood, Schwab, Fidelity,
Vanguard, E\*TRADE, Alpaca, Tradier, Trading 212) does not trace to the cited page and is
unverified.

## Trading scope

Portfolio server: none (19 tools, read-only; `request_connection_link` only generates a
single-use link that expires after 5 minutes). Trading server (21 tools) adds
`Trading_previewSimpleOrder`, `Trading_placeSimpleOrder` and `Trading_cancelOrder`.
Stocks and ETFs (including fractional where the brokerage allows), single-leg and
multi-leg options, and futures and futures options on tastytrade. Crypto orders are not
available. All subject to what each brokerage and account allows.

## Safety / guardrails

- Placement requires a `preview_token` (valid 5 minutes) from a matching preview, so an
  order cannot be placed without a preview.
- Tools are annotated read vs write; `Trading_placeSimpleOrder` and `Trading_cancelOrder`
  are `destructiveHint: true`.
- Assistant instructions tell it to show the preview and wait for your confirmation, but
  the docs note this depends on the client following them; the token does not prove you
  confirmed.
- Short-lived tokens, revocable anytime under Settings → Connected apps in the SnapTrade
  dashboard (this does not disconnect brokerage connections).

## Caveats

- Trading access is not yet available for every account; if it is not enabled, consent is
  read-only and trading tools are unavailable. It also needs a brokerage connection with
  trade access.
- Previews estimate cost for single-equity orders only; other orders get a "no quote"
  warning. A placed order is submitted to the brokerage, not necessarily filled.
- Pricing is not covered on the MCP page (free Personal tier only is stated). Both endpoints return 401 with OAuth metadata to an unauthenticated POST (probed 2026-11-11; scope `read` on portfolio, `read trade` on trading).
- Community alternative for the underlying API:
  [`dangelov/mcp-snaptrade`](https://github.com/dangelov/mcp-snaptrade) — not
  independently verified, listed for reference only (not re-checked 2026-11-11).
