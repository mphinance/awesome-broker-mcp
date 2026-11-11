---
name: moomoo / Futu
region: HK, US, CN, SG, JP (varies by Futu entity)
status: official + community
trading: true
server_type: local: official Agent Skills (via the moomoo CLI) or community MCP server (via OpenD)
source_url: https://github.com/MoomooOpen/moomoo-agent-hub
last_verified: 2026-11-11
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

The two routes no longer share a backend. **The official Agent Hub dropped OpenD** (the
`moomoo-api` / `install-moomoo-opend` skills were removed; the repo points to
`docs/upgrade-from-opend.md`). The community MCP server still depends on **Moomoo OpenD**, a
separate local gateway app you download from moomoo, launch with your account credentials, and
leave running (`127.0.0.1:11111` by default).

**Official: Moomoo Agent Hub (Agent Skills).** README as read 2026-11-11: "official AI Agent
skill set by moomoo", installed with `npx skills add -y -g MoomooOpen/moomoo-agent-hub --skill <slug>`.
Works with Claude Code, Cursor, Claude Desktop, VS Code, JetBrains. Ships **11 skills** (was 4):
quote/trade (`moomoo-quote`, `moomoo-trading`, `moomoo-sim-trading`, `moomoo-crypto`), technical
analysis (`moomoo-unusual-technical-signal-alerts`, `moomoo-unusual-capital-flows`,
`moomoo-unusual-derivatives-activity`), content (`moomoo-news-search`, `moomoo-stock-digest`,
`moomoo-comment-sentiment`) and `moomoo-grid-strategy`. The quote/trade and technical skills drive
a local **`moomoo` CLI** ([MoomooOpen/moomoo-cli](https://github.com/MoomooOpen/moomoo-cli); the skill
offers to install it) authenticated by **OAuth via `moomoo auth login`**, plus the matching account
permission. The content skills use public HTTP and need no login. Skills only; the README
describes no MCP server process, despite the "MCP Compatible" badge.

**Community — `moomoo-api-mcp` (MCP server).** A real MCP server, run it directly:
- Quick start: `uvx --refresh moomoo-api-mcp`
- Permanent: `uv tool install moomoo-api-mcp`
- Dev: clone + `uv run moomoo-api-mcp`

Claude Desktop: add to `claude_desktop_config.json` with the command + env vars.

## Trading scope

Community server (OpenD): full execution, market / limit / conditional orders plus modify and
cancel, alongside positions, funds/buying power, order and trade history and live market data
(quotes, K-lines, order book, tick-by-tick, snapshots, options chains). Markets: **HK, US, CN
A-shares, SG, JP**, varying by market.

Official skills: `moomoo-trading` covers the user's chosen live stock account (funds, positions,
orders, fills), `moomoo-crypto` a crypto account, `moomoo-sim-trading` paper stock accounts only.
`moomoo-quote` covers stocks, options, futures and crypto quotes but does not place orders.
`moomoo-grid-strategy` is out of scope for options, futures, crypto and market orders.

## Safety / guardrails

- **Official:** the CLI keeps the OAuth token locally and the skills do not read token files.
  `moomoo-trading` requires the user to confirm account, symbol, side, quantity, order type and
  price before any order ("the agent does not confirm on the user's behalf"), and reports order
  id and real status ("a submit is not a fill"). This is skill instruction text, enforced by the
  model following it, not a server-side gate. A separate paper skill exists, and
  `moomoo-grid-strategy` defaults to the paper account, using live only if you ask for it.
- **Community:** without `MOOMOO_TRADE_PASSWORD` + `MOOMOO_SECURITY_FIRM` (broker region,
  e.g. FUTUSG / FUTUINC) the server runs **SIMULATE-only** (paper trading) — real trading
  is opt-in, not default. A real account additionally requires an explicit `unlock_trade`
  call before the agent can execute anything real.

## Caveats

- The official route is **Skills, not an MCP server** — excellent inside Claude Code /
  Cursor, but if you specifically need an MCP server process, that's the community
  `moomoo-api-mcp`.
- Community route needs OpenD **plus** the server (two processes). The official route now needs
  only the `moomoo` CLI, so the old "OpenD required for either route" claim is gone.
- Community server (Litash): v0.1.8 still the latest (PyPI and GitHub), 42 stars as of
  2026-11-11, last push 2026-05-03, single maintainer, Apache-2.0, self-classified alpha. Not
  affiliated with moomoo.
- Official Agent Hub: MIT, 21 stars, pushed 2026-11-10 and moving fast (the README was rewritten
  since the last check: 4 skills became 11, OpenD removed). The CLI repo `moomoo-cli` has 0 stars,
  is MIT and pushed 2026-11-10. Verify the installer script before running it; the skill
  runs a `curl | sh` installer after asking.
- Not re-verified 2026-11-11: the regional account and permission prerequisites (the old API
  access questionnaire) for the OAuth CLI route; the README only says "the matching account
  permission".
