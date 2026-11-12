---
name: B2Trader (B2Broker)
region: Global (white-label platform; availability set by each broker)
status: official
trading: true
server_type: remote
source_url: https://docs.b2broker.com/b2trader/terminal/connect-your-ai-agent/overview
last_verified: 2026-11-11
confidence: high
---

# B2Trader (B2Broker)

## Overview

B2Broker's white-label B2Trader trading terminal exposes two OAuth-protected MCP endpoints per broker deployment, documented on B2Broker's docs site. It is a platform, not a broker: you connect to the domain your broker runs B2Trader on, and the broker can restrict or disable the MCP surfaces. Hence it is listed here as an aggregator.

## How to connect

- Read-only: `https://<your-broker-domain>/mcp-read-only`
- Full access: `https://<your-broker-domain>/mcp-full-access` (connect by URL, not marketplace-listed)

Claude: Settings, Connectors, Add custom connector, paste the URL, sign in via OAuth 2.1 with PKCE. Pre-registered public clients `mcp-read-only` and `mcp-full-access` (anonymous dynamic client registration is not permitted). For CLI agents, e.g. `codex mcp add <name> --url <mcp-url> --oauth-client-id mcp-full-access`. No fixed hosted URL exists to probe, so none was probed. The unrelated `https://docs.b2broker.com/api/mcp` is a docs-search server.

## Trading scope

Read-only surface: 23 tools (market data, portfolio, order and position history, analytics). Full-access surface: 39 tools, adding single and bulk place, cancel and close orders, price triggers and other account mutations. Instruments depend on the broker. One named tool: `trader_get_accounts`.

## Safety / guardrails

- Read-only tools are structurally absent from the read surface; scope `mcp:read`.
- Full access (`mcp:trade`) shows an explicit consent screen but has no per-action confirmation. The page calls actions irreversible and warns about prompt injection.
- Revoke in the broker's Keycloak account console, Applications. No instant kill switch for a token already issued; tokens are short-lived. Normal execution notifications still fire.

## Caveats

- Availability varies by broker; ask the broker for the URL. Not testable without a broker domain.
- Distinct from the in-terminal AI Assistant, which does confirm each trade.

## Sources

Read directly on 2026-11-11: `overview`, `connect-claude`, `connect-custom-agent`, `full-access-safety` pages under <https://docs.b2broker.com/b2trader/terminal/connect-your-ai-agent/>; `llms.txt` of that docs site.
