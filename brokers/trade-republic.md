---
name: Trade Republic
region: EU (Germany)
status: community
trading: false
server_type: local
source_url: https://github.com/visusnet/trade-republic-mcp-server
last_verified: 2026-11-11
confidence: medium
---

# Trade Republic

## Overview

No official MCP server and no official public API. Two community MCP servers exist and
were verified: visusnet/trade-republic-mcp-server (18 stars, portfolio, market data,
order books, asset search) and j0nl1/trade-republic-mcp (6 stars, Rust,
portfolio/market data/search/bond analytics). Neither can currently place orders. Both
authenticate with a real Trade Republic phone number + PIN + SMS/app 2FA and work by
reverse-engineering Trade Republic's internal WebSocket API, which the visusnet README
warns may violate Trade Republic's Terms of Service.

## How to connect

```bash
git clone https://github.com/visusnet/trade-republic-mcp-server && npm install  (requires TR_PHONE_NUMBER + TR_PIN; alternative: https://github.com/j0nl1/trade-republic-mcp ships prebuilt binaries or cargo build --release)
```

## Trading scope

none — read-only in practice. visusnet lists order placement/modification/cancellation
as 'coming soon'; j0nl1 exposes no order tools at all.

## Caveats

- The visusnet repo's GitHub description says it 'enables AI assistants to trade
  assets' but the README lists order placement as 'coming soon' — the description
  overstates the capability. Do not list this as an execution-capable server.
- The visusnet README's install snippet is a copy-paste artifact ('git clone
  https://github.com/your-username/trade-republic-bot') that does not resolve — the
  install line given here uses the real verified repo URL instead.
- README explicitly states 'Trade Republic does NOT provide a public API' and that the
  project reverse-engineers their internal WebSocket API from community research;
  using it may violate ToS and risk account action.
- Requires handing full account credentials (phone + PIN) and live 2FA to a
  third-party binary. Sessions cached at ~/.trade-republic-mcp/session.json.
- Both repos are low-traction (18 and 6 stars as of 2026-11-11; the visusnet repo's last push was 2026-02-03 and j0nl1's 2026-02-18, so neither has moved in ~8 months).

## More community repos (checked 2026-11-11)

READMEs read 2026-11-11; stars and last push as of that date. Neither repo is endorsed by Trade Republic, and both rely on the same undocumented web API as the servers above, with phone number, PIN and 2FA handed to a hobby project. Trade Republic has no GitHub org with MCP, skills or agent repos (the `TradeRepublic` org holds only iOS CI and UI libraries).

- [`mattiad19/trade-republic-mcp`](https://github.com/mattiad19/trade-republic-mcp): local **read-only** MCP server, German README, macOS only (Keychain). Nine tools: auth status, portfolio, cash, existing orders, asset search and info, price, price history, order book. No buy, sell, cancel, transfer or savings-plan tools, and the README says that restriction is enforced at runtime. Phone, PIN and 2FA code are prompted in the terminal and not stored; only the cookie session is saved. 0 stars, last push 2026-11-01, MIT. New and unvetted.
- [`wdaniel1993/tr-cli`](https://github.com/wdaniel1993/tr-cli): unofficial Python CLI (not MCP): push-approval login, portfolio, history, timeline, quotes, instrument details. No order commands listed. README warns never to script repeated logins and notes `429 TOO_MANY_REQUESTS` cooldowns. 0 stars, last push 2026-08-18, no license file. Its 11 `SKILL.md` files are OpenSpec dev-workflow tooling, not broker skills.

## Sources

Checked directly on 2026-11-11 (stars and push dates re-pulled via GitHub API, no new pushes; earlier README check 2026-10-12: visusnet README re-read: orders still 'coming soon', the 'Autonomous Trading Agent' still 'Coming Soon', your-username install artifact still present; j0nl1 README shows no order tools; stars and push dates re-pulled via GitHub API):

- <https://github.com/visusnet/trade-republic-mcp-server>
- <https://github.com/j0nl1/trade-republic-mcp>
- <https://api.github.com/search/repositories?q=%22trade+republic%22+mcp&sort=stars&order=desc>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
