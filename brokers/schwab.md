---
name: Charles Schwab
region: US
status: community
trading: true
server_type: local
source_url: https://github.com/jkoelker/schwab-mcp
last_verified: 2026-07-16
---

# Charles Schwab

## Overview

Community server (`jkoelker/schwab-mcp`), self-hosted, not Schwab-provided. Actively
developed: 227 commits, 58 stars, 4 watchers. **No official Schwab AI assistant with
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

**Read-only by default.** Trading requires explicit opt-in *plus* a Discord-bot
approval workflow — an unusual extra layer versus every other server in this
directory. Two-step order flow: preview first, then place by ID, specifically to
prevent an LLM from hallucinating a different order than what was previewed. A
bypass flag (`--jesus-take-the-wheel`) exists and is marked "DANGER" in the repo's
own docs — skips the approval layer entirely.

## Caveats

- The Discord-bot-approval requirement is a real setup cost most other brokers in
  this directory don't have — factor that in before assuming "connect and go."
