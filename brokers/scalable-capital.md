---
name: Scalable Capital
region: EU (Germany, Austria, Italy, Spain, France, Netherlands)
status: official
trading: true
server_type: remote
source_url: https://de.scalable.capital/en/agentic-investing
last_verified: 2026-10-19
confidence: medium
---

# Scalable Capital

## Overview

Scalable Capital (a German bank and broker, Scalable Capital Bank GmbH, Munich) runs an
**official, hosted MCP server** called "Agentic Investing", launched in August 2026. It can
prepare buy and sell orders on your real account, and each order executes only after you
confirm it explicitly in a separate step. Scalable also ships an official local CLI. The
CLI is a separate product with its own access setting.

## How to connect

1. On the **web** (the setting isn't in the app), go to Profile > Security > Agentic Investing
   and pick an MCP access level: No access, Read-only, Limited changes or Full access.
2. Add a remote MCP server or custom connector with this URL:

```
https://mcp.scalable.capital/mcp
```

Scalable documents setup for ChatGPT (developer mode, then Plugins > +), the ChatGPT
desktop app or Codex (Streamable HTTP), Claude (Customize > Connectors > Add custom connector)
and Grok (grok.com/connectors > New Connector > Custom). The first setup has to be done on
the web, not in the mobile apps.

Auth: you sign in to Scalable through the AI app and complete two-factor
authentication on your trusted device, then authorise the connection. You never paste a
password or API key into the chat.

## Trading scope

- **Orders:** buy and sell orders, available only on **Full access**. Read-only and
  Limited changes cannot submit orders.
- **Other writes:** savings plans, price alerts and watchlist edits, and changing the
  limit on an existing order. Scalable's example prompt is "Change the limit for my
  Siemens buy order…".
- **Reads:** holdings, asset allocation, cash and interest, price data and transactions.
- **Not available:** payments. Scalable says "payments are never handled by agents".

## Safety / guardrails

- **Order confirmation is a separate, explicit step.** Scalable's FAQ says the agent can
  *prepare* an order, and before it is submitted you must review the order details,
  estimated costs, disclosures and warnings, then confirm it. "An order preview does not
  place an order. An AI agent cannot place a buy or sell order without your renewed,
  explicit confirmation."
- **Standard checks still apply:** account permissions, order validation, market
  availability, and appropriateness or suitability checks where relevant.
- **One global access level** covers every connected assistant and every portfolio. You
  can't give one assistant read-only and another full access.
- **Activity is visible** in real time on the web and in the app, and you can switch access
  off at any time.

## Caveats

- We didn't connect an account, so the tool list comes from Scalable's pages, not from a
  live `tools/list`. Scalable notes that the AI provider may expose fewer functions than
  the server supports.
- Scalable doesn't say where the "separate step" confirmation happens: in the chat (for
  example MCP elicitation) or in Scalable's own UI. If it turns out to be Scalable's UI,
  this entry should move to `draft-only`.
- Scalable doesn't publish a country list for Agentic Investing itself. The region above
  is where Scalable operates.
- Scalable's disclaimer says AI outputs and transactions "originate solely from the third
  party" and are not Scalable's advice.

## Sources

Checked directly on 2026-10-19:

- <https://de.scalable.capital/en/agentic-investing> (product page: MCP URL, per-client setup, permission levels, "payments are never handled by agents", CLI vs MCP)
- <https://help.scalable.capital/en/agentic-investing-aac939f8/how-do-i-connect-to-scalable-mcp-75fc6a40> (access levels, global scope, web-only setup, 2FA sign-in)
- <https://help.scalable.capital/en/agentic-investing-aac939f8/how-are-orders-approved-and-protected-when-using-scalabl-d16595b5> (orders only on Full access; preview + separate explicit confirmation)
