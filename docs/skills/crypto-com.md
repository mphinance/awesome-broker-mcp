# Crypto.com agent skills: cdcx-cli (13 skills + local MCP server) and crypto-agent-trading (2 skills)

| | cdcx-cli | crypto-agent-trading |
|---|---|---|
| Repo | https://github.com/crypto-com/cdcx-cli | https://github.com/crypto-com/crypto-agent-trading |
| Commit | `4d1112e86b061f8bdd8a6d92c3fd9aeb55b3b7bc` (committed 2026-06-18; plugin and Cargo version 1.2.6) | `92e80c5527312d0acdf769f16511ba3c6db1f2fe` (committed 2026-08-29) |
| License | MIT OR Apache-2.0 (`LICENSE-MIT`, `LICENSE-APACHE`; plugin manifest says "MIT OR Apache-2.0") | Apache-2.0 (root `LICENSE`). `crypto-com-app` frontmatter says Apache-2.0. `crypto-com-exchange` frontmatter and README say MIT, but no MIT license file exists in that directory (README lists a `LICENSE.md` that is not in the tree), so the root Apache-2.0 file is the only grant on disk. |
| Date scraped | 2026-11-11 | 2026-11-11 |
| Install (skills + MCP) | `claude plugin marketplace add crypto-com/cdcx-cli` then `claude plugin install cdcx-cli@cdcx-cli` | `npx skills add crypto-com/crypto-agent-trading/crypto-com-app -g -y` (README shows this form for the App skill; the Exchange skill is copied by hand into the agent's skills dir) |
| Install (binary) | `curl -sSfL https://raw.githubusercontent.com/crypto-com/cdcx-cli/main/install.sh \| sh`, or `cargo install --git https://github.com/crypto-com/cdcx-cli.git --bin cdcx`, or `npx -y @cryptocom/cdcx-cli@latest mcp` (what the plugin manifest runs, unpinned `@latest`) | The Exchange skill needs `cdcx` (above); the App skill needs Node 18+ and `npx tsx` |

Method: shallow clones read as plain files. No script, installer, hook or CLI from either repo was executed. Rust sources were read, not built.

Both repos carry OSI licenses, so the trading `SKILL.md` files are reproduced in full below, unmodified, at the commits above. Copyright stays with Crypto.com.

Capability key: read (data only), paper (local simulation), live (real orders or money movement).

## Part 1: cdcx-cli

cdcx is a Rust CLI, MCP server and TUI for the Crypto.com Exchange API. The plugin (`plugins/cdcx-cli`) bundles 13 skills plus a local stdio MCP server (`npx -y @cryptocom/cdcx-cli@latest mcp`). The skills drive either the MCP tools (`cdcx_<group>_<command>`) or shell calls to `cdcx`.

### Plugin manifest facts (secrets and files)

- `userConfig` asks for `api_key` and `api_secret`, both marked `"sensitive": true`, and injects them as `CDC_API_KEY` and `CDC_API_SECRET` into the MCP server env. Blank means market-data only.
- Resolution order in the code and SECURITY.md: env `CDCX_API_KEY`/`CDCX_API_SECRET`, then legacy `CDC_*`, then `~/.config/cdcx/config.toml` (profile). The binary refuses a config file or directory that is group or world accessible (`check_config_permissions`, Unix and Windows variants), but only when a non-market service group is enabled.
- The `cdcx-auth-setup` skill says `--api-key` / `--api-secret` flags are first in the resolution order. SECURITY.md says there is "no `--api-key` or `--api-secret` CLI flag by design", and `main.rs` has no such flag. The skill text is wrong; the code and SECURITY.md agree with each other.
- Files the tooling writes: `~/.config/cdcx/config.toml` (credentials, mode 600), `~/.config/cdcx/mcp.toml` (service groups, `allow_dangerous`), `~/.config/cdcx/tui.toml`, `~/.local/share/cdcx/paper/paper_account.json` (paper state). SECURITY.md states the only outbound hosts are `api.crypto.com`, `stream.crypto.com`, the UAT hosts, plus a schema fetch from the exchange docs once per 24h; "No telemetry" is a prose claim, not verified here.
- Default environment is production (`Environment::resolve(...).unwrap_or(Environment::Production)` in `dispatch.rs`). UAT is opt-in by profile or `CDCX_PROFILE`.

### Summary table (13 skills)

| Skill | What it does | Tools / CLI called | Capability | Guardrail text (short verbatim) |
|---|---|---|---|---|
| `cdcx-market-intel` | Prices, order book, candles, trades, instrument tick sizes | `cdcx_market_*`, `cdcx market ...` | read | "All tools are read-only (no auth required, no acknowledgement needed)." |
| `cdcx-portfolio-intel` | Balances, positions, P&L, sub-accounts, fee rates, history | `cdcx_account_*`, `cdcx history ...` | read, plus `subaccount-transfer` (live, mutate tier) | "`subaccount-transfer` moves real funds" (treated as mutate; `acknowledged=true` in MCP mode) |
| `cdcx-check-balance` | Verify credentials, show balance, gate on "available > X" | `cdcx account info`, `cdcx account summary` | read | "no acknowledgement required in MCP mode" |
| `cdcx-auth-setup` | Credential wizard, env vars, profiles, UAT vs production | `cdcx setup`, `cdcx --profile`, `--env` | read (writes secrets to disk) | "Must be mode 600 - cdcx refuses to read world-readable credential files." |
| `cdcx-autonomy-levels` | Four autonomy levels (read-only, paper, supervised live, autonomous) mapped to service groups and `--allow-dangerous` | `cdcx mcp config --enable/--allow-dangerous/--reset` | config of live capability | "an autonomous agent will pass it automatically without a human prompt" |
| `cdcx-execution` | Place, amend, cancel, batch, close-position, cancel-all | `cdcx_trade_order`, `_amend`, `_cancel`, `_cancel_all`, `_order_list`, `_cancel_list`, `_close_position` | live | "Always use `--dry-run` first to preview the request body." |
| `cdcx-place-limit-order` | End-to-end limit order: preflight, dry-run, place, monitor, amend, cancel, ladder | `cdcx trade order/amend/cancel`, `cdcx account summary`, `cdcx market instruments` | live | "Preflight (mandatory before going live)" |
| `cdcx-advanced` | OCO, OTO, OTOCO brackets, cancel by list id | `cdcx_advanced_*` | live | "All placement commands are tier `mutate`." |
| `cdcx-isolated-margin` | Isolated-margin orders on equity/RWA perps, margin transfers, leverage | `cdcx trade order --exec-inst ISOLATED_MARGIN`, `cdcx margin transfer/leverage` | live | "Always dry-run first when moving funds" |
| `cdcx-wallet-ops` | Deposit addresses, networks, withdrawals, history | `cdcx_funding_*`, `cdcx wallet withdraw` | live (funds leave the exchange) | "Tier `dangerous`: MCP server refuses the call unless started with `--allow-dangerous`." |
| `cdcx-paper-strategy` | Local paper trading against live prices | `cdcx paper init/buy/sell/positions/balance/history/reset` | paper (CLI only, no MCP tools) | "CLI-only. Paper trading has no MCP tools" |
| `recipe-morning-brief` | Daily market and portfolio briefing | market, account, trade open-orders | read | none beyond tier notes |
| `recipe-emergency-flatten` | Cancel all orders, close every position at market, sweep advanced orders | `cdcx trade cancel-all --yes`, `cdcx advanced cancel-all --yes`, `cdcx trade close-position ... --yes` | live (dangerous tier) | "This is a destructive workflow. Only run when the user asks for it explicitly." |

### How the 4-tier safety model is enforced: code versus prose

Source: `crates/cdcx-core/src/safety.rs`, `crates/cdcx-cli/src/mcp/gating.rs`, `server.rs`, `dispatch.rs`, `crates/cdcx-core/src/schema.rs`. Read statically, not run.

**Enforced in code**

1. Classification is a hardcoded match in `SafetyTier::from_method`. `public/*` is Read. Five methods are Dangerous: `private/cancel-all-orders`, `private/advanced/cancel-all-orders`, `private/create-withdrawal`, `private/fiat/fiat-create-withdraw`, `private/bot/terminate-trading-bot`. Twenty-nine named methods are Mutate (orders, amends, cancels, OCO/OTO/OTOCO, leverage and settings changes, isolated margin transfer and leverage, stake/unstake/convert, subaccount transfer, bot create/update/pause/resume). Every other `private/*` method falls through to SensitiveRead. `schema.rs` stamps each endpoint's `safety_tier` from this function, so the tier shown to the agent matches the gate.
2. MCP gating runs in `call_tool` before dispatch: `check_mcp_safety` then `check_acknowledged`. Mutate needs a boolean `acknowledged: true` in the arguments (a non-boolean is rejected). Dangerous needs `acknowledged: true` AND the server started with `allow_dangerous`; otherwise the call returns `INVALID_PARAMS`. For mutate and dangerous tools, `acknowledged` is added to the tool's input schema as a required field (`mcp/tools.rs`). Unit tests cover each branch.
3. `allow_dangerous` is read once at server start (flag, else `~/.config/cdcx/mcp.toml`, default false). The model cannot change it through MCP.
4. Default exposure is the `market` group only. Credentials are not even loaded unless a non-market group is enabled (`needs_auth` in `run_mcp`).
5. Orders placed through MCP are stamped with a `cx2-` origin prefix so exchange-side records can tell agent orders from CLI/TUI orders (`cdcx-core::origin`).
6. Payload sanitizing (`validate_json_payload`) rejects path traversal, embedded query strings, double encoding and control characters in parameters, on both MCP and CLI paths.
7. `--dry-run` is code: `dry_run_output` returns `{"dry_run": true, "method", "params"}` and skips the request.

**Prose only, or weaker than the prose says**

1. `acknowledged` is a self-attestation. It is a field in the model's own tool call, with no out-of-band human channel. The skill admits this: "the host MUST echo the intent to the human and only pass `acknowledged: true` once approved" is an instruction to the host, and at Level 3 "an autonomous agent will pass it automatically".
2. Service-group hiding is list-only. `list_tools` filters by enabled groups, but `call_tool` resolves a tool name against the full schema registry and never checks `server.service_groups` (grep of `server.rs`: `service_groups` appears only in the struct, constructor, getter and `list_tools`). A model that guesses `cdcx_trade_order` can call it with only `account` enabled, provided credentials were loaded, and is then gated only by `acknowledged`. The market-only default is saved by the missing API client, not by a group check.
3. The CLI path has no gate for agents. `should_prompt` returns false unless output format is Table, stderr is a TTY, and neither `--yes` nor `--dry-run` is set. JSON is the default format and every skill passes `-o json`, so `cdcx wallet withdraw`, `cdcx trade cancel-all` and `cdcx trade order` run with no prompt and no `--allow-dangerous`. The skill text "CLI prompts unless `--yes`" (`cdcx-execution`, `cdcx-wallet-ops`) is false in JSON mode. `recipe-emergency-flatten` passes `--yes` anyway.
4. `--allow-dangerous` is not a lock against an agent with shell access. It lives in a plain file (`cdcx mcp config --allow-dangerous` writes `mcp.toml`), and the same agent can edit config and enable groups for the next server start.
5. Fail-open default: unlisted private methods are SensitiveRead and run with no acknowledgement. The unit test only asserts they are not Read. `agents/tool-catalog.json` lists five dangerous entries, three of which (`private/create-fiat-withdrawal`, `private/cancel-all-oto-orders`, `private/cancel-all-oco-orders`) are not in `safety.rs`; whether those method names exist on the live API was not verified, but if they do they would classify as sensitive_read.
6. `cdcx-autonomy-levels` says dangerous tools are "Refused unless server was started `--allow-dangerous`" and drops the `acknowledged` requirement the code adds.
7. Exchange-side controls are not enforced by cdcx and the skills only describe them: withdrawal address whitelist ("Withdrawals only go to whitelisted addresses."), IP allowlist, key permission scopes. SECURITY.md: "`cdcx` cannot enforce these for you."
8. No position size, notional or symbol limits exist anywhere in cdcx. Risk limits are the exchange's.
9. `cdcx-place-limit-order` calls its preflight "mandatory" but nothing enforces it.

### Per-skill notes

**Read-only skills** (`cdcx-market-intel`, `cdcx-portfolio-intel`, `cdcx-check-balance`, `recipe-morning-brief`): command cheat-sheets for market, account and history endpoints. They only touch secrets via the already-configured credentials. `cdcx-portfolio-intel` documents `account subaccount-transfer`, a real fund move tiered Mutate. Full text omitted because they are not order-capable.

**`cdcx-auth-setup`** (touches secrets and files): covers `cdcx setup` (writes `~/.config/cdcx/config.toml` mode 600), env vars, profiles, `--env uat|production`. Contains the false `--api-key` flag claim noted above. Full text omitted: not a trading skill.

The eight order-capable or order-adjacent skills follow in full.

### Full SKILL.md: cdcx-autonomy-levels (MIT OR Apache-2.0)

Mechanism and config skill. Mutates `~/.config/cdcx/mcp.toml` through `cdcx mcp config`.

~~~~markdown
---
name: cdcx-autonomy-levels
description: Progressive agent autonomy — from read-only to fully autonomous. Pick the lowest level that gets the job done.
---

# Autonomy Levels

## Philosophy

Agents should operate at the lowest autonomy level that accomplishes their task. Each level upward trades human oversight for agent independence.

## Safety Tiers (the underlying mechanism)

Every cdcx MCP tool is classified into one of four tiers:

| Tier             | Agent Behaviour                                      | Example                            |
|------------------|------------------------------------------------------|------------------------------------|
| `read`           | Runs freely, no acknowledgement                      | `cdcx_market_ticker`               |
| `sensitive_read` | Runs freely, no acknowledgement                      | `cdcx_account_summary`             |
| `mutate`         | Requires `acknowledged: true` in tool arguments      | `cdcx_trade_order`                 |
| `dangerous`      | Refused unless server was started `--allow-dangerous`| `cdcx_trade_cancel_all`, `cdcx_funding_withdraw` |

## Level 0 — Read-only

Agent can observe the market but cannot touch the account.

```bash
cdcx mcp config --reset   # ensures only market is enabled
```

Use for: market research agents, price alerts, chart commentary.

## Level 1 — Paper

Agent can read live market data plus read authenticated account info; any actual trading is paper-only and handled CLI-side (not via MCP).

```bash
cdcx mcp config --enable account
```

Pair the MCP server with shell access to `cdcx paper` for simulated execution. Paper has no MCP tools; execution stays outside the agent's tool surface.

Use for: strategy research with real account context, backtest harnesses.

## Level 2 — Supervised Live

Agent can place and cancel real orders, but every mutation requires explicit acknowledgement from the host application (human-in-the-loop).

```bash
cdcx mcp config --enable account,trade,advanced
```

The agent calls `cdcx_trade_order`; the host MUST echo the intent to the human and only pass `acknowledged: true` once approved. Dangerous tools (`cancel-all`, `withdraw`) are refused at the server since `allow_dangerous` is not set.

Use for: semi-automated trading with human oversight, production with guardrails.

## Level 3 — Autonomous

Agent executes anything without per-call confirmation. Dangerous tier is available.

```bash
cdcx mcp config --enable account,trade,advanced,funding
cdcx mcp config --allow-dangerous
```

Even at level 3, `mutate` tools still require `acknowledged: true` in the tool arguments — but an autonomous agent will pass it automatically without a human prompt. `--allow-dangerous` additionally unlocks cancel-all and withdrawals.

Use for: fully automated strategies with external risk controls (position limits, drawdown circuit breakers, monitoring alerts). Rare in production.

## Promotion Criteria

| From → To | Requirement |
|-----------|-------------|
| 0 → 1 | Agent correctly interprets market data, no hallucinated instruments |
| 1 → 2 | Strategy is profitable or sound on paper; agent handles API errors gracefully |
| 2 → 3 | Agent has operated supervised without unexpected actions for a meaningful period |

## Service Group Reference

Valid MCP service groups: `market`, `account`, `trade`, `advanced`, `margin`, `staking`, `funding`, `fiat`, `otc`, `stream`.

- `account` also exposes `history` (orders/trades/transactions)
- `funding` maps to the `wallet` CLI group (deposit/withdraw/networks)
- `paper` is **not** an MCP group — paper trading is CLI-only
- `cdcx mcp config --enable all` is a shortcut to enable everything

## Notes

- Withdrawals (`funding withdraw`) should only be unlocked at Level 3 and only with `--allow-dangerous`; they are the highest-risk action available
- You can run multiple cdcx MCP servers side by side with different autonomy levels (one agent at level 1, another at level 2)
- `allow_dangerous` only affects the dangerous tier. Mutate tools always need `acknowledged: true` regardless
~~~~

### Full SKILL.md: cdcx-execution (MIT OR Apache-2.0)

~~~~markdown
---
name: cdcx-execution
description: Order placement and management — place, amend, cancel, close-position. Safety-first with dry-run and preflight checks.
---

# Order Execution

## When to Use

- Place a LIMIT or MARKET order
- Amend price or quantity of a live order
- Cancel one or many open orders
- Close an open derivatives position
- Batch order placement

Requires authentication.

## Safety Model

Every order command lives in one of two tiers:

| Tier | Commands | Behaviour |
|------|----------|-----------|
| `mutate` | `order`, `amend`, `cancel`, `order-list`, `cancel-list`, `close-position` | Requires `acknowledged=true` in MCP mode; CLI prompts unless `--yes` |
| `dangerous` | `cancel-all` | Requires `--allow-dangerous` on the MCP server |

Always use `--dry-run` first to preview the request body.

## Tools Used

| Tool                          | Purpose                              | Tier      |
|-------------------------------|--------------------------------------|-----------|
| cdcx_trade_order              | Place a new BUY or SELL              | mutate    |
| cdcx_trade_amend              | Amend price/quantity of open order   | mutate    |
| cdcx_trade_cancel             | Cancel a single order                | mutate    |
| cdcx_trade_cancel_all         | Cancel every order                   | dangerous |
| cdcx_trade_order_list         | Place up to 10 orders in one call    | mutate    |
| cdcx_trade_cancel_list        | Cancel up to 10 orders in one call   | mutate    |
| cdcx_trade_close_position     | Close an open position (async)       | mutate    |
| cdcx_trade_open_orders        | List open orders                     | sensitive_read |
| cdcx_trade_order_detail       | Lookup by order_id or client_oid     | sensitive_read |

## Workflow

### Place a Limit Order (preferred path)

```
# 1. Preflight — verify funds and current price
cdcx account summary -o json
cdcx market ticker BTC_USDT -o json

# 2. Preview
cdcx trade order BUY BTC_USDT 0.01 \
    --type LIMIT --price 50000 \
    --dry-run -o json

# 3. Place
cdcx trade order BUY BTC_USDT 0.01 \
    --type LIMIT --price 50000 \
    --client-oid my-buy-001 \
    -o json

# 4. Confirm
cdcx trade order-detail --client-oid my-buy-001 -o json
```

Positional args: `<side> <instrument> <quantity>`. Side is `BUY` or `SELL`.

### Market Order

```
cdcx trade order BUY BTC_USDT 0.01 --type MARKET -o json
```

For MARKET BUYs you can alternatively use `--notional` to spend a fixed USDT amount: `cdcx trade order BUY BTC_USDT --type MARKET --notional 500`.

### Amend (Price / Quantity)

```
cdcx trade amend \
    --order-id 123456789 \
    --new-price 51000 \
    --new-quantity 0.01 \
    -o json
```

Both `--new-price` and `--new-quantity` are required — re-submit the original value for the field you don't want to change.

### Cancel a Single Order

```
cdcx trade cancel --order-id 123456789 -o json
# or
cdcx trade cancel --client-oid my-buy-001 -o json
```

### Cancel All (dangerous)

```
cdcx trade cancel-all BTC_USDT -o json      # Per-instrument
cdcx trade cancel-all -o json                # Every instrument — extreme caution
```

Omitting the instrument cancels everything account-wide. MCP mode rejects this unless the server was started with `--allow-dangerous`.

### Close a Position

```
cdcx account positions BTCUSD-PERP -o json   # Find the position
cdcx trade close-position BTCUSD-PERP --type MARKET -o json
```

`--type MARKET` closes at market. `--type LIMIT --price <p>` closes with a working limit. `--quantity <q>` closes partially.

### Batch Orders

```
cdcx trade order-list --order-list '[
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"49000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"48000","quantity":"0.01"}
]' -o json
```

Up to 10 orders per call. Use `cdcx trade cancel-list` with matching IDs to revert.

### List Open Orders

```
cdcx trade open-orders BTC_USDT -o json      # Per-instrument
cdcx trade open-orders -o json                # All instruments
```

## Notes

- Always supply a `--client-oid` (≤36 chars) for correlation between your code and exchange records
- `--dry-run` is free — use it before every live order while the strategy is new
- The API rejects prices that don't match `price_tick_size` and quantities that don't match `quantity_tick_size` — get these from `cdcx market instruments`
- `close-position` is async: the reply is an ack, not a fill. Verify with `cdcx account positions` afterwards
- Historical fills live under `cdcx history trades`, not under `trade`
~~~~

### Full SKILL.md: cdcx-place-limit-order (MIT OR Apache-2.0)

~~~~markdown
---
name: cdcx-place-limit-order
description: End-to-end limit order workflow with preflight checks, dry-run, placement, monitoring, amend, and cancel.
---

# Place Limit Order

## When to Use

- Patient entry at a specific price
- Split a large order into laddered rungs
- Anchor a position before attaching stop/take-profit legs

Requires authentication. Order placement is tier `mutate`.

## The Command

```
cdcx trade order <SIDE> <INSTRUMENT> <QUANTITY> \
    --type LIMIT --price <PRICE> \
    [--time-in-force GOOD_TILL_CANCEL|FILL_OR_KILL|IMMEDIATE_OR_CANCEL|POST_ONLY] \
    [--client-oid <ID>] \
    [--exec-inst POST_ONLY|REDUCE_ONLY|SMART_POST_ONLY|ISOLATED_MARGIN]
```

Positional args: `<side> <instrument_name> <quantity>`. Side is `BUY` or `SELL`. Omitting `--type` defaults to `MARKET`.

## Preflight (mandatory before going live)

```
# 1. Verify auth
cdcx account info -o json > /dev/null

# 2. Cash check
cdcx account summary -o json | \
    jq -r '.data.total_available_balance'

# 3. Instrument is tradable + get tick sizes
cdcx market instruments -o json | \
    jq '.data.data[] | select(.symbol=="BTC_USDT") |
        {symbol, price_tick_size, qty_tick_size, min_qty, max_qty, tradable}'

# 4. Current market context
cdcx market ticker BTC_USDT -o json | \
    jq '.data[0] | {last:.a, bid:.b, ask:.k, high:.h, low:.l}'
cdcx market book BTC_USDT --depth 10 -o json
```

## Dry-Run (free preview)

```
cdcx trade order BUY BTC_USDT 0.1 \
    --type LIMIT --price 50000 \
    --client-oid buy-btc-$(date +%s) \
    --dry-run -o json
```

`--dry-run` prints the signed request body without sending it. Inspect to confirm every field is correct.

## Place

```
cdcx trade order BUY BTC_USDT 0.1 \
    --type LIMIT --price 50000 \
    --time-in-force GOOD_TILL_CANCEL \
    --client-oid buy-btc-2026-04-17 \
    -o json
```

Response includes `order_id`. Store both `order_id` and your `client_oid` — either can be used to look up or cancel.

## Monitor

```
# List open orders for this instrument
cdcx trade open-orders BTC_USDT -o json

# Get full detail for one
cdcx trade order-detail <ORDER_ID> -o json
# or
cdcx trade order-detail --client-oid buy-btc-2026-04-17 -o json
```

## Amend (reprice)

```
cdcx trade amend \
    --order-id <ORDER_ID> \
    --new-price 51000 \
    --new-quantity 0.1 \
    -o json
```

Both `--new-price` and `--new-quantity` are required — re-submit the original value for the side you don't want to change.

## Cancel

```
cdcx trade cancel --order-id <ORDER_ID> -o json
# or
cdcx trade cancel --client-oid buy-btc-2026-04-17 -o json
```

## Patterns

### Laddered Entry (4 rungs)

```bash
INSTRUMENT=BTC_USDT
QTY_PER=0.025
for price in 49500 49250 49000 48750; do
    cdcx trade order BUY $INSTRUMENT $QTY_PER \
        --type LIMIT --price $price \
        --client-oid "ladder-$price" \
        -o json
done
```

### POST_ONLY (maker-only)

```
cdcx trade order BUY BTC_USDT 0.1 \
    --type LIMIT --price 50000 \
    --exec-inst POST_ONLY \
    -o json
```

POST_ONLY rejects the order if it would cross the book (and therefore would fill as taker).

## Common Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| `INVALID_PRICE` | Price doesn't match `price_tick_size` | Round to nearest tick from `cdcx market instruments` |
| `INVALID_QUANTITY` | Quantity below `min_qty` or not a multiple of `qty_tick_size` | Adjust to a valid rung |
| `INSUFFICIENT_BALANCE` | Available < price × quantity (for BUY) | Reduce size or top up |
| `INVALID_TIME_IN_FORCE` | Unsupported TIF value | Use `GOOD_TILL_CANCEL` / `FILL_OR_KILL` / `IMMEDIATE_OR_CANCEL` |

## Notes

- Prices in the API are decimals — send them as strings with a decimal point (e.g. `"50000.0"` not `50000`). The CLI takes numeric forms and formats correctly
- `cdcx trade order --help` lists every supported flag including STP (self-trade prevention) and isolated-margin arguments
- For bracket orders (entry + SL + TP in one payload) use `cdcx advanced create-otoco` — see the `cdcx-advanced` skill
~~~~

### Full SKILL.md: cdcx-advanced (MIT OR Apache-2.0)

~~~~markdown
---
name: cdcx-advanced
description: Advanced contingency orders — OCO, OTO, OTOCO. Triggered orders with linked cancellation logic.
---

# Advanced Orders

## When to Use

- Place a stop-loss and take-profit that cancel each other (OCO)
- Place an entry order that spawns a protection order when filled (OTO)
- Place an entry with both a stop-loss and take-profit (OTOCO — "bracket order")
- Manage or cancel an advanced order by its contingency ID

Requires authentication. All placement commands are tier `mutate`.

## Order Types

| Type | Meaning | Shape |
|------|---------|-------|
| OCO  | One-Cancels-the-Other | 2 protection legs; one fill cancels the other |
| OTO  | One-Triggers-the-Other | 1 entry leg + 1 protection leg (fires only after entry fills) |
| OTOCO | Bracket | 1 entry leg + 2 protection legs (stop-loss + take-profit) |

## Tools Used

| Tool                              | Purpose                          | Tier   |
|-----------------------------------|----------------------------------|--------|
| cdcx_advanced_oco                 | Create OCO pair                  | mutate |
| cdcx_advanced_create_oto          | Create OTO pair                  | mutate |
| cdcx_advanced_create_otoco        | Create OTOCO bracket             | mutate |
| cdcx_advanced_cancel_oco          | Cancel an OCO by list ID         | mutate |
| cdcx_advanced_cancel_oto          | Cancel an OTO by list ID         | mutate |
| cdcx_advanced_cancel_otoco        | Cancel an OTOCO by list ID       | mutate |
| cdcx_advanced_cancel              | Cancel a single child order      | mutate |
| cdcx_advanced_cancel_all          | Cancel all advanced orders       | dangerous |
| cdcx_advanced_open_orders         | List open advanced orders        | sensitive_read |
| cdcx_advanced_order_detail        | Lookup by order_id / client_oid  | sensitive_read |
| cdcx_advanced_order_history       | Historical advanced orders       | sensitive_read |
| cdcx_advanced_order_list_detail   | Lookup by list IDs               | sensitive_read |

## Workflow

Each `create-*` command takes a single positional `<order_list>` — a JSON array of order objects. The order list captures the entire contingency in one request.

### OTOCO Bracket (most common)

```
cdcx advanced create-otoco '[
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"50000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"STOP_LOSS","trigger_price":"48000","quantity":"0.01","ref_price_type":"MARK_PRICE"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"TAKE_PROFIT","trigger_price":"55000","quantity":"0.01","ref_price_type":"MARK_PRICE"}
]' --dry-run -o json
```

Exactly 3 orders: one entry (LIMIT or MARKET), one stop leg (STOP_LOSS or STOP_LIMIT), one take-profit leg (TAKE_PROFIT or TAKE_PROFIT_LIMIT). `ref_price_type` supports `MARK_PRICE` (default), `INDEX_PRICE`, `LAST_PRICE`.

### OTO (entry + protection)

```
cdcx advanced create-oto '[
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"50000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"STOP_LOSS","trigger_price":"48000","quantity":"0.01","ref_price_type":"MARK_PRICE"}
]' -o json
```

Exactly 2 orders: one entry, one protection leg.

### OCO (bare pair, already in position)

```
cdcx advanced oco '[
    {"instrument_name":"BTC_USDT","side":"SELL","type":"LIMIT","price":"55000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"STOP_LOSS","trigger_price":"48000","quantity":"0.01","ref_price_type":"MARK_PRICE"}
]' -o json
```

Use after you already hold a position — exits at either the take-profit limit or stop-loss trigger.

### Single Trigger Order

```
cdcx advanced order BTCUSD-PERP \
    --side SELL --type STOP_LOSS \
    --quantity 0.01 \
    --trigger-price 48000 \
    --ref-price-type MARK_PRICE \
    -o json
```

Use when you want an unattached stop or take-profit with no linked leg.

### Cancel by List ID

```
cdcx advanced cancel-otoco --list-id <list_id> -o json
cdcx advanced cancel-oco --list-id <list_id> -o json
cdcx advanced cancel-oto --list-id <list_id> -o json
```

List IDs are returned in the response body of the `create-*` call — capture and store them.

### List and Inspect

```
cdcx advanced open-orders BTC_USDT -o json
cdcx advanced order-detail --order-id <id> -o json
cdcx advanced order-list-detail --list-id <list_id>,<list_id2> -o json
cdcx advanced order-history --instrument-name BTC_USDT --limit 50 -o json
```

### Cancel Every Advanced Order (dangerous)

```
cdcx advanced cancel-all BTC_USDT -o json     # Per-instrument
cdcx advanced cancel-all -o json               # Account-wide — very rare
```

## Notes

- Advanced orders live in their own namespace — they do not appear in `cdcx trade open-orders`
- `ref_price_type` defaults to `MARK_PRICE`. For perpetuals stick to MARK_PRICE to avoid liquidation-edge scenarios
- OTO/OTOCO child orders are only created after the entry fills — until then they are virtual
- Always `--dry-run` before a live OTOCO — the JSON payload is easy to get wrong
~~~~

### Full SKILL.md: cdcx-isolated-margin (MIT OR Apache-2.0)

~~~~markdown
---
name: cdcx-isolated-margin
description: Trade instruments that require isolated margin (e.g. RWA/equity perpetuals like SPYUSD-PERP). Covers the create-order flag, funding transfers, leverage adjustment, and the TUI M toggle.
---

# Isolated Margin

## When to Use

Some instruments — notably equity/RWA perpetuals such as `SPYUSD-PERP` and `NVDAUSD-PERP` — cannot be traded on the default cross-margin account. Attempting to do so returns:

```json
{
  "code": 623,
  "message": "INSTRUMENT_MUST_USE_ISOLATED_MARGIN"
}
```

Isolated margin puts the position in its own margin bucket with its own leverage. Losses are capped at the isolated balance; a wipeout on one position cannot cascade into cross-margin balances on other instruments.

Use isolated margin when:
- The exchange requires it (error `623`).
- You want per-position risk isolation (e.g. high-leverage directional bet).
- You want a distinct leverage setting on one instrument without changing your cross-account config.

Do **not** use isolated margin for:
- Spot pairs (`CCY_PAIR`) — not applicable.
- Crypto perpetuals where you want shared collateral across positions.

## One Position Per Instrument

The exchange enforces **one isolated position per instrument per account**. You cannot open two separate isolated buckets on `SPYUSD-PERP` — the second order must reference the first position's `isolation_id` so the exchange knows whether you're adding to, trimming, or reversing it.

To top up or trim an open isolated position:

1. Look up its `isolation_id` via `cdcx account positions -o json` (or the `user.positions` WS channel).
2. Include `--isolation-id <ID>` on the next `cdcx trade order` call.

Omitting `--isolation-id` on a second order returns:

```json
{
  "code": 617,
  "message": "DUPLICATED_INSTRUMENT_ORDER_FOR_ISOLATED_MARGIN"
}
```

## TUI Workflow

Open the place-order modal (`t` on the Market tab) and use the **Margin** row:

```
Inst:   SPYUSD-PERP
Side:   [BUY]   SELL
Type:   [LIMIT] MARKET
Margin: [ISOLATED]  CROSS    (M to toggle)
Price:  710.25
Qty:    0.001
```

- `←/→` or `Space` while on the Margin row, or **`M` from anywhere in the modal** (except free-text fields), flips `ISOLATED ↔ CROSS`.
- Isolated margin is **pre-selected automatically** for instruments whose `inst_type` requires it (e.g. equity perpetuals).
- On success, the toast reads `Order placed (isolated margin)` so the mode is unambiguous.
- The TUI subscribes to `user.positions` at startup (when authenticated) so `isolation_id` for any open isolated position is cached and **auto-attached** to your next order on the same instrument. You do not need to supply it manually in the TUI.

### Handling Rejection

The modal **stays open** on any exchange rejection, showing the code and message so you can decide how to recover.

**Error 623 — `INSTRUMENT_MUST_USE_ISOLATED_MARGIN`**

```
[623] INSTRUMENT_MUST_USE_ISOLATED_MARGIN  (press M then R to retry with isolated margin)

R/Enter:retry  M:toggle margin  E:edit  Esc:cancel
```

Press `M` → `R` to resubmit the exact same payload with `exec_inst: ["ISOLATED_MARGIN"]`. No re-typing.

**Error 617 — `DUPLICATED_INSTRUMENT_ORDER_FOR_ISOLATED_MARGIN`**

You already have an isolated position on this instrument. If the TUI has cached the `isolation_id` (which it will have from the `user.positions` stream), the hint reads:

```
[617] DUPLICATED_INSTRUMENT_ORDER_FOR_ISOLATED_MARGIN  (R to retry — will attach your open isolation_id)
```

Press `R` and the retry includes the correct `isolation_id` automatically.

If the cache is empty (e.g. WS hadn't pushed the position yet), the TUI triggers a REST `private/get-positions` refresh in the background and shows:

```
[617] DUPLICATED_INSTRUMENT_ORDER_FOR_ISOLATED_MARGIN  (waiting on positions stream; check `cdcx account positions` then R)
```

Give it a moment then press `R` — the cache will be populated by then.

## Closing Positions (TUI)

On the **Positions** tab, select a row and press `x` to open the close-position modal. Two choices:

- **MARKET** — immediate fill at the best available price. Fast but exposes you to slippage, especially on thin books.
- **LIMIT** — pre-filled with the current mark price; edit to your desired exit level. Safer on illiquid instruments, but may not fill if the market moves away.

The workflow:

- Automatically flips the side (LONG → SELL, SHORT → BUY).
- Uses the **exact** quantity from the positions snapshot, preserving `qty_tick_size` precision — avoids leaving dust.
- Attaches `REDUCE_ONLY` so the order cannot accidentally flip your position.
- For isolated positions, attaches `exec_inst: [ISOLATED_MARGIN, REDUCE_ONLY]` and the correct `isolation_id` automatically.

If the exchange rejects the close (e.g. error 617 before the WS has pushed the `isolation_id`), the modal stays open with a retry hint. Press `R` once the positions snapshot has refreshed.

## CLI Workflow

### Place an order on isolated margin

```bash
cdcx trade order BUY SPYUSD-PERP 0.001 \
    --type LIMIT --price 710.25 \
    --exec-inst ISOLATED_MARGIN \
    -o json
```

`--exec-inst` is repeatable if you need to combine flags:

```bash
cdcx trade order BUY SPYUSD-PERP 0.001 \
    --type LIMIT --price 710.25 \
    --exec-inst ISOLATED_MARGIN \
    --exec-inst POST_ONLY \
    -o json
```

Optional tuning:

```bash
    --isolated-margin-amount 200   # USD to lock into the position's margin bucket
    --isolation-id <ID>            # Target an existing isolated position
    --leverage 5                   # Per-position max leverage
```

If you omit `--isolation-id`, the exchange creates a new isolated position. The response includes the `isolation_id` — store it if you plan to top up margin or change leverage later.

### Fund an isolated position

Move USD from your cross account into the isolated position's margin bucket:

```bash
cdcx margin transfer \
    --direction IN \
    --amount 100 \
    <ISOLATION_ID>
```

Withdraw unused margin back out:

```bash
cdcx margin transfer \
    --direction OUT \
    --amount 50 \
    <ISOLATION_ID>
```

Always dry-run first when moving funds:

```bash
cdcx margin transfer --direction IN --amount 100 <ISOLATION_ID> --dry-run
```

### Adjust leverage

```bash
cdcx margin leverage --leverage 5 <ISOLATION_ID>
```

Lower leverage reduces liquidation risk at the cost of more locked margin. Higher leverage is the inverse.

## Complete Flow Example

Open an isolated long on `SPYUSD-PERP` at 5x with $200 margin:

```bash
# 1. Preflight: confirm instrument is tradable
cdcx market instruments -o json | \
    jq '.data.data[] | select(.symbol=="SPYUSD-PERP")'

# 2. Check current price
cdcx market ticker SPYUSD-PERP -o json

# 3. Dry-run the order
cdcx trade order BUY SPYUSD-PERP 0.1 \
    --type LIMIT --price 710.00 \
    --exec-inst ISOLATED_MARGIN \
    --isolated-margin-amount 200 \
    --leverage 5 \
    --client-oid spy-long-$(date +%s) \
    --dry-run -o json

# 4. Place for real; capture the isolation_id
ORDER=$(cdcx trade order BUY SPYUSD-PERP 0.1 \
    --type LIMIT --price 710.00 \
    --exec-inst ISOLATED_MARGIN \
    --isolated-margin-amount 200 \
    --leverage 5 \
    -o json)
ISOLATION_ID=$(echo "$ORDER" | jq -r '.data.isolation_id')

# 5. Later: top up another $100 if price moves against us
cdcx margin transfer --direction IN --amount 100 "$ISOLATION_ID"

# 6. Change leverage mid-position
cdcx margin leverage --leverage 3 "$ISOLATION_ID"
```

## Common Errors

| Code | Meaning | Fix |
|------|---------|-----|
| `623` / `INSTRUMENT_MUST_USE_ISOLATED_MARGIN` | Instrument requires isolated margin | Add `--exec-inst ISOLATED_MARGIN` |
| `617` / `DUPLICATED_INSTRUMENT_ORDER_FOR_ISOLATED_MARGIN` | You already have an isolated position on this instrument | Fetch its `isolation_id` from `cdcx account positions` and pass `--isolation-id <ID>` to add/trim it |
| `INSUFFICIENT_BALANCE` | Not enough free USD to lock as margin | Reduce `--isolated-margin-amount` or top up the cross account |
| `INVALID_LEVERAGE` | Leverage outside instrument's allowed range | Check instrument metadata for `max_leverage` |
| `ISOLATION_NOT_FOUND` | `--isolation-id` doesn't match an open position | Omit it to create a new position, or list positions to find the right ID |

## Notes

- Isolated-margin positions appear under `cdcx account positions` alongside cross-margin positions, but have a distinct `isolation_id`.
- Closing an isolated position does **not** auto-return the margin to your cross account — use `cdcx margin transfer --direction OUT` to reclaim it.
- The TUI auto-default is conservative: it only pre-selects isolated for `inst_type` values known to require it (`EQUITY_PERP` / `EQUITY_PERPETUAL`). For any other instrument it defaults to cross, which you can flip with `M`.
- For bracket orders on isolated-margin instruments, pass `--exec-inst ISOLATED_MARGIN` to `cdcx advanced create-otoco` the same way.
~~~~

### Full SKILL.md: cdcx-wallet-ops (MIT OR Apache-2.0)

Withdrawals. Dangerous tier in MCP; ungated in CLI JSON mode (see above). Needs an API key with withdrawal permission.

~~~~markdown
---
name: cdcx-wallet-ops
description: Crypto wallet operations — deposits, withdrawals, network management. Withdrawal is tier-dangerous and requires extra gating.
---

# Wallet Operations

## When to Use

- Get a deposit address for a currency/network
- Initiate a withdrawal to a whitelisted address
- Query deposit or withdrawal history
- Look up supported networks for a currency

Requires authentication. Your API key must have **withdrawal permissions enabled** for `wallet withdraw` to work.

## Tools Used

| Tool                             | Purpose                               | Tier      |
|----------------------------------|---------------------------------------|-----------|
| cdcx_funding_deposit_address     | Generate/fetch deposit address        | sensitive_read |
| cdcx_funding_networks            | List supported networks per currency  | read      |
| cdcx_funding_deposit_history     | Past deposits                         | sensitive_read |
| cdcx_funding_withdrawal_history  | Past withdrawals                      | sensitive_read |
| cdcx_funding_withdraw            | Create a withdrawal request           | dangerous |
| cdcx_account_summary             | Available balance for a currency      | sensitive_read |

MCP service group name is **`funding`** (maps to CLI `wallet` group).

## Workflow

### Deposit (receive funds)

```
# 1. Find supported networks
cdcx wallet networks -o json

# 2. Get the deposit address
cdcx wallet deposit-address BTC -o json

# 3. Share the address + network with the sender
# 4. Poll for arrival
cdcx wallet deposit-history -o json
```

Always display both the address *and* the network to the user — sending on the wrong network loses the funds.

### Withdraw (send funds — dangerous)

```
# 1. Confirm available balance
cdcx account summary -o json

# 2. Confirm destination is whitelisted (done in Exchange GUI)

# 3. Confirm supported network
cdcx wallet networks -o json

# 4. Preview the request
cdcx wallet withdraw BTC 0.1 <ADDRESS> \
    --network-id BITCOIN \
    --client-wid my-withdraw-001 \
    --dry-run -o json

# 5. Execute
cdcx wallet withdraw BTC 0.1 <ADDRESS> \
    --network-id BITCOIN \
    --client-wid my-withdraw-001 \
    -o json

# 6. Track settlement
cdcx wallet withdrawal-history -o json
```

Positional args: `<currency> <amount> <address>`.

Tier `dangerous`: MCP server refuses the call unless started with `--allow-dangerous`. In the CLI, `cdcx` prompts for confirmation unless `--yes` is passed.

### Memo / Tag Coins (XRP, XLM, EOS, etc.)

```
cdcx wallet withdraw XRP 100 rXRPaddress... \
    --address-tag 12345 \
    --network-id RIPPLE \
    -o json
```

Omitting `--address-tag` on a memo coin routes funds to the exchange's omnibus address without tagging them to the recipient — they will be **lost**.

### History Queries

```
cdcx wallet deposit-history --currency USDT -o json
cdcx wallet withdrawal-history --currency USDT -o json
```

Use `--start-time` / `--end-time` (ms since epoch) to narrow the window.

## Notes

- Withdrawals only go to whitelisted addresses. Whitelist management is done in the Exchange web GUI, not via CLI
- `--client-wid` is your correlation ID — store it so you can cross-reference with `withdrawal-history`
- The `wallet withdraw` command requires all three positional args (currency, amount, address) plus `--network-id`; CLI will error otherwise
- Withdrawal fees are deducted from the received amount on the receiving side — preview with `--dry-run` to see the exchange's fee estimate
~~~~

### Full SKILL.md: cdcx-paper-strategy (MIT OR Apache-2.0)

Paper only. Writes `~/.local/share/cdcx/paper/paper_account.json`.

~~~~markdown
---
name: cdcx-paper-strategy
description: Local paper trading — test strategies against live market prices without risking real funds. CLI-only, no auth, no MCP tools.
---

# Paper Trading

## When to Use

- Validate a strategy before going live
- Experiment with order sizing and timing
- Teach/demo cdcx without risking funds
- Regression-test an agent's trading behaviour

**CLI-only.** Paper trading has no MCP tools — agents that need to paper trade must shell out to `cdcx paper` directly.

## Engine

The paper engine is local (no API calls for order state — only for market prices). State lives in `~/.local/share/cdcx/paper/paper_account.json`.

Fills use live mark prices fetched from the REST API at the moment the order is evaluated:
- MARKET orders fill immediately at the current ticker price
- LIMIT orders sit and fill when the market crosses the limit

## Commands

| Command | Purpose |
|---------|---------|
| `cdcx paper init --balance <n>` | Create a new paper account (default 10000 USDT) |
| `cdcx paper buy <INSTRUMENT> --quantity <q> [--price <p>]` | Buy (market if no price) |
| `cdcx paper sell <INSTRUMENT> --quantity <q> [--price <p>]` | Sell |
| `cdcx paper positions` | Open positions with unrealized P&L |
| `cdcx paper balance` | Cash balance + realized P&L |
| `cdcx paper history` | Fills log |
| `cdcx paper reset --balance <n>` | Wipe state and start fresh |

All commands support `-o json`, `-o table`, `-o ndjson`.

## Workflow

### Bootstrap

```
cdcx paper init --balance 50000
cdcx paper balance -o json
```

### Market Trade (round trip)

```
# 1. Check current price
cdcx market ticker BTC_USDT -o json

# 2. Paper buy
cdcx paper buy BTC_USDT --quantity 0.01 -o json

# 3. Inspect open position
cdcx paper positions -o json

# 4. Close
cdcx paper sell BTC_USDT --quantity 0.01 -o json

# 5. Realized P&L shows up in balance
cdcx paper balance -o json
```

### Limit Order (patient entry)

```
cdcx paper buy BTC_USDT --quantity 0.1 --price 49000 -o json
```

The limit sits in the paper engine until the market ticker crosses 49000. Check back with `cdcx paper positions` — until filled, the cash is reserved.

### Strategy Backtest Loop

```
# Bootstrap
cdcx paper init --balance 100000

# Loop (external script / agent):
#   1. Read signal from cdcx market ticker / candlestick
#   2. Issue cdcx paper buy or cdcx paper sell accordingly
#   3. Call cdcx paper positions -o json to track running P&L

# Review
cdcx paper history -o json
cdcx paper balance -o json
```

### Reset Between Runs

```
cdcx paper reset --balance 100000
```

Wipes all positions, trades, and P&L; starts fresh with the specified balance.

## Notes

- Paper state persists across `cdcx` invocations — use `reset` to start fresh
- No fees are deducted by default — add them in your strategy if you want realism
- Live streaming ticker is not wired into the paper engine; orders are evaluated on subsequent `cdcx paper` invocations using the then-current REST ticker
- For an interactive paper experience use `cdcx tui` and press `p` to toggle LIVE/PAPER mode
~~~~

### Full SKILL.md: recipe-emergency-flatten (MIT OR Apache-2.0)

Bulk cancel and market close. Uses `--yes`, which in JSON mode is a no-op because there is no prompt to skip.

~~~~markdown
---
name: recipe-emergency-flatten
description: Emergency flatten — cancel all open orders and close every open position as quickly as possible. Use when markets turn against you or credentials may be compromised.
---

# Emergency Flatten

## When to Use

- Market is moving violently against current exposure
- Suspect API key compromise — reduce blast radius
- End-of-session sweep to go flat overnight
- Agent has behaved unexpectedly and the human wants a hard stop

This is a destructive workflow. Only run when the user asks for it explicitly.

## Assumptions

- Authentication is configured (`CDCX_API_KEY` / `CDCX_API_SECRET`, or a profile)
- MCP mode: server must be started with `--allow-dangerous` (this workflow uses tier-`dangerous` commands)
- CLI mode: use `--yes` to skip prompts, or acknowledge each prompt

## Workflow

```
# 1. Cancel every open order (dangerous)
cdcx trade cancel-all --yes -o json

# 2. Confirm no open orders remain
cdcx trade open-orders -o json

# 3. List every open position
cdcx account positions -o json

# 4. Close each position at market
#    Run this per row returned in step 3
cdcx trade close-position <INSTRUMENT_NAME> --type MARKET --yes -o json

# 5. Verify positions are flat
cdcx account positions -o json

# 6. Also sweep advanced (OTO/OTOCO) orders — they live in a separate namespace
cdcx advanced cancel-all --yes -o json
cdcx advanced open-orders -o json

# 7. Final wallet check
cdcx account summary -o json
```

## Automated One-Liner

```
cdcx trade cancel-all --yes && \
cdcx advanced cancel-all --yes && \
cdcx account positions -o json | \
    jq -r '.data[].instrument_name' | \
    while read i; do cdcx trade close-position "$i" --type MARKET --yes; done && \
cdcx account positions -o json
```

## Notes

- `cancel-all` without an instrument cancels *every* open order across the account
- `close-position` is asynchronous — it returns an ack, not a fill. The position may remain open for a moment; step 5 confirms
- Advanced orders (OTO/OTOCO) are not cancelled by `cdcx trade cancel-all` — sweep them separately with `cdcx advanced cancel-all`
- If you are in doubt about the current state, re-run `cdcx account positions` and `cdcx trade open-orders` until both are empty
- If API access itself is the concern, also rotate the API key at https://crypto.com/exchange/settings/api afterwards
~~~~

## Part 2: crypto-agent-trading

Two independent skills. `crypto-com-exchange` (v2.0.0) is now a thin wrapper over the `cdcx` CLI from Part 1; its README is stale (still says "no scripts or runtime dependencies required", "52 endpoints", and lists direct HMAC signing). `crypto-com-app` (v1.0.2) drives the Crypto.com App (retail) API through bundled TypeScript scripts.

### Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text (short verbatim) |
|---|---|---|---|---|
| `crypto-com-exchange` | Spot and derivatives orders, OCO/OTO/OTOCO, portfolio, wallet withdrawals, paper trading, streaming, morning brief, emergency flatten | `cdcx` CLI (market, trade, advanced, account, history, wallet, margin, staking, fiat, paper, stream); `cdcx auth login --oauth` | live and paper | "Confirm with user before any `mutate` tier action in production" |
| `crypto-com-app` | Buy, sell, swap via quote then confirm; balances; coin search; fiat deposit and bank withdrawal; weekly limit; API key revoke ("kill switch") | `npx tsx scripts/account.ts`, `trade.ts`, `coins.ts`, `fiat.ts` against `https://wapi.crypto.com` | live | "ALWAYS require explicit confirmation regardless of `memory.confirmation_required`" (kill switch); "Never try to generate or bypass the TOTP." |

### Guardrails: code versus prose

**crypto-com-exchange**

- Prose only: the "CONFIRM" ritual, `--dry-run` before live orders, secret masking ("first 5 + last 4 for key, last 5 only for secret"), the emergency flatten "Requires explicit user CONFIRM". Nothing in the skill enforces any of it.
- The skill's own safety table says mutate "Requires `--yes` or MCP `acknowledged=true`" and "The CLI enforces these automatically". Per the cdcx code reading above, in JSON mode (`-o json`, which the skill uses everywhere) the CLI never prompts, so `--yes` gates nothing. Only the MCP `acknowledged` gate and `--allow-dangerous` exist in code, and they are model-supplied.
- Secrets and files: `cdcx auth login --oauth` opens a browser for OAuth and the skill instructs the agent to run it via Bash with a roughly 120 second timeout as soon as `cdcx account summary` reports "No credentials found". The result is stored by cdcx itself (config file or keyring behavior not traced). Install via `npx @cryptocom/cdcx-cli@latest` fetches and runs an unpinned package. `references/install.md` also offers a `curl | sh` installer.
- Exchange-side: withdrawal address whitelist and IP allowlist, per README.

**crypto-com-app** (the five scripts, 738 lines, were grepped for confirmation, stdin, env and file-write behavior)

- Credentials come from `CDC_API_KEY` and `CDC_API_SECRET` env vars only (`lib/api.ts`). The skill tells the agent to check presence with `echo "CDC_API_KEY=${CDC_API_KEY:+set}"` so values are not printed, and to stop and ask the user to export them. No credential file is written.
- Code: HMAC signing, the server-side quote object with a `countdown` expiry (the confirm call takes a quotation id, so a stale quote fails with `invalid_quotation`), and a readline TOTP prompt (question on stderr, answer from stdin) for fiat withdrawals when the API returns `totp_required` (`fiat.ts`). The server-side weekly trading limit and key permissions are exchange controls.
- No script contains a confirmation step: `trade.ts confirm <type> <quotation-id>` submits immediately. The human-confirmation step is SKILL.md text only.
- Model-controlled opt-out: confirmation is governed by `{{memory.confirmation_required}}`, which the skill tells the agent to set to `false` when the user says "stop asking for confirmation" or "enable auto-trade". Orders then execute straight after the quote. This is a persistent switch controlled by the model's memory, not by code. Without memory support it defaults to always confirming.
- Always-confirm carve-outs (kill switch and fiat withdrawal) are also prose. The TOTP prompt is the one human-in-the-loop that code enforces, and it is only as strong as whatever feeds stdin; the skill says "Never try to generate or bypass the TOTP."
- README claim "No withdrawal permissions -- the API key can only trade; it cannot withdraw funds" contradicts the skill, which ships `fiat.ts create-withdrawal-order` and `create-withdrawal` for bank withdrawals. Treat the README line as stale or limited to crypto withdrawals.
- Kill switch (`account.ts revoke-key`) revokes the API key itself; prose requires the exact phrase "CONFIRM KILL SWITCH".
- Rate limits cited in the skill (10 trades/min, 100 calls/min) are exchange limits, not safety controls.

### Full SKILL.md: crypto-com-exchange (MIT per frontmatter; repo Apache-2.0)

~~~~markdown
---
name: crypto-com-exchange
description: Trade on Crypto.com Exchange — market data, spot/derivatives orders, portfolio management, wallet operations. Uses cdcx CLI for execution with built-in auth, safety tiers, and dry-run.
metadata:
  version: 2.0.0
  author: Crypto.com
  openclaw:
    requires:
      bins: [cdcx]
    install:
      - kind: node
        package: '@cryptocom/cdcx-cli'
        bins: [cdcx]
        label: Install cdcx CLI (npm)
license: MIT
---

# Crypto.com Exchange Skill

Trade on Crypto.com Exchange using the `cdcx` CLI. Covers spot, derivatives, advanced orders, portfolio, and wallet operations.

## Prerequisites

1. Install: `npx @cryptocom/cdcx-cli@latest` or see [references/install.md](./references/install.md)
2. Authenticate: run `cdcx auth login --oauth` — opens browser for OAuth, no manual key entry needed
3. Verify: `cdcx account summary -o json`

If `cdcx account summary` fails with "No credentials found", immediately execute `cdcx auth login --oauth` via Bash (with ~120s timeout for browser callback).


## Capabilities

| Domain | CLI Group | What It Does |
|--------|-----------|--------------|
| Market Data | `cdcx market` | Prices, orderbook, candles, trades, instruments — no auth needed |
| Order Execution | `cdcx trade` | Place/amend/cancel LIMIT and MARKET orders |
| Advanced Orders | `cdcx advanced` | OCO, OTO, OTOCO bracket orders with trigger logic |
| Portfolio | `cdcx account` | Balances, positions, sub-accounts, P&L |
| History | `cdcx history` | Order history, fills, transactions |
| Wallet | `cdcx wallet` | Deposits, withdrawals, network info |
| Margin | `cdcx margin` | Isolated margin transfers, leverage |
| Staking | `cdcx staking` | Stake/unstake, conversion, reward history |
| Fiat | `cdcx fiat` | Fiat deposit/withdrawal, bank accounts |
| Paper Trading | `cdcx paper` | Local simulation with live prices, no auth |
| Streaming | `cdcx stream` | Real-time WebSocket data (NDJSON) |

## Safety Model

Every command has a safety tier. The CLI enforces these automatically:

| Tier | Behavior | Examples |
|------|----------|----------|
| `read` | Runs freely | `cdcx market ticker`, `cdcx market book` |
| `sensitive_read` | Runs freely (auth required) | `cdcx account summary`, `cdcx trade open-orders` |
| `mutate` | Requires `--yes` or MCP `acknowledged=true` | `cdcx trade order`, `cdcx trade amend` |
| `dangerous` | Requires `--allow-dangerous` on MCP server | `cdcx trade cancel-all`, `cdcx wallet withdraw` |

Always use `--dry-run` before live orders to preview the request.

## Quick Start

### Check Balance

```
cdcx account summary -o json
```

### Get Market Price

```
cdcx market ticker BTC_USDT -o json
```

### Place a Limit Order

```
# Preview first
cdcx trade order BUY BTC_USDT 0.01 --type LIMIT --price 50000 --dry-run -o json

# Execute
cdcx trade order BUY BTC_USDT 0.01 --type LIMIT --price 50000 --client-oid my-buy-001 -o json
```

### Place a Market Order

```
cdcx trade order BUY BTC_USDT 0.01 --type MARKET -o json
```

### Cancel an Order

```
cdcx trade cancel --order-id 123456789 -o json
cdcx trade cancel --client-oid my-buy-001 -o json
```

### Amend an Order

```
cdcx trade amend --order-id 123456789 --new-price 51000 --new-quantity 0.01 -o json
```

Both `--new-price` and `--new-quantity` are required — re-submit the original value for the field you don't want to change.

## Market Data (No Auth)

```
cdcx market ticker BTC_USDT -o json          # Current price
cdcx market ticker -o json                    # All instruments
cdcx market book BTC_USDT --depth 10 -o json  # Orderbook
cdcx market candlestick BTC_USDT --timeframe 1h --count 24 -o json  # OHLCV
cdcx market trades BTC_USDT -o json           # Recent prints
cdcx market instruments -o json               # All tradable pairs + tick sizes
```

Supported timeframes: `1m, 5m, 15m, 30m, 1h, 4h, 6h, 12h, 1D, 7D, 14D, 1M`

### Streaming (real-time)

```
cdcx stream ticker BTC_USDT ETH_USDT   # NDJSON to stdout
cdcx stream book BTC_USDT
cdcx stream trades BTC_USDT
```

## Order Execution

Positional args: `<side> <instrument> <quantity>`. Side is `BUY` or `SELL`.

```
# Limit order
cdcx trade order BUY BTC_USDT 0.01 --type LIMIT --price 50000 -o json

# Market order (buy by notional)
cdcx trade order BUY BTC_USDT --type MARKET --notional 500 -o json

# Batch (up to 10)
cdcx trade order-list --order-list '[
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"49000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"48000","quantity":"0.01"}
]' -o json

# List open orders
cdcx trade open-orders BTC_USDT -o json

# Close a position
cdcx trade close-position BTCUSD-PERP --type MARKET -o json
```

### Order Options

| Flag | Purpose |
|------|---------|
| `--type` | `LIMIT` or `MARKET` |
| `--price` | Limit price (string) |
| `--notional` | Spend amount in quote currency (MARKET BUY) |
| `--client-oid` | Your correlation ID (max 36 chars) |
| `--time-in-force` | `GOOD_TILL_CANCEL`, `FILL_OR_KILL`, `IMMEDIATE_OR_CANCEL` |
| `--exec-inst` | `POST_ONLY`, `SMART_POST_ONLY`, `REDUCE_ONLY`, `ISOLATED_MARGIN` |
| `--dry-run` | Preview without executing |

## Advanced Orders (OCO / OTO / OTOCO)

### OTOCO Bracket (entry + stop-loss + take-profit)

```
cdcx advanced create-otoco '[
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"50000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"STOP_LOSS","trigger_price":"48000","quantity":"0.01","ref_price_type":"MARK_PRICE"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"TAKE_PROFIT","trigger_price":"55000","quantity":"0.01","ref_price_type":"MARK_PRICE"}
]' --dry-run -o json
```

### OTO (entry + protection)

```
cdcx advanced create-oto '[
    {"instrument_name":"BTC_USDT","side":"BUY","type":"LIMIT","price":"50000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"STOP_LOSS","trigger_price":"48000","quantity":"0.01","ref_price_type":"MARK_PRICE"}
]' -o json
```

### OCO (two-sided exit for existing position)

```
cdcx advanced oco '[
    {"instrument_name":"BTC_USDT","side":"SELL","type":"LIMIT","price":"55000","quantity":"0.01"},
    {"instrument_name":"BTC_USDT","side":"SELL","type":"STOP_LOSS","trigger_price":"48000","quantity":"0.01","ref_price_type":"MARK_PRICE"}
]' -o json
```

### Single Trigger Order

```
cdcx advanced order BTCUSD-PERP --side SELL --type STOP_LOSS --quantity 0.01 --trigger-price 48000 --ref-price-type MARK_PRICE -o json
```

### Manage Advanced Orders

```
cdcx advanced open-orders BTC_USDT -o json
cdcx advanced order-detail --order-id <id> -o json
cdcx advanced cancel-otoco --list-id <list_id> -o json
cdcx advanced cancel-oco --list-id <list_id> -o json
cdcx advanced cancel-oto --list-id <list_id> -o json
```

## Portfolio & Account

```
cdcx account summary -o json                # Cash balances
cdcx account positions -o json              # Open positions + unrealized P&L
cdcx account info -o json                   # Master + sub-accounts
cdcx account subaccount-balances -o json    # Per-sub-account
cdcx account balance-history --timeframe D1 -o json  # Equity curve

# Fee rates
cdcx trade fee-rate -o json
cdcx trade instrument-fee-rate --instrument-name BTC_USDT -o json

# History
cdcx history orders BTC_USDT --limit 50 -o json
cdcx history trades BTC_USDT --limit 50 -o json
cdcx history transactions --limit 100 -o json
```

## Wallet Operations

```
# Deposit
cdcx wallet networks -o json                        # Supported networks
cdcx wallet deposit-address BTC -o json             # Get address
cdcx wallet deposit-history -o json                 # Track arrivals

# Withdraw (dangerous tier)
cdcx wallet withdraw BTC 0.1 <ADDRESS> --network-id BITCOIN --dry-run -o json
cdcx wallet withdraw BTC 0.1 <ADDRESS> --network-id BITCOIN --client-wid my-wd-001 -o json
cdcx wallet withdrawal-history -o json
```

Withdrawals require whitelisted addresses (configured in Exchange web GUI).

## Isolated Margin

For instruments that require isolated margin (e.g. `SPYUSD-PERP`, `NVDAUSD-PERP`):

```
cdcx trade order BUY SPYUSD-PERP 0.001 --type LIMIT --price 710.25 --exec-inst ISOLATED_MARGIN -o json

# Fund/withdraw margin
cdcx margin transfer --direction IN --amount 100 <ISOLATION_ID>
cdcx margin transfer --direction OUT --amount 50 <ISOLATION_ID>

# Adjust leverage
cdcx margin leverage --leverage 5 <ISOLATION_ID>
```

Get `isolation_id` from `cdcx account positions -o json`.

## Paper Trading (No Auth)

```
cdcx paper init --balance 50000
cdcx paper buy BTC_USDT --quantity 0.01 -o json
cdcx paper sell BTC_USDT --quantity 0.01 -o json
cdcx paper positions -o json
cdcx paper balance -o json
cdcx paper history -o json
cdcx paper reset --balance 100000
```

## Recipes

### Morning Brief

```
cdcx market ticker -o json                          # Market snapshot
cdcx account summary -o json                        # Cash
cdcx account positions -o json                      # Open positions
cdcx trade open-orders -o json                      # Pending orders
cdcx advanced open-orders -o json                   # Advanced orders
cdcx history trades --start-time $(date -v-1d +%s)000 -o json  # Yesterday's fills
```

### Emergency Flatten

**Requires explicit user CONFIRM before execution — this cancels all orders and closes all positions at market.**

```
cdcx trade cancel-all --yes -o json                 # Cancel all orders
cdcx advanced cancel-all --yes -o json              # Cancel all advanced
cdcx account positions -o json | \
    jq -r '.data[].instrument_name' | \
    while read i; do cdcx trade close-position "$i" --type MARKET --yes; done
cdcx account positions -o json                      # Verify flat
```

## Important Notes

- Instrument names are case-sensitive: `BTC_USDT` not `btc_usd`. Spot uses `_` (e.g. `BTC_USDT`), perps use `-PERP` (e.g. `BTC-PERP`)
- Prices in the API are strings — cast to float/decimal before arithmetic
- `c` in ticker response is a ratio, not percentage: `0.0257` means +2.57%
- Always supply `--client-oid` for order correlation
- `close-position` is async — verify with `cdcx account positions` afterwards
- Advanced orders live in their own namespace — not visible in `cdcx trade open-orders`
- Batch max is 10 orders per call
- OTOCO structure: Leg 1 = entry LIMIT, Leg 2 = stop-loss trigger, Leg 3 = take-profit trigger
- OTO second leg must be a trigger type (STOP_LOSS, STOP_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT)
- `get-open-orders` has no pagination — returns ALL open orders
- Withdrawal amount is gross (fee deducted from it)
- For memo coins (XRP, XLM, EOS), always include `--address-tag`

## Agent Behavior

1. Always `--dry-run` before live orders on new strategies
2. Confirm with user before any `mutate` tier action in production — ask for "CONFIRM"
3. Never display full API secrets — mask credentials (first 5 + last 4 for key, last 5 only for secret)
4. Default to `--output json` for programmatic consumption
5. Use `cdcx market instruments` to verify tick sizes before placing orders
6. Check `cdcx account summary` for available balance before order placement
7. For streaming data, prefer `cdcx stream` over polling
~~~~

### Full SKILL.md: crypto-com-app (Apache-2.0)

~~~~markdown
---
name: crypto-com-app
description: "Execute crypto trades (buy, sell, swap, exchange), manage cash deposits and withdrawals, and query account balances, market prices, and transaction history via the Crypto.com APP API. View weekly trading limits, portfolio positions, bank accounts, and payment networks. Use when the user wants to trade cryptocurrency, deposit or withdraw cash, check bank account details, view deposit instructions, or manage fiat wallet operations. Supports BTC, ETH, CRO, and 200+ tokens across fiat and crypto wallets."
user-invocable: true
metadata:
  author: "Crypto.com"
  version: "1.0.2"
  homepage: "https://crypto.com"
  license: "Apache-2.0"
  tags: ["crypto", "trading", "api"]
---

# Skill: crypto-com-app

## Agent Capability Requirements

This skill requires your agent platform to support the following capabilities. If your platform lacks any **required** capability, the skill will not function.

| Capability | Required | Details |
|---|---|---|
| **Shell command execution** | Yes | Must be able to run `npx tsx ./scripts/...` and capture stdout |
| **Environment variables** | Yes | Must read `CDC_API_KEY` and `CDC_API_SECRET` from the shell environment |
| **JSON parsing** | Yes | Must parse structured JSON from script stdout to extract fields |
| **Multi-turn conversation** | Yes | Trading uses a quote → confirm flow that spans multiple user turns |
| **Persistent memory** | No | Used for `confirmation_required` preference. If unsupported, default to always confirming trades |
| **Elapsed-time awareness** | No | Used to check quote expiry (`countdown` field). If unsupported, always attempt confirmation and handle `invalid_quotation` errors gracefully |

## CRITICAL: How This Skill Works

**You MUST use the TypeScript scripts for ALL API interactions. NEVER call the API directly with `curl`, `fetch`, or any other HTTP method.**

The scripts handle request signing, error handling, and response formatting. If you bypass them:
- The request will fail (missing HMAC signature)
- The response won't be filtered or structured

**For every user request, find the matching command below and run it via `npx tsx`. Read the JSON output. Act on it.**

## Configurations
- BASE_URL: `https://wapi.crypto.com`
- CDC_API_KEY: `{{env.CDC_API_KEY}}`
- CDC_API_SECRET: `{{env.CDC_API_SECRET}}`
- CONFIRMATION_REQUIRED: `{{memory.confirmation_required}}` (Default: true)
- SKILL_DIR: The directory containing this `SKILL.md` file. Resolve it from the path you loaded this file from (e.g. if you read `/home/user/skills/crypto-com-app/SKILL.md`, then `SKILL_DIR` is `/home/user/skills/crypto-com-app`).

## Environment Setup
- Both `CDC_API_KEY` and `CDC_API_SECRET` must be set as environment variables before use.
- **Before running any script**, check whether both variables are set by running:
  ```bash
  echo "CDC_API_KEY=${CDC_API_KEY:+set}" "CDC_API_SECRET=${CDC_API_SECRET:+set}"
  ```
  If either prints empty instead of `set`, prompt the user:
  > "Your API credentials are not configured. Please set them in your terminal before I can proceed:
  > ```
  > export CDC_API_KEY="your-api-key"
  > export CDC_API_SECRET="your-api-secret"
  > ```
  > You can generate an API key at https://help.crypto.com/en/articles/13843786-api-key-management.
  > Let me know once you've set them."
  
  Then **stop and wait** for the user to confirm before retrying.
- If a script returns a `MISSING_ENV` error, treat it the same way: prompt the user to set the variables and wait.

## Script Commands

**ALL API interactions MUST go through these scripts.** They handle signing, execution, filtering, and error formatting. Run the appropriate command below via shell, then parse the JSON output.

**Prerequisite:** `npx tsx` (Node.js 18+ required; `tsx` is fetched automatically by `npx`).

**Important:** All script paths below use `$SKILL_DIR` as a placeholder for this skill's root directory. Resolve it from the path you loaded this SKILL.md from, or `cd` into the skill directory and use `./scripts/...` as the path. Either approach works.

### Account Commands

```bash
# Filtered non-zero balances (scope: fiat | crypto | all)
npx tsx $SKILL_DIR/scripts/account.ts balances [fiat|crypto|all]

# Single token balance lookup
npx tsx $SKILL_DIR/scripts/account.ts balance <SYMBOL>

# Weekly trading limit
npx tsx $SKILL_DIR/scripts/account.ts trading-limit

# Find funded source wallets for a trade type
npx tsx $SKILL_DIR/scripts/account.ts resolve-source <purchase|sale|exchange>

# Kill switch — revoke API key
npx tsx $SKILL_DIR/scripts/account.ts revoke-key
```

### Trade Commands

Trading follows a **two-step flow**: get a quotation first, then confirm the order.

```bash
# Step 1 — Get quotation (type: purchase | sale | exchange)
npx tsx $SKILL_DIR/scripts/trade.ts quote <type> '<json-params>'
# Returns: {"ok": true, "data": {"id": "<quotation-id>", "from_amount": {...}, "to_amount": {...}, "countdown": 15, ...}}

# Step 2 — Confirm order: pass the data.id from Step 1 as <quotation-id>
npx tsx $SKILL_DIR/scripts/trade.ts confirm <type> <quotation-id>

# View recent transactions
npx tsx $SKILL_DIR/scripts/trade.ts history
```

**How to map user intent to trade type:**

| User says | Trade type | From | To |
|-----------|-----------|------|-----|
| "Buy CRO with 100 USD" | `purchase` | USD (fiat) | CRO (crypto) |
| "Sell 0.1 BTC" | `sale` | BTC (crypto) | USD (fiat) |
| "Swap 0.1 BTC to ETH" | `exchange` | BTC (crypto) | ETH (crypto) |

**Quotation JSON params by trade type:**

| Type | JSON fields |
|------|------------|
| purchase | `{"from_currency":"USD","to_currency":"CRO","from_amount":"100"}` or use `to_amount` instead |
| sale | `{"from_currency":"BTC","to_currency":"USD","from_amount":"0.1","fixed_side":"from"}` |
| exchange | `{"from_currency":"BTC","to_currency":"ETH","from_amount":"0.1","side":"buy"}` |

**Example — "Buy CRO with 100 USD":**

1. Run: `npx tsx $SKILL_DIR/scripts/trade.ts quote purchase '{"from_currency":"USD","to_currency":"CRO","from_amount":"100"}'`
2. Read `data.id`, `data.from_amount`, `data.to_amount`, `data.countdown` from the response.
3. **If confirmation required** (default): Ask user "Confirm: 100 USD for X CRO? Valid for {countdown}s. Reply 'YES' to proceed."
   - If user says YES (within countdown): `npx tsx $SKILL_DIR/scripts/trade.ts confirm purchase <data.id>`
4. **If confirmation opted out** (`memory.confirmation_required` is `false`): Skip asking and immediately run `npx tsx $SKILL_DIR/scripts/trade.ts confirm purchase <data.id>`

**Opt-in / Opt-out:** Users can say "stop asking for confirmation" to auto-execute trades, or "require confirmation" to re-enable the prompt. See Section 3 below.

### Coin Discovery Commands

```bash
# Search coins
npx tsx $SKILL_DIR/scripts/coins.ts search '{"keyword":"BTC","sort_by":"rank","sort_direction":"asc","native_currency":"USD","page_size":10}'
```

**Required JSON parameters:**

| Parameter | Type | Allowed values |
|-----------|------|----------------|
| `sort_by` | string | `rank`, `market_cap`, `alphabetical`, `volume`, `performance` |
| `sort_direction` | string | `asc`, `desc` |
| `native_currency` | string | Uppercase currency code (e.g. `USD`) |
| `keyword` | string | Search string, 1–100 chars; matches coin name and symbol only |
| `page_size` | integer | Number of results per page |

**Optional:** `page_token` — opaque token for fetching the next page (see pagination below).

**Pagination:** The response includes a `pagination` object with `has_more` (boolean) and `next_page_token` (string). When `has_more` is `true`, pass `next_page_token` as `page_token` in the next request to fetch the next page.

**Key response fields per coin:** `rails_id` (identical to `currency_id` / `currency` in trade and account APIs — use this to cross-reference), `price_native`, `price_usd`, `percent_change_*_native` (price performance over past timeframes, e.g. `percent_change_24h_native`).

### Cash (Fiat) Commands

Cash commands handle deposits, withdrawals, and bank account management.

```bash
# Cash overview — balances + available payment networks per currency
npx tsx $SKILL_DIR/scripts/fiat.ts discover

# Payment networks for a currency
npx tsx $SKILL_DIR/scripts/fiat.ts payment-networks <CURRENCY>

# Deposit method details (bank routing info)
npx tsx $SKILL_DIR/scripts/fiat.ts deposit-methods <CURRENCY> <DEPOSIT_METHOD>

# Email deposit instructions to user
npx tsx $SKILL_DIR/scripts/fiat.ts email-deposit-info <CURRENCY> <VIBAN_TYPE>

# Withdrawal details (quotas, fees, minimums)
npx tsx $SKILL_DIR/scripts/fiat.ts withdrawal-details <CURRENCY> <VIBAN_TYPE>

# Create withdrawal order (returns order with fees + receivable amount)
npx tsx $SKILL_DIR/scripts/fiat.ts create-withdrawal-order '<json-params>'

# Execute withdrawal (may prompt for TOTP authenticator code)
npx tsx $SKILL_DIR/scripts/fiat.ts create-withdrawal <ORDER_ID>

# List linked bank accounts
npx tsx $SKILL_DIR/scripts/fiat.ts bank-accounts [CURRENCY]
```

**Key parameters:**

| Parameter | Description | Example values |
|-----------|-------------|----------------|
| `CURRENCY` | Uppercase currency code | `USD`, `EUR`, `GBP`, `AUD` |
| `DEPOSIT_METHOD` | Network ID from `payment-networks` | `us_ach`, `sepa`, `uk_fps` |
| `VIBAN_TYPE` | Same as deposit method / withdrawal network | `us_ach`, `sepa`, `uk_fps` |

**Withdrawal order JSON params:**

| Field | Required | Description |
|-------|----------|-------------|
| `currency` | Yes | Currency code (e.g. `"USD"`) |
| `amount` | Yes | Amount as string (e.g. `"500.00"`) |
| `viban_type` | Yes | Payment network (e.g. `"us_ach"`) |
| `bank_account_id` | No | Specific bank account ID |

**Example — "How do I deposit USD?":**

1. Run: `npx tsx $SKILL_DIR/scripts/fiat.ts payment-networks USD`
2. Read `data` array — each entry has `deposit_push_payment_networks` (e.g. `["us_ach", "us_wire_transfer"]`)
3. For details: `npx tsx $SKILL_DIR/scripts/fiat.ts deposit-methods USD us_ach`
4. Read `data` array — contains `bank_details` with routing number, account number, etc.

**Example — "Withdraw 500 USD via ACH":**

1. Run: `npx tsx $SKILL_DIR/scripts/fiat.ts withdrawal-details USD us_ach` — check quotas and fees
2. Run: `npx tsx $SKILL_DIR/scripts/fiat.ts create-withdrawal-order '{"currency":"USD","amount":"500","viban_type":"us_ach"}'`
3. Read `data.id` (order ID), `data.fee`, `data.receivable_amount` from response
4. **Confirm with user:** "Withdraw 500 USD via ACH. Fee: {fee}. You'll receive: {receivable_amount}. Confirm?"
5. If YES: `npx tsx $SKILL_DIR/scripts/fiat.ts create-withdrawal <order-id>`
6. If TOTP required, the script will prompt for a 6-digit authenticator code on stderr

### Output Format

Every script prints structured JSON to stdout:

**Success:**
```json
{"ok": true, "data": { ... }}
```

**Error:**
```json
{"ok": false, "error": "ERROR_CODE", "error_message": "Human-readable message"}
```

## Constraints
- **Validation:** Success requires `ok: true` in the script output.
- **Confirmation Window:** Quote validity is defined by the `countdown` field in the quotation data.
- **Execution Warning:** If order confirmation takes > 5s, notify: "Order submitted but taking longer than expected. Check order status with 'Show recent trades'".
- **Rate Limits:**
  - Max **10 trades per minute**.
  - Max **100 API calls per minute**.
  - On HTTP 429 (`RATE_LIMITED` error): wait **60 seconds** before retrying the same request. Inform the user: "Rate limit reached — please wait 60 seconds before trying again."

## Error Handling

All scripts return structured errors. Parse the `error` field to determine the appropriate response.

### Script Error Codes

These are the `error` values in the script's JSON output. They tell you *what category* of failure occurred.

| Error Code | Meaning | Agent Response |
|------------|---------|----------------|
| `MISSING_ENV` | `CDC_API_KEY` or `CDC_API_SECRET` not set | Tell user to set env vars via terminal |
| `API_ERROR` | API returned non-200 or `ok !== true` | Report: "Transaction failed: {error_message}" |
| `INVALID_ARGS` | Bad command-line arguments | Show correct usage from the `error_message` |
| `QUOTATION_FAILED` | Quotation request rejected by API | Report the `error_message` to user (see API errors below) |
| `EXECUTION_FAILED` | Order confirmation failed | Report and suggest: "Check order status with 'Show recent trades'" |
| `API_KEY_NOT_FOUND` | Key already revoked or does not exist | "API key not found — it may have already been revoked." |
| `RATE_LIMITED` | Too many requests (HTTP 429) | "Rate limit reached — please wait 60 seconds before trying again." |
| `UNKNOWN` | Unexpected error | Report the raw `error_message` |

**Rule:** When `ok` is `false` in the output, stop the current operation and report the error to the user using the guidance above. Never proceed to the next step after a failure.

### Common API Errors (Quick Reference)

These are the *specific* API error codes that appear inside the `error_message` of `QUOTATION_FAILED`, `EXECUTION_FAILED`, or `API_ERROR` responses. They tell you *why* the API rejected the request.

| `error` | Meaning | Recovery |
|---------|---------|----------|
| `not_enough_balance` | Insufficient funds | Check balances, reduce trade amount |
| `invalid_currency` | Currency code not recognized | Verify via coin search |
| `invalid_quotation` | Quote expired or already used | Request a new quotation |
| `failed_to_create_quotation` | Quotation engine error | Retry shortly |
| `not_eligible_for_prime` | Not eligible for Prime benefits | Proceed without Prime |
| `unauthorized` | Account not approved for trading | Contact support |
| `restricted_feature` | Feature restricted on account | Report `error_message` to user |
| `existing_currency_order_error` | An existing order is in progress | Wait or cancel existing order |
| `viban_purchase_not_enabled` | Fiat-to-crypto not enabled | Account feature not available |
| `crypto_viban_not_enabled` | Crypto-to-fiat not enabled | Account feature not available |
| `bank_transfer_not_enabled` | Bank transfer not enabled | Account feature not available |
| `missing_parameter` | Required parameter missing | Script bug — report it |
| `failed_to_create_transaction` | Transaction creation failed | Retry or contact support |
| `key_not_active` | API key revoked or expired | Generate a new API key, update env vars |
| `api_key_not_found` | Key doesn't exist or belongs to another user | Verify correct key is set in `CDC_API_KEY` |
| `totp_required` | Withdrawal needs 2FA code | Script handles automatically — prompts user for authenticator code |
| `withdrawal_limit_exceeded` | Daily/monthly quota exceeded | Show limits via `withdrawal-details`, reduce amount |
| `invalid_bank_account` | Bank account not eligible | Check `bank-accounts` for valid accounts with `status: completed` |
| `withdrawal_cooling_off` | Recently changed withdrawal settings | Wait for cooling-off period, report `error_message` to user |
| `email_cooldown` | Too many deposit info emails | Wait for cooldown period (shown in error), try again later |

For dynamic errors (limit exceeded, currency disabled, cooling-off, etc.), report the `error` and `error_message` directly to the user. For full details, see [references/errors.md](references/errors.md).

---

## Logic & Rules

### 1. Asset & Source Disambiguation

Determine the trade type first:
- **Purchase** — fiat → crypto
- **Sale** — crypto → fiat
- **Exchange** — crypto → crypto

Then resolve the source wallet:
- For **purchase**: run `npx tsx $SKILL_DIR/scripts/account.ts resolve-source purchase`. The script returns only funded fiat entries.
- For **sale** or **exchange**: run `npx tsx $SKILL_DIR/scripts/account.ts resolve-source sale` (or `exchange`). The script returns only funded crypto entries.

**Result (from `data.status`):**
- **`SELECTED`** → auto-select `data.currency`.
- **`AMBIGUOUS`** → prompt user to choose from `data.options`.
- **`EMPTY`** → inform user "No funded wallets found" and stop.

**"Sell All" Scenario:** If user says "Sell all [TOKEN]", run `npx tsx $SKILL_DIR/scripts/account.ts balance [TOKEN]`. Use the `data.available` amount (or `data.balance`) as `from_amount` for the quotation.

### 2. Trading Process (Quotation → Confirmation → Execution)

When the user asks to buy, sell, or swap crypto, **always** follow this three-step flow:

- **Step A — Get Quotation:** Build the JSON params from the user's request (see the "Quotation JSON params" table in Trade Commands) and run:
  `npx tsx $SKILL_DIR/scripts/trade.ts quote <type> '<json-params>'`
  Read `data.id`, `data.from_amount`, `data.to_amount`, and `data.countdown` from the response.

- **Step B — Ask User to Confirm:**
    - **IF** `memory.confirmation_required` is `true` (or unset):
        - Prompt: "Confirm: {from_amount} for {to_amount}? Valid for {countdown}s. Reply 'YES' to proceed."
        - **Expiration Logic:** If the user replies "YES" after `countdown` seconds have elapsed, reject: "Transaction rejected: The quotation rate has expired. Please request a new quote."
        - Execute Step C ONLY if user replies "YES" within the valid window.
    - **ELSE (Opted Out):**
        - Notify: "Quotation received. Proceeding to execution automatically..."
        - Immediately proceed to Step C.

- **Step C — Execute Order:** Run: `npx tsx $SKILL_DIR/scripts/trade.ts confirm <type> <data.id>` using the `id` from Step A.

### 3. Memory Management (Opt-in/Out)
- **To Opt-out:** If user says "stop asking for confirmation" or "enable auto-trade", update `memory.confirmation_required` to `false`.
- **To Opt-in:** If user says "require confirmation" or "enable manual trade", update `memory.confirmation_required` to `true`.
- **Platforms without persistent memory:** If your platform does not support `{{memory.*}}`, treat `confirmation_required` as always `true` (safest default).

### 4. Error Handling
- All script outputs include an `ok` field. Success is defined ONLY as `ok: true`.
- If `ok` is `false`, read `error` and respond per the Error Handling table above.
- Never proceed to the next step after a failed command.

### 5. Account & History
- **History:** Run `npx tsx $SKILL_DIR/scripts/trade.ts history` — display the entries from `data`.
- **Weekly Trading Limit:** Run `npx tsx $SKILL_DIR/scripts/account.ts trading-limit` — display as: "📊 Weekly Trading Limit: {data.used} / {data.limit} USD (Remaining: {data.remaining} USD)".
- **Fiat vs Crypto balance routing:** When the user asks about a specific currency balance, determine whether it is a **fiat currency** (USD, EUR, GBP, AUD, SGD, CAD, BRL, etc.) or a **crypto token** (BTC, ETH, CRO, etc.).
    - **Fiat currency** → run `npx tsx $SKILL_DIR/scripts/account.ts balances fiat` (shows all fiat balances) or `npx tsx $SKILL_DIR/scripts/fiat.ts discover` (shows balances + payment networks). **Never** use `balance <SYMBOL>` for fiat currencies — it queries the crypto wallet and will always return 0.
    - **Crypto token** → run `npx tsx $SKILL_DIR/scripts/account.ts balance <SYMBOL>`.
    - **Unsure** → run `npx tsx $SKILL_DIR/scripts/account.ts balances all` to show both fiat and crypto.
- **Balances (Categorized):**
    - If "List Fiat": run `npx tsx $SKILL_DIR/scripts/account.ts balances fiat`.
    - If "List Crypto": run `npx tsx $SKILL_DIR/scripts/account.ts balances crypto`.
    - If "List All": run `npx tsx $SKILL_DIR/scripts/account.ts balances all`. **Crucial:** Display Fiat category first, followed by Crypto balances below.
    - The scripts automatically filter out zero-balance entries. If a category has no entries in the output, display "No holdings" under that header.
    - **Crypto balances** (`data.crypto`) contain a `note` field ("available for trading") and a `wallets` array. Always clarify to the user that these amounts are what's available for trading — total holdings across all products may be higher.
    - **Portfolio Allocation:** When crypto balances are queried, the output may include a `portfolio_allocation` array — each entry has a product `name` and `price_native` (USD value). Display this as a summary of the user's asset distribution across products (e.g. Crypto Wallet, Exchange, Earn, Staking, etc.).
    - **Single token balance** (`balance <SYMBOL>`) output may include a `product_allocation` object — keys are product names (e.g. `crypto_earn`, `staking`, `supercharger`, `crypto_basket`, `airdrop_arena`) and values are the token amounts held in each. Only non-zero products are included. Summarize these allocations to the user alongside the available-for-trading amount so they see the full picture of where their tokens are held.

### 6. Kill Switch
- **Trigger:** User says "STOP ALL TRADING", "kill switch", or similar emergency stop command.
- **ALWAYS require explicit confirmation** regardless of `memory.confirmation_required`:
    - Prompt: "⚠️ WARNING: This will immediately revoke your API key and disable all trading. A new API key must be generated to resume. Type 'CONFIRM KILL SWITCH' to proceed."
    - Execute ONLY if user replies with the exact phrase.
- **Execution:** Run `npx tsx $SKILL_DIR/scripts/account.ts revoke-key`.
- **On success (`ok: true`):** Notify: "🛑 Kill switch activated. API key has been revoked. All trading is disabled. Generate a new API key and update your environment variables to resume."
- **On `API_KEY_NOT_FOUND` error:** Notify: "API key not found — it may have already been revoked or does not exist."
- **Idempotency:** Revoking an already-revoked key is not an error; treat it the same as a successful revocation.

### 7. Balance Display Format
- **Fiat Header:** "🏦 Fiat Balances"
- **Crypto Header:** "🪙 Crypto Balances"
- Always list Fiat section before Crypto section when both are requested.
- **Never display zero-balance assets.** Only show assets with a balance greater than 0. If all assets in a category are zero, show "No holdings" under that header.

### 8. Cash Deposit & Withdrawal

**Terminology:** Use "cash" (not "fiat") in user-facing messages. Say "your cash balance" not "your fiat balance".

**Currency disambiguation:** If the user doesn't specify a currency, run `discover` first.
- **One currency with balance** → auto-select it and proceed.
- **Multiple currencies with balances** → present the list and ask the user to choose before proceeding.
- **No balances** → inform: "You don't have any cash balances yet." and stop.

**Deposit flow:**
1. Run `discover` to show the user their cash currencies and available networks
2. User picks a currency and network — run `deposit-methods` to get bank details
3. Present the bank details (routing number, account number, bank name, reference)
4. Optionally run `email-deposit-info` to email instructions to the user
5. **Rate limit:** `email-deposit-info` is limited to 5 requests per 30 minutes. On cooldown error, inform user and show the `cooldown_in_seconds` value.

**Withdrawal flow:**
1. Run `bank-accounts <currency>` to list eligible accounts (filter to `status: "completed"` only)
   - **One eligible account** → auto-select it
   - **Multiple eligible accounts** → present the list (bank name, account identifier, networks) and ask user to choose
   - **No eligible accounts** → inform: "No eligible bank accounts found for {currency}. You need to link a bank account first." and stop
2. Run `withdrawal-details` to check quotas, fees, and minimums
3. Run `create-withdrawal-order` with amount, network, and `bank_account_id` from step 1 — returns order with fees
4. **ALWAYS confirm with user** before executing (regardless of `memory.confirmation_required`):
   - Show: amount, fee, receivable amount, network, destination bank account, processing time
   - Require explicit "YES" to proceed
5. Run `create-withdrawal` with the order ID
6. **TOTP handling:** If the API returns `totp_required`, the script prompts for a 6-digit authenticator code on stderr. The agent should tell the user: "Please enter your 6-digit authenticator code when prompted." Never try to generate or bypass the TOTP.

**Bank accounts:**
- Run `bank-accounts` to list linked accounts. Filter by currency if specified.
- Only accounts with `status: "completed"` are eligible for withdrawals.
- Each account shows `withdrawal_payment_networks` — use these as valid `viban_type` values.

**Deposit methods — vendor selection:**
- `deposit-methods` returns a `vendor_list` array. Each vendor has a `status` field.
- Only show vendors with `status: "created"` (active). Ignore `"uncreated"` vendors.
- If multiple created vendors exist, default to the first one in the list.

**Cash commands quick reference:**

| User says | Commands to run |
|-----------|----------------|
| "How do I deposit USD?" | `payment-networks USD` then `deposit-methods USD <network>` |
| "Email me deposit instructions" | `email-deposit-info <currency> <viban_type>` |
| "Show my bank accounts" | `bank-accounts` |
| "What are my withdrawal limits?" | `withdrawal-details <currency> <viban_type>` |
| "Withdraw 500 USD" | `withdrawal-details` -> `create-withdrawal-order` -> confirm -> `create-withdrawal` |
| "What currencies can I deposit?" | `discover` |
~~~~

## Reference files not reproduced

- cdcx-cli `SECURITY.md`: credential handling (no secret CLI flags by design, chmod 600, use read-only keys, exchange-side withdrawal allowlists), the safety tier table, binary integrity (SHA-256 checksums), the network host list. Quoted above where relevant.
- cdcx-cli `agents/AGENTS.md`, `agents/tool-catalog.json` (67 endpoints with tiers: 31 sensitive_read, 20 mutate, 11 read, 5 dangerous), `agents/error-catalog.json`: integration guide and catalogs. The README claims 95 MCP tools; the catalog holds 67 entries, so it is older than the generated registry.
- crypto-agent-trading `crypto-com-app/references/errors.md` and `crypto-com-exchange/references/authentication.md` (HMAC-SHA256 signing examples) and `references/install.md`.

## Guardrail gap list

1. cdcx MCP `acknowledged` is a model-supplied boolean; at autonomy Level 3 it is passed automatically.
2. Hidden service groups are still callable by name (`call_tool` never checks enabled groups).
3. CLI JSON mode never prompts, so `--yes` and the dangerous tier are no-ops for shell-driving agents; withdrawals and cancel-all are ungated in CLI use.
4. Unlisted private methods default to sensitive_read (fail-open).
5. `allow_dangerous` is a config file the same agent may be able to edit.
6. No notional, size or symbol limits in cdcx or either skill pack; withdrawal whitelist and IP allowlist live only on the exchange.
7. crypto-com-exchange claims the CLI enforces `--yes`; it does not in JSON mode.
8. crypto-com-app confirmation is prose plus a model-held `confirmation_required` memory flag the model can turn off.
9. `cdcx-auth-setup` documents CLI key flags that do not exist; the README and skill text diverge from SECURITY.md.
10. Plugin and skill installs run unpinned `npx @cryptocom/cdcx-cli@latest`; `crypto-com-exchange` also offers `curl | sh`.
11. License hygiene: `crypto-com-exchange` claims MIT with no MIT file shipped; root file is Apache-2.0.
