---
name: Gemini
region: US (regulated US exchange)
status: official
trading: true
server_type: local
source_url: https://developer.gemini.com/agentic/agentic
last_verified: 2026-07-16
confidence: high
---

# Gemini

## Overview

Gemini launched official Agentic Trading built on MCP, integrating its full trading
API so an AI agent can do anything the REST API can, including placing orders. The MCP
server lives in the gemini/developer-platform repo (packages/mcp-server) and runs
locally with keys held on the user's machine. Gemini also ships modular 'Trading
Skills' (Get Market Data, Find the Spread, Retrieve Candles).

## How to connect

```bash
Clone https://github.com/gemini/developer-platform, build,
# then:
claude mcp add gemini -s user -e GEMINI_API_KEY=<key> -e GEMINI_API_SECRET=<secret> -- node <repo_root>/packages/mcp-server/dist/index.js
```

## Trading scope

Full Gemini trading API surface. 40+ tools across six categories; the Orders category
covers place/cancel orders, order status, and trade volume. Supports basic buy/sell
through multi-leg positions, plus a sandbox and per-agent subaccounts with isolated
balances.

## Caveats

- Severe name collision: 'Gemini MCP' overwhelmingly returns Google Gemini LLM wrapper
  servers (bsmi021/mcp-gemini-server, philschmid/gemini-mcp-server,
  jamubc/gemini-mcp-tool). None of those are the exchange. The directory entry should
  disambiguate explicitly.
- Note that GEMINI_API_KEY in this context is a Gemini *exchange* credential, not a
  Google AI Studio key — a genuine footgun given the identical env var name.
- Install requires cloning and building the repo; no confirmed one-line npx/global npm
  install was verified.
- Subaccounts with isolated balances are the recommended blast-radius control for
  agent trading here.
- Notable as the first regulated US exchange to offer direct AI agent trading
  integration.

## Sources

Checked directly on 2026-07-16:

- <https://developer.gemini.com/agentic/agentic>
- <https://github.com/gemini/developer-platform>
- <https://www.gemini.com/blog/introducing-agentic-trading-on-gemini-the-future-of-crypto-is-autonomous>
- <https://www.theblock.co/post/399001/gemini-rolls-out-agentic-trading-allowing-ai-bots-to-directly-manage-crypto-exchange-trading-accounts>
