---
name: Public.com
region: US
status: official
trading: true
server_type: local
source_url: https://public.com/api/docs/templates/claude-desktop-mcp
last_verified: 2026-07-16
---

# Public.com

## Overview

Official local MCP server for Claude Desktop. Notable for IRA support — most brokers
in this list only cover taxable brokerage accounts.

## How to connect

Local server, configured via `claude_desktop_config.json` with an API key generated
from your Public.com API settings page. Credentials stay local — the MCP server reads
them and calls the Public API directly; nothing passes through a third-party server.
Requires fully quitting and relaunching Claude Desktop after editing the config
(Cmd+Q on macOS, tray-icon quit on Windows — a background-process gotcha worth
knowing about before you assume the config didn't take).

For IRA access specifically: set `PUBLIC_COM_ACCOUNT_ID` to your IRA account ID.

## Trading scope

Stocks, ETFs, options (including cash-settled index options — SPX, NDX), crypto,
fractional shares, extended-hours trading, margin accounts. Multi-leg options orders
and preflight checks before order submission. Both brokerage and IRA account types.

## Safety / guardrails

Preflight checks run before orders are placed (per the docs), though the exact
approval semantics (auto-execute vs confirm-first) weren't detailed in what's
accessible — the actual docs page returned HTTP 403 on direct fetch.

## Caveats

- Primary source page returned 403 on direct fetch — content above is reconstructed
  from search-result summaries, not a first-hand read of the full docs.
- Commission-free for individual brokerage and IRA accounts, per Public's own
  positioning — not independently verified against a pricing page.
