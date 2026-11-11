# Webull official agent skill (webull-openapi-skills) plus CLI and MCP surface

| | |
|---|---|
| Skills repo | https://github.com/webull-inc/webull-openapi-skills |
| Skills commit | `7e04f8d80d33cb6c0ea1d26c481a52d22d7ec8bd` (committed 2026-11-10) |
| Skills license | Apache-2.0 (`LICENSE`) |
| CLI repo | https://github.com/webull-inc/webull-openapi-cli, commit `d1017ce15f6ef762cea8a7843cf74a30bacc8611` (2026-11-11), Apache-2.0 |
| MCP repo | https://github.com/webull-inc/webull-openapi-mcp, commit `82edf99b0ae432e120cc63360520fd6dacc09689` (2026-11-11), Apache-2.0 |
| Date scraped | 2026-11-11 |
| Install (skill) | No `npx skills` flow. README: `pip install -e .` (provides the `webull-skill` CLI), then symlink the repo into the agent's skills dir, e.g. `ln -s "$(pwd)" ~/.claude/skills/webull-openapi`. A `.claude-plugin/plugin.json` (v1.0.0) is also present. |
| Install (MCP) | `uvx webull-openapi-mcp auth`, then `uvx webull-openapi-mcp serve` |
| Install (CLI) | Prebuilt binary from the repo Releases page (`webull` / `webull.exe`) |

Method: shallow clones read as plain files. No script, installer or CLI from these repos was executed.

## Structure: one skill, not a skill pack

webull-openapi-skills ships exactly **one skill**, `webull-openapi`, as a single root `SKILL.md` (18.6 KB) with two reference guides (`references/skill_trading.md`, `references/skill_market_data.md`), an API reference, and per-region `llms_*.md` indexes (us, hk, jp, sg, th, my, mx, br, za). It is a thin instruction layer over a Python package (`webull_skill/`) exposed as the `webull-skill` CLI with three modules: `trading`, `market-data`, `auth`. The CLI and MCP repos contain no SKILL.md files; they are covered below only for their command and tool surface and guardrails, because the skill's real enforcement depends on which of the three you run.

## Summary table

| Skill | What it does | Tools / CLI commands it calls | Capability | Guardrail text |
|---|---|---|---|---|
| `webull-openapi` | Trade stocks, options, futures, crypto and event contracts; market data; account, positions, balances; instrument lookup; screener; fundamentals; watchlists; US community posts | `webull-skill trading --action <a>`: `account-list`, `balance`, `position`, `position-detail` (JP), `place`, `preview`, `replace`, `batch-place`, `algo-place`, `option-place`, `option-preview`, `option-replace`, `option-strategy-place`, `futures-place`, `futures-preview`, `futures-replace`, `crypto-place`, `event-place`, `event-replace`, `cancel`, `open`, `history`, `detail`, `executions`, `local-check`, `instrument-*`. `webull-skill market-data --action ...` (stock/option/futures/crypto/event snapshot, bars, tick, depth; screener; fundamentals; news; community). `webull-skill auth` (interactive 2FA) | **paper (sandbox, default) and live trade**, chosen by `WEBULL_ENVIRONMENT=uat` or `prod` in `.env`. Also read-only market data and a community write (post/comment). | "All order-mutating operations require user confirmation before execution." Mutating actions: `place`, `replace`, `cancel`, `batch-place`, `algo-place`, `option-place`, `option-replace`, `option-strategy-place`, `futures-place`, `futures-replace`, `crypto-place`, `event-place`, `event-replace`; community writes `community-create-post` and `community-create-comment` also need confirmation. |

## Guardrails: what is model-enforced and what is code-enforced

**Model-enforced only (SKILL.md text, no code behind it):**

