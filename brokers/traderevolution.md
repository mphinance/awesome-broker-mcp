---
name: TraderEvolution
region: Global (Dublin — B2B platform vendor licensed to brokers, banks, prop firms)
status: official
trading: true
server_type: unknown
source_url: https://traderevolution.com/platform/mcp-server/
last_verified: 2026-07-16
confidence: medium
---

# TraderEvolution

## Overview

TraderEvolution publishes a first-party MCP server page advertising 31 tools including
live order placement, and states it works with any MCP-compatible client including
Claude. Important caveat: TraderEvolution is a B2B platform vendor, not a broker you
can open an account with — the MCP server is available to platform licensees and their
users, so access depends entirely on whether your broker runs TraderEvolution and has
enabled it.

## How to connect

No install command is given here, deliberately — see Caveats. Where a route is
unmaintained, unaudited, or its upstream has disappeared, we don't hand you a
copy-paste line that connects it to your money.

## Trading scope

Per the vendor's own page: 31 tools covering market/limit/stop and complex order
placement, order modification and cancellation, positions, balances, P&L, trade
history, quotes, market depth, historical bars and option chains — scoped to whatever
the licensing broker offers.

## Caveats

- Not a retail broker — B2B only, targeting "brokers, banks, and prop trading firms".
  You cannot connect to this directly as an individual unless your broker licenses
  TraderEvolution and turns the MCP server on.
- No endpoint URL, config snippet, or setup steps are published on the vendor page. It
  only says to "connect any MCP-compatible client" and links a contact form.
- The 31-tool count and order-placement capability are the vendor's own marketing
  claims, unverified by any independent source or hands-on test.
- Trade-press reporting of a January 2026 first-party rollout was not confirmed
  against a first-party dated announcement.
- Because access is broker-gated, this entry may be practically unreachable for most
  retail users despite being "official".

## Third-party plugin found 2026-11-11

- **[dmikhailenko-hash/claude-mcp-plugin](https://github.com/dmikhailenko-hash/claude-mcp-plugin)** (0 stars, created 2026-09-03 and last pushed the same day, MIT, not archived; README and `.mcp.json` read). A Claude Code plugin whose manifest registers one remote MCP server over streamable HTTP. The owner is an unnamed individual account with no profile and 3 repos, and the repo does not say whether TraderEvolution is behind it, so **we could not confirm it is first-party or endorsed**. The README lists 25 tools: `place_order`, `modify_order`, `cancel_order`, `cancel_all_orders`, `modify_position`, `close_position`, `close_all_positions`, plus accounts, orders, positions, market data, trades, statements and risk rules (`risk_details`, `get_risk_rules_counters`). The README says auth is TraderEvolution's own OAuth sign-in with your username and password on TraderEvolution's page, and that the plugin stores no credentials.
- **Why it matters:** its `.mcp.json` points at a host on the `traderevolution.com` domain with `test` in the name and a `/traderevolution/v1/mcp` path, and the README says the URL "currently points at a test environment." That is the only endpoint evidence we have for this vendor, and it is a test environment, not something a live broker account can use. It is consistent with the vendor page's 31-tool claim only loosely (25 listed here).
- **Caution:** an unverified third-party plugin that can place and close orders. The endpoint is not published by TraderEvolution on the page we checked, so do not treat it as an official route.

## Sources

Checked directly on 2026-07-16:

- <https://traderevolution.com/platform/mcp-server/>
