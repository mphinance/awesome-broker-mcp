---
name: MEXC
region: Global
status: official
trading: true
server_type: local
source_url: https://github.com/mexcdevelop/mexc-cli
last_verified: 2026-11-11
confidence: medium
---

# MEXC

## Overview

MEXC publishes an official CLI for terminals and AI agents (`mexcdevelop/mexc-cli`, MIT, npm `@mexc-ai/cli`, 5 stars, last push 2026-11-06, pre-1.0). The same operation registry generates Markdown skill documents and a local stdio MCP server. 309 operations across spot, contract, futures, earn and activity; 63 need no credentials.

## How to connect

```bash
npm install -g @mexc-ai/cli
mexc skills install --agent claude-code
claude mcp add-json -s user mexc-spot '{"type":"stdio","command":"mexc","args":["mcp","spot","--read-only"]}'
```

Auth: API profiles stored under `~/.mexc`, set by the user with `mexc profile set <name>` in their own terminal. The README tells agents not to configure keys themselves.

## Trading scope

MCP tools per domain: spot 125, contract 117, financial-openapi 51, activity 8. Uploads, downloads and WebSocket operations are not exposed.

## Safety / guardrails

- `--read-only` removes write tools from the MCP server. The README's own MCP examples use it.
- Without it, a host with a confirmation dialog shows one; a host without one gets `confirmation_required` and must call again with `confirm=true`.
- CLI writes need confirmation; `--yes` skips it and agents are told not to add it unprompted. `--dry-run` loads no credentials and sends nothing.

## Caveats

- No hosted endpoint, so no live probe. Tool counts are from the README, not from a tool listing.
- No testnet or paper mode found in the README.
- Pre-1.0: the README warns breaking changes are possible.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/mexcdevelop/mexc-cli>
