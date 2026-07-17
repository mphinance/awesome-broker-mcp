---
name: Tiger Brokers
region: Asia (Singapore/HK/China) — multi-market
status: official
trading: true
server_type: local (stdio, uvx)
source_url: https://github.com/tigerfintech/openapi-python-sdk
last_verified: 2026-07-16
confidence: high
---

# Tiger Brokers

## Overview

Tiger Brokers ships an official MCP server called tigermcp, documented in their
first-party openapi-python-sdk repo and published to PyPI under TigerBrokers
authorship (openapi@itiger.com). It runs locally via uvx tigermcp and supports trading
operations against Tiger Open API, with an opt-in read-only mode via
TIGERMCP_READONLY=true. Integrates with Claude Code, Cursor and Trae.

## How to connect

```bash
uvx tigermcp — with env vars TIGEROPEN_TIGER_ID, TIGEROPEN_PRIVATE_KEY, TIGEROPEN_ACCOUNT. Set TIGERMCP_READONLY=true to disable order placement.
```

## Trading scope

Stocks, options and futures across US, HK, CN and SG markets via Tiger Open API

## Caveats

- Local stdio server, not a hosted endpoint — you run it yourself and it holds your
  Tiger private key.
- Auth is a Tiger ID + RSA private key + account number in env vars, not OAuth. Key
  material sits on the host machine.
- PyPI package is at v0.1.7 (released 2026-03-03) — early version numbering despite
  official authorship; expect API churn.
- PyPI maintainer shows as 'amoygao' with authorship credited to TigerBrokers;
  officiality is inferred from that plus the link from the official SDK repo. Strong
  but indirect signals.
- Institutional accounts additionally need TIGEROPEN_SECRET_KEY and TIGEROPEN_TOKEN.
- Do not confuse with 'Tiger MCP' from Tiger Data / TigerData (the TimescaleDB
  company) — unrelated product, appears in the same searches. Also distinct from the
  community repo luxiaolei/tiger-mcp.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/tigerfintech/openapi-python-sdk>
- <https://pypi.org/project/tigermcp/>
