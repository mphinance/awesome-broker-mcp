---
name: tastytrade
region: US
status: official + community
trading: true
server_type: local
source_url: https://github.com/tastytrade/tastytrade-mcp
last_verified: 2026-10-09
---

# tastytrade

## Overview

tastytrade now has a **first-party** server: [`tastytrade/tastytrade-mcp`](https://github.com/tastytrade/tastytrade-mcp)
(GitHub org `tastytrade`, repo created 2026-08-14, last push 2026-09-29, 27 stars at check
time). It wraps the tastytrade open API: quotes, option chains, balances, positions,
transactions, watchlists and order entry. A longer-running community server,
[`ferdousbhai/tasty-agent`](https://github.com/ferdousbhai/tasty-agent) (v6.0.1 as of
2026-06-01), predates it and is covered at the bottom.

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

Local (`uvx tasty-agent`) or Modal-hosted, OAuth 2.0. Multi-leg orders. Orders price off a
quote-derived mid with **no custom limit prices**, bid/ask guardrail validation and tick
alignment, dry-run mode, 2 requests/second. Not endorsed by tastytrade. Last verified
2026-07-16; not re-checked on 2026-10-09 (60+ days old, so treat as aging).
