---
name: E*TRADE
region: US
status: community
trading: true
server_type: local (remote-capable via frameworks)
source_url: https://glama.ai/mcp/servers/@davdunc/mcp_etrade
last_verified: 2026-07-16
---

# E*TRADE

## Overview

`davdunc/mcp_etrade` — community server. Supports local standalone or framework
deployment (e.g. Colosseum) marked "Remote"-capable.

## How to connect

```
uvx --from git+https://github.com/davdunc/mcp_etrade.git mcp_etrade
```
or run locally: `python -m mcp_etrade.server`

**Auth**: Full E*TRADE OAuth 1.0a flow — `get_request_token` → `get_authorization_url`
→ `get_access_token`, with token refresh/revocation.

## Trading scope

Account management, portfolio viewing, real-time quotes, option chains, watchlist
management, order placement with integrated risk validation.

## Safety / guardrails

Configurable daily risk limits (percentage of account balance), position sizing
capped at 50% of account value, automatic pre-order risk validation with detailed
messaging.

## Caveats

- **Maintenance signals are weak** — no identified maintainers, no visible release
  cadence, no recent-activity metrics found. The listing platform itself notes it
  "cannot currently be installed... due to quality assessment concerns." Treat as
  lower-confidence than the other community servers in this directory; verify current
  state before relying on it.
