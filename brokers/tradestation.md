---
name: TradeStation
region: US
status: official
trading: true
server_type: local (unconfirmed)
source_url: https://www.tradestation.com/platforms-and-tools/mcp/
last_verified: 2026-07-16
---

# TradeStation

## Overview

Official MCP connection released by TradeStation Securities (built by affiliate
TradeStation Technologies). Initial release targets Claude specifically, with other
AI platforms "coming soon."

## How to connect

Requires: Node.js 18+, a TradeStation developer account with API credentials, and an
active TradeStation account (simulation or live). Configuration is via environment
variables — client ID, client secret, refresh token, redirect URI — which is the
signature of a **locally-run OAuth-managing process**, not a paste-a-URL remote
connector, though this repo's docs page didn't load cleanly enough to confirm that
with certainty (marked `local (unconfirmed)` — verify before relying on it).

**Two hard gates, not just account setup:**
- **Active Claude Pro subscription required**
- **Minimum $10,000 TradeStation account balance required for MCP access**

## Trading scope

Real-time quotes, historical price data, account information, order previews, and
token management. "Order previews" specifically — not confirmed whether this means
draft-then-manually-submit (like IBKR) or direct placement; the source page returned
a 403 on fetch, so this needs a follow-up pass.

## Safety / guardrails

Not documented in what I could retrieve. The $10k balance gate and Claude Pro
requirement are themselves a form of guardrail (filters out casual/low-balance use),
but no explicit per-trade approval language was found.

## Caveats

- Primary source page (`tradestation.com/platforms-and-tools/mcp/`) returned HTTP 403
  on direct fetch — everything above is reconstructed from search-result summaries of
  that page and TradeStation's own press release, not a first-hand read. Re-verify
  before treating this as authoritative.
- Community alternative exists if the official gate (Claude Pro + $10k) doesn't fit:
  [`maven81g/tradestation_mcp`](https://github.com/maven81g/tradestation_mcp) — not
  independently verified.
