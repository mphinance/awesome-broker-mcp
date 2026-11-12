---
name: Woodstock
region: Japan
status: official
trading: true
server_type: remote
source_url: https://www.woodstock.club/ja/mcp
last_verified: 2026-11-11
confidence: medium
---

# Woodstock

## Overview

Woodstock Inc's hosted MCP server for its Japan-based US-stock trading app, announced on its own site as "Woodstock MCP" (the page bills it as Japan's first no-code securities MCP). Woodstock is a Type I financial instruments business agent under AlpacaJapan, per the page footer. The page says it can pull real-time data and analysis and "trade".

## How to connect

Enter `https://mcp.app.woodstock.co/mcp` in your AI tool. The page lists Claude, ChatGPT, Grok, Codex, Gemini, Cursor, GitHub Copilot CLI, Kimi and Opencode. You need a Woodstock account.

Endpoint probe, 2026-11-11: unauthenticated JSON-RPC `initialize` returns `401` with `www-authenticate: Bearer ... resource_metadata="https://mcp.app.woodstock.co/.well-known/oauth-protected-resource/mcp"`. Live and OAuth gated.

## Trading scope

The page's example prompts include buying AAPL by yen amount, limit buys and portfolio risk questions, and the FAQ says it covers portfolio management, price tracking and "sending buy and sell orders". Tool names, order types and supported asset classes are not published on the page. The page advertises 1000+ tradable US names, zero fees and 24/5 trading for the app itself.

## Safety / guardrails

- The page warns that, depending on the AI's policy and your prompt, orders can be placed without you confirming each order first. There is no stated built-in confirmation step.
- Results of trades belong to the customer; AI output is not guaranteed. A separate "MCP agent trading special terms" document exists and was not read.
- Free to use currently; you supply and pay for the AI provider.

## Caveats

- Japanese page read; the English `/mcp` page loads but was not separately parsed.
- No tool list or repo found. Order-confirmation behaviour beyond the warning is unverified.
- Japan-resident account required in practice; eligibility not checked.

## Sources

Read directly on 2026-11-11: <https://www.woodstock.club/ja/mcp>; endpoint probe of `https://mcp.app.woodstock.co/mcp`.
