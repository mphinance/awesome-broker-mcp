---
name: eToro
region: International (not available to US retail)
status: official + community
trading: true
server_type: remote (official, hosted) / local (community)
source_url: https://builders.etoro.com/tools/mcp
last_verified: 2026-10-12
confidence: medium
---

# eToro

## Overview

eToro has an **official, hosted MCP server that can now trade**, plus a separate
agent-portfolio product that is REST. Our July 2026 version of this page said the official
server was docs-only with two tools and could not place a trade. **That is no longer true.**

> ### Correction history
>
> - Earlier still, this entry asserted an eToro-run trading MCP that did not exist, and
>   mistook Agent Portfolios (an OpenAPI 3.0.1 REST product over `public-api.etoro.com`)
>   for MCP. That part stands: Agent Portfolios is REST.
> - In July we then found the official MCP server and described it as docs-only
>   (`get-all-routes` and `get-route-spec`). On 2026-10-12 the server's own skill file
>   (`https://mcp.public-api.etoro.com/skill`, version 1.21.1) documents **seventeen tools**,
>   including real-account order placement. The builders.etoro.com MCP page still says
>   "two tools", so eToro's own pages disagree with each other. We trust the server's
>   skill file for the tool list, but see the caveats: we could not authenticate to
>   confirm it with a live `tools/list`.

## The official MCP server (hosted, can trade)

[builders.etoro.com/tools/mcp](https://builders.etoro.com/tools/mcp) points to a hosted
streamable HTTP server at `https://mcp.public-api.etoro.com`. Per the server's skill file
it refreshes eToro's OpenAPI document every few minutes and exposes:

- **Discovery:** `get-tags`, `get-all-routes`, `get-route-spec`.
- **Generic execution:** `execute-read` (GET routes and a small set of read-semantics POSTs)
  and `execute-write` (POST/PUT/PATCH/DELETE on any route in the catalog).
- **Account reads:** `get-my-profile-and-scopes`, `get-my-portfolio-summary`,
  `get-my-balances`, `get-my-watchlists`, `get-my-positions-and-orders`,
  `get-my-trading-history`, `get-instruments-overview`, `get-trader-profile-summary`
  (public popular-investor stats).
- **Trading pairs:** `prepare-trade` then `place-trade` to open a position, and
  `prepare-close` then `place-close` to close one.

**Auth.** Either an API key pair on the connection headers (`x-user-key`, the user's
personal key, which is secret, plus `x-api-key`, an application identifier) or an OAuth
Bearer token set by the client; the two must not be mixed. Credentials ride on the
connection, not in tool arguments. An unauthenticated `initialize` call to the endpoint
returned `401` with a protected-resource metadata pointer (authorization server
`www.etoro.com`), so expect to authenticate before connecting.

## Agent Portfolios (REST, not MCP)

A dedicated agent portfolio you create through the API and connect to your own agent with
scoped user tokens. $200 minimum per eToro's page. The v2 API (`POST /api/v2/agent-portfolios`,
scopes by name) documents `investmentAmountInUsd` as the amount deducted from **your**
account balance to copy-trade the agent portfolio, with positions mirrored proportionally
to the portfolio's own virtual balance. So it is a copy-trading construct, not a
standalone funded account. It is not an MCP integration. Its routes live in the same
OpenAPI document the MCP server reads, so the generic `execute-*` tools may reach them;
we did not verify that.

## The community server (local, trades)

[`gabrielcerutti/etoro-mcp-server`](https://github.com/gabrielcerutti/etoro-mcp-server)
— 35 tools against your own account, positions and orders. Local, via `npx`. Third-party
and not endorsed by eToro. `ETORO_TRADING_MODE` defaults to `demo`; set `real` for live.
Its own docs call real-money AI trading "risky". Latest release v1.1.4, last push
2026-04-29, so it has been quiet for months. With an official trading MCP now available,
there is less reason to run this one.

## Trading scope

- **Official MCP server:** open and close positions on a real or demo account (market,
  `mit`, and `limitIOC` order types, leverage, stop loss, take profit per the skill file),
  plus read tools. `execute-write` reaches other write routes in the catalog; the skill
  file lists transfers and withdrawals as money-moving routes it must gate, so assume they
  are reachable if your credentials carry the scope.
- **Agent Portfolios:** real trading, via REST.
- **Community server:** positions and orders on your own account.

## Safety / guardrails

- **Server-enforced for opens and closes.** `prepare-trade` and `prepare-close` validate
  against live data (eligibility, quote, costs, balance) and return a signed token valid
  for about two minutes, bound to your connection credentials; `place-trade` and
  `place-close` accept only that token. Opens and closes cannot be placed without the
  prepare step, and tokens are not interchangeable between open and close. This is a
  two-call flow, not a human approval: the skill instructs the agent to show you the
  confirmation block and get an explicit yes, but that part is a prompt rule.
- **`account` has no default** on the prepare tools (`real` or `demo`), and the skill tells
  the agent to ask and recommend demo for first tries. Scopes separate demo from real
  (`etoro-public:demo:write` vs `etoro-public:real:write` / `trade.real:write`), so a
  demo-only key cannot place real orders. Balance reads need a separate
  `money.balance:read` grant.
- **`execute-write` confirmation is skill-level.** The skill file calls for showing the
  exact request and getting a yes before any money-moving write. We found no statement that
  the server itself blocks `execute-write` without one, so treat that path as ungated and
  restrict scopes or the client's tool permissions instead.
- Agent Portfolios ring-fences risk by construction: the agent trades a dedicated portfolio
  with its own token scopes.
- The community server defaults to demo mode.

## Caveats

- **Don't reuse our old summary.** "eToro's official MCP server is docs-only" is out of
  date. Equally, "the official server trades" comes with the gating notes above.
- Conflicting eToro pages: the MCP tool page says two tools; the server's skill file says
  seventeen. The OpenAPI document is at v1.390.0 with 148 paths (July: v1.387.0, also 148).
- We could not authenticate, so the 17-tool list, the scope behavior and the token gate
  come from the skill file, not a live `tools/list` or order. The skill file also embeds
  an application `x-api-key` that eToro labels an identifier, not a secret; we do not
  reproduce it here.
- `execute-write` coverage of Agent Portfolio and transfer routes is inferred from the
  skill text and OpenAPI document, not tested.
- Not available to US retail.

## Sources

Checked directly on 2026-10-12:

- <https://builders.etoro.com/tools/mcp> (markdown version; still says two tools)
- <https://mcp.public-api.etoro.com/skill> (skill 1.21.1: tool list, auth, scopes, safety rules)
- <https://mcp.public-api.etoro.com> (unauthenticated `initialize` returned 401 plus OAuth
  metadata at `/.well-known/oauth-protected-resource`)
- <https://builders.etoro.com/openapi.json> (v1.390.0, 148 paths; agent-portfolio v1/v2 routes)
- <https://builders.etoro.com/products/agent-portfolios>
- <https://www.etoro.com/news-and-analysis/etoro-updates/agent-portfolios-let-your-ai-agent-trade-for-you/> (page meta: "as little as $200")
- <https://github.com/gabrielcerutti/etoro-mcp-server> (35 tools, `ETORO_TRADING_MODE` default `demo`, v1.1.4)
