<h1 align="center">Awesome Broker MCP</h1>

<p align="center">
  <b>Which brokers can an AI actually trade through?</b><br>
  <sub>65 brokers checked at the source. Including the ones with nothing.</sub>
</p>

<p align="center">
  <a href="https://awesome.re"><img src="https://awesome.re/badge-flat2.svg" alt="Awesome"></a>
  <img src="https://img.shields.io/badge/entries-65-1f6feb" alt="65 entries">
  <img src="https://img.shields.io/badge/official%20servers-27-3fb950" alt="27 official">
  <img src="https://img.shields.io/badge/confirmed%20no%20route-15-f85149" alt="15 confirmed none">
  <img src="https://img.shields.io/badge/last%20verified-2026--07--16-3fb950" alt="Last verified 2026-07-16">
  <a href="license"><img src="https://img.shields.io/badge/license-CC0--1.0-8957e5" alt="CC0-1.0"></a>
</p>

---

[MCP](https://modelcontextprotocol.io) is how an AI assistant connects to outside tools.
Brokers have started shipping MCP servers — which means "ask Claude to place the trade"
is now a real sentence, and a real risk.

Working out **who actually has one** is annoyingly hard. Brokers bury it, many servers
are unofficial, several are read-only while implying otherwise, and the roundups you find
are mostly recycled from each other. So this is a directory that checks.

> **Every entry was opened and read at the source** — the broker's own docs or the
> server's own repo, never another list. Each page carries a `last_verified` date, says
> plainly what it can and can't do, and keeps its hedges where something couldn't be
> confirmed. Entries checked and found to have **nothing** are listed too: a confirmed
> "no" is a real answer, and it saves you the same afternoon.

Then a second pass re-checked all of it with a mandate to **refute** the first.
**11 of 19 original entries needed correcting** — two brokers we wrongly said had no
route, one server we said trades that can't, one we said doesn't that does. Those
corrections are [documented in place](brokers/etrade.md), not quietly edited.

## 🚀 Start here

**Just tell me what to use:**

| If you want… | Use | Why |
|---|---|---|
| 🛡️ **The safest thing that still trades** | [Interactive Brokers](brokers/interactive-brokers.md) | The server *cannot* submit. You approve every order in IBKR's own UI. Architectural, not a setting. |
| 🧪 **To experiment without risking money** | [Alpaca](brokers/alpaca.md) or [Kraken](brokers/kraken.md) | Paper/sandbox is the **default**, and you can leave trading tools off entirely, server-side. |
| 📊 **Analysis only, no execution** | [SnapTrade](aggregators/snaptrade.md) / [Truthifi](aggregators/truthifi.md) | Read-only by design. Most people wiring up an LLM want analysis — that needs no trading scope. |
| 🌍 **Crypto** | [Kraken](brokers/kraken.md), [OKX](brokers/okx.md), [Bybit](brokers/bybit.md), [Gemini](brokers/gemini.md) | All official, all trade. Crypto is years ahead of traditional brokerage here. |
| 🇮🇳 **India** | [Zerodha](brokers/zerodha-kite-connect.md), [Upstox](brokers/upstox.md) | Both official. Zerodha trades on the self-hosted build; Upstox is read-only. |
| 🏦 **Fidelity / Vanguard / M1 / Wealthfront** | *Nothing good* | No official route. See [confirmed no MCP route](#-confirmed-no-mcp-route). |

**⚠️ Read [before you connect one to real money](#-before-you-connect-one-to-real-money) first.** Some of these place live
orders on a tool call, and [one has no paper mode at all](brokers/public.md).

![Every entry compared: status, trading capability, server type, and the caveat that matters most for each](images/broker-mcp-full-comparison.png)

<sub>Generated from the tables below by `node scripts/build-chart.mjs`, so it can't
drift from them — regenerate it whenever an entry changes.</sub>

**The pattern worth noticing:** the official integrations trend conservative — hosted
plus draft-approval ([IBKR](brokers/interactive-brokers.md),
[Trade It](aggregators/trade-agent.md)), or hosted with genuinely no execution path at
all ([SnapTrade](aggregators/snaptrade.md), [Truthifi](aggregators/truthifi.md),
[Webull](brokers/webull.md)'s Cloud MCP). The brokers with the most compliance exposure
chose the most cautious posture, and that isn't an accident. Community servers mostly
skip straight to direct execution with no platform-level approval step; there, the
guardrail is whatever *you* configure client-side, not something the broker enforces.

## Contents

- [🧭 How to read this](#-how-to-read-this)
- [🏛️ Official servers](#-official-servers)
- [👥 Community servers](#-community-servers)
- [🔗 Aggregators](#-aggregators)
- [🚧 Reachable only via an aggregator](#-reachable-only-via-an-aggregator)
- [❌ Confirmed no MCP route](#-confirmed-no-mcp-route)
- [💻 Local vs. remote](#-local-vs-remote)
- [⚠️ Before you connect one to real money](#-before-you-connect-one-to-real-money)
- [🤝 Contributing](#-contributing)

## 🧭 How to read this

**The legend.** Two things decide almost everything: *who wrote it* and *can it actually
place an order*.

| | Means |
|---|---|
| ✅ | **Trades.** Places a real order on its own tool call. |
| 📝 | **Draft only.** Builds an order; *you* submit it in the broker's UI. The server can't. |
| 👁️ | **Read-only.** Cannot place an order. Some of these are official and deliberate. |
| 🔀 | **Both.** Ships two servers — one reads, one trades. |
| ⚠️ | **Caveat that changes the answer.** Read the page before acting. |
| 💀 | **Dead upstream.** The repo is gone; only mirrors remain. |
| ❌ | **No MCP route.** Checked, confirmed nothing exists. |

**Status — who wrote it:**

- **Official** — first-party, built or hosted by the broker.
- **Community** — a third-party repo. Not endorsed by the broker. Some are excellent.
  You are still handing broker credentials to a stranger's code.
- **Aggregator-only** — no direct server; reachable only through SnapTrade, Truthifi, etc.
- **None** — checked, confirmed nothing exists.

**"Has an MCP server" and "can trade" are different claims**, and the gap between them is
where most of the confusion lives. [Webull](brokers/webull.md) ships two servers and only
one trades. [IG](brokers/ig.md), [Upstox](brokers/upstox.md) and
[Crypto.com](brokers/crypto-com.md) are official but deliberately read-only.
[eToro](brokers/etoro.md)'s official server only reads API docs.

### Three traps worth knowing before you read the tables

> **1. official/community ≠ local/remote.** Who wrote it and where it runs are
> *independent* axes. [Alpaca](brokers/alpaca.md) and [Kraken](brokers/kraken.md) are
> official **and** local. We shipped that error ourselves — Alpaca sat under "community"
> because it runs locally, which slandered a broker who built and stands behind it.
>
> **2. A README claiming MCP doesn't make it MCP.** We verify the tool surface, not the
> marketing. [E\*TRADE](brokers/etrade.md)'s library has `place_order` but never registers
> it as an MCP tool — it *cannot* trade, whatever the listings say.
> [OANDA](brokers/oanda.md)'s only "order-capable" server has no MCP SDK in its
> dependencies at all; it's a FastAPI app claiming MCP in prose.
>
> **3. Safe defaults are not the norm.** A few ship paper/sandbox by default. One has
> [no paper mode at all](brokers/public.md). Most sit in between, and the difference is
> one env var you have to know about.

### 🛡️ Safety posture at a glance

The most useful sort order in this whole directory — what happens if you connect it and
say something careless:

| Posture | Who | What it means |
|---|---|---|
| **Cannot execute, by design** | [IBKR](brokers/interactive-brokers.md) | The server physically can't submit. No env var turns it on. |
| **Draft-first, prompt-enforced** | [Trade It](aggregators/trade-agent.md) | Must draft, show you, and be told to execute. A prompt rule, not a wall. |
| **Paper / sandbox by default** | [Alpaca](brokers/alpaca.md) · [Kraken](brokers/kraken.md) · [Webull](brokers/webull.md) | Live trading is opt-in via an env var or scope. Server-side. |
| **Live on a tool call** | [Robinhood](brokers/robinhood.md) · [Tradier](brokers/tradier.md) · most community servers | No approval step the broker enforces. Your client config is the only guardrail. |
| **Live, and no paper mode exists** | [Public.com](brokers/public.md) | Confirm-first, but every confirmation is real money. Nothing to practise on. |

**Two axes people conflate:** official/community is about *who wrote it*. local/remote
is about *where it runs*. They're independent — Alpaca and Kraken are official **and**
local. We shipped that error ourselves; see [alpaca.md](brokers/alpaca.md).

**A README claiming MCP doesn't make it MCP.** We verify the tool surface, not the
marketing. [E\*TRADE](brokers/etrade.md)'s library has `place_order` but never registers
it as an MCP tool — it cannot trade, whatever the listings say.
[OANDA](brokers/oanda.md)'s only "order-capable" server has no MCP SDK in its
dependencies at all.

**Where the landscape actually is:** crypto exchanges are well ahead of traditional
brokers. Kraken, OKX, Bybit and Gemini all ship first-party servers with real
execution. So does India (Zerodha, Upstox) and Asia broadly (Longbridge, Tiger). Most
of the big US retail names — Fidelity, Vanguard, M1, Wealthfront, Betterment — have
nothing at all.

## 🏛️ Official servers

First-party. Built or hosted by the broker themselves.

### 📈 Equities & multi-asset

| Broker | Trades? | What it trades | Type |
|---|---|---|---|
| [Alpaca](brokers/alpaca.md) | ✅ Yes | Equities, ETFs, crypto, multi-leg options, fixed income, indices. 🛡️ **Paper by default** | Local (`uvx`) |
| [Interactive Brokers](brokers/interactive-brokers.md) | 📝 Draft only | Global, multi-asset. 🛡️ The server *cannot* submit — you approve every order in IBKR's own UI | Remote |
| [Robinhood](brokers/robinhood.md) | ✅ Yes | Stocks, options, futures. Dedicated agentic account; no server-side approval step | Remote |
| [Tradier](brokers/tradier.md) | ✅ Yes | Equities + multi-leg options | Remote |
| [Webull](brokers/webull.md) | 🔀 Both | Cloud MCP is read-only; `webull-openapi-mcp` (local) trades. 🛡️ **Sandbox by default** | Remote + local |
| [TradeStation](brokers/tradestation.md) | ✅ Yes | Equities + more. Needs a paid AI tier and a $10k balance | Remote |
| [Public.com](brokers/public.md) | ✅ Yes | Stocks, ETFs, options, crypto; brokerage + IRA. ⚠️ **No paper mode — all orders live** | Local |
| [eToro](brokers/etoro.md) | ⚠️ See page | The official MCP server is **docs-only and can't trade**. Agent Portfolios trades but is **REST, not MCP** | Remote |
| [Longbridge](brokers/longbridge.md) | ✅ Yes | US + HK equities, options, warrants. ~148 tools, OAuth 2.1 | Remote |
| [Tiger Brokers](brokers/tiger-brokers.md) | ✅ Yes | Stocks, options, futures across US/HK/CN/SG | Local (`uvx`) |
| [moomoo / Futu](brokers/moomoo.md) | ✅ Yes | Full trading + data across HK/US/CN/SG/JP. ⚠️ Official route ships as **Agent Skills** (MCP-compatible tools), not a standalone MCP server | Local + OpenD |
| [Zerodha](brokers/zerodha-kite-connect.md) | ✅ Yes | Indian equities, F&O, currency, commodities. Order placement only on the self-hosted build | Remote + local |
| [Upstox](brokers/upstox.md) | 👁️ No | Read-only by design | Remote |

### ₿ Crypto

*Crypto is years ahead of traditional brokerage here — four official servers that all trade.*

| Exchange | Trades? | What it trades | Type |
|---|---|---|---|
| [Kraken](brokers/kraken.md) | ✅ Yes | Spot (1,400+ pairs), futures, tokenized stocks, forex. 🛡️ **Paper built in**; live is opt-in per scope | Local |
| [OKX](brokers/okx.md) | ✅ Yes | Spot, swap, futures, options, grid bots | Local |
| [Bybit](brokers/bybit.md) | ✅ Yes | Spot, derivatives, positions | Local |
| [Gemini](brokers/gemini.md) | ✅ Yes | Full Gemini trading API surface | Local |
| [Coinbase](brokers/coinbase.md) | ✅ Yes | ⚠️ Onchain wallets and token swaps — *not* classic spot trading | Local |
| [Crypto.com](brokers/crypto-com.md) | 👁️ No | Market data only | Remote |

### 💱 Forex / CFD

| Broker | Trades? | What it trades | Type |
|---|---|---|---|
| [cTrader (Spotware)](brokers/ctrader-spotware.md) | ✅ Yes | Whatever your cTrader broker offers — FX, indices, commodities, crypto CFDs | Remote + local |
| [ThinkMarkets](brokers/thinkmarkets.md) | ✅ Yes | CFDs on ThinkTrader — place, modify, close | Remote |
| [TraderEvolution](brokers/traderevolution.md) | ✅ Yes | 31 tools per the vendor: market/limit/stop + complex orders | Unknown |
| [IG](brokers/ig.md) | 👁️ No | Strictly read-only: prices, positions, P&L, margin | Remote |

## 👥 Community servers

Third-party. **Not endorsed by the broker.** Check the last commit before trusting one
with an account — abandonment is a live risk here, and several below are already
effectively dead.

| Broker | Trades? | What it trades | Type |
|---|---|---|---|
| [tastytrade](brokers/tastytrade.md) | ✅ Yes | Equities, options, futures, multi-leg | Local or Modal |
| [Charles Schwab](brokers/schwab.md) | ✅ Yes | Equities, options, brackets/OCO. Opt-in required | Local |
| [moomoo / Futu](brokers/moomoo.md) | ✅ Yes | `moomoo-api-mcp` — the genuine standalone MCP server. 🛡️ SIMULATE-only until you set trade creds + `unlock_trade` | Local + OpenD gateway |
| [eToro](brokers/etoro.md) | ✅ Yes | 35 tools against your own account. The only eToro route that is both MCP *and* trading-capable | Local (`npx`) |
| [Saxo Bank](brokers/saxo-bank.md) | ✅ Yes | Equities, FX, CFDs, futures, options. 🛡️ Writes are triple-gated, SIM by default | Local |
| [Angel One](brokers/angel-one.md) | ✅ Yes | Indian equities + F&O via SmartAPI | Local |
| [NinjaTrader](brokers/ninjatrader.md) | ✅ Yes | Futures, via a connected NT8 desktop install | Local (bridges to NT8) |
| [Tradovate](brokers/tradovate.md) | ✅ Yes | Futures — market/limit, configurable TIF | Local |
| [Kalshi](brokers/kalshi.md) | ✅ Yes | Event contracts — create/amend/cancel orders | Local |
| [Polymarket](brokers/polymarket.md) | ✅ Yes | Outcome tokens — market + limit orders | Local |
| [Binance](brokers/binance.md) | ✅ Yes | ⚠️ Varies by repo — no single canonical server | Local |
| [Hyperliquid](brokers/hyperliquid.md) | ✅ Yes | Perpetuals and spot on the Hyperliquid DEX | Local |
| [Fidelity](brokers/fidelity.md) | ✅ Yes | ⚠️ Drives Fidelity's website with Playwright — your password + 2FA. `dry_run` defaults true | Local |
| [Trading 212](brokers/trading212.md) | ✅ Yes | Market/limit/stop + cancel, on the official beta API. ⚠️ Quickstart config hardcodes `live` | Local |
| [XTB](brokers/xtb.md) | 💀 Dead | **Upstream repo is deleted.** Survives only as mirrors and an unaudited npm republish | Local |
| [Interactive Brokers](brokers/interactive-brokers.md) | ⚠️ Varies | Superseded by the official connector — use that instead | Local |
| [E*TRADE](brokers/etrade.md) | 👁️ No | The client library has `place_order`; the **MCP surface never registers it**. Cannot trade | Local |
| [OANDA](brokers/oanda.md) | 👁️ No | Read-only. The one "order-capable" server **isn't an MCP server at all** | Local |
| [Questrade](brokers/questrade.md) | 👁️ No | Read-only, every server found | Local |
| [Trade Republic](brokers/trade-republic.md) | 👁️ No | ⚠️ Reverse-engineers a private API; **may violate ToS** | Local |
| [Fineco](brokers/fineco.md) | 👁️ No | Read-only | Local |
| [Wealthsimple](brokers/wealthsimple.md) | 👁️ No | Public marketing content only — zero account access | Remote |
| [Deriv](brokers/deriv.md) | 👁️ No | Read-only, and barely — 2 tools | Local |

## 🔗 Aggregators

One endpoint, many brokers. **Almost all are read-only** — good for "what do I hold
everywhere," not a substitute for a broker's own trading server.

| Aggregator | Trades? | Covers |
|---|---|---|
| [Trade It](aggregators/trade-agent.md) *(was Trade Agent)* | ✅ Yes — 🛡️ draft-first, explicit confirm | Robinhood, Schwab, E*TRADE, Webull, Public, tastytrade, Coinbase, Kraken |
| [ConnectTrade](aggregators/connecttrade.md) | ✅ Yes — early access. ⚠️ Guardrails undocumented | 20+ brokers incl. Alpaca, Lightspeed, TradeZero, Webull, TradeStation |
| [SnapTrade](aggregators/snaptrade.md) | 👁️ No — read-only, stated outright | Robinhood, Schwab, Fidelity, Vanguard, E*TRADE, Alpaca, Tradier, Trading 212 |
| [Truthifi](aggregators/truthifi.md) | 👁️ No — reads only; 2 non-financial write tools | 18,000+ institutions |
| [Plaid](aggregators/plaid.md) | 👁️ No | Official, read-only account data |
| [Teller](aggregators/teller.md) | 👁️ No | Community, read-only |

Read-only is the norm for a reason. An aggregator already holds delegated credentials
to every account you've linked; giving an LLM write access *through* that layer stacks
two trust boundaries. Most vendors draw the line at reads and leave execution to the
broker.

## 🚧 Reachable only via an aggregator

No direct server, official or community.

| Broker | Route | Trading |
|---|---|---|
| [Vanguard](brokers/vanguard.md) | SnapTrade / Truthifi | ❌ None |

> Fidelity and Trading 212 used to sit here. Both were wrong — each has a direct
> community server that places real orders. They're in
> [Community servers](#-community-servers) now, with the caveats that route deserves.

## ❌ Confirmed no MCP route

Checked and found nothing. Not "unknown" — **confirmed negative**, which is the whole
point of writing them down. If your broker is here, you've saved an afternoon.

<details>
<summary><b>15 brokers with no MCP route</b> — click to expand</summary>

<br>

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

</details>

## 💻 Local vs. remote

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

## ⚠️ Before you connect one to real money

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

## 🤝 Contributing

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
