# Cookbook: recipes, projects and guides for broker MCP servers and skills

Real things people built with the servers and skills we catalog, and the broker-published recipes that show how. Demos, bots, guides, vendor cookbooks and hackathon entries, with whether they trade live or paper.

Links were checked on 2026-11-11 and stars and last-push dates came from the GitHub API the same day. We did not run any of this code or read it line by line. Live or paper is what the project's own README says, or "not verified" where we could not tell. Hackathon repos are mostly dormant, and a demo with a handful of stars is a reference, not an endorsement.

## On this page

- [Vendor cookbooks and recipes](#vendor-cookbooks-and-recipes): ConnectTrade, Kraken, NinjaTrader, Public, Webull, Plaid and 20 more
- [Community projects](#community-projects): demos, bots and hackathon entries, live or paper marked
- [Frameworks, brakes and harnesses](#frameworks-brakes-and-harnesses)
- [Curated lists](#curated-lists-that-already-link-these-repos)

## Vendor cookbooks and recipes

What the brokers and exchanges publish themselves: recipe pages, tutorials, example galleries and templates for driving their server, skills or API from an agent. Checked 2026-11-11. "Mode" is what the page says, and "not verified" means we could not tell from the page. Most of these are plain API recipes. Few teach a confirmation step, so read the skills catalog for what each one's guardrails really are.

### ConnectTrade

Source: [API Cookbook](https://connecttrade.com/docs/cookbook), one page with 14 anchored recipes in Python, JavaScript, Go and Rust. It is plain REST API code, not MCP or agent-specific. The page shows no dates and names a broker only in the order recipe (Alpaca). Only 2 recipes write: neither teaches a confirm step or scoped tokens. The only auth hint is that Momentum Signal uses a short-lived access token.

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Setup](https://connecttrade.com/docs/cookbook#setup) | Credentials plus GET/POST/PATCH/DELETE helpers in 4 languages | read | official | not shown |
| [Get balances](https://connecttrade.com/docs/cookbook#get-balances) | Cash and buying power across connected accounts | read | official | not shown |
| [Get positions](https://connecttrade.com/docs/cookbook#get-positions) | Holdings with quantity, last price, unrealized P&L | read | official | not shown |
| [Get open orders](https://connecttrade.com/docs/cookbook#get-open-orders) | Working orders filtered by status | read | official | not shown |
| [Get filled orders](https://connecttrade.com/docs/cookbook#get-filled-orders) | Recent fills with per-execution detail | read | official | not shown |
| [List accounts](https://connecttrade.com/docs/cookbook#list-accounts) | Linked brokerage accounts with institution and ID | read | official | not shown |
| [Recent transactions](https://connecttrade.com/docs/cookbook#recent-transactions) | Transaction activity for a date range | read | official | not shown |
| [Place market order](https://connecttrade.com/docs/cookbook#place-market-order) | Market BUY 10 AAPL, DAY, on Alpaca. Sent directly, no confirm step, paper or live not stated | live (unstated) | official | not shown |
| [Cancel all orders](https://connecttrade.com/docs/cookbook#cancel-all) | Loops over open orders and cancels each, no confirmation | live (unstated) | official | not shown |
| Sum unrealized P&L (same page, no anchor shown) | Totals P&L over positions | read | official | not shown |
| Fills from today (same page) | Flattens today's fills into one list | read | official | not shown |
| Momentum signal (same page) | 20-day SPY momentum from streaming daily bars, short-lived access token | read | official | not shown |
| Calculate VWAP (same page) | Execution VWAP of today's AAPL fills | read | official | not shown |
| Portfolio concentration (same page) | Each position's share of market value | read | official | not shown |

### Kraken

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [CLI walkthroughs 01 to 07](https://github.com/krakenfx/kraken-cli/tree/main/examples) | Playground, paper workspaces, market memory, session replay and explain, autoresearch lab, agent skills, recipes. Needs no Kraken account | paper | official | repo pushed 2026-10-29 |
| [Recipes and extensions (07)](https://github.com/krakenfx/kraken-cli/blob/main/examples/07-recipes.md) | Package a stopped paper session as a re-runnable recipe via `kraken recipe create` | paper | official | 2026-10-29 |
| [kraken-paper-to-live](https://github.com/krakenfx/kraken-cli/blob/main/skills/kraken-paper-to-live/SKILL.md) | Promotion path from paper to live | paper to live | official | 2026-10-29 |
| [kraken-autonomy-levels](https://github.com/krakenfx/kraken-cli/blob/main/skills/kraken-autonomy-levels/SKILL.md) | How much an agent may do on its own, by level | live | official | 2026-10-29 |
| [recipe-emergency-flatten](https://github.com/krakenfx/kraken-cli/blob/main/skills/recipe-emergency-flatten/SKILL.md) | Close everything fast (one of about 25 `recipe-*` skills; others: drawdown circuit breaker, DCA bot, grid bot, trailing stop, weekly rebalance, daily P&L report) | live | official | 2026-10-29 |
| [recipe-drawdown-circuit-breaker](https://github.com/krakenfx/kraken-cli/tree/main/skills/recipe-drawdown-circuit-breaker) | Halt trading on drawdown limit | live | official | 2026-10-29 |
| [recipe-playground-dca](https://github.com/krakenfx/kraken-cli/tree/main/skills/recipe-playground-dca) | DCA run against the paper playground first (sibling recipes: price alert, rebalance, webhook) | paper | official | 2026-10-29 |
| [Kraken MCP page](https://docs.kraken.com/home/mcp) | Setup for `kraken-mcp` (152 commands as tools) | read, paper, live | official | not shown |

### NinjaTrader

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Trading Skills workflows](https://docs.ninjatrader.com/mcp/skills-workflows) | Guided tour chaining skills (pretrade-risk, position-watchdog, scale-manager, trade-debrief) | demo or live | official | not shown |
| [mcp-skills repo](https://github.com/NT-NinjaTrader/mcp-skills) | 13 skills. Skills only propose orders and never submit, you approve each payload. Start on Demo server | demo, live | official | repo pushed 2026-11-06 |
| [Safety and disclosures](https://docs.ninjatrader.com/mcp/safety) | Demo vs Live servers, human approval of every order | demo, live | official | not shown |
| [CrossTrade NinjaTrader MCP setup](https://crosstrade.io/mcp-trading/ninjatrader-mcp-setup) | Third-party setup guide via CrossTrade | not verified | community (vendor) | not shown |

### Gemini, Korea Investment, Crypto.com, cTrader, Longbridge, moomoo, Binance, Bybit, eToro

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Gemini developer-platform samples](https://github.com/gemini/developer-platform/tree/main/samples) | Python, Go, TypeScript scripts: balances, order book, place_order, prediction-market orders (pm_order, pm_prices), websocket feeds | sandbox or live per script | official | 2026-11-10 |
| [Introducing agentic trading on Gemini](https://www.gemini.com/blog/introducing-agentic-trading-on-gemini-the-future-of-crypto-is-autonomous) | Launch post with the MCP setup story (marketing leaning) | live, sandbox available | official | not shown |
| [KIS examples_llm](https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm) | One runnable example per API (quotes, balance, order_cash, order_resv and more) for domestic and overseas stocks, futures, bonds | read and live orders | official | 2026-10-27 |
| [KIS strategy_builder](https://github.com/koreainvestment/open-trading-api/tree/main/strategy_builder) | Backend plus frontend to build and backtest strategies, tied to the repo's MCP code assistant | backtest, live | official | 2026-10-27 |
| [crypto-agent-trading](https://github.com/crypto-com/crypto-agent-trading) | Crypto.com agent skill with `crypto-com-app` and `crypto-com-exchange` references | not verified | official | 2026-08-29 |
| [cTrader AI agent connect](https://help.ctrader.com/ctrader-ai-agent-connect/) | Help-centre guide plus FAQ and remote MCP page | not verified | official | not shown |
| [ctrader-skills](https://github.com/spotware/ctrader-skills) | Skills for ctrader-cli and the MCP servers | not verified | official | 2026-08-21 |
| [Longbridge skills](https://github.com/longbridge/skills) | 13 skill folders (portfolio, quant, technical, earnings, watchlist and more) | read mostly | official | 2026-11-08 |
| [moomoo-agent-hub docs](https://github.com/MoomooOpen/moomoo-agent-hub/tree/main/docs) | Install, OpenD upgrade, websocket quote push, migration gaps | not verified | official | 2026-11-10 |
| [Binance skills hub](https://github.com/binance/binance-skills-hub) | `binance` and `binance-web3` skill sets | not verified | official | 2026-10-26 |
| [Bybit skills hub](https://github.com/bybit-exchange/bybit-skills-hub) | One `bybit` skill folder | not verified | official | 2026-03-05 |
| [eToro Agent Portfolios](https://builders.etoro.com/products/agent-portfolios) | Product page for agent portfolios and MCP | not verified | official | not shown |
| [Alpaca skills templates](https://github.com/alpacahq/alpaca-skills) | `broker-api` and `trading-api` skills plus a skill template (Alpaca learn guides already in README) | paper or live | official | 2026-11-11 |

### Public

Public's API docs have a `/templates` section that doubles as an official cookbook, with a hosted-MCP path and a Python SDK path.

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Hosted MCP server setup](https://public.com/api/docs/templates/hosted-mcp) | Connect Claude, ChatGPT, Codex, Meta Muse, Perplexity and Grok to `mcp.public.com/mcp`, OAuth or API key per client | Live (page warns every MCP order is real money) | Official | Not shown |
| [Trading prediction markets with the Public MCP server](https://public.com/api/docs/templates/trade-prediction-markets-with-mcp) | Browse event contracts, read YES/NO pricing and buy from an AI assistant in plain language | Live | Official | Not shown |
| [Claude and Claude Code connector](https://public.com/api/docs/templates/claude) | Add Public as a Claude connector on web, desktop, iOS and in Claude Code | Live | Official | Not shown |
| [Trade options with Python](https://public.com/api/docs/templates/trade-options-with-python) | Single-leg options flow: find contracts, read Greeks, validate with preflight, place the order | Live API (preflight step first) | Official | Not shown |
| [Trading 15-minute prediction markets](https://public.com/api/docs/templates/trade-15-minute-prediction-markets) | How the windows work, ready-made assistant prompts, then a rules-based Python script that trades each window | Live | Official | Not shown |
| [15-minute-prediction-market-bot](https://github.com/PublicDotCom/15-minute-prediction-market-bot) | Open-source local bot with a browser dashboard for strategies and positions | Live (not verified whether a dry-run exists) | Official | 2026-10-29 |
| [OpenClaw agent skill template](https://public.com/api/docs/templates/openclaw-agent-skill) | Install Public's agent skill into an OpenClaw agent | Live | Official | Not shown |
| [Perplexity agent skill template](https://public.com/api/docs/templates/perplexity-agent-skill) | Use Public's agent skill from Perplexity (OAuth connector also listed on the MCP page) | Live | Official | Not shown |
| [Public CLI template](https://public.com/api/docs/templates/publicdotcom-cli) | CLI route for scripted or agent-driven use | Live | Official | Not shown |
| [webinar-demos](https://github.com/PublicDotCom/webinar-demos) | Python scripts: delta-targeted single-leg options and bull put or bear call credit spreads with risk checks | Live API; README says illustrative only | Official | 2026-11-09 |

### Webull

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Webull Agent Skills](https://developer.webull.com/apis/docs/AI-friendly-Resources/skills) | Docs page for the agent skill (stocks, options, futures, crypto, event contracts via CLI, configurable risk controls) | Read, paper or live per config | Official | Repo `webull-inc/webull-openapi-skills` pushed 2026-11-10 |
| [Webull Local MCP Server](https://developer.webull.com/apis/docs/AI-friendly-Resources/local-mcp) | Run the open-source MCP server locally against your own API keys | Read, paper or live per config | Official | Repo pushed 2026-11-11 |
| [Webull Cloud MCP Server](https://developer.webull.com/apis/docs/AI-friendly-Resources/mcp/) | Hosted `api.webull.com/mcp` setup for AI clients | Live | Official | Not shown |
| [Webull CLI](https://developer.webull.com/apis/docs/AI-friendly-Resources/cli) | CLI an agent can shell out to | Per config | Official | Repo pushed 2026-11-11 |
| [Webull API Recipes (US)](https://developer.webull.com/apis/recipes_us/) | Runnable API recipes. Plain API, not agent-specific, so a base for agent tools | Per config | Official | Not shown |

### Plaid

Not a broker. Plaid's AI material is aimed at building Plaid integrations with coding agents, plus a Dashboard MCP, not at trading.

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Vibe coding tips](https://plaid.com/docs/resources/vibe-coding/) | Getting good results from AI coding tools on Plaid integrations | Sandbox or dev | Official | Not shown |
| [From prompt to prototype: AI tools for developers](https://plaid.com/blog/ai-development-toolkit/) | Announcement walkthrough of integration guides plus a sandbox MCP server | Sandbox | Official | Not shown |
| [ai-coding-toolkit](https://github.com/plaid/ai-coding-toolkit) | Rules, sandbox data and local MCP tools (mock data, docs search) for AI coding assistants | Sandbox | Official | 2026-10-15 |
| [Anthropic API plus Plaid MCP](https://plaid.com/blog/anthropic-api-mcp/) | Connect agents built on Anthropic's API to Plaid's Dashboard MCP for diagnostics and support | Read (Dashboard data) | Official | Not shown |

### Trade It (trade-agent)

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [MCP installation guide](https://docs.tradeit.app/installation) | Per-client MCP setup for Trade It | Live | Official | Not shown |
| [trade-it-mcp](https://github.com/trade-it-inc/trade-it-mcp) | Repo guide with Claude, Codex and Cursor plugin manifests and an agent skill | Live | Official | 2026-10-15 |
| [Trade It skills](https://github.com/trade-it-inc/skills) | `trade-it-developer` skill that gives a coding assistant the SDK and API context | Not applicable (dev context) | Official | 2026-11-10 |

### Tiger Brokers

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Tiger OpenAPI MCP docs](https://docs.itigerup.com/docs/mcp) | Local MCP setup | Per config | Official | Not shown |
| [Tiger remote MCP](https://docs.itigerup.com/docs/remote-mcp) | Hosted MCP setup | Per config | Official | Not shown |
| [Tiger OpenAPI skill docs](https://docs.itigerup.com/docs/skill) and [tigeropen-skill](https://github.com/tigerfintech/tigeropen-skill) | Agent Skills for Python and Java SDKs (market data, orders, accounts) for Claude Code, Cursor and others. Has a DISCLAIMER file | Per config | Official | 2026-10-22 |

### Upstox

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Agent Quickstart](https://upstox.com/developer/api-documentation/agent-quickstart/) | Connect an AI agent to the Upstox API | Live | Official | Not shown |
| [MCP Integration](https://upstox.com/developer/api-documentation/mcp-integration/) | Setup for Claude, Claude Code, ChatGPT, Cursor and VS Code | Live | Official | Not shown |
| [upstox-skills](https://github.com/upstox/upstox-skills) | SKILL.md package for orders, market feeds and portfolio | Live | Official | 2026-06-09 |

### OKX

The Agent Trade Kit explainer is already in the cookbook. This is the on-chain side.

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [onchainos-skills workflows](https://github.com/okx/onchainos-skills/tree/main/workflows) | Worked multi-step workflows: daily brief, token research, wallet analysis and monitoring, smart-money signals, new-token screening, portfolio check | Read mostly; swap and broadcast exist in the skills | Official | 2026-11-07 |

### Polymarket

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [agent-skills](https://github.com/Polymarket/agent-skills) | Skill covering auth, order patterns, market data, websockets, CTF operations, bridging, gasless transactions | Live (SDK based) | Official | 2026-02-19 |
| [polymarket-cli](https://github.com/Polymarket/polymarket-cli) | Rust CLI with JSON output for scripts and agents. README calls it early and experimental | Live | Official | 2026-05-26 |
| [Place Your First Order](https://docs.polymarket.com/trading/quickstart.md) | CLOB auth and first market order. Plain API quickstart, not agent-specific | Live | Official | Not shown |

### Robinhood

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Onboarding an external agent](https://robinhood.com/us/en/support/articles/onboarding-an-external-agent/) | Connect an outside agent over MCP to a dedicated agent account | Live (agent account, approvals on by default) | Official | Not shown |
| [Trading with your agent](https://robinhood.com/us/en/support/articles/trading-with-your-agent/) | Approvals, monitoring and what the agent can do once connected | Live | Official | Not shown |
| [Robinhood Agents overview](https://robinhood.com/us/en/agents/) | Product page: built-in agents, agent apps, MCP docs link. Mostly marketing, kept for the MCP link | Live | Official | Not shown |

### Truthifi

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [Claude for Finance connect hub](https://truthifi.com/connect-hubs/claude-finance) | Connect accounts and use the Truthifi MCP from Claude | Read (cannot move money) | Official | Not shown |
| [truthifi-mcp skills](https://github.com/Truthifi/truthifi-mcp/tree/main/skills) | Three skills: truthifi-setup, truthifi-portfolio-review, truthifi-fee-review | Read | Official | 2026-11-01 |
| [MCP tools reference](https://truthifi.com/mcp-tools) | Tool list with example questions | Read | Official | Not shown |

### TradeZero

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [TradeZero Recipes](https://developer.tradezero.com/recipes) | About 30 runnable Python and TypeScript recipes: first order, locates and short selling, flatten all, multi-leg options, P&L stream dashboard, idempotency. Plain API, not agent-specific | Paper or live per key | Official | Not shown |
| [TradeZero MCP guide](https://developer.tradezero.com/docs/documentation/mcp) | Hosted MCP for Claude, ChatGPT, Perplexity, Grok, Cursor, VS Code, with the short-locate workflow | Live (OAuth) | Official | Not shown |

### Others, one entry each

| Recipe or guide | What it teaches | Mode | Source | Last updated |
|---|---|---|---|---|
| [SnapTrade MCP Server docs](https://docs.snaptrade.com/docs/mcp-server) | Portfolio (read only) and Trading hosted servers, connector setup, example prompts | Read or live by server | Official | Not shown |
| [Tradier MCP/AI connectivity](https://tradier.com/individuals/mcp-server) | Connect Claude Code, Cursor, Gemini CLI or ChatGPT over Streamable HTTP. Setup page, no recipes | Per account | Official | Not shown |
| [TraderEvolution MCP Server for AI-powered trading](https://traderevolution.com/learn/mcp-server-ai-trading/) | Explainer of how the MCP server maps to platform trading and risk functions | Per deployment | Official | Not shown |
| [NinjaTrader MCP connect guide](https://docs.ninjatrader.com/mcp/connect) | Connect clients to the Tradovate demo or live MCP endpoints | Demo or live | Official | Not shown |

### Not covered

No first-party cookbook found for Coinbase (its `recipes` are stablecoin payments, not trading; [demo apps](https://docs.cdp.coinbase.com/get-started/demo-apps/learn) are wallet focused), Kalshi, IBKR, IG, Deriv, Hyperliquid, E*Trade, Fidelity, Degiro, Fineco, HL, Betterment, M1, MX, Lightspeed, Angel One, AMP, Forex.com. Alpaca /learn index loads but is JS rendered, so only the guides already in the README are confirmed. Nothing was bot-walled.

- Blocked to scripted fetches (not bypassed): TradeStation `/platforms-and-tools/mcp/`, ThinkMarkets AI trading and Chelsea AI pages, Trading212 root site. The first two read fine in a normal desktop browser and are covered in their entries; they carry no cookbook, only product and permissions pages. `docs.trading212.com/api` resolves but is plain API docs.
- No first-party cookbook, recipe or tutorial found: OANDA, Parlay, Questrade, Saxo Bank (only generic OpenAPI sample repos, no agent content), Schwab, Stash, Teller, Trade Republic, Vanguard, Wealthfront, Wealthsimple, XTB, Zerodha Kite Connect (the MCP repo README is the only guide), tastytrade (README only).
- Skipped: `Polymarket/agents` is archived, last push 2024-11-05, so not a live recipe.

## Community projects

Things people built on these servers and skills.

### Alpaca

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [Claude + Alpaca MCP + Google Sheets](https://alpaca.markets/learn/mcp-trading-with-claude-alpaca-google-sheets) | Official guide: Claude Desktop with the Alpaca MCP server, trades logged to Google Sheets | Paper by default (`ALPACA_PAPER_TRADE=true`), live switch documented | Official guide, 2026-06 |
| [Deploy the Alpaca MCP server remotely](https://alpaca.markets/learn/how-to-deploy-alpaca-mcp-server-remotely-on-claude-mobile-app) | Official guide: Docker deploy so Claude web and mobile can reach it | Paper or live by config | Official guide |
| [AlpacaTradingAgent](https://github.com/huygiatrng/AlpacaTradingAgent) | Multi-agent LLM trading framework in the TradingAgents style, places trades on Alpaca (Apache-2.0) | Paper or live, default not confirmed | 284, 2026-10-27 |
| [ClaudeTrading](https://github.com/khoks/ClaudeTrading) | Autonomous Claude Code skills plus scheduled tasks. Closest thing to Alpaca skills in practice | Paper only, hard-coded to the paper API URL | 4, 2026-05-10 |
| [synthetix-alpha](https://github.com/alan-d-smith/synthetix-alpha) | LLM agents do the research, a deterministic runtime trades through the Alpaca CLI and MCP (MIT) | Paper | 4, 2026-09-04 |

### Kraken

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [lablab.ai AI Trading Agents hackathon](https://lablab.ai/ai-hackathons/ai-trading-agents) | Kraken CLI track, ran 2026-03-30 to 04-12, with a gallery of entries (KrakenSense, QuantTrade Lite and others). Ranking used a read-only Kraken key | Paper or sandbox per entry | Event page |
| [hackathon-trading-agent](https://github.com/JudyaiLab/hackathon-trading-agent) | Kraken CLI agent with ERC-8004 identity and walk-forward validation | Paper (README reports 11+ days of paper trading) | 41, 2026-04-12 |
| [swiftward-ai-trading-agents](https://github.com/disciplinedware/swiftward-ai-trading-agents) | Multi-agent harness on Kraken CLI with risk controls | Not verified | 6, 2026-04-12 |
| [Axion-Trader](https://github.com/rishabjn10/Axion-Trader) | Autonomous agent on Kraken CLI plus Gemini Flash, multi-timeframe signals | Not verified | 1, 2026-03-31 |

### OKX

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [OKX Agent Trade Kit explainer](https://web3.okx.com/learn/agent-trade-kit) | Official setup guide: MCP plus CLI plus 4 skills (market, trade, portfolio, bots) | Demo mode with simulated assets, or live profiles | Official; the kit repo `okx/agent-trade-kit` has 508 stars, pushed 2026-11-10 |

Avoid `dex-original/okx-agent-trade-kit` (117 stars). It looks like an SEO-style fork of the official repo.

### Webull and moomoo

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [webull-claude-quant-bot](https://github.com/varonmiranda/webull-claude-quant-bot) | Fundamental trading agent using Claude and the Webull OpenAPI. The only Webull project we found | Not verified | 1, 2026-06-20 |
| [futu-opend-mcp](https://github.com/xyonium/futu-opend-mcp) | MCP server for Futu OpenD, read-only research quotes (MIT). Nearest moomoo and Futu item | Read-only, no trading | 9, 2026-09-12 |

## Frameworks, brakes and harnesses

Not demos of one broker, but things people build around these servers. Found by reading [awesome-ai-in-finance](https://github.com/georgezouq/awesome-ai-in-finance) on 2026-11-11. We read READMEs, not source, so "enforced" below means what the README claims unless we say we read the code (see the skills catalog for tradememory, where we did).

| Project | What it does | Mode | Stars, last push |
|---|---|---|---|
| [tradememory-protocol](https://github.com/mnemox-ai/tradememory-protocol) | A 20-tool memory MCP for trading agents. Its optional proxy sits in front of Alpaca's MCP and adds a symbol allowlist, notional caps, a required bracket stop, a daily-loss halt and an approval step. MIT, but the proxy extra pulls an AGPL dependency | Tested on Alpaca paper | 1,445, 2026-10-23 |
| [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | Research agent plus an MCP server with read, paper and live profiles for about 19 brokers and exchanges (Alpaca, Binance, OKX, eToro, Futu, Tiger, MT5, IBKR read-only and more). Live needs a "mandate" with limits and a kill switch, credentials go to the OS keyring. README does not say whether the mandate is enforced in code (MIT) | Read, paper or live | 38k, 2026-11-11 |
| [oracle3](https://github.com/YichengYang-Ethan/oracle3-prediction-market-agent) | Prediction-market agent for Kalshi, Polymarket and DFlow. The MCP has 13 tools and none place live orders. Live is CLI only, with a prompt-only approval skill and a CLI killswitch (Apache-2.0) | Paper in MCP, live via CLI | 569 |
| [QuantConnect Lean](https://github.com/QuantConnect/Lean) | The open-source engine behind QuantConnect. Backtest to live with `lean live`. Not MCP (Apache-2.0). Hosted live nodes are paid | Backtest, paper, live | 22k |
| [TraderHarness](https://github.com/HephaestLab/TraderHarness) | Evaluation harness for LLM trading agents with data-leakage masking. Backtest and paper only. API shows no license, README says Apache-2.0 | Backtest, paper | 42, 2026-08-22 |
| [TradingAgents](https://github.com/TauricResearch/TradingAgents) | Multi-agent LLM trading framework from Tauric Research (Apache-2.0). Simulated exchange only | Simulated | 122k |

## Gaps in the community projects

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
