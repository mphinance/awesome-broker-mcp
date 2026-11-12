---
name: Kotak Neo
region: India
status: official
trading: false
server_type: remote
source_url: https://www.kotakneo.com/platform/kotak-neo-mcp/
last_verified: 2026-11-11
confidence: high
---

# Kotak Neo

## Overview

Kotak Securities runs a hosted, read-only MCP server for Kotak Neo, documented on kotakneo.com. It connects Claude Desktop and Cursor to holdings, portfolio, order book and Kotak research. Not available on mobile. No launch date on the page.

## How to connect

Endpoint `https://neo.kotaksecurities.com/mcp-server/mcp`, wired into the client config through `npx mcp-remote`. Auth: enter your UCC (client code), open the login link, scan the QR code in the Kotak Neo app under Profile, Web Login, then confirm in chat.

## Trading scope

None. The page states "order placement and modification are not available through MCP for enhanced security reasons." The initialize response lists 13 tools: `get_login`, `validate_login`, `get_logout`, `get_quote`, `get_margin`, `get_order_book`, `get_trade_book`, `get_positions`, `get_limits`, `search_instrument`, `get_order_history`, `get_research`, `get_holdings`. All read-only by name.

## Safety / guardrails

MPIN, passwords and OTPs are never shared with the AI tool. Free for Kotak Neo users. The page carries a liability disclaimer.

## Caveats

- Live probe, 2026-11-11 (unauthenticated initialize POST, default curl user agent): HTTP 200, protocol 2025-06-18, serverInfo "Kotak Neo MCP Server" 1.0.0, tool names returned inside the initialize capabilities.
- No tool was called. License and repository not found.

## Sources

Checked directly on 2026-11-11:

- <https://www.kotakneo.com/platform/kotak-neo-mcp/>
- <https://neo.kotaksecurities.com/mcp-server/mcp> (probe)
