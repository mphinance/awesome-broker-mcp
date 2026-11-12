---
name: Korea Investment & Securities (KIS)
region: South Korea (domestic stocks, futures/options, bonds; overseas stocks and futures/options via a KIS account)
status: official
trading: true
server_type: local
source_url: https://github.com/koreainvestment/open-trading-api/tree/main/MCP/Kis%20Trading%20MCP
last_verified: 2026-11-11
confidence: high
---

# Korea Investment & Securities (KIS)

## Overview

KIS publishes two MCP servers inside its Open API sample repo, `koreainvestment/open-trading-api`: **KIS Trading MCP** (calls the Open API: quotes, balances, orders) and **KIS Code Assistant MCP** (searches API docs and sample code, no account access). Both run locally. The Trading one is the broker route and can place real orders.

Official status, checked 2026-11-11:

- The GitHub account `koreainvestment` is a User account (not a verified org), but its profile reads name "KIS Developers", company "Korea investment & Securities", blog `apiportal.koreainvestment.com/intro`. The repo homepage is `https://apiportal.koreainvestment.com`.
- The KIS developer portal page `https://apiportal.koreainvestment.com/intro` links back to `github.com/koreainvestment/open-trading-api` (HTTP 200, grepped the HTML).
- The Trading MCP `LICENSE` reads "Copyright (c) 2026 Korea Investment & Securities". The npm package `@koreainvestment/kis-trading-mcp` (0.1.0, modified 2026-10-08, one maintainer `kis_openapi`) lists author "Korea Investment & Securities".
- The repo README is written by KIS and carries KIS's own liability notice.

## How to connect

