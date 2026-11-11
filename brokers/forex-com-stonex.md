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

## Community repo found 2026-11-11 (StoneX Client, not FOREX.com)

- **[anaisbetts/stonex-mcp](https://github.com/anaisbetts/stonex-mcp)** (community, local stdio via `npx -y stonex-mcp --cookies <file>`; 2 stars, created and last pushed 2026-08-03, MIT, not archived; README and file tree read, source not read). A typed client plus MCP server for the **StoneX Client** web portal (`client.stonex.com`, REST under `vulcan.stonex.com/torchapi`). The README describes read endpoints only: accounts, balances, summary, positions, activity, performance, projected income and documents. No order tools are named, so treat it as read-only, unverified at the code level. This is the StoneX client portal, not the FOREX.com trading platform, and it is not an order route.
- **Auth caution:** there is no API key. You export your logged-in browser session as a `cookies.txt` and the server mints a bearer JWT from it, caching the token on disk (`~/.cache/stonex-mcp/access-token.json` on Linux). That is a live session credential for your whole StoneX account in a file, run by a one-maintainer repo, and it works by replaying the web app's private API, which StoneX has not sanctioned. The README says to treat both files like passwords.
- This corrects the earlier caveat above: a `stonex-mcp` repo does exist and is not the Chinese ops-diagnostics tool that earlier search hit. The status of this entry (no FOREX.com MCP) is unchanged.