- The confirmation protocol. The CLI file (`webull_skill/cli.py`) was grepped for `confirm`, `input(`, `isatty` and `--yes`; there is no prompt, no confirmation token and no dry-run gate in the skill's CLI. `place`, `option-place`, `futures-place`, `crypto-place`, `event-place`, `cancel` and the community writes run as soon as the agent invokes them. The only thing standing between the agent and a live order is the model obeying "Explicitly ask the user to confirm (e.g., "Confirm this order? [Yes/No]")".
- "Only proceed after receiving explicit user approval."
- Action routing (use `option-place` not `place` for options, etc.). A wrong route mostly fails validation, so this is a correctness rule more than a safety one.
- The README advice "Use `preview` actions before placing orders" is a suggestion, not a precondition.

**Code-enforced (in `webull_skill/`):**

- Sandbox by default. `config.py` defaults `environment` to `"uat"`; live needs `WEBULL_ENVIRONMENT=prod` in `.env` or the process environment. An agent that can edit `.env` or the environment can flip it, so this is a default, not a lock.
- Risk limits from `.env`, applied in `guards.py` `OrderValidator` (verified on the stock place path, where `stock_order.py` calls `validate_stock_order`; other asset paths were not traced): `WEBULL_MAX_ORDER_QUANTITY` (default 1000), per-market notional caps `WEBULL_MAX_ORDER_NOTIONAL_USD` (10000), `_HKD` (80000), `_CNH` (70000), `_JPY` (1500000), and optional `WEBULL_SYMBOL_WHITELIST`. Quantity and notional checks are skipped for `AMOUNT` entrust (fractional shares), and notional is only computed when a `limit_price` exists, so market orders are checked on quantity only.
- Order JSON validation (price fields, region rules, `client_order_id` 32-char alphanumeric).
- Audit log to stderr as JSON lines, optionally to `WEBULL_AUDIT_LOG_FILE`, with credentials redacted.
- Region gating (`_region_trading_error`) for unsupported products per region.

All of these limits are configured by the same `.env` the agent can read, so none are tamper-proof against an agent with file access.

**Gap list:**

1. No code-level confirmation anywhere in the skill. Every live order depends on the model asking.
2. Live vs sandbox is one env var, not an account-level restriction.
3. Notional cap does not apply to market orders (no price) or fractional AMOUNT orders.
4. `cancel` and community post/comment execute immediately like any other action.
5. SKILL.md cites 600 req/min order rate limits for US, which is a server limit, not a safety control.

## Contrast: CLI and MCP guardrails

| Surface | Confirmation | Dry run | Read-only mode | Sandbox default |
|---|---|---|---|---|
| `webull-openapi-skills` (`webull-skill`) | None in code; model-enforced | `preview` / `option-preview` / `futures-preview` actions; `local-check` runs the risk engine only, no API call | None | Yes (`uat`) |
| `webull-openapi-cli` (`webull`) | Interactive `[y/N]` prompt on `order ... submit`, `order cancel`, `order ... replace`, watchlist deletes; skipped by `-y/--yes` **and also by `--quiet`** (source: `if !flagYes && !flagQuiet`) | `--dry-run` prints the request payload | None documented | Profile based; sandbox hosts must be given explicitly |
| `webull-openapi-mcp` | No confirmation or elicitation code found (grep for `confirm`/`elicit` in the package returned nothing); README says "Always review order details proposed by the AI before confirming" | `preview_stock_order` and `preview_option_order` tools (no futures preview tool listed in the README) | `WEBULL_TOOLSETS=account,market-data` disables the trading toolset | Yes (`uat`) |

The CLI's `--quiet` is described as "Agent-first design: JSON output, `--quiet` mode", so the agent-friendly mode silently removes the order prompt. That is the strongest practical finding on the CLI: an agent that uses `--quiet` for clean output also bypasses confirmation.

### Webull OpenAPI MCP tool surface (README, 2026-11-11)

