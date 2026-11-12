---
name: Match-Trader (Match-Trade Technologies)
region: Global; vendor sells to brokers and prop firms (corporate customers only)
status: official
trading: true
server_type: remote
source_url: https://match-trader.com/mcp-for-traders/
last_verified: 2026-11-11
confidence: high
---

# Match-Trader (Match-Trade Technologies)

## Overview

A platform vendor with two first-party hosted MCP products. **MCP for Traders** connects a trader's Match-Trader account to an AI assistant and can place orders. **MCP for Brokers** gives broker and prop firm staff AI access to Manager and Admin data and is read-only today. You can only use these through a broker or prop firm that runs Match-Trader, and the broker can switch trader API access off. A retail trader cannot sign up directly. Match-Trade's site says its products are for corporate and institutional customers only.

## How to connect

MCP for Traders, endpoint `https://mcp.match-trader.com/mcp`. Create a named token in the API Access view for one trading account, pick function-group scopes and a validity of up to one year, then add the URL and an `Authorization: Bearer <token>` header to the AI app. Works with Claude, ChatGPT, Cursor and VS Code per the page.

Endpoint probe, 2026-11-11: unauthenticated JSON-RPC `initialize` returns `401` with `www-authenticate: Bearer resource_metadata=...` and "Authorization header with a Trader API Bearer token is required". Live and gated.

MCP for Brokers: no endpoint published. Users contact sales, Match-Trade confirms environments and users, then issues personal access tokens (one per person, scoped to Manager, Admin or both). Needs existing Manager or Admin access.

## Trading scope

Traders: read account, ledger, symbols, candles, open and closed positions; trade open with SL and TP, adjust SL and TP, close in full or part, place, modify and cancel pending orders. Tool names on the page include `get_account_summary`, `list_ledger`, `get_symbols`, `get_candles`, `list_positions`, `list_closed_positions`, `create_pending_order`, `cancel_pending_order`; the full list is in docs that were not opened. Match-Trader accounts only: not MT4 or MT5.

Brokers: accounts and balances, positions, orders, ledger, group and symbol config, sessions, market data, routing and risk rules. "Stage 2, Act" (group and leverage changes, routing updates) is listed as in development.

## Safety / guardrails

- Every account-changing action needs the trader's confirmation in their AI app (page wording). Whether the server enforces this or the client does is not stated.
- Tokens are bound to one account, revocable by trader, broker or Support, with per-token and per-user rate limits.
- MCP orders pass through the same validation, limits and audit trail as the Trader API; the token name appears in the close reason.
- Broker MCP runs with the permissions of the person who made the request and reads live data without copying it.

## Caveats

- Demo versus live is not stated for MCP for Traders.
- Broker docs sources conflict in press on read-only versus trade; the first-party broker page says read-only today.
- A press report says launch dates are 2026-10-05 (Brokers and Traders articles); Match-Trade's site shows 5 and 6 October news items.
- No pricing; "Contact sales".

## Sources

Read directly on 2026-11-11:

- <https://match-trader.com/mcp-for-traders/>
- <https://match-trader.com/mcp-for-brokers/>
- <https://match-trader.com/match-trader-brings-ai-assistants-directly-to-broker-data-via-model-context-protocol/>
- <https://www.financemagnates.com/forex/match-trade-adds-retail-traders-to-mcp-after-brokers-and-prop-firms/> (press)
