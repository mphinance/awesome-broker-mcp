---
name: OKX
region: Global (OKX US is a separate entity)
status: official
trading: true
server_type: local
source_url: https://github.com/okx/agent-trade-kit
last_verified: 2026-11-11
confidence: high
---

# OKX

## Overview

OKX publishes the official Agent Trade Kit under the okx GitHub organization — an
MIT-licensed MCP server exposing 170 tools across 11 modules (README at v1.5.0, 2026-10-28) covering the full trading lifecycle. It runs
as a local stdio process with no server or database required; API keys stay on the
user's machine and transactions are signed locally.

## How to connect

```bash
npm install -g @okx_ai/okx-trade-mcp @okx_ai/okx-trade-cli (API keys stored locally at ~/.okx/config.toml)
```

## Trading scope

Spot, swap, futures, options, and grid/DCA trading bots. 170 tools across 11 modules (17
sub-modules) covering market data, orders, algo orders, account, earn, trading bots, event
contracts, news, and smart money signals. A --read-only flag restricts to queries, `--modules` filters which modules load (default
spot, swap, account), and `--profile live` is needed to include everything.

## Caveats

- Live trading appears to be the default for the modules loaded; the --read-only flag must be
  passed to restrict to queries. The earlier 164-tool figure is stale.
- Distinct from OKX's separate Web3/DEX 'Onchain OS' MCP server (web3.okx.com), which
  targets DEX aggregation rather than the CEX account.
- Community alternatives exist (mbarinov/okx-mcp, esshka/okx-mcp,
  badger3000/okx-mcp-server) — prefer the okx org repo.
- The npm package @okx_ai/okx-trade-mcp was seen in search results and referenced by
  the official repo, but the npm listing itself was not fetched.

## Related first-party repos

Read from the repo READMEs, 2026-11-11 (stars and last push as of that date). All in the `okx` org, all MIT, none archived:

- [`okx/agent-skills`](https://github.com/okx/agent-skills): 10 `SKILL.md` skills (200 stars, last push 2026-10-28) that drive the CEX account through the `okx` CLI (`@okx_ai/okx-trade-cli`) instead of MCP: auth, market data, spot/swap/futures/options/event-contract trading, portfolio, grid and DCA bots, earn, smart money. Order-capable once authed.
- [`okx/onchainos-skills`](https://github.com/okx/onchainos-skills): 7 `SKILL.md` skills (345 stars, last push 2026-11-07) for the OnchainOS DEX and wallet API: token search, market data, swaps, wallet send, DeFi, x402 payments. Its `onchainos` CLI also runs as an MCP server (`claude mcp add --scope user onchainos-cli onchainos mcp`). On-chain, not the CEX account; see the Onchain OS caveat above.
- [`okx/plugin-store`](https://github.com/okx/plugin-store): a curated plugin and skill catalog (63 `SKILL.md` files, 12 stars, last push 2026-09-29) for DeFi, trading and Web3 on Claude Code, Cursor and OpenClaw. Team-curated, external submissions closed. Mostly on-chain; not broker-specific.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/okx/agent-trade-kit>
- <https://www.npmjs.com/package/@okx_ai/okx-trade-mcp>
