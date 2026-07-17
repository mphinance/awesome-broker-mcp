---
name: Trade Republic
region: EU (Germany)
status: community
trading: false
server_type: local
source_url: https://github.com/visusnet/trade-republic-mcp-server
last_verified: 2026-07-16
confidence: medium
---

# Trade Republic

## Overview

No official MCP server and no official public API. Two community MCP servers exist and
were verified: visusnet/trade-republic-mcp-server (7 stars, portfolio, market data,
order books, asset search) and j0nl1/trade-republic-mcp (3 stars, Rust,
portfolio/market data/search/bond analytics). Neither can currently place orders. Both
authenticate with a real Trade Republic phone number + PIN + SMS/app 2FA and work by
reverse-engineering Trade Republic's internal WebSocket API, which the visusnet README
warns may violate Trade Republic's Terms of Service.

## How to connect

```bash
git clone https://github.com/visusnet/trade-republic-mcp-server && npm install  (requires TR_PHONE_NUMBER + TR_PIN; alternative: https://github.com/j0nl1/trade-republic-mcp ships prebuilt binaries or cargo build --release)
```

## Trading scope

none — read-only in practice. visusnet lists order placement/modification/cancellation
as 'coming soon'; j0nl1 exposes no order tools at all.

## Caveats

- The visusnet repo's GitHub description says it 'enables AI assistants to trade
  assets' but the README lists order placement as 'coming soon' — the description
  overstates the capability. Do not list this as an execution-capable server.
- The visusnet README's install snippet is a copy-paste artifact ('git clone
  https://github.com/your-username/trade-republic-bot') that does not resolve — the
  install line given here uses the real verified repo URL instead.
- README explicitly states 'Trade Republic does NOT provide a public API' and that the
  project reverse-engineers their internal WebSocket API from community research;
  using it may violate ToS and risk account action.
- Requires handing full account credentials (phone + PIN) and live 2FA to a
  third-party binary. Sessions cached at ~/.trade-republic-mcp/session.json.
- Both repos are very low-traction (7 and 3 stars).

## Sources

Checked directly on 2026-07-16:

- <https://github.com/visusnet/trade-republic-mcp-server>
- <https://github.com/j0nl1/trade-republic-mcp>
- <https://api.github.com/search/repositories?q=%22trade+republic%22+mcp&sort=stars&order=desc>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
