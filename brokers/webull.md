---
name: Webull
region: US (+ HK, JP, SG, TH, MY, UK, MX, BR, EU, ZA, AU per-product)
status: official
trading: true
server_type: remote (Cloud MCP) + local (OpenAPI MCP)
source_url: https://github.com/webull-inc
last_verified: 2026-07-17
---

# Webull

Webull ships **two separate official MCP products**, aimed at different audiences.
Don't conflate them — they have opposite trading postures.

![Webull's two-track MCP strategy](../images/webull-two-track-mcp.png)

## 1. Cloud MCP — hosted, consumer, read-only

The AI-connector-marketplace product: native Claude/ChatGPT integration, zero local
setup.

Hosted endpoint: `https://api.webull.com/mcp`

| Platform | Setup |
|---|---|
| Claude | Native integration via Claude Connectors |
| ChatGPT | Native integration via ChatGPT Apps |
| Codex | `codex mcp add webull --url https://api.webull.com/mcp` |
| Cursor | Settings → MCP Servers → Add Remote MCP Server |
| Zed | `settings.json` under `context_servers` |

**Auth**: OAuth 2.0 authorization-code flow, mobile/email + password + trading
password on Webull's own authorization page. No API key exposed to the AI platform.

**Trading scope**: **read-only.** 60+ functions covering account/position/balance,
order history/status, market data, watchlists, analyst ratings, financials,
dividend/earnings calendars. No order-placement endpoints.

**Safety**: least-privilege — you choose which accounts and capability groups
(Account Info, Order Query, Market Data, Security Master) the agent can see.

Source: [developer.webull.com](https://developer.webull.com/apis/docs/AI-friendly-Resources/mcp/)

## 2. OpenAPI MCP — local, developer, full trading

`github.com/webull-inc/webull-openapi-mcp` — published under Webull's own verified
GitHub org, built on their official `webull-openapi-python-sdk`. This is the one
with actual order placement.

**Connect**:
```
uvx webull-openapi-mcp auth    # interactive 2FA, approve in the Webull mobile app
uvx webull-openapi-mcp serve
```
App Key + App Secret from a regional Webull developer portal (developer.webull.com
for US, region-specific portals otherwise), set via env vars or `.env`. Tokens
auto-refresh; re-auth needed only after the 15-day expiry.

**Trading scope — full order lifecycle**: place, modify (`replace_*_order`), cancel,
query. Stocks, options, futures, crypto, event contracts. Combo orders
(OTO/OCO/OTOCO, US only), multi-leg options (US only), algo orders — TWAP, VWAP, POV
(US only). Region-specific order types and session validation apply.

**Safety / guardrails**: notional limits by currency (e.g.
`WEBULL_MAX_ORDER_NOTIONAL_USD=10000` default), max order quantity caps, symbol
whitelist enforcement, audit logging.

**Maintenance**: Apache 2.0, 12 stars, 23 commits, actively developed but modest in
scope — a young project, not battle-tested at scale.

## 3. OpenAPI Skills — CLI/agent-skill layer

`github.com/webull-inc/webull-openapi-skills` — also built on the official SDK, same
org. A skill/CLI wrapper rather than an MCP server: `webull-skill auth`,
`webull-skill trading --action account-list`, etc. Multi-region, same asset-class
and risk-control coverage as the MCP server. 21 commits, actively developed.

## How they relate

```mermaid
flowchart TD
    SDK["webull-openapi-python-sdk\n(official, Apache 2.0, full trading)"]
    MCP["webull-openapi-mcp\n(official, local, full trading MCP)"]
    Skill["webull-openapi-skills\n(official, CLI/agent-skill layer)"]
    Sidecar["webull-sidecar\n(mph's private companion app)"]
    Cloud["Cloud MCP\n(official, hosted, read-only)"]

    SDK --> MCP
    SDK --> Skill
    SDK --> Sidecar
    Cloud -.separate product, no shared code.-> SDK
```

`webull-sidecar` (documented separately, private) independently confirmed the SDK's
trading capability before either official MCP repo surfaced in this conversation —
now corroborated by Webull's own developer-facing MCP server.

## Caveats

- If you want an AI agent trading through Claude's official connector marketplace
  today, you're stuck with Cloud MCP's read-only scope. Full trading requires the
  local `webull-openapi-mcp` (or the skills CLI), both of which are young/lower-star
  repos — spot-check current state before relying on them for real money.
- Watch for Webull eventually merging trading into Cloud MCP — the capability and an
  official local implementation both already exist, it's a product decision away.
