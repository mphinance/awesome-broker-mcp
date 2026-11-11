---
name: ThinkMarkets
region: Australia / UK (global client base)
status: official
trading: true
server_type: remote (hosted, per-user generated URL)
source_url: https://www.thinkmarkets.com/en/ai-trading/chelsea-ai/
last_verified: 2026-11-11
confidence: high
---

# ThinkMarkets

## Overview

ThinkMarkets' first-party MCP integration, branded **ChelseaAI**, announced by ThinkMarkets
on 2026-06-02. It connects a ThinkTrader account (live or demo) to an MCP-compatible
assistant. With full access the AI can place, modify and close real orders; it can never
touch funds. ThinkMarkets recommends Claude and says a free Claude account can connect and
execute trades.

## How to connect

No public endpoint is documented: the connection is generated per user. In ThinkTrader:
**Settings → Connect MCP Client**, enter your ThinkTrader password, generate the connection,
then paste it into your assistant's MCP settings (Claude: Customize → Connectors → Add custom
connector). ThinkMarkets says about two minutes. Connections expire after 7 days, or after
24 hours of inactivity, and you can disconnect or change scope in account settings.

## Trading scope

CFDs on ThinkTrader (forex, indices, commodities and more): market and pending orders, close
in full or part, set or modify stop loss, take profit and trailing stops, cancel pending
orders, and read balance, equity, margin, positions, prices, instrument details and history.
Tool names visible on the product page include `partial_close_position` and
`get_account_info`.

## Safety / guardrails

- Two scopes: **read-only** (view account and market) and **full access** (adds open, amend
  and close). Changeable or revocable any time.
- No deposits, withdrawals or transfers at any level; the AI never holds your credentials.
- Acts only on your instruction in the conversation, no autonomous trading.
- Every action goes into an in-platform audit log.
- Demo accounts are supported, so you can test before connecting live.
- Permissions are per ThinkTrader account (for example demo on full access, live on
  read-only), and the scope is chosen in the assistant's connection flow. Auth is OAuth: the
  assistant gets a token, never your username or password.
- Changing scope or revoking means regenerating the configuration in **Connect MCP Client**;
  the previous configuration is invalidated immediately. Regenerate if you think a config
  leaked.
- The audit log records timestamp, action type, instrument and outcome. It does not record
  the conversation, and the AI cannot edit or delete it.
- Full access includes a single instruction to close all positions. The permissions page says
  every action requires your explicit instruction and nothing runs on a schedule or price
  trigger.

## Caveats

- **Cloudflare wall.** Every thinkmarkets.com page serves a bot challenge to curl and headless
  Chromium; these pages were read in a normal desktop browser on 2026-10-09 and again on 2026-11-11. The upstream
  check cannot watch them.
- **Contradiction on ChatGPT.** The product page's FAQ says ChelseaAI works with Claude,
  ChatGPT, Gemini and Copilot, while the same page offers a waitlist for "when ChelseaAI
  launches" on ChatGPT, Perplexity, Gemini and Cursor. Treat Claude as the only confirmed
  client. The FAQ also claims "other major assistants require a paid tier".
- ThinkTrader only. A CEO quote in trade press says it is not on MT4/MT5.
- The "26 tools" figure comes from syndicated press coverage; no first-party page read lists
  a tool count.
- A configuration is tied to an account, not to an assistant. If you paste one config into two
  assistants, both get the same scope; separate scopes per assistant are not supported.
- The terms on the permissions page make the client responsible for every action taken through
  the integration and include an indemnity in ThinkMarkets' favour. Read it before connecting
  live.
- The permissions page (read 2026-11-11) does not reproduce the earlier search-summary claim
  that "fund movements" and "autonomous trading" sit under Read-Only. It lists both as never
  exposed at any level.

## Sources

Read directly on 2026-10-09 (browser):

- <https://www.thinkmarkets.com/uk/announcements/chelseaai-trade-through-your-ai-assistant/> (dated 2026-06-02)
- <https://www.thinkmarkets.com/en/ai-trading/chelsea-ai/>

Read directly on 2026-11-11 (browser):

- <https://www.thinkmarkets.com/en/trading-academy/ai-trading/ai-account-permissions/> (published 2026-06-01)
- <https://www.thinkmarkets.com/en/ai-trading/chelsea-ai/> (re-read; FAQ and waitlist wording unchanged)

Found via search, not opened:

- <https://www.thinkmarkets.com/uk/help-centre/ai-trading/>

Press, checked directly on 2026-07-16:

- <https://www.financemagnates.com/forex/exclusive-thinkmarkets-launches-mcp-server-ai-can-execute-traders-but-not-access-funds/>
- <https://www.tradingview.com/news/financemagnates:68d0db3ca094b:0-exclusive-thinkmarkets-launches-mcp-server-ai-can-execute-trades-but-not-access-funds/>
- <https://www.universenewsnetwork.com/2026/06/02/thinkmarkets-pairs-chelseaai-with-claude-to-bring-cfd-trading-to-ai-chats/>
- <https://www.leaprate.com/technology/broker-mcp-ai-agent-trading-infrastructure-race-2026/>
