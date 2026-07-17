---
name: XTB
region: EU (Poland) / UK
status: community
trading: true
server_type: local
source_url: https://github.com/mcp-research/sharplygroup__xtb-mcp-server
last_verified: 2026-07-16
confidence: low
---

# XTB

> ⚠️ **Low confidence.** Something here could not be pinned down — read the
> Caveats before acting on this page. We would rather say so than round up.

## Overview

No official XTB MCP server. A community server (sharplygroup/xtb-mcp-server, wrapping
the @sharplygroup/xtb-api-js library over the XTB xStation API) demonstrably existed
and included trade execution, but the upstream repo now 404s and the sharplygroup
GitHub org has no public repositories. It survives only as a third-party mirror
(mcp-research/sharplygroup__xtb-mcp-server, 1 star) and an npm republish
(@mseep/xtb-mcp-server 0.1.2, published 2025-04-17, whose repository field still
points at the dead repo). A large number of MCP aggregator sites still list it as if
live — that listing traffic echoes a source that is gone.

## How to connect

No install command is given here, deliberately — see Caveats. Where a route is
unmaintained, unaudited, or its upstream has disappeared, we don't hand you a
copy-paste line that connects it to your money.

## Trading scope

CFDs/forex/indices via the xStation API — the mirrored code exposes a tradeTransaction
tool for opening/managing trades, plus account, market data, and margin/profit
calculation operations. Capability is real in the code but the canonical source is no
longer published.

## Caveats

- DEAD UPSTREAM: https://github.com/sharplygroup/xtb-mcp-server returns HTTP 404 and
  the sharplygroup org page confirms 'This organization has no public repositories.'
  Only mirrors survive. Confidence is low for this reason — do not present this as an
  installable, maintained route.
- AGGREGATOR ECHO: glama, playbooks, pulsemcp, mcp.so, hexmos, ubos.tech and
  mcp.aibase all still list this server with working-looking pages. They are all
  citing the same now-deleted repo. Treat aggregator presence as zero evidence of
  liveness.
- NAME COLLISION — the biggest trap here: most GitHub results for 'xtb mcp' are
  Extended Tight-Binding quantum chemistry, not the broker. PhelanShao/xtb-mcp-server
  (17 stars, the top hit) is a computational-chemistry tool with nothing to do with
  trading. Do not cross-link them.
- No install one-liner given: the npm package @mseep/xtb-mcp-server is a third-party
  republish by 'mseep' (not the original author) pinned at 0.1.2 from April 2025, and
  its repo link is dead. Recommending it would be recommending unaudited, unmaintained
  code that can place live trades.
- The original README itself warned it is 'provided as an example and should be used
  at your own risk' with live accounts.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/sharplygroup/xtb-mcp-server>
- <https://github.com/sharplygroup>
- <https://github.com/mcp-research/sharplygroup__xtb-mcp-server>
- <https://registry.npmjs.org/@mseep/xtb-mcp-server>
- <https://api.github.com/search/repositories?q=xtb+mcp&sort=stars&order=desc>
