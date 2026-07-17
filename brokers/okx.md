---
name: OKX
region: Global (OKX US is a separate entity)
status: official
trading: true
server_type: local
source_url: https://github.com/okx/agent-trade-kit
last_verified: 2026-07-16
confidence: high
---

# OKX

## Overview

OKX publishes the official Agent Trade Kit under the okx GitHub organization — an
MIT-licensed MCP server exposing 164 tools across the full trading lifecycle. It runs
as a local stdio process with no server or database required; API keys stay on the
user's machine and transactions are signed locally.

## How to connect

```bash
npm install -g @okx_ai/okx-trade-mcp @okx_ai/okx-trade-cli (API keys stored locally at ~/.okx/config.toml)
```

## Trading scope

Spot, swap, futures, options, and grid/trading bots. 164 tools across 11 modules
covering market data, orders, algo orders, account, earn, trading bots, event
contracts, news, and smart money signals. A --read-only flag restricts to queries.

## Caveats

- Live trading appears to be the default; the --read-only flag must be passed to
  restrict to queries.
- Distinct from OKX's separate Web3/DEX 'Onchain OS' MCP server (web3.okx.com), which
  targets DEX aggregation rather than the CEX account.
- Community alternatives exist (mbarinov/okx-mcp, esshka/okx-mcp,
  badger3000/okx-mcp-server) — prefer the okx org repo.
- The npm package @okx_ai/okx-trade-mcp was seen in search results and referenced by
  the official repo, but the npm listing itself was not fetched.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/okx/agent-trade-kit>
- <https://www.npmjs.com/package/@okx_ai/okx-trade-mcp>
