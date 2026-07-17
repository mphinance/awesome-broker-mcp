---
name: eToro
region: International (not available to US retail)
status: official + community
trading: true
server_type: remote (official, docs-only) / local (community, trading)
source_url: https://builders.etoro.com/tools/mcp
last_verified: 2026-07-16
confidence: high
---

# eToro

## Overview

eToro has an official MCP server **and** an agent-trading product, and they are not the
same thing. Neither is what our earlier entry described.

> ### This entry was wrong in two compounding ways
>
> We previously asserted `status: official + community`, `trading: true`,
> `server_type: hosted (official)` — which reads as "eToro ships a broker-run MCP server
> that trades." **Nothing like that exists.**
>
> 1. **Agent Portfolios is not MCP.** Our body hedged ("couldn't confirm whether this is
>    literally MCP") but the frontmatter asserted it flatly. Following eToro's own "Full
>    API documentation here" link to api-portal.etoro.com resolves it: it is an
>    **OpenAPI 3.0.1 REST spec** over `public-api.etoro.com`, auth via `x-api-key` /
>    `x-user-key` / `x-request-id` headers, scopes like
>    `etoro-public:agent-portfolio:write`. No MCP, no JSON-RPC, no MCP transport. eToro's
>    announcement even says it plainly: *"Scoped API credentials. A dedicated API key
>    tied to this portfolio. Connect it to whatever you've built."* That's
>    bring-your-own-agent REST, not a protocol integration.
> 2. **The real official eToro MCP server is docs-only** — and we missed it entirely.

## The official MCP server (docs-only, cannot trade)

[builders.etoro.com/tools/mcp](https://builders.etoro.com/tools/mcp) — *"Model Context
Protocol server that connects any AI IDE to eToro API documentation, schemas, and
endpoint references."*

Hosted streamable HTTP at `https://mcp.public-api.etoro.com`. It exposes exactly **two**
tools, `get-all-routes` and `get-route-spec`, which read the live OpenAPI doc "so your
assistant writes accurate code instead of guessing."

**It cannot place a trade or touch a portfolio.** It's a developer reference tool — it
helps an AI write code *against* eToro's API. Useful, but not a broker connector.

## Agent Portfolios (REST, not MCP)

A dedicated portfolio your agent trades via scoped API keys. $200 minimum. Real, and
genuinely trading-capable — but you reach it with plain HTTP calls you write yourself,
not by adding an MCP server. If you want this in an MCP client, you build the wrapper.

## The community server (local, trades)

[`gabrielcerutti/etoro-mcp-server`](https://github.com/gabrielcerutti/etoro-mcp-server)
— 35 tools against your own account, positions and orders. Local, via `npx`. Third-party
and not endorsed by eToro. Demo mode is the default, and its own docs describe
real-money AI trading as "risky."

This is the only eToro route that is both **MCP** and **trading-capable**, and it is
unofficial.

## Trading scope

- **Official MCP server:** none. Documentation lookup only.
- **Agent Portfolios:** real trading, via REST — not MCP.
- **Community server:** positions and orders on your own account.

## Safety / guardrails

Agent Portfolios ring-fences risk by construction: the agent trades a dedicated
portfolio funded with an amount you choose, not your whole account. That's a good
pattern — it just isn't reachable over MCP without your own wrapper.

The community server defaults to demo mode.

## Caveats

- **Don't let "eToro has an official MCP server" and "eToro lets AI agents trade" merge
  into one sentence.** Both are true; they refer to different products. The official
  server can't trade and the trading product isn't MCP.
- Not available to US retail.

## Sources

Checked directly on 2026-07-16:

- <https://builders.etoro.com/tools/mcp>
- <https://api-portal.etoro.com/>
- <https://www.etoro.com/news-and-analysis/etoro-updates/agent-portfolios-let-your-ai-agent-trade-for-you/>
- <https://github.com/gabrielcerutti/etoro-mcp-server>
