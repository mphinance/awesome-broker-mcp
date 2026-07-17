---
name: Angel One (SmartAPI)
region: India
status: community
trading: true
server_type: local (stdio, self-run Python)
source_url: https://github.com/bhavesh0009/angel-one-mcp-server
last_verified: 2026-07-16
confidence: medium
---

# Angel One (SmartAPI)

## Overview

Angel One has no official MCP server. It offers SmartAPI (a plain REST/WebSocket API)
and several unofficial third-party projects wrap it as an MCP server. The one directly
verified, bhavesh0009/angel-one-mcp-server, is a small community project (7 stars, 6
commits) that can place buy/sell market, limit and stop-loss orders plus read
portfolio, market data and history, with configurable order limits and a dry-run mode.

## How to connect

```bash
git clone https://github.com/bhavesh0009/angel-one-mcp-server && pip install -r requirements.txt && pip install -e . — then set ANGEL_ONE_API_KEY, client code, password and TOTP secret in .env (PyPI package listed as 'Coming Soon', so no uvx/pip one-liner exists yet)
```

## Trading scope

Indian equities and F&O via SmartAPI (market, limit, stop-loss orders) — community
wrappers only, no official server

## Caveats

- No official Angel One MCP server exists — no first-party announcement found. This is
  a DIY-wrapper situation on top of SmartAPI.
- The verified community repo is very immature (7 stars, 6 commits) and is not
  audited. It handles live order placement with your real credentials — treat as
  unvetted.
- Requires handing the server your Angel One API key, client code, password AND TOTP
  secret — a full account credential set, not a scoped OAuth token. This is a
  materially worse security posture than Zerodha/Upstox/Longbridge OAuth.
- Major blocker: per Angel One, effective 2026-04-01, SmartAPI order execution is only
  accepted from your registered primary static IP (NSE retail algo rules). This breaks
  hosted/cloud/roaming MCP setups for order placement.
- Other community repos were referenced in search results (ameernoufil, RohanDoshi21,
  deepjyotk) but were NOT individually verified — do not treat those as confirmed to
  exist.
- No PyPI package published yet; source install only.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/bhavesh0009/angel-one-mcp-server>
- <https://www.angelone.in/news/market-updates/what-s-changing-in-angel-one-s-smartapi-access-from-april-1-2026>
