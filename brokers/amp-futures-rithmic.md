---
name: AMP Futures (Rithmic)
region: US
status: none
trading: false
server_type: n/a
source_url: none found
last_verified: 2026-07-16
confidence: high
---

# AMP Futures (Rithmic)

## Overview

No MCP server exists for AMP Futures or for Rithmic. A GitHub repository search for
'rithmic mcp' returns 0 results, and no AMP-specific MCP server appears in web search
(queries mostly collide with Amplitude's 'AMP' MCP server). Programmatic access to an
AMP account is via Rithmic's proprietary R|API+ / R|Diamond API or CQG — conventional
APIs with no Model Context Protocol layer.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- GitHub search for 'rithmic mcp' returned an explicit 0 results.
- Searches for 'AMP Futures MCP' are polluted by Amplitude (the analytics vendor),
  whose MCP server is unrelated. Do not conflate.
- INDIRECT ROUTE, heavily conditioned: an AMP account connected to NinjaTrader 8 could
  in principle be driven by the NinjaTrader community MCP servers, since those talk to
  the NT8 platform rather than to the broker's API. BUT as of April 10 2026
  NinjaTrader restricted AMP's ability to enable NinjaTrader for new traders/new
  setups — only grandfathered existing users retain access. This route is closed to
  new AMP customers.
- Rithmic R|API+ is a DIY-wrapper candidate in theory, but it is a proprietary
  low-level API (not a simple REST surface), making a wrapper substantially harder
  than for a REST broker.
- Rithmic itself connects to ~32 platforms (Bookmap, MultiCharts, MotiveWave, ATAS,
  Jigsaw, etc.) — none of which surfaced an MCP server in this research.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/search?q=rithmic+mcp&type=repositories>
