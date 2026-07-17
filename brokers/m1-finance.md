---
name: M1 Finance
region: US
status: none
trading: false
server_type: n/a
source_url: none found
last_verified: 2026-07-16
confidence: high
---

# M1 Finance

## Overview

No MCP server exists for M1 Finance, and no route to trading via AI exists. A GitHub
search for '"m1 finance" mcp' returns 0 results. M1 has no public API at all (API
trackers list 0 public APIs, and OAuth access is not offered), so there is no
first-party surface for even a DIY wrapper. Read-only account data can be reached
through generic financial-aggregator MCP servers, but these cannot place trades.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- GitHub search for '"m1 finance" mcp' returned an explicit 0 results.
- No public API — unlike the other brokers here, M1 is not even a DIY-wrapper
  candidate without resorting to unofficial routes.
- AGGREGATOR ROUTE (read-only, cannot trade): Truthifi runs a real MCP server that
  connects via Plaid/Yodlee/Morningstar ByAllAccounts and explicitly lists M1 Finance;
  it states plainly that 'Claude cannot move money, place trades, or modify any
  account settings.' BankSync (mcp.banksync.io) similarly exposes read-only
  accounts/balances/holdings/transaction and historical trade data.
- The BankSync per-institution pages are template-generated across many banks with no
  M1-specific integration detail — treat the M1 'support' claim as generic aggregator
  coverage, not a real M1 integration.
- mistermichaelll/m1financeR is an unofficial R package wrapping APEX Clearing's API
  (M1's clearing firm) — not an MCP server, and not a sanctioned route.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/search?q=%22m1+finance%22+mcp&type=repositories>
- <https://banksync.io/agent/m1-finance-with-cline>
- <https://truthifi.com/connect-hubs/claude-finance>
