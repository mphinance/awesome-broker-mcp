---
name: Gemini
region: US (regulated US exchange)
status: official
trading: true
server_type: local (first-party repo server, can trade) and remote (hosted endpoint, read-only per its own instructions)
source_url: https://developer.gemini.com/agentic/agentic
last_verified: 2026-11-11
confidence: high
---

# Gemini

## Overview

Gemini launched official Agentic Trading built on MCP, integrating its trading
API so an AI agent can place orders. Gemini's docs index (`developer.gemini.com/llms.txt`)
now points MCP clients to `developer.gemini.com/tools` (MCP server and agent skills). The MCP
server lives in the gemini/developer-platform repo (packages/mcp-server) and runs
locally with keys held on the user's machine. The same repo's `packages/mcp-plugin/mcp.json`
also declares a **hosted** Streamable HTTP server at `https://api.gemini.com/mcp`. Probed
2026-11-11 with an unauthenticated `initialize` POST (nothing else): HTTP 200, server name
`gemini-mcp` v0.1.0, and its own instructions say it "provides read-only access to Gemini
Trading public market data and OAuth-protected account data". So the hosted route is
read-only by its own statement (tools not enumerated); the local server is the trading route.
Gemini also ships 3 agent skills (see Caveats). An earlier version of this page listed
"Get Market Data, Find the Spread, Retrieve Candles"; those names do not exist in the repo
and were removed.

## How to connect

```bash
Clone https://github.com/gemini/developer-platform, build,
# then:
claude mcp add gemini -s user -e GEMINI_API_KEY=<key> -e GEMINI_API_SECRET=<secret> -- node <repo_root>/packages/mcp-server/dist/index.js
```

## Trading scope

Gemini trading API surface. The repo README now says 50+ tools: market data, orders
(`gemini_new_order`, cancel, cancel-all, status), funds, account (sub-accounts, roles,
approved addresses), margin, staking, and prediction-market symbols/contracts/prices, plus
WebSocket feeds and a native-OS price/balance alert daemon. A sandbox is supported
(`GEMINI_API_BASE_URL=https://api.sandbox.gemini.com`). Master API keys (`master-` prefix)
must also set `GEMINI_ACCOUNT`, or the server exits at startup.

## Caveats

- Severe name collision: 'Gemini MCP' overwhelmingly returns Google Gemini LLM wrapper
  servers (bsmi021/mcp-gemini-server, philschmid/gemini-mcp-server,
  jamubc/gemini-mcp-tool). None of those are the exchange. The directory entry should
  disambiguate explicitly.
- Note that GEMINI_API_KEY in this context is a Gemini *exchange* credential, not a
  Google AI Studio key — a genuine footgun given the identical env var name.
- Install requires cloning and building the repo; no confirmed one-line npx/global npm
  install was verified.
- Recent repo activity (last commit 2026-11-05) moved prediction-market order and combo REST
  calls onto the SDK and switched to millisecond-nonce signing.
- Subaccounts with isolated balances are the recommended blast-radius control for
  agent trading here.
- Notable as the first regulated US exchange to offer direct AI agent trading
  integration.

- The hosted `api.gemini.com/mcp` OAuth flow and tool list were not exercised; "read-only" is
  the server's own `initialize` instructions, not tested behavior.
- The `gemini/developer-platform` repo (8 stars, Apache-2.0, last push 2026-11-10, not
  archived; README read 2026-11-11) also ships a `skills/` folder with 3 `SKILL.md` files
  (`gemini-candles`, `gemini-developer`, `integrate-gemini`), plus Go and TypeScript SDKs
  and samples. The README describes the skills as Claude Code skills (terminal candlestick
  charts and integration help). None of the 3 calls the MCP server or places an order;
  `gemini-developer` teaches the model to write REST/WebSocket/FIX clients, so order placement is
  code the model writes and runs. `gemini-candles` runs `npx -y @neabyte/candlestick-cli`
  unpinned (docs/skills/gemini.md).

## Sources

Checked directly on 2026-11-11 (including `packages/mcp-plugin/mcp.json` and an unauthenticated `initialize` probe of `api.gemini.com/mcp`):

- <https://developer.gemini.com/agentic/agentic>
- <https://github.com/gemini/developer-platform>
- <https://www.gemini.com/blog/introducing-agentic-trading-on-gemini-the-future-of-crypto-is-autonomous>
- <https://www.theblock.co/post/399001/gemini-rolls-out-agentic-trading-allowing-ai-bots-to-directly-manage-crypto-exchange-trading-accounts>