- Market data: `get_stock_tick|snapshot|quotes|footprint|bars|bars_single|noii_bars|noii_snapshot`, futures, crypto, option, event equivalents, `get_market_sentiment`, `get_stock_unusual_activities`, institution and insider tools, news, screeners, watchlist CRUD, and community (`create_community_post`, `create_community_comment` are writes).
- Account/assets: `get_account_list`, `get_account_balance`, `get_account_positions`, `get_account_position_details` (JP).
- Orders: `place_stock_order`, `preview_stock_order`, `replace_stock_order`, `place_stock_combo_order` (OTO/OCO/OTOCO), `place_option_single_order`, `preview_option_order`, `replace_option_order`, `place_option_strategy_order`, `place_algo_order` (TWAP/VWAP/POV), `place_futures_order`, `replace_futures_order`, `place_crypto_order`, `place_event_order`, `replace_event_order`, `cancel_order`, `get_order_history`, `get_open_orders`, `get_order_detail`.
- Same `.env` risk limits and whitelist as the skill (`WEBULL_MAX_ORDER_*`, `WEBULL_SYMBOL_WHITELIST`). README security advice: pass credentials through the MCP client `env` field rather than a workspace `.env` the model could read.

### Webull CLI order commands (README)

`webull order stock submit|preview|replace|combo`, `order option submit|preview|replace|strategy`, `order futures submit|replace`, `order crypto submit`, `order event submit|replace`, `order cancel`, `order open|detail|history|executions`. Global flags include `--env prod|uat`, `--profile`, `--region`, `-y/--yes`, `--quiet`, `--dry-run` on submit.

## Full SKILL.md (Apache-2.0)

Reproduced verbatim from `SKILL.md` at commit `7e04f8d80d33cb6c0ea1d26c481a52d22d7ec8bd` of https://github.com/webull-inc/webull-openapi-skills, which is licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0). Copyright is held by its authors; the text is unmodified. Em dashes and other punctuation inside the block are the original's.

````markdown
---
name: webull-openapi
description: Trade stocks, options, futures, crypto, and event contracts on Webull. Query real-time and historical market data. Manage accounts and positions. Supports US, HK, JP, SG, TH, MY, UK, MX, BR, and ZA regions with configurable risk controls.
---

# Webull OpenAPI Skill

This skill lets you interact with Webull's trading platform through natural language. You can place orders, check market data, query account info, and manage positions — all via the official Webull Python SDK.

## What You Can Do

- **Trade**: Place, preview, modify, and cancel orders for stocks, options, futures, crypto, and event contracts. Each asset type has dedicated actions:
  - Stock/ETF → `place`, `preview`, `replace`
  - Option → `option-place`, `option-preview`, `option-replace`, `option-strategy-place`
  - Futures → `futures-place`, `futures-replace`
  - Crypto → `crypto-place`
  - Event → `event-place`, `event-replace`
- **Market Data**: Get real-time snapshots, historical bars, tick data, quotes, and order flow for all asset classes (stocks, options, futures, crypto, event contracts)
  - Option market data actions: `option-snapshot`, `option-bars`, `option-tick` (category: US_OPTION, supported in all regions except ZA)
- **Accounts**: List accounts, check balances, view positions
- **Instruments**: Look up stock, crypto, futures, option, and event contract instruments; get company profile, analyst ratings, and target prices
  - Option contracts: `instrument-option-contracts` (query by underlying symbol, expiry, strike, etc.)
- **Screener**: Top gainers/losers, most active stocks, market sectors, high dividend, and 52-week high/low
- **Fundamentals**: Financial statements, capital flow, industry comparison, earnings/dividend calendar, forecast EPS, and fund/ETF data
- **Watchlist**: Create, manage, and query watchlists and their instruments
- **Community** (US only): Create posts and comments, list hot stocks, browse posts by symbol, view post details, and list your own posts

## Safety Rules

**All order-mutating operations require user confirmation before execution.**

Mutating actions: `place`, `replace`, `cancel`, `batch-place`, `algo-place`, `option-place`, `option-replace`, `option-strategy-place`, `futures-place`, `futures-replace`, `crypto-place`, `event-place`, `event-replace`.

