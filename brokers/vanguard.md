---
name: Vanguard
region: US
status: official
trading: false
server_type: remote
source_url: https://advisors.vanguard.com/docs/vanguard-advisor-tools-mcp
last_verified: 2026-11-11
---

# Vanguard

## Overview

Vanguard has an official MCP server, but it is **not a brokerage-account server**. It is "Vanguard Advisor Tools", built for financial advisors, and it returns **public model portfolio data** (the `vanguard-advisors` server, one tool, `get_model_portfolios`). It cannot see your Vanguard account, cannot read holdings, and cannot place orders. If you want an agent to trade or read a personal Vanguard account, there is still no direct route.

Confidence: medium. Vanguard's own docs page (the `source_url`) is client-rendered and returned only its title to our fetch, so the scope details below come from the Claude connector listing (marked Anthropic verified, "made by Vanguard"), the repo's plugin manifest and the skill text. Our own probe of the declared endpoint did not return an MCP response (see Caveats).

## How to connect

Declared endpoint (plugin manifest and Claude connector listing): `https://mcp.vanguard.com/advisors` (type `http`).

Route 1, Claude connector: add "Vanguard Advisor Tools" from the Claude connectors marketplace. The listing says sign-in is not required.

Route 2, plugin: [Vanguard-oss/vanguard-advisor-tools](https://github.com/Vanguard-oss/vanguard-advisor-tools), a Claude plugin (`plugin.json` v1.3.0, author "Vanguard") whose manifest declares the server above. It is also listed inside Anthropic's "claude-for-financial-advisors" plugin.

Auth: none for the MCP server per the connector listing. The advisor site (`advisors.vanguard.com`) that the skill links out to is login-gated, but the MCP tool itself is not described as needing that login.

## Trading scope

None. Read-only. The connector listing states it exposes only publicly available US model data and does not access, return or store client, account or personally identifiable information. The single tool returns model portfolio details (expense ratios, asset class, start date, characteristics; named-series calls also return funds and holdings of the model, not of any client).

## Safety / guardrails

- No order tool, no account tool, no client data: nothing to guard on the money side.
- The `model-prep` skill adds compliance behavior: an initial disclosure gate before the first tool call, a compliance confirmation before client-facing output, and a rule against ranking or recommending models (it must stay neutral and leave suitability to the advisor).
- Listing text says output is informational and not investment advice.

## Skills note

The repo ships one skill, `model-prep`: an advisor describes a client need, the skill pulls matching Vanguard model portfolios via `get_model_portfolios`, and produces an advisor one-pager (text plus a PDF generated locally with a bundled `make_model_pdf.py`, which needs `reportlab`) and optional client-facing material. It covers model portfolios only, not single-fund comparison. Written for advisors, not self-directed investors.

## Aggregator route (read-only, for your own account)

For an individual Vanguard account, the only paths remain read-only aggregators: [SnapTrade](../aggregators/snaptrade.md) and [Truthifi](../aggregators/truthifi.md). Neither provides a trading route. These two pages were not re-verified against Vanguard in this pass; their claims are inherited.

## Caveats

- Org identity: `Vanguard-oss` is not a GitHub-verified org and has no description or public members. Evidence it is Vanguard's: profile name "Vanguard", location Valley Forge, PA, plugin author "Vanguard", both commits authored with a `@vanguard.com` address, older repos under Apache-2.0, and the Claude listing credits Vanguard. Announced as part of Anthropic's Claude for Financial Advisors launch (2026-09-14, built with Schwab and Dynasty); InvestmentNews names Vanguard as a partner but gives no detail.
- Repo license: none declared, so all rights reserved by default. 0 stars, created 2026-09-15, last push 2026-09-16.
- Endpoint probe (unauthenticated `initialize` POST, default curl user agent): `https://mcp.vanguard.com/advisors` returned HTTP 302 to `www.vanguard.com/notfound.htm` (Akamai-fronted, no MCP response); `https://mcp.vanguard.com` returned 404 "no Route matched". Claude Code in our session reported ENDPOINT_NOT_FOUND. So we could not confirm the server answers from this machine; it may be gated by edge rules or client context. A web search snippet cited a different host, `mcp.advisors.vanguard.com/advisors`, which does not resolve in DNS here. Tool list and "no auth" are from the listing, not from a live handshake.
- Vanguard's own docs page was not readable by our fetch. Not checked: Vanguard press release.
- Eligibility: listing names no requirement, but it is aimed at advisors and Claude's advisor plugin is described as an Enterprise-license install.
