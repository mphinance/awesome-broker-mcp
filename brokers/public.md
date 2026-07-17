---
name: Public.com
region: US
status: official
trading: true
server_type: local
source_url: https://public.com/learn/trade-stocks-options-crypto-using-claude
last_verified: 2026-07-16
confidence: high
---

# Public.com

## Overview

Official local MCP server for Claude Desktop. Notable for IRA support — most brokers
in this list only cover taxable brokerage accounts.

> ### ⚠️ There is no paper trading mode
>
> Public's own docs are unambiguous: *"All orders are live. There is no paper trading
> mode. Every order you confirm through Claude Desktop is a real order placed in your
> live brokerage account. Review all preflight details before confirming."*
>
> Several servers in this directory default to paper or sandbox ([Alpaca](alpaca.md),
> [Kraken](kraken.md), [Webull](webull.md)). **This one has no such mode to fall back
> on.** There is no safe way to "just try it."

## How to connect

Local Python server — you need [`uv`](https://docs.astral.sh/uv/) installed. Configure
via `claude_desktop_config.json`:

```bash
PUBLIC_COM_SECRET=<your API secret>
PUBLIC_COM_ACCOUNT_ID=<your account id>
```

Generate the secret from your Public.com API settings page. Credentials stay local —
the MCP server reads them and calls the Public API directly; nothing passes through a
third-party server.

Requires fully quitting and relaunching Claude Desktop after editing the config
(Cmd+Q on macOS, tray-icon quit on Windows — a background-process gotcha worth knowing
before you assume the config didn't take).

For IRA access specifically: set `PUBLIC_COM_ACCOUNT_ID` to your IRA account ID.

## Trading scope

Stocks, ETFs, options (including cash-settled index options — SPX, NDX), crypto,
fractional shares, extended-hours trading, margin accounts. Multi-leg options orders.
Both brokerage and IRA account types.

## Safety / guardrails

**Confirm-first, with a real human gate — but every confirmation spends real money.**

Per Public's docs: *"Claude runs a preflight check first — showing estimated fill cost,
total buying power impact, and order type. After you confirm, Claude submits the
order."*

So the shape is good: you see the cost, the buying-power impact and the order type
before anything happens, and Claude does not submit until you say so. The gap is that
the gate is the *only* thing between a tool call and a live fill. Compare
[IBKR](interactive-brokers.md), where the server cannot submit at all and you press the
button in the broker's own UI.

## Caveats

- **No paper mode.** Repeated here because it is the single most important fact on this
  page and it was missing from earlier versions of this entry.
- The preflight summary is what you are approving. If you are in the habit of
  fast-confirming an agent's proposals, that habit places live orders here.
- Commission-free for individual brokerage and IRA accounts, per Public's own
  positioning — not independently verified against a pricing page.

## Sources

Checked directly on 2026-07-16:

- <https://public.com/learn/trade-stocks-options-crypto-using-claude>
- <https://public.com/api/docs/templates/claude-desktop-mcp> (returns 403 to automated
  fetch; the `/learn` page above is the fetchable first-party source)
