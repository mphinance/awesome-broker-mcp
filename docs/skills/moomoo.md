# moomoo official agent skills (Moomoo Agent Hub)

| | |
|---|---|
| Skills repo | https://github.com/MoomooOpen/moomoo-agent-hub |
| Skills commit | `9e4554621f03f266cb495abec16261b34f565ae1` (committed 2026-11-10) |
| Skills license | **No LICENSE file in the repo.** README.md says "License: [MIT](LICENSE)" and shows an MIT badge, but the linked `LICENSE` file does not exist in the tree. Treated here as unlicensed for redistribution. |
| CLI repo | https://github.com/MoomooOpen/moomoo-cli |
| CLI commit | `338460699797948b5de692e6abe41eb24c62f060` (committed 2026-11-10) |
| CLI license | MIT (`LICENSE`: "MIT License, Copyright (c) 2026 moomoo") |
| Date scraped | 2026-11-11 |
| Install (one skill) | `npx skills add -y -g MoomooOpen/moomoo-agent-hub --skill <slug>` |
| Install (CLI the skills drive) | `curl -fsSL https://raw.githubusercontent.com/MoomooOpen/moomoo-cli/main/scripts/install.sh \| sh` (each skill asks consent before running it) |

Method: shallow clones read as plain files. No script, installer or CLI from either repo was executed.

## Why full text is not reproduced

The skills repo ships no LICENSE file, so there is no grant to redistribute the SKILL.md text. The README's MIT claim points at a missing file, and a badge is not a license grant. This page therefore gives detailed summaries plus short verbatim quotes of the guardrail and confirmation rules only. The moomoo CLI repo is MIT, so its README and source behavior are described and quoted more freely.

## Headline finding: the real gate lives in the CLI, and the skills never mention it

The moomoo-cli README (MIT) says: "Securities and crypto order writes default to dry-run. The first call validates and previews the request, returns a three-digit confirmation code, and does not submit. Re-run the same command with `--execute <code>` to place, modify, or cancel." And: "Simulated trading (`sim order`) is not gated."

Source check (`cmd/trade_gate.go`, `internal/dryrun/dryrun.go`):

- `gateTradeExecution` prints a dry-run preview and returns without submitting unless `--execute` is passed. It is wired into `order buy|sell|place|modify|cancel` and `crypto order place|buy|sell|modify|cancel`.
- The code is deterministic: `sha256("moomoo/execute-confirmation/v1" + "\n" + canonical)` reduced to 3 digits. For a new order the canonical scope is `order|side|symbol|qty|price` (market orders use the label `market`). Cancel is `on_order|action|orderID`, modify is `replace|orderID|qty|price`.
- Consequences: (1) the code is a 1-in-1000 typo/double-submit check, not a human-in-the-loop gate, because an agent can read it from the preview output and immediately re-run with it, or compute it; (2) the scope does NOT include account id, order type, time in force or session, so those can change between preview and execute without invalidating the code.
- Separately, the CLI has a broker-side prompt path (`handleOrderConfirmation`, triggered when the API returns `need_order_confirm`) that asks via `confirmAction` and then calls the confirm endpoint.

None of the four trading SKILL.md files (v0.0.3 / v0.0.4) mention `--execute`, `--dry-run` or the confirmation code. Their only confirmation instruction is model-enforced text. In practice, an agent following the skill literally will hit the dry-run on its first `moomoo order buy ...`, get the code, and re-run with `--execute <code>`; nothing in the skill tells it to stop and show the human the preview first. So the human gate is: model obeys "explicit user confirmation first". The CLI gate only guarantees two calls, not a human.

The README of moomoo-agent-hub (not the SKILL.md files) adds "The agent does not confirm on the user's behalf" and "A submit is not a fill". Those two sentences are README-level guidance and are not in any trading SKILL.md body as of these commits.

## Summary table

11 skills in 4 groups. All but the 3 content skills need the local `moomoo` CLI (OAuth via `moomoo auth login`). `--source skill` is appended to every CLI call by skill convention (telemetry marker, `agent_name` auto-detected).

