---
name: Robinhood
region: US
status: official
trading: true
server_type: remote
source_url: https://robinhood.com/us/en/support/articles/onboarding-an-external-agent/
last_verified: 2026-10-09
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
stop market. The tool list groups are account/portfolio, watchlist, market data,
equities, options and crypto. **Futures are not listed.** Crypto additionally requires a
Robinhood Crypto account matching your MCP account and acceptance of the updated crypto
agreement; the agent cannot open one.

Trades are confined to the MCP account. Reads are **not**: the agent gets read access to
*all* your Robinhood accounts, including account numbers, positions, balances and full
order history.

## Safety / guardrails

- **Trade approvals** (agent proposes, you place it in the app): **on by default for
  built-in agents, off by default for MCP accounts.** The marketing page says "on by
  default"; the support article says that applies to built-in agents only. For an
  external agent you must turn it on yourself: Agent Settings → Safety Controls.
  Even with it off, Robinhood says "certain trades may still require your approval."
- Dedicated, separately funded MCP account
- Disconnect anytime from the app
- Notification on every trade (from the earlier verification; not restated in the pages
  read on 2026-10-09)

## Caveats

- Robinhood's own disclosure: *"Robinhood does not control, supervise, monitor,
  recommend, or audit these AI agents."* Full responsibility sits with the user.
- Read scope is wider than trade scope: connecting an external agent exposes your other
  accounts' numbers and history to that agent and its AI provider.
- Built-in agents have their own token billing ($5 starting balance, then prepaid) and
  Agent Apps subscriptions. Both apply only to Robinhood-hosted agents, not MCP.
  "Agent Loops" (scheduled continuous trading) is marked "Coming soon."
- The tools list on the support page is collapsed, so exact tool names and parameters
  were not read. Not tested with a live account.
- Robinhood publishes **no `llms.txt` or `openapi.json`**. Those paths return an S3/CloudFront
  `AccessDenied` 403, but so does any made-up path (checked 2026-10-09), so it is "absent",
  not a bot wall. Watch the support articles instead:
  [onboarding](https://robinhood.com/us/en/support/articles/onboarding-an-external-agent/),
  [trading with your agent](https://robinhood.com/us/en/support/articles/trading-with-your-agent/).
