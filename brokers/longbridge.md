---
name: Longbridge
region: Asia (Hong Kong/Singapore) — US & HK markets
status: official
trading: true
server_type: remote (hosted)
source_url: https://open.longbridge.com/docs/mcp
last_verified: 2026-07-16
confidence: high
---

# Longbridge

## Overview

Longbridge runs an official hosted MCP server at https://mcp.longbridge.com
(mcp.longbridge.cn for mainland China), with the source published at
github.com/longbridge/longbridge-mcp — a Rust implementation self-described as the
'Official MCP server for the Longbridge brokerage'. It is the most complete broker MCP
in this cluster: ~148 tools across ~19 categories including a Trade category with 15
tools covering order submission, cancellation and replacement. Auth is OAuth 2.1 via
browser, no manual key handling.

## How to connect

```bash
claude mcp add --transport http longbridge https://mcp.longbridge.com — then authenticate via /mcp (OAuth 2.1, no API keys to paste). Mainland China endpoint: https://mcp.longbridge.cn
```

## Trading scope

US and HK equities plus derivatives (options/warrants) — order submission,
cancellation and replacement, positions, balance, executions, margin

## Caveats

- Genuinely capable of live order placement — this is a real execution route, not a
  data-only connector. Gate accordingly.
- Tool counts vary across sources (docs say '100+ tools across six capability areas';
  the repo says '148 tools across 19 categories'). Treat the exact number as
  approximate.
- Docs do not explicitly enumerate market coverage; availability depends on 'your
  region, account level, and granted OAuth scopes'. The repo scopes it to US and HK
  markets.
- A separate community server (baranwang/longbridge) appears in search results but was
  NOT verified — prefer the official one.
- Requires a funded Longbridge account; region-gated (HK/SG entity vs mainland
  endpoint).

## Sources

Checked directly on 2026-07-16:

- <https://open.longbridge.com/docs/mcp>
- <https://github.com/longbridge/longbridge-mcp>