| Skill (version) | What it does | Tools / CLI commands it calls | Capability | Guardrail text (verbatim, short) |
|---|---|---|---|---|
| `moomoo-trading` (0.0.4) | Live securities account: accounts, funds, cash logs, fees, margin ratio, positions, buy/sell/place/modify/cancel, order list/history/detail, fills, max qty | `moomoo auth status`, `check`, `account list`, `account funds`, `account cash-logs`, `margin-ratio`, `position`, `order buy|sell|place|modify|cancel|list|history|detail|max-qty|fees`, `deal`, `deal history`, `config set default_account` | **live trade** (stocks, options incl. multi-leg via `order place --order-class MLEG`, conditional orders) | "Real account mutations require explicit user confirmation first: `order buy`, `order sell`, `order place`, `order modify`, and `order cancel`." / "Do not assume a default account exists." / "Do not invent broker confirmation." |
| `moomoo-sim-trading` (0.0.3) | Paper (simulated) securities accounts | `moomoo sim account list|funds`, `sim position`, `sim order buy|sell|place|modify|cancel|list|history|max-qty` | **paper trade** | "Use this skill only when the user explicitly asks for simulated trading, paper trading, demo trading, or `sim` commands." / "do not assume simulation. Ask whether they mean simulated trading or real trading." |
| `moomoo-crypto` (0.0.3) | Crypto exchange account: balances, max qty, orders, fills | `moomoo crypto account list`, `balance`, `max-qty`, `order place|buy|sell|modify|cancel|list|history|detail`, `deal`, `deal history` | **live trade** (crypto) | "Crypto orders may affect real assets; confirm account, pair, side, quantity, and price or cash amount before mutation." |
| `moomoo-quote` (0.0.3) | Market data: quotes, K-line, snapshot, ticker, order book, depth, rank, option chain, futures, screeners, calendar, watchlist | `moomoo quote`, `basicinfo`, `snapshot`, `kline`, `history-kline`, `ticker`, `rt-data`, `order-book`, `depth`, `rank`, `option chain`, `future-info`, `market-state`, `stock-screen`, `warrant-screen`, `option-screen`, `trading-days`, `watchlist` | **read** (watchlist add/delete/move is a write, but not an order) | "Do not execute securities, crypto, or simulated trading orders." / "`watchlist --action add/delete/move-out` mutates the user's watchlist. Confirm target group and symbols unless the user has already explicitly requested that mutation." |
| `moomoo-grid-strategy` (no version in frontmatter) | Generates a single-symbol base-price grid trading program; does not itself trade | Writes code against OpenAPI `llms.md` pages at `webapi.moomoo.com` (account, funds, positions, place/cancel order, open orders, quote, push). Not the CLI. | **paper by default; live if user says so** (program the agent writes) | "Trading environment: paper trading. Switch to the live-trading pages only after the user explicitly says so in the current conversation (for example 「使用实盘」). Keep the second confirmation and trading password required by the docs." |
| `moomoo-unusual-technical-signal-alerts` | Technical anomaly alerts (K-line patterns, CCI/KDJ/RSI/MACD/BOLL/MA etc.) | `moomoo unusual technical-signals <symbol>` | read | "Do not interpret the result as investment advice or trading guidance." |
| `moomoo-unusual-capital-flows` | Capital flow, brokers, short selling anomalies | `moomoo unusual capital-flows <symbol>` | read | same "not investment advice" rule; "If the CLI returns an error, surface the error message and do not fabricate results." |
| `moomoo-unusual-derivatives-activity` | Options and HK warrant anomalies (IV, big option trades, CBBC) | `moomoo unusual derivatives-activity <symbol>` | read | same as above |
| `moomoo-news-search` | News/notice/research listing, retrieval only | `curl` to `https://ai-news-search.moomoo.com/news_search` | read (public HTTP, no login) | "Do not interpret the results as investment advice, trading signals, or target-price guidance." |
| `moomoo-stock-digest` | Interprets latest news for one stock into a digest | `curl` to `https://ai-news-search.moomoo.com/news_search` | read | mandatory disclaimer; "autonomous trading advice" listed as out of scope |
| `moomoo-comment-sentiment` | Community bullish/bearish sentiment from posts | `curl` to `https://ai-news-search.moomoo.com/stock_feed` | read | "Every user-facing answer must end with a non-investment disclaimer."; out of scope: "financial advice, target price, or trading execution" |

## Order-capable skills in detail

### moomoo-trading (live stock/option orders)

Frontmatter: `allowed-tools: Bash Read`, `requires.bins: [moomoo]`, version 0.0.4. Description: "moomoo CLI securities trading skill for OAuth status, accounts, funds, cash logs, order fees, margin ratio, positions, buy/sell/place/modify/cancel orders, order queries, fills, and max tradable quantity".

Behavior (from SKILL.md and `references/cli-parameters.md`):

- Install flow: resolve `moomoo` from PATH, `~/.moomoo/bin/moomoo` or `%LOCALAPPDATA%\MoomooCLI\bin\moomoo.exe`. If missing: "ask the user, then install it. Do not run the installer without explicit consent." The installer is a `curl | sh` from the moomoo-cli repo.
- Auth: prefer `moomoo auth status --format json`; reachability via `moomoo check --format json`. "Never read or print token file contents." `PERMISSION_DENIED` is "a server-side permission denial, not proof that the token header is missing."
- Account selection: "Do not assume a default account exists. Omit `--account` only after this session has confirmed a configured default account via `moomoo auth status` or config; otherwise list accounts or ask the user to choose one, then pass `--account` explicitly."
- Symbols are `MARKET.CODE` (`US.AAPL`, `HK.00700`). `HK.700` is normalized to `HK.00700`. Old suffix form and bare tickers are rejected.
- Minimal-flag rule: omit any flag that has a default unless the user changed it. Defaults relevant to risk: `--type market`, `--time-in-force DAY`. So "buy 1 Apple share" becomes a market order unless the user says limit.
- Order commands: `order buy <symbol> <qty>`, `order sell`, `order place <qty> --side ...` (BUY, SELL, SELL_SHORT, BUY_BACK, conditional, multi-leg via `--order-class MLEG --multi-leg-info '<json>'`), `order modify <id> --exchange --qty [--price] [--aux-price]`, `order cancel <id> --exchange`. Order options include `--price --type --time-in-force --lot-type --remark --session --aux-price`.
- Queries: `order list` and `deal` default `--market HK`, auto-page; `order history`/`deal history` take microsecond `--start/--end`; `account cash-logs` returns one page per call and needs `--page-flag` until `completed`; `margin-ratio` needs `--security-firm` and up to 10 `--codes`; `order fees` needs a concrete order id (FX not supported).
- Confirmation rules (verbatim): "Real account mutations require explicit user confirmation first: `order buy`, `order sell`, `order place`, `order modify`, and `order cancel`." and "Do not invent broker confirmation. If the CLI reports broker confirmation because the API returned `need_order_confirm=true` / `confirm_id`, relay the prompt and wait for explicit approval before sending `y`."
- Live vs paper: this skill covers only live. It says "Use `moomoo-crypto` for cryptocurrency exchange trading." Paper is a separate skill; there is no flag in this skill that selects paper.

