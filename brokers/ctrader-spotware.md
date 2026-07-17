---
name: cTrader (Spotware)
region: Global (Spotware, Cyprus — platform vendor used by many FX/CFD brokers)
status: official
trading: true
server_type: remote (hosted, for cTrader Web) + local (stdio, for cTrader Windows/Mac)
source_url: https://help.ctrader.com/ctrader-ai-agent-connect/
last_verified: 2026-07-16
confidence: high
---

# cTrader (Spotware)

## Overview

Spotware shipped "cTrader AI Agent Connect": two first-party MCP servers — a remote
one for cTrader Web and a local one for cTrader Windows/Mac. First-party docs
explicitly list Claude Code as a supported client and confirm the agent can place,
modify and close real orders. Included free with a cTrader account (free during beta).
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
- "Free during beta" per ctrader.com — pricing could change.
- cTrader's own docs carry an explicit warning that "AI-generated actions may trigger
  real trades and result in losses."
- Community alternatives exist (e.g. akinabudu/ctrader-mcp-server, 14 stars) but are
  unnecessary now that a first-party route exists.

## Sources

Checked directly on 2026-07-16:

- <https://help.ctrader.com/ctrader-ai-agent-connect/>
- <https://help.ctrader.com/ctrader-ai-agent-connect/faq/>
- <https://help.ctrader.com/ctrader-ai-agent-connect/remote-mcp/>
- <https://ctrader.com/mcp-server-for-trading>
- <https://mcp.spotware.com>
- <https://fxnewsgroup.com/forex-news/platforms/ctrader-launches-official-mcp-servers-for-ai-powered-trading/>
