---
name: Alpaca
region: US
status: official
trading: true
server_type: remote (official hosted OAuth MCP) and local (uvx alpaca-mcp-server)
source_url: https://alpaca.markets/mcp-server
last_verified: 2026-11-11
---

# Alpaca

## Overview

**Official, first-party.** Alpaca ships this themselves — it has a product page on
[alpaca.markets](https://alpaca.markets/mcp-server) under their Trading API products,
and the repo's own README opens with "Alpaca's **official** MCP Server." It lives in
Alpaca's own GitHub org, [`alpacahq`](https://github.com/alpacahq/alpaca-mcp-server).

Two official routes. The `alpaca-mcp-server` package is **local**: you run the process
yourself (official and local are independent axes). Its README says Claude Mobile and ChatGPT need a
remote MCP server and that the package "does not configure remote MCP authentication", so
you must not expose it to the public internet with your Alpaca keys. The second route is
**remote**, below.

**Alpaca also runs hosted, OAuth-protected MCP endpoints.** The first-party
[`alpacahq/agentic`](https://github.com/alpacahq/agentic) repo (README read 2026-11-11)
lists `https://api.alpaca.markets/mcp` (Trading and Market Data, live),
`https://paper-api.alpaca.markets/mcp` (paper), plus Broker API endpoints at
`broker-api.alpaca.markets/mcp` and `broker-api.sandbox.alpaca.markets/mcp` for broker
partners. Setup is via Cursor, Claude Code or Codex plugins (`alpaca-trading`,
`alpaca-broker`) or a manual config. Per the README, hosted access currently supports
those three clients (plus VS Code for Broker MCP). Both Trading endpoints expose Market Data
tools alongside trading tools. We read the README and probed `api.alpaca.markets/mcp`
(unauthenticated `initialize` POST returns 401, re-probed 2026-11-11); we did not
authenticate or enumerate tools.

> Earlier versions of this page filed Alpaca under *community*. That was wrong. The
> `alpacahq` org is Alpaca's own, and the server is first-party. Kept visible here
> because the correction is the useful part: **check whether the GitHub org belongs to
> the broker** before calling a server third-party.

## How to connect

**Hosted (remote, OAuth, no API keys):** install the `alpaca-trading` plugin in Claude Code
(`claude plugin marketplace add alpacahq/agentic`, then `/plugin`, install, `/reload-plugins`,
`/mcp` to run the OAuth flow) or add the URLs manually (`"type": "http"` in Claude Code).
Live and paper are **two separate endpoints** (`api.alpaca.markets/mcp` and
`paper-api.alpaca.markets/mcp`), each its own server entry.

**Local:**

```bash
uvx alpaca-mcp-server
```

Or as a Claude MCP entry: `"command": "uvx", "args": ["alpaca-mcp-server"]`. A Docker
build (clone the repo, `docker build`) is also documented; Docker defaults to stdio.
Requires Python 3.10+ and `uv`. Current release is v2.4.1 (2026-11-04: certificate trust-store fix, spec syncs, dependency bumps; no tool changes noted in the release notes).

Auth is API keys from the Alpaca dashboard — two env vars, `ALPACA_API_KEY` and
`ALPACA_SECRET_KEY`. No `.env` file or extra init required.

## Trading scope

Equities and ETFs, crypto, and options (single-leg and multi-leg spreads). Order types
per the README's tool list: stocks/ETFs take market, limit, stop, stop-limit,
trailing-stop and brackets; crypto takes market, limit and stop-limit; options take
single- or multi-leg orders, and since v2.4.0 single-leg options also accept `stop` and
`stop_limit` with a `stop_price` and `gtc` time-in-force (multi-leg stays market/limit).
Also account, positions (close, liquidate, exercise options), watchlists, real-time and
historical data, corporate actions, news, and short-sale locate requests (not available
in paper trading). Fixed income is a quotes-only data toolset (by ISIN), not a trading
route. Index data tools were dropped in the August 2026 spec sync, so "indices" no longer
applies.

## Safety / guardrails

**Paper trading is the default for the local server only.** The hosted plugin has no
`ALPACA_PAPER_TRADE` switch: `alpaca-trading` bundles both a live and a paper server, so
paper vs live is whichever endpoint you connect to, and `api.alpaca.markets/mcp` is the live
one. The agentic README describes no confirmation step, toolset filter or spend cap for the
hosted servers. For the local server, `ALPACA_PAPER_TRADE` defaults to `true`; you set it
to `false` to trade live. You get $100k in simulated funds to exercise a workflow
before any of it is real.

For the local server, `ALPACA_TOOLSETS` restricts which tool groups are exposed, and the filtering happens
server-side rather than merely being hidden in the client. Eleven toolsets are
available (`account`, `trading`, `watchlists`, `assets`, `stock-data`, `crypto-data`,
`options-data`, `corporate-actions`, `news`, `fixed-income-data`, `locates`), so if
you only want analysis, you can leave `trading` off entirely and the tool simply isn't
there. (`index-data` from our earlier check is gone; `locates` is new.)

Other things the README and repo document: tool outputs are wrapped in a trust-boundary
envelope that separates server metadata from untrusted API data, as a mitigation for
prompt injection (news text is flagged as the riskiest); Streamable HTTP mode binds to
localhost by default and validates `Host` and `Origin` headers (DNS-rebinding
protection); and there is no MCP OAuth, so binding to `0.0.0.0` gives you no
authentication. The README's own security notice: the server "can place real trades."
We found no per-order confirmation step in the docs, and the `trading` toolset includes
`cancel_all_orders` and `close_all_positions`.

For the local server, that combination (paper by default, server-side toolset filtering) is
among the better safety postures in this list. The hosted live endpoint has neither.

## Caveats

- **This is v2, a complete rewrite.** "None of the V1 tools exist in V2 — tool names,
  parameters, and schemas have changed." An old v1 tutorial will not match current
  behavior.
- Alpaca's own marketing page says you "switch to live trading by just updating your
  API keys," which reads as though keys alone decide. The repo is clearer and is what
  we follow: the `ALPACA_PAPER_TRADE` env var is the switch, defaulting to paper.
  Verify your own config rather than trusting either sentence.
- The `alpaca-mcp-server` package is local-only. Self-hosting it remotely for mobile/ChatGPT
  means running a trading-capable server on a cloud box, your operational problem. Alpaca's
  hosted endpoints are the supported remote route, but currently only for Cursor, Claude Code
  and Codex (README as read 2026-11-11), not Claude mobile or ChatGPT.
- The earlier "no hosted endpoint" finding on this page is superseded by `alpacahq/agentic`.
- Distributed via PyPI/uvx and, since the repo moved to publishing from GitHub Releases,
  tagged releases exist (v2.3.2 on 2026-09-15, v2.4.0 on 2026-10-12, v2.4.1 on 2026-11-04). Earlier text here
  said no releases were published; that is out of date. 1,016 stars at last check.
- The server sends a versioned `APCA-MCP-TRADING/<version>` User-Agent; set
  `ALPACA_MCP_USER_AGENT` to an empty string to opt out.
- Not checked first-hand: the product page's "no minimum deposit" and $100k paper-fund
  claims (the page is client-rendered; the $100k and "switch to live by updating your
  API keys" wording was read from the page text), and live-trading behavior itself.
  We read docs and source, we did not place orders.

## Other first-party repos (alpacahq)

Read from each README on 2026-11-11. Star counts and last push as of that date.

| Repo | What it is | Stars | Last push | License |
|---|---|---|---|---|
| [`alpacahq/agentic`](https://github.com/alpacahq/agentic) | Plugin marketplace (Cursor, Claude Code, Codex) bundling the hosted Trading and Broker MCP endpoints; also documents local Trading MCP and the CLI | 7 | 2026-11-09 | MIT |
| [`alpacahq/alpaca-skills`](https://github.com/alpacahq/alpaca-skills) | Open agent skills (`SKILL.md`): 4 Trading API (backtest, paper trading, CLI, MCP) and 10 Broker API skills (onboarding/KYC, funding, journals, orders, SSE, reconciliation and others) | 166 | 2026-11-11 | Apache-2.0 |
| [`alpacahq/cli`](https://github.com/alpacahq/cli) | Alpaca Trading CLI built for agents. README flags it as **alpha preview**, with no confirmation prompts; `position close-all` and `order cancel-all` execute immediately. Paper is the default, live is opt-in | 204 | 2026-10-22 | Apache-2.0 |

None of these are archived. The CLI warning matters: unlike the MCP server's toolset
filtering, the CLI has no guardrails beyond paper-by-default.

## Sources

Checked directly on 2026-10-12 (`alpacahq/agentic` README and an unauthenticated probe of `api.alpaca.markets/mcp` on 2026-11-11; release notes re-read for v2.4.1 on 2026-11-11):

- <https://github.com/alpacahq/alpaca-mcp-server> (README, v2.3.2 and v2.4.0 release
  notes, PRs #90, #109, #126, #131 for the trust-boundary envelope, index-tool removal
  and option stop orders)
- <https://alpaca.markets/mcp-server>
- <https://pypi.org/project/alpaca-mcp-server/> (2.4.0 is the latest release)