**Community write operations also require user confirmation before execution**, because they publish content under the user's account: `community-create-post`, `community-create-comment`.

Before executing any of these operations, the AI must:
1. Display a clear summary of the operation to the user, including:
   - Action type (place / replace / cancel; or community post / comment)
   - For orders: symbol, side, order type, quantity, price, account being used
   - For community writes: the full text content and any attached symbol/category
2. Explicitly ask the user to confirm (e.g., "Confirm this order? [Yes/No]")
3. Only proceed after receiving explicit user approval

Read-only operations (`account-list`, `balance`, `position`, `open`, `history`, `detail`, `executions`, `instrument-*`, and all read-only `market-data` actions including `community-hot-stocks`, `community-posts-by-symbol`, `community-post-detail`, `community-my-posts`) do not require confirmation and can be executed immediately.

---

## Quick Examples

> **CLI command:** After `pip install -e .`, use `webull-skill` on all platforms (macOS, Linux, Windows). This console entry point is bound to the Python that ran `pip`, so it works regardless of what `python3` or `python` points to on your system.

> **Passing order JSON:** Prefer `--order-file <path>` (write JSON to a temp file first) over `--order-json '<inline>'`. Inline JSON with `--order-json` is fragile across shells — Windows bash, PowerShell, and some macOS terminals mangle quotes and escapes. Using `--order-file` avoids all shell quoting issues.

```bash
# Check your accounts
webull-skill trading --action account-list

# Get AAPL stock price
webull-skill market-data --action stock-snapshot --symbols AAPL

# Get account balance
webull-skill trading --action balance --account-id <id>

# Place a limit buy order (recommended: use --order-file)
#   echo '{"symbol":"AAPL","side":"BUY","order_type":"LIMIT","limit_price":180,"quantity":10,"instrument_type":"EQUITY","market":"US","time_in_force":"DAY","entrust_type":"QTY","support_trading_session":"CORE","combo_type":"NORMAL"}' > /tmp/order.json
#   webull-skill trading --action place --account-id <id> --order-file /tmp/order.json

# Cancel an order
webull-skill trading --action cancel --account-id <id> --client-order-id <oid>
```

## CLI Entry Point

```
webull-skill [--env-file PATH] [--verbose-sdk-log] <module> --action <ACTION> [options]
```

Three modules: `trading`, `market-data`, `auth`.

---

## Modules

### trading

Instrument queries, account/asset operations, and all order operations (stock, option, futures, crypto, event contracts).

For full action list, order JSON formats, replace rules, and order type references, see [Trading Guide](references/skill_trading.md).

### market-data

Real-time and historical market data for all asset classes (stock, option, futures, crypto, event contracts), plus screener, fundamentals, watchlist, and community.

For full action list, options, category values, and examples, see [Market Data Guide](references/skill_market_data.md).

### auth

```bash
webull-skill auth
```

Interactive 2FA authentication. Run once before first use. The SDK waits up to 5 minutes for you to approve in the Webull mobile app. Token is cached and auto-refreshes.

---

## Output Format

All operations output formatted text directly to stdout, with a region-aware disclaimer at the top:

```
⚠️ Disclaimer: The information provided by this tool is for reference only ...

=== Stock Snapshot: AAPL ===
  Symbol:          AAPL
  Price:           255.92
  Pre Close:       255.63
  Change:          0.29
  ...
```

- Success: disclaimer + formatted data to stdout, exit code 0
- Error: error message to stderr, exit code 1
- US/JP/SG/TH/MY/UK/MX/BR/ZA region: English disclaimer only
- HK region: English + Simplified Chinese + Traditional Chinese disclaimer

---

## Configuration

Via `.env` file or environment variables. Required:

```
WEBULL_APP_KEY=<your_app_key>
WEBULL_APP_SECRET=<your_app_secret>
```

Region selection:

