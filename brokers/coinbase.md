---
name: Coinbase
region: Global (crypto)
status: official
trading: true
server_type: remote + local
source_url: https://docs.cdp.coinbase.com/ai-agents/coinbase-for-agents/coinbase-mcp
last_verified: 2026-11-11
---

# Coinbase

## Overview

Coinbase now has **two separate agent products**, and the earlier version of this page
only described one of them.

1. **Coinbase for Agents ("Coinbase MCP")**: trades your actual Coinbase account (spot
   crypto, US stocks, US futures) through Advanced Trade. Remote MCP at
   `https://agents.coinbase.com/mcp` with Coinbase OAuth, or a local `coinbase` CLI with
   a CDP API key. This is the one that answers "can my agent trade my Coinbase balance."
   The earlier "this may not be the right fit for spot trading" caveat is **out of date**.
2. **CDP CLI MCP (`cdp mcp`)**: the original entry: Coinbase Developer Platform onchain
   wallets (EVM + Solana), signing, swaps. Wallet/onchain infrastructure, not the
   exchange. Still exists and unchanged in kind.

There is also a third, **Wallet MCP** (`wallet-mcp.coinbase.com`, Coinbase Wallet / Base
account: balances, send, swap, sign, x402, third-party DeFi plugins). It is documented in
the same CDP docs but was only skimmed here; not covered further.

## How to connect

**Coinbase for Agents (remote MCP).** Claude Code:

```
claude mcp add coinbase --transport http https://agents.coinbase.com/mcp
```

then `/mcp` > coinbase > Authenticate and sign in with Coinbase. On Claude web/desktop,
add a custom connector with that URL. No CDP API key is needed on the remote path. Coinbase
**allowlists clients**: supported today are ChatGPT, Grok, Grok Bot, Muse, Perplexity
Computer, Hermes, Claude, Claude Code and Codex CLI. Dynamic Client Registration and Client ID
Metadata Documents are supported, but Coinbase still approves clients by allowlist, so a
successful registration does not grant every account, scope or tool. On the approval screen you choose which
portfolios the agent can touch. An unauthenticated POST to the endpoint returns 401.

**Coinbase for Agents (local CLI).** `npm i -g @coinbase/coinbase-cli` (Node 22+), create a
CDP API key scoped to chosen portfolios with Trade and Transfer enabled, then
`coinbase env live --key-file <key.json>`. Coinbase recommends this path as the most
consistent for executing trades.

**CDP CLI MCP.** `cdp mcp` (from `@coinbase/cdp-cli`) starts a local MCP server over
**stdio**. Point an agent at `https://docs.cdp.coinbase.com/cdp-cli/skill.md` and it will
install the CLI, walk through API key creation, and verify the connection. Claude Code:
`claude mcp add --scope user --transport stdio cdp -- cdp mcp`.

## Trading scope

**Coinbase for Agents** (per the Coinbase MCP docs and agent skill): spot crypto (900+
pairs), eligible US equities (`TICKER-QUOTE` ids such as `AAPL-USD`), and US derivatives
(CFM dated futures, needs account approval, default portfolio only; futures market orders take `base_size` in contracts).
Isolated agent portfolios are spot crypto only. Orders execute
through Coinbase Advanced Trade, so Advanced Trade fees and eligibility apply.
Tool names carry a `coinbase_` prefix on the core server (for example `coinbase_portfolios_list`).
Order tools: `orders_preview`, `orders_create`, `orders_list`, `orders_get`,
`orders_fills`, `orders_edit`, `orders_cancel`, `orders_close_position`. Market and limit
orders are documented; equities regular-hours market orders only, extended sessions take
whole-share limit orders. Also portfolios (list/get/create/edit/delete), `transfer`
between your own portfolios, USDC/USD conversions, fee tier, and x402 micropayments
(USDC on Base, 5 USDC per-payment cap) for paid research data. "Coming soon" per the docs:
prediction markets and more asset classes.

