---
name: Trading 212
region: UK / EU
status: aggregator-only
trading: false  # no MCP path trades it — SnapTrade's raw REST API can, see below
server_type: n/a
source_url: pending
last_verified: pending
---

# Trading 212

## Overview

Covered by SnapTrade's aggregation, but trading only exists through SnapTrade's raw
REST API — **not** through SnapTrade's hosted MCP server, which is read-only for
every broker it covers, Trading 212 included.

## How to connect

Read-only: via [SnapTrade](../aggregators/snaptrade.md)'s hosted MCP.
Trading: only by building on SnapTrade's underlying REST API directly (same
DIY-wrapper pattern noted on the SnapTrade page,
[`dangelov/mcp-snaptrade`](https://github.com/dangelov/mcp-snaptrade)) — not an
MCP-native path today.

## Trading scope

None through any existing MCP server. Trading is possible only by writing custom
code against SnapTrade's API.

## Caveats

- Not independently re-verified against Trading 212's own developer resources —
  flagged `pending`.