```env
# Choose one region:
WEBULL_REGION_ID=us
# WEBULL_REGION_ID=hk
# WEBULL_REGION_ID=jp
# WEBULL_REGION_ID=sg
# WEBULL_REGION_ID=th
# WEBULL_REGION_ID=my
# WEBULL_REGION_ID=uk
# WEBULL_REGION_ID=mx
# WEBULL_REGION_ID=br
# WEBULL_REGION_ID=za

# Sandbox by default; set prod only for live trading.
WEBULL_ENVIRONMENT=uat
```

**`.env` lookup order** (when `--env-file` is not specified):
1. `$WEBULL_CONFIG_DIR/.env` — if `WEBULL_CONFIG_DIR` is set
2. `<project_root>/.env` — default (sibling of `webull_skill/`)
3. Current working directory `.env` — last resort

> To keep credentials outside the project directory, set `WEBULL_CONFIG_DIR` as a **system environment variable** (e.g. in `~/.zshrc`), then place your `.env` at `$WEBULL_CONFIG_DIR/.env`. Setting `WEBULL_CONFIG_DIR` inside a `.env` file has no effect — it must be set before the process starts.

Optional:

| Variable | Default | Description |
|----------|---------|-------------|
| `WEBULL_ENVIRONMENT` | `uat` | `uat` (sandbox) or `prod` (live) |
| `WEBULL_REGION_ID` | `us` | `us`, `hk`, `jp`, `sg`, `th`, `my`, `uk`, `mx`, `br`, or `za` |
| `WEBULL_MAX_ORDER_NOTIONAL_USD` | `10000` | Max order value (USD) |
| `WEBULL_MAX_ORDER_NOTIONAL_HKD` | `80000` | Max order value for HK market (HKD) |
| `WEBULL_MAX_ORDER_NOTIONAL_CNH` | `70000` | Max order value for CN market (CNH) |
| `WEBULL_MAX_ORDER_NOTIONAL_JPY` | `1500000` | Max order value for JP market (JPY) |
| `WEBULL_MAX_ORDER_QUANTITY` | `1000` | Max shares per order |
| `WEBULL_SYMBOL_WHITELIST` | (none) | Comma-separated allowed symbols |
| `WEBULL_CONFIG_DIR` | (none) | **System env var only** (not in `.env`). Moves `.env` lookup and token storage to this directory |
| `WEBULL_TOKEN_DIR` | `<project_root>/conf/` | Token storage directory |
| `WEBULL_AUDIT_LOG_FILE` | (stderr) | Audit log file path |
| `WEBULL_LOG_LEVEL` | `WARNING` | SDK log level |

---

## Region Support

| Feature | US | HK | JP | SG | TH | MY | UK | MX | BR | ZA |
|---------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Stock trading | ✓ | ✓ (US/HK/CN) | ✓ (US/JP) | ✓ (US) | ✓ (US) | ✓ (US) | ✓ (US) | ✓ (US) | ✓ (US) | ✓ (US) |
| Options | ✓ | ✓ (US only) | ✓ (US only) | ✓ (US only) | ✓ (US only) | ✓ (US only) | ✓ (US only) | ✓ (US only) | ✓ (US only) | ✗ |
| Futures | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Crypto | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Event contracts | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Combo orders | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Option leg in/out | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Algo orders | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Trailing stop loss | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Fractional shares | ✓ (US market) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Company profile | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Analyst rating / target price | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| NOII bars / snapshot | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Screener | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Watchlist | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Community | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Fundamentals | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |


### HK-Specific Notes

- HK stocks use order types: `ENHANCED_LIMIT`, `AT_AUCTION`, `AT_AUCTION_LIMIT`
- CN A-shares (Stock Connect): `LIMIT` only, disabled by default — contact Webull to enable
- Board lot sizes vary by HK stock
- No combo orders, algo orders, crypto, or event contracts in HK region
- HK stock orders (institutional/broker): require `sender_sub_id` and `no_party_ids` (BCAN)
- HK US options (institutional/broker): support `sender_sub_id` only, no BCAN needed

### JP-Specific Notes

