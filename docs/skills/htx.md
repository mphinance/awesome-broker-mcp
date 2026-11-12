# HTX official agent skills (htx-skills-hub)

| | |
|---|---|
| Repo | https://github.com/htx-exchange/htx-skills-hub |
| Commit | `1c04d78d5e37b1ec729c3b151d6cda8081174146` (committed 2026-10-26) |
| License | MIT (`LICENSE`, "Copyright (c) 2026 HTX Skills Hub Contributors"; `package.json` also says MIT) |
| Date scraped | 2026-11-11 |
| Install | `htx-cli skill install <name>` or `htx-cli skill install all` after installing the CLI with `curl -fsSL https://github.com/htx-exchange/htx-skills-hub/releases/latest/download/install.sh \| bash`. Alternative: `npx skills add https://github.com/htx-exchange/htx-skills-hub/skills -d .claude`. One-liner: `curl ... install.sh \| bash -s -- spot-market`. |
| MCP | None. These are CLI skills only. |

Method: shallow clone, read as plain files. No script, installer or CLI from the repo was executed.

## What is in the repo

17 `SKILL.md` files under `skills/htx/` (the README and badge say 16; `ta-master` is on disk but missing from the README catalog). All of them drive a single binary, `htx-cli`. The repo also holds a partial JavaScript source of that CLI (`bin/htx-cli.js`, `src/`), which is what we read to check the guardrails. It is a subset: it implements the public market skills and a handful of account and trading subcommands. The skills document a wider surface (`htx-cli spot call <path> --auth`, `htx-cli futures call ...`) that this source does not contain, so the shipped release binary may differ from the source in the repo. We could not read the release binary.

Spot trades go to `api.huobi.pro`, futures to `api.hbdm.vn` (override with `HTX_HOST_SPOT`, `HTX_HOST_FUTURES`). Signing (HMAC-SHA256, v2) is done by the CLI, not the model.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text and enforcement |
|---|---|---|---|---|
| `spot-market` | Ticker, klines, depth, trades, symbol metadata | `htx-cli spot-market ...` | read, public | None needed |
| `spot-account` | Balances, valuation, history, transfers (spot to USDT-M, COIN-M, sub-account, points) | `htx-cli spot account ...`, `htx-cli spot call /v2/account/transfer --auth` | read plus **live transfers** | "Only proceed after explicit user confirmation." Source CLI: `requireConfirm` needs `--confirm` or env `HTX_CONFIRM_WRITES`. The agent can add the flag itself, so **model-enforced in practice** |
| `spot-trading` | Place, cancel, batch, margin borrow | `htx-cli spot trading place`, `cancel`, `spot call /v1/order/... --auth` | **live** | "MUST display full order ... Wait for explicit manual confirmation." Source CLI: dry run unless `--confirm` or `HTX_CONFIRM_WRITES`. Skill text never mentions `--confirm` |
| `futures-market` | Contract info, klines, depth, index, status | `htx-cli futures-market ...` | read, public | None needed |
| `funding-rate` | Current, batch, history funding | `htx-cli funding-rate ...` | read, public | None needed |
| `oi-tracker` | Open interest snapshot and history | `htx-cli oi-tracker ...` | read, public | None needed |
| `elite-positioning` | Top-trader long/short ratio | `htx-cli elite-positioning ...` | read, public | None needed |
| `liquidation-stream` | Recent liquidation orders | `htx-cli liquidation-stream ...` | read, public | None needed |
| `mark-price` | Mark, premium, basis klines | `htx-cli mark-price ...` | read, public | None needed |
| `settlement` | Settlement records, insurance fund | `htx-cli settlement ...` | read, public | None needed |
| `futures-account` | Balance, positions, leverage tiers, account-type and position-mode switch, master/sub transfers | `htx-cli futures call ... --auth` | read plus **live account writes** | "Display current state and target state, only execute after explicit manual confirmation." Model-enforced |
| `futures-trading` | Open, close, TP/SL, trigger, trailing, leverage change, lightning close (about 50 endpoints) | `htx-cli futures call /v1/swap_cross_order --auth --body ...`, `futures trading place-cross` | **live, leveraged** | 5-step MUST list (margin, liquidation price, "confirm order"). Source CLI: dry run by default. Model passes the flag |
| `technical-analysis` | 51 indicators, 12 candle patterns, cycle indicators, divergences | Local Python (`scripts/indicators.py` etc., per SKILL.md), pulls klines | read | None needed. Instructs running bundled Python scripts |
| `ta-master` | Three-pillar 0-100 composite score | `python scripts/cycle.py`, `python scripts/scoring.py`, inline `python -c` | read | None needed |
| `derivatives-analyst` | Funding, OI, elite ratio, liquidations, basis into one pressure score | The five derivatives skills above | read | None needed |
| `sentiment-analyst` | Fear and Greed plus elite ratio plus breadth | `curl https://api.alternative.me/fng/`, spot-market, elite-positioning | read | One third-party call; no HTX key |
| `market-overview` | Full-market scan, gainers, volume anomalies, sector hints | spot-market, futures-market | read | None needed |

