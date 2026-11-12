---
name: BingX
region: Global
status: official
trading: true
server_type: n/a
source_url: https://github.com/BingX-API/api-ai-skills
last_verified: 2026-11-11
confidence: medium
---

# BingX

## Overview

BingX publishes an official skills library for AI assistants under its API GitHub organization: `BingX-API/api-ai-skills` (19 stars, created 2026-03-06, last push 2026-11-10). 29 skill modules for Claude Code, Cursor, OpenClaw and others. No MCP server; the skills teach the agent to build signed BingX API requests. No license file was detected.

## How to connect

```bash
/plugin marketplace add BingX-API/api-ai-skills
/plugin install bingx-ai-skills
```

or `npx skills add BingX-API/api-ai-skills`. Auth: `BINGX_API_KEY` and a secret from BingX API management. Market-data skills work without a key.

## Trading scope

USDT-M perpetuals, spot, coin-margined contracts, copy trading, account and wallet (deposit, withdraw and transfer records), sub-account and API-key management, WebSocket streams and a trading-plan generator.

## Safety / guardrails

- Environments include `prod-vst`, simulated trading on `open-api-vst.bingx.com`, and `prod-live`.
- In `prod-live`, every write (orders, cancels, transfers) requires the user to type CONFIRM. The simulated environment does not.
- Keys are masked in output (first 5 and last 4 characters).

## Caveats

- Skills only; nothing to probe. Confirmation is a skill-level instruction, read from the README.
- BingX also offers CFDs; this entry covers the crypto exchange API only.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/BingX-API/api-ai-skills>
