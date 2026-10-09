---
name: IG
region: UK / global broker — but the MCP server is live in Australia only
status: official
trading: false
server_type: remote (hosted; ChatGPT app only, no client-configurable URL)
source_url: https://www.ig.com/au/trading-platforms/ai-assistant
last_verified: 2026-10-09
confidence: high
---

# IG

## Overview

IG Australia launched an MCP-powered assistant, "IG Trading: CFD Assistant", that
connects a live IG CFD account to an AI assistant. It is deliberately read-only — no
placing, modifying or closing trades — which IG frames as a compliance choice.
Critically for Claude users: it currently ships only as a ChatGPT App Store app. IG's
site says Claude support is coming "soon", but it is NOT live today.

## How to connect

There is no URL to paste. Open ChatGPT → app store → search "IG Trading: CFD Assistant" →
add it, then approve IG's permissions screen (OAuth; your IG password is never shared with
the AI and access is revocable in your IG account settings). Needs an IG CFD account (AU
live; the page does not mention a demo account). **No Claude route yet.**

## Trading scope

none — strictly read-only: live bid/ask, open positions and working orders, P&L,
margin requirements, client sentiment (% long vs short), OHLC history, activity log,
transaction history, watchlists, portfolio metrics.

## Caveats

- Australia only. It appears on IG's AU site and not on other regional sites.
- ChatGPT only at time of writing — Claude is promised "soon" but is not connectable
  today. For a Claude-based directory this is effectively a not-yet route.
- Read-only by design. Cannot place, modify or close orders.
- First-party source, read 2026-10-09: IG's own AI-assistant page. Its FAQ says the app is
  "strictly read-only"; the page lists Claude as "Coming Soon" and other platforms as on the
  roadmap. Page metadata dates it 2026-05-21. "AU only" is inferred from the `/au/` path and
  the AU CFD-account requirement, not stated outright.
- No hosted MCP endpoint, GitHub MCP repo or newsroom launch post found on IG's own
  domains (`ig.com/llms.txt` has no MCP mention; `api.ig.com/mcp` redirects to ig.com;
  the `IG-Group` GitHub org has no MCP repo).
- Community alternative that CAN trade: kea0811/ig-trading-mcp (npm `ig-trading-mcp`
  v1.0.0, 21 tools, `npx ig-trading-mcp serve`). I verified the repo and npm package
  exist. But: only 5 stars, last pushed 2025-08-14, unaudited, and it wants your IG
  username/password in plaintext env vars. Treat as risky — do not point live money at
  it without reading the source.
- github.com/IG-incubator/IG-Skills exists and maps natural language to IG REST
  endpoints including `POST /positions/otc`, but it is Agent Skills definitions, NOT
  an MCP server — and "IG-incubator" is an unverified personal GitHub user account
  (not an org, no company/email set, 1 repo, 0 stars, created and abandoned
  2026-03-10). Do not treat it as official IG.

## Sources

Checked directly on 2026-10-09:

- <https://www.ig.com/au/trading-platforms/ai-assistant>

Checked directly on 2026-07-16:

- <https://www.financemagnates.com/forex/ig-australia-launches-mcp-server-opens-its-trading-platform-to-chatgpt/>
- <https://www.leaprate.com/technology/broker-mcp-ai-agent-trading-infrastructure-race-2026/>
- <https://github.com/kea0811/ig-trading-mcp>
- <https://www.npmjs.com/package/ig-trading-mcp>
