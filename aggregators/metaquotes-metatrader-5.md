---
name: MetaTrader 5 (MetaQuotes)
region: Global; MT5 is vendor software, access via your broker's MT5 account
status: official
trading: true
server_type: local
source_url: https://www.metatrader5.com/en/terminal/help/mcp_and_ai
last_verified: 2026-11-11
confidence: medium
---

# MetaTrader 5 (MetaQuotes)

## Overview

MetaQuotes added native MCP and an AI Assistant to the MT5 desktop terminal and MetaEditor. The first-party help page says MT5 and MetaEditor act as MCP hosts and MetaEditor includes MCP servers, so agents such as Claude Code or Codex can work with market and account data, charts, trade history, Expert Advisors and the Strategy Tester. It is platform software, not a broker server, and runs in the desktop terminal.

## How to connect

The help page is an overview and gives no endpoint, transport or auth. The built-in assistant needs an MQL5.community sign-in, uses a free MQL5 lite model by default and can be pointed at OpenAI, Anthropic or Google models. Configuration is on sub-pages that were not found.

## Trading scope

The page lists opening and modifying positions as tasks, with example prompts for a market order and for changing SL and TP, plus chart and Market Watch management, EA backtesting and optimization, and creating indicators and EAs. Release notes for build 6230 (2026-09-24) add tools for EA test setup, running and removing programs on charts and the Economic Calendar.

## Safety / guardrails

- The Assistant can be restricted from trading, web use and shell commands in settings.
- The page says to review proposed actions before execution but does not say confirmation is enforced.
- MetaQuotes disclaims responsibility; the user is solely responsible for AI-assisted actions.

## Caveats

- Which build introduced MCP is unclear: release notes list the native MCP under build 6060; a trade press piece says the beta build 6030 (2026-07-16) adopted MCP. Not reconciled.
- Whether trading via MCP is on by default, and the tool names, are not documented on the page read.
- The broker must permit the connection; brokers can also disable features. Not verified.
- Community alternative: an MQL5 article by Muhammad Minhas Qamar (2026-04-30) at `mql5.com/en/articles/21905` ships a Python stdio server of 14 tools on the `MetaTrader5` package (Windows only, `create_order` and `close_position` can trade, no repository or licence, "all rights reserved by MetaQuotes"). It is not MetaQuotes' own product.
- See also `docs/skills/metatrader.md` for the agent skill side.

## Sources

Read directly on 2026-11-11:

- <https://www.metatrader5.com/en/terminal/help/mcp_and_ai>
- <https://www.metatrader5.com/en/releasenotes/terminal/2470> (build 6230)
- <https://www.mql5.com/en/articles/21905>
- <https://www.financemagnates.com/forex/metatrader-5-beta-adds-native-ai-agents-and-mcp-support-identity-and-broker-tools-also-get-an-overhaul/> (press)
