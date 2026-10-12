---
name: Interactive Brokers
region: US / International
status: official
trading: draft-only
server_type: remote
source_url: https://claude.com/connectors/interactive-brokers
last_verified: 2026-10-12
confidence: high
---

# Interactive Brokers

## Overview

Official, first-party connector: claude.com lists it as "Anthropic verified", "Made by
Interactive Brokers", with the hosted connector URL `https://api.ibkr.com/v1/api/mcp`
(sign-in required). The listing is dated "Added May 2026"; launch was June 1, 2026 per
earlier checks and distributed through Claude's
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

The connector page (checked 2026-10-12) lists exactly **10 tools**:
`get_account_balances`, `get_account_positions`, `get_account_summary`,
`get_order_instructions`, `get_orders`, `get_portfolio_allocation`, `get_price_history`,
`get_price_snapshot`, `get_trades`, `search_contracts`. There is no order-submit,
modify or cancel tool in that list.

Read access, as the page words it: positions, balances, P&L, allocations, open orders,
real-time quotes and historical market data. (Earlier versions of this entry also listed
margin availability, option chains, risk exposures, linked accounts and a 30-day history
window; the connector page no longer says those, so treat them as unconfirmed.)

Trade **drafting** across global markets — e.g. "Buy 100 shares of AAPL at a limit of
$200."

Asset coverage expanded over time, so date matters (both bullets below come from IBKR's
June 22 press release; the connector page no longer states asset classes or order types,
and the press release page now returns 403, so this was not re-verified on 2026-10-12):

- **June 1, 2026 (launch)** — equities and ETFs only; market and limit orders only.
- **June 22, 2026** — options, futures, and futures options added.

## Safety / guardrails

**The server cannot put an order on the market. Full stop.** This is the strongest
guardrail of any trading-capable integration in this directory, and it's architectural
rather than configurational — there is no env var that turns it off.

claude.com states verbatim (re-checked 2026-10-12): *"Claude never submits orders directly to
the market."* The page says drafted trade instructions "are sent to your IBKR account for
your review and approval." The 10-tool list above is consistent with that, but the tool
list is Anthropic's directory listing, and Anthropic notes it cannot verify that
developers' tools will not change.

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
- The stocktitan press release now returns HTTP 403 to automated fetching, so the June 22
  quotes and asset-coverage dates above were verified earlier (2026-07-16) but not today.
- There is now an official IBKR Campus walkthrough and webinar for connecting Claude
  (page not fetchable — 403).

## Superseded: community MCP servers

Local-process alternatives that predate the official connector, listed for reference:

- [`ArjunDivecha/ibkr-mcp-server`](https://github.com/ArjunDivecha/ibkr-mcp-server) —
  local only (TWS/IB Gateway on `127.0.0.1:7497`). **11 tools**, of which exactly one
  places orders (`place_order`) — there is no modify or cancel tool. Safety defaults are
  real and good: `IBKR_IS_PAPER=true`, `ENABLE_LIVE_TRADING=false`, `MAX_ORDER_SIZE=1000`.
  **Archived by the owner Apr 11, 2026, no active development.** 35 stars, 7 commits,
  last push 2025-07-23 (archived flag re-confirmed 2026-10-12).
  <br>*(An earlier version of this page said "21 tools incl. place/modify/cancel." That
  was wrong — the README's tool table lists 11, and only `place_order` writes.)*
- [`code-rabi/interactive-brokers-mcp`](https://github.com/code-rabi/interactive-brokers-mcp)
  — OAuth or headless credential auth, full order management. Not independently verified.
- [`rcontesti/IB_MCP`](https://github.com/rcontesti/IB_MCP) — FastMCP wrapper over IBKR's
  Web API, containerized. Not independently verified.
- A TWS-API-based server (e.g. `haymant/tws-mcp`) — requires TWS/IB Gateway running
  locally. Not independently verified.

## Sources

Checked directly on 2026-10-12:

- <https://claude.com/connectors/interactive-brokers> (tool list, connector URL, guardrail wording)
- `gh api repos/ArjunDivecha/ibkr-mcp-server` (archived, last push, stars)
- `POST https://api.ibkr.com/v1/api/mcp` unauthenticated returns 401 (endpoint is live and auth-gated)

Checked directly on 2026-07-16:

- <https://claude.com/connectors/interactive-brokers>
- <https://www.stocktitan.net/news/IBKR/interactive-brokers-expands-ai-integration-capabilities-adding-chat-hdk4u88x136r.html>
- <https://github.com/ArjunDivecha/ibkr-mcp-server>
- <https://raw.githubusercontent.com/ArjunDivecha/ibkr-mcp-server/main/README.md>
