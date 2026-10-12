---
name: Public.com
region: US
status: official
trading: true
server_type: remote
source_url: https://public.com/api/docs/templates/hosted-mcp
last_verified: 2026-10-12
confidence: high
---

# Public.com

## Overview

Official **hosted** MCP server at `https://mcp.public.com/mcp`, plus an Apache-2.0
**local** server ([`publicdotcom-mcp-server`](https://github.com/PublicDotCom/publicdotcom-mcp-server),
v0.8.0, 2026-10-09) for people who would rather run it themselves. The hosted server
launched 2026-06-25 and is now the headline path: Public lists Claude, Claude Code,
ChatGPT, Codex, Perplexity, Grok and Meta Muse as supported clients.

Notable for IRA support (most brokers here only cover taxable accounts) and for letting
you open **separate brokerage accounts for AI agents** (multi-account support shipped
2026-05-20).

> ### ⚠️ There is no paper trading mode
>
> Public's docs are unambiguous: *"Placing a trade through any MCP client is a real
> order using real money in your Public account. Review all preflight details carefully
> before confirming."* Nothing here defaults to a sandbox. There is no safe way to
> "just try it" on your main account. If you want a sandbox, open a dedicated account
> and fund it with what you can afford to lose.

## How to connect

**Hosted (recommended), OAuth.** Claude on web, desktop or iOS: Settings → Connectors →
Add custom connector → paste `https://mcp.public.com/mcp` → Connect and authorize in the
browser. For Claude Code, add the connector in claude.ai first, sign in as the same
account, then run `/mcp` and select Public (authenticate there if it shows as not
authenticated).

```bash
codex mcp add public --url https://mcp.public.com/mcp   # Codex; then: codex mcp login public
```

Verified live 2026-10-12: the endpoint answers `401` with a `WWW-Authenticate` header
pointing at OAuth protected-resource metadata, which advertises scopes `trading.read`,
`trading.write`, `marketdata` and `openid`. Bearer tokens only, in the header.

Per-client auth differs: ChatGPT/Codex, Claude, Perplexity and Grok use **OAuth**;
**Meta Muse uses a Public API key** as the Bearer token (and Grok has an alternate Agent
Skill path that also takes a key). API keys are generated in Account Settings →
Security → API and are open to all Public members, no approval needed.

**Local server (still supported).** Python, `uv` or `pip install publicdotcom-mcp-server`,
configured with `PUBLIC_COM_SECRET` and `PUBLIC_COM_ACCOUNT_ID` in
`claude_desktop_config.json`. Needs a full quit and relaunch of Claude Desktop after
editing. It can also run as an HTTP server (`POST /mcp`, per-request Bearer key).
Credentials stay on your machine and calls go straight to Public's API. For an IRA, set
the account ID to the IRA's.

## Trading scope

Stocks, ETFs, options (single-leg, multi-leg, cash-settled index options such as SPX and
NDX), crypto, corporate bonds and Treasuries, fractional shares, short selling, 24/5 and
extended-hours equity sessions, margin (with an optional cash-only flag per order).
Order types: market, limit, stop, stop-limit, plus OCO, OTO and bracket orders (equities
and options). Tax-lot selection when closing positions. Brokerage, IRA and business
accounts. US markets only.

The local server exposes about 40 tools: roughly 30 read-only (quotes, chains, Greeks,
history, tax lots, bond search, preflights) and 10 write tools (`place_order`,
`place_multileg_order`, four vertical-spread helpers, `place_short_order`,
`flatten_and_go_short`, `cancel_order`, `cancel_and_replace_order`). Read tools carry
`readOnlyHint: true`; write tools do not.

**Prediction markets / event contracts are read-only over MCP.** You can browse
categories, events, YES/NO prices and bars (`get_event_*`), but the server does not place
event-contract orders. Public's prediction-markets product is a separate surface.

## Safety / guardrails

**Confirm-first, with a human gate that lives in your client, not in Public's server.**

Public's docs describe a preflight step (estimated fill cost, buying-power impact, order
type) before submission. The preflight tools are separate from the placement tools, and
nothing found in Public's docs shows the server refusing a `place_order` call that skipped
the preflight. The gate is your client's per-tool approval. ChatGPT, for instance,
requires extra approval for write actions by default and you can loosen that, so check
yours before you hand an agent a live account.

What you do get, server-side:

- **OAuth scopes** (`trading.read` / `trading.write` / `marketdata`) on the hosted server,
  so read-only access is at least expressible in the protocol. Whether the consent screen
  lets you grant read without write was **not verified**: it needs a live Public login.
- **Dedicated accounts.** Public's own safeguard story is to put automation in a separate
  brokerage account so a bad agent can only touch what you funded it with. This is the
  strongest guardrail on offer and it is on you to use it.
- Real-time trade confirmations and full order history.
- Options strategies still require your account's approval level.

Compare [IBKR](interactive-brokers.md), where the server cannot submit at all, and
[Alpaca](alpaca.md), which defaults to paper.

## Caveats

- **No paper mode.** Still the single most important fact on this page.
- **Hosted means your account data leaves Public.** Public's disclosure is blunt: once
  data is shared with your AI provider it is governed by that provider's terms; Public
  does not supervise or audit the agent; you assume all risk for trades it places and
  trades are "deemed authorized by you". The local server keeps orders off Anthropic's
  and others' infrastructure, though the model still sees whatever the tools return.
- The disclosure also says trades "may be executed by your AI agent without your direct
  input on each transaction". That is the operating model, not a bug.
- Treat API keys like passwords. The Muse path asks you to paste one into a chat.
- Public's current page for the local server (updated 2026-08-20) and the hosted docs
  describe different setups; a few older Public pages still say Claude Desktop only.
- Commission-free for individual brokerage and IRA accounts and the API; options carry
  regulatory fees. Public pays an options rebate (up to $0.10 per stock/ETF contract;
  API flow earns $0.06, or $0.10 at 10,000+ contracts a month). Per Public's own pricing
  page, not independently verified.
- Public says the individual API is for personal, non-commercial use. Builders who want
  to offer a product on top of it go through Public's partnership program, which is
  distinct from you connecting your own account.

## Sources

Checked directly on 2026-10-12:

- <https://public.com/llms.txt> (lists `/mcp-trading`, `/api`, prediction markets, and
  a Meta Muse guide; no `llms-full.txt` or `openapi.json`)
- <https://public.com/mcp-trading>
- <https://public.com/api/docs/templates/hosted-mcp> and its `claude`, `chatgpt`,
  `grok`, `meta-muse` pages
- <https://public.com/api/docs/changelog>
- <https://public.com/learn/trade-stocks-options-crypto-using-claude> (local server)
- <https://public.com/learn/how-to-trade-stocks-options-crypto-using-meta-muse>
- <https://github.com/PublicDotCom/publicdotcom-mcp-server>
- `https://mcp.public.com/.well-known/oauth-protected-resource` (live probe)

`public.com/api/docs/templates/claude-desktop-mcp` still returns 403 to automated fetch;
the pages above are the fetchable first-party sources.
