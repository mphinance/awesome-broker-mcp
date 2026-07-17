---
name: FOREX.com (StoneX)
region: Global (US / UK / EU / CA / APAC) — GAIN Capital / StoneX
status: none
trading: false
server_type: n/a
source_url: none found
last_verified: 2026-07-16
confidence: medium
---

# FOREX.com (StoneX)

## Overview

No MCP server found — official or community. FOREX.com offers REST and FIX APIs for
automated trading, but nothing MCP-related surfaced in press, on GitHub, or on npm.
This is a clean negative and a good DIY-wrapper candidate: the REST API supports order
execution across ~80 markets.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- Confident negative, but note the limits of my checks: I could NOT fetch forex.com
  first-party pages (HTTP 403, Cloudflare), and developer.stonex.com is a JS-rendered
  app that returned only a page title. So this rests on absence of evidence across
  searches rather than a first-party statement.
- GitHub searches for forex.com / StoneX / GAIN Capital MCP servers returned nothing
  relevant (the only "stonex-mcp" hit is an unrelated Chinese ops-diagnostics tool).
  npm search returned nothing.
- FOREX.com is absent from every broker-MCP roundup I read, including LeapRate's,
  which names Webull, Deriv, IG, ThinkMarkets and eToro but not FOREX.com.
- DIY-wrapper candidate: FOREX.com REST API supports full order execution against live
  streaming prices across ~80 markets, plus FIX for lower-level access. A custom MCP
  wrapper is the only route today.
- If StoneX ships something, it would most likely appear at developer.stonex.com —
  worth re-checking that portal with a JS-capable fetch later.