- Configure JP with `WEBULL_REGION_ID=jp`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- JP supports stock/ETF market data and stock order management. Futures, crypto, event contracts, combo orders, and algo orders are not supported in JP.
- JP supports single-leg US options (`US_OPTION`): contracts, market data, positions, and the order lifecycle (preview, place, replace, cancel). Multi-leg option strategies are not supported.
- JP stock instrument categories are `US_STOCK` and `US_ETF`.
- JP stock order markets are `US` and `JP`.
- JP market orders support `LIMIT` and `MARKET`; JP market time in force is `DAY`.
- US market orders in JP support `LIMIT`, `MARKET`, `STOP_LOSS`, `STOP_LOSS_LIMIT` with `DAY` or `GTC`.
- JP stock accounts are identified by `account_type`: `CASH` or `US_MARGIN`.
- `account_tax_type` is required for JP stock `place` and `preview`; valid values are `GENERAL` and `SPECIFIC`.
- `account_tax_type` is also required for JP US option `option-place` and `option-preview`; valid values are `GENERAL` and `SPECIFIC`.
- JP option accounts are identified by `account_type`: `US_OPTION`.
- `margin_type` and `position_intent` are valid only for JP `US_MARGIN` accounts (for stock orders). For US and JP option orders, `position_intent` is supported via `option-place` / `option-preview`; the Skill does not validate it and passes it to the backend as is.
- `close_contracts` is JP-only and accepts up to 10 objects with `contract_id` and positive `quantity`.

### SG-Specific Notes

- Configure SG with `WEBULL_REGION_ID=sg`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- SG supports US stock/ETF trading for Singapore-based clients.
- Supported order types: `MARKET`, `LIMIT`, `STOP_LOSS`, `STOP_LOSS_LIMIT`.
- Time in force: `DAY`, `GTC`.
- Trading sessions: `CORE`, `ALL`, `NIGHT`, `ALL_DAY`.
- SG order market is `US` only.
- SG supports single-leg US options (`US_OPTION`): contracts, market data, positions, and the order lifecycle (preview, place, replace, cancel). Multi-leg option strategies are not supported.
- No futures, crypto, event contracts, combo orders, or algo orders in SG region.

### TH-Specific Notes

- Configure TH with `WEBULL_REGION_ID=th`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- TH supports US stock/ETF trading for Thailand-based clients.
- Supported order types: `MARKET`, `LIMIT`, `STOP_LOSS`, `STOP_LOSS_LIMIT`.
- Time in force: `DAY`, `GTC`.
- Trading sessions: `CORE`, `ALL`, `NIGHT`, `ALL_DAY`.
- TH order market is `US` only.
- TH supports single-leg US options (`US_OPTION`): contracts, market data, positions, and the order lifecycle (preview, place, replace, cancel). TH option accounts use account class `INDIVIDUAL_CASH`.
- No futures, crypto, event contracts, combo orders, algo orders, or multi-leg option strategies in TH region.

### MY-Specific Notes

- Configure MY with `WEBULL_REGION_ID=my`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- MY supports US stock/ETF trading for Malaysia-based clients.
- Supported order types: `MARKET`, `LIMIT`, `STOP_LOSS`, `STOP_LOSS_LIMIT`.
- Time in force: `DAY`, `GTC`.
- Trading sessions: `CORE`, `ALL`, `NIGHT`, `ALL_DAY`.
- MY order market is `US` only.
- MY supports single-leg US options (`US_OPTION`): contracts, market data, positions, and the order lifecycle (preview, place, replace, cancel). Multi-leg option strategies are not supported.
- No futures, crypto, event contracts, combo orders, or algo orders in MY region.

### UK-Specific Notes

