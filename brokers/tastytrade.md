---
name: tastytrade
region: US
status: official + community
trading: true
server_type: local
source_url: https://github.com/tastytrade/tastytrade-mcp
last_verified: 2026-11-11
---

# tastytrade

## Overview

tastytrade now has a **first-party** server: [`tastytrade/tastytrade-mcp`](https://github.com/tastytrade/tastytrade-mcp)
(GitHub org `tastytrade`, repo created 2026-08-14, last push 2026-11-11, 37 stars at
2026-11-11). It wraps the tastytrade open API: quotes, option chains, balances, positions,
transactions, watchlists and order entry. A longer-running community server,
[`ferdousbhai/tasty-agent`](https://github.com/ferdousbhai/tasty-agent) (v7.0.0, a TypeScript
rewrite released 2026-10-03), predates it and is covered at the bottom.

## How to connect

Clone and build; nothing is published to npm and there is no published container image:

```bash
git clone https://github.com/tastytrade/tastytrade-mcp.git
cd tastytrade-mcp && npm ci && npm run build
```

Needs Node 22+. stdio transport (a `Dockerfile` builds a local container; run it with
`docker run -i`). Auth is **environment-only**: `TASTYTRADE_CLIENT_ID`,
`TASTYTRADE_CLIENT_SECRET`, `TASTYTRADE_REFRESH_TOKEN`, from an OAuth client you create
at my.tastytrade.com → Manage → My Profile → API. There is no interactive login, on
purpose.

## Trading scope

Quotes, instruments, option chains, accounts, balances, positions, transactions,
watchlists and order entry. Five order-submitting tools, each gated on its own dry-run;
cancels are separate tools.

## Safety / guardrails

- **⚠️ The default endpoint is PRODUCTION.** With no environment set, orders are real.
  Sandbox is opt-in: `TASTYTRADE_ENV=sandbox`. The README states the reason plainly: the
  sandbox serves no market data (quote routes return 502), so a sandbox default could not
  do the job.
- A `TASTYTRADE_ENV` value the server cannot parse (a typo like `sandbx`) resolves to the
  **sandbox**, not production.
- `TASTYTRADE_READ_ONLY=1` withholds every write and destructive tool; an unreadable value
  of that variable also enables read-only.
- **Dry-run-first**: the order-submitting tools refuse to act without a token from their
  own dry-run. The token is single-use, expires in 60 seconds, and is bound to the
  arguments and the endpoint the dry-run covered.
- Pre-submit checks: per-leg quantity ceilings, a notional cap on buying-power impact,
  refusal on frozen or closing-only accounts.
- The environment is announced three ways: stderr banner, the MCP `instructions` the agent
  reads, and an `environment` field on every order result. Orders are tagged server-side
  with `source: tastytrade-mcp/<version>`.
- Credentials are only sent to recognised tastytrade hosts.

## Caveats

- The README says the dry-run token **"is not human approval"**: the same agent mints and
  redeems it. It proves arguments match, not intent.
- **Seven destructive tools act on the first call**, including the two cancels. Cancelling
  a protective stop is not safe by default.
- No caller authentication; that is why there is no HTTP/SSE transport.
- Sandbox resets every 24 hours and cannot quote. Production and sandbox credentials are
  separate OAuth applications and are not interchangeable.
- Brand new (about two months old at check time). Not tested against a live account.

### Community server: `ferdousbhai/tasty-agent`

TypeScript as of v7.0.0 (2026-10-03, a rewrite of the earlier Python 6.x): local over stdio
(`npx -y tasty-agent@7`) or as a remote server on Cloudflare Workers (bearer token via
`MCP_BEARER_TOKEN`). The Python package, Modal deployment, local SSE/HTTP transports and
`GTD` time-in-force are gone. OAuth with client secret plus personal-grant refresh token;
`TASTYTRADE_API_BASE` points at the cert sandbox. Multi-leg orders priced from a
quote-derived mid (no custom limit prices) with bid/ask guardrails and tick alignment. Per
the release notes every placement and replacement is dry-run first and any dry-run warning
refuses the order; an unanswered order or cancel reports an unknown outcome and is never
retried. The README also promotes a hosted guard-railed sibling, spicytrade
(`https://spicy.trade/mcp`), which we did not evaluate. Not endorsed by tastytrade.

## Other community repos (checked 2026-11-11)

READMEs read 2026-11-11; stars and last push as of that date. None are endorsed by tastytrade. Every MCP server below holds tastytrade OAuth secrets and a refresh token (or, for `ozmnf4`, your username and password in a `.env`), so treat the tiny ones as unvetted code with account access. We read READMEs only, not source; tool counts and gates are the repos' own claims.

| Repo | What it is | Stars, last push, license | Trading and guardrails (per README) |
|---|---|---|---|
| [`tastyware/tastytrade-cli`](https://github.com/tastyware/tastytrade-cli) | Python CLI (`tt`), not an MCP server. Options chains, portfolio, charts, watchlists | 78, 2026-08-10, MIT | Buys and sells stocks, options, futures and crypto, and replaces or cancels orders. No agent guardrails documented; disclaimer says not affiliated with tastytrade |
| [`cmike444/tastytrade-mcp`](https://github.com/cmike444/tastytrade-mcp) | TypeScript, 72 tools, stdio or Streamable HTTP with bearer token and OAuth 2.1 server. Ships 3 `SKILL.md` files | 2, 2026-05-10, no license file | `create_order`, `create_complex_order`, replace, edit, cancel, plus `order_dry_run`. Sandbox via `TASTYTRADE_SANDBOX=true`, default is production. No enforced dry-run found in README |
| [`bostrovsky/tastytrade_MCP_Server`](https://github.com/bostrovsky/tastytrade_MCP_Server) | Python, pipx install, Claude Desktop and ChatGPT bridge | 5, 2025-10-09, MIT | Market, limit, stop and stop-limit orders across stocks, options, futures and crypto. README claims two-step confirmation and audit logging; the "Security: Audited" badge is self-asserted. About 13 months since last push |
| [`walkerhughes/tastytrade-mcp`](https://github.com/walkerhughes/tastytrade-mcp) | Python, 12 curated tools | 1, 2026-08-30, no license file | `preview_order`, `place_order`, `cancel_order`. `place_order` needs `TT_ENABLE_TRADING=true` and `confirm=true` per call |
| [`a9lim/tasty-mcp`](https://github.com/a9lim/tasty-mcp) | Single-account server with a total-max-loss cap | 0, 2026-07-21, AGPL-3.0 | Hard cap on aggregate max loss (default $100, raising it needs an explicit consent flag), rejects short equity and naked short calls, closing orders always allowed, rate limit |
| [`markvalderrama001-svg/tastytrade-mcp`](https://github.com/markvalderrama001-svg/tastytrade-mcp) | 42 tools, Worker and local suites, GEX and expected-move analytics. Self-described weekend project | 0, 2026-10-26, MIT | Dry-run first, `LIVE_TRADING_ENABLED=true` operator switch, per-order `confirm="CONFIRM"`, single placement chokepoint |
| [`joncovington/tastytrade-mcp`](https://github.com/joncovington/tastytrade-mcp) | Python, OS-keyring credential storage | 0, 2026-06-24, MIT | Order tools only registered when `ENABLE_LIVE_TRADING` is set; `FORCE_DRY_RUN` and a deployed-buying-power cap available |
| [`bharadwajpro/tastytrade-mcp`](https://github.com/bharadwajpro/tastytrade-mcp) | Reusable domain packages, REST plus DxLink streaming | 0, 2026-07-25, no license file | `TT_READ_ONLY=true` is the shipped default; trading needs `TT_ENABLE_TRADING=true`, dry-run first, `confirm=true` |
| [`bholzer/tastytrade-mcp`](https://github.com/bholzer/tastytrade-mcp) | TypeScript on the official JS SDK, stdio, install via `npx` from the repo over SSH | 0, 2026-06-10, no license file | `create_order` is dry-run by default and needs `dry_run: false` to submit. Default environment is production |
| [`ozmnf4/tastytrade-mcp`](https://github.com/ozmnf4/tastytrade-mcp) | Node, username and password plus API key in `.env` | 0, 2026-04-05, no license file | Place, modify and cancel orders. No guardrails documented; `TASTYTRADE_SANDBOX=true` opt-in |

Caution: `ozmnf4` asks for your raw tastytrade password, and several others have no license file, which means no granted right to reuse the code. Prefer the first-party server above.
