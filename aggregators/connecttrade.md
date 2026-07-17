---
name: ConnectTrade
region: US
status: official
trading: true
server_type: remote
source_url: https://connecttrade.com/faq
last_verified: 2026-07-16
confidence: high
---

# ConnectTrade

## Overview

A trading-capable multi-broker aggregator that **now ships its own official MCP
server** — currently in early access.

From ConnectTrade's FAQ: *"The Connect Trade MCP server is currently available in early
access to qualified platforms,"* describing *"a server-side Model Context Protocol
integration that gives AI platforms and fintech applications direct, structured access
to the Connect Trade API."*

On trading specifically: *"AI agents connected through the Connect Trade MCP server can
retrieve account balances, positions, and transaction history, stream real-time market
data, and **place and cancel trades across more than 20 brokers**."*

The homepage corroborates and names ChatGPT, Claude, Gemini, Copilot and Cursor.

> ### We said this didn't exist. Here's why we were wrong.
>
> This page previously stated "there is no MCP server here" and "this is not currently
> connectable to Claude," sourced from `connecttrade.com/openapi.json`.
>
> Re-reading that spec: it **still** contains no mention of MCP. Our note was accurate
> *about that document* and wrong *about the product*. We keyed the entry on the wrong
> source — an API spec is not where a vendor announces a protocol integration.
>
> The lesson worth keeping: **a source that can't disprove a claim isn't evidence
> against it.** "Not in the OpenAPI spec" was never the same as "doesn't exist."

That makes ConnectTrade the rare thing in this directory: a hosted, trading-capable,
multi-broker MCP aggregator. [Trade Agent](trade-agent.md) is the only other one.

## How to connect

Early access, "available to qualified platforms" — this is not a paste-a-URL signup
today. You apply.

The underlying REST + WebSocket API remains available directly: `POST` against
`https://api.connecttrade.com` with `client-id`/`client-secret` (platform) plus
`user-id`/`user-secret` (per end-user). Streams at `wss://stream.connecttrade.com`
(account/broker data) and `wss://mdstream.connecttrade.com` (market data).

## Trading scope

Full order lifecycle across 20+ brokers: create, retrieve, cancel, replace. Single-leg
and multi-leg options orders. Plus reads for users, connections, accounts, balances,
positions, transactions, and order history.

Broker coverage per the OpenAPI examples: Alpaca, Lightspeed, TradeZero, Webull,
TradeStation. Note the FAQ claims "more than 20 brokers" — the spec's examples are not
an exhaustive list, and we have not seen the full one.

## Safety / guardrails

**Not documented in what's publicly fetchable**, and that gap matters here more than
most: this is a hosted server that can place and cancel trades across many brokers at
once. Whether there's a draft-first step, a confirmation requirement, or per-scope
permissions is unknown to us.

[Trade Agent](trade-agent.md), the comparable product, documents a draft-first model
explicitly. ConnectTrade doesn't, as far as we can see. Ask before you connect it.

## Caveats

- **Early access.** Availability, terms and behaviour may change; "qualified platforms"
  is undefined publicly.
- No pricing, auth-approval process, or confirmation of which of the 20+ brokers are
  fully live vs. in progress.
- Guardrails undocumented — see above.

## Sources

Checked directly on 2026-07-16:

- <https://connecttrade.com/faq>
- <https://connecttrade.com/>
- <https://connecttrade.com/openapi.json> (contains no MCP references — see Overview)
