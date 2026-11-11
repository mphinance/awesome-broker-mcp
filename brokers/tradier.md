---
name: Tradier
region: US
status: official
trading: true
server_type: remote
source_url: https://docs.tradier.com/docs/tradier-mcp
last_verified: 2026-07-16
---

# Tradier

## Overview

Tradier's first-party, hosted MCP server — fully production, not a beta/preview.
Separate live and paper-trading tokens so you can test against a sandbox before
going live.

## How to connect

Hosted endpoint: `https://mcp.tradier.com/mcp`

**Claude web/desktop**: Settings → Connectors → Add custom connector.

**Claude Code**:
```
claude mcp add --transport http tradier https://mcp.tradier.com/mcp \
  --header "API_KEY: your_api_key_here" \
  --header "PAPER_TRADING: false"
```

Generate the API token at `https://web.tradier.com/user/api` (requires a Tradier
Brokerage account). Set `PAPER_TRADING: true` with a paper token to simulate first.

## Trading scope

21 tools: single-leg and multi-leg options orders, equity orders, advanced order
types (OCO, OTO, OTOCO), account position/balance retrieval, market data, order
cancellation.

## Safety / guardrails

None documented at the platform level — no per-trade approval step is mentioned in
Tradier's own docs; orders execute directly through the tool call. Paper trading
(`PAPER_TRADING: true`) is the recommended way to test before flipping to live.
Any "per-trade approval" behavior is a property of your client/agent setup, not
something Tradier enforces server-side.

## Caveats

- The cited docs page contains two voices: its opening line says Tradier "is building" a custom
  MCP server, while the body describes it as launched with `place_*` order tools. The
  endpoint itself answers a POST `initialize` with 200 (checked 2026-10-09), so "building"
  looks like leftover intro text. Not tested with an account.

- **Docs page gone (2026-11-11).** `https://docs.tradier.com/docs/tradier-mcp` now 307-redirects
  to a Theneo "no project found" page and `https://docs.tradier.com/llms.txt` returns 404
  (it existed earlier). The docs portal root renders an empty project, so this looks like
  an unpublished or moved docs site, not a retired product. A web search snippet of the
  old docs page says 22 tools (`search_tradier_docs` plus 21 brokerage tools); that is
  search-result text, not something I read on the page, so the "21 tools" figure above
  is unconfirmed. The endpoint, header names and tool list in this entry could not be
  re-verified this round, which is why `last_verified` was not bumped.
- Still readable and first-party (2026-11-11): the product page
  <https://tradier.com/individuals/mcp-server> and the support article
  <https://support.tradier.com/kb/guide/en/tradiers-mcp-server-eoA0tv3GlS/Steps/4946334>.
  They confirm: fully hosted, Streamable HTTP, personal access token auth (revocable),
  works with ChatGPT, Claude (Web, Desktop, Code), Cursor and Gemini CLI, can place,
  modify and cancel orders and manage watchlists, paper trading included with every
  account. The support article leaves controls to you ("Use order confirmations and
  review processes for critical trades"), consistent with no server-side approval step.
  Neither page states the endpoint URL.
- Some LLM platforms require a paid tier to use custom MCP connectors at all — noted
  directly in Tradier's docs, not specific to Tradier.

## Community repos (not endorsed by Tradier)

READMEs read 2026-11-11; stars and pushes from the GitHub API the same day. Source code was not read. Both are tiny and neither is needed now that Tradier hosts its own server.

- **[fi222/tradier-mcp](https://github.com/fi222/tradier-mcp)** (local Node; 0 stars, last push 2026-04-27, **no license**). **Can place orders:** the README lists 10 tools, including `place_equity_order` (POST) and `cancel_order` (DELETE), plus balances, positions, orders, gain/loss, quotes and option chains. Defaults to `TRADIER_ENV=sandbox`; you must set `live` to trade real money. No confirmation step is described. The README has a hard-coded personal home path and a "via Railway" description, so it reads like a personal setup that was pushed public. Handles your Tradier token and account id.
- **[pipeworx-io/mcp-tradier](https://github.com/pipeworx-io/mcp-tradier)** (MIT; 0 stars, last push 2026-11-09). **Read-only market data**: three tools (`tradier_quote`, `tradier_option_expirations`, `tradier_option_chain`). It is a thin pack on the third-party **Pipeworx gateway** (`gateway.pipeworx.io`), and the README says it is unofficial. Each call takes your Tradier token as an `_apiKey` argument, so your token transits Pipeworx's servers, not just Tradier's. The endpoint also lists about 30 shared gateway meta-tools alongside the three Tradier ones. **Caution:** sending a brokerage token through an unvetted gateway is the main risk; use a sandbox or market-data-only token if you try it.
