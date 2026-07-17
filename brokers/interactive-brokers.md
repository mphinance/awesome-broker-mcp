---
name: Interactive Brokers
region: US / International
status: official
trading: draft-only
server_type: remote
source_url: https://claude.com/connectors/interactive-brokers
last_verified: 2026-07-16
confidence: high
---

# Interactive Brokers

## Overview

Official, first-party connector — claude.com states plainly that *"Interactive Brokers
built this connector."* Launched June 1, 2026 and distributed through Claude's
certified connector marketplace. It supersedes the community GitHub servers
(`ArjunDivecha/ibkr-mcp-server` etc.), which are local/TWS-based and unrelated.

**No longer Claude-exclusive.** As of June 22, 2026, IBKR added ChatGPT and Grok
alongside Claude. If you read that this is an Anthropic partnership exclusive, that was
true at launch and isn't now.

> This entry is `trading: draft-only`, not `true`. That distinction is the whole point
> of the IBKR integration and we originally got it wrong — see Safety below.

## How to connect

Claude → Settings → Connectors → find **Interactive Brokers (IBKR)** → Connect →
authenticate with your standard IBKR login. Shows as a "Web" (hosted) connector, not
"Custom" — no local process, no TWS/Gateway needed.

No API keys or passwords are shared with or held by the AI provider. No separate
AI/agentic brokerage account required — it connects to your existing IBKR account.

## Trading scope

Read access: positions, cash balances, margin availability, realized/unrealized P&L,
historical transactions, option chains, risk exposures, multi-currency balances,
linked accounts, portfolio structure. Real-time price snapshots + 30-day historical
data.

Trade **drafting** across global markets — e.g. "Buy 100 shares of AAPL at a limit of
$200."

Asset coverage expanded over time, so date matters:

- **June 1, 2026 (launch)** — equities and ETFs only; market and limit orders only.
- **June 22, 2026** — options, futures, and futures options added.

## Safety / guardrails

**The server cannot put an order on the market. Full stop.** This is the strongest
guardrail of any trading-capable integration in this directory, and it's architectural
rather than configurational — there is no env var that turns it off.

claude.com states verbatim: *"Claude never submits orders directly to the market."*

Drafted instructions land in a dedicated **"AI Instructions" tab** on IBKR's Orders and
Trades page. You convert each one into a live order yourself, in IBKR's own UI. Per
IBKR's June 22 press release: *"Every instruction is reviewed and approved by the
client in a dedicated AI Instructions tab before any order is submitted to the
market."*

If you want an agent near your brokerage account but not able to spend your money, this
is the shape to copy.

## Caveats

- Distinct from the older community servers below — if you connected before June 2026,
  confirm which one you're actually on.
- **Sourcing note:** `interactivebrokers.com` returns HTTP 403 to automated fetching, so
  IBKR-hosted pages can't be cited directly here. The "never become orders
  automatically" claim is corroborated via the June 22 press release and claude.com's
  own connector page rather than quoted from an IBKR page we could fetch.
- There is now an official IBKR Campus walkthrough and webinar for connecting Claude
  (page not fetchable — 403).

## Superseded: community MCP servers

Local-process alternatives that predate the official connector, listed for reference:

- [`ArjunDivecha/ibkr-mcp-server`](https://github.com/ArjunDivecha/ibkr-mcp-server) —
  local only (TWS/IB Gateway on `127.0.0.1:7497`). **11 tools**, of which exactly one
  places orders (`place_order`) — there is no modify or cancel tool. Safety defaults are
  real and good: `IBKR_IS_PAPER=true`, `ENABLE_LIVE_TRADING=false`, `MAX_ORDER_SIZE=1000`.
  **Archived by the owner Apr 11, 2026 — no active development.** 34 stars, 7 commits,
  last push 2025-07-23.
  <br>*(An earlier version of this page said "21 tools incl. place/modify/cancel." That
  was wrong — the README's tool table lists 11, and only `place_order` writes.)*
- [`code-rabi/interactive-brokers-mcp`](https://github.com/code-rabi/interactive-brokers-mcp)
  — OAuth or headless credential auth, full order management. Not independently verified.
- [`rcontesti/IB_MCP`](https://github.com/rcontesti/IB_MCP) — FastMCP wrapper over IBKR's
  Web API, containerized. Not independently verified.
- A TWS-API-based server (e.g. `haymant/tws-mcp`) — requires TWS/IB Gateway running
  locally. Not independently verified.

## Sources

Checked directly on 2026-07-16:

- <https://claude.com/connectors/interactive-brokers>
- <https://www.stocktitan.net/news/IBKR/interactive-brokers-expands-ai-integration-capabilities-adding-chat-hdk4u88x136r.html>
- <https://github.com/ArjunDivecha/ibkr-mcp-server>
- <https://raw.githubusercontent.com/ArjunDivecha/ibkr-mcp-server/main/README.md>
