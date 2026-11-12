---
name: FundedNext
region: Global online prop firm (UAE-registered operator per its footer)
status: official
trading: false
server_type: remote
source_url: https://fundednext.com/mcp
last_verified: 2026-11-11
confidence: medium
---

# FundedNext

## Overview

FundedNext's own hosted MCP server for its prop-firm customers, documented on a page at `fundednext.com/mcp`. It reads your FundedNext account data (performance, rules, payouts, KYC, rewards). It cannot place trades. The footer states the programs are simulated trading with virtual funds, so even the underlying accounts are not live brokerage accounts.

## How to connect

Page steps for Claude Desktop: Settings, Connectors (or MCP Servers on older versions), add the server URL `https://mcp.fundednext.com`, then click Allow when prompted. The page also lists Claude, ChatGPT, Cursor, Open Claw and "Others". Step 2 says to generate a one-time token under FundedNext dashboard, Connect with AI, "if required".

Endpoint probe, 2026-11-11: unauthenticated JSON-RPC `initialize` to `https://mcp.fundednext.com` returns `401` with `www-authenticate: Bearer ... resource_metadata=".../.well-known/oauth-protected-resource"`. Live and gated.

Auth: OAuth style bearer flow plus an optional dashboard token. The page says the Claude.ai web app "doesn't currently support MCP connections"; that contradicts current Claude connectors, so treat it as stale page text.

## Trading scope

None. The page: "The FundedNext connector can read your account information, but it can't place trades or move funds." Listed topic areas: account and KYC, trading and analytics, rewards and wallet, billing and plans, public plans and pricing, certificates, competitions, coupons and offers, free trial, profile. Tool names are not published.

## Safety / guardrails

- Read-only by the page's own statement. No order tool is described.
- The accounts are simulated per the legal footer (virtual funds, no real instruments, no client deposits).

## Caveats

- No tool list, no repo, no docs beyond the marketing page. Read-only claim is not verified against a live tool list because the endpoint requires auth.
- Needs a FundedNext account. Pages for CFDs and Futures are separate products; which accounts the connector covers is not stated.
- Prompt examples include "what's my biggest recurring mistake in the last 50 trades", so trade history is readable.

## Sources

Read directly on 2026-11-11: <https://fundednext.com/mcp>; endpoint probe of `https://mcp.fundednext.com`.
