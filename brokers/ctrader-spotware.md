---
name: cTrader (Spotware)
region: Global (Spotware, Cyprus — platform vendor used by many FX/CFD brokers)
status: official
trading: true
server_type: remote (hosted, for cTrader Web) + local (stdio, for cTrader Windows/Mac)
source_url: https://help.ctrader.com/ctrader-ai-agent-connect/
last_verified: 2026-11-11
confidence: high
---

# cTrader (Spotware)

## Overview

Spotware shipped "cTrader AI Agent Connect": two first-party MCP servers — a remote
one for cTrader Web and a local one for cTrader Windows/Mac. First-party docs
explicitly list Claude Code as a supported client and confirm the agent can place,
modify and close real orders. Free and included with a cTrader account (the FAQ no longer says "beta"; the old "free during beta" wording was from ctrader.com).
This is the strongest MCP route in the FX/CFD cluster.

## How to connect

```bash
Copy the MCP config snippet generated in cTrader (Desktop: Settings → MCP Server → tick "Enable MCP server"; Web: the remote MCP setup page) and paste it into Claude Code — the agent will write your MCP config itself.
```

## Trading scope

Whatever your cTrader broker offers (FX, indices, commodities, crypto CFDs): place
orders, manage pending orders, modify and close positions, plus account data and
market analysis. Local server adds chart/workspace control.

## Caveats

- There is no public static endpoint URL. The connection config is per-account and
  generated inside the cTrader UI, so it cannot be documented as a copy-paste server
  URL here.
- Local server requires cTrader Windows/Mac to be running with "Enable MCP server"
  ticked; remote server requires cTrader Web.
- Spotware is a platform vendor, not a broker. Whether the MCP servers are enabled
  likely depends on your specific cTrader broker — the FAQ does not confirm universal
  broker availability.
- Our July note said "free during beta" per ctrader.com. As of 2026-11-11 the help-centre FAQ
  says the servers are free and included with your cTrader account and mentions no beta.
  The ctrader.com page was not re-read.
- cTrader's own docs carry an explicit warning that "AI-generated actions may trigger
  real trades and result in losses."
- Per the FAQ, the local server uses your active cTrader Windows/Mac session; the remote
  server uses a per-account bearer token issued from cTrader Web (re-issue it when the
  session expires). Supported clients named: Claude Code, Codex, Cursor, Windsurf, Gemini
  CLI and GitHub Copilot. You can require confirmation for trading operations in the local
  server settings or in your AI client. Each position supports only one take-profit level,
  and the FAQ warns an agent may misreport success, so verify in cTrader.
- Help Centre now publishes `https://help.ctrader.com/llms.txt`, with a per-section full text
  at `https://help.ctrader.com/ctrader-ai-agent-connect/llms-full.txt`.
- Community alternatives exist (e.g. akinabudu/ctrader-mcp-server, 14 stars) but are
  unnecessary now that a first-party route exists.

## Sources

Re-read on 2026-11-11:

- <https://help.ctrader.com/ctrader-ai-agent-connect/>
- <https://help.ctrader.com/ctrader-ai-agent-connect/faq/>
- <https://help.ctrader.com/ctrader-ai-agent-connect/remote-mcp/> (no endpoint URL or token steps on that page)
- <https://help.ctrader.com/llms.txt>

Checked directly on 2026-07-16:

- <https://help.ctrader.com/ctrader-ai-agent-connect/>
- <https://help.ctrader.com/ctrader-ai-agent-connect/faq/>
- <https://help.ctrader.com/ctrader-ai-agent-connect/remote-mcp/>
- <https://ctrader.com/mcp-server-for-trading>
- <https://mcp.spotware.com>
- <https://fxnewsgroup.com/forex-news/platforms/ctrader-launches-official-mcp-servers-for-ai-powered-trading/>
