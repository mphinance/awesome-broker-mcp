---
name: Bitget
region: Global
status: official
trading: true
server_type: local
source_url: https://github.com/Bitget-AI/agent-mcp
last_verified: 2026-11-11
confidence: high
---

# Bitget

## Overview

Bitget publishes an official MCP server, `@bitget-ai/bitget-agent-mcp`, in the Bitget-AI GitHub organization (MIT, repo created 2026-05-29, last push 2026-09-01). It runs as a local stdio process on the Bitget Unified Trading Account (UTA v3) API: 89 operations exposed through 14 tools (12 intent verbs plus `discover` and `raw`) rather than one tool per endpoint. It is part of Bitget Agent Hub, which also ships a `bgc` CLI, an SDK and Markdown skills.

## How to connect

```bash
npx -y @bitget-ai/bitget-agent-mcp
```

Auth: a Bitget API key, secret and passphrase in `BITGET_API_KEY`, `BITGET_SECRET_KEY` and `BITGET_PASSPHRASE`. Requests are signed locally with HMAC-SHA256 and go straight to Bitget. The `market` verb is public and needs no keys.

## Trading scope

Spot, futures, account and funds management (including internal transfers), sub-accounts, crypto loans and tax. The Agent Hub README also describes tokenized US stock trading. Modules: `account,trade,market` by default; `strategy`, `cryptoloans` and `tax` on demand.

## Safety / guardrails

- `--read-only` rejects every write (orders, transfers, cancels, withdrawals) before it reaches Bitget.
- `--paper-trading` routes signed requests to Bitget Demo Trading with a separate demo API key. Mutually exclusive with `--read-only`.
- High-risk operations require `confirm: true`; any write accepts `dryRun: true` for a no-network preview.
- Live trading is the default when neither flag is passed.

## Caveats

- Not run or tool-listed by us; tool count is from the README. No hosted endpoint, so nothing to probe.
- Terminal agents can use the sibling `Bitget-AI/agent-cli` (`bgc`) plus `Bitget-AI/agent-skill` (both MIT) instead of MCP. The hub repo `Bitget-AI/agent_hub` has 234 stars; the MCP repo itself had 1.
- The MCP registry lists the server as `io.github.Bitget-AI/bitget-agent-mcp`. Community keyless price-only servers also exist; ignore them for trading.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/Bitget-AI/agent-mcp>
- <https://github.com/Bitget-AI/agent_hub>
- <https://registry.modelcontextprotocol.io> (search "bitget")
