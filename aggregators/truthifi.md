---
name: Truthifi
region: US
status: official
trading: false
server_type: remote
source_url: https://truthifi.com/features/mcp
last_verified: 2026-07-16
---

# Truthifi

## Overview

Read-only account-aggregation MCP, covering 18,000+ financial institutions
(Schwab/Fidelity/Vanguard among them per your original notes).

## How to connect

Add the Truthifi MCP server URL to your AI's MCP config — the exact URL wasn't
recoverable from what's publicly fetchable; it's provisioned after connecting
accounts on the Truthifi platform itself (60-second connect flow, "bank-grade
encrypted aggregation"). The product is separately branded **truthifi-connect.ai**
as a standalone MCP offering — not confirmed whether that's the literal endpoint
hostname or just the product name.

## Trading scope

None. Explicit: *"Your AI can retrieve and reason about your financial data, but it
cannot move money, place trades, execute transactions, or modify your accounts in
any way."*

## Safety / guardrails

"Strictly read-only... an information channel, not an action channel." Dashboard
visibility into which agents/providers/advisors are connected. 130+ automated
"wellness checks" run continuously on the underlying platform (portfolio monitoring,
not MCP-specific).

## Caveats

- Couldn't pin down the literal MCP endpoint URL from public pages — needs an
  account signup to get the real connection string. Everything else above is
  first-hand from Truthifi's own feature page.
