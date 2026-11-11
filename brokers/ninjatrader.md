---
name: NinjaTrader
region: US
status: official + community
trading: true
server_type: remote (official, hosted by NinjaTrader), plus local community servers and a third-party hosted option (CrossTrade)
source_url: https://docs.ninjatrader.com/mcp
last_verified: 2026-11-11
confidence: high
---

# NinjaTrader

## Overview

**NinjaTrader now has an official, first-party hosted MCP server**, documented at
[docs.ninjatrader.com/mcp](https://docs.ninjatrader.com/mcp). It is remote (Streamable
HTTP, OAuth 2.1, nothing to install), separate Demo and Live endpoints, and available only
to Tradovate and NinjaTrader users. The docs list 29 tools covering portfolio, quotes and
history, `estimate_order`, `place_order`, `modify_order`, `cancel_order`, `close_position`,
risk settings and alerts, and say it trades futures and event contracts. (The older
forum request thread had no staff reply; it is superseded.) Beyond that there is a
large community ecosystem of ~10 MCP repos on GitHub, the most-starred being
ozmnf4/ninjatrader-mcp (36 stars at 2026-11-11, JavaScript, single commit 2026-04-05),
and CrossTrade (an independent vendor, not affiliated with NinjaTrader Group) runs a
hosted MCP server at https://app.crosstrade.io/v1/api/mcp with OAuth 2.1 scopes.

Official companion repo (found 2026-11-11, README read):
[`NT-NinjaTrader/mcp-skills`](https://github.com/NT-NinjaTrader/mcp-skills), 13 Agent Skills
(pretrade-risk, position-watchdog, scale-manager, market-context, contract-intel,
correlation-hedge, event-watch, alerts-composer, risk-coach, trade-journal, trade-replay,
trade-debrief, chart-render) that drive the official MCP server. Apache-2.0, 9 stars, last
push 2026-11-06, not archived, no deprecation notice. The README says the skills propose
orders and never submit them, and you approve every payload; the plugin bundles the Demo and
Live server connections. Install: `/plugin marketplace add NT-NinjaTrader/mcp-skills` or
`npx skills add NT-NinjaTrader/mcp-skills` (skills only, register the server separately).
The same org's `nt-trade-sdk` (TypeScript SDK, 2 stars) is a pure SDK, not listed here.

## How to connect

```bash
Official (Demo first): claude mcp add ninjatrader-demo --transport http https://mcp-demo.tradovateapi.com/mcp   # Live: https://mcp-live.tradovateapi.com/mcp, name ninjatrader-live. Authorize in a desktop browser.
Community: git clone https://github.com/ozmnf4/ninjatrader-mcp && npm install, configure .env, add to Claude Code MCP config (local mode talks to NT8 desktop on port 7890; cloud mode uses the NinjaTrader Ecosystem API). Hosted: add https://app.crosstrade.io/v1/api/mcp as a remote MCP server and complete OAuth.
```

## Trading scope

Futures and other instruments tradable through a connected NinjaTrader 8 desktop
installation (CME complex: ES, NQ, MES, MNQ, CL, GC, etc.). Order placement,
modification and cancellation are supported by several servers.

## Safety / guardrails (official server)

Each tool needs a specific account permission, enforced server-side (for example
Orders: Full Access for `place_order`). Six of the seven write tools carry the MCP
`destructiveHint` so most clients pause for approval; `create_alert` does not. Whether
approval is required depends on your client settings. Demo and Live are separate
endpoints with separate accounts. The docs say the agent cannot move funds. The server
exposes `update_risk_settings` (daily loss auto-liquidation, position limits), so an agent
with Risks: Full Access can change your risk limits. Trading is not read-only by default:
read-only use depends on the permissions you approve on the consent screen.

## Caveats

- The official server's own docs were read on 2026-11-11; we did not connect to it or
  place orders. CrossTrade's comparison page (vendor-written) describes it as beta and
  pre-release; the docs pages we read did not say so, so treat maturity as unconfirmed.
- The official `NT-NinjaTrader/mcp-skills` plugin **ships a Live (real money) MCP server**
  (`mcp-live.tradovateapi.com/mcp`) alongside Demo in `mcp.json` and the Claude plugin manifest,
  while its `AGENTS.md` says "This beta bundles the Demo (simulation) server only" (docs/skills/ninjatrader.md).
  Treat installing the plugin as adding a live-money endpoint. The "propose, never submit" rule
  is model-enforced skill text; beyond the account's server-side risk settings it is the main
  barrier on Live.
- ozmnf4/ninjatrader-mcp shows only 1 commit on main despite 28 stars — treat maturity
  with caution.
- Community servers bridge to the NT8 desktop app via a local add-on/port, not to a
  broker API directly. NinjaTrader must be running.
- CrossTrade is a paid third party: MCP is gated to the Elite tier ($99/month per its llms.txt; REST/WebSocket
  remain on Pro) and requires the CrossTrade Add-On v1.13.0+. It enforces OAuth scope
  at the transport — an mcp:read token cannot place an order, mcp:trade can.
- EXCLUDED AS UNVERIFIABLE: a 'schroeder247' Rust server claiming 88 tools is listed
  on LobeHub and echoed by search summaries, but the GitHub URL 404s and it does not
  appear in GitHub's repository index. Do not list it.
- Other confirmed-in-index but unfetched repos vary in quality and stars:
  Wendigooor/nt-mcp-server (C#), felipekuhn87/ninjatrader-claude-mcp-byFelipeKuhn
  (C#), WelokkDev/ninjatrader-mcp (TS), Travis-Clement-Dev/claude-ninjatrader-mcp
  (read-only order-flow bridge).

## Sources

Checked directly on 2026-07-16, official docs and CrossTrade llms.txt re-read 2026-11-11:

- <https://docs.ninjatrader.com/mcp> (plus /mcp/connect, /mcp/authentication, /mcp/tools, /mcp/safety)
- <https://crosstrade.io/llms.txt>
- <https://github.com/NT-NinjaTrader/mcp-skills> (README, LICENSE, org repo list, 2026-11-11)
- <https://github.com/ozmnf4/ninjatrader-mcp>
- <https://github.com/search?q=ninjatrader+mcp&type=repositories>
- <https://crosstrade.io/mcp-trading/ninjatrader-mcp-setup>
- <https://discourse.ninjatrader.com/t/model-context-protocol-mcp/4159>
