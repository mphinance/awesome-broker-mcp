---
name: The5ers
region: Global online prop firm (eligibility not checked)
status: official
trading: false
server_type: remote
source_url: https://the5ers.com/the5ers-mcp/
last_verified: 2026-11-11
confidence: high
---

# The5ers

## Overview

The5ers' own hosted, read-only MCP server for its prop-trading customers, documented at `the5ers.com/the5ers-mcp/`. It reads your accounts, health, rules, payouts and profile data. The page says "The AI can analyze data, but it cannot place trades, alter settings, or initiate actions."

## How to connect

Claude: Settings, Customize, Connectors, Add, Add Custom Connector. Name `the5ers-mcp`, URL `https://mcp.the5ers.com/mcp`. The page also covers ChatGPT, VS Code, Cursor and other tools, and says some AI tools need a paid plan. It recommends "Always Allow" on the read-only tools.

Endpoint probe, 2026-11-11: an unauthenticated JSON-RPC `initialize` to `https://mcp.the5ers.com/mcp` returned `200` with server name `mcp-gw` and instructions beginning "Read-only access to the signed-in trader's own prop-trading accounts." The handshake is open; data calls are for a signed-in trader (sign-in flow not exercised).

## Trading scope

None. Documented read areas: accounts and health, account overview and balance/equity (compare up to 5 accounts), performance, risk and consistency, program progress, payouts, purchases, credits and coupons, certificates, competitions, trader profile, affiliate tools, notifications. The instructions name a `the5ers_account` tool with operations such as `list`, plus positions and orders references.

## Safety / guardrails

- Read-only boundary stated on the page and in the server instructions.
- The server instructions tell the model to check a `status` and `freshness` field, never to call data "live", and never to compute limits or eligibility itself.
- Page section "Claims Not Approved for This Release" exists; its contents were not captured.

## Caveats

- Needs a The5ers account. Tool schemas not read (needs auth); the tool count is unknown.
- Accounts are prop-firm evaluation or funded accounts; this is not a route to place orders at any broker.

## Sources

Read directly on 2026-11-11: <https://the5ers.com/the5ers-mcp/>; initialize probe of `https://mcp.the5ers.com/mcp`.
