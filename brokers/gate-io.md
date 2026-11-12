---
name: Gate (Gate.io)
region: Global
status: official
trading: true
server_type: remote
source_url: https://github.com/gate/gate-mcp
last_verified: 2026-11-11
confidence: medium
---

# Gate (Gate.io)

## Overview

Gate publishes an official, MIT-licensed MCP server (`gate/gate-mcp`, 45 stars, last push 2026-11-04) hosted at `api.gatemcp.ai`, split into several endpoints by function. It also ships an official CLI (`gate/gate-cli`) and a skills marketplace (`gate/gate-skills`). A local variant exists in `gate/gate-local-mcp`.

## How to connect

| Endpoint | Auth |
|---|---|
| `https://api.gatemcp.ai/mcp` | none, CEX public data and simulation |
| `https://api.gatemcp.ai/mcp/exchange` | Gate OAuth2, CEX private trading and account |
| `https://api.gatemcp.ai/mcp/dex` | Google or Gate OAuth, DEX wallet and swap |
| `https://api.gatemcp.ai/mcp/info`, `/mcp/news`, `/mcp/docs` | none, research data |

```bash
mcporter config add gate-mcp --url https://api.gatemcp.ai/mcp/exchange --auth oauth
```

Transport is Streamable HTTP with SSE fallback.

## Trading scope

Per the README: spot, futures, options and delivery orders, POV, chase, trigger and trailing orders, strategy bots, earn products, flash swap, multi-collateral loans, wallet transfers and sub-account balances, plus CFD and stock domains. The exchange endpoint's registration ceiling is stated as 310 tools, filtered by authorization and policy.

## Safety / guardrails

OAuth2 scopes gate access (`base`, `spot_trade`, `futures_trade`, `earn`, `cfd`, `stock`). The README says `base` is not read-only. The CLI supports an "Agentic subaccount" authorization flow; the skills pack says real transactions are not part of its default checks. Per-tool permissions are in the repo's `gate-exchange` docs.

## Caveats

- Live probe, 2026-11-11 (unauthenticated initialize POST, default curl user agent): `/mcp` and `/mcp/exchange` returned HTTP 503 `{"error":"mcp_disabled","message":"MCP service is temporarily disabled"}`; `/mcp/info` returned HTTP 200 (server "Gate Info", read-only research data). So the trading endpoints were switched off at probe time, despite the README. Recheck before relying on them.
- The README covers CEX, DEX, news and CFD; the DEX endpoint is on-chain and not the exchange account.
- Skills (`gate/gate-skills`, 51 stars) drive the CLI for private reads and writes; no license file detected on that repo or on `gate-cli`.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/gate/gate-mcp>
- <https://github.com/gate/gate-skills>
- <https://github.com/gate/gate-cli>
- <https://api.gatemcp.ai/mcp> (probe)
