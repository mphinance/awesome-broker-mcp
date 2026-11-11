---
name: Saxo Bank
region: EU (Denmark) / global
status: community
trading: true
server_type: local
source_url: https://www.developer.saxo/
last_verified: 2026-11-11
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

- The original six community Saxo MCP repos found had 0 stars (one has 1 star as of 2026-11-11) — these are individual hobby
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

## More community repos (checked 2026-11-11)

READMEs read 2026-11-11; stars and last push as of that date. Not affiliated with Saxo Bank, all hold Saxo OpenAPI tokens, all are tiny and unvetted. We read READMEs, not source, so the gates below are the repos' own claims. The GitHub org search surfaced only unofficial repos; Saxo has no first-party MCP, skills or agent repo that we found.

- [`sigvardt/saxo-bank-mcp`](https://github.com/sigvardt/saxo-bank-mcp): Python FastMCP, stdio or HTTP. SIM first, LIVE read-only only when explicitly configured (`SAXO_MCP_ENABLE_LIVE_READS=1`, separate LIVE token cache), and LIVE writes disabled by default. LIVE tooling is a precheck (`saxo_precheck_live_order`) that cannot place, change or cancel an order and sends `ManualOrder=false`. Ships 9 `SKILL.md` files (saxo-trading, saxo-safety-recovery and others). 0 stars, last push 2026-10-08, no license file. No license means no granted right to reuse it.
- [`SirAdlerBD/saxo-mcp`](https://github.com/SirAdlerBD/saxo-mcp): read-only by default; trading tools are not registered and the HTTP client refuses writes unless `SAXO_TRADING=enabled`. `SAXO_ENV=sim` default, and `live` is refused unless `SAXO_ALLOW_LIVE=1` is also set. 0 stars, last push 2026-09-16, MIT.
- [`sajneb/saxo_mcp`](https://github.com/sajneb/saxo_mcp): Python, accounts, quotes, charts, order precheck, place and cancel. SIM default, live "opt-in"; no confirmation gate documented. 0 stars, last push 2026-09-03, no license file.
- [`forsmark/saxo-cli`](https://github.com/forsmark/saxo-cli): Node/TypeScript agent-friendly CLI (not MCP). SIM default; mutating orders need both `SAXO_ENABLE_TRADING=I_ACCEPT_ORDER_RISK` and `--confirm-trading`. 0 stars, last push 2026-06-11, no license file.
- Name collisions ignored: `Kookerella-Ltd/SaxonMCP` (Saxon XSLT), `saxoflowlabs/saxoflow-agenticai` (digital design).


## Sources

Checked directly on 2026-11-11: READMEs and repo metadata of the repos in the section above via the GitHub API, plus `gh search repos` for "saxo" with mcp, cli, agent and skills.

Checked directly on 2026-07-16:

- <https://www.developer.saxo/>
- <https://github.com/chongkwongsheng/saxo-mcp>
- <https://github.com/jgalea/saxo-mcp>
- <https://api.github.com/search/repositories?q=saxo+mcp&sort=stars&order=desc>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
