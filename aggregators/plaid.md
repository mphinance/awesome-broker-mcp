---
name: Plaid
region: US / Canada / Europe
status: official
trading: false
server_type: remote
source_url: https://plaid.com/docs/resources/mcp/
last_verified: 2026-07-16
confidence: high
---

# Plaid

## Overview

Plaid ships two official, first-party MCP servers, but neither is a trading or
money-movement surface. The Dashboard MCP server is remote and Plaid-hosted at
https://api.dashboard.plaid.com/mcp/ (Streamable HTTP, OAuth) and exposes production
diagnostics and analytics: plaid_debug_item, plaid_get_link_analytics,
plaid_get_usages, plaid_list_teams, plaid_get_tools_introduction. The Plaid AI coding
toolkit is a local server for development, offering mock data generation, docs search,
Sandbox tokens, and webhook simulation.

## How to connect

```bash
Remote (Dashboard): connect an MCP client to https://api.dashboard.plaid.com/mcp/ via Streamable HTTP with OAuth. Local (dev toolkit): run from https://github.com/plaid/ai-coding-toolkit as an MCP client subprocess.
```

## Trading scope

None.

## Caveats

- Important framing for a broker directory: Plaid is not a broker and these servers do
  not trade, transfer, or move money. They are developer-experience and
  integration-diagnostics tools aimed at teams BUILDING on Plaid — not at end users
  querying their own bank accounts.
- The Dashboard server reads your own Plaid production telemetry (Items, Link funnel,
  usage metrics) under your OAuth token. It is not a route to end-user account
  balances or transactions.
- The local toolkit is Sandbox/mock-data oriented, not a production data path.
- A community server (mcp-server-plaid on PyPI, arjabbar/plaidmcp) also appeared in
  results and is distinct from the official ones. I did not verify it; do not conflate
  it with Plaid's first-party offering.
- Repo URL is derived from the docs' cited path
  (github.com/plaid/ai-coding-toolkit/tree/main/sandbox); I read it in Plaid's own
  docs but did not fetch the repo itself.

## Sources

Checked directly on 2026-07-16:

- <https://plaid.com/docs/resources/mcp/>
