---
name: Coinbase
region: Global (crypto)
status: official
trading: true
server_type: remote + local
source_url: https://docs.cdp.coinbase.com/ai-agents/coinbase-for-agents/coinbase-mcp
last_verified: 2026-10-12
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
Computer, Claude, Claude Code and Codex CLI. On the approval screen you choose which
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
(CFM dated futures, needs account approval, default portfolio only). Orders execute
through Coinbase Advanced Trade, so Advanced Trade fees and eligibility apply.
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
- Aggregators that list Coinbase (Trade It and others) are a separate path from the above.

## Sources

Checked directly on 2026-10-12:

- <https://docs.cdp.coinbase.com/ai-agents/coinbase-for-agents/coinbase-mcp> (markdown export)
- <https://docs.cdp.coinbase.com/coinbase-for-agents/skill.md>
- <https://docs.cdp.coinbase.com/get-started/tools/cdp-cli-mcp>
- <https://docs.cdp.coinbase.com/llms.txt> (found the Coinbase for Agents and Wallet MCP pages)
- <https://agents.coinbase.com/.well-known/oauth-protected-resource> (scopes)
- `POST https://agents.coinbase.com/mcp` unauthenticated returns 401
