---
name: Trade It (formerly Trade Agent)
region: US (broker coverage) + crypto
status: official
trading: true
server_type: remote
source_url: https://docs.tradeit.app/mcp
last_verified: 2026-11-11
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

The Installation page (read 2026-11-11) lists only this Streamable HTTP URL. The
`/sse` endpoint we previously listed is no longer documented there; treat it as
unverified. Setup is documented for ChatGPT (custom MCP server/plugin), Claude (custom
connector; free Claude plans allow one), Claude Code (`claude mcp add --transport http
tradeit https://mcp.tradeit.app/mcp`), Gemini CLI, Codex (via `mcp-remote`), and Muse.

Create an account at tradeit.app, connect your brokerage, then point your MCP client at
the URL. Auth is browser-based OAuth 2.0 by default; **API keys** (revocable) are an
alternative. Plan gating (see Caveats) was last stated as Pro with a free trial.

## Trading scope

**Brokers** (docs.tradeit.app/brokerages, 2026-11-11): Charles Schwab, E\*TRADE, Moomoo,
Public, Robinhood, tastytrade, TradeStation (plus TradeStation Paper), Webull.
**Crypto:** Coinbase, Kraken. (Moomoo and TradeStation are new relative to our earlier
list. Take-profit/stop-loss and fractional support vary per brokerage; OCO is listed
only for Robinhood.)

Stock/crypto buy/sell, limit/stop orders, options spreads, straddles, multi-leg
strategies. Nine MCP tools: `search_assets`, `get_accounts`, `get_holdings`,
`get_trades`, `create_trade`, `create_options_trade`, `create_trade_link`,
`execute_trade`, `cancel_trade`. `create_trade` accepts `take_profit` / `stop_loss`
(not supported by all brokerages). Trade Links are shareable drafts that another user
reviews and executes on their own brokerage.

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
- Repo `trade-it-inc/trade-it-mcp` is not archived, 62 stars; last push 2026-10-15
  (README and skill-docs updates: "Update to latest standards", "Add supported
  brokerages list"; no tagged releases).
- Holdings and trade data are cached daily; real-time `refresh: true` is for paid plans
  (and partner-linked users) with a 1 request per minute per-account limit.
- docs.tradeit.app now publishes `llms.txt` and `llms-full.txt` (both 200 on
  2026-11-11; the full file also documents the REST API and Discord bot). No separate
  openapi.json was checked.
- The docs page still says a trade "is never submitted without explicit confirmation"
  and `create_trade` docs say to obtain explicit approval before `execute_trade`;
  still prompt-level.
- Listings under the old "Trade Agent" name still circulate; they point at the same
  product.

## Other repos in the org

- `trade-it-inc/skills` (first-party, 0 stars, no license file, last push 2026-11-10): the "Trade It Developer" plugin for Codex and Claude Code, one skill (`trade-it-developer`) that helps a coding assistant build integrations (OAuth, brokerage connections, trading, webhooks, Trade Links, MCP) against current Trade It contracts. A shared Trade It marketplace lists it next to the MCP plugin. Not for end users trading their own accounts.
- `trade-it-inc/openclaw-skill` (first-party, MIT, 0 stars, last push 2026-03-24): an OpenClaw skill (`tradeit-api/SKILL.md`) plus a Python helper for the Trade It REST API; it says it prefers explicit confirmation before execution, and notes some accounts may allow immediate placement on create if the user enabled that setting. Not an MCP server.

Both READMEs read 2026-11-11.

## Sources

Checked directly on 2026-11-11 (repo, docs MCP overview, installation, brokerages, llms.txt):

- <https://docs.tradeit.app/mcp>
- <https://docs.tradeit.app/llms.txt>
- <https://github.com/trade-it-inc/trade-it-mcp>
