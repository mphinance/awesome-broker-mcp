---
name: Leverate
region: Global; vendor sells to CFD brokers and prop firms
status: official
trading: true
server_type: remote (endpoint not published)
source_url: https://leverate.com/mcp
last_verified: 2026-11-11
confidence: medium
---

# Leverate

## Overview

Broker-tech vendor with two MCP products. **MCP for Brokers** (July 2026) connects a firm's staff to its Leverate CRM, Broker Portal and trading platform data through Claude or ChatGPT, and is described as analytical, not for execution. **MCP for Traders** (announced 2026-09-16) connects one live account to an AI assistant and can place orders after trader approval. Retail traders cannot connect directly: the feature ships switched off and the broker enables it per brand in the Broker Portal.

## How to connect

No endpoint or docs published. Brokers: request a demo (first-party Spanish page says "free demo or contact the team") and connect once from Back Office settings. Traders: copy a prompt or configuration from the AI Connector section of the platform settings into the assistant (per the Leverate press release).

## Trading scope

Brokers: leads, KYC, deposits, desk activity, trades, reports, flow and exposure. Not read-only by explicit statement on the Leverate page, which only describes analytical uses; the July press says it excludes execution.

Traders: 15 tools, 10 for account and market data and 5 for trading functions. Live on Leverate's white-label platform, rolling out to the Client Portal. MT4 and MT5 versions "to follow". Live only; no demo mentioned.

## Safety / guardrails

- Orders are two-phase: the assistant restates instrument, direction, size, type, price, stops and margin effect and nothing executes until the trader approves in their AI app.
- Token is bound to one account and controlled by the trader.
- Broker controls: off by default, restrict by client group, trading terms, country or allowlist; AI orders logged in the CRM with a source flag; prop account orders pass through the same risk engine and daily loss limits.
- The assistant declines advice, recommendations and predictions.

## Caveats

- The MCP for Traders details come from a paid Leverate press release (FinanceWire, 2026-09-16) and press coverage; the first-party Leverate page opened (Spanish) covers only MCP for Brokers.
- No tool names, endpoint or auth protocol published, so nothing was probed.
- A later Leverate release adding "Benchmarks" to MCP for Brokers was seen in a search result and not opened.

## Sources

Read directly on 2026-11-11:

- <https://leverate.com/mcp>
- <https://www.finanzwire.com/press-release/leverate-launches-mcp-for-traders-to-connect-ai-assistants-with-trading-platforms-IC1DC4sZSVZ>
- <https://www.financemagnates.com/forex/technology/leverate-lets-brokers-clients-place-trades-by-chatting-with-chatgpt-or-claude/> (press)
