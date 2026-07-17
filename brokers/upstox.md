---
name: Upstox
region: India
status: official
trading: false
server_type: remote (hosted)
source_url: https://upstox.com/developer/api-documentation/mcp-integration/
last_verified: 2026-07-16
confidence: high
---

# Upstox

## Overview

Upstox ships an official hosted MCP server at https://mcp.upstox.com/mcp, distributed
for Claude via an official plugin marketplace (upstox/upstox-plugin-marketplace). It
is explicitly read-only: it exposes holdings, orders, positions, mutual funds, account
funds, profile and market data context, but the docs state you cannot place orders,
modify positions or execute trades through the AI assistant. Auth is OAuth.

## How to connect

```bash
Claude Code: /plugin marketplace add upstox/upstox-plugin-marketplace then /plugin install upstox-mcp@upstox-plugins-official. Direct endpoint: https://mcp.upstox.com/mcp
```

## Trading scope

none — read-only by design

## Caveats

- Read-only by design — Upstox docs state plainly: 'You cannot place orders, modify
  positions, or execute trades through the AI assistant.' Not an execution route.
- Requires an active, non-dormant Upstox trading account.
- OAuth authorization must be re-done daily — Upstox requires daily reconnection for
  security, which makes it awkward for unattended/automated use.
- No first-party public GitHub repo found for the server itself; it is a hosted
  service, so the implementation is not auditable.

## Sources

Checked directly on 2026-07-16:

- <https://upstox.com/developer/api-documentation/mcp-integration/>
