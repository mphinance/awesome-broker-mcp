---
name: Crypto.com
region: Global
status: official
trading: false
server_type: remote
source_url: https://mcp.crypto.com/docs/getting-started
last_verified: 2026-07-16
confidence: high
---

# Crypto.com

## Overview

Crypto.com operates an official, hosted remote MCP server ('Crypto Market Data by
Crypto.com', launched 31 Oct 2025) at https://mcp.crypto.com/market-data/mcp. It is
read-only market data — price quotes, order books, conversions, and candlestick
charts. It cannot place orders and does not touch account state. Free, no API key,
works with Claude and ChatGPT desktop apps.

## How to connect

```bash
Add remote MCP endpoint: https://mcp.crypto.com/market-data/mcp — no account, API key, or payment required
```

## Trading scope

none — market data only

## Caveats

- MARKET DATA ONLY — this is the key distinction. Despite being official, it has no
  order-execution or account-access capability whatsoever.
- Easiest onboarding of any entry in this cluster: remote endpoint, zero credentials,
  zero install. Good default for read-only crypto price context.
- Crypto.com's docs state the server accesses only public market data, not user
  conversations, personal information, or local machine data.
- No community server offering Crypto.com *trading* via MCP was identified during this
  research — that gap was not exhaustively searched, so treat as unknown rather than
  confirmed-absent.

## Sources

Checked directly on 2026-07-16:

- <https://mcp.crypto.com/docs/getting-started>
- <https://crypto.com/en/company-news/cryptocom-debuts-first-ai-llm-integrated-mcp>
