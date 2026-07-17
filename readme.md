# Awesome Broker MCP [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> Which brokers can an AI actually trade through?

[MCP](https://modelcontextprotocol.io) is how an AI assistant connects to outside
tools. Brokers have started shipping MCP servers — which means "ask Claude to place
the trade" is now a real sentence, and a real risk.

Working out **who actually has one** is annoyingly hard. Brokers bury it, many servers
are unofficial, several are read-only while implying otherwise, and the roundups you
find are mostly recycled from each other. So this is a directory that checks.

**Every entry here was opened and read at the source** — the broker's own docs or the
server's own repo, never another list. Each page carries a `last_verified` date, says
plainly what it can and can't do, and keeps its hedges intact where something couldn't
be confirmed. Entries that were checked and found to have **nothing** are listed too:
a confirmed "no" is a real answer and saves you the same afternoon.

**65 entries, 61 with a page of their own.** 26 have an official first-party server, 20
have only a community one, 3 are reachable solely through an aggregator, and 16 were
checked and confirmed to have no MCP route at all.

## Contents

- [How to read this](#how-to-read-this)
- [Official servers](#official-servers)
- [Community servers](#community-servers)
- [Aggregators](#aggregators)
- [Reachable only via an aggregator](#reachable-only-via-an-aggregator)
- [Confirmed no MCP route](#confirmed-no-mcp-route)
- [Local vs. remote](#local-vs-remote)
- [Before you connect one to real money](#before-you-connect-one-to-real-money)
- [Contributing](#contributing)

## How to read this

Two columns decide almost everything.

**Status** — who wrote it.

- **Official** — first-party, built or hosted by the broker.
- **Community** — a third-party repo. Not endorsed by the broker. Some are excellent.
  You are still handing broker credentials to a stranger's code.
- **Aggregator-only** — no direct server; reachable only through SnapTrade, Truthifi, etc.
- **None** — checked, confirmed nothing exists.

**Trades?** — whether it can actually place an order. Read this one carefully. "Has an
MCP server" and "can trade" are different claims, and the gap between them is where
most of the confusion lives. Webull ships two servers and only one trades. IBKR drafts
an order and hands it back for *you* to submit. IG, Upstox and Crypto.com are official
but deliberately read-only.

**Two axes people conflate:** official/community is about *who wrote it*.
local/remote is about *where it runs*. They're independent. Alpaca is official **and**
local. We shipped that error ourselves once — see [alpaca.md](brokers/alpaca.md).

**Where the landscape actually is:** crypto exchanges are well ahead of traditional
brokers. Kraken, OKX, Bybit and Gemini all ship first-party servers with real
execution. So does India (Zerodha, Upstox) and Asia broadly (Longbridge, Tiger). Most
of the big US retail names — Fidelity, Vanguard, M1, Wealthfront, Betterment — have
nothing at all.

## Official servers

First-party. Built or hosted by the broker themselves.

### Equities & multi-asset

| Broker | Trades? | What it trades | Type |
|---|---|---|---|
| [Alpaca](brokers/alpaca.md) | Yes | Equities, ETFs, crypto, multi-leg options, fixed income, indices. **Paper by default** | Local (`uvx`) |
| [Interactive Brokers](brokers/interactive-brokers.md) | Draft only | Global, multi-asset — builds the order, **you** submit it | Remote |
| [Robinhood](brokers/robinhood.md) | Yes | Stocks, options, futures | Remote |
| [Tradier](brokers/tradier.md) | Yes | Equities + multi-leg options | Remote |
| [Webull](brokers/webull.md) | **Both** | Cloud MCP is read-only; `webull-openapi-mcp` (local) trades stocks/options/futures/crypto | Remote + local |
| [TradeStation](brokers/tradestation.md) | Yes | Equities + more. Needs Claude Pro and a $10k balance | Local |
| [Public.com](brokers/public.md) | Yes | Stocks, ETFs, options, crypto; brokerage + IRA | Local |
| [eToro](brokers/etoro.md) | Yes | Agent Portfolios — a dedicated portfolio, $200 minimum | Remote |
| [Longbridge](brokers/longbridge.md) | Yes | US + HK equities, options, warrants. ~148 tools, OAuth 2.1 | Remote |
| [Tiger Brokers](brokers/tiger-brokers.md) | Yes | Stocks, options, futures across US/HK/CN/SG | Local (`uvx`) |
| [Zerodha](brokers/zerodha-kite-connect.md) | Yes* | Indian equities, F&O, currency, commodities. *Order placement only on the self-hosted build* | Remote + local |
| [Upstox](brokers/upstox.md) | **No** | Read-only by design | Remote |

### Crypto

| Exchange | Trades? | What it trades | Type |
|---|---|---|---|
| [Kraken](brokers/kraken.md) | Yes | Spot (1,400+ pairs), futures, tokenized stocks, forex. **Paper mode built in**; live trading is opt-in per scope | Local |
| [OKX](brokers/okx.md) | Yes | Spot, swap, futures, options, grid bots | Local |
| [Bybit](brokers/bybit.md) | Yes | Spot, derivatives, positions | Local |
| [Gemini](brokers/gemini.md) | Yes | Full Gemini trading API surface | Local |
| [Coinbase](brokers/coinbase.md) | Yes* | Onchain wallets and token swaps — *not* classic spot trading | Local |
| [Crypto.com](brokers/crypto-com.md) | **No** | Market data only | Remote |

### Forex / CFD

| Broker | Trades? | What it trades | Type |
|---|---|---|---|
| [cTrader (Spotware)](brokers/ctrader-spotware.md) | Yes | Whatever your cTrader broker offers — FX, indices, commodities, crypto CFDs | Remote + local |
| [ThinkMarkets](brokers/thinkmarkets.md) | Yes | CFDs on ThinkTrader — place, modify, close | Remote |
| [TraderEvolution](brokers/traderevolution.md) | Yes | 31 tools per the vendor: market/limit/stop + complex orders | Unknown |
| [IG](brokers/ig.md) | **No** | Strictly read-only: prices, positions, P&L, margin | Remote |

## Community servers

Third-party. **Not endorsed by the broker.** Check the last commit before trusting one
with an account — abandonment is a live risk here, and several below are already
effectively dead.

| Broker | Trades? | What it trades | Type |
|---|---|---|---|
| [tastytrade](brokers/tastytrade.md) | Yes | Equities, options, futures, multi-leg | Local or Modal |
| [Charles Schwab](brokers/schwab.md) | Yes | Equities, options, brackets/OCO. Opt-in required | Local |
| [moomoo / Futu](brokers/moomoo.md) | Yes | Full execution; live orders need an explicit unlock | Local + OpenD gateway |
| [E*TRADE](brokers/etrade.md) | Yes | Full order placement + risk validation | Local |
| [eToro](brokers/etoro.md) | Yes | 35 tools against your own account | Local (`npx`) |
| [Interactive Brokers](brokers/interactive-brokers.md) | Varies | Superseded by the official connector | Local |
| [Saxo Bank](brokers/saxo-bank.md) | Yes | Equities, FX, CFDs, futures, options. Writes are triple-gated, SIM by default | Local |
| [Angel One](brokers/angel-one.md) | Yes | Indian equities + F&O via SmartAPI | Local |
| [NinjaTrader](brokers/ninjatrader.md) | Yes | Futures, via a connected NT8 desktop install | Local (bridges to NT8) |
| [Tradovate](brokers/tradovate.md) | Yes | Futures — market/limit, configurable TIF | Local |
| [Kalshi](brokers/kalshi.md) | Yes | Event contracts — create/amend/cancel orders | Local |
| [Polymarket](brokers/polymarket.md) | Yes | Outcome tokens — market + limit orders | Local |
| [Binance](brokers/binance.md) | Yes | Varies by repo — no single canonical server | Local |
| [Hyperliquid](brokers/hyperliquid.md) | Yes | Perpetuals and spot on the Hyperliquid DEX | Local |
| [XTB](brokers/xtb.md) | ⚠️ Code says yes | **Upstream repo is deleted.** Survives only as mirrors and an unaudited npm republish | Local |
| [Questrade](brokers/questrade.md) | No | Read-only, every server found | Local |
| [Trade Republic](brokers/trade-republic.md) | No | Read-only. Reverse-engineers a private API; **may violate ToS** | Local |
| [Fineco](brokers/fineco.md) | No | Read-only | Local |
| [Wealthsimple](brokers/wealthsimple.md) | No | Public marketing content only — zero account access | Remote |
| [Deriv](brokers/deriv.md) | No | Read-only, and barely — 2 tools | Local |
| [OANDA](brokers/oanda.md) | No | Read-only. The one "order-capable" server **isn't an MCP server at all** | Local |

## Aggregators

One endpoint, many brokers. **Almost all are read-only** — good for "what do I hold
everywhere," not a substitute for a broker's own trading server.

| Aggregator | Trades? | Covers |
|---|---|---|
| [Trade Agent](aggregators/trade-agent.md) | **Yes** — draft-first, explicit confirm | Robinhood, Schwab, E*TRADE, Webull, Public, tastytrade, Coinbase, Kraken |
| [SnapTrade](aggregators/snaptrade.md) | No — read-only, stated outright | Robinhood, Schwab, Fidelity, Vanguard, E*TRADE, Alpaca, Tradier, Trading 212 |
| [Truthifi](aggregators/truthifi.md) | No — "an information channel, not an action channel" | 18,000+ institutions |
| [Plaid](aggregators/plaid.md) | No | Official, read-only account data |
| [Teller](aggregators/teller.md) | No | Community, read-only |
| [ConnectTrade](aggregators/connecttrade.md) | Trades, but **has no MCP server** | Alpaca, Lightspeed, TradeZero, Webull, TradeStation |

Read-only is the norm for a reason. An aggregator already holds delegated credentials
to every account you've linked; giving an LLM write access *through* that layer stacks
two trust boundaries. Most vendors draw the line at reads and leave execution to the
broker.

## Reachable only via an aggregator

No direct server, official or community.

| Broker | Route | Trading |
|---|---|---|
| [Fidelity](brokers/fidelity.md) | SnapTrade / Truthifi | None |
| [Vanguard](brokers/vanguard.md) | SnapTrade / Truthifi | None |
| [Trading 212](brokers/trading212.md) | SnapTrade (read-only MCP) | None via MCP — SnapTrade's raw REST API can, with a DIY wrapper |

## Confirmed no MCP route

Checked and found nothing. Not "unknown" — **confirmed negative**, which is the whole
point of writing them down.

| Broker | Notes |
|---|---|
| **SoFi** | In-app Composer AI only. No external MCP. |
| **JP Morgan / Chase** | None found. |
| **Merrill (Bank of America)** | None found. |
| **Ally Invest** | None found. |
| [M1 Finance](brokers/m1-finance.md) | No server, and no AI route to trading at all. |
| [Wealthfront](brokers/wealthfront.md) | Nothing. No public API either. |
| [Betterment](brokers/betterment.md) | Nothing, official or community. |
| [Stash](brokers/stash.md) | Nothing. |
| [DEGIRO](brokers/degiro.md) | Nothing usable. |
| [Hargreaves Lansdown](brokers/hargreaves-lansdown.md) | Nothing. |
| [TradeZero](brokers/tradezero.md) | Nothing — despite ConnectTrade covering it via REST. |
| [Lightspeed](brokers/lightspeed.md) | Nothing — same. |
| [AMP Futures / Rithmic](brokers/amp-futures-rithmic.md) | Nothing for AMP or for Rithmic. |
| [FOREX.com (StoneX)](brokers/forex-com-stonex.md) | REST + FIX APIs, but no MCP. |
| [MX](aggregators/mx.md) | Nothing. |

## Local vs. remote

Decides what you have to keep running. **This is not the same axis as
official/community** — Alpaca and Kraken are both official *and* local.

- **Remote / hosted** — paste a URL or add the connector, done. IBKR, Robinhood,
  Tradier, Webull Cloud (read-only), eToro Agent Portfolios, Longbridge, Upstox, IG,
  ThinkMarkets, Crypto.com, SnapTrade, Trade Agent, Truthifi, Plaid.
- **Local** — a process runs on your machine. Alpaca (`uvx`), Kraken, OKX, Bybit,
  Gemini, TradeStation, Public.com, Coinbase (stdio), Tiger, community eToro (`npx`),
  moomoo (needs OpenD — two processes), tastytrade, E*TRADE, Schwab, Saxo, NinjaTrader
  (bridges to an NT8 desktop install), Tradovate, Kalshi, Polymarket, and Webull's
  trading-capable `webull-openapi-mcp`.

## Before you connect one to real money

This list documents what exists. It is not a recommendation to wire an LLM to your
brokerage account. Some things worth sitting with first:

- **Prompt injection reaches your account.** If an agent reads a webpage, an email, or
  a Discord message, that text can carry instructions. When the same agent holds a
  trading tool, a hostile string is one hop from an order. The blast radius of a
  jailbreak stops being "wrong answer" and starts being "wrong position."
- **Prefer draft-first.** IBKR's official connector and Trade Agent both build an order
  and require an explicit human confirm. That pattern exists because the vendors
  thought about this. It's the shape you want.
- **Prefer paper-by-default.** Alpaca (`ALPACA_PAPER_TRADE=true`) and Kraken (paper
  scope on, trade scope off) both ship safe defaults. That's a real signal about how
  much thought went in.
- **Paper first. For longer than feels necessary.** Nothing here is battle-tested at
  the level your money assumes.
- **Community servers are strangers' code holding your credentials.** Read it. Check
  the last commit. Ask what happens if the maintainer walks away — [XTB](brokers/xtb.md)
  is what that looks like: upstream deleted, aggregator sites still listing it as live.
- **A README claiming MCP doesn't make it MCP.** The only order-capable "OANDA MCP
  server" turned out to be a plain FastAPI REST wrapper with no MCP SDK in its
  dependencies at all. We only caught it by reading `requirements.txt`.
- **Least privilege.** If read-only answers your question, use read-only. Most people
  wiring up an LLM want analysis, not execution — and analysis needs no trading scope.
  Alpaca's `ALPACA_TOOLSETS` and Kraken's service scopes let you leave the trading
  tools out entirely, server-side.
- **Separate the brain from the hands.** Analysis and execution don't have to be the
  same connector, and there's a real argument they shouldn't be.

## Contributing

Corrections are the most valuable thing you can send — this space moves fast, and a
stale entry is how a list like this becomes worthless.

The one rule: **every claim traces to a source you actually opened.** Not a roundup,
not "pretty sure." If you couldn't verify it, say so in Caveats — a hedge is useful, a
confident wrong answer isn't.

See [contributing.md](contributing.md). `node scripts/check-freshness.mjs` shows which
entries are aging.

---

Maintained alongside [TraderDaddy Pro](https://traderdaddy.pro) — an MCP *intelligence*
layer (screeners, options flow, technicals) that deliberately doesn't place trades. The
brokers above are the hands; that's the brain. The
[SDK](https://github.com/mphinance/traderdaddy-sdk) is open source.