- Configure UK with `WEBULL_REGION_ID=uk`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- UK supports US stock/ETF trading for UK-based clients.
- Supported order types: `MARKET`, `LIMIT`, `STOP_LOSS`, `STOP_LOSS_LIMIT`.
- Time in force: `DAY`, `GTC`.
- Trading sessions: `CORE`, `ALL`, `NIGHT`, `ALL_DAY`.
- UK order market is `US` only.
- UK supports single-leg US options (`US_OPTION`): contracts, market data, positions, and the order lifecycle (preview, place, replace, cancel). Multi-leg option strategies are not supported.
- No futures, crypto, event contracts, combo orders, or algo orders in UK region.

### MX-Specific Notes

- Configure MX with `WEBULL_REGION_ID=mx`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- MX supports US stock/ETF trading for Mexico-based clients.
- Supported order types: `MARKET`, `LIMIT`, `STOP_LOSS`, `STOP_LOSS_LIMIT`.
- Time in force: `DAY`, `GTC`.
- Trading sessions: `CORE`, `ALL`, `NIGHT`, `ALL_DAY`.
- MX order market is `US` only.
- MX supports single-leg US options (`US_OPTION`): contracts, market data, positions, and the order lifecycle (preview, place, replace, cancel). Multi-leg option strategies are not supported.
- No futures, crypto, event contracts, combo orders, or algo orders in MX region.

### BR-Specific Notes

- Configure BR with `WEBULL_REGION_ID=br`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- BR supports US stock/ETF trading for Brazil-based clients.
- Supported order types: `MARKET`, `LIMIT`, `STOP_LOSS`, `STOP_LOSS_LIMIT`.
- Time in force: `DAY`, `GTC`.
- Trading sessions: `CORE`, `ALL`, `NIGHT`, `ALL_DAY`.
- BR order market is `US` only.
- BR supports single-leg US options (`US_OPTION`): contracts, market data, positions, and the order lifecycle (preview, place, replace, cancel). Multi-leg option strategies are not supported.
- No futures, crypto, event contracts, combo orders, or algo orders in BR region.

### ZA-Specific Notes

- Configure ZA with `WEBULL_REGION_ID=za`; sandbox uses `WEBULL_ENVIRONMENT=uat`.
- ZA supports US stock/ETF trading for South Africa-based clients.
- Supported order types: `MARKET`, `LIMIT`, `STOP_LOSS`, `STOP_LOSS_LIMIT`.
- Time in force: `DAY`, `GTC`.
- Trading sessions: `CORE`, `ALL`, `NIGHT`, `ALL_DAY`.
- ZA order market is `US` only.
- No futures, crypto, options, event contracts, combo orders, or algo orders in ZA region.

---

## Rate Limits

### US Region
- Market data: 600 req/min
- Order place/replace/cancel: 600 req/min
- Order query: 2 req/2s
- Auth: 10 req/30s

### HK Region
- Market data: 60 req/60s
- Order place: 15 req/s (US stocks), 1 req/s (HK/A-share)
- Order preview: 40 req/10s
- Order query: 40 req/2s

### JP Region
- Instrument lookup: 60 req/min per AppId
- Other endpoint limits follow the JP developer portal for the enabled account/API plan

### SG Region
- Market data: 300 req/60s
- Order place/replace/cancel: 600 req/60s
- Order query: 2 req/2s
- Auth: 10 req/30s

### TH Region
- Market data: 300 req/60s
- Order place/replace/cancel: 600 req/60s
- Order query: 2 req/2s
- Auth: 10 req/30s

### MY Region
- Market data: 300 req/60s
- Order place/replace/cancel: 600 req/60s
- Order query: 2 req/2s
- Auth: 10 req/30s

### UK Region
- Market data: 300 req/60s
- Order place/replace/cancel: 600 req/60s
- Order query: 2 req/2s
- Auth: 10 req/30s

### MX Region
- Market data: 300 req/60s
- Order place/replace/cancel: 600 req/60s
- Order query: 2 req/2s
- Auth: 10 req/30s

### BR Region
- Market data: 300 req/60s
- Order place/replace/cancel: 600 req/60s
- Order query: 2 req/2s
- Auth: 10 req/30s