Needs Node 18+, Python 3.11+ and [uv](https://docs.astral.sh/uv/). Keys come from a KIS account with Open API service enabled at `https://apiportal.koreainvestment.com/about-howto`.

```bash
claude mcp add kis-trading \
  -e KIS_APP_KEY=... -e KIS_APP_SECRET=... \
  -e KIS_PAPER_APP_KEY=... -e KIS_PAPER_APP_SECRET=... \
  -e KIS_ACCT_STOCK=... -e KIS_PAPER_STOCK=... \
  -- npx -y @koreainvestment/kis-trading-mcp
```

The `claude mcp add` form is our translation. KIS's own docs show Claude Desktop and Cursor JSON configs (`command: npx`, `args: ["-y", "@koreainvestment/kis-trading-mcp"]`, keys in `env`). The npx entry point (`bin/cli.js`) runs `uv sync`, then `uv run python server.py` with `MCP_TYPE=stdio` and `ENV` defaulting to `live`.

Other routes: Docker with SSE (`http://localhost:3000/sse`, needs `MCP_ACCESS_TOKEN`, used through `mcp-remote`), or clone and run `server.py` with uv. SSE and streamable-http refuse to start without `MCP_ACCESS_TOKEN`; stdio uses no token. The README says bind to `127.0.0.1`.

Auth: App Key and App Secret (live) plus a separate paper pair (`KIS_PAPER_APP_KEY`, `KIS_PAPER_APP_SECRET`), set as environment variables in your client config. Optional: HTS ID, account numbers (stock and futures, live and paper), product code (default `01`). The server writes a KIS config from these at startup. Account number, product code and HTS ID are injected by the server, and `base.py` overrides any value the model supplies ("LLM value ignored").

## Trading scope

**8 MCP tools**, confirmed in `server.py` (one `register()` per class) and `tools/*.py`. Each tool is a dispatcher: you call it with `api_type` and `params`. Behind them sit **166 API operations** (count from `configs/*.json`; README says 166):

| Tool | Operations |
|---|---|
| `domestic_stock` | 74 |
| `overseas_stock` | 34 |
| `domestic_futureoption` | 20 |
| `overseas_futureoption` | 19 |
| `domestic_bond` | 14 |
| `etfetn` | 2 |
| `elw` | 1 |
| `auth` | 2 (access token, websocket key) |

Every tool also takes two helper `api_type` values, `find_stock_code` and `find_api_detail`.

**Write operations** (order-placing or order-changing `api_type` values in the configs):

- `domestic_stock`: `order_cash`, `order_credit`, `order_rvsecncl`, `order_resv`, `order_resv_rvsecncl`
- `overseas_stock`: `order`, `order_rvsecncl`, `daytime_order`, `daytime_order_rvsecncl`, `order_resv`, `order_resv_ccnl` (listed as reservation order cancel)
- `domestic_futureoption`: `order`, `order_rvsecncl`
- `overseas_futureoption`: `order`, `order_rvsecncl`
- `domestic_bond`: `buy`, `sell`, `order_rvsecncl`

The rest are reads: quotes, order books, charts, rankings, balances, fills, buying power, margin. The `auth` tool issues tokens. Because the write path sits behind a generic dispatcher, MCP-level read-only filtering by tool name is not possible; all order types in a category share one tool.

Markets, per KIS's README: Korean stocks (KRX, plus NXT and unified market codes), overseas stocks (US and Asia), domestic and overseas futures/options, listed bonds, ETF/ETN, ELW.  ELW coverage here is a single volume-ranking operation.

## Safety / guardrails

- **Paper versus live is a per-call parameter.** `env_dv` is `demo` (paper) or `real` (live). `base.py` defaults it to `demo` when omitted and rejects any other value before code runs. Demo uses `ka.auth("vps")` with the paper keys; real uses `ka.auth()` with the live keys. The tool description tells the model to use `real` only when the user explicitly asks for live. That instruction is a prompt, not a code gate: the model can send `env_dv: "real"` on any call and the server will execute it if live keys are set.
- **Code-enforced** (read in `tools/base.py`): `env_dv` allow-list; function-name regex; allow-list for expressions injected from the auth environment (`ka._TRENV.*`); account number, product code and HTS ID forced to your configured values; HTTP/SSE access token; 15 second execution timeout. No order-size cap, no symbol allow-list, no confirm or draft step, no kill switch was found.
- `ENV=live` is the npx default. README marks the live key pair required and the paper pair optional (needed only for paper trading). Whether omitting live keys blocks `env_dv: real` calls was not tested.
- KIS's README asks you to practice on paper first and states all liability is the user's.

## Caveats

- **Runtime code download and execution.** Each call downloads `kis_auth.py` and the API's example file from `raw.githubusercontent.com/koreainvestment/open-trading-api/main/...`, appends a fixed runner, and executes it in a subprocess with your credentials in the environment. Your orders therefore run whatever is on `main` at that moment, not the code you reviewed at install. A compromise of that repo or the network path would execute with your keys. The README markets this as "dynamic code execution" and "isolated temp environment"; it is not a sandbox, only a temp directory.
- **License.** The repo root has no LICENSE file (GitHub API returns 404 for repo license), so the sample code there is all rights reserved by default. The Trading MCP subfolder ships an MIT `LICENSE` (Copyright 2026 KIS) and npm lists MIT. The Code Assistant MCP folder also contains a `LICENSE` file that was not opened.
- Stars 1,664; last push 2026-10-27 (GitHub API); not archived. The latest MCP commit that day fixes an order API `CANO` TypeError, so order-path bugs were live recently. npm package is 0.1.0, young.
- Docs and code comments are in Korean; the portal and account signup are Korean-oriented, and a KIS brokerage account (with Open API enabled) is required. Non-resident eligibility not checked.
- Not tested: nothing was run and no credentials were used. The tool count and write list come from reading source and config files. `order_resv_ccnl` is named "overseas reservation order cancel" in the config; names were taken as given.
- KIS also announced an in-portal "OpenAPI AI agent" and strategy playground (2026-10-23, repo README). Those are hosted portal features, not MCP servers. The repo also ships `strategy_builder/` and `backtester/`, outside this entry's scope.
- A second server, **KIS Code Assistant MCP** (`@koreainvestment/kis-code-assistant-mcp`, Python 3.12+), is read-only documentation and sample-code search (README counts 334 APIs across the portal); it has no account or order access, so it is not a trading route.

## Sources

Read via the GitHub API and npm registry on 2026-11-11:

- <https://github.com/koreainvestment/open-trading-api> (README, `MCP/README.MD`, `MCP/MCP AI 도구 연결 방법.md`)
- <https://github.com/koreainvestment/open-trading-api/tree/main/MCP/Kis%20Trading%20MCP> (Readme, `server.py`, `tools/base.py`, `module/mcp_auth.py`, `bin/cli.js`, `package.json`, `LICENSE`, `configs/*.json`)
- <https://github.com/koreainvestment/open-trading-api/tree/main/MCP/KIS%20Code%20Assistant%20MCP> (README)
- <https://apiportal.koreainvestment.com/intro>
- <https://registry.npmjs.org/@koreainvestment/kis-trading-mcp>
