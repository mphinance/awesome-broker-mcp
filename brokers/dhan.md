---
name: Dhan
region: India
status: official
trading: true
server_type: remote
source_url: https://mcp.dhan.co/mcp
last_verified: 2026-11-11
confidence: low
---

# Dhan

## Overview

Dhan (Raise Securities) appears to run a hosted MCP server at `https://mcp.dhan.co/mcp`. The endpoint is live and sits on Dhan's own domain, and the DhanHQ docs site has a top-level "MCP" section. We could not read that section: `docs.dhanhq.co/mcp/` served the generic Get OHLC page when fetched. The feature details below come from one secondary review (onetradejournal.com, 2026-10-13), not from Dhan.

## How to connect

Remote URL: `https://mcp.dhan.co/mcp`. Auth is OAuth through Dhan's browser sign-in rather than a static token (per the secondary review; consistent with the 401 challenge below).

## Trading scope

The secondary review says order placement, modification and cancellation are available, and quotes a docs warning that order tools "place real orders on your live Dhan account." Unverified against Dhan's own docs.

## Safety / guardrails

None confirmed from first-party sources.

## Caveats

- Live probe, 2026-11-11 (unauthenticated initialize POST, default curl user agent): HTTP 401 with `WWW-Authenticate: Bearer error="invalid_token"` and OAuth resource metadata at `mcp.dhan.co/.well-known/oauth-protected-resource/mcp` (resource `https://mcp.dhan.co/mcp`). The endpoint is live and OAuth-protected.
- Dhan docs MCP pages unreadable (docs site fell back to an unrelated page): treat tool list, guardrails and trading scope as unconfirmed.
- Community Dhan MCP servers also exist; this entry is about the dhan.co endpoint only. DhanHQ has a Sandbox page in its docs; whether the MCP can use it is unknown.

## Sources

Checked directly on 2026-11-11:

- <https://mcp.dhan.co/mcp> (probe)
- <https://docs.dhanhq.co/mcp/> (fetch did not return MCP content)