**CDP CLI MCP** (`cdp mcp`): every CDP endpoint as a typed `cdp_*` tool, generated from
the OpenAPI spec: create accounts/wallets, sign messages and transactions, the
encode-sign-send pipeline, **token swaps**, smart accounts (ERC-4337), policy engine,
onramp, x402. The page no longer gives a bundled-skill count (earlier text said 14; that
number could not be re-confirmed). Closer to "AI agent with a crypto wallet" than "AI
agent trading your Coinbase portfolio."

## Safety / guardrails

**Coinbase for Agents** can place real orders. Controls Coinbase documents:

- Portfolio scoping at OAuth approval or in the API key's Accounts scope. Coinbase's
  advice is a dedicated portfolio funded only with what you will risk.
- Granular OAuth scopes advertised in the protected-resource metadata, including
  `mcp:orders:create`, `mcp:orders:delete`, `mcp:trades:create`, `mcp:transfers:create`
  and read-only scopes (`mcp:orders:read`, `mcp:portfolios:read`, `mcp:products:read`).
  A read-only grant is possible in principle; the docs tell agents not to restrict scopes
  unless asked.
- API-key Transfer permission moves funds between your own portfolios only, no external
  withdrawals.
- `orders_preview` and `client_order_id` idempotency exist but are **not forced**.
  Equity previews can be unavailable. There is no documented draft-then-approve step or
  per-order size cap. Confirmation behaviour is up to the client: Coinbase's own testing
  notes say Claude previews and asks in chat, ChatGPT creates the order in one turn, and
  some hosted high-reasoning modes draft but do not execute.
- x402 payments are irreversible; the 5 USDC per-payment cap is server-side, but any
  session or daily budget you give the agent is only a prompt instruction.

**CDP CLI MCP:** Claude Code prompts before every MCP tool call by default. Coinbase's
suggested `.claude/settings.json` auto-approves `cdp_env`, `cdp_help`, `cdp_template` and
`cdp_*_list` / `cdp_*_get`, while mutating operations (create, update, delete, sign,
send) still require confirmation. Policy-scoped delegation and KYC tie are Coinbase's
framing.

## Caveats

- Which product are you on? `agents.coinbase.com/mcp` trades your Coinbase account;
  `cdp mcp` is onchain wallet infrastructure. Different auth, different risk.
- Coinbase for Agents is new and client-allowlisted; "supported" harness list will change.
  Tool availability depends on client and account eligibility, and the dedicated ChatGPT
  trading integration does not expose x402 tools.
- Not independently tested: no live OAuth session or order was run for this check. Claims
  come from Coinbase's docs (`coinbase-mcp`, `coinbase-for-agents/skill.md`, `cdp-cli-mcp`),
  the OAuth protected-resource metadata, and an unauthenticated probe of the endpoint.
  The authoritative tool list is whatever `tools/list` returns on your connection.
- Coinbase's docs index (`llms.txt`) now also lists an **Agentic Wallet** suite (`awal` CLI, plus a
  separate Agentic Wallet MCP via `npx @coinbase/payments-mcp`) for x402 payments and, on the CLI,
  send and trade. The MCP variant only discovers and pays for services. Not covered further here.
- **Agent skills caveats (docs/skills/coinbase.md, repos read as files, nothing executed):**
  Coinbase's own `coinbase/agentic-wallet-skills` (`awal` CLI, onchain wallet, not the brokerage
  account) has **no confirmation step and no default spend cap** on `send` and `trade`: a single
  `npx awal send '$5.00' 0x...` moves real USDC at the agent's discretion. Separately, the
  community `visusnet/coinbase-mcp-server` ships a `coinbase-trading` skill that runs **fully
  autonomously** ("without confirmation"), and its `.claude/settings.json` **pre-allows**
  `create_order`, `cancel_orders`, `edit_order`, `close_position`, `commit_convert_trade`,
  `move_portfolio_funds` and other fund-moving tools, switching off Claude Code's permission
  prompt for them. Create its API key without transfer or withdraw permission.
