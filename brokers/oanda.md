---
name: OANDA
region: Global (US / UK / EU / APAC)
status: community
trading: false
server_type: local (stdio)
source_url: https://developer.oanda.com/
last_verified: 2026-07-16
confidence: low
---

# OANDA

> **Downgraded by our verification pass.** An initial pass claimed more than the
> evidence supported. What survived scrutiny:
>
> REFUTED on trading:true. The researcher hedged in prose ('not solidly verified',
> 'suggests it may be a REST service rather than a true MCP server') but the
> structured trading field still asserts true. I confirmed at source that it is false.
> BJLG-92/oanda-mcp-server — the ONLY order-capable option — is definitively NOT an
> MCP server. Its requirements.txt lists only fastapi==0.104.1,
> uvicorn[standard]==0.24.0, oandapyv20==0.6.3, python-dotenv, requests, six: no mcp
> SDK, no fastmcp. server.py imports 'from fastapi import FastAPI, HTTPException,
> Request' and exposes plain HTTP route decorators (@app.get('/health'),
> @app.post('/order/market'), @app.delete('/order/{order_id}')). There are no tool
> definitions, no list_tools/call_tool handlers, and no stdio transport. It is a
> FastAPI REST wrapper that merely claims MCP compatibility in its README. The genuine
> MCP server, aobathree/oanda-mcp, is confirmed read-only via its Glama listing: 'This
> is a read-only MCP server for the OANDA v20 REST API, allowing you to retrieve forex
> market data and account information without placing or managing trades' — 8 tools,
> all get_*/list_*, execution explicitly excluded for safety. Net: OANDA has ZERO MCP
> servers capable of placing an order. status:community stands (aobathree is a real
> community MCP server) and the no-official finding is correct — I fetched
> developer.oanda.com and it mentions only REST, REST-V20, FIX, MT4 and Java SDK with
> zero MCP/AI-agent references. Sourcing slip: the researcher quoted BJLG-92's
> self-description as its GitHub description field, but the API returns 'Oanda MCP
> Server for Claude' — the quote is actually from the README. Additional weakness:
> aobathree/oanda-mcp has 0 stars and was created 2026-07-14, two days before the
> research; its default branch is 'master' (not 'main'), it is not evidently published
> to PyPI, so the claimed install 'claude mcp add oanda -- oanda-mcp' likely does not
> work as written.

> ⚠️ **Low confidence.** Something here could not be pinned down — read the
> Caveats before acting on this page. We would rather say so than round up.

## Overview

OANDA has NO official MCP server — its developer portal lists only REST v20, FIX, MT4
and a Java SDK, with zero mentions of MCP or AI agents. Two small unaffiliated
community servers exist. The one I can confirm is a genuine MCP server is read-only;
the only order-capable one is a tiny, stale project whose description suggests it may
be a REST service rather than a true MCP server.

## How to connect

```bash
claude mcp add oanda -- oanda-mcp   (aobathree/oanda-mcp — read-only)
```

## Trading scope

Read-only via aobathree/oanda-mcp (live prices, candles, account summary, positions,
transactions). Order placement (market/limit), order cancellation and position closing
are claimed only by BJLG-92/oanda-mcp-server — see caveats, that claim is not solidly
verified.

## Caveats

- No official OANDA MCP server. I fetched developer.oanda.com and it mentions only
  REST/REST-V20/FIX/MT4/Java SDK — no MCP, no AI connector. An SEO blog claiming
  "OANDA has an MCP server for AI agents" is unreliable; disregard it.
- aobathree/oanda-mcp is confirmed read-only by design ("no trading capabilities ...
  for safety reasons"), and is brand new and unproven — 0 stars, last push 2026-07-15
  (one day before this research). Verified via GitHub API.
- BJLG-92/oanda-mcp-server is the ONLY order-capable option and is weak: 3 stars, 5
  commits, last push 2025-05-31 (~14 months stale). Verified to exist via GitHub API.
- Red flag on the order-capable one: it describes itself as "A REST API server for
  Oanda trading operations, deployed on Railway and compatible with Model Context
  Protocol" — that phrasing suggests it may be a REST service with claimed MCP
  compatibility rather than a genuine MCP server. Read the source before believing the
  MCP label, and never point it at a live account untested.
- Both servers are unaffiliated one-person projects with no audit and no release
  versions.
- Strong DIY-wrapper candidate: OANDA's v20 REST API is well documented and stable,
  and a purpose-built MCP wrapper would be more trustworthy than either community
  repo.

## Sources

Checked directly on 2026-07-16:

- <https://developer.oanda.com/>
- <https://glama.ai/mcp/servers/aobathree/oanda-mcp>
- <https://github.com/aobathree/oanda-mcp>
- <https://github.com/BJLG-92/oanda-mcp-server>
