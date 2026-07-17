---
name: Lightspeed
region: US
status: none
trading: false
server_type: n/a
source_url: https://lightspeed.com/trading/api-trading
last_verified: 2026-07-16
confidence: medium
---

# Lightspeed

## Overview

No MCP server exists for Lightspeed Trading (the US broker at lightspeed.com). A
GitHub search for 'lightspeed trading mcp' returns 0 results, and Lightspeed's own API
Trading page makes no mention of MCP, AI agents or Claude. Lightspeed does offer
'Lightspeed Connect', an API trading product that can place and execute orders on US
exchanges with multiple routing options and a certification environment for paper
trading — a DIY-wrapper candidate, but not an MCP server.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- CRITICAL NAME COLLISION — the single biggest false-positive risk in this cluster.
  Searching 'Lightspeed MCP server' surfaces real, working MCP servers that have
  NOTHING to do with the broker: Apideck's 'Lightspeed MCP Server' and viasocket's
  'MCP Server for Lightspeed Retail POS (X-Series)' are for Lightspeed Commerce
  (retail/eCommerce POS), and 'Red Hat Lightspeed' is Red Hat's RHEL management
  product. None of these connect to the broker.
- Confidence is medium rather than high precisely because the name collision degrades
  search quality — a broker-specific repo under an unexpected name could plausibly be
  missed. The first-party page's silence on MCP is the strongest evidence.
- REST/API only — Lightspeed Connect is a DIY-wrapper candidate. The page does not
  specify whether it is REST, FIX or another protocol.
- No first-party mention of MCP anywhere on the API Trading page.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/search?q=lightspeed+trading+mcp&type=repositories>
- <https://lightspeed.com/trading/api-trading>
