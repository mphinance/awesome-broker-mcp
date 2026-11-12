---
name: Luno
region: Global (crypto exchange; Africa, UK and parts of Europe, Asia)
status: official
trading: true
server_type: local
source_url: https://github.com/luno/luno-mcp
last_verified: 2026-11-11
confidence: medium
---

# Luno

## Overview

Luno publishes `luno/luno-mcp` under its own GitHub organization: an MIT-licensed Go MCP server for the Luno exchange API (created 2025-05-22, 29 stars, last push 2026-10-30), distributed as a Docker image, Homebrew tap and `go install`. Local stdio by default, optional SSE.

## How to connect

```bash
claude mcp add luno -- docker run --rm -i -e LUNO_API_KEY_ID=YOUR_API_KEY_ID -e LUNO_API_SECRET=YOUR_API_SECRET ghcr.io/luno/luno-mcp:latest
```

Auth: a Luno API key id and secret from the user's Luno developer settings. Public tools work without keys.

## Trading scope

Price and market data, account balances and transactions, and three write tools: `create_order`, `cancel_order` and `convert`.

## Safety / guardrails

Read-only by default: the three write tools are not exposed unless `ALLOW_WRITE_OPERATIONS` is set to `true`, `1` or `yes` (or `--allow-write-operations`). The README also advises keys without withdrawal permission.

## Caveats

- No hosted endpoint, so no probe. Tool table taken from the README.
- No paper mode found; `LUNO_API_DOMAIN` can point at Luno's staging API.
- Listed on Glama, which is not a first-party check.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/luno/luno-mcp>