## Guardrails: model-enforced vs code-enforced

**Code-enforced (in the repo's CLI source, `src/commands/`):**

- `spot-trading.js` and `futures-trading.js`: every write goes through `writeOp`. Without `--confirm` (or env `HTX_CONFIRM_WRITES`) it returns the request it would send and sends nothing. This is a real dry-run default and better than most exchange skills.
- `spot-account.js`: transfers call `requireConfirm`, which throws unless `--confirm` or `HTX_CONFIRM_WRITES` is set.
- Request signing is in `src/client/http.js`. The model never builds a signature.

**Why that is still not a human gate:**

1. `--confirm` is an ordinary CLI flag. The agent that wrote the command can append it, and a prior approval for one order carries no binding to the next. No token, no code the user types.
2. `HTX_CONFIRM_WRITES=1` disables the dry run for the whole process, with no per-order check.
3. The skills never tell the agent about `--confirm` or the dry run. They document `htx-cli futures call <path> --auth --body ...`, a generic signed passthrough that is not in the repo source at all, so we cannot say whether the shipped binary dry-runs it.
4. `--json` and the documented command shapes (`htx-cli spot trading place`) differ from the source (`htx-cli spot-trading place`). Expect drift between docs and binary.

**Model-enforced only:** every "MUST display / wait for confirmation" block in `spot-trading`, `futures-trading`, `spot-account` and `futures-account`. Notably, lightning close is "market order, immediate fill, no price protection" and the guidance for it is prose only. Leverage change, account-type switch, position-mode switch, master/sub transfers and point transfers to another UID are all prose-gated.

**Secrets:** the README tells users to `export HTX_API_KEY` / `HTX_SECRET_KEY` (the source reads `HTX_ACCESS_KEY` / `HTX_SECRET_KEY`, so the names disagree), or to run `htx-cli config set-key <AccessKeyId>` and `config set-secret <SecretKey>`. Putting the secret on the command line means it passes through the agent's shell and transcript if an agent runs it. Set keys yourself, outside the agent session, and give the key trade permission only if you want trading. The source we read has no `config` command, so where the managed config is stored is unverified.

**Self-updating or fetched code:** the CLI install is `curl ... | bash`. The README says the installer checks `SHA256SUMS` and supports a signed provenance attestation (`HTX_REQUIRE_ATTESTATION=1`), which is better than most. `htx-cli skill install` writes embedded skill files into `~/.claude/skills/htx/<name>/` (read in `src/installer.js`); it does not fetch at install time. No auto-update logic found.

**Other flags:** `technical-analysis` and `ta-master` tell the agent to run bundled Python scripts and pipe klines through `/tmp` JSON files. Those scripts are not in this repo snapshot (only SKILL.md files ship under `skills/`), so we could not read them.

## Per-skill notes

Read-only skills (`spot-market`, `futures-market`, `funding-rate`, `oi-tracker`, `elite-positioning`, `liquidation-stream`, `mark-price`, `settlement`, `derivatives-analyst`, `sentiment-analyst`, `market-overview`, `technical-analysis`, `ta-master`) say "no API key required" and call only public endpoints. The analysis skills are Layer 2 orchestration: they tell the agent to install the Layer 1 market skills first and combine their output into a score or verdict. `sentiment-analyst` adds a single call to alternative.me.

### spot-account (risk: medium)

Lists accounts, per-currency balance, asset valuation, and transfers. Transfer table covers internal spot/margin/otc moves, `/v2/account/transfer` for spot to `linear-swap`, COIN-M `/v1/futures/transfer`, and `/v1/point/transfer` (to another `toUid`). Needs read permission, trade permission for transfers. Guardrail: show source, destination, currency, amount, then wait. Model-enforced, with the CLI `--confirm` gate described above. Not a trading skill, so not reproduced in full.

### futures-account

Balance, positions (`swap_position_info`), leverage tiers, unified account-type switching. Writes are account-type switch, position-mode switch, master/sub transfers. One safety paragraph, model-enforced. Not reproduced in full.

### spot-trading (risk: high)

Full text below. Key rules: show symbol, side, type, amount, price, estimated value and order book reference; wait for "confirm / yes / place order"; borrow needs rate and risk shown. Cancel-all and batch cancel need affected order counts shown.

~~~~markdown
---
name: htx/spot-trading
version: 2.0.0
description: HTX spot trading — limit / market orders / cancel / modify / order query / margin lending.
auth: true
risk: high
---

# Spot Trading

Place and cancel spot orders, modify and query orders, and use margin lending.

> WARNING: **High-risk write skill**. Before every order / cancel / borrow, the AI Agent must show the user the full parameters (symbol, side, type, price, amount) and obtain explicit manual confirmation.

## Authentication and permissions

- API Key needs **trade** permission
- Some query endpoints only need **read** permission
- API Key is used locally only and never uploaded

## Endpoint catalog (11)

### Place / cancel orders (core write operations)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | POST | `/v1/order/orders/place` | Place a single order (limit / market / TP-SL / IOC / FOK) |
| 2 | POST | `/v1/order/batch-orders` | Batch place orders (max 10) |
| 3 | POST | `/v1/order/orders/{order-id}/submitcancel` | Cancel by order ID |
| 4 | POST | `/v1/order/orders/submitCancelClientOrder` | Cancel by client-order-id |
| 5 | POST | `/v1/order/orders/batchcancel` | Batch cancel (by order ID list) |
| 6 | POST | `/v1/order/orders/batchCancelOpenOrders` | Cancel all open orders (by symbol) |

### Order query (read)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 7 | GET | `/v1/order/openOrders` | Current open orders |
| 8 | GET | `/v1/order/orders/{order-id}` | Single-order detail |
| 9 | GET | `/v1/order/orders` | Historical orders (by time window) |
| 10 | GET | `/v1/order/matchresults` | Historical trade detail |

### Margin lending

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 11 | POST | `/v1/margin/orders` | Borrow margin funds (write) |

## Order parameters (core)

```json
{
  "account-id": "<spot-account-id>",
  "symbol": "btcusdt",
  "type": "buy-limit | sell-limit | buy-market | sell-market | buy-ioc | sell-ioc | buy-limit-fok | sell-limit-fok",
  "amount": "0.001",
  "price": "65000.00",
  "client-order-id": "<optional 32 chars>",
  "source": "spot-api"
}
```

- `buy-limit` / `sell-limit`: limit order, must include `price`
- `buy-market` / `sell-market`: market order. **Buy** `amount` = USDT amount; **sell** `amount` = base currency quantity
- `buy-ioc` / `sell-ioc`: immediate-or-cancel; cancels the remainder
- `buy-limit-fok` / `sell-limit-fok`: fill-or-kill

## Workflow patterns

### Limit buy order

```bash
htx-cli spot trading place \
  --account-id <id> \
  --symbol btcusdt --type buy-limit \
  --price 65000 --amount 0.001 \
  --json
```

### Market buy 100 USDT of BTC

```bash
# market buy: amount = quote currency (USDT) amount
htx-cli spot trading place \
  --account-id <id> \
  --symbol btcusdt --type buy-market \
  --amount 100 \
  --json
```

### Cancel order

```bash
htx-cli spot trading cancel <order-id> --json
```

### Cancel all BTC/USDT open orders

```bash
htx-cli spot call /v1/order/orders/batchCancelOpenOrders \
  --method POST --auth \
  --body '{"account-id":"<id>","symbol":"btcusdt"}' --json
```

### Query current open orders

```bash
htx-cli spot trading open-orders --symbol btcusdt --json
```

## Safety constraints (must read)

Before every order, the AI Agent **MUST**:

1. Display the full order: symbol, side (buy/sell), type (limit/market), amount, limit price, estimated trade value, current order book price (reference)
2. Wait for explicit manual confirmation ("confirm / yes / place order" etc.)
3. Only call the API after confirmation is received

For every cancel:
- Single cancel: show order ID + remaining amount + price
- Batch cancel: show number of affected orders + symbols involved

For every borrow:
- Show currency, amount, current rate, potential risks
- Strongly recommend first checking spot account balance to confirm whether borrowing is necessary

## Error handling

- `account-frozen` — account frozen, halt operation
- `order-amountmin-error` — amount below minimum order size; check `min-order-amt` via `htx-cli spot-market symbols`
- `order-pricemin-error` — price precision error; check `price-precision`
- Some errors are due to rate limiting: max ~10 orders/s; on failure, back off 1s and retry

## Installation

```bash
curl -fsSL https://github.com/htx-exchange/htx-skills-hub/releases/latest/download/install.sh | bash -s -- spot-trading
```

## Related docs

- HTX spot trading API: https://huobiapi.github.io/docs/spot/v1/cn/#orders
~~~~

### futures-trading (risk: high)

Full text below. Key rules: show margin, mark price deviation, liquidation price, available margin; warn above 5x leverage; wait for "confirm order"; lightning close and leverage change get extra display requirements.

~~~~markdown
---
name: htx/futures-trading
version: 2.0.0
description: HTX USDT-M perpetual futures order management — open / close / TP/SL / trigger orders / modify / cancel.
auth: true
risk: high
---

# Futures Trading

Place, cancel, modify orders, set TP/SL and trigger orders, and close positions on USDT-M perpetual futures.

> WARNING: **Extremely high-risk write skill**. Perpetual futures use leverage; an erroneous order can cause rapid loss or liquidation. Every action must require manual confirmation before execution.

## Authentication and permissions

- API Key needs **futures-trade** permission
- Some query endpoints only need **futures-read** permission

## Endpoint overview (grouped by function, ~50 endpoints)

> Path base `/linear-swap-api`. `cross_` prefix = cross-margin; no prefix = isolated.

### 1. Place order — write

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/swap_order` | Isolated single order |
| POST | `/v1/swap_cross_order` | Cross-margin single order |
| POST | `/v1/swap_batchorder` | Isolated batch orders (max 10) |
| POST | `/v1/swap_cross_batchorder` | Cross-margin batch orders |

### 2. Cancel — write

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/swap_cancel` | Isolated single cancel |
| POST | `/v1/swap_cross_cancel` | Cross-margin single cancel |
| POST | `/v1/swap_cancelall` | Isolated cancel all |
| POST | `/v1/swap_cross_cancelall` | Cross-margin cancel all |

### 3. Modify — write

| Method | Path |
|--------|------|
| POST | `/v1/swap_switch_lever_rate` (change leverage) |
| POST | `/v1/swap_cross_switch_lever_rate` |

### 4. TP/SL / trailing stop — write

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/swap_tpsl_order` | Isolated TP/SL |
| POST | `/v1/swap_cross_tpsl_order` | Cross-margin TP/SL |
| POST | `/v1/swap_tpsl_cancel` | Cancel TP/SL |
| POST | `/v1/swap_cross_tpsl_cancel` | Cancel cross-margin TP/SL |
| POST | `/v1/swap_track_order` | Trailing stop order |
| POST | `/v1/swap_cross_track_order` | Cross-margin trailing stop |

### 5. Trigger orders — write

| Method | Path |
|--------|------|
| POST | `/v1/swap_trigger_order` |
| POST | `/v1/swap_cross_trigger_order` |
| POST | `/v1/swap_trigger_cancel` |
| POST | `/v1/swap_cross_trigger_cancel` |
| POST | `/v1/swap_trigger_cancelall` |
| POST | `/v1/swap_cross_trigger_cancelall` |

### 6. Lightning close — write

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/swap_lightning_close_position` | Isolated lightning close |
| POST | `/v1/swap_cross_lightning_close_position` | Cross-margin lightning close |

### 7. Order query (read)

| Method | Path |
|--------|------|
| POST | `/v1/swap_openorders` (isolated open orders) |
| POST | `/v1/swap_cross_openorders` (cross-margin open orders) |
| POST | `/v1/swap_order_info` (single order info) |
| POST | `/v1/swap_cross_order_info` |
| POST | `/v1/swap_order_detail` (order detail) |
| POST | `/v1/swap_cross_order_detail` |
| POST | `/v1/swap_hisorders` (historical orders) |
| POST | `/v1/swap_cross_hisorders` |
| POST | `/v1/swap_matchresults` (trade detail) |
| POST | `/v1/swap_cross_matchresults` |
| POST | `/v1/swap_hisorders_exact` (exact query) |
| POST | `/v1/swap_cross_hisorders_exact` |
| POST | `/v3/swap_hisorders_exact` |
| POST | `/v3/swap_cross_hisorders_exact` |
| POST | `/v3/swap_matchresults_exact` |
| POST | `/v3/swap_cross_matchresults_exact` |
| POST | `/v1/swap_tpsl_openorders` |
| POST | `/v1/swap_cross_tpsl_openorders` |
| POST | `/v1/swap_tpsl_hisorders` |
| POST | `/v1/swap_cross_tpsl_hisorders` |
| POST | `/v1/swap_relation_tpsl_order` |

## Order parameters (core)

```json
{
  "contract_code": "BTC-USDT",
  "direction": "buy | sell",
  "offset": "open | close",
  "lever_rate": 10,
  "order_price_type": "limit | post_only | optimal_5 | optimal_10 | optimal_20 | ioc | fok | opponent | lightning",
  "price": "65000",
  "volume": 1,
  "client_order_id": <int64 optional>,
  "tp_trigger_price": "70000",  
  "tp_order_price": "70100",
  "sl_trigger_price": "62000",
  "sl_order_price": "61900"
}
```

- `direction + offset` combinations:
  - `buy + open` = open long
  - `sell + open` = open short
  - `buy + close` = close short
  - `sell + close` = close long
- `volume` unit: **contracts** (`BTC-USDT` 1 contract = 0.001 BTC; check `contract_size`)

## Workflow patterns

### Cross-margin BTC perpetual 10x open long 0.1 BTC

```bash
# 1. First check contract_size: BTC-USDT = 0.001 BTC per contract
htx-cli futures-market contract-info -p contract_code=BTC-USDT
# 0.1 BTC = 100 contracts

# 2. Place order (open long)
htx-cli futures call /v1/swap_cross_order --auth \
  --body '{
    "contract_code": "BTC-USDT",
    "direction": "buy",
    "offset": "open",
    "lever_rate": 10,
    "order_price_type": "optimal_5",
    "volume": 100
  }' --json
```

### Place TP and SL together (cross-margin)

```bash
htx-cli futures call /v1/swap_cross_tpsl_order --auth \
  --body '{
    "contract_code": "BTC-USDT",
    "direction": "sell",
    "tp_trigger_price": "70000",
    "tp_order_price": "70100",
    "tp_order_price_type": "limit",
    "sl_trigger_price": "62000",
    "sl_order_price": "61900",
    "sl_order_price_type": "limit",
    "volume": 100
  }' --json
```

### Close all SOL-USDT positions

```bash
# Lightning close (market order)
htx-cli futures call /v1/swap_cross_lightning_close_position --auth \
  --body '{
    "contract_code": "SOL-USDT",
    "direction": "sell"
  }' --json
```

### Cancel all BTC-USDT open orders

```bash
htx-cli futures call /v1/swap_cross_cancelall --auth \
  --body '{"contract_code":"BTC-USDT"}' --json
```

## Safety constraints (must read)

Before every order, the AI Agent **MUST**:

1. Calculate and display:
   - Contract / direction / leverage / contracts / underlying quantity (contracts × contract_size) / order price
   - Estimated margin required
   - Current mark price + deviation from limit price
   - Liquidation price (if computable)
2. Warn about risk: leverage above 5x must explicitly note "high leverage = high liquidation risk"
3. Display the account's current available margin (call futures-account)
4. Wait for the user to explicitly say "confirm order"
5. Only execute after confirmation

For every close / lightning close:
- Display current position size, cost basis, current PnL
- Confirm whether it is "close all" or "partial close"
- Lightning close = market order, immediate fill, no price protection

For every leverage change:
- Display current leverage → target leverage
- Check whether positions / open orders will be impacted
- Warn about risk (higher leverage = closer liquidation price)

## Error codes

- `position-empty` — no position, cannot close
- `volume-precision-error` — contracts must be integer
- `lever-rate-too-high` — exceeds the contract's leverage tier cap
- `available-margin-insufficient` — insufficient margin; transfer in more USDT or lower leverage
- Rate limit: roughly max 30 orders/cancels per second

## Installation

```bash
curl -fsSL https://github.com/htx-exchange/htx-skills-hub/releases/latest/download/install.sh | bash -s -- futures-trading
```

## Related docs

- HTX perpetual futures API: https://huobiapi.github.io/docs/usdt_swap/v1/cn/
~~~~
