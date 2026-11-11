---
name: Questrade
region: Canada
status: community
trading: false
server_type: local
source_url: https://github.com/zachmelin/QuestradeMCP
last_verified: 2026-11-11
confidence: high
---

# Questrade

## Overview

No official Questrade MCP server exists, but several independent community servers do,
and all of them are read-only. The most prominent is zachmelin/QuestradeMCP (published
to npm as questrade-mcp-server), exposing get_accounts, get_positions, get_balances,
get_orders, search_symbols, get_symbol, get_quotes, get_candles and refresh_token over
Questrade's OAuth2 REST API. Notably, Questrade's own REST API does support order
placement (POST /v1/accounts/:id/orders), so an execution-capable server is buildable
— but no shipping server enables it.

## How to connect

```bash
npx questrade-mcp-server (or npm install -g questrade-mcp-server)
```

## Trading scope

none — every verified server is read-only

## Caveats

- zachmelin/QuestradeMCP: 6 stars, latest release v0.0.13 (2026-06-10), no pushes since.
- Unofficial. The zachmelin README carries an explicit disclaimer: not affiliated
  with, endorsed by, or supported by Questrade Inc.
- Read-only. Mathuran/questrade-mcp (Deno/TypeScript) contains place_order and
  cancel_order tools in the codebase but they are DISABLED — do not describe it as
  trading-capable.
- At least five community repos exist (zachmelin/QuestradeMCP, Mathuran/questrade-mcp,
  DrWheelicus/questrade-mcp-server, e88z4/questrade-mcp, harinivenkat02/QuestradeMCP),
  varying widely in maturity. The first two were inspected in July; the others were README-read on 2026-11-11 (see below).
- Questrade refresh tokens are single-use; token persistence to
  ~/.questrade-mcp/tokens.json is a known operational friction point, and a token
  consumed by another process forces manual regeneration.
- questrade.com/api returned HTTP 403 to automated fetch, so the absence of an
  official Questrade MCP offering is inferred from search results plus the community
  repos' own 'unofficial' disclaimers, not from a directly fetched first-party page.
- Strong DIY-wrapper candidate: the official OAuth REST API covers order placement, so
  a first-party-grade execution server is achievable.

## More community repos (checked 2026-11-11)

READMEs read 2026-11-11; stars and last push as of that date. All hold a Questrade refresh token. Tiny, unvetted; we read READMEs, not source. Still no first-party server: nothing in the `questrade` searches for mcp, skills, agent or cli points to Questrade itself.

- [`agustinsacco/questrade-mcp`](https://github.com/agustinsacco/questrade-mcp): TypeScript, **read-only by design** ("no tool places, changes or cancels orders"). 19 tools covering balances, positions, activities, executions, orders, option chains with Greeks, candles, plus technical analysis and portfolio reports. Ships 1 `SKILL.md`. 0 stars, last push 2026-11-08, MIT.
- [`DrWheelicus/questrade-mcp-server`](https://github.com/DrWheelicus/questrade-mcp-server): Node 22+, 8 tools (portfolio, positions, balances, quotes, price history, order history, account activity). No order-placement tool is listed. 1 star, last push 2026-10-25, license NOASSERTION.
- [`agrigoryan/questrade-cli`](https://github.com/agrigoryan/questrade-cli): JSON-first CLI claiming "full Questrade v1 API coverage (accounts, markets, symbols, orders)" built on its own `questrade-api` package. Order tools are claimed in the feature list; no guardrails documented. 1 star, last push 2026-02-12, MIT.
- [`harinivenkat02/QuestradeMCP`](https://github.com/harinivenkat02/QuestradeMCP): README is a copy of `zachmelin/QuestradeMCP` (its badges still point there); treat as a duplicate. 0 stars, last push 2026-04-18, MIT.
- [`m-turnergane/qte-mcp-trading-engine`](https://github.com/m-turnergane/qte-mcp-trading-engine): "Questrade MCP Trading Engine", a Python trading-engine monorepo, not a plain MCP server. Broker adapter disabled by default (`BROKER_DISABLED=true`), no live orders in its current milestone, and its later work pivoted to IBKR shadow trading. 0 stars, last push 2026-09-09, no license file.
- Not a server: `ParthrajVeluri/questrade_agent` is a voice-command LangGraph prototype that submits only paper orders (0 stars, MIT). `Faraz9877/questrader-oauth`, `IIReDeeMeRII/questrade-mcp`, `BertPlank/questrade-mcp` and `e88z4/questrade-mcp` are empty or near-empty.


## Sources

Checked directly on 2026-11-11: READMEs and repo metadata of the repos in the section above via the GitHub API, plus `gh search repos` for "questrade" with mcp, skills, agent and cli.

Checked directly on 2026-07-16:

- <https://github.com/zachmelin/QuestradeMCP>
- <https://github.com/mathuran/questrade-mcp>
- <https://www.pulsemcp.com/servers/gh-mathuran-questrade>
