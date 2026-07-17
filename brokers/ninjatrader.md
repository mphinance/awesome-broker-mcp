---
name: NinjaTrader
region: US
status: community
trading: true
server_type: local (stdio/npx, bridges to NT8 desktop) — plus a third-party hosted remote option (CrossTrade)
source_url: https://discourse.ninjatrader.com/t/model-context-protocol-mcp/4159
last_verified: 2026-07-16
confidence: high
---

# NinjaTrader

## Overview

No official NinjaTrader MCP server exists; a user request on the NinjaTrader community
forum has no staff response. However this is the richest community ecosystem in the
cluster, with ~10 MCP repos visible in GitHub's index. The most-starred is
ozmnf4/ninjatrader-mcp (28 stars, JavaScript), which reads positions, places orders,
accesses market data and reads NinjaScript indicator values. Separately, CrossTrade
(an independent vendor, not affiliated with NinjaTrader Group) runs a production
hosted MCP server at https://app.crosstrade.io/v1/api/mcp with OAuth 2.1 scopes.

## How to connect

```bash
Community: git clone https://github.com/ozmnf4/ninjatrader-mcp && npm install, configure .env, add to Claude Code MCP config (local mode talks to NT8 desktop on port 7890; cloud mode uses the NinjaTrader Ecosystem API). Hosted: add https://app.crosstrade.io/v1/api/mcp as a remote MCP server and complete OAuth.
```

## Trading scope

Futures and other instruments tradable through a connected NinjaTrader 8 desktop
installation (CME complex: ES, NQ, MES, MNQ, CL, GC, etc.). Order placement,
modification and cancellation are supported by several servers.

## Caveats

- No official first-party MCP server. The NinjaTrader forum thread asking for MCP
  support shows no staff reply.
- ozmnf4/ninjatrader-mcp shows only 1 commit on main despite 28 stars — treat maturity
  with caution.
- Community servers bridge to the NT8 desktop app via a local add-on/port, not to a
  broker API directly. NinjaTrader must be running.
- CrossTrade is a paid third party: MCP is gated to the Elite tier (REST/WebSocket
  remain on Pro) and requires the CrossTrade Add-On v1.13.0+. It enforces OAuth scope
  at the transport — an mcp:read token cannot place an order, mcp:trade can.
- EXCLUDED AS UNVERIFIABLE: a 'schroeder247' Rust server claiming 88 tools is listed
  on LobeHub and echoed by search summaries, but the GitHub URL 404s and it does not
  appear in GitHub's repository index. Do not list it.
- Other confirmed-in-index but unfetched repos vary in quality and stars:
  Wendigooor/nt-mcp-server (C#), felipekuhn87/ninjatrader-claude-mcp-byFelipeKuhn
  (C#), WelokkDev/ninjatrader-mcp (TS), Travis-Clement-Dev/claude-ninjatrader-mcp
  (read-only order-flow bridge).

## Sources

Checked directly on 2026-07-16:

- <https://github.com/ozmnf4/ninjatrader-mcp>
- <https://github.com/search?q=ninjatrader+mcp&type=repositories>
- <https://crosstrade.io/mcp-trading/ninjatrader-mcp-setup>
- <https://discourse.ninjatrader.com/t/model-context-protocol-mcp/4159>