Model-enforced only (flagged): the explicit-confirmation requirement, the "do not assume a default account" rule, "do not invent broker confirmation", and the minimal-flag rule. The CLI does independently enforce a dry-run plus 3-digit `--execute` code (see headline finding), but that is a typo gate and the skill does not instruct the agent about it.

### moomoo-sim-trading (paper)

Hard boundary with live: "Never use real securities commands such as `moomoo order ...`, `moomoo position`, or `moomoo account funds` from this skill. The simulated equivalents are under `moomoo sim ...`." and "Never use crypto commands such as `moomoo crypto ...` from this skill."

Ambiguity handling: "If the user says only "buy", "sell", "place an order", "modify order", or "cancel order" without saying simulated/paper/demo, do not assume simulation. Ask whether they mean simulated trading or real trading."

Even paper writes need clarity: "A simulated order does not affect real assets, but it still mutates the user's simulated account state. Account, market, symbol, side, quantity, price/order type, and order ID must be clear before placing, modifying, or canceling simulated orders."

Account rule: "Prefer `moomoo sim account list --format json` to identify the simulated account, then pass `--account <sim-account-id>` explicitly. Do not treat a real securities account ID as a simulated account ID." Note the CLI README says that if `--account` is omitted, `sim` commands use "the first simulated account returned by the account-list endpoint", so the skill's explicit-account rule is stricter than the CLI.

Pagination for history uses `--next-key` from `pagination.next_key`. The CLI does not gate `sim order` (no dry-run), so paper orders submit on the first call. Model-enforced: the live/paper boundary (the agent could still run `moomoo order buy` from a session where this skill is loaded; the skill only tells it not to).

### moomoo-crypto (live crypto)

Scope is limited: "Current CLI scope is crypto exchange trading only: accounts, balances, max quantity, orders, and fills under `moomoo crypto`. Do not use or suggest Web3 wallet, swap, or transfer commands." Pairs are `BTCUSD`, `ETHHKD` style, not `MARKET.CODE`. Crypto order defaults per `references/cli-parameters.md`: `--type LIMIT`, `--time-in-force TIF_GTC`, auto `--req-id`; `order place|buy` accept `--qty` or `--cash-qty`. Max-qty: prefer `--type MARKET` for generic checks, pass `--currency` for non-USD pairs.

Guardrails (verbatim): "Crypto orders may affect real assets; confirm account, pair, side, quantity, and price or cash amount before mutation." and "Do not invent broker confirmation. If the CLI prompts for confirmation or broker confirmation, relay the prompt and wait for explicit approval before sending `y`." Also "Do not assume a default account exists." Model-enforced, plus the same CLI dry-run/`--execute` gate (wired for `crypto order place|buy|sell|modify|cancel`).

### moomoo-grid-strategy (strategy generator, paper by default)

This is a code-generation skill, not a CLI driver. It tells the agent to write a restart-safe reconciliation loop against the OpenAPI `llms.md` (index `https://open.moomoo.com/zh-cn/llms.txt`), on the `webapi.moomoo.com` product line. It "does not repeat request bodies."

Scope: one symbol (stock or ETF), HK/US/SH/SZ, base-price grid with percentage spacing, limit orders valid for the day, N = 3 to 50 levels per side. Out of scope: "range grids, adding size after a break below the lower bound, options, futures, crypto, multiple symbols, market orders, and quoting profit while skipping fees."

Workflow (section 2): collect parameters (read `lot_size` from stock basic info, "Do not guess 100"), run six checks G1 to G6 (tick share of grid width, fees as share of gross profit, capital required with 15% buffer, whether P10/P90 of 120-day closes are covered, grid width vs average daily range, level count), stop on any FAIL ("Do not write trading code. Do not place orders."), show a parameter card on WARN, write the program in four parts (grid, state file, broker adapter, loop), run network-free acceptance tests, and "When the user asks to run it, connect only to the paper account."

Program rules it imposes on generated code: base price persisted in a local JSON state file and not silently recomputed if parameters change; order marks like `g1b`/`g1s` and "Cancel only open orders for the same symbol whose mark belongs to this strategy"; shares already held at startup are never sold; out-of-range or drawdown breach cancels the strategy's orders, keeps the position and stops; on exit "cancel this strategy's open orders, keep the position, and write the state file"; Shanghai/Shenzhen same-day sell is blocked via sellable quantity.

