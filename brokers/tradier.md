---
name: Tradier
region: US
status: official
trading: true
server_type: remote
source_url: https://docs.tradier.com/docs/tradier-mcp
last_verified: 2026-07-16
---

# Tradier

## Overview

Tradier's first-party, hosted MCP server — fully production, not a beta/preview.
Separate live and paper-trading tokens so you can test against a sandbox before
going live.

## How to connect

Hosted endpoint: `https://mcp.tradier.com/mcp`

**Claude web/desktop**: Settings → Connectors → Add custom connector.

**Claude Code**:
```
claude mcp add --transport http tradier https://mcp.tradier.com/mcp \
  --header "API_KEY: your_api_key_here" \
  --header "PAPER_TRADING: false"
```

Generate the API token at `https://web.tradier.com/user/api` (requires a Tradier
Brokerage account). Set `PAPER_TRADING: true` with a paper token to simulate first.

## Trading scope

21 tools: single-leg and multi-leg options orders, equity orders, advanced order
types (OCO, OTO, OTOCO), account position/balance retrieval, market data, order
cancellation.

## Safety / guardrails

None documented at the platform level — no per-trade approval step is mentioned in
Tradier's own docs; orders execute directly through the tool call. Paper trading
(`PAPER_TRADING: true`) is the recommended way to test before flipping to live.
Any "per-trade approval" behavior is a property of your client/agent setup, not
something Tradier enforces server-side.

## Caveats

- Some LLM platforms require a paid tier to use custom MCP connectors at all — noted
  directly in Tradier's docs, not specific to Tradier.
