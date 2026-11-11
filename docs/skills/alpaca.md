# Alpaca official agent skills (alpacahq/alpaca-skills)

| | |
|---|---|
| Skills repo | https://github.com/alpacahq/alpaca-skills |
| Commit | `0e7c35163ae462730de1f4a0bfafceac82b7d59b` (committed 2026-11-06) |
| License | Apache-2.0 (`LICENSE`); README confirms "Licensed under the Apache License 2.0" |
| Date scraped | 2026-11-11 |
| Install | `npx skills add alpacahq/alpaca-skills` (add `--list` to preview, `--skill alpaca-trading-paper-trading-mcp` for one). Manual: copy a skill dir into `~/.claude/skills/` or `.cursor/skills/`. |
| Prerequisite | Alpaca CLI (`brew install alpacahq/tap/cli` or `go install github.com/alpacahq/cli/cmd/alpaca@latest`) for the CLI-backed skills; paper, sandbox or live API keys as appropriate. |

Method: shallow clone read as plain files. No script, installer or CLI from the repo was executed.

Related repo, not covered here: https://github.com/alpacahq/agentic is a multi-platform plugin marketplace (`.claude-plugin/marketplace.json`, `plugins/alpaca-broker`, MIT per the GitHub API). It was listed but not cloned or read.

## Structure

13 production skills plus a template (`templates/skill/SKILL.md`, 465 bytes, not counted). Two groups: `skills/trading-api/` (4 skills, built around the Trading API and paper trading) and `skills/broker-api/` (9 skills, aimed at developers building a brokerage on the Broker API). The repo also ships `AGENTS.md` (conventions for skill authors, not trading instructions), `SECURITY.md` and `CONTRIBUTING.md`.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `alpaca-trading-paper-trading` | Preview, submit, inspect, manage paper orders (equities, options, crypto); generic, works with any SDK/REST | `alpaca-py`, REST, or any agent tool reaching the Trading API | paper only | "Never place live trades. Verify paper environment before every submission." (model-enforced) |
| `alpaca-trading-paper-trading-mcp` | Same workflow through the Alpaca MCP server (stock, crypto, option place tools) | MCP tools via `GetDynamicTools` discovery; `get_account_info`, `place_*`, `cancel_all_orders`, `close_position`, etc. | paper only (gate reads `ALPACA_PAPER_TRADE` from MCP config) | paper-mode proof required, 20 numbered execution rules, destructive tools gated separately |
| `alpaca-trading-paper-trading-cli` | Same workflow through the `alpaca` CLI | `alpaca doctor`, `alpaca order submit`, `alpaca order get` | paper only (require `Trading:` line to read `https://paper-api.alpaca.markets`) | "If any ambiguity exists about the environment, STOP." |
| `alpaca-trading-backtest` | Deterministic historical backtests with agent-written workspace code | `alpaca` CLI data fetch plus local scripts | read (historical data; no orders) | forbids "submitting live orders as part of a historical backtest"; mandatory hypothetical-results disclosure |
| `alpaca-broker-trading-orders` | Order creation and lifecycle on behalf of Broker API accounts (qty vs notional, fractional, bracket, replace/cancel) | Broker API `/v1/trading/accounts/{account_id}/orders`, `alpaca-docs` MCP | live and sandbox (Broker API, developer-facing) | reference doc; no confirmation or paper gate text found |
| `alpaca-broker-integration` | Entry point: base URLs, auth, conventions, which sub-skill to use | Broker API, Market Data, Trading API | reference | none found |
| `alpaca-broker-account-onboarding` | Account creation, KYC/CIP, agreements, W-8BEN, status lifecycle | Broker API | live (account opening) | reference doc |
| `alpaca-broker-funding-transfers` | ACH, wire, funding wallet, transfer lifecycle, fees | Broker API | live (moves money) | reference doc |
| `alpaca-broker-journals` | JNLC/JNLS journals between accounts in an omnibus, Idempotency-Key | Broker API | live (moves cash and securities) | reference doc |
| `alpaca-broker-market-data` | Snapshots, bars, quotes, assets, clock, news, WebSocket | Market Data API | read | reference doc |
| `alpaca-broker-sse-events` | SSE event consumption, replay cursors, reconnect | Broker API SSE | read | reference doc |
| `alpaca-broker-reconciliation-idempotency` | Idempotency keys, dedup, reconciliation jobs | Broker API | reference | reference doc |
| `alpaca-broker-rate-limits-resilience` | 429 backoff, retry, pagination, concurrency | REST | reference | reference doc |
| `alpaca-broker-money-precision` | Numbers-as-strings, decimals vs floats, rounding | REST | reference | reference doc |

## Guardrails: what is model-enforced and what is code-enforced

All of it is SKILL.md prose, so all of it is **model-enforced**. Nothing in the repo (as read) enforces it in code; the skill relies on the agent obeying the text. Rules the three paper-trading skills state:

- Paper only, verified before every order. The MCP variant tells the agent to read a single field (`env.ALPACA_PAPER_TRADE`) from the host MCP config, require it to be absent, `true`, `1` or `yes`, and "treat unproven as live" (stop). It also says the account payload alone is never proof of environment.
- Restate the strategy and wait for confirmation; collect every order parameter; show a full preview table before submission; per-order confirmation defaults ON.
- Unique `client_order_id` on every order for idempotency.
- "Gate unscoped destructive tools": `cancel_all_orders`, `close_all_positions`, `close_position`, `exercise_options_position`, `do_not_exercise_options_position` need an explicit "yes", independent of the per-order confirmation setting.
- The skill itself flags the real hole: "The default toolset is the full toolset. `ALPACA_TOOLSETS` defaults to all capabilities, so liquidation and exercise tools are reachable in any default install." Scoping that env var is the only non-model control it points to. It also says "the MCP server configuration is ultimately your responsibility."
- Disclosure strings are mandated before every order preview ("Paper trading only. Not financial advice...").

The Broker API skills are developer reference material. `alpaca-broker-trading-orders` has no confirmation or environment gate text; it documents order semantics and constraints (for example bracket orders need both `take_profit.limit_price` and `stop_loss.stop_price`).

Gaps: no skill gives a live-trading workflow for the Trading API. Live use of the Alpaca MCP server or CLI is not covered by any guardrail text in this repo; the paper skills refuse it.

## Trading skills (full SKILL.md, Apache-2.0)

### alpaca-trading-paper-trading (generic)

Path: `skills/trading-api/paper-trading/SKILL.md` (43 KB).

````markdown
---
name: alpaca-trading-paper-trading
description: >
  Preview, submit, inspect, and manage Alpaca paper-trading orders across US
  equities, options, and crypto. Use this skill when you want your AI agent to
  take a strategy signal — from a backtest, manual idea, or automated system —
  and execute it safely in your Alpaca paper-trading environment. This generic
  version works with any Alpaca SDK, REST API call, or agent tool that can
  reach the Trading API.
---

# Alpaca Paper Trading

Use this skill when you want your AI agent to preview, submit, inspect, and manage paper-trading orders using Alpaca's Trading API.

This skill is written for you, a Trading API user working with your own Alpaca paper-trading account, credentials, and local workspace. Your agent should make assumptions visible, protect secrets, and confirm order details before submission.

This is the generic (implementation-agnostic) version of the paper-trading skill. It describes the workflow, safety gates, and output contract without binding to any specific execution tool. You can use the Alpaca Python SDK (`alpaca-py`), the REST API directly, JavaScript/TypeScript, Go, C#, or any tool that speaks to the Trading API. CLI-specific and MCP-specific companion skills exist for users who prefer those execution paths — see §10 for links.

---

## 0 - How your AI agent should use this skill

1. **Start with your job.** Identify what the signal is — a backtest output, a manual trade idea, a scheduled trigger, or an automated system event. Your agent reads any associated context (backtest run folder, strategy description, alert payload) to understand the intent.

2. **Reiterate the strategy logic.** Your agent restates the strategy interpretation in plain language — entry/exit conditions, indicator parameters, position sizing, and any assumptions — and confirms with you that the interpretation is correct before proceeding.

3. **Gather and confirm ALL detailed configurations before execution.** Your agent collects every order parameter explicitly:
   - Timing of execution (immediate, scheduled, conditional)
   - Asset class (US equity, US options, crypto)
   - Symbol(s)
   - Side (buy / sell)
   - Quantity or notional amount
   - Order type (market, limit, stop, stop_limit, trailing_stop)
   - Time-in-force (day, gtc, ioc, fok, opg, cls)
   - Limit price and/or stop price if applicable
   - Extended-hours flag
   - Risk controls (max position size, max notional, stop-loss, take-profit)
   - Margin usage

4. **Confirm which paper account is being used.** Your agent verifies that the paper account's configuration meets the strategy's requirements — options approval level, crypto enabled, margin vs cash account, PDT status. It does not assume features are enabled without checking.

5. **Show a complete order preview table before submission.** Every order gets a visual preview with all parameters displayed, estimated notional, and buying power check. No order is ever submitted without a preview.

6. **Ask about confirmation preference.** Your agent asks whether you want explicit confirmation before each order submission, or whether you prefer auto-submit mode. It respects your preference for the session. Default: confirmation ON.

7. **Submit the order to the paper-trading environment only.** Your agent verifies the environment is paper before every submission. It never submits to live.

8. **Return complete post-submission details.** After submission, your agent returns the order ID, status, submitted payload summary, and next inspection steps.

9. **Monitor and update on order lifecycle.**
   - **Filled** → how many shares/contracts, at what price, and how the fill changes portfolio risk.
   - **Partially filled** → current fill vs remaining quantity, average fill price so far.
   - **Rejected** → the rejection reason and specific remediation suggestions.
   - **Canceled** → who canceled (you, system, broker) and why.

10. **Never place live trades.** If live credentials are detected — base URL without the `paper-` prefix, or a profile set to live — your agent stops immediately and warns you. This is a hard block, not a soft warning.

---

## 1 - Prerequisites