Paper vs live (verbatim): "Switch to the live-trading pages only after the user explicitly says so in the current conversation (for example 「使用实盘」). Keep the second confirmation and trading password required by the docs. Do not write passwords, AppKeys, private keys, or tokens into the repository, and do not print them in logs." and "A live order happens only after the user has said to use the live account".

Refusal list (section 10, paraphrased): level count below 3 or above 50; proceeding with a FAIL check; adding size or levels after a lower-bound break; same-day buy and sell on SH/SZ; skipping fee calculation; removing the out-of-range stop; touching orders without the strategy's mark; asking for or echoing a trading password or key.

Gaps: everything is model-enforced and enforced in code the model writes. The skill names no CLI, so the CLI's dry-run gate does not apply to the generated program, which calls the OpenAPI directly. The fee rates and tick tables in the skill are admitted to be order-of-magnitude ("check the broker's current fee schedule before going live"). No server-side check that the generated program uses the paper account.

### moomoo-quote (read, no orders)

Covers `quote`, `basicinfo`, `snapshot`, `kline`, `history-kline`, `ticker`, `rt-data`, `order-book`, `depth`, `rank`, `option chain`, `future-info`, `market-state`, `combo-option-quote`, `referencefuture-list`, `stock-screen`, `warrant-screen`, `option-screen`, `trading-days`, plus `watchlist --action add|delete|move-out` (a write to the user's watchlist). It explicitly refuses order placement and points to the trading skills. Live push/broker queue is not in the CLI: the skill redirects to the Open API Quote Push WebSocket `wss://webapi-quote.moomoo.com/ws` and says "Do not use OpenD or removed `moomooapi` subscribe scripts." Pagination: follow `pagination.next_key` exactly; `history-kline` and `capital --view history` use `--next-time`.

### Unusual skills and content skills (read-only)

The three `moomoo-unusual-*` skills share `references/cli-runtime.md` and call `moomoo unusual capital-flows|derivatives-activity|technical-signals <symbol>` (`anomaly` is an alias). They require the agent to normalize the stock name to a `MARKET.CODE` symbol first, return `No unusual activity` when nothing qualifies, never merge anomaly classes, and never fabricate when the CLI errors. The three content skills use `curl` against `ai-news-search.moomoo.com` (`news_search`, `stock_feed`), send no credentials, and require a non-investment disclaimer. Trigger descriptions are bilingual (Chinese and English). None of these skills can place an order.

## References read

- `skills/quote-trade-skills/*/references/cli-parameters.md` (full command and flag tables for trading, sim, crypto, quote)
- `references/dictionaries.md` (markets, sides, order types, statuses, error codes), `moomoo-quote/references/pagination.md`, `websocket-push.md`
- `skills/unusual-skills/references/cli-runtime.md`
- `docs/upgrade-from-opend.md`, `docs/migration-gaps-and-rest-api.md`, `docs/websocket-quote-push.md`, `docs/moomoo-install.md` (OpenD removal, REST gaps, WebSocket push)

## Guardrail gap list

1. Skills never mention the CLI's `--execute <code>` gate (model gets the code in the dry-run output and can resubmit in one step).
2. The 3-digit code covers side, symbol, qty, price only. Account, order type, time in force and session are not in the scope.
3. Human confirmation is skill text only ("explicit user confirmation first"). No server or CLI mechanism requires a human.
4. `moomoo-trading` v0.0.4 defaults to market orders and DAY when flags are omitted.
5. Paper/live separation is instruction text. `moomoo sim order` is ungated and `moomoo order` is a sibling command in the same binary.
6. `moomoo-sim-trading` forbids auto-picking an account, but the CLI itself falls back to the first sim account.
7. Grid skill generates code that talks to OpenAPI directly, bypassing the CLI gate; paper default is an instruction.
8. The README statements "The agent does not confirm on the user's behalf" and "A submit is not a fill" are README-only; they are not in the trading SKILL.md bodies at these commits.
9. License ambiguity: README says MIT, no LICENSE file.


## moomoo-agent-plugin: hosted MCP server plus 4 skills (separate repo, MIT)

A second moomoo distribution, different from the Agent Hub and CLI above. It routes everything through moomoo's hosted MCP server instead of the local `moomoo` CLI, so the CLI's dry-run and `--execute <code>` gate documented earlier does not apply to this path.

| | |
|---|---|
| Repo | https://github.com/MoomooOpen/moomoo-agent-plugin |
| Commit | `0b28d3c23f08702fd0afae9d3a639ff0fb21290b` (committed 2026-09-28; plugin version 1.0.0) |
| License | MIT (`LICENSE`: "Copyright (c) 2026 moomoo"). Unlike the Agent Hub, the license file exists, so the trading `SKILL.md` text is reproduced below. |
| Date scraped | 2026-11-11 |
| Install | Claude Code: `/plugin marketplace add MoomooOpen/moomoo-agent-plugin`. Codex: `codex plugin marketplace add MoomooOpen/moomoo-agent-plugin`. Cursor: add `https://github.com/MoomooOpen/moomoo-agent-plugin.git` as a marketplace. Other tools read the root `plugin.json` (Agent Plugins standard). |
| MCP endpoint | `https://mcp.moomoo.com/mcp`, Streamable HTTP (`mcp.json`: `"type": "streamable-http"`; `.mcp.json` for Claude Code and Codex has the URL only). Server name `moomoo-mcp`; tools appear to the agent as `mcp__moomoo-mcp__<tool>`. |

Method: shallow clone read as plain files. The hosted MCP server was NOT connected to; everything below comes from the README, the plugin manifests and the skill reference files. No script was executed.

### Hosted MCP: auth and trading scope (README and manifests only)

- `mcp.json` and `.mcp.json` carry only the URL. No API key field, no header, no client id, no scope string appears anywhere in the repo (grep for oauth, scope, unlock, password found only README line 168 and unrelated "scope" wording in field descriptions).
- The one auth statement is in the README's Codex marketplace notes: `authentication: "ON_INSTALL"` "Triggers OAuth authentication on install". The Codex marketplace file sets that policy. The Claude Code and Cursor manifests say nothing about auth, so the flow there is whatever the MCP client does against the server. OAuth scopes, token lifetime, and any separate trade-unlock or trade-password step are not documented in this repo.
- Account authority is server-side: `account_authorized_trd_accs` is described as listing "all business accounts that the currently logged-in user is authorized to operate". Order tools take an `acc_id`.
- Manifest capability claims differ per client. Root `plugin.json`: `"capabilities": ["Read", "Write"]`, description "full real/simulated trading capabilities including order placement, modification, and cancellation". `.codex-plugin/plugin.json`: `"capabilities": ["Read"]`, description "simulated trading (real trading not supported)", and its long description adds "real account trading and web3 transactions are not supported in the Codex environment". `.claude-plugin/plugin.json` declares no capability field. The Codex restriction is enforced only by the Codex copy of the skill telling the model not to call four tools (below); the MCP URL is the same, so nothing in this repo stops the server from accepting those calls.
- "web3 transactions" implies the hosted server has tools beyond the 88 documented here; none are described in this repo.

### Tool list (documented in the skills and `reference/` files, 88 distinct names)

- Account and real trading (9 account plus 4 order tools): `account_authorized_trd_accs`, `account_funds`, `account_positions`, `account_orders_active`, `account_orders_history`, `account_orders_detail`, `account_order_fills_today`, `account_fills_history`, `account_trading_info`; `trading_order_place`, `trading_order_replace`, `trading_order_cancel`, `trading_order_confirm`.
- Simulated trading (8): `sim_trade_account_list`, `sim_trade_cash_info`, `sim_trade_position_list`, `sim_trade_max_buy_sell`, `sim_trade_history_order_list`, `sim_trade_input_order`, `sim_trade_modify_order`, `sim_trade_cancel_order`.
- Quote and watchlist (16): `quote_stock_quote`, `quote_market_snapshot`, `quote_cur_kline`, `quote_history_kline`, `quote_order_book`, `quote_rt_ticker`, `quote_rt_data`, `quote_market_state`, `quote_trading_days`, `quote_user_security`, `quote_user_security_group`, `quote_modify_user_security` (writes the watchlist: ADD, DEL, MOVE_OUT), `quote_plate_list`, `quote_plate_stock`, `quote_owner_plate`, `quote_stock_basicinfo`.
- Screening (8 own plus shared option and futures tools): `quote_stock_screen`, `quote_warrant_screen`, `quote_option_screen`, `quote_ipo_list_hk`, `_us`, `_cn`, `_sg`, `_my`; plus `quote_option_chain`, `quote_option_expiration_date`, `quote_option_volatility`, `quote_option_exercise_probability`, `quote_future_info`, `quote_referencefuture_list`.
- News and research (rest of the 67 `quote_*` names): `quote_news_search`, `quote_community_search`, `quote_stock_feed`, `quote_economic_calendar_hot`, `quote_economic_calendar_search`, `quote_financials_statements`, `quote_financials_revenue_breakdown`, `quote_financials_earnings_price_history`, `quote_financials_earnings_price_move`, `quote_valuation_detail`, `quote_valuation_index_component_stock_list`, `quote_valuation_plate_stock_list`, `quote_valuation_index_stock_plate_list`, `quote_research_analyst_consensus`, `quote_research_rating_summary`, `quote_research_morningstar_report`, `quote_company_profile`, `quote_company_executives`, `quote_company_executive_background`, `quote_company_operational_efficiency`, `quote_shareholders_overview`, `quote_shareholders_holder_detail`, `quote_shareholders_holding_changes`, `quote_shareholders_institutional`, `quote_insider_holder_list`, `quote_insider_trade_list`, `quote_corporate_actions_dividends`, `quote_corporate_actions_buybacks`, `quote_corporate_actions_stock_splits`, `quote_corporate_actions_rehab`, `quote_capital_flow`, `quote_capital_flow_history`, `quote_capital_distribution`, `quote_short_interest`, `quote_daily_short_volume`, `quote_top_ten_brokers`, `quote_top_ten_brokers_history`.

Each skill also says "New tools are continuously being added ... match available tools by prefix", so the live tool list will drift from this snapshot.

### Summary table (4 skills, plus a Codex variant of the account skill)

| Skill | What it does | Tools called | Capability | Guardrail text (short verbatim) |
|---|---|---|---|---|
| `moomoo-mcp-account` | Accounts, funds, positions, orders, fills; real and simulated order place, modify, cancel; risk-control confirm. Markets: HK, US, SG, JP, CA, A-share via Stock Connect, futures, options (including multi-leg `MLEG`) | the 21 account, `trading_*` and `sim_trade_*` tools above | read, paper (`sim_trade_*`), live (`trading_order_*`) | "All trading operations (place, modify, cancel orders) must go through a secondary confirmation flow and must not be skipped" |
| `moomoo-mcp-account` (Codex copy in `codex-skills/`) | Same, with real execution disabled by instruction; real account reads still allowed; simulated trading full | account reads and `sim_trade_*` | read, paper | "Do NOT call any real order execution tools" |
| `moomoo-mcp-quote` | Quotes, K-lines, order book, ticks, time-sharing, market state, calendar, watchlist, sectors | 16 quote tools above | read, plus watchlist write | "If the user only mentions a stock name without providing a code, first confirm the code via snapshot before proceeding" |
| `moomoo-mcp-screen` | Stock, warrant, option screening, IPO lists | `quote_stock_screen`, `quote_warrant_screen`, `quote_option_screen`, `quote_ipo_list_*` | read | "proactively highlight risk indicators such as expiry date, leverage, and premium rate" |
| `moomoo-mcp-news` | News, announcements, research reports, financials, valuation, ratings, shareholders, insiders, corporate actions, capital flow, short interest | the `quote_*` research tools above | read | none beyond presentation rules |

### Guardrails: server-side versus model-enforced

**Server-side (per the reference files, not verified by connecting)**

- Order tools require explicit `side`, `order_type`, `qty` and `time_in_force` (`DAY` or `GTC`); there is no default to market or DAY in the documented schema. Market orders for US stocks only support the `RTH` session.
- Server risk control: `trading_order_place` and `trading_order_replace` can return `need_order_confirm=true` with a `confirm_id`. The order "has not taken effect" until `trading_order_confirm` is called with that `confirm_id`, which is valid only from the immediately preceding place or modify response and is one-time use. This is a real server gate, but it is a second tool call the model itself makes. Nothing in the repo shows it requires a human or an app-side approval.
- Real and simulated trading are separate tool families (`trading_order_*` vs `sim_trade_*`), and `trading_order_replace` does not support A-share modification. Both are server behavior.

**Model-enforced only**

- Mandatory account selection: "you must call both `account_authorized_trd_accs` and `sim_trade_account_list` simultaneously and let the user choose which account to use".
- The three-step confirmation: display an order summary, wait for an explicit "confirm" / "place order" / "execute", no automatic execution: "Even in auto mode or batch operation scenarios, each trade must be individually confirmed". "liquidate all" or "sell everything" must be confirmed one order at a time.
- Calling `trading_order_confirm` only "after the user confirms" a `need_order_confirm` prompt.
- The Codex lock on real orders. The Codex skill and manifests say real execution is unavailable; the copy only instructs the model "to politely explain". The same tools are reachable on the same URL.
- Preferring paper: "Recommend new users to practice with simulated trading (`sim_trade_*`) first".
- Watchlist writes (`quote_modify_user_security`) are in the quote skill with no confirmation rule; the account skill's "Query operations can be executed directly without confirmation" does not mention them.

**Not present anywhere in the repo**: notional or quantity caps, symbol allowlists, daily loss limits, an audit log, a read-only mode switch, scoped tokens. Whether the hosted server enforces any such limit is not documented here.

### Full SKILL.md: moomoo-mcp-account (MIT)

Reproduced verbatim from `skills/moomoo-mcp-account/SKILL.md` at commit `0b28d3c23f08702fd0afae9d3a639ff0fb21290b`, licensed MIT, Copyright (c) 2026 moomoo.

~~~~markdown
---
name: moomoo-mcp-account
description: moomoo Account Trading — Real trading (place/modify/cancel/confirm orders) / Simulated trading / Account / Funds / Positions / Orders / Fills
---

# moomoo MCP Account Trading

You are a moomoo trading assistant, providing account and trading capabilities through the `mcp__moomoo-mcp__` prefixed toolset. New tools are continuously being added — before use, match available tools by prefix and do not assume something is "unsupported".

## Intent Routing

### Account Queries
| User Intent | Tool | Notes |
|-------------|------|-------|
| View accounts | `account_authorized_trd_accs` + `sim_trade_account_list` | Real + simulated; let the user choose |
| Fund information | `account_funds` (real) / `sim_trade_cash_info` (simulated) | |
| Positions | `account_positions` (real) / `sim_trade_position_list` (simulated) | |
| Today's active orders | `account_orders_active` | |
| Historical orders | `account_orders_history` / `sim_trade_history_order_list` | |
| Order details | `account_orders_detail` | Batch query, up to 100 orders |
| Today's fills | `account_order_fills_today` | |
| Historical fills | `account_fills_history` | Supports filtering by time/security/market |
| Max buy/sell quantity | `account_trading_info` (real) / `sim_trade_max_buy_sell` (simulated) | |

### Real Trading
| User Intent | Tool | Notes |
|-------------|------|-------|
| Place order | `trading_order_place` | Buy/Sell/Short sell/Buy to cover |
| Modify order | `trading_order_replace` | Modify price/quantity |
| Cancel order | `trading_order_cancel` | |
| Risk control confirmation | `trading_order_confirm` | When `need_order_confirm=true` |

### Simulated Trading
| User Intent | Tool | Notes |
|-------------|------|-------|
| Simulated order placement | `sim_trade_input_order` | |
| Simulated order modification | `sim_trade_modify_order` | |
| Simulated order cancellation | `sim_trade_cancel_order` | |

## Order Parameter Quick Reference

- **Side (side)**: `BUY`/`SELL`/`SELL_SHORT`/`BUY_BACK`
- **Order type (order_type)**: `LIMIT`/`MARKET`/`AUCTION`/`AUCTION_LIMIT`/`STOP`/`STOP_LIMIT`/`MARKET_IF_TOUCHED`/`LIMIT_IF_TOUCHED`
- **Time in force (time_in_force)**: `DAY` (good for day) / `GTC` (good till cancelled)
- **Trading session (session, US stocks only)**: `RTH`/`RTH+Pre/Post-Mkt`/`OVERNIGHT`/`ALL_DAY`
- **Exchange codes**: US=US stocks, SEHK=HKEX, SGX=Singapore, SSE=Shanghai Stock Connect, SZSE=Shenzhen Stock Connect, JP=Japan, CA=Canada, CME/CBOT/NYMEX/COMEX=US futures, CBOE=US options, HKFE=HK futures

## Key Rules

### 1. Account Confirmation (Mandatory)

Before any trading or account query, you must call both `account_authorized_trd_accs` and `sim_trade_account_list` simultaneously and let the user choose which account to use.

### 2. Secondary Trading Confirmation (Mandatory)

All trading operations (place, modify, cancel orders) must go through a secondary confirmation flow and must not be skipped:

1. **Display order summary** — Clearly present to the user: account (real/simulated, account ID), security code and name, side, quantity, price (show price for limit orders, mark "market price" for market orders), order type and time in force
2. **Wait for explicit user confirmation** — Only call the trading API after receiving an explicit affirmative reply such as "confirm" / "place order" / "execute"
3. **No automatic execution** — Even in auto mode or batch operation scenarios, each trade must be individually confirmed

Applicable tools: `trading_order_place`, `trading_order_replace`, `trading_order_cancel`, `sim_trade_input_order`, `sim_trade_modify_order`, `sim_trade_cancel_order`

### 3. Risk Control Secondary Confirmation

If the order placement API returns `need_order_confirm=true`, call `trading_order_confirm` after the user confirms to complete the system-level confirmation.

### 4. Other Guidelines

- Query operations can be executed directly without confirmation
- When displaying positions, calculate profit/loss percentages and differentiate gains from losses
- If the user wants to "liquidate all" or "sell everything", each operation must be confirmed individually
- Display amounts with 2 decimal places; display share quantities as integers
- Recommend new users to practice with simulated trading (`sim_trade_*`) first
- Interfaces with `next_key` require looping until `has_more=false`
- When a user's request cannot be directly matched to the table above, first list all available tools with the `mcp__moomoo-mcp__` prefix — new tools may have been added

## Parameter Reference Documentation

Read as needed when you need to verify parameter details; no need to load all at once:

| Category | File |
|----------|------|
| Real trading — Account/Funds/Positions/Orders/Fills/Max buy-sell | `reference/trading-real.md` |
| Real trading — Place/Modify/Cancel/Confirm orders | `reference/trading-real-order.md` |
| Simulated trading (all) | `reference/trading-sim.md` |
~~~~

### Full SKILL.md: moomoo-mcp-account, Codex copy (MIT)

From `codex-skills/moomoo-mcp-account/SKILL.md`, same commit. Differences from the main copy: real order tools are disabled by instruction, the side and order-type parameters are described as integers (`1` to `4` for side; `1` Limit, `3` Market) instead of strings, and it lists `account_orders_detail` as a batch of up to 50 instead of 100.

~~~~markdown
---
name: moomoo-mcp-account
description: moomoo Account & Simulated Trading — Real account queries (accounts/funds/positions/orders/fills) / Simulated trading (place/modify/cancel orders) — real order execution is not available in Codex
---

# moomoo MCP Account & Simulated Trading (Codex)

You are a moomoo account and simulated trading assistant, providing account query and simulated trading capabilities through the `mcp__moomoo-mcp__` prefixed toolset. New tools are continuously being added — before use, match available tools by prefix and do not assume something is "unsupported".

> **Codex restriction**: Real account **read-only queries** (accounts, funds, positions, orders, fills) are available. However, real **order execution** tools (`trading_order_place`, `trading_order_replace`, `trading_order_cancel`, `trading_order_confirm`) are **not available**. If the user requests real order placement/modification/cancellation, explain that real trading execution is not supported in the Codex environment and suggest using the moomoo app or other supported platforms. Simulated trading is fully supported.

## Intent Routing

### Real Account Queries (Read-Only)
| User Intent | Tool | Notes |
|-------------|------|-------|
| View real accounts | `account_authorized_trd_accs` | List all authorized accounts |
| Fund information | `account_funds` | Buying power, total assets, cash, P&L |
| Positions | `account_positions` | Filter by code, P&L ratio |
| Today's active orders | `account_orders_active` | Paginated with `page_flag` |
| Historical orders | `account_orders_history` | Supports time range and code filter |
| Order details | `account_orders_detail` | Batch query, up to 50 orders |
| Today's fills | `account_order_fills_today` | |
| Historical fills | `account_fills_history` | Supports filtering by time/security/market |
| Max buy/sell quantity | `account_trading_info` | Query only, no execution |

### Simulated Account Queries
| User Intent | Tool | Notes |
|-------------|------|-------|
| View simulated accounts | `sim_trade_account_list` | Accounts are auto-created on first call |
| Fund information | `sim_trade_cash_info` | Balance, buying power, P&L |
| Positions | `sim_trade_position_list` | Filter by market |
| Historical orders | `sim_trade_history_order_list` | |
| Max buy/sell quantity | `sim_trade_max_buy_sell` | |

### Simulated Trading (Execute)
| User Intent | Tool | Notes |
|-------------|------|-------|
| Place order | `sim_trade_input_order` | Limit / Market orders |
| Modify order | `sim_trade_modify_order` | Modify price/quantity |
| Cancel order | `sim_trade_cancel_order` | |

## Order Parameter Quick Reference

- **Side (order_side)**: `1`=Buy / `2`=Sell / `3`=Short sell / `4`=Buy to cover
- **Order type (order_type)**: `1`=Limit / `3`=Market
- **Markets (market)**: `1`=HK stocks / `100`=US stocks / `3`=US options / `9`=China Stock Connect / `18`=Canada

## Key Rules

### 1. Account Confirmation (Mandatory)

Before any trading or account query, you must call both `account_authorized_trd_accs` and `sim_trade_account_list` simultaneously and let the user choose which account to use.

### 2. Secondary Trading Confirmation (Mandatory)

All simulated trading operations (place, modify, cancel orders) must go through a secondary confirmation flow and must not be skipped:

1. **Display order summary** — Clearly present to the user: account ID, security code and name, side, quantity, price (show price for limit orders, mark "market price" for market orders), order type
2. **Wait for explicit user confirmation** — Only call the trading API after receiving an explicit affirmative reply such as "confirm" / "place order" / "execute"
3. **No automatic execution** — Even in auto mode or batch operation scenarios, each trade must be individually confirmed

Applicable tools: `sim_trade_input_order`, `sim_trade_modify_order`, `sim_trade_cancel_order`

### 3. Real Trading Execution Restriction

This is a Codex environment. Do NOT call any real order execution tools:
- `trading_order_place` — real order placement
- `trading_order_replace` — real order modification
- `trading_order_cancel` — real order cancellation
- `trading_order_confirm` — real order risk control confirmation

Real account **query** tools (account list, funds, positions, orders, fills) are allowed and work normally.

If the user asks to place/modify/cancel a real order, politely explain that real order execution is not supported in this environment and recommend simulated trading instead.

### 4. Other Guidelines

- Query operations can be executed directly without confirmation
- When displaying positions, calculate profit/loss percentages and differentiate gains from losses
- If the user wants to "liquidate all" or "sell everything" in simulated trading, each operation must be confirmed individually
- Display amounts with 2 decimal places; display share quantities as integers
- Recommend new users to practice with simulated trading (`sim_trade_*`) first
- Interfaces with `next_key` require looping until `has_more=false`
- When a user's request cannot be directly matched to the table above, first list all available tools with the `mcp__moomoo-mcp__` prefix — new tools may have been added

## Parameter Reference Documentation

Read as needed when you need to verify parameter details; no need to load all at once:

| Category | File |
|----------|------|
| Real account — Account/Funds/Positions/Orders/Fills/Max buy-sell (read-only) | `reference/trading-real.md` |
| Simulated trading (all) | `reference/trading-sim.md` |
~~~~

### Reference files read (not reproduced)

- `skills/moomoo-mcp-account/reference/trading-real-order.md` (place, replace, cancel, confirm parameters and the `need_order_confirm` behavior), `trading-real.md` (accounts, funds, positions, orders, fills), `trading-sim.md`.
- Quote, screen and news `reference/*.md` files: parameter tables and response fields for the read tools.
- `README.md`, `plugin.json`, `mcp.json`, `.mcp.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`.

### Guardrail gap list (moomoo-agent-plugin)

1. The only confirmation mechanisms are skill prose plus a server `need_order_confirm` step the model completes itself. The CLI `--execute` code from the Agent Hub path is not involved.
2. The Codex "no real trading" rule is an instruction; the same server and tools stay reachable.
3. Auth, OAuth scopes and any trade-unlock step are undocumented in the repo; the only auth statement is `ON_INSTALL` in the Codex marketplace file.
4. `quote_modify_user_security` is a write that sits in a read-labelled skill with no confirmation rule.
5. Tool list is open-ended ("match available tools by prefix"), and the Codex manifest mentions web3 transactions that no skill documents.
6. No position, notional or symbol limits are documented on either side.
