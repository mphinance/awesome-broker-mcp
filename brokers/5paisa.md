---
name: 5paisa
region: India
status: official
trading: true
server_type: local
source_url: https://5paisa.com/technology/mcp-ai-trading-assistant
last_verified: 2026-11-11
confidence: low
---

# 5paisa

## Overview

5paisa Capital announced "5paisa MCP" in June 2025 (community-forum post dated 2025-06-17, plus press releases): an AI trading assistant that runs through Claude Desktop on Windows, Mac and Linux and uses the 5paisa XStream APIs. The product page and setup guides are on 5paisa.com.

## How to connect

Follow the 5paisa setup guides for Windows, Mac or Linux (linked from the product page). The page lists no install commands and no repository URL. A secondary review (onetradejournal.com) says the code is on 5paisa's GitHub and credentials sit in a local `creds.json`; we did not verify that.

Auth: 5paisa API credentials plus TOTP. The page says "TOTP and API keys stay on your device."

## Trading scope

Account details, live market data, order book, holdings, margin checks, P&L charts and backtests. Orders by natural language: the page's example is "Place a buy order for 11 shares of Bharat Syntech." Tool names are not published on the page.

## Safety / guardrails

Credentials stay local, API calls are encrypted, and the page says actions (orders, backtests, data pulls) are logged. No confirmation step before an order is described.

## Caveats

- Local server; no endpoint to probe. Source repository and license not confirmed, so the code was not inspected.
- The product page has only a 2026 copyright year; the 2025-06-17 date is from the forum announcement.

## Sources

Checked directly on 2026-11-11:

- <https://5paisa.com/technology/mcp-ai-trading-assistant>
- <https://tradebetter.5paisa.com/t/introducing-5paisa-mcp-your-ai-companion-for-smarter-portfolio-management/310>
