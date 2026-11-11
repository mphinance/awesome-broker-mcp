---
name: Robinhood
region: US
status: official
trading: true
server_type: remote
source_url: https://robinhood.com/us/en/support/articles/onboarding-an-external-agent/
last_verified: 2026-11-11
---

# Robinhood

## Overview

Robinhood's first-party Trading MCP, part of **Robinhood Agents** (the product was
"Agentic Trading"; `/us/en/agentic-trading/` now 301-redirects to
[`/us/en/agents/`](https://robinhood.com/us/en/agents/)). Two separate things live under
that roof:

- **Built-in agents**: you build an agent inside the Robinhood mobile app. Not MCP.
- **External agents via the Trading MCP**: your own Claude, ChatGPT, Codex, Cursor etc.
  connect to Robinhood. This is the part this directory tracks.

Trades execute in a **dedicated "MCP account"** (Robinhood also calls it the agentic
account), never your primary account.

## How to connect

MCP endpoint: `https://agent.robinhood.com/mcp/trading` (a POST `initialize` returns 401,
i.e. live and behind OAuth).

**Claude Code**:
```
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```
then `/mcp` → `robinhood-trading` → authenticate.

**Claude Desktop**: Settings → Connectors → Add custom connector → paste the URL → OAuth.

Robinhood's support article also documents ChatGPT (Developer Mode), Codex, Codex CLI
(`codex mcp add robinhood-trading --url ...`), Cursor and Grok, and says Perplexity,
OpenClaw, Replit, AWS Quick, Poke and any localhost platform work with the same URL.

**Account setup**: you need a primary individual investing account in good standing.
Authenticating triggers onboarding that opens the MCP account (a self-directed
individual account; the 10-account self-directed cap includes it). The agent cannot open
it for you.

## Trading scope

Per Robinhood's *Trading with your agent* article: **long equities, options and crypto
orders**. Order types: market (share-based), market (dollar-based), limit, stop limit,
stop market. The article states agents **cannot place multi-leg options orders** (do
those manually in the app). The tool list, now expanded on the page (read 2026-11-11),
has about 94 tool names in these groups: account/portfolio, watchlist, market data,
equities (`review_equity_order`, `place_equity_order`, `cancel_equity_order`), options
(`review_option_order`, `place_option_order`, `exercise_option`), crypto
(`preview_crypto_order`, `place_crypto_order`), scanner, alerts, advanced orders
(`place_advanced_order`, `review_advanced_order`; the page does not say what an
"advanced order" is) and Legend charting. Each table marks built-in vs external agent
availability, and a few rows (equity news, earnings transcript, Legend tools) are
marked for only one column; I could not tell which from the extracted text.
**Futures are not listed.** Crypto additionally requires a
Robinhood Crypto account matching your MCP account and acceptance of the updated crypto
agreement; the agent cannot open one.

Trades are confined to the MCP account. Reads are **not**: the agent gets read access to
*all* your Robinhood accounts, including account numbers, positions, balances and full
order history.

## Safety / guardrails

- **Trade approvals** (agent proposes, you place it in the app): **on by default for
  built-in agents, off by default for MCP accounts.** The article now carries a note
  that trade approvals are "still rolling out for MCP accounts" and "not all customers
  have access." Tools `get_trade_approvals`, `decline_trade_approval` and
  `get_trade_approval_setting` exist in the tool list. The marketing page says "on by
  default"; the support article says that applies to built-in agents only. For an
  external agent you must turn it on yourself: Agent Settings → Safety Controls.
  Even with it off, Robinhood says "certain trades may still require your approval."
- Dedicated, separately funded MCP account
- Disconnect anytime from the app (unverified: not stated on the agents page, onboarding or
  trading articles re-read 2026-11-11; the onboarding article only describes disconnect and
  reconnect as a troubleshooting step)
- Notification on every trade (unverified: absent from all pages read 2026-11-11; orders do
  appear in Activity and order history)

## Caveats

- Robinhood's own disclosure (on the agents page, not the support articles): *"Robinhood does not control, supervise, monitor,
  recommend, or audit these AI agents."* Full responsibility sits with the user.
- Read scope is wider than trade scope: connecting an external agent exposes your other
  accounts' numbers and history to that agent and its AI provider.
- Built-in agents reportedly have their own token billing ($5 starting balance, then prepaid) and
  Agent Apps subscriptions, applying only to Robinhood-hosted agents, not MCP. Unverified: the
  agents page and onboarding article read 2026-11-11 only link to "token usage billing" and
  "agent apps" articles without figures.
  "Agent Loops" (scheduled continuous trading) is marked "Coming soon."
- Tool names were read from the support page on 2026-11-11, but parameters were not.
  Not tested with a live account.
- Crypto via agent is unavailable in some states including New York. Agents can trade
  crypto but cannot transfer, stake or lend it (same article).
- Robinhood now publishes **`https://robinhood.com/llms.txt`** (200 on 2026-11-11; it
  previously did not exist). It is a marketing index: its only "Agentic Products" entry
  is the Agentic Credit Card page, with no mention of the Trading MCP. No `openapi.json`
  was checked this round. Watch the support articles instead:
  [onboarding](https://robinhood.com/us/en/support/articles/onboarding-an-external-agent/),
  [trading with your agent](https://robinhood.com/us/en/support/articles/trading-with-your-agent/).

## Other repos (not endorsed by Robinhood)

READMEs read 2026-11-11; stars and pushes from the GitHub API the same day. Source code was not read, so tool lists are what each README claims.

- **[verygoodplugins/robinhood-mcp](https://github.com/verygoodplugins/robinhood-mcp)** (community, local stdio via `uvx robinhood-mcp`; 41 stars, last push 2026-07-29, MIT, not archived). Read-only by design: 15 tools (accounts, portfolio, positions, watchlist, quotes, fundamentals, historicals, news, earnings, ratings, dividends, options positions, order history, symbol search), none that place orders. It wraps the unofficial `robin_stocks` library, not Robinhood's Trading MCP. **Caution:** it logs in with your Robinhood username and password in environment variables (optionally a TOTP secret, otherwise a push approval) and caches the session in `~/.tokens/robinhood.pickle`. Unofficial login flows can break or trigger account restrictions, and the README says so. Small, one-maintainer project handling brokerage credentials.
- **[rohitsingh-iitd/robinhood-mcp-server](https://github.com/rohitsingh-iitd/robinhood-mcp-server)** (30 stars, last push 2025-06-18, MIT). **Not an MCP server.** It is a FastAPI REST and WebSocket wrapper around the Robinhood *Crypto* API; `requirements.txt` has no MCP SDK. It exposes `POST /trading/orders` and `DELETE /trading/orders/{id}`, so it could be a DIY base for an order-capable wrapper, but nothing in it is an agent tool surface. Needs your Crypto API key and private key in `.env`; the default bind host is `0.0.0.0`. No activity in five months.
- **[Oft3r/agentic-trading-desk](https://github.com/Oft3r/agentic-trading-desk)** (336 stars, last push 2026-10-19, MIT). **Not a server.** A set of agent skills (2 `SKILL.md` files) plus stdlib Python scoring scripts that sit on top of Robinhood's official Trading MCP. Its README describes a `PreToolUse` hook that enforces the user's order "Mandate" outside the model, but also says the agent places orders within those limits, so the repo tagline ("the human approves every order") is looser than the mechanism. Useful as an example of client-side guardrails around the official route.
