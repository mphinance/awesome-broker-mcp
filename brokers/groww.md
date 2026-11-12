---
name: Groww
region: India
status: official
trading: true
server_type: remote
source_url: https://groww.in/updates/groww-mcp
last_verified: 2026-11-11
confidence: medium
---

# Groww

## Overview

Groww announced its own hosted MCP server on 2025-08-04 (groww.in/updates/groww-mcp). It connects Claude, Cursor, VS Code and similar clients to a Groww account for portfolio analysis, F&O analysis and order placement. Scope at announcement: stocks and F&O only; mutual funds, IPOs and bonds were planned.

## How to connect

Remote URL: `https://mcp.groww.in/mcp`. Claude: add a custom connector named GrowwMCP with that URL (the page says Claude Pro was required at the time), click Connect and authorize. Cursor and VS Code: save the `mcp.json` entry (Node.js needed) and complete the browser login. Auth is OAuth in the browser.

## Trading scope

The page lists "Smart Order Management": buy orders, limit orders and stop-loss orders. Sell orders need DDPI authorization. Cancel and modify are not stated on the page. A Groww engineering blog post is cited by a secondary review for the order flow; we did not read it.

## Safety / guardrails

The page says AI tools see data only with explicit permission, no background syncing, no data stored on AI servers, and outputs are not investment advice. No explicit order-confirmation step is described.

## Caveats

- Live probe, 2026-11-11 (unauthenticated initialize POST, default curl user agent): HTTP 307 to `/mcp/`, then HTTP 401 with a Bearer `invalid_token` challenge and OAuth resource metadata at `mcp.groww.in/.well-known/oauth-protected-resource`. The endpoint is live and requires OAuth. No tool was called, so tools are unverified.
- Page is 2025-08-04; limits and plan requirements may have changed. License and repository not found.

## Sources

Checked directly on 2026-11-11:

- <https://groww.in/updates/groww-mcp>
- <https://mcp.groww.in/mcp> (probe)
