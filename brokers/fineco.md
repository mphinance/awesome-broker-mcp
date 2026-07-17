---
name: Fineco
region: EU (Italy)
status: community
trading: false
server_type: local
source_url: https://github.com/morettimarco/fineco-mcp
last_verified: 2026-07-16
confidence: medium
---

# Fineco

## Overview

No official FinecoBank MCP server; Fineco does not appear in the openbankingtracker
agentic-banking directory. Two tiny community MCP servers exist and were verified,
both read-only personal-finance tooling rather than broker integrations:
morettimarco/fineco-mcp (1 star, 2 commits — ingests Fineco account/portfolio/order
CSV exports into a local SQLite DB for Claude Desktop) and rock3r/fineco-helper (1
star — a single self-contained Rust binary serving owner-only remote MCP over cached
read-only Fineco data: portfolio snapshots, order history, tax data, gated by
Cloudflare Access).

## How to connect

```bash
git clone https://github.com/morettimarco/fineco-mcp && uv pip install -e .  (ingests CSV exports, no live connection)
```

## Trading scope

none — both verified servers are read-only. rock3r/fineco-helper states 'No trading or
mutation, ever.'

## Caveats

- Neither server can place orders. If the directory's purpose is execution routes,
  Fineco is effectively a negative.
- morettimarco/fineco-mcp is not a live broker connection at all — it parses manually
  downloaded exports (files carry .xls/.xlsx extensions but are actually CSV). Data is
  as stale as the last manual export.
- rock3r/fineco-helper is explicitly 'an unofficial helper and is not affiliated with
  FinecoBank'; its README references a credential worker doing read-only Fineco login
  with session cookies, but does not document whether that is an official API or
  scraping — assume scraping and assume ToS risk.
- Both repos are 1-star, early-stage, single-author projects (fineco-mcp has 2
  commits). Not production infrastructure.
- gabrielerandelli/minus-tracker also surfaces in Fineco/DEGIRO MCP searches but is an
  Italian capital-gains (LIFO/FIFO) tax calculator, not a broker server.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/morettimarco/fineco-mcp>
- <https://github.com/rock3r/fineco-helper>
- <https://api.github.com/search/repositories?q=fineco+mcp&sort=stars&order=desc>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
