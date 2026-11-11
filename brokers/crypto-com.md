---
name: Crypto.com
region: Global
status: official
trading: true
server_type: remote (hosted market-data server, read-only) and local (cdcx-cli MCP server, can trade)
source_url: https://mcp.crypto.com/docs/getting-started
last_verified: 2026-11-11
confidence: high
---

# Crypto.com

`trading: true` applies to the **local** first-party `cdcx-cli` server only. The **hosted**
server at `mcp.crypto.com/market-data/mcp` is read-only and cannot trade. Pick the route, not the
badge.

## Overview

Crypto.com operates an official, hosted remote MCP server ('Crypto Market Data by
Crypto.com', launched 31 Oct 2025) at https://mcp.crypto.com/market-data/mcp. It is
read-only market data — price quotes, order books, conversions, and candlestick
charts. It cannot place orders and does not touch account state. Free, no API key,
works with Claude and ChatGPT desktop apps. An unauthenticated `initialize` POST returns a
valid response (probed 2026-11-11; server name "Crypto.com Exchange MCP" v0.1.0, tools are
market data and widgets only).

## How to connect

```bash
Add remote MCP endpoint: https://mcp.crypto.com/market-data/mcp — no account, API key, or payment required
```

## Trading scope

Hosted server: none, market data only. Local `cdcx-cli` (below): orders, advanced orders, margin, funding, staking, bots and more, opt-in by service group.

## Caveats

- MARKET DATA ONLY — this is the key distinction. Despite being official, it has no
  order-execution or account-access capability whatsoever.
- Easiest onboarding of any entry in this cluster: remote endpoint, zero credentials,
  zero install. Good default for read-only crypto price context.
- Crypto.com's docs state the server accesses only public market data, not user
  conversations, personal information, or local machine data.
- No community server offering Crypto.com *trading* via MCP was identified during this
  research — that gap was not exhaustively searched, so treat as unknown rather than
  confirmed-absent.

## First-party trading route in a separate repo: `crypto-com/cdcx-cli`

Not covered by the hosted market-data server above; the frontmatter `trading: true` and `local` entries describe this server. Crypto.com's own GitHub organization publishes **[crypto-com/cdcx-cli](https://github.com/crypto-com/cdcx-cli)**, a CLI, terminal dashboard and **local MCP server** for the Crypto.com *Exchange* API (27 stars, created 2026-04-07, last push 2026-07-28, latest release v1.2.6 on 2026-06-18, Apache-2.0, not archived; README read 2026-11-11, source and live tool registration not checked).

- **What it is:** the README says a single binary generates 95 MCP tools from the Exchange OpenAPI spec. Run with `cdcx mcp`, or via `npx -y @cryptocom/cdcx-cli@latest mcp`. It also ships a Claude Code and Codex plugin marketplace entry and 13 agent skill files.
- **Trading:** order-capable. Service groups are opt-in: the default is `market` only, and you enable `account`, `trade`, `advanced`, `margin`, `staking`, `funding`, `fiat`, `otc`, `bot` or `stream` with `cdcx mcp config --enable ...`. Examples in the README include OTOCO bracket orders and trading bots.
- **Guardrails (README's safety model):** four tiers. Read and sensitive-read need no confirmation; mutating calls (`trade order`, `bot create`) require `acknowledged: true`; dangerous calls (`trade cancel-all`, `bot terminate`, `wallet withdraw`) stay off unless you set `--allow-dangerous`. Paper trading exists but is **CLI-only and has no MCP tools**, and there is a `uat` profile selected with `CDCX_PROFILE`. **The `acknowledged` flag is a model-supplied argument in the model's own tool call, so it is a self-attestation, not a human approval** (docs/skills/crypto-com.md: at the "autonomous" level "an autonomous agent will pass it automatically without a human prompt"). Further gaps found reading the source: the CLI path has **no prompt in JSON mode** (`-o json`, which the skills always pass), so `cdcx wallet withdraw`, `cdcx trade cancel-all` and `cdcx trade order` run with no prompt and no `--allow-dangerous` there, contrary to the skills' "CLI prompts unless `--yes`"; service-group hiding is list-only, so a model that guesses `cdcx_trade_order` can call it with only `account` enabled once credentials are loaded; unlisted private methods fall through to sensitive-read with no acknowledgement; and `--allow-dangerous` lives in a plain config file an agent with shell access can edit. cdcx has no position-size or notional limits; risk limits are the exchange's.
- **Caution:** it needs an Exchange API key and secret in your environment. Withdrawals are behind `--allow-dangerous`; leave that off. Whether a given Exchange key can be scoped to trade-only is not stated in the README.

Also first-party, skills only (no server): **[crypto-com/crypto-agent-trading](https://github.com/crypto-com/crypto-agent-trading)** (20 stars, last push 2026-08-29, Apache-2.0), 2 `SKILL.md` files for the Crypto.com App and Exchange APIs. Its App skill documents a quote-then-confirm flow with a 15 second quote expiry and an emergency API-key kill switch.

The earlier line "No community server offering Crypto.com trading via MCP was identified" is superseded: there is a first-party one. `trading` is now `true` for the local server; the hosted server stays read-only.

## Sources

Checked directly on 2026-07-16 (hosted docs) and 2026-11-11 (hosted `initialize` probe; `cdcx-cli` README and safety analysis in docs/skills/crypto-com.md):

- <https://mcp.crypto.com/docs/getting-started>
- <https://crypto.com/en/company-news/cryptocom-debuts-first-ai-llm-integrated-mcp>
