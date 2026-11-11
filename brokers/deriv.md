---
name: Deriv
region: Global (ex-US) — Malta / Cyprus
status: official
trading: false
server_type: remote (docs/schema server); the community repo is local (stdio)
source_url: https://tradersview.deriv.com/
last_verified: 2026-11-11
confidence: medium
---

# Deriv

## Overview

Deriv now has an **official, hosted MCP server, but it is a documentation and schema
server, not a trading route.** The first-party plugin repo
[`deriv-com/deriv-api-plugin`](https://github.com/deriv-com/deriv-api-plugin) (README read
2026-11-11; MIT, 0 stars, last push 2026-11-06, not archived) bundles a hosted MCP at
`https://mcp-api.deriv.com/mcp` plus 8 agent skills. The README describes the MCP's
purpose as "live schemas, field facts, payload validation, and task guides", needs no
Deriv sign-in and asks for no API token. An unauthenticated `initialize` POST returns 200
(probed 2026-11-11; server name `deriv-api`, version 0.1.0). **It cannot trade or touch an
account:** it needs no login, so it has no account to act on. We did not enumerate its
tools, so that rests on the README and the no-auth design, and `trading: false` stays. Trade press also lumps Deriv into the broker-MCP wave because of its TradersView
product, but TradersView is a login-free web market-analysis dashboard with no MCP and no
trading. The only third-party trading-adjacent option is a stale two-tool read-only
personal project (below).

## Official plugin and skills

Install for Claude Code: `/plugin marketplace add deriv-com/deriv-api-plugin` then
`/plugin install deriv@deriv`. Also packaged for Cursor (marketplace listing), Codex,
Antigravity and Kimi, or skills only via `npx skills add https://github.com/deriv-com/deriv-api-plugin`.
Skills (8 `SKILL.md` files): `deriv-trading-app`, `deriv-auth`, `deriv-market-data`,
`deriv-trade-types`, `deriv-trade-lifecycle`, `deriv-lightweight-charts`,
`deriv-smartcharts`, `deriv-llms`. They help an agent build apps against Deriv's API
(proposal, buy, monitor, sell lifecycle); they do not hand the agent your account.

## How to connect

Official docs/schema MCP: remote Streamable HTTP, `https://mcp-api.deriv.com/mcp`, no credentials (add it as a remote MCP URL, or install the plugin above). Community repo (local, stdio, now 404 upstream):

```bash
uv run server.py  (or: docker build -t deriv-api-mcp .) — requires DERIV_API_TOKEN in a .env file; then add to your Claude config.
```

## Trading scope

none. The official hosted server is docs and schema only (no orders, no account data). The community repo is read-only, and barely that: 2 tools (`get_active_symbols`,
`get_account_balance`).

## Caveats

- Correcting a common error: LeapRate and similar coverage frame Deriv's TradersView
  as its MCP play. It is not. I fetched the site — no MCP endpoint, no Model Context
  Protocol mention, no order placement. It is a marketing/acquisition dashboard.
- The official MCP (`mcp-api.deriv.com/mcp`, `initialize` returns 200 with no auth) is a docs/schema helper for building against the Deriv API, per its plugin README. It cannot place orders or read balances; do not confuse it with a trading route; the list's earlier "no official server" finding predates `deriv-api-plugin` and is superseded.
- The community repo is minimal and abandoned: 0 stars, 4 commits, last push
  2025-01-07 (~22 months stale). As of 2026-11-11 `github.com/raju-deriv/mcp-deriv-api-server`
  returns 404 (deleted or made private); copies survive as mirrors (for example
  `mcp-research/raju-deriv__mcp-deriv-api-server`, `lwsinclair/raju-deriv_mcp-deriv-api-server`),
  which are not Deriv's.
- The `raju-deriv` GitHub handle suggests a Deriv employee, but the repo sits under a
  personal account, not a Deriv org — treat as community/personal, NOT official,
  despite aggregator sites (mcpmarket, skywork) mislabeling it "the official
  implementation".
- Only 2 read-only tools. It cannot place trades. This is a demo, not a usable trading
  route.
- DIY-wrapper candidate: Deriv's WebSocket API is public and well documented.

## Sources

Checked directly on 2026-11-11 (unauthenticated `initialize` probe of `mcp-api.deriv.com/mcp`: 200; TradersView page and its llms.txt re-fetched, which describes a free market-analysis site with AI signals and news and no MCP or Model Context Protocol text; fxnewsgroup article has no MCP text either; original repo URL now 404; earlier checks: TradersView page re-fetched: still no MCP/Model Context Protocol text; repo stats re-pulled; developers.deriv.com and api.deriv.com llms.txt contain no MCP mention; npm search for deriv mcp finds no Deriv-published MCP package):

- <https://tradersview.deriv.com/>
- <https://github.com/raju-deriv/mcp-deriv-api-server>
- <https://www.leaprate.com/technology/broker-mcp-ai-agent-trading-infrastructure-race-2026/>
- <https://fxnewsgroup.com/forex-news/retail-forex/deriv-launches-tradersview-ai-based-market-intelligence-platform/>
