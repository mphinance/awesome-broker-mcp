---
name: Kraken
region: US / Global
status: official
trading: true
server_type: local
source_url: https://docs.kraken.com/home/mcp
last_verified: 2026-11-11
confidence: high
---

# Kraken

## Overview

Kraken ships an official MCP server built into the kraken-cli binary (krakenfx GitHub
org), exposing the CLI's request/response commands as MCP tools. Since v0.5.0 (2026-10-28) the MCP
server is its own binary, `kraken-mcp`, installed next to `kraken` (the old `kraken mcp`
subcommand is gone). It serves 152 of the catalog's 188 commands in 15 groups, and
docs.kraken.com now agrees with that count. Streams, interactive commands and
`auth switch`/`auth reset` stay CLI-only. The project still calls itself alpha. It uses a service-scope model: market, account (read-only), paper
trading, workspace (paper workspaces) and feedback are enabled by default,
while trade, futures, earn, funding, and subaccount scopes must be explicitly opted
into. Only market and paper need no credentials. Dangerous tools (order placement, withdrawals, transfers,
workspace promotion) now go to the operator through MCP elicitation; `acknowledged: true`
set by the model only applies to clients that cannot show one. `--allow-dangerous` turns
the gate off.
Dangerous tools also carry the `destructive_hint` annotation. Since v0.4.1
(2026-08-07) the MCP audit stream on stderr records paper or live mode and allowlisted
financial arguments (amounts, assets, pairs, prices) for each call.

## How to connect

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/krakenfx/kraken-cli/releases/latest/download/kraken-cli-installer.sh | sh
# then:
claude mcp add --scope user kraken -- kraken-mcp -s market,account,paper
```

Or in Claude Code: `/plugin marketplace add krakenfx/kraken-cli`, then
`/plugin install kraken-cli@kraken` (the plugin asks for no API key). `kraken auth login`
(v0.5.0) signs in through the browser and saves a restricted Spot API key with no
withdrawal rights that expires after 90 days; it needs a terminal, so an agent cannot run
it, and `--read-only` makes a key that cannot trade. Gemini CLI:
`gemini extensions install https://github.com/krakenfx/kraken-cli`.

## Trading scope

Crypto spot, perpetual futures, inverse/fixed-date futures, tokenized US stocks and ETFs
via xStocks, forex, and Earn/staking. The v0.5.1 notes put live counts at 170+ xStocks,
12 forex pairs and 200+ perpetuals (up to 100x on BTC, ETH and SOL); the older per-market
figures in the previous version of this entry are superseded. Since v0.5.0,
`workspace create --mode live` and `workspace promote` work: a live workspace is a
budget-fenced allocation of the real account. Live and paper trading both supported. Per the CLI README, xStocks are not available
in the USA and availability of all products varies by jurisdiction, so the "US" in the
region field applies to the spot crypto side at best; check eligibility before relying
on xStocks or futures. Counts are from the v0.5.1 release notes; Kraken's own site was not queried for them.

## Caveats

- The `feedback` tool can upload a local file it names with no approval step (v0.5.1 docs
  warning). Drop `feedback` from `-s` for any agent that reads untrusted input.
- Live order placement is off by default: you must add the 'trade' and/or 'futures'
  service scopes explicitly. Docs say the default set (`market`, `account`, `paper`)
  is read-only for live funds; the repo README's default also includes `workspace` and
  `feedback`. `feedback` uploads text to Kraken, so drop it with an explicit `-s` list
  if that matters.
- `--allow-dangerous` removes the per-call approval gate. With `-s all` it makes
  every live order, withdrawal and transfer tool callable with no confirmation. Do not
  combine them unless Kraken API key permissions are the only control you want.
- On a client that cannot show an MCP elicitation, the `acknowledged` flag is set by the
  calling agent, not a human: a speed bump, not approval. Real limits belong on the API key (Kraken's key settings).
- The 'funding' scope permits withdrawals and transfers; scope it out unless
  deliberately needed.
- Do not confuse with KrakenD (unrelated API gateway product with its own MCP feature)
  or GitKraken — both pollute search results for 'Kraken MCP'.
- The bundled local paper-trading engine is a genuine differentiator: agents can be
  tested against live market data with no financial risk.

## Sources

Checked directly on 2026-11-11:

- <https://docs.kraken.com/home/mcp> and <https://docs.kraken.com/llms.txt> (document
  `kraken-mcp`, 152 tools, 59 agent skills)
- <https://github.com/krakenfx/kraken-cli> (v0.5.0 and v0.5.1 release notes; 809 stars; latest
  release v0.5.1 on 2026-10-29)
