---
name: YourBourse Trade Server
region: Global (broker-side platform for MT4, MT5 and crypto brokers)
status: official
trading: true
server_type: local
source_url: https://github.com/yourbourse/trade-server-mcp
last_verified: 2026-11-11
confidence: medium
---

# YourBourse Trade Server

## Overview

`trade-server-mcp` in the `yourbourse` GitHub org (org homepage www.yourbourse.com, "Order Execution and Reporting for MT4, MT5 and Crypto Brokers"). It is a stdio MCP server for the YourBourse Trade Server, which brokers run, so it is listed as an aggregator. Apache-2.0, version 2.2.0 (released 2026-07-02), last push 2026-10-17, 0 stars.

## How to connect

Claude Desktop: a one-click `.mcpb` extension from the repo's releases, or an `npx -y github:yourbourse/trade-server-mcp` config entry. Codex is supported through `npx`. Env vars: `YB_BASE_URL`, `YB_MODE` (`client` or `admin`), `YB_LOGIN`, `YB_PASSWORD`; admin can use `YB_API_KEY` and `YB_SECRET_KEY`. Your broker must run a YourBourse Trade Server; get the address from them. It runs locally and calls the server's API, so no hosted endpoint was probed.

## Trading scope

Client mode: 30 tools (trading, account monitoring, market data). Admin mode: 43 tools plus 4 resources for broker operations and server configuration. README lists quotes, depth, OHLCV candles and currency conversion.

## Safety / guardrails

- README: anything that moves money is a two-step plan then commit; nothing executes until you confirm.
- Order-placing requests are never retried on connection errors; bulk tools report per-item outcomes; client sessions cannot touch other accounts.
- Admin mode is server-wide: only for broker staff.

## Caveats

- Guardrail claims are from the README; source and tool registration were not read or run.
- Password-based login stored in env or extension config.
- Single-vendor, young repo, 0 stars.

## Sources

Read directly on 2026-11-11: README and repo listing of <https://github.com/yourbourse/trade-server-mcp>; GitHub org `yourbourse`.
