---
name: Trading 212
region: UK / EU
status: community
trading: true
server_type: local
source_url: https://github.com/RohanAnandPandit/trading212-mcp-server
last_verified: 2026-10-12
confidence: high
---

# Trading 212

## Overview

No official server, but **several direct community MCP servers exist and they place
real orders** — built on Trading 212's official public beta API (Settings → API (Beta),
Basic Auth). This is a real API-backed path, not screen-scraping.

> An earlier version of this page said "none through any existing MCP server" and filed
> Trading 212 as `aggregator-only`, reachable only via SnapTrade. That was wrong.

Two servers were read at source (re-read 2026-10-12):

1. [`RohanAnandPandit/trading212-mcp-server`](https://github.com/RohanAnandPandit/trading212-mcp-server)
   MIT, 63 stars, 112 commits, last push 2026-10-10, not archived. Substantially
   rewritten since the July check (MCP Python SDK 2.x, package layout under
   `src/trading212_mcp/`, SQLite response cache, request validation); the changelog
   still says 0.2.0 "Unreleased," so it is installed from a git checkout (or
   `pip install .`), not from a published release. 28 tools:
   `place_market_order`, `place_limit_order`, `place_stop_order`,
   `place_stop_limit_order`, `cancel_order`, pie CRUD, positions, history and
   instrument search. Tools carry MCP annotations (`read_only_hint` /
   `destructive_hint`). Quoted from its README: "Tool annotations describe effects; they
   do not implement permissions", so the real controls are your API key permissions and
   your MCP client's approval prompts.
2. [`KyuRish/trading212-mcp-server`](https://github.com/KyuRish/trading212-mcp-server)
   On PyPI as `trading212-mcp-server`, latest release v0.4.0
   (2026-08-20, also last push), 10 stars. The README advertises "32 tools," but the
   source registers 28 (`@mcp.tool` count), including `place_market_order`,
   `place_limit_order`, `place_stop_order`, `place_stop_limit_order`, `cancel_order`
   and 4 analytics tools. Nice touch: it tags tools
   with MCP `ToolAnnotations` (`readOnlyHint` / `destructiveHint`) so clients can tell
   reads from order writes.

## How to connect

Deliberately not given as a copy-paste line. See the safety section — the published
quickstart configs are exactly the thing you should not paste.

## Trading scope

Equities and ETFs via Trading 212's API: market, limit, stop and stop-limit orders,
order cancellation, and pie management. Per Trading 212's API docs, the public API
works only for **Invest and Stocks ISA** accounts (no CFD), orders execute only in the
primary account currency, and it is still labelled beta. Demo is
`https://demo.trading212.com/api/v0`, live is `https://live.trading212.com/api/v0`.
No official Trading 212 MCP server was found in its API docs (`llms.txt`); the main
site is behind a Cloudflare challenge, so its marketing pages could not be read.

**Read-only alternative:** [SnapTrade](../aggregators/snaptrade.md)'s hosted MCP covers
Trading 212 and "cannot place trades, move money, or change account settings." Trading
through SnapTrade would mean hand-coding against their raw REST API — an MCP-native
path doesn't exist there.

## Safety / guardrails

> ### ⚠️ The code defaults to demo. One server's quickstart still wires you to live.
>
> Both facts are true and they point opposite ways, so state them separately.
>
> **In code**, both servers fall back to demo when the env var is unset:
> - Rohan: `src/trading212_mcp/settings.py`: `os.getenv("ENVIRONMENT", "demo")`
>   (typed `Literal["demo", "live"]`). Its README config examples now say
>   `"ENVIRONMENT": "demo"` and tell you to start there. Its setup text also says to
>   keep credentials out of MCP client config and chat.
> - KyuRish: `api/client.py`: `environment or os.getenv("ENVIRONMENT") or
>   os.getenv("T212_ENV", "demo")`, base URL `https://{environment}.trading212.com/api/v0`
>
> **In practice**, KyuRish's copy-paste Claude Desktop and Claude Code config blocks
> still **hardcode `"ENVIRONMENT": "live"`** (README lines 76 and 117 as of v0.4.0).
> Anyone following that quickstart is pointed at real money from the first tool call.
>
> So "defaults to demo" is true of the code and misleading about KyuRish's product.
> Do not write it unqualified. No server-side switch to disable order
> placement; limit it with API key permissions.

This is also why we read source instead of READMEs: a summary of these same READMEs
reported "live is the default," which is false in code. Both the summary and the naive
"defaults to demo" reading are wrong in different directions.

## Caveats

- No server-side confirmation step on order tools was found in either source; rely on your
  client's approval prompts.
- Both servers are unofficial. Trading 212 does not endorse them.
- The API is itself a **public beta** — Trading 212 may change or restrict it.
- If you use these, set the environment variable **explicitly**. Do not rely on the
  fallback, and do not trust the config block in the README.

## Sources

Checked directly on 2026-10-12 (both repos cloned, client, settings and tool
registration read; Trading 212 API docs via `docs.trading212.com/llms.txt`, PyPI
metadata for KyuRish):

- <https://github.com/RohanAnandPandit/trading212-mcp-server>
- <https://github.com/KyuRish/trading212-mcp-server>
- <https://docs.snaptrade.com/docs/mcp-server> (not re-checked 2026-10-12)
- <https://docs.trading212.com/api>
