---
name: Longbridge
region: Asia (Hong Kong/Singapore) — US & HK markets
status: official
trading: true
server_type: remote (hosted)
source_url: https://open.longbridge.com/docs/mcp
last_verified: 2026-10-12
confidence: high
---

# Longbridge

## Overview

Longbridge runs an official hosted MCP server at https://mcp.longbridge.com
(mcp.longbridge.cn for mainland China), with the source published at
github.com/longbridge/longbridge-mcp — a Rust implementation self-described as the
'Official MCP server for the Longbridge brokerage'. It is the most complete broker MCP
in this cluster: 164 tools across 20 categories per the repo README (v0.13.2, released
2026-10-12), including a Trade category with 15 tools covering order submission,
cancellation, replacement and multi-leg option orders. Auth is OAuth 2.1 via browser, no
manual key handling. It is also listed as an official connector in the Claude and ChatGPT
directories.

## How to connect

```bash
claude mcp add --transport http longbridge https://mcp.longbridge.com — then authenticate via /mcp (OAuth 2.1, no API keys to paste). Mainland China endpoint: https://mcp.longbridge.cn
```

US accounts must use the global endpoint; per Longbridge's docs `.cn` has no route to the
US data center and serves AP (SG/HK) accounts only. For clients that cannot complete a
browser OAuth flow, the docs describe an Agent Auth Code: generate a one-time code at
open.longbridge.com/connect, connect to `https://mcp.longbridge.com/agent`, and redeem
it via the `authenticate` tool. The Claude connector also works; the **ChatGPT app does
not include order placement** (Longbridge cites ChatGPT platform policy), so trading
needs Claude Code, Cursor or another MCP client.

## Trading scope

US and HK equities plus derivatives (options/warrants) — order submission,
cancellation and replacement, multi-leg option combination orders (CoveredCall,
vertical spreads, Collar, Straddle, Strangle, calendar spreads), positions, balance,
executions, margin. Since v0.13.0 there is also a mutual fund channel (28 tools:
catalog, positions, and fund order submit/cancel). Also DCA plans, grid trading, IPO
subscriptions, price alerts, screeners and portfolio analytics.

## Safety / guardrails

- **Dry run by default on most order writes.** Per the repo source and LAUNCHGUIDE,
  `submit_order`, `cancel_order`, `replace_order`, the `grid_*` writes and the fund
  submit/cancel tools preview first and act only when you pass back the three-digit
  `confirmation_code` the preview returned (an `execute` argument). The source says
  plainly that this is **not a secret**: the code is derived from the request, so a
  caller could compute it, and it only catches acting on an order nobody previewed or on
  a different order than the one previewed. A human approval step has to live in your
  client.
- **`submit_multileg_order` has no `execute` argument** in the current `main` source we
  read, so it appears not to be covered by that gate. Treat it as direct placement and
  gate it in your client. We did not call it to confirm.
- **Paper trading.** Sending the header `x-papertrading: true` runs a request against the
  paper environment, and `LONGBRIDGE_PAPERTRADING=true` does it deployment-wide
  (self-hosted). Upstream rejects a paper request made with a real-money token, so the
  header can only narrow what a token may do. A paper trading account is listed as a
  prerequisite alternative in the docs.
- OAuth scopes limit tools; Longbridge advises approving only the scopes you need and
  telling the AI to ask for confirmation before any order.

## Caveats

- Genuinely capable of live order placement — this is a real execution route, not a
  data-only connector. Gate accordingly.
- Tool counts vary across sources (the docs page now says '160+ tools across six
  capability areas'; the repo README says '164 tools' across 20 categories, a figure we
  summed from its table). The count has grown fast (148 in July). Treat the exact number
  as approximate. The 28 fund tools are not in the README's category table.
- Docs do not explicitly enumerate market coverage; availability depends on 'your
  region, account level, and granted OAuth scopes'. The repo scopes it to US and HK
  markets.
- A separate community server (baranwang/longbridge) appears in search results but was
  NOT verified — prefer the official one.
- Requires a funded Longbridge account (or a paper trading account); region-gated (HK/SG
  entity vs mainland endpoint). We did not authenticate, so tool availability, scopes and
  the dry-run behavior were read from source and docs, not exercised on a live account.
- v0.13.0 moved quote data from WebSocket to HTTP REST (breaking, mostly relevant to
  self-hosters). v0.13.2 only fixes `limit`/`size` handling in news and topic search and
  rank lists.

## Sources

Checked directly on 2026-10-12:

- <https://open.longbridge.com/docs/mcp> (and the `.md` source)
- <https://github.com/longbridge/longbridge-mcp> (README, v0.13.0 to v0.13.2 releases,
  `src/tools/trade.rs`, `src/tools/support/dry_run.rs`, `LAUNCHGUIDE.md`)
- <https://mcp.longbridge.com/.well-known/oauth-protected-resource> (returns 200)
