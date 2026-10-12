---
name: Kraken
region: US / Global
status: official
trading: true
server_type: local
source_url: https://docs.kraken.com/home/mcp
last_verified: 2026-10-12
confidence: high
---

# Kraken

## Overview

Kraken ships an official MCP server built into the kraken-cli binary (krakenfx GitHub
org), exposing the CLI's request/response commands as MCP tools (docs.kraken.com still says
151; the repo README and `agents/tool-catalog.json` at v0.4.1 say 174 commands in 15
groups, 41 marked dangerous; streaming groups are excluded from MCP). The project
calls itself alpha. It uses a service-scope model: market, account (read-only), paper
trading, workspace (paper workspaces) and feedback are enabled by default,
while trade, futures, earn, funding, and subaccount scopes must be explicitly opted
into. Only market and paper need no credentials. Dangerous tools (order placement, withdrawals, transfers)
require the agent to pass acknowledged:true unless started with --allow-dangerous.
Dangerous tools also carry the `destructive_hint` annotation. Since v0.4.1
(2026-08-07) the MCP audit stream on stderr records paper or live mode and allowlisted
financial arguments (amounts, assets, pairs, prices) for each call.

## How to connect

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/krakenfx/kraken-cli/releases/latest/download/kraken-cli-installer.sh | sh
# then:
claude mcp add --scope user kraken -- kraken mcp -s market,account,paper
```

## Trading scope

Crypto spot (1,400+ pairs), perpetual futures (317 contracts), inverse/fixed-date
futures (20), tokenized US stocks and ETFs via xStocks (79 assets), forex (11 fiat
pairs), and Earn/staking. Live and paper trading both supported. Per the CLI README, xStocks are not available
in the USA and availability of all products varies by jurisdiction, so the "US" in the
region field applies to the spot crypto side at best; check eligibility before relying
on xStocks or futures. Asset counts above are from the repo README (re-read 2026-10-12);
Kraken's own site was not queried for them.

## Caveats

- Live order placement is off by default: you must add the 'trade' and/or 'futures'
  service scopes explicitly. Docs say the default set (`market`, `account`, `paper`)
  is read-only for live funds; the repo README's default also includes `workspace` and
  `feedback`. `feedback` uploads text to Kraken, so drop it with an explicit `-s` list
  if that matters.
- `--allow-dangerous` removes the per-call acknowledgement gate. With `-s all` it makes
  every live order, withdrawal and transfer tool callable with no confirmation. Do not
  combine them unless Kraken API key permissions are the only control you want.
- The `acknowledged` flag is set by the calling agent, not a human. It is a speed bump,
  not a human approval. Real limits belong on the API key (Kraken's key settings).
- Kraken's docs page `docs.kraken.com/home/mcp` lags the repo (151 vs 174 commands,
  default service set).
- The 'funding' scope permits withdrawals and transfers; scope it out unless
  deliberately needed.
- Do not confuse with KrakenD (unrelated API gateway product with its own MCP feature)
  or GitKraken — both pollute search results for 'Kraken MCP'.
- The bundled local paper-trading engine is a genuine differentiator: agents can be
  tested against live market data with no financial risk.

## Sources

Checked directly on 2026-10-12:

- <https://docs.kraken.com/home/mcp> (also `llms-full.txt`; could not isolate which
  ~600-byte change triggered the upstream flag, the MCP page content matched the
  claims above)
- <https://github.com/krakenfx/kraken-cli> (README, CHANGELOG, v0.4.0 and v0.4.1 release
  notes, `agents/tool-catalog.json`; 754 stars, MIT, latest release v0.4.1 on 2026-08-07)
