---
name: Truthifi
region: US
status: official
trading: false
server_type: remote
source_url: https://truthifi.com/mcp-tools
last_verified: 2026-07-16
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
marked."* There is also a `delete_asset_liability`.

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

## Sources

Checked directly on 2026-07-16:

- <https://truthifi.com/mcp-tools>
- <https://truthifi.com/features/mcp>
