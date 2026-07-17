---
name: eToro
region: International (not available to US retail)
status: official + community
trading: true
server_type: hosted (official) / local (community)
source_url: https://www.etoro.com/news-and-analysis/etoro-updates/agent-portfolios-let-your-ai-agent-trade-for-you/
last_verified: 2026-07-16
---

# eToro

Two separate, unrelated paths — don't conflate them.

## Official: Agent Portfolios

eToro-hosted, eToro-managed. Connect an AI agent to a **dedicated trading
portfolio**, set limits, start with as little as $200. No MCP-specific technical
detail was in eToro's own announcement page (it's a marketing page, not developer
docs) — couldn't confirm whether this is literally MCP under the hood or a different
agent-integration mechanism. Treat the "MCP" framing as unconfirmed for the official
path specifically.

Source: [etoro.com](https://www.etoro.com/news-and-analysis/etoro-updates/agent-portfolios-let-your-ai-agent-trade-for-you/)

## Community: gabrielcerutti/etoro-mcp-server

Confirmed actual MCP server. Local process, actively maintained (51 commits, CI/CD,
published to the MCP Registry).

**Connect**: `npx -y etoro-mcp-server`, or drag the `.mcpb` file into Claude Desktop.

**Auth**: `ETORO_API_KEY` + `ETORO_USER_KEY`, generated from eToro Settings → Trading
→ Create New Key, with environment (Demo/Real) and permissions chosen at creation
time.

**Trading scope**: 35 tools — market data, portfolio/P&L, position open/close, limit
and entry orders, order cancellation.

**Safety**: Demo mode is the default; Real mode executes live trades with actual
capital. The project's own docs explicitly warn *"Letting an AI execute real-money
trades is risky"* and recommend demo-first, read-only keys where possible, and
explicit confirmation before live orders.

Source: [github.com/gabrielcerutti/etoro-mcp-server](https://github.com/gabrielcerutti/etoro-mcp-server)

## Caveats

- If you want the official, broker-run path: use Agent Portfolios directly through
  eToro, not this community server.
- If you want your own eToro account (not a separate agent-portfolio) driven by
  Claude: the community server is the only route, and it's third-party — not
  endorsed by eToro.