- Aggregators that list Coinbase (Trade It and others) are a separate path from the above.

## Other repos (not endorsed by Coinbase)

READMEs read 2026-11-11; stars and pushes from the GitHub API the same day. Source code was not read.

- **[visusnet/coinbase-mcp-server](https://github.com/visusnet/coinbase-mcp-server)** (community, local HTTP server on port 3005, or `npx coinbase-mcp-server`; 7 stars, last push 2026-05-09, MIT, not archived). Places real orders: the README claims 74 tools, including create, edit, cancel and preview orders, portfolios and fund moves between them, converts, and futures and perpetuals positions, plus indicator tools. It also ships a `/trade` Claude skill (1 `SKILL.md`) that runs an autonomous trading loop. Guardrails per the README: a `dry-run` mode for the skill, a "real money" warning, and a recommendation to use read-only or test keys; no server-side order approval is described. **Caution:** it needs a Coinbase CDP API key and EC private key in a `.env` on your machine, and the skill is designed to trade unattended. Tiny, new-ish repo with a one-person maintainer.
- **[OrestisStefanou/CoinbaseMcpServer](https://github.com/OrestisStefanou/CoinbaseMcpServer)** (community, local, Python 3.13 with `uv`; 0 stars, last push 2026-08-22, **no license file**). Five tools: product search, portfolio list, portfolio breakdown, order history and `createCoinbaseOrder` (market orders only). A `READ_ONLY=true` environment variable disables the order tool, but it defaults to `false`. Credentials stay in the server environment and are not sent over MCP. **Caution:** unlicensed, zero stars, no track record, and it holds a Coinbase API key; if you try it, set `READ_ONLY=true`.
- **[rangertaha/coinbase-mcp](https://github.com/rangertaha/coinbase-mcp)** (community, local stdio Go binary; 1 star, last push 2026-07-15, MIT, not archived; the repo name is `coinbase-mcp`, not `coinbase-mcp-server`, which returns 404). Wraps the Advanced Trade API. README read 2026-11-11; source not read. Public market-data tools work with no credentials. With a CDP API key and secret it also exposes accounts, portfolios and orders, where `orders_create` (market, limit, stop-limit, bracket), edit, cancel and close-position are marked as write tools, plus `orders_preview` to simulate first. Gating per the README: `COINBASE_READONLY=true` hides every mutating tool, and a view-only CDP key (`can_trade=false`) forces the same at registration. Default is not read-only, so with a trade-enabled key the order tools are live. **Caution:** one star, one maintainer, and the key lives in environment variables or a local `.env`; use a view-only key.
- **[jramkissoon/mcp-coinbase](https://github.com/jramkissoon/mcp-coinbase)** (community, local Go binary, stdio or HTTP; 0 stars, last push 2026-09-23, Apache-2.0, not archived). **Read-only public market data only:** 6 tools (spot price, candles, L2 order book, recent trades, product list, server time). README says no authentication is required and it queries Coinbase's public REST endpoints, so no credentials are involved and it cannot touch an account. README read 2026-11-11; source not read. Useful only as a data feed, and a brand-new zero-star repo.

## Sources

Checked directly on 2026-11-11 (docs re-read; OAuth scope list and the 401 on unauthenticated POST re-confirmed unchanged):

- <https://docs.cdp.coinbase.com/ai-agents/coinbase-for-agents/coinbase-mcp> (markdown export)
- <https://docs.cdp.coinbase.com/coinbase-for-agents/skill.md>
- <https://docs.cdp.coinbase.com/get-started/tools/cdp-cli-mcp>
- <https://docs.cdp.coinbase.com/llms.txt> (found the Coinbase for Agents and Wallet MCP pages)
- <https://agents.coinbase.com/.well-known/oauth-protected-resource> (scopes)
- `POST https://agents.coinbase.com/mcp` unauthenticated returns 401
