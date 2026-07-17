---
name: Interactive Brokers
region: US / International
status: official
trading: true
server_type: remote
source_url: https://claude.com/connectors/interactive-brokers
last_verified: 2026-07-16
---

# Interactive Brokers

## Overview

Official, native Claude connector — launched June 1, 2026 as a partnership between
IBKR and Anthropic, distributed through Claude's certified connector marketplace.
This supersedes the community GitHub servers (`ArjunDivecha/ibkr-mcp-server` etc.)
that used to be the only option — those are local/TWS-based and unrelated to this.

## How to connect

Claude → Settings → Connectors → find **Interactive Brokers (IBKR)** → Connect →
authenticate with your standard IBKR login. Shows as a "Web" (hosted) connector, not
"Custom" — no local process, no TWS/Gateway needed.

Enterprise-level integration: no API keys or passwords are shared with or held by
Anthropic. No separate AI/agentic brokerage account required — connects to your
existing IBKR account directly.

## Trading scope

Read access: positions, cash balances, margin availability, realized/unrealized P&L,
historical transactions, option chains, risk exposures, multi-currency balances,
linked accounts, portfolio structure. Real-time price snapshots + 30-day historical
data.

Trade drafting across global markets, multiple asset classes and currencies — e.g.
"Buy 100 shares of AAPL at a limit of $200."

## Safety / guardrails

**Claude never submits orders directly to the market.** Drafted trade instructions
are sent to your IBKR account; you review and manually submit every order yourself.
IBKR's own language: *"Instructions never become orders automatically."* You also
control what the connector can access in your account.

## Caveats

- This is distinct from the older community MCP servers documented below — if you
  connected before June 2026, confirm which one you're actually on.
- Both source pages (Claude's connector listing, IBKR's AI-integrations page) describe
  capabilities but not granular setup screenshots — the flow above is inferred from
  their combined text, not a step-by-step walkthrough.

## Superseded: community MCP servers

Local-process alternatives that predate the official connector, listed for reference
if you're using one of these instead:

- [`ArjunDivecha/ibkr-mcp-server`](https://github.com/ArjunDivecha/ibkr-mcp-server) — not Claude-exclusive despite the docs' framing, works with any MCP client. Local only (TWS/IB Gateway on `127.0.0.1:7497`), 21 tools incl. place/modify/cancel orders with `MAX_ORDER_SIZE` + paper-trading-by-default safety checks. **Archived by the owner Apr 11, 2026 — read-only, no active development, 34 stars/7 commits.**
- [`code-rabi/interactive-brokers-mcp`](https://github.com/code-rabi/interactive-brokers-mcp) — OAuth or headless credential auth, full order management (market/limit/stop). Not independently verified.
- [`rcontesti/IB_MCP`](https://github.com/rcontesti/IB_MCP) — FastMCP wrapper over IBKR's Web API, containerized. Not independently verified.
- A TWS-API-based server (e.g. `haymant/tws-mcp`) — requires TWS/IB Gateway running locally. Not independently verified.
