---
name: TradeStation
region: US
status: official
trading: true
server_type: remote
source_url: https://www.tradestation.com/platforms-and-tools/mcp/
last_verified: 2026-07-16
confidence: high
---

# TradeStation

## Overview

Official MCP server from TradeStation Securities (built by affiliate TradeStation
Technologies). **Remote/hosted** — the product page states it is *"a remote
integration—not locally hosted."*

**No longer Claude-only.** ChatGPT (Plus/Pro/Business/Enterprise/Edu) is live as of
TradeStation's 2026-07-16 setup article. Our earlier "other AI platforms coming soon"
line has shipped.

> ### This entry was wrong about the most basic fact
>
> We had `server_type: local (unconfirmed)`, justified by "configuration is via
> environment variables — client ID, client secret, refresh token, redirect URI — which
> is the signature of a locally-run OAuth-managing process."
>
> Those env vars belong to the **community** repo (`maven81g/tradestation_mcp`). We
> imported the community server's requirements into the official section and then
> *inferred* "local" from them. The official server is remote and needs no local
> process at all. A reminder that inference from adjacent evidence is not verification.

## How to connect

Hosted endpoint:

```
https://mcp.tradestation.com/v2/mcp
```

Request access in **TradeStation HUB** (my.tradestation.com → Platforms page), then
authorize via OAuth in your AI platform. In ChatGPT, choose **"Server URL (not
Tunnel)"** and enter the endpoint above. No local process, no Node.js.

**Two hard gates, not just account setup:**

- Active **Claude Pro** subscription (or an equivalent supported ChatGPT tier)
- Minimum **$10,000** TradeStation account balance for MCP access

## Trading scope

Real-time quotes, historical price data, account information, order placement, and
token management.

**It places orders directly** — the product page lists trade execution, and
TradeStation's ChatGPT article says "the AI can see account balances/positions and place
orders." An earlier version of this page hedged that "order previews" might mean
draft-then-manually-submit like [IBKR](interactive-brokers.md). It doesn't. This is
`trading: true`, not `draft-only`.

## Safety / guardrails

Now documented, where previously we found nothing: *"all actions remain subject to your
existing trading permissions and risk controls,"* with **confirmation required before
orders execute** and granular grant/deny per capability.

The $10k balance gate and paid-AI-tier requirement are themselves a filter, though not
a per-trade control.

Note the distinction from IBKR: TradeStation confirms *in the AI client* before
executing. IBKR cannot execute at all and makes you submit in the broker's own UI.
Confirmation-in-the-client is weaker — it's the same surface the agent is operating on.

## Caveats

- `tradestation.com` returned HTTP 403 to earlier automated fetches; the 2026-07-16
  ChatGPT setup article is the fetchable first-party source for the endpoint.
- Community alternative if the official gate (paid AI tier + $10k) doesn't fit:
  [`maven81g/tradestation_mcp`](https://github.com/maven81g/tradestation_mcp) — Node.js
  18+, local, OAuth env vars. Third-party, not independently verified.

## Sources

Checked directly on 2026-07-16:

- <https://www.tradestation.com/platforms-and-tools/mcp/>
- <https://github.com/maven81g/tradestation_mcp>
