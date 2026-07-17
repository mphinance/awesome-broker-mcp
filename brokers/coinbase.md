---
name: Coinbase
region: Global (crypto)
status: official
trading: true
server_type: local
source_url: https://docs.cdp.coinbase.com/get-started/tools/cdp-cli-mcp
last_verified: 2026-07-16
---

# Coinbase

## Overview

Not "connect my Coinbase.com account" in the traditional brokerage sense — this is
the **Coinbase Developer Platform (CDP)**: programmatic, KYC-tied onchain wallets
(EVM + Solana), not a wrapper around the retail exchange UI. `@coinbase/cdp-cli`
ships a bundled MCP server.

## How to connect

```
cdp mcp
```
starts a local MCP server over **stdio** (not a remote URL). Point an agent at
`https://docs.cdp.coinbase.com/cdp-cli/skill.md` and it will install the CLI, walk
through API key creation, and verify the connection — designed to be self-installing
via an agent rather than manual setup.

By default Claude Code prompts before every MCP tool call; you can configure
`.claude/settings.json` to auto-approve reads while still requiring confirmation for
writes.

## Trading scope

Every CDP endpoint as a typed tool: create accounts/wallets, sign messages and
transactions, the encode-sign-send pipeline, **token swaps**, smart accounts
(ERC-4337) with optional gas sponsorship. 14 bundled skills for common workflows.
This is closer to "AI agent with a crypto wallet" than "AI agent trading your
Coinbase portfolio."

## Safety / guardrails

Every action ties to a KYC'd account with policy-scoped delegation (Coinbase's own
framing). All mutating operations (create, update, delete, sign, send) require
confirmation — read operations can be auto-approved, writes cannot be by default.

## Caveats

- Don't conflate this with "trading on Coinbase" the way you'd trade on Robinhood —
  it's wallet/onchain infrastructure. If what you actually want is spot-trading your
  personal Coinbase balance, this may not be the right fit; worth double-checking CDP's
  scope against that specific use case before relying on this page for it.
