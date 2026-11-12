---
name: Capital.com
region: Global CFD broker (MENA release 2026-06-08; availability by entity and region)
status: official
trading: true
server_type: local
source_url: https://github.com/capital-com-sv/capital-mcp
last_verified: 2026-11-11
confidence: high
---

# Capital.com

## Overview

Capital.com's open-source MCP server (MIT) for the Capital.com Public API. It runs on your machine and connects Claude Desktop, Claude Code, Cursor, Windsurf or Codex to a Capital.com account. It defaults to a demo account.

Official status, checked 2026-11-11: GitHub `capital-com-sv` is an Organization named "Capital.com" with blog `https://capital.com/`; the Capital.com product page and the MENA press release both describe the server as Capital.com's own.

## How to connect

Needs a Capital.com account with 2FA on, then Settings, API integrations, generate a key with a custom API password (shown once). Install by the repo's `capital-mcp.mcpb` bundle (Claude Desktop), the `install.sh` or `install.ps1` script (Python 3.10+, Git), or Docker. Environment variables include `CAP_ENV` (default `demo`), `CAP_API_KEY`, `CAP_IDENTIFIER`, `CAP_API_PASSWORD`.

Auth: API key plus API password, stored locally. Keys expire after one year by default. Capital.com does not offer read-only keys, so every key is trading-capable. Mobile is not supported.

## Trading scope

The product page states 38 tools in 7 categories plus 7 guided workflows (market data, account operations, trading, watchlists, real-time streaming, session management named; the seventh is not named). Tool names were not enumerated from source for this entry. Markets named in the MENA release: forex, crypto, commodities, indices.

## Safety / guardrails

- Two-phase execution: preview, then separate confirm. Previews expire after two minutes. Market orders execute on confirm; limit and stop working orders fill automatically later with no second confirmation.
- Config controls: `CAP_ALLOW_TRADING` (README says trading is on by default), market allowlist (`CAP_ALLOWED_EPICS`), size limits, daily order caps. These do not change the API key's permissions.
- Switching to live means changing the environment setting and restarting.
- Execution-only; Capital.com disclaims liability for third-party AI behaviour.

## Caveats

- Repo: 9 stars, last push 2026-10-02, not archived. Tools not enumerated from source; the count is the vendor's claim.
- The 2-phase confirm is implemented in the server per the README, but trade enablement defaults to on, so check your config before going live.
- Several unrelated PyPI packages are named `capital-com-mcp-server`; they are not official. Use only the repo above.
- Region and eligibility are not defined on the product page. The press release (Capital Com MENA Securities Trading LLC) covers UAE and MENA clients.
- Minimum live deposit per the product page: 10 USD, EUR or GBP by card.

## Sources

Read directly on 2026-11-11:

- <https://github.com/capital-com-sv/capital-mcp> (README, via the GitHub API)
- <https://capital.com/en-int/trading-platforms/ai-integration>
- <https://capital.com/en-ae/press/we-enable-mcp-server-plugin-giving-traders-real-time-account-access-from-within-their-ai-research-environments> (2026-06-08)
