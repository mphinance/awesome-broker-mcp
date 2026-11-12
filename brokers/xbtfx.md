---
name: XBTFX
region: Antigua and Barbuda entity (global client base)
status: official
trading: true
server_type: local
source_url: https://github.com/xbtfx/xbtfx-mcp-server
last_verified: 2026-11-11
confidence: high
---

# XBTFX

## Overview

XBTFX's own MCP server for its Trading API, MIT licensed. It trades forex, metals, indices, crypto, stocks and energies on **XBTFX MetaTrader 5** accounts. Official: GitHub `xbtfx` is an Organization named XBTFX with blog `https://xbtfx.com`. Launched 2026-07-01 per a Chainwire press release (found via search, not opened).

## How to connect

```bash
claude mcp add xbtfx-trading -e XBTFX_API_KEY=xbtfx_live_your_key_here -- npx @xbtfx/mcp-trading
```

Auth: an account-bound API key from `console.xbtfx.com`. The README says the API is for XBTFX trading accounts only. The key prefix in the README is `xbtfx_live_`; whether demo keys exist is not stated in the README.

## Trading scope

Tools listed in the README: `get_auth_status`, `get_account`, `get_positions`, `get_orders`, `get_history`, `get_symbols` (400+), `get_symbol`, `get_quote` (max 20 symbols); and trading tools `trade`, `close_position`, `modify_position`, `close_by`, `reverse_position`, `close_all`, `close_symbol`. Tool list is from the README, not from the source's tool registration.

## Safety / guardrails

- No confirmation step documented in the README; `close_all` and `reverse_position` are single calls.
- `get_auth_status` reports key permissions, which suggests scoped keys, but the scopes are not documented in the README.
- Press coverage says the company advises testing read functions first and using limited exposure.

## Caveats

- Repo: 0 stars, last push 2026-09-25, MIT. Tool registration not verified against source.
- Live key example in docs; start with small size.
- Press detail (no API fee, Skills Hub) comes from promotional releases, not opened here.

## Sources

Read directly on 2026-11-11: <https://github.com/xbtfx/xbtfx-mcp-server> (README and org metadata via the GitHub API)
