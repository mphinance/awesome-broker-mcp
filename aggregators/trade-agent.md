---
name: Trade It (formerly Trade Agent)
region: US (broker coverage) + crypto
status: official
trading: true
server_type: remote
source_url: https://docs.tradeit.app/mcp
last_verified: 2026-07-16
confidence: high
---

# Trade It (formerly Trade Agent)

## Overview

Hosted, first-party, trading-capable multi-broker aggregator. One of only two in this
directory that can actually place trades across brokers — the other is
[ConnectTrade](connecttrade.md).

**The name is a rebrand, not a discrepancy.** Trade Agent → **Trade It**;
`thetradeagent.ai` → `tradeit.app`. Confirmed by a GitHub redirect: the old
`github.com/Trade-Agent/trade-agent-mcp` now resolves to
`github.com/trade-it-inc/trade-it-mcp` — the org renamed `Trade-Agent` → `trade-it-inc`
and the repo `trade-agent-mcp` → `trade-it-mcp`.

> An earlier version of this page flagged the domain mismatch as unresolved and warned
> "verify before connecting anything to this." That warning is withdrawn — the mismatch
> was just an old brand name. The `trade-it-inc` org is the company itself, so this is
> first-party regardless of how aggregator listings describe it.

## How to connect

Hosted endpoints:

- Streamable HTTP: `https://mcp.tradeit.app/mcp`
- SSE: `https://mcp.tradeit.app/sse`

Create an account at tradeit.app, start the Pro plan free trial, connect your brokerage,
then point your MCP client at one of the URLs above. Auth via browser-based OAuth.

## Trading scope

**Brokers:** Robinhood, Charles Schwab, E\*TRADE, Webull, Public, tastytrade.
**Crypto:** Coinbase, Kraken.

Stock/crypto buy/sell, limit/stop orders, options spreads, straddles, multi-leg
strategies.

## Safety / guardrails

**Draft-first, and the instruction to the model is explicit** — this is the strongest
claim on the page and it checks out verbatim against the repo README:

> *"Call `execute_trade` only when the user explicitly asks to execute, confirm, or
> place the trade. Do not call `execute_trade` automatically or immediately after
> creating a draft."*

So `create_trade` / `create_options_trade` build a draft; the agent must show the order
details and get explicit confirmation before `execute_trade`. Same shape as the official
[IBKR](../brokers/interactive-brokers.md) connector.

Trade It *"cannot withdraw funds, transfer assets, or take custody — it can only place
trades."* Ambiguous order parameters trigger a clarification request rather than a
best-guess fill.

Worth being precise about the limit: this is a **prompt-level** guardrail, not an
architectural one. It instructs the model not to auto-execute; it doesn't make execution
impossible the way IBKR's design does. Good practice, not a hard gate.

## Caveats

- Requires a Pro plan (free trial available) — not free-tier accessible.
- Repo is active (27 commits, not archived).
- Listings under the old "Trade Agent" name still circulate; they point at the same
  product.

## Sources

Checked directly on 2026-07-16:

- <https://docs.tradeit.app/mcp>
- <https://github.com/trade-it-inc/trade-it-mcp>
