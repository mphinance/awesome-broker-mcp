---
name: Freedom24 (Tradernet)
region: Freedom24 / Tradernet customers (country availability not checked)
status: official
trading: true
server_type: remote
source_url: https://github.com/tradernet-api/tradernet-mcp-claude
last_verified: 2026-11-11
confidence: medium
---

# Freedom24 (Tradernet)

## Overview

Tradernet, the platform behind Freedom24, publishes a hosted MCP endpoint plus client packages under its GitHub org `tradernet-api` ("tradernet.com/freedom24.com API Support", blog tradernet.com). Repos exist for Claude Desktop, Codex and Cursor (created and pushed August 2026, MIT, tiny star counts). Tradernet's own API site has a page titled "Tradernet MCP" at `tradernet.com/tradernet-api/mcp`.

## How to connect

Endpoint: `https://tradernet.com/mcp/tn`. The Claude Desktop package uses the `mcp-remote` bridge with an API key and secret sent as `X-TN-API-Key` and `X-TN-API-Secret` headers (HMAC), created at `tradernet.com/tradernet-api/auth-api`. A session id (`X-TN-SID`) route exists for login-based tools.

Endpoint probe, 2026-11-11: an unauthenticated JSON-RPC `initialize` returned `200` with a normal initialize result; no tool calls were made.

## Trading scope

README says about 61 tools: quotes, portfolio, orders, news, alerts, watchlists, analytics, tariffs, reports. Named order tools: `orders_put`, `orders_delete`, `orders_set_stop_loss`. Asset classes and order types per tool were not read.

## Safety / guardrails

- README warns that every call runs against a real Tradernet account and recommends a dedicated test account.
- README says Claude Desktop has no write-guard hook and tells the assistant to confirm with you before mutating tools. That is a prompt-level rule, not enforced by the server.
- Live orders "may also need" `orders_open_security_session` and `orders_confirm_security_session` (one-time code) before `orders_put`.

## Caveats

- Credentials are a full-access API key and secret held in local env files; the server itself is hosted by Tradernet.
- Official status rests on the org linked from the broker's site and its API docs page; the repos are small and young (v1.0.0).
- Tool schemas and the unauthenticated behaviour of tool calls were not tested.

## Sources

Read directly on 2026-11-11: <https://github.com/tradernet-api/tradernet-mcp-claude>, <https://tradernet.com/tradernet-api/mcp> (title and index only), GitHub org `tradernet-api`; initialize probe of `https://tradernet.com/mcp/tn`.
