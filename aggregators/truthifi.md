---
name: Truthifi
region: US
status: official
trading: false
server_type: remote
source_url: https://truthifi.com/mcp-tools
last_verified: 2026-11-11
confidence: high
---

# Truthifi

## Overview

Official, hosted account-aggregation MCP covering 18,000+ financial institutions
(Schwab, Fidelity and Vanguard among them). It cannot trade.

## How to connect

Hosted endpoint — **public, no signup needed to know it**:

```
https://api.truthifi.com/mcp
```

Documented on truthifi.com/mcp-tools and their Claude connect guide. Auth via OAuth.

The **truthifi-connect.ai** branding resolves as a product/brand name, live at that
domain; the endpoint hostname is `api.truthifi.com`. An earlier version of this page
couldn't pin either down and said the URL "needs an account signup" — both are now
public.

## Trading scope

**None.** Truthifi is explicit: *"Your AI can retrieve and reason about your financial
data, but it cannot move money, place trades, execute transactions, or modify your
accounts in any way."*

## Safety / guardrails

**Read-only by default — but not literally read-only, and the distinction is worth
stating.**

Truthifi's marketing page says "strictly read-only." Their more technical tools page is
narrower and more accurate: *"Read-only by default. Nearly every tool only reads your
data; the two write tools, `run_scan` and `create_asset_liability`, are clearly
marked."* As of 2026-11-11 the tools page lists 30 tools and names three write tools:
`run_scan`, `create_asset_liability` and `delete_asset_liability`. `connect_account`,
`fix_connections` and `upgrade` are action-oriented and the page does not detail them.

So the server has write tools. **None of them trade, move money, or touch brokerage
state** — they run scans and CRUD manually-entered assets/liabilities inside Truthifi's
own records. `trading: false` is correct and the practical safety posture is sound.

We say "read-only with a small number of non-financial write tools" rather than
"strictly read-only" because the docs beat the marketing page, even when the marketing
page is flattering.

Also: dashboard visibility into which agents/providers/advisors are connected, and 130+
automated "wellness checks" on the underlying platform (portfolio monitoring, not
MCP-specific).

## Caveats

- The write tools are real but scoped to Truthifi's own records, not your brokerage.
- Broad institution coverage means broad read access — this server can see a lot about
  your finances. That's the tradeoff, and it's the reason read-only matters here.

## The `Truthifi/truthifi-mcp` repo

[Truthifi/truthifi-mcp](https://github.com/Truthifi/truthifi-mcp) is **first-party**: it sits in the `Truthifi` GitHub organization (created 2021, homepage truthifi.com) and its homepage field points to truthifi.com/features/mcp. Repo created 2026-10-02; 0 stars, last push 2026-11-01, MIT, not archived (checked 2026-11-11).

It is **not a separate server**. The README says the repo holds documentation, client configuration and agent skills only, and that the server is the hosted one at `https://api.truthifi.com/mcp` (Streamable HTTP, OAuth with Dynamic Client Registration, registry name `com.truthifi/mcp`). There is nothing to build or run. What it adds beyond the hosted-server docs:

- Install routes: Claude Code plugin marketplace (`/plugin marketplace add truthifi/truthifi-mcp`), Gemini CLI extension, Codex, Cursor plugin, Kiro power, and configs for many other clients under `configs/`.
- **Agent skills**: 3 `SKILL.md` files, installable with `npx skills add truthifi/truthifi-mcp`.
- A more current tool count than this page's: the README says **34 tools**, with **three** that change data inside Truthifi only (`create_asset_liability`, `delete_asset_liability` and `run_scan`), and says Truthifi's access to bank and brokerage accounts is read-only. That agrees with the "no trading, small set of non-financial write tools" reading above. It also shows a per-tool credit cost (0 to 3) and plan limits, which affects how many calls you get.

## Sources

Checked directly on 2026-11-11 (tools page now 30 tools, endpoint unchanged; the auth mechanism is not described on that page; the Claude connect hub says "over 18,000 US financial institutions"):

- <https://truthifi.com/mcp-tools>
- <https://truthifi.com/features/mcp>
