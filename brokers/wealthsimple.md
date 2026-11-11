---
name: Wealthsimple
region: Canada
status: community
trading: false
server_type: remote
source_url: https://github.com/lwsinclair/wealthsimple-mcp-server
last_verified: 2026-11-11
confidence: high
---

# Wealthsimple

## Overview

An MCP server named for Wealthsimple exists but it is NOT a brokerage connection.
lwsinclair/wealthsimple-mcp-server is a third-party server exposing five tools over
Wealthsimple's PUBLIC content only: search_wealthsimple_promotions,
search_wealthsimple_help_centre, get_wealthsimple_help_centre_article,
get_wealthsimple_status and get_wealthsimple_news. It reads no account data, no
positions, and places no trades. Wealthsimple publishes no official MCP server and no
public developer API.

## How to connect

```bash
Deploy to Cloudflare Workers (yarn deploy), then connect via npx mcp-remote to <your-worker>.workers.dev/sse; or run locally with yarn start at http://localhost:8787/sse
```

## Trading scope

none — public marketing/help content only, zero account access

## Caveats

- MISATTRIBUTION TRAP: mcp.so, MseeP and MCPlane list this as an official Wealthsimple
  server. It is not. The repo github.com/wealthsimple/wealthsimple-mcp-server returns
  HTTP 404, and a search of the real Wealthsimple GitHub org returns 'No repositories
  matched your search' for 'mcp'. The actual owner is the individual user lwsinclair.
- Despite the name, this gives an AI assistant zero brokerage capability — it is a
  help-centre/promotions/status wrapper. Do not file it as a broker connector.
- A second community repo, tatianathevisionary/wealthsimple-mcp, is explicitly Help
  Center only (7 tools over the public Zendesk JSON API, no auth, no account data).
- A trading-capable unofficial server exists: addu390/ws (`ws-mcp`, Rust, Apache 2.0, 1 star, last push 2026-10-03, not archived). README read 2026-11-11: it talks to the same GraphQL API as the Wealthsimple web app, `ws-mcp setup` picks a mode (`read`, `paper` or `trade`) and the accounts the agent may trade in, and it keeps an audit log. Its own README warns the API can change without notice and that automated access may conflict with Wealthsimple's terms. Not verified beyond the README; same account-termination risk as below.
- Wealthsimple offers no official developer API. Its Terms of Service PROHIBIT
  API-based trading, and the platform detects orders submitted outside official apps;
  flagged accounts receive warnings and face termination. Any 'trading MCP' built on
  unofficial GraphQL wrappers (e.g. ws-api, Wsimple) carries account-termination risk.
- No hosted/shared instance is provided — the user must self-deploy to their own
  Cloudflare Workers account.
- Read-only account data may be reachable via third-party aggregators (SnapTrade), but
  that is an aggregator route, not a Wealthsimple MCP server.

## Sources

Checked directly on 2026-11-11 (repo still lists the same five public-content tools; 0 stars, last push 2025-05-14):

- <https://github.com/lwsinclair/wealthsimple-mcp-server>
- <https://github.com/addu390/ws> (README, 2026-11-11)
- <https://github.com/orgs/wealthsimple/repositories?q=mcp>
- <https://github.com/wealthsimple/wealthsimple-mcp-server>
