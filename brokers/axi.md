---
name: Axi
region: Global (not intended for Australian and New Zealand residents per the page)
status: official
trading: true
server_type: remote
source_url: https://www.axi.com/int/trading-platforms/mcp
last_verified: 2026-11-11
confidence: high
---

# Axi

## Overview

Axi's first-party hosted MCP connector for Claude, tied to MT5 accounts (live or demo). Axi is a forex and CFD broker; this is not the same firm as Axiory. The page says Claude can open, modify and close trades, with the user's approval required for every action.

## How to connect

In Claude: Customize, Connectors, Add. Name it "Axi MCP", URL `https://mcp.axi.com/mcp`, keep "Always required authentication", choose "Use Anthropic's hosted client metadata", then sign in to Axi and click Accept.

Endpoint probe, 2026-11-11: an unauthenticated JSON-RPC `initialize` POST returns `401` with `www-authenticate: Bearer` and `{"message":"Unauthorized"}`. The endpoint is live and gated.

Auth: Axi sign-in in the browser. The page says the Axi login is never shared with Claude. The FAQ says Claude Desktop connects with an API key "available from our onboarding team"; the key flow is not documented publicly.

## Trading scope

MT5 accounts only. Tools described on the page (names not published): account overview (balance, equity, margin), symbol search, live quotes, open positions with unrealised P&L, place trades (buy or sell with optional stop loss and take profit), modify stop loss and take profit, close in full or part, trade history with commission and swap, and OHLC candles.

## Safety / guardrails

- Page states every action originates from the user's instruction and needs the user's approval; Claude cannot act autonomously.
- No access to deposits, withdrawals or transfers; those stay in the Axi platform.
- Connection is encrypted and can be disconnected at any time.
- Demo and live MT5 accounts are both supported, so test on demo first.

## Caveats

- No launch date on the page. Trade press places the launch in October 2026; not opened for this entry.
- "Eligible client" is not defined, and no supported-region list is given for the connector.
- Whether the approval step is enforced server-side or by the Claude client is not stated.
- A free Claude plan allows one custom connector; more need a paid plan (per the page).
- A trade-press report quotes an Axi employee saying ATP (Axi's own platform) and other chatbots are next; unverified here.
- No tool names or tool count published; the tool list above is the page's prose.

## Sources

Read directly on 2026-11-11:

- <https://www.axi.com/int/trading-platforms/mcp>

Found via search, not opened: <https://www.axi.com/int/blog/company-news/axi-launches-mcp-integration-mt5-claude>. Axi help article `help.axi.com/hc/en-us/articles/47483936524953` returned 404.
