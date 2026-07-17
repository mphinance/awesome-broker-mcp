---
name: Robinhood
region: US
status: official
trading: true
server_type: remote
source_url: https://robinhood.com/us/en/agentic-trading/
last_verified: 2026-07-16
---

# Robinhood

## Overview

Robinhood's first-party "Agentic Trading" product. Trades execute against a
**dedicated agentic account**, separate from your normal Robinhood account, funded
with an amount you explicitly reserve for the agent.

## How to connect

MCP endpoint: `https://agent.robinhood.com/mcp/trading`

**Claude Desktop**: Settings → Connectors → Add custom connector → paste the URL above
→ complete OAuth.

**Claude Code**:
```
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```

OAuth is **desktop-only**. If you start the connection flow on mobile, Robinhood has
you copy the onboarding URL into a desktop browser to finish it.

You must create the agentic account first, at
[robinhood.com/us/en/agentic-trading](https://robinhood.com/us/en/agentic-trading/),
before connecting.

## Trading scope

Docs reference stock investing, order placement across "different available order
types," portfolio building/rebalancing, and strategy automation. **Trades are confined
to the agentic account only** — the agent cannot touch your primary Robinhood account.
Full asset-class enumeration (whether options/futures are in scope for the *agent*
specifically, vs. Robinhood generally) is not spelled out on the page fetched;
treat as unconfirmed until tested.

## Safety / guardrails

- Dedicated, capped budget (the funding amount you set)
- Notification on every trade
- Disconnect anytime from within the Robinhood app

## Caveats

- Robinhood's own disclosure: *"Robinhood does not control, supervise, monitor,
  recommend, or audit these AI agents."* Full responsibility sits with the user.
- The exact connector URL is not shown on the public marketing page — it's documented
  in the support article: https://robinhood.com/us/en/support/articles/agentic-trading-overview/
