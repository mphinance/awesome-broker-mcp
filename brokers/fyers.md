---
name: FYERS
region: India
status: official
trading: false
server_type: remote
source_url: https://support.fyers.in/portal/en/kb/articles/what-connections-are-available-with-fyers-mcp
last_verified: 2026-11-11
confidence: medium
---

# FYERS

## Overview

FYERS runs a hosted, read-only MCP server at `https://mcp.fyers.in/mcp`. The FYERS support article (last updated 2025-12-18) calls it a lightweight integration layer giving AI assistants read access to portfolio and market data.

## How to connect

Remote URL: `https://mcp.fyers.in/mcp`. The support page names Claude, Cursor and Windsurf as example clients and does not print the URL; the URL comes from a live probe and a secondary review (onetradejournal.com), not from the support page. Auth is a FYERS login through the Login and Logout connection tools.

## Trading scope

None. The support page states: "FYERS MCP is read-only. It does not support placing orders, modifying trades, or initiating fund transfers through AI platforms." Reads cover funds, holdings, orders, positions and trade book. Price alerts can be created, viewed and deleted, the only write-type action listed.

## Safety / guardrails

No order tools exist. Login happens in a FYERS login window; the AI does not see the password.

## Caveats

- Live probe, 2026-11-11 (unauthenticated initialize POST, default curl user agent): HTTP 200, protocol 2025-03-26, serverInfo "Fyers Trading MCP Server" 1.0.0. The name says "Trading"; the support article says read-only. No tool call was made, so the tool list is unchecked.
- License and source repository not found.

## Sources

Checked directly on 2026-11-11:

- <https://support.fyers.in/portal/en/kb/articles/what-connections-are-available-with-fyers-mcp>
- <https://mcp.fyers.in/mcp> (probe)
