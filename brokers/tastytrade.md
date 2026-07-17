---
name: tastytrade
region: US
status: community
trading: true
server_type: local (stdio) or remote (Modal-hosted option)
source_url: https://github.com/ferdousbhai/tasty-agent
last_verified: 2026-07-16
---

# tastytrade

## Overview

`ferdousbhai/tasty-agent` — **confirmed as the current maintained repo** (105
commits, 80 stars, latest release v6.0.1 dated June 1 2026).

## How to connect

Three deployment options:
- **Local (stdio)**: `uvx tasty-agent`
- **Remote (Modal-hosted)**: cloud deployment with proxy auth headers
- **Programmatic**: Python client for direct tool invocation

**Auth**: OAuth 2.0 — client secret, refresh token, account ID. Create an OAuth
application in the tastytrade dashboard and generate a "Personal OAuth Grant" first.

## Trading scope

Multi-leg orders. Equities/options actions: Buy to Open, Buy to Close, Sell to Open,
Sell to Close. Futures: Buy or Sell.

## Safety / guardrails

- Orders price off quote-derived mid only — **no custom limit prices**, which caps
  how far off-market an order can be placed.
- Bid/ask guardrail validation and broker tick-size alignment checks before
  submission.
- Dry-run mode available.
- Rate-limited to 2 requests/second.

## Caveats

- None found — this one's cleanly documented and actively maintained relative to the
  rest of the community tier.
