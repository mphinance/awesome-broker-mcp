---
name: Charles Schwab
region: US
status: community
trading: true
server_type: local
source_url: https://github.com/jkoelker/schwab-mcp
last_verified: 2026-11-11
---

# Charles Schwab

## Overview

Community server (`jkoelker/schwab-mcp`), self-hosted, not Schwab-provided. Actively
developed: about 352 commits, 69 stars, last push 2026-11-11. **No official Schwab AI assistant with
MCP exists** — Schwab has an assistant expected H2 2026 per earlier reporting, but
nothing MCP-shaped from Schwab itself was found in this repo or elsewhere.

## How to connect

```
schwab-mcp auth --client-id YOUR_KEY --client-secret YOUR_SECRET --callback-url https://127.0.0.1:8182
```
via `uv tool install` or `pip`. OAuth through the Schwab Developer Portal opens a
browser login; token saved locally to `~/.local/share/schwab-mcp/token.yaml`.

## Trading scope

Equities, options, complex strategies (bracket orders, OCO).

## Safety / guardrails

**Read-only by default.** Trading requires explicit opt-in *plus* an approval backend: a Discord bot, or
Signal via a local signal-cli REST daemon (one backend, not both). This is an
approval workflow — an unusual extra layer versus every other server in this
directory. Two-step order flow: preview first, then place by ID, specifically to
prevent an LLM from hallucinating a different order than what was previewed. A
bypass flag (`--jesus-take-the-wheel`) exists and is marked "DANGER" in the repo's
own docs — skips the approval layer entirely.

## Caveats

- The Discord-bot-approval requirement is a real setup cost most other brokers in
  this directory don't have — factor that in before assuming "connect and go."

## Other community servers

Not endorsed by Schwab; same credential-trust caveat as above. READMEs read 2026-11-11; stars and last push as of that date.

- [`sudowealth/schwab-mcp`](https://github.com/sudowealth/schwab-mcp): TypeScript, Cloudflare Workers with Durable Objects, OAuth 2.0 with PKCE (87 stars, last push 2025-06-02, no license file, not archived). README calls itself unofficial and "may be incomplete or unstable". Covers accounts, orders, quotes, options chains, movers. Stale for 5 months.
- [`itsmostafa/schwab-mcp`](https://github.com/itsmostafa/schwab-mcp): Go single-binary stdio server for the Trader API; README says it reads accounts, pulls market data and places trades (5 stars, last push 2026-09-16, MIT, not archived). Tool surface not enumerated here.
- `major/schwab-agent` and `major/schwab-agent-rs`: ARCHIVED agent-oriented Schwab CLI (last pushes 2026-05-18 and 2026-06-01), superseded by `major/schwab-rs`. Not read; listed so nobody builds on the archived repos.
