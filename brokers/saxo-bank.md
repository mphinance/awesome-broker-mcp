---
name: Saxo Bank
region: EU (Denmark) / global
status: community
trading: true
server_type: local
source_url: https://www.developer.saxo/
last_verified: 2026-07-16
confidence: medium
---

# Saxo Bank

## Overview

No official Saxo MCP server: developer.saxo documents the OpenAPI (REST + streaming,
OAuth 2.0/SAML2, order placement) with no mention of MCP, and Saxo is absent from the
openbankingtracker agentic-banking directory. However, Saxo has the healthiest
community MCP ecosystem in this cluster because it is the only broker here with a real
first-party public API to wrap. GitHub search surfaces six community servers; two were
verified: jgalea/saxo-mcp (TypeScript, 9 read-only tools, OAuth2 PKCE, macOS Keychain,
app registered without trading permission) and chongkwongsheng/saxo-mcp (Python, 10
read tools plus gated place/cancel/modify order writes, SIM by default).

## How to connect

```bash
git clone https://github.com/chongkwongsheng/saxo-mcp && pip install -e . && saxo-mcp login  (Python 3.10+; read-only alternative: git clone https://github.com/jgalea/saxo-mcp && npm install && npm run build && node dist/cli.js auth)
```

## Trading scope

Equities, FX, CFDs, futures, options — whatever the Saxo OpenAPI account is entitled
to. Order placement exists only in chongkwongsheng/saxo-mcp, behind explicit gates;
jgalea/saxo-mcp is read-only by design.

## Caveats

- All six community Saxo MCP repos found have 0 stars — these are individual hobby
  projects, not maintained infrastructure. jgalea/saxo-mcp has only 5 commits.
- Not affiliated with Saxo Bank; chongkwongsheng/saxo-mcp states this explicitly in
  its README.
- Writes in chongkwongsheng/saxo-mcp are triple-gated: SAXO_WRITES_ENABLED=1 for SIM,
  the literal string 'live-i-mean-it' for LIVE, plus confirm=True per call. Defaults
  to SIM.
- Saxo OpenAPI access requires developer registration; live-account API onboarding has
  additional requirements beyond the free developer signup.
- jgalea/saxo-mcp deliberately has NO order placement — do not treat the two repos as
  interchangeable.

## Sources

Checked directly on 2026-07-16:

- <https://www.developer.saxo/>
- <https://github.com/chongkwongsheng/saxo-mcp>
- <https://github.com/jgalea/saxo-mcp>
- <https://api.github.com/search/repositories?q=saxo+mcp&sort=stars&order=desc>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
