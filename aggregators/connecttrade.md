---
name: ConnectTrade
region: US
status: none
trading: true
server_type: n/a
source_url: https://connecttrade.com/openapi.json
last_verified: 2026-07-16
---

# ConnectTrade

## Overview

A multi-broker aggregator API — covers Alpaca, Lightspeed, TradeZero, Webull, and
TradeStation (per the OpenAPI examples). Trading-capable, not read-only, which is
what makes it different from SnapTrade. **But there is no MCP server here** — it's a
plain REST + WebSocket API. Confirmed by reading the OpenAPI spec directly: no MCP
wrapper is mentioned anywhere in it.

## How to connect

There's nothing to connect *to Claude* today. `POST` against
`https://api.connecttrade.com` directly with `client-id`/`client-secret` (platform)
plus `user-id`/`user-secret` (per end-user). Real-time streams at
`wss://stream.connecttrade.com` (account/broker data) and
`wss://mdstream.connecttrade.com` (market data).

To use this with Claude, someone would need to build an MCP wrapper on top — the same
pattern as [`dangelov/mcp-snaptrade`](https://github.com/dangelov/mcp-snaptrade) does
for SnapTrade's REST API.

## Trading scope

Full order lifecycle: create, retrieve, cancel, replace. Single-leg and multi-leg
options orders. Plus read endpoints for users, connections, accounts, balances,
positions, transactions, and order history.

## Safety / guardrails

N/A — no MCP layer means no Claude-facing approval step exists to describe. Whatever
guardrails exist would live in the wrapper someone builds, not in ConnectTrade itself.

## Caveats

- **This is not currently connectable to Claude.** Listed here because it's a
  trading-capable multi-broker aggregator (rarer than the read-only ones), and a
  natural DIY-wrapper candidate if you want broader-than-SnapTrade coverage with
  actual order placement.
- Everything above comes from reading `openapi.json` directly, not a marketing page —
  high confidence on the endpoint shape, but no info on pricing, auth approval process,
  or which of the listed brokers are fully live vs in progress.
