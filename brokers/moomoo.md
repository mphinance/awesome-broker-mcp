---
name: moomoo / Futu
region: HK, US, CN, SG, JP (varies by Futu entity)
status: official + community
trading: true
server_type: local — official Agent Skills or community MCP server, both over the OpenD gateway
source_url: https://github.com/MoomooOpen/moomoo-agent-hub
last_verified: 2026-07-17
---

# moomoo / Futu

## Overview

Two routes now, and the distinction is the whole point for this list. moomoo shipped an
**official** offering — [Futu Agent Hub](https://github.com/MoomooOpen/moomoo-agent-hub),
their self-described "official AI Agent skills center" — but it's delivered as **Claude
Agent Skills** badged *MCP-compatible*, not as a standalone MCP server. The only genuine
standalone MCP *server* is still community:
[`moomoo-api-mcp`](https://github.com/Litash/moomoo-api-mcp), explicitly **not affiliated
with Moomoo Inc.** (its own disclaimer). Pick by what your client actually speaks.

## How to connect

Both routes talk to the same backend: **Moomoo OpenD**, a separate local gateway app you
download from moomoo, launch with your account credentials, and leave running (listens on
`127.0.0.1:11111` by default). No OpenD, no trading — for either route.

**Official — Futu Agent Hub (Agent Skills).** Works with Claude Code, Cursor, Claude
Desktop, VS Code. Ships 4 skills: `Moomoo API` (trading + market data) plus three content
skills — News Search, Stock Briefing, Sentiment Gauge. The content skills hit public HTTP
endpoints and need no OpenD; the trading skill needs OpenD + the Python SDK, which the
agent installs for you when you paste moomoo's quick-start prompt. Trading also requires
API access enabled on the account (questionnaire + agreement, done in-app).

**Community — `moomoo-api-mcp` (MCP server).** A real MCP server, run it directly:
- Quick start: `uvx --refresh moomoo-api-mcp`
- Permanent: `uv tool install moomoo-api-mcp`
- Dev: clone + `uv run moomoo-api-mcp`

Claude Desktop: add to `claude_desktop_config.json` with the command + env vars.

## Trading scope

Full execution — market / limit / conditional orders, plus modify and cancel — alongside
positions, funds/buying power, order and trade history, and live market data (quotes,
K-lines, order book, tick-by-tick, snapshots, options chains). Markets: **HK, US, CN
A-shares, SG, JP** — stocks, ETFs, options, futures, warrants/CBBCs and indices, varying
by market.

## Safety / guardrails

- **Official:** credentials live in environment variables only (never in config or
  source), and write operations require explicit user confirmation.
- **Community:** without `MOOMOO_TRADE_PASSWORD` + `MOOMOO_SECURITY_FIRM` (broker region,
  e.g. FUTUSG / FUTUINC) the server runs **SIMULATE-only** (paper trading) — real trading
  is opt-in, not default. A real account additionally requires an explicit `unlock_trade`
  call before the agent can execute anything real.

## Caveats

- The official route is **Skills, not an MCP server** — excellent inside Claude Code /
  Cursor, but if you specifically need an MCP server process, that's the community
  `moomoo-api-mcp`.
- Two processes to keep alive either way: OpenD **plus** the agent/server. More moving
  parts than any hosted entry in this directory.
- Community server (Litash): v0.1.8 (Apr 2026), 79 commits, 9 releases, ~24 stars,
  single maintainer, Apache-2.0, self-classified alpha. Not affiliated with moomoo.
- Official Agent Hub: MIT-licensed, Python, no tagged releases yet and a small star
  count — new and moving. Verify the quick-start docs before trusting the auto-installer.
