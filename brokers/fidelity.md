---
name: Fidelity
region: US
status: community
trading: true
server_type: local
source_url: https://github.com/tylerflar/claude-fidelity-mcp
last_verified: 2026-07-16
confidence: medium
---

# Fidelity

## Overview

There is **no official** Fidelity MCP server, and no public retail API to build one on.
Truthifi confirms as of June 12, 2026 that "Fidelity hasn't published an official MCP,
and it has no public retail API."

But a direct **community** server does exist, and it places orders —
[`tylerflar/claude-fidelity-mcp`](https://github.com/tylerflar/claude-fidelity-mcp). It
gets around the missing API by **driving Fidelity's website with Playwright/Firefox**.

> An earlier version of this page said "no direct MCP server, official or community,
> found for Fidelity" and filed it as `aggregator-only`. That was wrong.

## How to connect

Not given here deliberately — read the Caveats first. This server logs into your
Fidelity account by automating a browser, which is a materially different risk posture
from an API-backed server.

## Trading scope

13 tools registered via `server.tool(...)` in `src/index.ts`, including
`fidelity_login`, `fidelity_submit_2fa`, `fidelity_get_accounts`,
`fidelity_get_positions`, `fidelity_get_quote`, and — the part that matters —
`fidelity_place_order` and `fidelity_batch_orders`.

**Read-only alternative:** [SnapTrade](../aggregators/snaptrade.md) or
[Truthifi](../aggregators/truthifi.md). SnapTrade's own Fidelity page states: "No,
SnapTrade's integration with Fidelity does not offer the ability to place trades."
Truthifi is "read-only by architecture." If you only need visibility, take one of these
instead — they don't need your password.

## Safety / guardrails

`dry_run` defaults to `true` on both order tools —
`dry_run: z.boolean().optional().default(true)`, documented as "If true (default),
preview the order without placing it. Set to false to actually execute."

**But understand what kind of default that is.** It's a *per-call argument the model
supplies*, not an install-level guard like Alpaca's `ALPACA_PAPER_TRADE` env var. One
`dry_run: false` in a single tool call places a live order. There is no configuration
you can set once that prevents it.

## Caveats

- **It drives a real browser session as you.** You are handing your Fidelity
  credentials and 2FA to a third-party script that logs in on your behalf. This is not
  an API integration with scoped tokens; it is automation of your logged-in account.
- **Browser automation against a broker may violate Fidelity's terms**, and it breaks
  whenever they change their front-end. Treat it as fragile by construction.
- Small and young: MIT, TypeScript, created 2026-04-01, last push 2026-04-13, 4 stars,
  12 commits. Not archived, but not battle-tested either.
- The dry-run default is genuinely thoughtful design. It is still one boolean away from
  a live order.

## Sources

Checked directly on 2026-07-16 (repo cloned, `src/index.ts` read):

- <https://github.com/tylerflar/claude-fidelity-mcp>
- <https://snaptrade.com/brokerages/fidelity>
