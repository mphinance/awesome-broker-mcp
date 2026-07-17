---
name: Alpaca
region: US
status: official
trading: true
server_type: local
source_url: https://alpaca.markets/mcp-server
last_verified: 2026-07-16
---

# Alpaca

## Overview

**Official, first-party.** Alpaca ships this themselves — it has a product page on
[alpaca.markets](https://alpaca.markets/mcp-server) under their Trading API products,
and the repo's own README opens with "Alpaca's **official** MCP Server." It lives in
Alpaca's own GitHub org, [`alpacahq`](https://github.com/alpacahq/alpaca-mcp-server).

It is official but **local** — you run the process yourself. Those are independent
axes, and Alpaca is explicit about it: *"Alpaca does not provide a hosted remote MCP
server."* If you want it on Claude mobile or ChatGPT, you host it somewhere yourself.

> Earlier versions of this page filed Alpaca under *community*. That was wrong. The
> `alpacahq` org is Alpaca's own, and the server is first-party. Kept visible here
> because the correction is the useful part: **check whether the GitHub org belongs to
> the broker** before calling a server third-party.

## How to connect

```bash
uvx alpaca-mcp-server
```

Or as a Claude MCP entry: `"command": "uvx", "args": ["alpaca-mcp-server"]`. A Docker
build is also documented.

Auth is API keys from the Alpaca dashboard — two env vars, `ALPACA_API_KEY` and
`ALPACA_SECRET_KEY`. No `.env` file or extra init required.

## Trading scope

Fractional equities, ETFs, crypto, options (including multi-leg spreads and condors),
fixed income, and indices. Order types: market, limit, stop, stop-limit,
trailing-stop, and bracket orders for stocks/crypto; single- and multi-leg strategies
for options. Plus portfolio, positions, watchlists, real-time data, corporate actions,
and news.

## Safety / guardrails

**Paper trading is the default.** `ALPACA_PAPER_TRADE` defaults to `true` — you set it
to `false` to trade live. You get $100k in simulated funds to exercise a workflow
before any of it is real.

`ALPACA_TOOLSETS` restricts which tool groups are exposed, and the filtering happens
server-side rather than merely being hidden in the client. Eleven toolsets are
available (`account`, `trading`, `watchlists`, `assets`, `stock-data`, `crypto-data`,
`options-data`, `corporate-actions`, `news`, `fixed-income-data`, `index-data`), so if
you only want analysis, you can leave `trading` off entirely and the tool simply isn't
there.

That combination — paper by default, server-side toolset filtering — is among the
better safety postures in this list.

## Caveats

- **This is v2, a complete rewrite.** "None of the V1 tools exist in V2 — tool names,
  parameters, and schemas have changed." An old v1 tutorial will not match current
  behavior.
- Alpaca's own marketing page says you "switch to live trading by just updating your
  API keys," which reads as though keys alone decide. The repo is clearer and is what
  we follow: the `ALPACA_PAPER_TRADE` env var is the switch, defaulting to paper.
  Verify your own config rather than trusting either sentence.
- Local-only. Hosting it remotely for mobile/ChatGPT means you are running a
  trading-capable server on a cloud box — your operational problem, not Alpaca's.
- No GitHub releases published; distributed via PyPI/uvx. 874 stars at last check.