### ZA Region
- Market data: 60 req/60s
- Order place/replace/cancel: 60 req/60s
- Order query: 2 req/2s
- Auth: 10 req/30s

---

## Detailed Module Documentation

- [Trading Guide](references/skill_trading.md) — Full order JSON formats, replace rules, order types, trading sessions
- [Market Data Guide](references/skill_market_data.md) — All market data actions, screener, watchlist, category values

## Official API Documentation

- US: https://developer.webull.com/apis/docs/webull-open-api-reference
- HK: https://developer.webull.hk/apis/docs/webull-open-api-reference
- JP: https://developer.webull.co.jp/apis/docs/webull-open-api-reference
- SG: https://developer.webull.com.sg/apis/docs/index.md
- TH: https://developer.webull.co.th/apis/docs/
- MY: https://developer.webull.com.my/apis/docs/
- UK: https://developer.webull-uk.com/apis/docs/
- MX: https://developer.webull.com.mx/apis/docs/
- BR: https://developer.webull.com.br/apis/docs/
- ZA: https://developer.webull.co.za/apis/docs/

---

## Disclaimer

The information provided by this tool is for reference only and does not constitute investment advice. Trading involves risk; please make decisions carefully.
````

## Reference files not reproduced

These are Apache-2.0 too; they are summarized rather than pasted to keep this page readable.

- `references/skill_trading.md` (28 KB): action tables per asset class; order JSON schemas for `place`/`preview`, `replace`, option, futures, crypto, event, combo and algo orders. Notable rules: `place` is stock/ETF only; option, futures, crypto and event orders have separate actions; `place` and `replace` accept different JSON fields because "the CLI spreads JSON keys directly into the function"; numeric fields must be JSON numbers, not strings; `client_order_id` max 32 alphanumeric characters, unique per account; `quantity` and `total_cash_amount` are mutually exclusive; crypto `MARKET` orders require time in force `IOC`; crypto has no replace; HK stock orders for institutions need `sender_sub_id` and BCAN `no_party_ids`; JP stock orders require `account_tax_type`. `local-check` is a "Risk check only (no API call)".
- `references/skill_market_data.md` (23 KB): market-data actions for stock, option, futures, crypto, event; screener (`stock-gainers-losers`, `stock-most-active`, sectors, high dividend, 52-week high/low); `market-sentiment`, `stock-unusual-activities`; fundamentals, fund/ETF data; US-only institution 13F, insider, economic-calendar and news actions; watchlist; US-only community, where `community-create-post` and `community-create-comment` "publish content under the user's account".
- `DISCLAIMER.md`: states the tool "is capable of placing real trades and accessing portfolio information", that API keys are highly sensitive, and that "All actions proposed by the system should be reviewed carefully by the user". Users remain "solely responsible for verifying the accuracy of order details prior to execution".
- `README.md` Safety section: "Review before trading", "Default sandbox... You must explicitly set `WEBULL_ENVIRONMENT=prod` for live trading", and "Risk controls: Configurable notional limits, quantity limits, and symbol whitelist prevent accidental large orders."

## Predecessor: webull-inc/webull-agent-skills (deprecated)

Read 2026-11-11 at commit 197f629 (2026-06-02), Apache-2.0. Its README opens with a deprecation
notice pointing to `webull-openapi-skills` above. One skill (`webull_openapi_skills/SKILL.md`,
790 lines). Same lineage as the current skill: stocks, options, futures, crypto and event
contracts, combo orders (OTO, OCO, OTOCO), multi-leg option strategies, and TWAP, VWAP and POV
algo orders (US only). Full text: [webull-legacy.md](webull-legacy.md). Risk limits (`WEBULL_MAX_ORDER_NOTIONAL_USD`, quantity cap,
`WEBULL_SYMBOL_WHITELIST`) and an audit log are enforced in Python (`scripts/guards.py`,
`scripts/audit.py`), not only in prose. Use the current repo; this one gets no fixes.
