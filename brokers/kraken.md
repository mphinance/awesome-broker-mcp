---
name: Kraken
region: US / Global
status: official
trading: true
server_type: local
source_url: https://docs.kraken.com/home/mcp
last_verified: 2026-07-16
confidence: high
---

# Kraken

## Overview

Kraken ships an official MCP server built into the kraken-cli binary (krakenfx GitHub
org), exposing all 151 CLI commands as MCP tools. It uses a service-scope model:
market, account (read-only), and paper trading are enabled by default with no
credentials required, while trade, futures, earn, funding, and subaccount scopes must
be explicitly opted into. Dangerous tools (order placement, withdrawals, transfers)
require the agent to pass acknowledged:true unless started with --allow-dangerous.

## How to connect

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/krakenfx/kraken-cli/releases/latest/download/kraken-cli-installer.sh | sh
# then:
claude mcp add --scope user kraken -- kraken mcp -s market,account,paper
```

## Trading scope

Crypto spot (1,400+ pairs), perpetual futures (317 contracts), inverse/fixed-date
futures (20), tokenized US stocks and ETFs via xStocks (79 assets), forex (11 fiat
pairs), and Earn/staking. Live and paper trading both supported.

## Caveats

- Live order placement is off by default — you must add the 'trade' and/or 'futures'
  service scopes explicitly.
- The 'funding' scope permits withdrawals and transfers; scope it out unless
  deliberately needed.
- Do not confuse with KrakenD (unrelated API gateway product with its own MCP feature)
  or GitKraken — both pollute search results for 'Kraken MCP'.
- The bundled local paper-trading engine is a genuine differentiator: agents can be
  tested against live market data with no financial risk.

## Sources

Checked directly on 2026-07-16:

- <https://docs.kraken.com/home/mcp>
- <https://github.com/krakenfx/kraken-cli>
