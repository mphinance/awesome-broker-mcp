---
name: moomoo / Futu
region: HK, US, CN, SG, JP (varies by Futu entity)
status: official + community
trading: true
server_type: remote (official hosted MCP at mcp.moomoo.com/mcp) and local (official Agent Skills via the moomoo CLI; community MCP server via OpenD)
source_url: https://github.com/MoomooOpen/moomoo-agent-hub
last_verified: 2026-11-11
---

# moomoo / Futu

## Overview

Three routes, and the distinction is the whole point for this list:

1. **Official hosted MCP (remote):** [`MoomooOpen/moomoo-agent-plugin`](https://github.com/MoomooOpen/moomoo-agent-plugin)
   points at `https://mcp.moomoo.com/mcp` (OAuth). Real-money trading tools, found 2026-11-11.
2. **Official Agent Skills (local, no MCP server):** [Futu Agent Hub](https://github.com/MoomooOpen/moomoo-agent-hub),
   moomoo's self-described "official AI Agent skills center", delivered as Claude Agent Skills
   badged *MCP-compatible* that drive a local `moomoo` CLI.
3. **Community MCP server (local):** [`moomoo-api-mcp`](https://github.com/Litash/moomoo-api-mcp),
   explicitly **not affiliated with Moomoo Inc.** (its own disclaimer), via the OpenD gateway.

Pick by what your client actually speaks. `status: official + community` because routes 1 and 2
are first-party and route 3 is not.

## How to connect

The Agent Hub and community routes no longer share a backend. **The official Agent Hub dropped OpenD** (the
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

**Official: moomoo MCP Plugin (hosted MCP + skills).**
[`MoomooOpen/moomoo-agent-plugin`](https://github.com/MoomooOpen/moomoo-agent-plugin), read
2026-11-11. Its README calls it an "all-in-one MCP plugin for moomoo" covering quotes, stock
screening, news and trading, packaged for Claude Code, Cursor, Codex and the Agent Plugins
standard. Every platform manifest points at one **remote** Streamable HTTP server,
`https://mcp.moomoo.com/mcp` (the repo's `.mcp.json` names it `moomoo-mcp`). Claude Code:
`/plugin marketplace add MoomooOpen/moomoo-agent-plugin`; Codex:
`codex plugin marketplace add MoomooOpen/moomoo-agent-plugin` (the Codex marketplace file sets
OAuth on install). It ships 4 skills: `moomoo-mcp-quote`, `moomoo-mcp-screen`,
`moomoo-mcp-news` and `moomoo-mcp-account` (real and simulated orders, positions, funds). The
`moomoo-mcp-account` SKILL.md lists `trading_order_place`, `trading_order_replace`,
`trading_order_cancel` and `trading_order_confirm` plus `sim_trade_*` paper tools. Those names
come from skill text, not from a tools/list call; we did not authenticate. The endpoint is
live: the OAuth protected-resource metadata returns 200, and an unauthenticated GET and an
`initialize` POST both return 401 pointing at `https://webapi.moomoo.com/oauth2/authorize/confirm`
(re-probed 2026-11-11). Guardrails are instruction text in the skill (account choice first, an
order summary plus explicit user confirmation for every place/modify/cancel, even in batch
mode), plus a server-side `need_order_confirm` flag that the agent completes with
`trading_order_confirm`. The agent can call that tool itself once the user says yes, so
treat it as a prompt-following gate, not human approval. MIT, 0 stars, last push
2026-09-28, not archived, no deprecation notice. The Agent Hub README does not mention it.

**Community: `moomoo-api-mcp` (MCP server).** A real MCP server, run it directly:
- Quick start: `uvx --refresh moomoo-api-mcp`
- Permanent: `uv tool install moomoo-api-mcp`
- Dev: clone + `uv run moomoo-api-mcp`

Claude Desktop: add to `claude_desktop_config.json` with the command + env vars.

## Trading scope

Community server (OpenD): full execution, market / limit / conditional orders plus modify and
cancel, alongside positions, funds/buying power, order and trade history and live market data
(quotes, K-lines, order book, tick-by-tick, snapshots, options chains). Markets: **HK, US, CN
A-shares, SG, JP**, varying by market.

Official hosted MCP (per docs/skills/moomoo.md, tool names from skill and reference files, 88 distinct names, not from `tools/list`): 9 account tools, 4 real-order tools (`trading_order_place`, `_replace`, `_cancel`, `_confirm`), 8 `sim_trade_*` paper tools and 67 `quote_*` quote, screening and research tools. Markets per the account skill: HK, US, SG, JP, CA, A-shares via Stock Connect, futures and options including multi-leg. Order tools require explicit side, order type, quantity and time in force. The Codex manifest says real trading is unsupported, but that lock is instruction text only; the same tools sit on the same URL.

Official skills: `moomoo-trading` covers the user's chosen live stock account (funds, positions,
orders, fills), `moomoo-crypto` a crypto account, `moomoo-sim-trading` paper stock accounts only.
`moomoo-quote` covers stocks, options, futures and crypto quotes but does not place orders.
`moomoo-grid-strategy` is out of scope for options, futures, crypto and market orders.

## Safety / guardrails

- **Official:** the CLI keeps the OAuth token locally and the skills do not read token files.
  The Agent Hub README (not the `moomoo-trading` SKILL.md, checked in docs/skills/moomoo.md)
  says "the agent does not confirm on the user's behalf" and "a submit is not a fill". The CLI
  has a dry-run plus a 3-digit `--execute` code, but the code is deterministic, so an agent can
  read it from the preview and resubmit; it is a mistake guard, not human approval. Everything
  else is instruction text the model has to follow, not a server-side gate. A separate paper skill exists, and
  `moomoo-grid-strategy` defaults to the paper account, using live only if you ask for it.
- **Community:** without `MOOMOO_TRADE_PASSWORD` + `MOOMOO_SECURITY_FIRM` (broker region,
  e.g. FUTUSG / FUTUINC) the server runs **SIMULATE-only** (paper trading) — real trading
  is opt-in, not default. A real account additionally requires an explicit `unlock_trade`
  call before the agent can execute anything real.

## Other community repo (README read 2026-11-11)

- [`iwanbk/moomoo-mcp`](https://github.com/iwanbk/moomoo-mcp): Go, stdio, via OpenD. README
  says read-only today (health, quotes, snapshots, K-lines, order book, accounts, assets,
  positions, watchlist); trading is planned, not implemented. 2 stars, last push 2026-07-16,
  not archived, no license file detected.

## Caveats

- The Agent Hub route is **Skills, not an MCP server** (excellent inside Claude Code /
  Cursor). For an MCP server, use the official hosted `moomoo-agent-plugin` (remote, found
  2026-11-11, tool names read from skill text only) or the community local `moomoo-api-mcp`.
  How the plugin relates to the Agent Hub skills is not documented in either README, and the
  plugin README does not state regional availability or which accounts may trade live.
- Hosted MCP: no notional, quantity or symbol caps, scoped tokens or read-only switch appear anywhere in the repo; whether the server enforces any is undocumented. Watchlist writes (`quote_modify_user_security`) have no confirmation rule.
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
