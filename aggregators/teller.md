---
name: Teller
region: US
status: community
trading: false
server_type: local
source_url: https://github.com/elcukro/bank-mcp
last_verified: 2026-07-16
confidence: medium
---

# Teller

## Overview

Teller has no first-party MCP server. It is supported as one provider inside a
community multi-provider server, elcukro/bank-mcp (30 stars, latest v0.1.3 Feb 2026),
which bridges Plaid, Teller, Enable Banking, and Tink to MCP clients. Teller access is
read-only by design: the server's BankProvider interface exposes only listAccounts,
listTransactions, and getBalance, with no write, transfer, or payment-initiation
methods. Requires a Teller developer account and Application ID; Teller authenticates
via mTLS client certificate.

## How to connect

```bash
npx @bank-mcp/server init  (then configure Teller provider with your Teller Application ID + mTLS client certificate)
```

## Trading scope

None.

## Caveats

- NOT official and not Teller-specific — Teller is one of several providers in a
  general banking bridge maintained by an independent developer (elcukro),
  unaffiliated with Teller or Plaid.
- Read-only is a design property of this community server, not a Teller API guarantee.
  The safety claim comes from the repo's own README.
- The repo's 'no cloud relay / nothing stored remotely' privacy claims are
  self-reported by the maintainer and were not independently audited.
- A second candidate, zrabin/personal-finance-mcp (Teller for Chase + Venmo imports),
  appeared in search results but was NOT fetched — its existence and capabilities are
  unverified; do not publish its details.
- I did not fetch teller.io directly, so the official-server negative rests on search
  absence rather than a first-party statement. Confidence medium.
- Teller free tier is reported at up to 100 live connections; this came from a search
  summary, not a fetched Teller page — treat as unverified.

## Sources

Checked directly on 2026-07-16:

- <https://github.com/elcukro/bank-mcp>
