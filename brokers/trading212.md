---
name: Trading 212
region: UK / EU
status: community
trading: true
server_type: local
source_url: https://github.com/RohanAnandPandit/trading212-mcp-server
last_verified: 2026-07-16
confidence: high
---

# Trading 212

## Overview

No official server, but **several direct community MCP servers exist and they place
real orders** — built on Trading 212's official public beta API (Settings → API (Beta),
Basic Auth). This is a real API-backed path, not screen-scraping.

> An earlier version of this page said "none through any existing MCP server" and filed
> Trading 212 as `aggregator-only`, reachable only via SnapTrade. That was wrong.

Two servers were read at source:

1. [`RohanAnandPandit/trading212-mcp-server`](https://github.com/RohanAnandPandit/trading212-mcp-server)
   — MIT, 42 stars, 78 commits, last push 2026-04-22, not archived, self-described
   "unofficial." `src/tools.py` registers `place_limit_order`, `place_market_order`,
   `place_stop_order`, `place_stop_limit_order`, `cancel_order`, plus pie CRUD.
2. [`KyuRish/trading212-mcp-server`](https://github.com/KyuRish/trading212-mcp-server)
   — on PyPI as `trading212-mcp-server`, last push 2026-06-17. ~32 tools including
   `place_market_order`, `place_limit_order`, `cancel_order`. Nice touch: it tags tools
   with MCP `ToolAnnotations` (`readOnlyHint` / `destructiveHint`) so clients can tell
   reads from order writes.

## How to connect

Deliberately not given as a copy-paste line. See the safety section — the published
quickstart configs are exactly the thing you should not paste.

## Trading scope

Equities and ETFs via Trading 212's API: market, limit, stop and stop-limit orders,
order cancellation, and pie management.

**Read-only alternative:** [SnapTrade](../aggregators/snaptrade.md)'s hosted MCP covers
Trading 212 and "cannot place trades, move money, or change account settings." Trading
through SnapTrade would mean hand-coding against their raw REST API — an MCP-native
path doesn't exist there.

## Safety / guardrails

> ### ⚠️ The code defaults to demo. The quickstart wires you to live.
>
> Both facts are true and they point opposite ways, so state them separately.
>
> **In code**, both servers fall back to demo when the env var is unset:
> - Rohan — `src/utils/client.py`: `os.getenv("ENVIRONMENT") or Environment.DEMO.value`
> - KyuRish — `api/client.py`: `os.getenv("T212_ENV", "demo")`, base URL
>   `https://{environment}.trading212.com/api/v0`
>
> **In practice**, KyuRish's copy-paste Claude Desktop and source-install config blocks
> both **hardcode `"ENVIRONMENT": "live"`**. Anyone following the quickstart is pointed
> at real money from the first tool call.
>
> So "defaults to demo" is true of the code and misleading about the product. Do not
> write it unqualified — we nearly did.

This is also why we read source instead of READMEs: a summary of these same READMEs
reported "live is the default," which is false in code. Both the summary and the naive
"defaults to demo" reading are wrong in different directions.

## Caveats

- Both servers are unofficial. Trading 212 does not endorse them.
- The API is itself a **public beta** — Trading 212 may change or restrict it.
- If you use these, set the environment variable **explicitly**. Do not rely on the
  fallback, and do not trust the config block in the README.

## Sources

Checked directly on 2026-07-16 (both repos cloned, client + tool registration read):

- <https://github.com/RohanAnandPandit/trading212-mcp-server>
- <https://github.com/KyuRish/trading212-mcp-server>
- <https://docs.snaptrade.com/docs/mcp-server>
