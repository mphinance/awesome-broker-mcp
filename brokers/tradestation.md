---
name: TradeStation
region: US
status: official
trading: true
server_type: remote
source_url: https://www.tradestation.com/platforms-and-tools/mcp/
last_verified: 2026-11-11
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

**Two gates, as of the 2026-07-16 source:**

- Active **Claude Pro** subscription (or an equivalent supported ChatGPT tier)
- Minimum **$10,000** TradeStation account balance for MCP access

The product page re-read on 2026-11-11 (real browser) does not repeat either figure. It says
only that you need access to add custom connectors from your AI provider (not billed by
TradeStation) and must request MCP access in HUB. Treat the $10k and Claude Pro gates as
**unconfirmed since July**; check HUB before relying on them.

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

- `tradestation.com` returned HTTP 403 to earlier automated fetches. A normal desktop browser
  reads it fine; the upstream check still cannot watch the page, so it needs a manual
  re-read.
- **Institutional MCP (new on the page, 2026-11-11).** A separate "MCP for professional
  teams" section describes a permissioned layer between AI applications and TradeStation's
  execution, market data and account APIs, for firms. It links an institutional MCP page we
  have not read, so scope and endpoint for that product are unknown.
- **Product page wording (2026-11-11).** "Available today to TradeStation clients who use
  Claude or ChatGPT, with support for additional AI platforms in development." It repeats
  that explicit confirmations are required before orders are placed and that actions stay
  subject to your existing trading permissions and risk controls. That is the vendor's
  claim; where the confirmation is enforced is not stated.
- Endpoint probe (2026-11-11): an unauthenticated POST to
  `https://mcp.tradestation.com/v2/mcp` returns 401 "Bearer token required", so it is live and
  OAuth-gated. No token was sent and no tool was called.
- `tradestation.com/llms.txt` now lists the MCP page; it also links
  `developer.tradestation.com/llms.txt` and `institutional.tradestation.com` llms files (the
  developer one lists the MCP page and nothing else about it). `llms-full.txt` exists and was
  not read.
- Community alternative if the official gate (paid AI tier + $10k) doesn't fit:
  [`maven81g/tradestation_mcp`](https://github.com/maven81g/tradestation_mcp) — Node.js
  18+, local, OAuth env vars. Third-party, not independently verified.

## Other community repos (checked 2026-11-11)

READMEs read 2026-11-11; stars and last push as of that date. The `tradestation` GitHub org holds API docs and old C#/PHP samples only (13 repos, no MCP, skills or agent repo). All servers below are third-party and hold TradeStation API client secrets plus a refresh token that can trade your account, so treat them as unvetted. We read READMEs only, not source.

- [`theelderwand/tradestation-mcp`](https://github.com/theelderwand/tradestation-mcp): Python, on PyPI, 36 tools across market data, brokerage and order execution (`place_order`, confirm, replace, cancel, group OCO and bracket orders). 6 stars, last push 2026-02-07, MIT. **Trades.** The README states plainly that the `place_order` tool description tells the LLM to call `confirm_order` first, but "this is guidance, the tool itself does not enforce it." Its own example denies `place_order` and `place_group_order` in the client.
- [`jonathansudhakar1/tradestation-cli-mcp`](https://github.com/jonathansudhakar1/tradestation-cli-mcp): Python library, `ts` CLI and `ts-mcp` server for the v3 REST API. 0 stars, last push 2026-06-02, MIT. Default environment is SIM (paper). `ts order place --dry-run` previews; `ts-mcp --read-only` blocks all order tools. README says order placement is mock-tested, not live-verified. Tiny and new: unvetted.
- [`dersyshore7/tradestation-mcp-scanner`](https://github.com/dersyshore7/tradestation-mcp-scanner): TypeScript options scanner with an HTTP MCP server exposing two read-only tools (`scan_prompt_to_best_ticker`, `construct_trade_card`). The README also mentions separate paper and live automation lanes that apply a per-entry account cap before placement, so it is not purely a scanner. 0 stars, last push 2026-07-30, no license file. Unvetted.
- Not brokerage: `cambrar/cursor-tradestationcommunity-mcp` searches the TradeStation Community forum with your forum login, and `quantmonitornet/Tradestation-Agent` is unrelated.

## Sources

Checked directly on 2026-07-16 and again on 2026-11-11 (browser):

- <https://www.tradestation.com/platforms-and-tools/mcp/>
- <https://www.tradestation.com/llms.txt>
- <https://developer.tradestation.com/llms.txt>
- <https://github.com/maven81g/tradestation_mcp>
