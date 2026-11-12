# Projects built on broker MCP servers and skills

Real things people built with the servers and skills we catalog. Demos, bots, guides and hackathon entries, with whether they trade live or paper.

Links were checked on 2026-11-11 and stars and last-push dates came from the GitHub API the same day. We did not run any of this code or read it line by line. Live or paper is what the project's own README says, or "not verified" where we could not tell. Hackathon repos are mostly dormant, and a demo with a handful of stars is a reference, not an endorsement.

## Alpaca

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [Claude + Alpaca MCP + Google Sheets](https://alpaca.markets/learn/mcp-trading-with-claude-alpaca-google-sheets) | Official guide: Claude Desktop with the Alpaca MCP server, trades logged to Google Sheets | Paper by default (`ALPACA_PAPER_TRADE=true`), live switch documented | Official guide, 2026-06 |
| [Deploy the Alpaca MCP server remotely](https://alpaca.markets/learn/how-to-deploy-alpaca-mcp-server-remotely-on-claude-mobile-app) | Official guide: Docker deploy so Claude web and mobile can reach it | Paper or live by config | Official guide |
| [AlpacaTradingAgent](https://github.com/huygiatrng/AlpacaTradingAgent) | Multi-agent LLM trading framework in the TradingAgents style, places trades on Alpaca (Apache-2.0) | Paper or live, default not confirmed | 284, 2026-10-27 |
| [ClaudeTrading](https://github.com/khoks/ClaudeTrading) | Autonomous Claude Code skills plus scheduled tasks. Closest thing to Alpaca skills in practice | Paper only, hard-coded to the paper API URL | 4, 2026-05-10 |
| [synthetix-alpha](https://github.com/alan-d-smith/synthetix-alpha) | LLM agents do the research, a deterministic runtime trades through the Alpaca CLI and MCP (MIT) | Paper | 4, 2026-09-04 |

## Kraken

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [lablab.ai AI Trading Agents hackathon](https://lablab.ai/ai-hackathons/ai-trading-agents) | Kraken CLI track, ran 2026-03-30 to 04-12, with a gallery of entries (KrakenSense, QuantTrade Lite and others). Ranking used a read-only Kraken key | Paper or sandbox per entry | Event page |
| [hackathon-trading-agent](https://github.com/JudyaiLab/hackathon-trading-agent) | Kraken CLI agent with ERC-8004 identity and walk-forward validation | Paper (README reports 11+ days of paper trading) | 41, 2026-04-12 |
| [swiftward-ai-trading-agents](https://github.com/disciplinedware/swiftward-ai-trading-agents) | Multi-agent harness on Kraken CLI with risk controls | Not verified | 6, 2026-04-12 |
| [Axion-Trader](https://github.com/rishabjn10/Axion-Trader) | Autonomous agent on Kraken CLI plus Gemini Flash, multi-timeframe signals | Not verified | 1, 2026-03-31 |

## OKX

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [OKX Agent Trade Kit explainer](https://web3.okx.com/learn/agent-trade-kit) | Official setup guide: MCP plus CLI plus 4 skills (market, trade, portfolio, bots) | Demo mode with simulated assets, or live profiles | Official; the kit repo `okx/agent-trade-kit` has 508 stars, pushed 2026-11-10 |

Avoid `dex-original/okx-agent-trade-kit` (117 stars). It looks like an SEO-style fork of the official repo.

## Webull and moomoo

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [webull-claude-quant-bot](https://github.com/varonmiranda/webull-claude-quant-bot) | Fundamental trading agent using Claude and the Webull OpenAPI. The only Webull project we found | Not verified | 1, 2026-06-20 |
| [futu-opend-mcp](https://github.com/xyonium/futu-opend-mcp) | MCP server for Futu OpenD, read-only research quotes (MIT). Nearest moomoo and Futu item | Read-only, no trading | 9, 2026-09-12 |

## Gaps

We found no demos, tutorials or sample bots for Longbridge or the moomoo agent-hub skills beyond tiny wrappers (`iwanbk/moomoo-mcp`, 2 stars, no clear license; `stonk-org/longbridge-mcp`, 1 star). If you built something on any of these, open an issue or PR with the link, the broker, and whether it trades live.

## Curated lists that already link these repos

Where else to look, and where each broker's repos are already listed. We are not affiliated with any of them.

| List | Stars | What it has | Takes PRs |
|---|---|---|---|
| [laplace0x/awesome-agent-trading](https://github.com/laplace0x/awesome-agent-trading) | 16 | `alpacahq/alpaca-skills`, plus Alpaca, OKX, Bybit and Binance MCPs. Tracks paper, dry-run or live modes and a `last_verified` date | Yes, via `data/projects.json` |
| [LLMQuant/awesome-trading-agents](https://github.com/LLMQuant/awesome-trading-agents) | 997 | `kraken-cli`, `okx/onchainos-skills`, `okx/agent-skills`, `Polymarket/agent-skills`, Alpaca MCP | Yes, README and `README.zh-CN.md` together |
| [georgezouq/awesome-ai-in-finance](https://github.com/georgezouq/awesome-ai-in-finance) | 6.7k | Broad AI-in-finance index with an MCP section that includes a Trading Execution subsection. Alpaca MCP, `kraken-cli`, OKX agent-trade-kit | Probably |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 37k | Binance (7 skills) and Coinbase (9) | Yes, wants real community usage |
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | 98k | `longbridge/longbridge-mcp`, plus third-party Alpaca, Zerodha, tastytrade and Binance futures servers | Installable servers only |
| [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) | 50k | `longbridge/skills` | Yes |
| [MCP registry](https://registry.modelcontextprotocol.io) | n/a | Webull's and Longbridge's official servers. Alpaca, Kraken, OKX, moomoo and Bybit are not there | Servers publish a `server.json` |

Our own pages: the [skills catalog](../skills/README.md) covers what each broker's skills do and which guardrails are code versus prose. The [directory](../../readme.md) covers the servers.