- **Alpaca paper-trading account** — free at [alpaca.markets](https://alpaca.markets)
- **Paper API key and secret key** stored in environment variables (`APCA_API_KEY_ID`, `APCA_API_SECRET_KEY`) or SDK/CLI profile — never pasted into chat
- **Paper base URL**: `https://paper-api.alpaca.markets` (for REST) or appropriate SDK configuration pointing to the paper environment
- **For options**: options trading must be enabled on the paper account with the appropriate approval level (level 1 for covered calls and cash-secured puts, level 2 to buy calls and puts, level 3 for spreads and straddles)
- **For crypto**: crypto trading must be enabled on the paper account
- **SDK / language runtime** (choose one):
  - Python 3.10+ with `alpaca-py` (recommended)
  - JavaScript/TypeScript with `@alpacahq/alpaca-trade-api` (v4+, first-party and actively maintained)
  - Go with `github.com/alpacahq/alpaca-trade-api-go/v3` — the `/v3` suffix is required; without it you pull the v1 path
  - C# with `Alpaca.Markets` (first-party). Community SDKs exist for Java and others.
  - Direct REST API calls via `curl`, `httpx`, `requests`, or any HTTP client
- **Network access** to Alpaca APIs (`paper-api.alpaca.markets`)

---

## 2 - Gather inputs

### Required inputs

| Input | Description | Default |
|---|---|---|
| `signal_source` | Where the trade idea comes from (backtest, manual, automation) | Must be provided |
| `symbol` | Ticker symbol (e.g., `AAPL`, `BTC/USD`, `AAPL250718C00200000` for options) | Must be provided |
| `side` | `buy` or `sell` | Must be provided |
| `qty_or_notional` | Number of shares/contracts OR dollar amount (use `qty` for shares/contracts, `notional` for dollar amount) | Must be provided |
| `order_type` | `market`, `limit`, `stop`, `stop_limit`, `trailing_stop` — **supported values vary by asset class, see below** | `market` |
| `time_in_force` | `day`, `gtc`, `ioc`, `fok`, `opg`, `cls` — **supported values vary by asset class, see below** | `day` for equities; `gtc` for crypto |

### Per-asset-class constraints

The API rejects combinations outside this matrix, so your agent validates before submitting rather than after:

| Asset class | Order types | Time-in-force | Order classes |
|---|---|---|---|
| `us_equity` | `market`, `limit`, `stop`, `stop_limit`, `trailing_stop` | `day`, `gtc`, `opg`, `cls`, `ioc`, `fok` | `simple`, `bracket`, `oco`, `oto` |
| `us_option` | `market`, `limit`, `stop`, `stop_limit` (`stop` types single-leg only) | `day`, `gtc` | `simple`, `mleg` |
| `crypto` | `market`, `limit`, `stop_limit` | `gtc`, `ioc` — `stop_limit` is `gtc`-only, and `ioc` applies only to `market` and `limit` | `simple` |

Treat this as guidance for constructing orders, not as a hard pre-submission gate. Alpaca's sources disagree on the options row: the OpenAPI `TimeInForce`/`OrderType` descriptions say `market`/`limit` with `day` only, while the Options Trading page and the Placing Orders matrix both allow `gtc` and both allow `stop`/`stop_limit` on single-leg orders. The two product pages agree against the spec blob, so this table follows them. Default to `day` for options as the conservative choice, but let Alpaca reject rather than pre-blocking something the matrix permits.

Constraints that cut across order type:

- **Extended hours** requires `limit` type with `day` or `gtc` TIF. Everything else is rejected.
- **Trailing stop** accepts only `day` and `gtc`.
- **Notional** orders cannot be combined with `qty` and **cannot be replaced** — cancel and resubmit instead. For equities they additionally require `market` type with `day` TIF; crypto notional orders are market-type and use the crypto TIF set (`gtc`/`ioc`), so the equities `day` restriction does not apply to them.
- **Bracket, OCO, and OTO** are equities-only, require `day` or `gtc`, and do not support extended hours.
- **`mleg`** carries up to 4 legs and is how multi-leg options strategies are expressed.

### Optional inputs

| Input | Description | Default |
|---|---|---|
| `limit_price` | Required for `limit` and `stop_limit` orders | None |
| `stop_price` | Required for `stop` and `stop_limit` orders | None |
| `trail_price` or `trail_percent` | For trailing stop orders (one or the other, not both) | None |
| `extended_hours` | Allow extended-hours execution (equities only; `limit` type with `day` or `gtc` TIF) | `false` |
| `client_order_id` | User-supplied idempotency key (max 128 chars) | Auto-generated UUID |
| `confirmation_mode` | Whether your agent asks for explicit confirmation before each order | `on` |
| `risk_controls` | Max position size, max notional, max loss threshold | None (recommended to set) |
| `asset_class` | `us_equity`, `us_option`, `crypto` | Inferred from symbol format |
| `order_class` | `simple`, `bracket`, `oco`, `oto`, `mleg` — see the per-asset-class matrix above | `simple` |
| `position_intent` | `buy_to_open`, `buy_to_close`, `sell_to_open`, `sell_to_close` (options only) | Inferred from context |

### Strategy confirmation checklist

Before proceeding past the configuration phase, your agent must confirm each of these with you:

- [ ] **Strategy logic interpretation is correct** — the agent's restatement of your strategy matches your intent
- [ ] **Timing** — immediate execution, or scheduled/conditional (e.g., "only if price drops below $180")
- [ ] **Asset class and symbol are correct** — the right ticker, the right contract (for options), the right pair (for crypto)
- [ ] **Order parameters match the strategy intent** — type, side, quantity, prices, TIF all align with what you want
- [ ] **Paper account is configured for this asset class** — options approval, crypto enabled, margin type
- [ ] **Risk controls are set** (or explicitly waived) — you've acknowledged position sizing, stop-loss, and concentration limits

---

## 3 - Source-of-truth references

| Source | URL | Used for |
|---|---|---|
| Trading API overview | https://docs.alpaca.markets/us/docs/trading-api | API capabilities and structure |
| Working with orders | https://docs.alpaca.markets/us/docs/working-with-orders | Order submission, replacement, cancellation |
| Orders on Alpaca | https://docs.alpaca.markets/us/docs/orders-at-alpaca | Order types, TIF values, status lifecycle |
| Paper trading | https://docs.alpaca.markets/us/docs/paper-trading | Paper environment behavior and limitations |
| Working with positions | https://docs.alpaca.markets/us/docs/working-with-positions | Position retrieval and management |
| Working with account | https://docs.alpaca.markets/us/docs/working-with-account | Account state, buying power, day trade count |
| Working with assets | https://docs.alpaca.markets/us/docs/working-with-assets | Tradability checks, asset attributes |
| Options trading | https://docs.alpaca.markets/us/docs/options-trading | Options order specifics, approval levels |
| Crypto trading | https://docs.alpaca.markets/us/docs/crypto-trading | Crypto order specifics, supported pairs |
| Alpaca disclosures | https://alpaca.markets/disclosures | Required disclosure language |

---

## 4 - Workflow

### Phase 1: Strategy Confirmation

**Step 1 — Identify the signal source.**
Your agent determines where the trade idea comes from:
- **Backtest output**: read the run folder (`notes.md`, `summary.json`) to extract the strategy logic, confirmed parameters, and the last signal. Parse the signal for symbol, side, quantity, and any price targets.
- **Manual idea**: you describe the trade in natural language. Your agent extracts the parameters and asks clarifying questions.
- **Automated system**: a webhook, alert, or scheduled trigger. Your agent reads the payload and maps it to order parameters.

**Step 2 — Reiterate the strategy logic.**
Your agent restates the complete strategy interpretation in plain language:
- What triggers a trade (entry condition)
- What exits a trade (exit condition, stop-loss, take-profit)
- Indicator parameters (e.g., "20-day SMA crossover with 50-day SMA")
- Position sizing rules (e.g., "risk 1% of portfolio per trade")
- Any assumptions your agent is making (e.g., "assuming you want to enter at market price")

**Step 3 — Confirm the interpretation.**
Your agent asks you to confirm or correct the restatement. It does not proceed until you confirm. If you correct it, your agent restates the corrected version and asks again.

### Phase 2: Configuration Agreement

**Step 4 — Gather all order parameters.**
Using the inputs table from §2, your agent collects every required and optional parameter. It asks for anything not already specified.

**Step 5 — Show parameter attribution.**
For each parameter, your agent shows:
- The value being used
- Whether it was **provided** by you, **inferred** from context (e.g., asset class from symbol format), or **defaulted** to a standard value

Example:
```
Symbol:        AAPL           (provided)
Side:          buy            (provided)
Quantity:      50 shares      (provided)
Order type:    limit          (provided)
Limit price:   $180.00        (provided)
TIF:           day            (defaulted — standard for equities)
Extended hrs:  false          (defaulted)
Client order:  a7b3c9d1-...   (auto-generated)
```

**Step 6 — Confirm timing.**
Your agent confirms execution timing:
- **Immediate**: submit now, during current market session
- **Scheduled**: submit at a specific time (your agent notes this requires external scheduling)
- **Conditional**: submit only when a condition is met (your agent notes this requires monitoring logic)

If the timing is not immediate, your agent explains what tooling you'd need and whether it can help set it up (see §4 Phase 8 for deployment guidance).

**Step 7 — Confirm asset class specifics.**

For **US Equity**:
- Verify the symbol is tradable via the assets endpoint
- Check fractional share eligibility if quantity includes decimals
- Confirm extended-hours eligibility if `extended_hours` is `true` (only `limit` orders qualify)
- Note T+1 settlement for sell proceeds

For **US Options**:
- Validate the contract symbol follows OCC symbology: `AAPL250718C00200000`
  - Root symbol (AAPL), expiration (250718 = July 18, 2025), call/put (C/P), strike price × 1000 (00200000 = $200.00)
- Confirm expiration date, strike price, and put/call
- Confirm position intent: buy-to-open, buy-to-close, sell-to-open, sell-to-close
- Note the contract multiplier: 1 contract = 100 shares of the underlying
- Confirm the account's options approval level meets the strategy requirements
- Warn about expiration risk if the expiration is within 5 trading days

For **Crypto**:
- Confirm the pair format (e.g., `BTC/USD`, `ETH/USD`)
- Note 24/7 market — no market-hours constraints
- Check minimum order size for the pair
- Confirm the account has crypto trading enabled

**Step 8 — Confirm risk controls.**
Your agent asks about risk controls:
- **Max position size**: maximum number of shares/contracts in a single position
- **Max portfolio allocation**: maximum percentage of portfolio equity in one symbol
- **Stop-loss**: price or percentage at which to exit a losing position
- **Take-profit**: price or percentage at which to take gains

If you haven't set any risk controls, your agent recommends you consider them. It asks whether you want to set them now or proceed without them. If you proceed without them, your agent notes this in the session log.

**Step 9 — Confirm margin usage.**
Your agent checks:
- Margin classification via `account.multiplier` — the account object has no `account_type` field. `1` is a limited-margin, cash-style account; `2` is a Reg T margin account with 2x intraday and overnight buying power; `4` is a PDT account with 4x intraday and 2x overnight
- Whether shorting is permitted (`account.shorting_enabled`), since the strategy may require it
- Current buying power (`account.buying_power`) and, for options, `account.options_buying_power`
- Current equity (`account.equity`)
- If margin is involved, the maintenance margin requirement (`account.maintenance_margin`)

### Phase 3: Paper Account Verification

**Step 10 — Verify the environment is paper.**
Your agent checks the base URL, SDK configuration, or CLI profile to confirm the environment is **paper**, not live.

| Check | Paper | Live (BLOCKED) |
|---|---|---|
| REST base URL | `https://paper-api.alpaca.markets` | `https://api.alpaca.markets` |
| SDK config | `paper=True` or equivalent | `paper=False` or missing |
| CLI profile | paper profile selected | live profile selected |

If live credentials are detected: **STOP immediately.** Your agent displays a clear warning and refuses to proceed. It does not offer to "switch to paper" on your behalf — you must reconfigure your credentials.

**Step 11 — Fetch account status.**
Your agent retrieves the account and verifies:
- `status` is `ACTIVE` or `PAPER_ONLY` — a paper-only account is valid for this skill and must not be blocked
- `trading_blocked` is `false`
- `account_blocked` is `false`
- `trade_suspended_by_user` is `false`
- `buying_power` is sufficient for the planned order
- `multiplier` for margin classification, which is also the only PDT signal available

The Trading API account object carries **no** `pattern_day_trader` or `daytrade_count` field. Your agent must not read them. A `multiplier` of `4` indicates a PDT account; if you need day-trade counts, derive them from `GET /v2/account/activities` rather than the account object.

**Step 12 — Verify options readiness** (if trading options).
- Gate on `options_trading_level`, not `options_approved_level`. The effective level is the **minimum** of `options_approved_level` and the `max_options_trading_level` in account configuration, and Alpaca exposes it directly as `options_trading_level`. An account approved for level 3 but configured to level 1 can only trade level 1.
- Each level includes the ones below it:
  - Level 0: options trading disabled
  - Level 1: sell covered calls, sell cash-secured puts
  - Level 2: buy calls, buy puts
  - Level 3: spreads and straddles
- Alpaca does not offer naked short options at any level. If a strategy requires one, stop and say so rather than looking for a higher level.
- If `options_trading_level` is `0` or below what the strategy needs, your agent stops and explains which level is required and how to request an upgrade

**Step 13 — Verify crypto readiness** (if trading crypto).
- `crypto_status` is `ACTIVE`
- If crypto is not enabled, your agent stops and explains how to enable it on the account

**Step 14 — Show account summary.**
Your agent displays a summary of the account state:

```
┌─────────────────────────────────────────┐
│         PAPER ACCOUNT SUMMARY           │
├──────────────┬──────────────────────────┤
│ Account ID   │ ****-****-****-a1b2     │
│ Status       │ ACTIVE                   │
│ Equity       │ $100,000.00             │
│ Buying Power │ $100,000.00             │
│ Cash         │ $100,000.00             │
│ Positions    │ 3 open                   │
│ Multiplier   │ 2 (Reg T margin)         │
│ Options Lvl  │ 2 (effective)            │
│ Crypto       │ ACTIVE                   │
└──────────────┴──────────────────────────┘
```

### Phase 4: Order Preview

**Step 15 — Build the order payload.**
Your agent constructs the complete API request body with all confirmed parameters. It sets a unique `client_order_id` for idempotency.

**Step 16 — Display the order preview.**
Your agent shows a complete order preview table:

```
┌─────────────────────────────────────────┐
│           ORDER PREVIEW                  │
├──────────────┬──────────────────────────┤
│ Environment  │ PAPER                    │
│ Symbol       │ AAPL                     │
│ Side         │ buy                      │
│ Quantity     │ 10 shares                │
│ Order Type   │ limit                    │
│ Limit Price  │ $185.50                  │
│ Time-in-Force│ day                      │
│ Extended Hrs │ no                       │
│ Client Order │ abc-123-def              │
│ Est. Notional│ ~$1,855.00              │
│ Buying Power │ $98,500.00 (sufficient) │
└──────────────┴──────────────────────────┘
```

For **options**, the preview also shows:
- Contract: `AAPL 07/18/2025 $200 Call`
- Contracts: 2
- Multiplier: 100 shares/contract
- Est. Premium: ~$3.50 × 2 × 100 = $700.00
- Position intent: buy-to-open

For **crypto**, the preview also shows:
- Pair: BTC/USD
- Market: 24/7 (always open)
- Notional: $500.00 (if notional order)

**Step 17 — Confirmation-ON mode.**
If `confirmation_mode` is `on`, your agent asks:

> Submit this order? (yes / no)

It waits for your explicit `yes` before proceeding. Any response other than a clear affirmative is treated as "no" and your agent asks what you'd like to change.

**Step 18 — Confirmation-OFF mode.**
If `confirmation_mode` is `off`, your agent informs you:

> Confirmation mode is OFF. This order will be submitted now. The preview is shown above for your review.

Your agent then proceeds to submission.

### Phase 5: Order Submission

**Step 19 — Submit the order.**
Your agent sends the order to the paper trading API via your chosen execution method (SDK, REST, CLI, or MCP tool). The endpoint is `POST /v2/orders` against the paper base URL.

**Step 20 — Capture the response.**
On success, your agent captures:
- `id` (order ID)
- `client_order_id`
- `status` — usually `new`, meaning Alpaca received the order and routed it. `accepted` means received but not yet routed and is common outside trading hours; `pending_new` and `accepted_for_bidding` are documented as rare
- `created_at`
- `submitted_at`
- `symbol`, `side`, `qty`, `type`, `time_in_force`
- All echoed fields from the API response

**Step 21 — Handle submission failure.**
If the submission fails, your agent:
1. Captures the full error response (HTTP status code, error message, error code)
2. Shows you the error in plain language
3. Suggests specific remediation. `POST /v2/orders` documents exactly two error responses, and they do not mean what their generic HTTP names suggest:
   - `403 Forbidden` → **insufficient buying power or shares**, not an auth problem. Show current buying power versus required, or current position versus the quantity being sold
   - `422 Unprocessable Entity` → input parameters not recognized. Show which ones, and check them against the per-asset-class matrix in section 2
   - `429 Too Many Requests` → rate limited; honor `Retry-After` and back off
   - `401 Unauthorized` → credential problem. Stop; do not retry with the same credentials
   - Network timeout → verify whether the order was received before doing anything else

   A non-tradable or unknown symbol surfaces as `422` from the order endpoint, not `404`. Your agent validates the symbol against `GET /v2/assets/{symbol_or_asset_id}` beforehand, where a genuinely unknown symbol does return `404`. Crypto requires the old symbology without a slash (`BTCUSD`), and any slash that remains must be URL-encoded (`/v2/assets/BTC%2FUSDT`) or the request is malformed.
4. Saves the failed attempt to the session log
5. Does **NOT** automatically retry for non-idempotent submissions. If it's unclear whether the order was received (e.g., network timeout), your agent checks existing orders by `client_order_id` first.

### Phase 6: Post-Submission Monitoring

**Step 22 — Fetch order status.**
Immediately after a successful submission, your agent fetches the order by ID (`GET /v2/orders/{id}`) to confirm the current status.

**Step 23 — Return post-submission summary.**
Your agent shows you:

```
Order submitted successfully.

Order ID:        b1e2f3a4-5678-9012-cdef-abcdef123456
Status:          accepted
Symbol:          AAPL
Side:            buy
Qty:             10
Type:            limit
Limit Price:     $185.50
TIF:             day
Submitted at:    2026-07-26T15:30:00Z
Environment:     PAPER

Next steps:
- Ask me to check the status of this order
- Ask me to cancel this order
- Ask me to show your current positions
- Ask me to show your portfolio summary
```

**Step 24 — Order lifecycle updates.**

Your agent tracks the order through its lifecycle and reports each transition:

**Filled:**
```
✅ Order FILLED

Order ID:        b1e2f3a4-...
Symbol:          AAPL
Side:            buy
Filled Qty:      10 shares
Avg Fill Price:  $185.32
Fill Time:       2026-07-26T15:30:05Z

Portfolio impact:
- AAPL position:   10 shares @ $185.32 (new position)
- Position value:   $1,853.20
- Portfolio %:      1.85% of equity
- Buying Power:     $98,146.80 (was $100,000.00)
```

**Partially filled:**
```
⏳ Order PARTIALLY FILLED

Order ID:        b1e2f3a4-...
Filled:          6 of 10 shares
Avg Fill Price:  $185.35
Remaining:       4 shares (still working)
```

**Rejected:**
```
❌ Order REJECTED

Order ID:        b1e2f3a4-...
Reason:          insufficient buying power
Details:         Required ~$1,855.00, available $500.00

Remediation:
- Reduce order quantity
- Close existing positions to free buying power
- If this is unexpected, check your account for pending orders
  consuming buying power
```

**Canceled:**
```
🚫 Order CANCELED

Order ID:        b1e2f3a4-...
Canceled by:     system
Reason:          day order expired at market close (16:00 ET)

If you still want this position, consider:
- Resubmitting as a GTC order
- Waiting for the next market open
```

**Replaced:**
```
🔄 Order REPLACED

Old Order ID:    b1e2f3a4-...
New Order ID:    c2d3e4f5-...
Changed:
  Limit Price:   $185.50 → $186.00
  Quantity:      10 → 15
```

### Phase 7: Portfolio Impact Assessment

**Step 25 — Fetch updated positions and account.**
After a fill, your agent retrieves the current positions (`GET /v2/positions`) and account (`GET /v2/account`) to show the impact.

**Step 26 — Show portfolio risk summary.**
```
┌─────────────────────────────────────────┐
│        PORTFOLIO RISK SUMMARY           │
├──────────────┬──────────────────────────┤
│ Total Equity │ $100,050.00             │
│ Buying Power │ $98,146.80              │
│ Open Pos.    │ 4 positions              │
│ Open Orders  │ 1 working                │
│                                         │
│ Position Concentration:                 │
│   AAPL       │  1.85% ($1,853.20)      │
│   MSFT       │  3.20% ($3,201.00)      │
│   TSLA       │  2.10% ($2,100.50)      │
│   BTC/USD    │  5.00% ($5,002.30)      │
│                                         │
│ Unrealized P&L (total): +$50.00        │
└──────────────┴──────────────────────────┘
```

- **Position concentration**: `abs(position.market_value) / equity × 100` — the Position field is `market_value`. (`position_market_value` exists only on the account payload as an all-positions aggregate.)
- **Unrealized P&L**: `(current_price - avg_entry_price) × qty`
- **Day trade count**: relevant for equity accounts with less than $25k equity
- **Open orders**: orders still working that may consume additional buying power

### Phase 8: Deployment Guidance

> This phase is optional. Your agent provides this guidance only when you ask about deploying or automating a strategy.

**Step 27 — Provide deployment options.**

If you ask how to deploy or automate the strategy, your agent outlines these paths:

**Local scheduler:**
- Use `cron` (Linux/macOS), `launchd` (macOS), or Windows Task Scheduler
- Write a Python script using `alpaca-py` that encapsulates the strategy logic
- Schedule it to run at your desired frequency
- Log output to a file for review

**Cloud hosting:**
- AWS Lambda + EventBridge for serverless scheduled execution
- Google Cloud Functions + Cloud Scheduler
- Railway, Render, or Fly.io for persistent process hosting
- Any platform that can run a Python/Node.js process on a schedule

**Webhook-based:**
- TradingView alerts → webhook endpoint → your server → Alpaca API
- Custom alert system → webhook → order execution logic

**Every deployed path asserts paper at startup.** Scheduling, hosting, and webhook triggers differ, but they share one requirement: the artifact that runs unattended proves it is pointed at paper before it can place an order, and exits if it cannot. There is no operator watching to catch a wrong endpoint, and a live account returns the same response shape as a paper one, so nothing downstream will reveal the mistake.

Two rules make that assertion trustworthy:

- **Pin the paper endpoint as a literal in code, not as configuration.** An endpoint read from an environment variable, a config file, or a CI secret can be changed by someone who never reads this skill. In `alpaca-py` that means constructing the client as `TradingClient(key, secret, paper=True)` with `paper=True` written literally, never `paper=os.getenv(...)`.
- **Abort on any signal that live was intended.** If a live endpoint, a live-trading flag, or a live profile is present in the environment, exit non-zero before the first order rather than resolving the conflict silently.

Naming a credential or variable "paper" is not evidence. Only the resolved endpoint is.

**Important notes your agent always includes:**
- Validate any new automation against paper for a meaningful period before considering live at all
- Your agent does not recommend any specific hosting provider or guarantee uptime
- Automating live trading is a separate, significant decision with additional regulatory and risk considerations
- Monitor automated systems regularly — do not "set and forget"
- Include error handling, logging, and alerting in any automated system
- Consider what happens when your automation encounters an unexpected market condition

---

## 5 - Execution rules

### Environment safety

- This skill operates in the **paper-trading environment ONLY**.
- If your agent detects live API credentials — base URL is `https://api.alpaca.markets` without the `paper-` prefix, or the SDK/CLI profile is set to live — it must **STOP** and warn you immediately.
- Your agent must verify the environment before **every** order submission, not just once per session. Environment state can change if credentials are reconfigured mid-session.
- Your agent never offers to "switch to live" or facilitate the transition from paper to live trading.

### Confirmation behavior

- At the start of each session, your agent asks whether you want explicit confirmation before each order (default: **ON**).
- In **confirmation-ON** mode, your agent shows the order preview and waits for your explicit "yes" before submitting.
- In **confirmation-OFF** mode, your agent still shows the order preview but submits after a brief display pause. It announces the submission clearly.
- You can toggle confirmation mode at any time during the session by telling your agent.
- Regardless of mode, your agent **always** shows the order preview. It never submits silently.

### Idempotency

- Your agent sets a unique `client_order_id` on every order to prevent duplicate submissions.
- If submission fails with a network error and it's unclear whether the order was received, your agent checks existing orders for the `client_order_id` before retrying.
- `client_order_id` values are logged in the session's `orders.json` for audit.

### Rate limiting

- Drive throttling from the response headers rather than a hard-coded ceiling. Every response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`; your agent slows down as `Remaining` approaches zero instead of waiting to be throttled. A figure of 200 requests per minute is widely cited for the Trading API but is not stated in Alpaca's current documentation, so do not hard-code it.
- If rate-limited (HTTP 429), stop and retry with exponential backoff plus jitter (1s, 2s, 4s, 8s, capped), and do not retry before the time given by `X-RateLimit-Reset`.
- Do not spam order status checks. Poll at reasonable intervals:
  - Active market order: every 2 seconds for the first 10 seconds, then every 5 seconds
  - Active limit order: every 5 seconds for the first minute, then every 30 seconds
  - No order should be polled more than 60 times total

### Asset class rules

**US Equity:**
- Standard market hours: 9:30 AM–4:00 PM ET
- Extended hours require `extended_hours: true` on a `limit` order with `day` or `gtc` TIF, and cover three sessions:
  - Overnight: 8:00 PM–4:00 AM ET, Sunday to Friday
  - Pre-market: 4:00 AM–9:30 AM ET, Monday to Friday
  - After-hours: 4:00 PM–8:00 PM ET, Monday to Friday
- Not every asset is eligible for the overnight session — confirm on the asset record rather than assuming
- Fractional shares supported for eligible symbols (check `fractionable` attribute)
- T+1 settlement — sell proceeds are available the next business day
- Short selling requires a margin account and locatable shares

**US Options:**
- Standard market hours: 9:30 AM–4:00 PM ET
- One contract = 100 shares of the underlying
- Approval level required (1, 2, or 3) — verify before submitting
- Exercise and assignment are automatic at expiration for ITM options
- Options have expiration dates — they lose value over time (theta decay)
- American-style options can be exercised any time before expiration
- Weekly, monthly, and quarterly expirations available for major symbols

**Crypto:**
- 24/7 market — no market-hours constraints
- Minimum order sizes apply per pair (check the asset endpoint)
- Not all pairs are available — verify before submitting
- No extended-hours concept — always open
- Fractional quantities supported for most pairs
- No short selling of crypto

### Error handling

- **Auth failure (401):** Stop, show the error, suggest re-authenticating. Never retry with the same credentials.
- **Insufficient buying power or shares (403):** On `POST /v2/orders`, `403` means the tradable balance or share count is insufficient — it is not an auth failure. Show current buying power, required notional, and the shortfall. Suggest reducing quantity or closing positions.
- **Non-tradable symbol (422):** The order endpoint reports unrecognized input as `422`. Show the asset status and suggest checking the symbol. Offer to search for the correct symbol. `GET /v2/assets/{symbol_or_asset_id}` is the place a `404` legitimately appears.
- **Market closed (422):** Show current market status and next open time using the clock endpoint (`GET /v2/clock`).
- **Rate limit (429):** Wait and retry with exponential backoff. Inform you of the delay.
- **Network timeout:** Check if the order was received (by `client_order_id`) before deciding whether to retry.
- **Unknown error:** Show the full error response. Do not silently swallow errors. Log the error to the session file.

---

## 6 - Output contract

### In-chat response after submission

```
Order submitted successfully.

Order ID:        {order_id}
Status:          {status}
Symbol:          {symbol}
Side:            {side}
Qty:             {qty}
Type:            {order_type}
TIF:             {time_in_force}
Submitted at:    {submitted_at}
Environment:     PAPER

Next steps:
- Ask me to check the status of this order
- Ask me to cancel this order
- Ask me to show your current positions
- Ask me to show your portfolio summary
```

### Run folder artifacts

When the skill is used as part of a session with multiple orders, your agent writes session artifacts to a run folder:

```
runs/<YYYYMMDD-HHMMSS>-paper-trading/
  notes.md              # strategy context, confirmation choices, assumptions
  orders.json           # all orders submitted in this session
  order_log.csv         # timeline: order_id, timestamp, event, status, details
  positions_snapshot.json # positions after last fill
  portfolio_summary.md  # human-readable portfolio state
  review.md             # session review and open questions
```

**File descriptions:**

| File | Content | Format |
|---|---|---|
| `notes.md` | Strategy description, signal source, confirmation preferences, assumptions made, risk controls applied | Markdown |
| `orders.json` | Array of all orders submitted, including request payload and response | JSON |
| `order_log.csv` | Chronological event log: `order_id, timestamp, event_type, status, details` | CSV |
| `positions_snapshot.json` | Positions at the end of the session (from `GET /v2/positions`) | JSON |
| `portfolio_summary.md` | Human-readable portfolio state: equity, buying power, positions, concentration, P&L | Markdown |
| `review.md` | Session review: what worked, what didn't, open questions, suggested improvements | Markdown |

---

## 7 - Validation and tests

Validate behavior against:
- Happy path scenarios for each asset class
- Missing and ambiguous input handling
- Auth and permission failure handling
- Environment safety verification (live credential detection)
- Order lifecycle transitions
- Edge cases: insufficient buying power, non-tradable symbols, market-closed, PDT warnings
- Idempotency and network failure recovery
- Confirmation mode switching

Run these tests mentally or against a paper account whenever modifying this skill.

---

## 8 - Disclosures, safety, and data handling

### Required disclosure

> **Important disclosure:** This material is for informational, educational, and research purposes only. It is not investment advice, a recommendation, an offer, or a solicitation to buy or sell securities, options, cryptocurrencies, or any other financial product. All investing and trading involve risk, including possible loss of principal. Paper trading is simulated and may differ from live trading in fills, market impact, liquidity, fees, latency, and other factors. Review Alpaca's disclosures at https://alpaca.markets/disclosures.

Your agent includes this disclosure in every session summary, report, and portfolio review.

### Paper-trading specific

- Paper trading results are simulated. They do not represent actual trading performance.
- Paper fills may differ from live fills in price, timing, partial fills, and rejection behavior.
- Paper trading does not charge real commissions or fees. Live trading may incur costs.
- Moving from paper to live trading is a separate, significant decision that requires additional review of risk tolerance, capital adequacy, and regulatory requirements.
- This skill will never facilitate that transition directly.

### Options-specific

When options are involved, your agent includes:

- Options involve significant risk and are not suitable for all investors.
- Options can expire worthless. You can lose the entire premium paid for long options.
- Selling options carries risk that can exceed the premium received, and assignment can force a position at an unfavorable price.
- Complex options strategies (spreads, straddles, strangles) carry additional risks and may have multiple legs with different outcomes.
- Options are subject to exercise and assignment risk, especially near expiration.
- Understand the Greeks (delta, gamma, theta, vega) and how they affect your position before trading.

### Crypto-specific

When crypto is involved, your agent includes:

- Cryptocurrency trading involves substantial risk due to high volatility.
- Crypto assets are not securities and may have different regulatory protections than traditional securities.
- Crypto markets operate 24/7 and can experience significant price swings at any time.
- Crypto assets are not FDIC insured or SIPC protected.
- Regulatory environment for crypto is evolving and may change.

### Credentials and data handling

- Your agent reads credentials from environment variables (`APCA_API_KEY_ID`, `APCA_API_SECRET_KEY`), SDK configuration files, or CLI profile settings.
- **Never** paste API keys or secrets into chat. Your agent will refuse to accept them if offered.
- Your agent redacts account IDs, order IDs, and personally identifiable information in any summaries shared outside the session.
- Raw API responses are stored locally only (in the run folder) and classified as account-level confidential.
- Your agent does not send trading data, account data, or credentials to any third party.
- Session artifacts (run folder files) remain on your local filesystem. Review and delete them as appropriate.

---

## 9 - Anti-patterns

- **NEVER** submit orders to a live trading environment. This skill is paper-only.
- **NEVER** ask for API keys or secrets in chat. Credentials come from environment variables or config files.
- **NEVER** print credentials, tokens, account numbers, or profile details in plain text.
- **NEVER** skip the order preview — always show it, regardless of confirmation mode.
- **NEVER** retry a failed order submission without first checking if the original was received (use `client_order_id` for idempotency).
- **NEVER** give investment advice, recommend specific securities, or imply a strategy is suitable, profitable, or low-risk.
- **NEVER** assume the paper account has specific features enabled (options, crypto, margin) without checking the account endpoint.
- **NEVER** hide order parameters, defaults, or execution assumptions from you.
- **NEVER** treat paper trading results as proof or prediction of live trading performance.
- **NEVER** auto-submit orders in a loop without user awareness — if placing bulk orders, preview each one (or show a summary table of all orders and get batch confirmation).
- **NEVER** assume market hours — always check the clock/calendar endpoint before submitting time-sensitive orders.
- **NEVER** mix paper and live credentials in the same session.
- **NEVER** place orders for asset classes you haven't confirmed you want to trade.

---

## 10 - Related files

| File | Description |
|---|---|
| `reference.md` | API endpoint details, order schemas, status lifecycle diagrams, error codes |

### Companion skills

| Skill | Description |
|---|---|
| `alpaca-trading-paper-trading-cli` | CLI-specific version using the Alpaca CLI |
| `alpaca-trading-paper-trading-mcp` | MCP-specific version using Alpaca MCP server tools |

### Related skills

| Skill | Description |
|---|---|
| `alpaca-trading-backtest` | Run historical backtests that produce signals for this skill |
````

### alpaca-trading-paper-trading-mcp

Path: `skills/trading-api/paper-trading-mcp/SKILL.md` (44 KB).

````markdown
---
name: alpaca-trading-paper-trading-mcp
description: >
  Preview, submit, inspect, and manage Alpaca paper-trading orders using the
  Alpaca Trading API MCP Server. Supports US equities, options, and crypto.
  Use this skill when you want your AI agent to execute paper trades through
  MCP tool calls — no CLI installation or direct API coding required.
---

# Alpaca Paper Trading — MCP Server Version

Use this skill when you want your AI agent to preview, submit, inspect, and manage paper-trading orders using the Alpaca Trading API MCP Server.

This skill is written for you, a Trading API user working with your own Alpaca paper-trading account. Your agent calls MCP tools directly — no CLI installation or raw HTTP requests needed. The MCP server handles authentication and API communication.

This is the MCP-server-specific version. A generic (implementation-agnostic) version and a CLI version are also available as companion skills.

---

## 0 — How your AI agent should use this skill

1. **Start with the signal source.** Whether it originates from a backtest result, a manual trading idea, a scheduled trigger, or a conversational request — identify what is driving the trade.
2. **Reiterate strategy logic and confirm with you.** Your agent must restate the trading idea in its own words and wait for your confirmation before proceeding.
3. **Gather and confirm ALL configurations.** Timing, asset class, symbol, side, quantity or notional amount, order type, time-in-force, limit/stop prices, extended-hours flag, risk controls (position limits, max order size, loss thresholds), and margin intent.
4. **Discover available MCP tools.** Your agent must call `GetDynamicTools` to find the Alpaca MCP namespace and inspect available tool schemas before calling any tool. Tool names and parameters vary by MCP server implementation — never assume.
5. **Verify paper environment.** Read `env.ALPACA_PAPER_TRADE` from the host's MCP config file — no tool exposes it — and require it to be absent, `true`, `1`, or `yes`. Then confirm the account is active and unblocked. If paper mode cannot be proven, **STOP immediately** and tell you.
6. **Show a complete order preview table.** Every parameter that will be sent to the order-placement tool must be visible to you before submission.
7. **Ask whether you want explicit confirmation before each order** (default: ON). Respect your preference for the rest of the session.
8. **Submit via the order-placement tool for the asset class.** Placement is split across stock, crypto, and option tools — select by asset class, then pass the confirmed parameters exactly as previewed.
9. **Monitor with the order lookup and order list tools.** Report fills, rejections, partial fills, and portfolio impact.
10. **Never place live trades.** Verify paper environment before every submission.

---

## 1 — Prerequisites

### Required

- **Alpaca Trading API MCP Server** installed and configured in your agent host (Cursor, etc.)
- **Paper trading API key and secret** configured as environment variables in the MCP server configuration — **never** pasted into chat or passed as tool arguments
- MCP server namespace discoverable via `GetDynamicTools`
- Paper trading account active at Alpaca

### Conditional

- **Options trading**: must be enabled on your Alpaca paper account
- **Crypto trading**: must be enabled on your Alpaca paper account

### MCP Server Setup (Cursor)

The server is Alpaca's official MCP server, maintained at [alpacahq/alpaca-mcp-server](https://github.com/alpacahq/alpaca-mcp-server). That repository's README is the source of truth for the package name, command, and environment variables. The configuration below reflects v2.

Add it to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "alpaca-paper-trading": {
      "command": "uvx",
      "args": ["alpaca-mcp-server"],
      "env": {
        "ALPACA_API_KEY": "your-paper-key",
        "ALPACA_SECRET_KEY": "your-paper-secret",
        "ALPACA_PAPER_TRADE": "true"
      }
    }
  }
}
```

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ALPACA_API_KEY` | Yes | — | Paper API key |
| `ALPACA_SECRET_KEY` | Yes | — | Paper secret key |
| `ALPACA_PAPER_TRADE` | No | `true` | Paper/live switch; `false` selects live. This skill requires `true`. |
| `ALPACA_TOOLSETS` | No | all | Comma-separated toolsets to expose. Leaving it unset means you have all capabilities. Set it (for example `account,trading,assets`) only to narrow what the agent can reach. |

Paper versus live is determined solely by `ALPACA_PAPER_TRADE`. The server derives the API host from that flag, so there is no base-URL variable to set and none to verify.

### Verifying the MCP server is available

Your agent should run:

```
GetDynamicTools with pattern "alpaca"
```

If the namespace is not found, appears in `"error"` or `"loading"` state, or has `namespaceStatus: "needsAuth"`:

1. If `"needsAuth"` — authenticate via `mcp_auth` for that namespace, then retry.
2. If `"error"` or not found — tell you to check the MCP server configuration in Cursor settings.
3. Do **not** fall back to direct HTTP calls or CLI commands. This is the MCP version.

---

## 2 — Gather inputs

### Input table

| Parameter | Required | Default | Notes |
|---|---|---|---|
| `symbol` | Yes | — | Ticker symbol (e.g., `AAPL`, `BTC/USD`, `AAPL251219C00250000`) |
| `side` | Yes | — | `buy` or `sell` |
| `qty` | One of qty/notional | — | Number of shares/units. Whole or fractional. Mutually exclusive with `notional` |
| `notional` | One of qty/notional | — | Dollar amount. Stocks: market orders with `day` TIF only. Crypto: market orders only. Not available on `place_option_order` |
| `type` | No | `market` | Stocks: `market`, `limit`, `stop`, `stop_limit`, `trailing_stop`. Crypto: `market`, `limit`, `stop_limit`. Options: `market`, `limit`. **The parameter is `type`, not `order_type`** |
| `time_in_force` | No | `day` (stocks), `gtc` (crypto), `day` (options) | Stocks: `day`, `gtc`, `opg`, `cls`, `ioc`, `fok`. Crypto: `gtc` or `ioc` only — `day` and `fok` are rejected. Options: `day` only |
| `limit_price` | If limit/stop_limit | — | Limit price |
| `stop_price` | If stop/stop_limit | — | Stop trigger price |
| `trail_percent` | If trailing_stop | — | Trailing stop percentage. `place_stock_order` only |
| `trail_price` | If trailing_stop | — | Trailing stop dollar offset. `place_stock_order` only |
| `extended_hours` | No | `false` | Allow extended-hours fills. `place_stock_order` only; `limit` type with `day` or `gtc` TIF |
| `client_order_id` | No | Alpaca generates one if omitted | Idempotency key — your agent generates one per order |
| `order_class` | No | `null` | `simple`, `bracket`, `oco`, `oto`. `place_stock_order` only. Automatically set to `bracket` when either bracket-leg parameter below is supplied |
| `take_profit_limit_price` | If bracket | — | Limit price for the take-profit leg. `place_stock_order` only |
| `stop_loss_stop_price` | If bracket | — | Stop price for the stop-loss leg. `place_stock_order` only |
| `stop_loss_limit_price` | No | — | Limit price for the stop-loss leg. Requires `stop_loss_stop_price` |
| `position_intent` | No | — | `buy_to_open`, `buy_to_close`, `sell_to_open`, `sell_to_close` (options) |

> The bracket legs are **flat scalar parameters**, not nested objects. `POST /v2/orders` takes nested `take_profit: { limit_price }` and `stop_loss: { stop_price, limit_price }`, but the `place_*` tools flatten them, and their schemas set `additionalProperties: false` — so passing the nested REST shape is a hard rejection, not a silently ignored field. This is the general hazard: the tools deliberately reshape the REST body, so never build parameters from the REST schema.

### Additional context gathered

| Input | Required | Default | Notes |
|---|---|---|---|
| `asset_class` | Inferred | `us_equity` | `us_equity`, `crypto`, `us_option` |
| `strategy_description` | Recommended | — | Natural-language description of the trade rationale |
| `risk_controls` | Recommended | — | Max position size, max loss threshold, portfolio concentration limit |
| `mcp_namespace` | Discovered | — | The MCP namespace where Alpaca tools are available (via `GetDynamicTools`) |

### Strategy confirmation checklist

Before proceeding to order preview, your agent must confirm:

- [ ] Strategy intent restated in plain language
- [ ] Symbol, side, and quantity/notional confirmed
- [ ] Order type and all price levels confirmed
- [ ] Time-in-force confirmed
- [ ] Extended-hours intent confirmed (equities)
- [ ] Risk controls confirmed (or explicitly waived)
- [ ] Asset-class-specific requirements confirmed (options approval, crypto eligibility)
- [ ] Paper environment verified

---

## 3 — Source-of-truth references

| Source | URL | Used for |
|---|---|---|
| Alpaca MCP Server | https://github.com/alpacahq/alpaca-mcp-server | Server setup, environment variables, toolsets, current tool list |
| Alpaca Trading API docs | https://docs.alpaca.markets/us/docs/trading-api | Order parameters, account fields, asset details |
| Create Order reference | https://docs.alpaca.markets/us/reference/postorder | Underlying REST semantics only — **not** the tool parameter shape. The `place_*` tools flatten and constrain this schema, so always build parameters from the discovered tool schema |
| Order types guide | https://docs.alpaca.markets/us/docs/orders-at-alpaca | Order type behavior, TIF rules, extended hours |
| Options trading | https://docs.alpaca.markets/us/docs/options-trading | Options order requirements, exercise/assignment |
| Crypto trading | https://docs.alpaca.markets/us/docs/crypto-trading | Crypto pairs, 24/7 trading, fractional units |
| Account API | https://docs.alpaca.markets/us/reference/getaccount-1 | Account status fields, buying power, PDT |
| Alpaca disclosures | https://alpaca.markets/disclosures | Disclosure language |

### Discovery rule

Your agent **must** call `GetDynamicTools` to discover the actual MCP namespace, tool names, and parameter schemas before calling any tool. The names this skill cites are those of the official server at v2; confirm them, and never assume a parameter format.

---

## 4 — Workflow

### Phase 1: Strategy Confirmation

**Step 1** — Identify the signal source.

Determine where the trade idea originates:
- Backtest result (reference the run folder and signal)
- Manual idea from you ("I want to buy 100 shares of AAPL")
- Scheduled or conditional trigger ("Buy when AAPL drops below $180")
- Portfolio rebalance ("Close my TSLA position and rotate into NVDA")

**Step 2** — Reiterate the strategy.

Your agent restates the trade in its own words:

> "You want to buy 10 shares of AAPL as a market order, good for the day, in your paper account. This is a manual directional trade — no stop loss or take profit attached. Is that correct?"

**Step 3** — Wait for your confirmation.

Do not proceed until you confirm. If you correct any detail, your agent re-confirms the updated version.

### Phase 2: Configuration Agreement

**Step 4** — Gather all order parameters from the input table above.

**Step 5** — For limit, stop, or bracket orders, confirm all price levels.

**Step 6** — Confirm time-in-force and extended-hours settings.

**Step 7** — Confirm risk controls:
- Maximum position size in this symbol
- Maximum single-order notional value
- Portfolio concentration limits
- Stop-loss or take-profit levels (if bracket)

**Step 8** — For options: confirm the contract symbol, position intent (`buy_to_open`, etc.), and that options trading is enabled.

**Step 9** — For crypto: confirm the trading pair (e.g., `BTC/USD`), quantity precision, and 24/7 availability.

### Phase 3: MCP Discovery and Paper Account Verification

**Step 10** — Discover the Alpaca MCP namespace.

```
Call GetDynamicTools with pattern "alpaca" to find the namespace.
Then call GetDynamicTools with the found namespace to list all available tools.
```

Your agent inspects the available tools and their parameter schemas. This step must happen every session — tool names and schemas may change between MCP server versions.

**Step 11** — Fetch account status via MCP.

Call the account-info tool — `get_account_info` as of v2; confirm the name against discovery.

From the response, verify:
- `status` = `ACTIVE`
- `trading_blocked` = `false`
- `account_blocked` = `false`

Paper mode itself is established by the server's `ALPACA_PAPER_TRADE` setting, not by these fields.

**Step 12** — **STOP gate**: prove paper mode from the MCP client config, then stop if you cannot.

The MCP server does **not** expose `ALPACA_PAPER_TRADE` to your agent. There is no tool, resource, or server-instruction field that reports it, so the agent cannot ask the server which mode it is in. The only place that value is readable is the client's own MCP configuration file.

That file also holds `ALPACA_API_KEY` and `ALPACA_SECRET_KEY` in the same `env` block, so your agent **must not read the file as a whole** — no `cat`, no file-read tool, no printing the server entry. Reading it wholesale would pull the credentials into model context and violate the data-handling guarantee in §8. The gate needs exactly one value, so it extracts exactly that one value:

```bash
# 1. List server names (names are not secrets)
jq -r '.mcpServers | keys[]' ~/.cursor/mcp.json

# 2. Confirm the chosen entry exists, then read only the flag
jq -r '.mcpServers | has("<server-name>")' ~/.cursor/mcp.json
jq -r '.mcpServers["<server-name>"].env.ALPACA_PAPER_TRADE // "unset"' ~/.cursor/mcp.json
```

On a host without `jq`, the equivalent single-value read:

```bash
python3 -c 'import json,sys;d=json.load(open(sys.argv[1]));e=d["mcpServers"][sys.argv[2]].get("env") or {};print(e.get("ALPACA_PAPER_TRADE","unset"))' ~/.cursor/mcp.json '<server-name>'
```

Substitute the host's own config path when it is not Cursor. Your agent then:

1. Identifies the server entry backing the namespace it discovered its Alpaca tools from, and confirms that entry exists — step 2 above.
2. Requires the flag to be `unset`, or set to `true`, `1`, or `yes` (case-insensitive). The server lowercases the value and tests membership in exactly that set, so **any other value selects live** — including `paper`, `TRUE ` with a trailing space, and `yes!`.

Distinguish the two ways a read comes back empty, because they are not equivalent. A confirmed entry whose flag is `unset` **passes** — the server defaults to paper when the variable is absent. An entry that cannot be found, or a config that cannot be parsed, is an **inconclusive** read, not a passing one, and the value printed for it is indistinguishable from a genuinely absent flag. Never let the second case be read as the first.

If the config cannot be read or parsed, the server entry cannot be identified, or the value is anything outside that set, the gate **fails closed**. Your agent stops and tells you:

> "⚠️ I cannot confirm this MCP server is in paper mode. This skill only supports paper trading. Check that `ALPACA_PAPER_TRADE` is `true` in the server's `env` block and that the configured keys are paper keys, then restart the client."

Your agent must never treat the account response as proof. Live and paper accounts return the same shape, so an account payload can never by itself establish the environment — treat unproven as live. Two weaker signals may *corroborate* a passing config check but must never substitute for it: paper accounts commonly return an `account_number` beginning `PA`, and `status` may be `PAPER_ONLY`. Neither is a documented guarantee.

Do not proceed under any circumstances if paper mode is unproven.

**Step 13** — From the account response, check:
- `buying_power` — sufficient for the planned order
- `options_trading_level` — if trading options. This is the effective level (the minimum of `options_approved_level` and the configured `max_options_trading_level`), so gate on it rather than on `options_approved_level`
- `options_buying_power` — if trading options
- `crypto_status` — if trading crypto
- `multiplier` — margin classification, and the only PDT signal the account object carries: `4` means a PDT account

The account object has no `pattern_day_trader`, `daytrade_count`, or `daytrading_buying_power` field. Your agent must not read them.

**Step 14** — Show account summary:

```
┌─────────────────────────────────────────┐
│         Paper Account Summary           │
├─────────────────────┬───────────────────┤
│ Account ID          │ xxxxxxxx          │
│ Status              │ ACTIVE            │
│ Environment         │ PAPER             │
│ Equity              │ $100,000.00       │
│ Buying Power        │ $200,000.00       │
│ Cash                │ $100,000.00       │
│ Options Approved    │ Level 2           │
│ Crypto Status       │ ACTIVE            │
│ PDT                 │ No                │
└─────────────────────┴───────────────────┘
```

### Phase 4: Order Preview

**Step 15** — Build the order parameters object. Do NOT call the submit tool yet.

Construct the exact parameter set that will be sent to the order-placement tool selected in Step 19:

```json
{
  "symbol": "AAPL",
  "side": "buy",
  "qty": "10",
  "type": "limit",
  "limit_price": "185.50",
  "time_in_force": "day",
  "client_order_id": "pt-20260726-001-aapl-buy"
}
```

**Step 16** — Display the order preview:

```
┌─────────────────────────────────────────┐
│           ORDER PREVIEW                 │
├─────────────────────┬───────────────────┤
│ Symbol              │ AAPL              │
│ Side                │ BUY               │
│ Quantity            │ 10 shares         │
│ Order Type          │ LIMIT             │
│ Limit Price         │ $185.50           │
│ Time in Force       │ DAY               │
│ Extended Hours      │ No                │
│ Order Class         │ Simple            │
│ Est. Notional       │ $1,855.00         │
│ Client Order ID     │ pt-20260726-...   │
│ Environment         │ PAPER (verified)  │
├─────────────────────┴───────────────────┤
│ ⚠ Paper trading only. Not financial    │
│   advice. Past performance ≠ future.   │
└─────────────────────────────────────────┘
```

**Step 17** — If confirmation is ON (default): wait for your explicit "yes" or "go ahead" before submitting.

**Step 18** — If you previously set confirmation to OFF: show the preview, pause briefly to let you read it, then proceed.

### Phase 5: Order Submission via MCP

**Step 19** — Select the order-placement tool for the asset class, then call it.

There is no single create-order tool. Placement is split by asset class, so the tool is chosen from the asset class confirmed in Step 7:

| Asset class | Tool (as of v2) | Supports |
|---|---|---|
| US equity / ETF | `place_stock_order` | market, limit, stop, stop-limit, trailing-stop, brackets |
| Crypto | `place_crypto_order` | market, limit, stop-limit |
| US option | `place_option_order` | single-leg and multi-leg |

Each takes its own schema — the order types available for stocks are not all available for crypto, so read the schema of the specific tool you selected rather than reusing parameters from another. Confirm the name and parameters against discovery before calling; the names above are current for v2 and are not guaranteed across versions.

```
Call place_stock_order with:
  symbol: "AAPL"
  side: "buy"
  qty: "10"
  type: "limit"
  limit_price: "185.50"
  time_in_force: "day"
  client_order_id: "pt-20260726-001-aapl-buy"
```

**Step 20** — Parse the response.

Extract from the MCP response:
- `id` — the Alpaca order ID
- `client_order_id` — your idempotency key
- `status` — initial order status (`new`, `accepted`, `pending_new`)
- `created_at` — submission timestamp
- `filled_qty`, `filled_avg_price` — if immediately filled (market orders)

**Step 21** — On failure:

If the MCP tool call returns an error:

| Error type | Action |
|---|---|
| Insufficient buying power | Show current buying power, suggest reducing quantity or using a limit order |
| Invalid symbol | Verify the symbol with the asset lookup tool (`get_asset` as of v2), suggest corrections |
| Invalid parameters | Show the parameter that failed validation, reference the correct schema |
| Market closed (for `day` TIF) | Show market hours via the clock tool, suggest `gtc` or waiting for open |
| Options not enabled | Tell you to enable options trading in Alpaca dashboard |
| Account restricted | Show the restriction reason, suggest contacting Alpaca support |
| MCP tool error | Show the raw error, suggest checking MCP server logs |

Log the failed attempt in `order_log.csv` with status `FAILED` and the error message.

### Phase 6: Post-Submission Monitoring via MCP

**Step 22** — Check order status.

Call the single-order lookup tool — `get_order_by_id` as of v2 — with the order ID from Step 20. If the submission outcome was ambiguous and you have no order ID, look the order up by your idempotency key instead, using `get_order_by_client_id`.

Report the current status and any fill information.

**Step 23** — List all open orders (if requested or useful context).

Call the order-list tool — `get_orders` as of v2 — filtered to open orders.

Show a summary table of all open orders.

**Step 24** — Return order summary:

```
┌─────────────────────────────────────────┐
│           ORDER SUBMITTED               │
├─────────────────────┬───────────────────┤
│ Order ID            │ abc-123-def       │
│ Symbol              │ AAPL              │
│ Side                │ BUY               │
│ Qty                 │ 10                │
│ Type                │ LIMIT @ $185.50   │
│ Status              │ NEW               │
│ Submitted           │ 2026-07-26 15:30  │
│ Environment         │ PAPER (verified)  │
├─────────────────────┴───────────────────┤
│ Next: Check status, modify, or cancel.  │
└─────────────────────────────────────────┘
```

**Step 25** — Order lifecycle reporting.

As the order progresses, your agent reports state transitions:

| Status | Report to you |
|---|---|
| `new` / `accepted` | Order is live, waiting for fill |
| `partially_filled` | Show filled qty, remaining qty, avg fill price |
| `filled` | Show total filled qty, avg fill price, estimated cost |
| `canceled` | Confirm cancellation, show any filled portion |
| `expired` | Note expiration (TIF elapsed), suggest resubmission if appropriate |
| `rejected` | Show rejection reason, suggest remediation |
| `replaced` | Show old → new order details |

For filled or partially filled orders, calculate portfolio impact:
- New position size (or change to existing position)
- Estimated cost basis
- Remaining buying power
- Portfolio weight of this position

### Phase 7: Portfolio Impact via MCP

**Step 26** — Fetch all positions.

Call the all-positions tool — `get_all_positions` as of v2.

Show a positions summary table.

**Step 27** — Fetch a specific position (if checking a single symbol).

Call the single-position tool — `get_open_position` as of v2 — for the symbol in question.

Show position details: qty, avg entry, current price, unrealized P&L, market value.

**Step 28** — Fetch updated account.

Call the account-info tool again — `get_account_info` as of v2.

Show updated equity, buying power, and cash after the trade.

**Step 29** — Portfolio risk summary:

```
┌─────────────────────────────────────────────┐
│         Portfolio Risk Summary              │
├──────────────────┬──────────────────────────┤
│ Total Equity     │ $99,850.00              │
│ Cash             │ $98,000.00              │
│ Market Value     │ $1,855.00               │
│ Buying Power     │ $196,000.00             │
│ Positions        │ 1                       │
│ Largest Position │ AAPL (100% of invested) │
│ Unrealized P&L   │ +$5.00 (+0.27%)         │
│ Day P&L          │ +$5.00                  │
└──────────────────┴──────────────────────────┘
```

### Phase 8: Order Management via MCP

**Step 30** — Cancel a specific order.

Call the single-order cancel tool — `cancel_order_by_id` as of v2 — with the order ID.

Confirm cancellation. Note: filled orders cannot be canceled.

**Step 31** — Cancel all open orders.

Call the bulk cancel tool — `cancel_all_orders` as of v2. This acts on every open order in the account at once, so show the list it will affect and get confirmation before calling it, even when confirmation mode is OFF.

Confirm how many orders were canceled. Show any that could not be canceled (already filled/filling).

**Step 32** — Replace (modify) an existing order.

Call the replace tool — `replace_order_by_id` as of v2 — with the order ID and only the fields being changed.

Show the old → new comparison table. Only unfilled or partially-filled orders can be replaced.

**Step 33** — Close a single position.

Call the single-position close tool — `close_position` as of v2. It takes `symbol_or_asset_id` (required) and optionally either `qty` or `percentage`, which are mutually exclusive. Omitting both closes the entire position.

This is not a cancellation — it submits a market sell order for the position, so it moves real (paper) money and is subject to market hours. If the market is closed the order queues and executes at the next open, which means the fill price is unknown at the time you approve it. Your agent states this explicitly when the market is closed rather than implying the position is already flat.

Your agent shows the position it is about to close — symbol, quantity, market value, and unrealized P&L — and requires explicit confirmation. Confirmation mode governs order entry, and this is order entry, so an OFF setting does not skip the confirmation for a liquidation. After the call it reports the resulting order ID and monitors it to a terminal state exactly as it would any other order.

**Step 34** — Close all positions.

Call the bulk close tool — `close_all_positions` as of v2. Its one parameter, `cancel_orders`, cancels every open order before liquidating when set to `true`.

This is the most destructive operation in the skill: it liquidates the entire portfolio, including positions this session never opened, and with `cancel_orders: true` it destroys resting orders too. Your agent first shows the full inventory it will affect:

- Every open position, from the positions list tool, with symbol, quantity, market value, and unrealized P&L
- The total market value being liquidated
- Every open order that `cancel_orders: true` would cancel, if that flag is being set

It then states the count, and requires an explicit "yes" — always, regardless of `confirmation_mode`. Only then does it call the tool. Afterward it reports how many positions were closed and surfaces any that failed, since a partial failure leaves the portfolio in a half-liquidated state that you need to know about.

**Step 35** — Options exercise.

Exercising is irreversible and settles into the underlying, so `exercise_options_position` and `do_not_exercise_options_position` (as of v2) both carry the same explicit-confirmation requirement as Step 34. Your agent shows the contract, the resulting underlying obligation, and the cash impact before calling either one, and never issues an exercise instruction on its own initiative.

### Phase 9: Deployment Guidance (on request)

If you ask about automating these trades beyond interactive sessions:

**MCP-based automation**
- MCP servers are session-based and typically run within an agent host like Cursor
- For recurring MCP-based trades, explore Cursor automations or scheduled agent triggers
- The MCP server must be running and authenticated for each session

**Standalone automation**
- For production-grade automation, use the Alpaca SDK directly:
  - Python: `alpaca-py` (`pip install alpaca-py`)
  - TypeScript/JavaScript: `@alpacahq/alpaca-trade-api` or `@alpacahq/typescript-sdk`
- Cron + SDK script for scheduled strategies
- Cloud functions (AWS Lambda, GCP Cloud Functions) for event-driven trading
- Webhook-based triggers from TradingView or custom signal providers

Standalone automation leaves this skill's guarantees behind. The Step 12 paper gate covers MCP tool calls in an interactive session; an SDK script running under cron, a cloud function, or a webhook has no MCP server and no gate. The script must assert paper itself, at startup, and exit if it cannot — construct the client with `paper=True` as a literal rather than reading the endpoint from configuration, and abort if a live endpoint or live-trading flag is present in the environment. A live account returns the same response shape as a paper one, so nothing later in the run will surface the error.

**Always**:
- Validate any new automation against paper for a meaningful period before considering live at all
- Implement circuit breakers (max daily loss, max orders per day, max position size)
- Log all orders and monitor for unexpected behavior
- Your agent does not recommend specific cloud providers or infrastructure choices

---

## 5 — Execution rules

### Universal rules

1. **Paper only.** This skill is exclusively for paper trading. Your agent must verify the paper environment before every order submission.
2. **No financial advice.** Your agent executes trades at your direction. It does not recommend trades, predict prices, or suggest strategies.
3. **Confirmation by default.** Your agent asks for explicit confirmation before each order unless you opt out.
4. **Idempotency.** Every order gets a unique `client_order_id` to prevent duplicate submissions on retry.
5. **Complete transparency.** Every parameter sent to the MCP tool must be shown to you in the preview.
6. **Fail safe.** If any verification step fails (account check, paper verification, buying power), your agent stops and explains.
7. **No interpolation.** Your agent uses exactly the parameters you confirmed — never infers "you probably meant" and silently changes values.
8. **Disclose limitations.** If the MCP server does not support a requested feature (e.g., a specific order type), your agent tells you rather than attempting a workaround.
9. **Gate unscoped destructive tools.** `cancel_all_orders`, `close_all_positions`, `close_position`, `exercise_options_position`, and `do_not_exercise_options_position` act on holdings this session may never have created, and the last three are irreversible. Your agent lists exactly what each call will affect and requires explicit confirmation regardless of `confirmation_mode`, which governs order entry only.
10. **Closing a position is order entry.** The close tools submit market sell orders rather than deleting a position. They obey market hours, queue to the next open when the market is closed, and fill at an unknown price. Your agent monitors the resulting order to a terminal state instead of reporting the position as flat on the call returning.

### MCP-specific rules

11. **Always discover tools first.** Call `GetDynamicTools` to find the Alpaca namespace and inspect tool schemas before calling any tool. Tool names cited in this skill are current for v2 and are documentation, not a contract — v2 was a rewrite in which none of the v1 tools survived, and a name can persist across versions while its schema changes. Confirm against discovery and never hard-code a parameter schema.
12. **Handle namespace states.** If the MCP namespace is `"needsAuth"`, authenticate via `mcp_auth`. If `"error"` or not found, tell you to check the MCP server configuration.
13. **No raw HTTP fallback.** This is the MCP version — do not fall back to direct HTTP API calls or CLI commands if the MCP server is available and functioning. This governs how your agent reaches Alpaca. It does not forbid reading the local MCP config for the Step 12 paper gate, which touches no Alpaca endpoint.
14. **Auth errors are not retryable with different credentials.** If an MCP tool call fails with an authentication error, tell you to check the MCP server configuration. Do not retry with different credentials or attempt to pass API keys as tool arguments.
15. **MCP tool calls do not need `required_permissions: ["all"]`.** They run through the MCP protocol, not the shell.
16. **Respect MCP server boundaries.** If the discovered schema does not include a parameter you expect (e.g., `position_intent` for options), do not invent it — tell you and reference the API docs for workarounds.
17. **Re-discover on error.** If an MCP tool call fails with an unexpected schema error, re-discover tools with `GetDynamicTools` in case the server was updated.

### Asset-class-specific rules

18. **Equities** — Verify the symbol exists and is tradable via the asset lookup tool before ordering. Check for stock splits, halts, or delistings.
19. **Options** — Verify options approval level. Resolve the contract through the option contracts tool rather than trusting a hand-built OCC symbol (e.g., `AAPL251219C00250000`). Confirm `position_intent`.
20. **Crypto** — Use the slash-pair format (e.g., `BTC/USD`). Note 24/7 trading availability. Fractional quantities are common — confirm precision.

---

## 6 — Output contract

### Run folder structure

```
runs/<YYYYMMDD-HHMMSS>-paper-trading-mcp/
  notes.md              # Strategy description, assumptions, risk controls
  orders.json           # All MCP order responses (create, get, list)
  order_log.csv         # Chronological log of all order actions
  positions_snapshot.json  # Position state after trades
  portfolio_summary.md  # Account and portfolio state
  review.md             # Session review and lessons learned
```

### notes.md

Contains:
- Strategy description and rationale
- All confirmed parameters
- Risk controls in effect
- Paper environment verification details
- Any assumptions made
- Timestamps

### orders.json

Array of all order-related MCP responses captured during the session:

```json
[
  {
    "action": "create",
    "timestamp": "2026-07-26T19:30:00Z",
    "request": {
      "symbol": "AAPL",
      "side": "buy",
      "qty": "10",
      "type": "limit",
      "limit_price": "185.50",
      "time_in_force": "day"
    },
    "response": {
      "id": "abc-123-def",
      "status": "new",
      "filled_qty": "0",
      "created_at": "2026-07-26T19:30:01Z"
    }
  }
]
```

### order_log.csv

```csv
timestamp,action,order_id,client_order_id,symbol,side,qty,type,limit_price,stop_price,tif,status,filled_qty,filled_avg_price,error
2026-07-26T19:30:00Z,CREATE,abc-123-def,pt-20260726-001,AAPL,buy,10,limit,185.50,,day,new,0,,
2026-07-26T19:31:00Z,STATUS,abc-123-def,pt-20260726-001,AAPL,buy,10,limit,185.50,,day,filled,10,185.48,
```

### positions_snapshot.json

Captured from the list-positions MCP response after all trades are complete.

### portfolio_summary.md

Human-readable summary of account state, positions, and risk metrics after the session.

### review.md

Post-session review: what was traded, outcomes, lessons, what to do next.

> **Note**: Unlike CLI output, MCP responses are not automatically saved as raw files. Your agent must capture relevant response data and write it to `orders.json` and `order_log.csv` explicitly.

---

## 7 — Validation and tests

### Pre-submission checks

Your agent validates before every order submission:

| Check | How | Fail action |
|---|---|---|
| Paper environment | `env.ALPACA_PAPER_TRADE` in the host's MCP config is absent, `true`, `1`, or `yes`. Not readable from any tool — read the config file. Fail closed if unreadable | STOP — tell you to reconfigure |
| Account active | `status == "ACTIVE"` | STOP — account issue |
| Trading not blocked | `trading_blocked == false` | STOP — account restricted |
| Sufficient buying power | `buying_power >= est_notional` | STOP — show buying power, suggest smaller order |
| Symbol tradable | Get-asset tool | STOP — symbol not found or not tradable |
| Options approved | Account options level | STOP — tell you to enable options |
| Crypto enabled | Account crypto status | STOP — tell you to enable crypto |
| Valid order type | Schema validation | STOP — show valid order types |
| Valid TIF | Schema validation | STOP — show valid TIF options |
| Price levels present | Limit/stop price for limit/stop orders | STOP — ask for missing price |
| Client order ID | UUID generated | Generate if missing |

### Post-submission checks

| Check | How | Fail action |
|---|---|---|
| Order accepted | Response status | Report rejection reason |
| No duplicate | client_order_id uniqueness | Warn if duplicate detected |
| Fill within expectations | filled_avg_price vs limit_price | Alert if unexpected |

### MCP-specific validation tests

Validate these MCP-specific failure modes:
- MCP namespace not found
- MCP namespace needs authentication
- MCP tool schema changes
- MCP server configured for live environment
- MCP tool call network errors

---

## 8 — Disclosures, safety, and data handling

### Disclosures

Your agent must include these disclosures:

- **Before every order preview:**
  > "Paper trading only. Not financial advice. Past performance does not guarantee future results."

- **If discussing strategy performance:**
  > "Paper trading results are simulated and may not reflect real-world execution, slippage, or market impact."

- **If discussing options:**
  > "Options involve significant risk and are not suitable for all investors. Paper trading options does not carry financial risk, but the strategies tested may involve substantial risk if applied to live trading."

- **Full disclosures.** Review Alpaca's disclosures and agreements at [alpaca.markets/disclosures](https://alpaca.markets/disclosures).

> **Important disclosure:** This material is for informational, educational, and research purposes only. It is not investment advice, a recommendation, an offer, or a solicitation to buy or sell securities, options, cryptocurrencies, or any other financial product. All investing and trading involve risk, including possible loss of principal. Paper trading is simulated and may differ from live trading in fills, market impact, liquidity, fees, latency, and other factors. Review Alpaca's disclosures at https://alpaca.markets/disclosures.

### Safety

- **Never place live trades.** This skill checks for paper environment, but the MCP server configuration is ultimately your responsibility.
- **Never expose API keys.** Keys are configured in the MCP server environment, not passed through the agent.
- **Never provide financial advice.** Your agent executes orders at your direction and reports facts. It does not recommend trades.
- **Circuit breaker awareness.** If you submit many rapid orders, your agent should note the pace and ask if it is intentional.
- **Destructive tools are gated independently of confirmation mode.** Turning per-order confirmation OFF speeds up order entry. It never waives the explicit "yes" required for `close_all_positions`, `cancel_all_orders`, `close_position`, or an options exercise instruction.
- **The default toolset is the full toolset.** `ALPACA_TOOLSETS` defaults to all capabilities, so liquidation and exercise tools are reachable in any default install. Scope the variable if you want them out of the agent's reach entirely rather than relying on the gate alone.

### Data handling

- MCP tool calls go through the MCP protocol to the Alpaca API. Credentials live in the server's configuration and are never passed as tool arguments, so tool calls never place them in your agent's context.
- The one point where your agent touches the file holding those credentials is the Step 12 paper gate. It reads a single field from that file and must never read, print, or echo the file or the server entry as a whole. If your agent cannot extract just that field, it fails the gate rather than falling back to a wholesale read.
- Order data is saved locally in the run folder structure (see §6).
- No trading data is sent to third-party services beyond Alpaca.
- Your agent's conversation context may include order details — treat chat history accordingly.

---

## 9 — Anti-patterns

- **NEVER** call a tool named in this skill without confirming it against discovery — the names are documented for v2, not guaranteed.
- **NEVER** call MCP tools without first inspecting their schema via `GetDynamicTools`.
- **NEVER** assume the MCP server is configured for paper, and never treat an account response as proof of it — paper mode comes from `ALPACA_PAPER_TRADE`.
- **NEVER** read the MCP config file wholesale to check that flag — the same `env` block holds the API keys. Extract the single field.
- **NEVER** treat an unidentifiable server entry as an absent flag — absent passes, inconclusive fails closed.
- **NEVER** fall back to direct HTTP calls if the MCP server is available. This is the MCP version.
- **NEVER** pass API keys as MCP tool arguments — the server handles auth internally.
- **NEVER** place live trades or continue if the account appears to be live.
- **NEVER** submit an order without showing you a preview first.
- **NEVER** skip the paper-environment verification step.
- **NEVER** provide financial advice, price predictions, or trade recommendations.
- **NEVER** retry auth errors with different credentials — tell you to fix the MCP server config.
- **NEVER** silently change order parameters after your confirmation.
- **NEVER** assume a specific MCP server package name or version — discover at runtime.
- **NEVER** use `required_permissions: ["all"]` for MCP tool calls — they do not need it.
- **NEVER** invent MCP tool parameters not present in the discovered schema.
- **NEVER** treat partial fills as complete — always report remaining quantity.
- **NEVER** call `close_all_positions` or `cancel_all_orders` unprompted — both are unscoped and hit holdings this session never created. List what will be affected and require an explicit "yes".
- **NEVER** exercise an option without explicit confirmation — exercise and do-not-exercise instructions are irreversible.
- **NEVER** report a closed position as flat the moment the close tool returns — it submits a sell order that may still be queued or partially filled.

---

## 10 — Related files

- `reference.md` — MCP tool discovery patterns, order type reference, error handling, asset class specifics

### Companion skills

- `alpaca-trading-paper-trading` — Generic implementation-agnostic paper-trading skill
- `alpaca-trading-paper-trading-cli` — CLI-specific paper-trading skill
````

### alpaca-trading-paper-trading-cli

Path: `skills/trading-api/paper-trading-cli/SKILL.md` (38 KB).

````markdown
---
name: alpaca-trading-paper-trading-cli
description: >
  Preview, submit, inspect, and manage Alpaca paper-trading orders using the
  Alpaca CLI. Supports US equities, options, and crypto. Use this skill when
  you want your AI agent to take a strategy signal and execute it as a paper
  trade through the Alpaca command-line interface.
---

# Alpaca Paper Trading — CLI Version

Use this skill when you want your AI agent to preview, submit, inspect, and manage paper-trading orders using the Alpaca CLI.

This skill is written for you, a Trading API user working with your own Alpaca paper-trading account, CLI profile, and local workspace. Your agent executes all operations through the `alpaca` command-line tool, giving you full visibility into every command and its output.

This is the CLI-specific version. A generic (implementation-agnostic) version and an MCP-server version are also available as companion skills.

---

## 0 - How your AI agent should use this skill

1. **Start with the signal source.** Identify the origin of the trade idea — a backtest result, manual idea, scheduled trigger, or strategy output.
2. **Reiterate strategy logic and confirm with you.** Summarize the thesis, expected behavior, and conditions under which the order should execute. Wait for your confirmation before proceeding.
3. **Gather and confirm ALL configurations.** Timing, asset class, symbol, side, qty/notional, order type, TIF, limit/stop prices, extended-hours flag, risk controls, and margin usage — every parameter must be stated and confirmed.
4. **Confirm the CLI resolves to the paper endpoint.** Run `alpaca doctor` and require its `Trading:` line to read `https://paper-api.alpaca.markets`. If it shows the live endpoint, **STOP immediately** and alert you.
5. **Show a complete order preview** using a formatted table. Include the exact CLI command that will run.
6. **Ask whether you want explicit confirmation before each order** (default: ON). Respect your preference for the session.
7. **Submit via `alpaca order submit`** with the paper profile.
8. **Return order ID, status, submitted payload, and next inspection commands** so you can independently verify.
9. **Monitor order lifecycle** with `alpaca order get`. Report fills, rejections, cancellations with portfolio impact.
10. **Never place live trades.** Verify the resolved paper endpoint before every submission. If any ambiguity exists about the environment, STOP.

---

## 1 - Prerequisites

### Alpaca CLI installed and on PATH

```bash
alpaca version
```

Install if needed:

```bash
# Homebrew (macOS / Linux)
brew install alpacahq/tap/cli

# Or with Go — requires $GOPATH/bin (typically ~/go/bin) on your PATH
go install github.com/alpacahq/cli/cmd/alpaca@latest
```

> The CLI is in **Alpha Preview**. Commands, flags, and output formats may change between releases, which is why your agent discovers flags at runtime rather than trusting any list in this file.

### Paper profile configured

```bash
alpaca profile login
# or with API key
alpaca profile login --api-key
```

Discover login options:

```bash
alpaca profile login --help
```

### Connectivity verified

```bash
alpaca doctor
```

Your agent runs this before every trading session. If it fails, no orders are submitted.

### Asset-class requirements

| Asset class | Requirement |
|---|---|
| US equities | Paper account active |
| Options | Options trading enabled on paper account |
| Crypto | Crypto trading enabled on paper account |

### Environment

- A Go toolchain, only if installing via `go install`; the Homebrew formula ships a prebuilt binary and needs no Go
- `uuidgen` or equivalent (for client order IDs)

External `jq` is **not** required. The CLI ships a built-in `--jq` flag that filters its own JSON output.

---

## 2 - Gather inputs

Your agent collects the following before proceeding to order construction:

| Parameter | Description | Default | Required |
|---|---|---|---|
| `signal_source` | Origin of trade idea (backtest, manual, scheduled, strategy) | — | Yes |
| `symbol` | Ticker symbol (e.g., AAPL, BTC/USD, AAPL250718C00200000) | — | Yes |
| `asset_class` | `us_equity`, `us_option`, `crypto` | `us_equity` | Yes |
| `side` | `buy` or `sell` | — | Yes |
| `qty` | Number of shares/contracts/coins | — | Yes (or notional) |
| `notional` | Dollar amount (fractional shares). Market orders with `day` TIF only; cannot combine with `qty` | — | Yes (or qty) |
| `order_type` | `market`, `limit`, `stop`, `stop_limit`, `trailing_stop` — **supported values vary by asset class** | `market` | Yes |
| `time_in_force` | `day`, `gtc`, `ioc`, `fok`, `opg`, `cls` — **supported values vary by asset class** | `day` for equities and options; `gtc` for crypto | Yes |
| `order_class` | `simple`, `bracket`, `oco`, `oto` (equities); `simple`, `mleg` (options); `simple` (crypto) | `simple` | No |
| `limit_price` | Required for limit/stop_limit | — | Conditional |
| `stop_price` | Required for stop/stop_limit | — | Conditional |
| `trail_percent` | For trailing_stop | — | Conditional |
| `trail_price` | For trailing_stop | — | Conditional |
| `extended_hours` | Allow pre/post-market fills | `false` | No |
| `client_order_id` | Idempotency key, max 128 characters | Auto-generated by Alpaca if omitted | No |
| `profile` | Alpaca CLI profile name. Set it via the `ALPACA_PROFILE` environment variable for the whole session — **never** with the `-p`/`--profile` flag. See the warning in Step 10 | Currently active paper profile | No |
| `output_format` | JSON is the default; `--csv` for CSV, `--jq '<expr>'` to filter | JSON | No |
| `confirmation_mode` | Require explicit yes before each order | `ON` | No |
| `max_position_pct` | Max % of portfolio in single position | None | No |
| `max_order_value` | Hard cap on single order notional | None | No |

### Strategy confirmation checklist

Before building the order, your agent confirms:

- [ ] Strategy logic is clearly stated
- [ ] You understand what the order will do
- [ ] Entry criteria are met (if from backtest/signal)
- [ ] Exit criteria / stop-loss plan discussed
- [ ] Position sizing is intentional
- [ ] Risk controls reviewed

---

## 3 - Source-of-truth references

Your agent uses these authoritative sources for validation:

| Source | URL | Used for |
|---|---|---|
| Create an order | https://docs.alpaca.markets/us/reference/postorder | Order parameters, per-asset-class constraints, status codes |
| Alpaca CLI docs | https://docs.alpaca.markets/us/docs/alpacas-cli | CLI commands, flags, syntax |
| Order types | https://docs.alpaca.markets/us/docs/orders-at-alpaca | Order type behavior and requirements |
| Paper trading | https://docs.alpaca.markets/us/docs/paper-trading | Paper environment specifics |
| Options trading | https://docs.alpaca.markets/us/docs/options-trading | Options order requirements and approval levels |
| Crypto trading | https://docs.alpaca.markets/us/docs/crypto-trading | Crypto order specifics |
| Alpaca disclosures | https://alpaca.markets/disclosures | Disclosure language |

### CLI discovery rule

Your agent verifies flags at runtime rather than trusting this file:

```bash
alpaca --help-all              # full command tree with every flag
alpaca order submit --help     # flags for one command
alpaca order submit --schema   # response shape, without calling the API
```

The CLI is in Alpha Preview, so flags and output shapes can change between releases. Anything in this skill that contradicts `--help` output is stale; trust the CLI.

---

## 4 - Workflow

### Phase 1: Strategy Confirmation

**Step 1** — Identify the signal source.

Your agent asks: "Where does this trade idea come from?" Options include:
- A completed backtest (link to run folder if available)
- A manual trade idea you described
- A scheduled or recurring strategy trigger
- Output from another skill or system

**Step 2** — Reiterate the strategy logic.

Your agent summarizes:
- Thesis (why this trade)
- Expected outcome
- Time horizon
- Exit conditions or stop-loss plan

**Step 3** — Confirm interpretation.

Your agent asks: "Is this interpretation correct? Should I proceed to configure the order?"

---

### Phase 2: Configuration Agreement

**Step 4** — Confirm asset class and symbol.

Your agent validates the symbol format:
- Equities: `AAPL`, `MSFT`
- Options: OCC format `AAPL250718C00200000`
- Crypto: `BTC/USD`, `ETH/USD`

Format is necessary but not sufficient — a well-formed symbol can still be untradable or delisted. Your agent confirms it against the asset record:

```bash
alpaca asset get --symbol-or-asset-id AAPL
```

It requires `status` = `active` and `tradable` = `true`, and checks `fractionable` before proposing a notional or fractional-quantity order. For options, it resolves real contracts with `alpaca option contracts --underlying-symbols AAPL` rather than hand-assembling an OCC string.

**Step 5** — Confirm side, quantity, and order type.

**Step 6** — Confirm time-in-force and pricing parameters.

Time-in-force is not uniform across asset classes. Your agent validates the combination before building the command, because the API rejects the invalid ones:

| Asset class | Order types | Time-in-force | Order classes |
|---|---|---|---|
| US equities | `market`, `limit`, `stop`, `stop_limit`, `trailing_stop` | `day`, `gtc`, `opg`, `cls`, `ioc`, `fok` | `simple`, `bracket`, `oco`, `oto` |
| US options | `market`, `limit`, `stop`, `stop_limit` (`stop` types single-leg only) | `day`, `gtc` | `simple`, `mleg` |
| Crypto | `market`, `limit`, `stop_limit` | `gtc`, `ioc` — but `stop_limit` is `gtc`-only, and `ioc` applies only to `market` and `limit` | `simple` |

The CLI supplies the time-in-force default itself based on symbol shape: a symbol containing `/` (i.e. a crypto pair) defaults to `gtc`, everything else to `day`. Submitting a crypto order without `--time-in-force` therefore sends `gtc`, not `day`.

Alpaca's own sources disagree on the options row, so treat it as guidance rather than a hard gate. The OpenAPI spec's `TimeInForce`/`OrderType` descriptions say options are `market`/`limit` with `day` only; the Options Trading page and the Placing Orders matrix both allow `gtc` and both allow `stop`/`stop_limit` on single-leg orders. The two product pages agree with each other against the spec blob, so this table follows them. Your agent still defaults to `day` as the conservative choice and lets Alpaca reject rather than pre-blocking an order that the matrix permits.

Additional constraints that cut across order type:

- **Extended hours** requires `limit` type with `day` or `gtc` TIF. Every other type and TIF is rejected outright.
- **Trailing stop** accepts only `day` and `gtc`.
- **Notional** orders are market-type with `day` TIF only, cannot be combined with `qty`, and **cannot be replaced** — cancel and resubmit instead.
- **Bracket, OCO, and OTO** classes require `day` or `gtc`, do not support extended hours, and are equities-only.
- **Options** do not support extended hours at all. Multi-leg strategies use the `mleg` order class with up to 4 legs, and `stop`/`stop_limit` types are single-leg only.

**Step 7** — Confirm extended hours and client order ID preferences.

Alpaca supports three sessions outside regular hours, all of which require `extended_hours: true` on a limit order:

| Session | Window (ET) | Days |
|---|---|---|
| Overnight | 8:00pm – 4:00am | Sunday to Friday |
| Pre-market | 4:00am – 9:30am | Monday to Friday |
| After-hours | 4:00pm – 8:00pm | Monday to Friday |

Not every asset trades overnight; your agent confirms eligibility on the asset record rather than assuming.

**Step 8** — Review risk controls.

Your agent presents any position-sizing or max-value constraints and validates:
- Order notional vs. buying power
- New position concentration vs. portfolio
- Existing exposure to the same symbol

**Step 9** — Final configuration summary.

Your agent displays a complete parameter table and asks: "All parameters confirmed?"

---

### Phase 3: Paper Account Verification via CLI

**Step 10** — Confirm the CLI resolves to the paper endpoint:

```bash
alpaca doctor
```

`alpaca doctor` prints the fully-resolved trading endpoint under `Connectivity:`:

```
Connectivity:
  Trading:  https://paper-api.alpaca.markets
```

Your agent requires that line to read `https://paper-api.alpaca.markets`. The profile name is not a substitute. The CLI resolves paper vs. live in a fixed order — `ALPACA_LIVE_TRADE` first, then the active profile's `live_trade` field, then a paper default — so an exported `ALPACA_LIVE_TRADE=true` sends a profile named "paper" straight to the live endpoint. `alpaca doctor` reports the result of that whole chain.

> ⚠️ **`alpaca doctor` ignores the `-p`/`--profile` flag.** It accepts the flag and silently discards the value, always reporting the default profile. Every other command honors `-p`. So `alpaca doctor -p live` reports the *paper* endpoint while `alpaca order submit -p live` trades against the *live* one, and the guard passes while the order goes out live.
>
> Your agent therefore **never passes `-p`/`--profile` to any command.** To target a non-default profile it sets `ALPACA_PROFILE` once for the whole session, which `doctor` does honor, so the check and the order resolve identically. If any command in the session is about to receive `-p`, your agent stops instead.

If the `Trading:` line shows `https://api.alpaca.markets`, your agent **STOPS** immediately:

> ⚠️ LIVE ENDPOINT DETECTED. Your agent will not proceed. Unset `ALPACA_LIVE_TRADE` (or set it to `false`, which forces paper even on a live profile), select a paper profile with `alpaca profile switch <paper-profile-name>`, and restart.

**Step 11** — Confirm connectivity from the same `alpaca doctor` output.

Your agent confirms all checks pass. If any fail, it reports the failure and does not proceed. It does not re-run `alpaca doctor`; one invocation covers both this step and Step 10. `alpaca doctor` exits `0` when every check passes and `1` when any check fails.

**Step 12** — Fetch account status:

```bash
alpaca account get
```

Your agent parses and verifies:
- `status` = `ACTIVE`
- `account_blocked` = `false`
- `trading_blocked` = `false`
- `trade_suspended_by_user` = `false`
- `multiplier` — margin classification, and the only PDT signal the account object carries: `1` is a limited-margin cash-style account, `2` is a Reg T margin account, `4` is a PDT account with 4x intraday buying power

The Trading API account object has no `pattern_day_trader` or `daytrade_count` field. Your agent must not read them; infer PDT status from `multiplier` instead.

**Step 13** — Check buying power:

```bash
alpaca account get --jq '.buying_power'
```

Your agent compares estimated order value against available buying power. If insufficient, it warns you before proceeding.

**Step 14** — For options orders, check approval level:

```bash
alpaca account get --jq '{options_approved_level, options_trading_level, options_buying_power}'
```

Your agent gates on `options_trading_level`, which is the **effective** level — the minimum of `options_approved_level` and the `max_options_trading_level` in account configuration. Approval alone does not authorize trading if configuration caps it lower.

| Level | Permits |
|---|---|
| `0` | Options trading disabled |
| `1` | Covered calls, cash-secured puts |
| `2` | Long calls and puts (adds to level 1) |
| `3` | Spreads and straddles (adds to level 2) |

Spreads require level **3**, not level 2.

**Step 15** — Show account summary.

Your agent presents:

```
┌─────────────────────────────────────┐
│ Paper Account Summary               │
├─────────────────────────────────────┤
│ Endpoint:      paper-api (PAPER)    │
│ Profile:       my-paper             │
│ Status:        ACTIVE               │
│ Equity:        $50,000.00           │
│ Buying Power:  $100,000.00          │
│ Multiplier:    2 (Reg T margin)     │
│ Options Level: 2 (effective)        │
│ Crypto:        ACTIVE               │
└─────────────────────────────────────┘
```

---

### Phase 4: Order Preview

**Step 16** — Build the CLI command but DO NOT execute yet.

Your agent constructs the full command and displays it, then validates it with `--dry-run`, which prints the request body the CLI would send without submitting anything:

```bash
alpaca order submit \
  --symbol AAPL \
  --side buy \
  --qty 10 \
  --type limit \
  --limit-price 185.50 \
  --time-in-force day \
  --client-order-id a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  --dry-run
```

The command your agent shows you in the preview must be byte-identical to the one it later executes, minus `--dry-run`.

**Step 17** — Display formatted order preview table:

```
┌─────────────────────────────────────────────┐
│ ORDER PREVIEW — NOT YET SUBMITTED           │
├─────────────────────────────────────────────┤
│ Symbol:         AAPL                        │
│ Side:           BUY                         │
│ Quantity:       10 shares                   │
│ Order Type:     LIMIT                       │
│ Limit Price:    $185.50                     │
│ Time in Force:  DAY                         │
│ Extended Hours: No                          │
│ Est. Value:     $1,855.00                   │
│ Buying Power:   $100,000.00 → $98,145.00   │
│ Client ID:      a1b2c3d4-...               │
│ Endpoint:       paper-api (PAPER)           │
├─────────────────────────────────────────────┤
│ ⚠️  This is a PAPER trade — no real money   │
└─────────────────────────────────────────────┘
```

**Step 18** — If confirmation is ON: wait for explicit "yes" before proceeding.

**Step 19** — If confirmation is OFF: show the preview, then submit automatically.

---

### Phase 5: Order Submission

**Step 20** — Execute the CLI command:

```bash
CLIENT_ORDER_ID="$(uuidgen)"

alpaca order submit \
  --symbol AAPL \
  --side buy \
  --qty 10 \
  --type limit \
  --limit-price 185.50 \
  --time-in-force day \
  --client-order-id "$CLIENT_ORDER_ID"
```

Your agent captures `CLIENT_ORDER_ID` before submitting, so the order stays recoverable if the command dies before printing a response.

**Step 21** — Save raw CLI output to the run folder:

```bash
# Output saved to runs/<timestamp>-paper-trading-cli/raw/order_submit_response.json
```

**Step 22** — Parse response for key fields:
- `id` (order ID)
- `status` (expected: `new` or `accepted`)
- `created_at`
- `filled_at` (null for pending)
- `filled_qty`
- `filled_avg_price`

**Step 23** — On failure:
- Capture the structured JSON error from stderr and the CLI exit code — `0` success, `1` error, `2` auth failure
- Show remediation guidance (e.g., "insufficient buying power", "symbol not found", "market closed")
- Save error to `runs/<timestamp>/raw/error.json`
- Suggest corrective actions

If the failure is ambiguous — a timeout, a killed process, any case where your agent cannot tell whether the order reached Alpaca — it must **not** resubmit. It looks the order up by the client order ID it generated in Step 20:

```bash
alpaca order get-by-client-id --client-order-id "$CLIENT_ORDER_ID"
```

A hit means the order exists and resubmitting would duplicate it. Only a confirmed miss justifies a retry.

---

### Phase 6: Post-Submission Monitoring

**Step 24** — Check order status:

```bash
alpaca order get --order-id {order_id}
```

Your agent reports:
- Current status
- Fill progress (partial fills)
- Average fill price

**Step 25** — List recent orders for context:

```bash
alpaca order list --status open
```

**Step 26** — Return order summary to you:

```
┌─────────────────────────────────────────────┐
│ ORDER SUBMITTED ✓                           │
├─────────────────────────────────────────────┤
│ Order ID:      abc-123-def-456              │
│ Status:        NEW                          │
│ Symbol:        AAPL                         │
│ Side/Qty:      BUY 10                       │
│ Type:          LIMIT @ $185.50              │
│ Submitted:     2026-07-26T14:30:00Z         │
├─────────────────────────────────────────────┤
│ Next commands:                              │
│  alpaca order get --order-id abc-123      │
│  alpaca order cancel --order-id abc-123     │
│  alpaca position list                     │
└─────────────────────────────────────────────┘
```

**Step 27** — Order lifecycle updates:

| Event | Agent action |
|---|---|
| `filled` | Report fill price, calculate slippage vs. limit, show position impact |
| `partially_filled` | Report filled qty, remaining qty, average price |
| `rejected` | Surface rejection reason, suggest fix |
| `canceled` | Confirm cancellation, show final state |
| `expired` | Report expiration (TIF elapsed), suggest re-entry |
| `replaced` | Confirm replacement parameters, show new order ID |

---

### Phase 7: Portfolio Impact

**Step 28** — Fetch positions:

```bash
alpaca position list
```

Or for a specific symbol:

```bash
alpaca position get --symbol-or-asset-id AAPL
```

**Step 29** — Fetch updated account:

```bash
alpaca account get
```

**Step 30** — Show portfolio risk summary:

```
┌─────────────────────────────────────────────┐
│ PORTFOLIO IMPACT                            │
├─────────────────────────────────────────────┤
│ New Position:   AAPL — 10 shares @ $185.30  │
│ Position Value: $1,853.00                   │
│ Portfolio %:    0.74%                       │
│ Buying Power:   $98,147.00 (was $100,000)   │
│ Total Equity:   $250,000.00                 │
│ Open Orders:    1                           │
└─────────────────────────────────────────────┘
```

---

### Phase 8: Order Management

**Step 31** — Cancel a specific order:

```bash
alpaca order cancel --order-id {order_id}
```

Your agent confirms cancellation and reports final order state.

**Step 32** — Cancel all open orders.

`cancel-all` is unscoped: it cancels every open order on the account, including orders this session never created. The CLI executes it immediately with no confirmation prompt of its own, so your agent supplies the gate. It first shows exactly what will be destroyed:

```bash
alpaca order list --status open --jq '[.[] | {id, symbol, side, qty, type, limit_price}]'
```

Your agent lists those orders, states the count, and requires an explicit "yes" — even when `confirmation_mode` is OFF, since that setting governs order entry rather than mass cancellation. Only then:

```bash
alpaca order cancel-all
```

Your agent confirms total canceled and lists affected orders. The same gate applies to `alpaca position close-all`, which liquidates the entire portfolio.

**Step 33** — Replace an order (modify price/qty):

Discover available flags first:

```bash
alpaca order replace --help
```

Then execute:

```bash
alpaca order replace --order-id {order_id} --qty 5 --limit-price 186.00
```

Your agent reports the new order ID and updated parameters.

---

### Phase 9: Deployment Guidance (on request)

When you ask about automation, your agent provides guidance for:

**Bash script wrapper.** Unattended submission goes through a wrapper that proves the paper endpoint before it orders. Nothing scheduled calls `alpaca order submit` directly, so the guard cannot be bypassed by whichever scheduler invokes it:

```bash
#!/bin/bash
# /usr/local/bin/paper-trade.sh
set -euo pipefail

SYMBOL="${1:?usage: $0 SYMBOL SIDE QTY}"
SIDE="${2:?usage: $0 SYMBOL SIDE QTY}"
QTY="${3:?usage: $0 SYMBOL SIDE QTY}"

# Verify the CLI resolves to the paper endpoint
if ! alpaca doctor | grep -q 'Trading:.*https://paper-api\.alpaca\.markets'; then
  echo "ERROR: CLI is not pointed at the paper endpoint. Exiting." >&2
  exit 1
fi

alpaca order submit \
  --symbol "$SYMBOL" \
  --side "$SIDE" \
  --qty "$QTY" \
  --type market \
  --time-in-force day \
  --client-order-id "$(uuidgen)"
```

**Cron job.** Cron calls the wrapper, never the raw CLI:

```bash
# /etc/cron.d/paper-trade
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
ALPACA_PROFILE=paper
0 9 * * 1-5 root /usr/local/bin/paper-trade.sh AAPL buy 1 >> /var/log/paper-trades.log 2>&1
```

Cron runs with a near-empty environment and does not source your shell profile, so `PATH`, `ALPACA_PROFILE`, and credentials must be set explicitly — in the crontab as above, or sourced inside the wrapper from a file readable only by the job's user. A scheduled job that inherits nothing is the case where an unguarded submit is most dangerous: there is no operator watching and no prompt, which is why the endpoint check belongs in the script rather than in the schedule.

**systemd timer / launchd plist:** Your agent generates the appropriate service file for your OS, pointing it at the same wrapper.

**CI/CD pipeline.** Install the CLI, authenticate from the runner's secret store, and invoke the same wrapper — never `alpaca order submit` as a bare step:

```yaml
- name: Submit paper order
  env:
    ALPACA_API_KEY: ${{ secrets.ALPACA_PAPER_API_KEY }}
    ALPACA_SECRET_KEY: ${{ secrets.ALPACA_PAPER_SECRET_KEY }}
    ALPACA_PROFILE: paper
  run: ./scripts/paper-trade.sh AAPL buy 1
```

CI is the easiest place to end up live by accident: the runner has no profile of yours, the keys come from whichever secret someone wired up, and a live key in a secret named for paper looks identical to a correct one at the call site. Naming the secret `PAPER` proves nothing, which is why the wrapper's `alpaca doctor` check — not the variable names — is what establishes the endpoint.

**Key automation notes:**
- The CLI never prompts. There are no "are you sure?" dialogs to suppress, in automation or interactively — which is exactly why the confirmation gates in this skill are the agent's responsibility, not the CLI's.
- `--quiet` suppresses warnings, hints, and color. It is not what makes output machine-readable; JSON is the default with or without it. Use it in cron and CI to keep logs clean.
- `ALPACA_OUTPUT=json|csv` sets the default output format for a whole script.
- Every unattended path — cron, systemd, launchd, CI — submits through the guarded wrapper. No scheduler or pipeline calls `alpaca order submit` directly, so the endpoint check cannot be skipped by adding a new trigger.
- Log all output for an audit trail.
- Use `--client-order-id` for idempotency in retry scenarios.

---

## 5 - Execution rules

### General rules

1. **Paper only.** Never submit orders against the live endpoint. Verify the resolved endpoint before every submission.
2. **Confirm before submit.** Default is explicit confirmation ON. Respect user preference.
3. **Preserve intent.** Never modify order parameters without your explicit agreement.
4. **Atomic operations.** Each order submission is independent. Failures don't affect other orders.
5. **Full transparency.** Show every CLI command before and after execution.
6. **Idempotency.** Always generate a `--client-order-id` to prevent duplicate submissions on retry.
7. **No financial advice.** Your agent executes your instructions. It does not recommend trades.

### CLI-specific rules

8. **Never pass `-p`/`--profile` to any command.** `alpaca doctor` ignores it, so the paper check and the order can resolve to different profiles. Use `ALPACA_PROFILE` for the session instead.
9. **Parse the default JSON output.** Every command returns structured JSON already. Use `--jq '<expr>'` to filter it and `--csv` only for human-facing tables. `--quiet` suppresses warnings, hints, and color; it does not change the data format.
10. **Never pipe to external `jq`.** The built-in `--jq` flag does the same job with one less dependency.
11. **Always discover flags with `--help`, `--help-all`, and `--schema` before assuming syntax.** The CLI is in Alpha Preview and may change between versions.
12. **Save all raw CLI output to the run folder.** Every command's stdout and stderr goes to `raw/`.
13. **If `alpaca doctor` fails, do not proceed.** Report the failure and stop.
14. **Redact profile details and tokens in summaries.** Never expose API keys or secrets in output files.
15. **Handle CLI exit codes.** `0` success, `1` error, `2` auth failure. Capture stderr and surface it.
16. **Do not add your own retry loop for rate limits.** The CLI already retries 429 and 5xx responses up to three times and respects `Retry-After`. A second backoff layer on top of it turns one rate-limited call into a much longer stall. If a command still fails after the CLI's retries, surface the error and stop.
17. **Preview with `--dry-run` before submitting.** It prints the exact request body without sending an order.
18. **Gate unscoped destructive commands.** `order cancel-all` and `position close-all` affect the whole account. Require explicit confirmation regardless of `confirmation_mode`.

---

## 6 - Output contract

Every paper-trading session produces a run folder:

```
runs/<YYYYMMDD-HHMMSS>-paper-trading-cli/
  notes.md                        # Session narrative: strategy, decisions, outcomes
  raw/                            # Saved raw CLI outputs
    account.json                  # Account state at session start
    order_submit_response.json    # Raw submission response
    order_status.json             # Order status checks
    positions.json                # Position state after fills
    clock.json                    # Market clock at submission time
    error.json                    # Error output (if any)
  orders.json                     # Structured order records
  order_log.csv                   # Tabular log: timestamp, action, order_id, status, details
  positions_snapshot.json         # Position state post-trade
  portfolio_summary.md            # Human-readable portfolio impact
  review.md                       # Session review: what worked, issues, next steps
```

### notes.md structure

```markdown
# Paper Trading Session — <timestamp>

## Signal Source
<origin of trade idea>

## Strategy
<strategy logic as confirmed>

## Orders Submitted
| # | Symbol | Side | Qty | Type | Status | Fill Price |
|---|--------|------|-----|------|--------|-----------|

## Portfolio Impact
<post-trade portfolio state>

## Issues / Notes
<any errors, warnings, or observations>
```

### order_log.csv columns

```
timestamp,action,order_id,symbol,side,qty,type,limit_price,stop_price,tif,status,fill_price,fill_qty,error
```

---

## 7 - Validation and tests

Your agent runs these checks during execution.

### Pre-submission validation

| Check | Command | Pass condition |
|---|---|---|
| CLI installed | `alpaca version` | Exit code 0 |
| Connectivity | `alpaca doctor` | All checks pass |
| Paper endpoint | `alpaca doctor` | `Trading:` line reads `https://paper-api.alpaca.markets` |
| Account active | `alpaca account get` | status=ACTIVE, not blocked |
| Buying power | `alpaca account get --jq '.buying_power'` | Sufficient for order |
| Market open | `alpaca clock` | `is_open=true` (unless extended hours or GTC) |
| Symbol valid and tradable | `alpaca asset get --symbol-or-asset-id X` | `status=active`, `tradable=true` |

### Post-submission validation

| Check | Command | Pass condition |
|---|---|---|
| Order accepted | `alpaca order get --order-id X` | Status != rejected |
| Fill received | Same | filled_qty > 0 |
| Position updated | `alpaca position get --symbol-or-asset-id X` | Reflects new position |

---

## 8 - Disclosures, safety, and data handling

### Disclosures

- **Paper trading only.** This skill operates exclusively in the Alpaca paper-trading environment. No real money is at risk.
- **Not financial advice.** Your agent executes your instructions. It does not provide investment recommendations, market predictions, or trading advice.
- **Paper ≠ live.** Paper fills may differ from live execution due to simplified fill simulation. Do not assume paper results predict live performance.
- **Your responsibility.** You are responsible for the strategies you choose to paper-trade. Your agent is a tool, not an advisor.
- **Full disclosures.** Review Alpaca's disclosures and agreements at [alpaca.markets/disclosures](https://alpaca.markets/disclosures).

> **Important disclosure:** This material is for informational, educational, and research purposes only. It is not investment advice, a recommendation, an offer, or a solicitation to buy or sell securities, options, cryptocurrencies, or any other financial product. All investing and trading involve risk, including possible loss of principal. Paper trading is simulated and may differ from live trading in fills, market impact, liquidity, fees, latency, and other factors. Review Alpaca's disclosures at https://alpaca.markets/disclosures.

### Safety controls

| Control | Implementation |
|---|---|
| Live-trade prevention | Resolved-endpoint check before every submission |
| Confirmation gate | Default ON — explicit yes required |
| Buying-power check | Pre-submission validation |
| Connectivity verification | `alpaca doctor` at session start |
| Error isolation | Failures logged, do not cascade |
| Idempotency | `--client-order-id` prevents duplicates |

### Data handling

- **Local only.** All run data stays in your local workspace under `runs/`.
- **No telemetry.** Your agent does not send trading data to external services beyond the Alpaca API.
- **Credential safety.** API keys are never logged, displayed, or written to files. Profile names are redacted in shared outputs.
- **Audit trail.** Every CLI command and response is saved in `raw/` for your review.

---

## 9 - Anti-patterns

Your agent must **NEVER**:

| Anti-pattern | Why | Correct approach |
|---|---|---|
| Submit against the live endpoint | Real money at risk | Always confirm `alpaca doctor` reports the paper endpoint first |
| Skip confirmation when mode is ON | You lose control | Always honor confirmation preference |
| Modify order params silently | Violates your intent | Re-confirm any parameter changes |
| Give trading advice | Liability, not agent's role | Execute instructions, don't recommend |
| Hard-code CLI flags | Alpha Preview — flags may change between versions | Discover with `--help`, `--help-all`, and `--schema` |
| Pipe output to external `jq` | Adds a dependency the CLI already provides | Use the built-in `--jq` flag |
| Treat `--quiet` as the JSON switch | JSON is the default; `--quiet` only drops warnings, hints, and color | Parse the default output directly |
| Read `pattern_day_trader` or `daytrade_count` | Neither field exists on the Trading API account object | Infer PDT from `multiplier` = `4` |
| Add a retry loop for 429s | The CLI already retries 3x and honors `Retry-After` | Surface the error after its retries fail |
| Run `cancel-all` or `close-all` unprompted | Unscoped — hits orders and positions this session never created | List what will be affected, require explicit confirmation |
| Bypass Alpaca CLI with direct HTTP calls | This is the CLI version | Use `alpaca` commands exclusively |
| Ignore CLI exit codes | Missed errors | Check exit code, capture stderr |
| Proceed after `alpaca doctor` fails | Connectivity not verified | Stop and report the failure |
| Store API keys in run folders | Security risk | Redact all credentials |
| Assume market hours | May be extended/crypto 24/7 | Check `alpaca clock` |
| Submit without buying-power check | Order will be rejected | Validate buying power first |
| Use `--csv` output for programmatic parsing | Less structured than JSON | Parse the default JSON, filtered with `--jq` |

---

## 10 - Related files

| File | Purpose |
|---|---|
| `reference.md` | Detailed reference: order types, TIF, lifecycle, asset classes, errors |

### Companion skills

| Skill | Description |
|---|---|
| `alpaca-trading-backtest` | Historical backtesting via Alpaca CLI — produces signals this skill can execute |
| `alpaca-trading-paper-trading` | Generic implementation-agnostic paper-trading skill |
| `alpaca-trading-paper-trading-mcp` | MCP-server version of this skill |
````

### alpaca-broker-trading-orders

Path: `skills/broker-api/trading-orders/SKILL.md` (10 KB).

````markdown
---
name: alpaca-broker-trading-orders
description: Place and manage orders on behalf of accounts via the Alpaca Broker API — order creation (qty vs notional, fractional shares, order types/TIF/classes), order status lifecycle, replace/cancel, positions, and trading-account buying power. Use when building trading, recurring-invest, or portfolio flows on Alpaca in any language.
---

# Alpaca Broker API — Trading on Behalf of Accounts

Place, modify, cancel, and track orders for an end-user account, and read positions & buying power. The defining feature of Broker API trading: **`account_id` is in the path** — you act *for* a user account, not your own.

> Read `alpaca-broker-integration` first for base URLs and auth (client-credentials Bearer token; legacy Basic still works). (The standalone Trading API uses `/v2/orders` with no account in the path; everything else here transfers.)

## Reference
- Guides: `https://docs.alpaca.markets/docs/orders-at-alpaca`, `https://docs.alpaca.markets/docs/fractional-trading`
- API ref: `https://docs.alpaca.markets/reference/postorder`
- Live schema: `alpaca-docs` MCP → `get-endpoint` title `"Broker API"` path `/v1/trading/accounts/{account_id}/orders`

## 1. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/trading/accounts/{id}/orders` | Create order |
| GET | `/v1/trading/accounts/{id}/orders` | List orders (filter by `status`, `symbols`, `after`…) |
| GET | `/v1/trading/accounts/{id}/orders/{order_id}` | Get order by ID |
| GET | `/v1/trading/accounts/{id}/orders:by_client_order_id?client_order_id=…` | Get by your client ID |
| PATCH | `/v1/trading/accounts/{id}/orders/{order_id}` | Replace (modify) order |
| DELETE | `/v1/trading/accounts/{id}/orders/{order_id}` | Cancel one order (204) |
| DELETE | `/v1/trading/accounts/{id}/orders` | Cancel all (207 Multi-Status) |
| POST | `/v1/trading/accounts/{id}/orders/estimation` | Cost-estimate an order |
| GET / DELETE | `/v1/trading/accounts/{id}/positions[/{symbol_or_asset_id}]` | List / close positions |
| GET | `/v1/trading/accounts/{id}/account` | Trading-account details (buying power etc.) |

## 2. Create-order request

Schema-required: `type` and `time_in_force`. Conditionally required: `symbol`, `side`, and exactly one of `qty`/`notional`.

```json
// notional market buy (dollar-based, fractional)
{ "symbol": "AAPL", "notional": "25.00", "side": "buy", "type": "market", "time_in_force": "day",
  "client_order_id": "your-own-uuid" }

// limit qty sell
{ "symbol": "AAPL", "qty": "3", "side": "sell", "type": "limit", "limit_price": "190.00", "time_in_force": "gtc" }
```

| Field | Values / notes |
|-------|----------------|
| `symbol` | required (except `mleg` multi-leg options) |
| `qty` | decimal **string**, up to **9 dp**; fractionable only for `market`+`day` per the order schema |
| `notional` | decimal **string**, up to **2 dp**. **Mutually exclusive with `qty`** |
| `side` | `buy`, `sell` (plus advanced: `sell_short`, …) |
| `type` | `market`, `limit`, `stop`, `stop_limit`, `trailing_stop` |
| `time_in_force` | `day`, `gtc`, `opg`, `cls`, `ioc`, `fok` |
| `limit_price` / `stop_price` | required for limit/stop variants |
| `trail_price` / `trail_percent` | one required for `trailing_stop` |
| `extended_hours` | bool; only with `type=limit` and TIF `day`/`gtc` |
| `client_order_id` | ≤128 chars; **your idempotency key** (auto-generated if omitted) |
| `order_class` | `simple` (default), `bracket`, `oco`, `oto`, `mleg` |
| `take_profit` / `stop_loss` | `{limit_price}` / `{stop_price, limit_price?}` for bracket/oco/oto |
| `position_intent` | `buy_to_open`, `sell_to_close`, … |

**qty XOR notional (verbatim rule):** pass one or the other — supplying both → `400`. In the response, whichever you didn't use comes back `null`.

## 3. Fractional / notional rules

- **On by default** for all accounts (live + paper).
- Asset must have **`fractionable: true`** (check the Assets API — see `alpaca-broker-market-data`), else `requested asset is not fractionable`.
- **TIF must be `day`** for fractional/notional.
- **Notional** is limited to `market` and `limit` (day); only `limit` for extended hours.
- **No shorting fractional** — all fractional sells are marked long.
- Precision: **2 decimal places for `notional`, 9 for `qty`** (Broker API FAQ, "What is the precision for notional and qty"; the order schema's "2 decimal points" on `qty` is stale). Eligible types: the order schema says fractional `qty` only on `market`+`day`; the Fractional Trading guide also accepts `limit`/`stop`/`stop_limit` at TIF `day` — confirm in sandbox before relying on the wider set.

## 4. Order status lifecycle

`OrderStatus` (the order object's `status`): `new`, `partially_filled`, `filled`, `done_for_day`, `canceled`, `expired`, `replaced`, `pending_cancel`, `pending_replace`, `accepted`, `pending_new`, `accepted_for_bidding`, `stopped`, `rejected`, `suspended`, `calculated`.

> **Order `status` ≠ trade-event `event`.** The order object's `status` is the enum above. The **SSE trade-update stream** reports a *richer* `event` enum that adds operational events with no Broker order status — `trade_bust`, `trade_correct`, `restated`, `order_cancel_rejected`, `order_replace_rejected`. `held` is both: a trade event, and an `OrderStatus` in the **Trading API** enum though not in the Broker one, so don't assume the two enums match. See `alpaca-broker-sse-events`.

**Terminal:** `filled`, `canceled`, `expired`, `rejected` (and `replaced` for the original order). **Everything else is in-flight.**

**Early-state distinctions (these trip people up):**
- `accepted` — received by Alpaca, not yet routed to a venue (common outside market hours).
- `new` — received **and routed to exchanges**; the usual initial live state.
- `pending_new` — routed but not yet accepted for execution (rare).

An order usually reaches `new` directly; `accepted`/`pending_new` are rare intermediates. **Lesson:** treat `new`/`accepted`/`pending_new` as "exists but not done." Persist the order on submit, then update on fill/cancel/reject events — don't block the user waiting for a terminal state synchronously.

## 5. Positions & trading account

**`Position`** key fields: `symbol`, `asset_id`, `qty`, `qty_available` (free of open orders), `side` (`long`/`short`), `avg_entry_price`, `market_value`, `cost_basis`, `unrealized_pl`, `unrealized_plpc`, `current_price`, `change_today`.

**`TradeAccount`** key fields:
- `buying_power` (with margin `multiplier` 1–4), `cash`, `cash_withdrawable`, `equity`, `last_equity`.
- Blockers: `trading_blocked`, `account_blocked`, `transfers_blocked`, `trade_suspended_by_user`.
- `multiplier`, `regt_buying_power`, `non_marginable_buying_power`, `long_market_value`, `initial_margin`, `maintenance_margin`, `sma`.

**Lesson — check buying power before notional orders.** For a "spend $X" UX, read `buying_power`/`cash` first and reject/notify on insufficient funds, rather than letting Alpaca reject the order. Re-read it after every accepted order — each one consumes buying power.

> **PDT/day-trade fields are gone** following FINRA's intraday-margin rule change: `daytrade_count`, `pattern_day_trader`, `daytrading_buying_power` and `bod_dtbp` are absent from the current `TradeAccount` schema, as are the `dtbp_check`/`pdt_check` configurations. Don't code against them.

## 6. Documented gotchas

- **Minimum order value:** every buy order needs a market value of at least **$1** or it's rejected with `422`; sells are exempt.
- **Per-asset-class rules:** options and crypto go through this same endpoint, gated by `asset_class` — crypto rejects `time_in_force: day` (only `gtc`/`ioc`) and allows only `market`/`limit`/`stop_limit`; options allow `day`/`gtc` only. Check the type/TIF matrix in the `OrderType`/`TimeInForce` descriptions at `https://docs.alpaca.markets/reference/createorderforaccount` rather than assuming the equity set.
- **Wash-trade rejection (403):** if a user's two orders could self-cross (opposite sides, crossable prices), Alpaca rejects. Opposing market/stop pairs are always rejected; opposing limits rejected when buy-limit ≥ sell-limit. **Use `bracket`/`oco`/`trailing_stop` for simultaneous take-profit + stop-loss** — they're exempt.
- **Bracket constraints:** requires both `take_profit.limit_price` and `stop_loss.stop_price`; TP must be above SL for a buy; no extended hours; TIF `day`/`gtc`; child legs activate only after the entry fully fills; canceling one cancels the group.
- **Notional orders can't be replaced** — cancel and resubmit (IPO-class notional is the exception). Fractional `qty` can't be changed on replace ("full shares only").
- **Replace ≠ guaranteed:** a `200` from PATCH can still be rejected if the original fills first; watch the trade-updates stream. Can't replace while `accepted`/`pending_new`/`pending_cancel`/`pending_replace`.
- **Cancel semantics:** single cancel → `204`, or `422` if no longer cancelable; cancel-all → `207` per-order results; close-all positions → `207`. Close-single accepts mutually-exclusive `qty` or `percentage`.

## 7. Idempotency & recurring-invest lessons

- **Always set `client_order_id`** from your own transaction record. It's your dedup key and lets you look the order up (`orders:by_client_order_id`) if the create response is lost. Note it dedups *lookup*, not necessarily *replay* — combine it with a local "already-submitted?" guard.
- **Recurring/scheduled buys (lesson):** the robust pattern is — fetch pending invest instructions from your DB → check buying power → place a `notional` `market`/`day` order per instruction → record the returned order → mark the instruction done **only after** a successful create. On insufficient funds, skip this run and surface it; whether to cancel a standing instruction is a product decision. Schedule the batch shortly **before** market open and respect the market clock (`alpaca-broker-market-data`).
- Track fills via the **trade events SSE stream**, not by polling each order — see `alpaca-broker-sse-events`.

**Related skills:** prices/assets/clock → `alpaca-broker-market-data`; fills in real time → `alpaca-broker-sse-events`; rate limits on bulk placement → `alpaca-broker-rate-limits-resilience`; money formatting → `alpaca-broker-money-precision`.
````

## Non-trading skills (summary only)

- **alpaca-trading-backtest** (`skills/trading-api/backtest/SKILL.md`, 16 KB). Takes start date, end date and strategy concept; the agent writes minimal workspace code, fetches data with the Alpaca CLI, and emits trades, diagnostics and reproducibility artifacts. Says it "is not a promise that a strategy will work in live markets." May prepare a paper forward-validation handoff on request. Credential rule: never print the secret key, commit it, or put it in reports.
- **Broker API set** (`account-onboarding`, `funding-transfers`, `journals`, `market-data`, `sse-events`, `reconciliation-idempotency`, `rate-limits-resilience`, `money-precision`, `integration`). Language-agnostic integration references for building on the Broker API. `funding-transfers` and `journals` cover money movement and `account-onboarding` covers KYC, so an agent loading them can drive account-level writes, but the text is written for a developer building a flow, not as an agent safety protocol. Not embedded; see the repo.
