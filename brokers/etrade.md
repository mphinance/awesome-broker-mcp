---
name: E*TRADE
region: US
status: community
trading: false
server_type: local
source_url: https://github.com/davdunc/mcp_etrade
last_verified: 2026-07-16
confidence: high
---

# E*TRADE

## Overview

`davdunc/mcp_etrade` — a community server. **It cannot place orders**, despite
widespread claims to the contrary.

> ### This entry was wrong, and the correction is instructive
>
> We previously listed `trading: true` with "order placement with integrated risk
> validation." That describes the **Python client library**, not the **MCP tool
> surface**, and those are not the same thing.
>
> `list_tools()` in `mcp_etrade/server.py` registers **24 tools** — 5 OAuth, 4 account,
> 3 alerts, 4 market data, 4 watchlist, 4 risk. **None of them place, preview, or cancel
> an order.** `place_order`, `preview_order` and `cancel_order` exist only as methods on
> `ETradeClient` in `etrade_client.py`, exercised by `tests/test_orders_api.py`. They are
> never exposed over MCP. An LLM connected to this server has no way to trade.
>
> The Glama listing we previously cited as our source actively asserts the server
> "supports order placement." The repo contradicts it. **The repo wins.**

## How to connect

```bash
uvx --from git+https://github.com/davdunc/mcp_etrade.git mcp_etrade
```

Or run locally: `python -m mcp_etrade.server`

**Auth:** full E\*TRADE OAuth 1.0a flow — `get_request_token` → `get_authorization_url`
→ `get_access_token`, with token refresh/revocation.

## Trading scope

**None over MCP.** Account management, portfolio viewing, real-time quotes, option
chains, and watchlist management are all available. Order placement is not.

## Safety / guardrails

The risk features are **advisory only** — weaker than our earlier description implied,
which is the dangerous direction to be wrong in.

The numbers are real code: `risk_guardrails.py` caps position size at 50% of account
value (`if order_value > account_balance * 0.5`) and enforces a daily limit
(`account_balance * (risk_percentage / 100)`, default `1.0`). But `RiskGuardrails` is a
pure in-memory calculator the model must **voluntarily call** via `validate_order_risk`.

Nothing is automatic and nothing is capped:

- There is no order path for it to gate — the server can't place orders anyway.
- State is per-process and lost on restart.

Read it as a calculator the model may consult, not a control.

## Caveats

- **One commit, ever.** "Initial release", 2025-09-08, never touched since. 6 stars, 0
  open issues.
- `pyproject.toml` declares GPL-3.0 but there is **no LICENSE file**, so GitHub reports
  `license: null`. If licensing matters to you, this is unresolved.
- Glama rates maintenance **D** and warns it "cannot currently be installed... due to
  quality assessment concerns." That warning is real and accurately quoted.
- Maintainer *is* identified (David Duncan / davdunc) — an earlier version of this page
  said otherwise. The concern isn't anonymity, it's that the project has never been
  updated.

## Sources

Checked directly on 2026-07-16 (repo cloned and tool surface enumerated):

- <https://github.com/davdunc/mcp_etrade>
- <https://glama.ai/mcp/servers/@davdunc/mcp_etrade>
