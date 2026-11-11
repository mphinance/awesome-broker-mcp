# Kraken: official agent skills

| Field | Value |
|---|---|
| Repo | https://github.com/krakenfx/kraken-cli (directory `skills/`) |
| Commit | `671cdd7f1483409f7b45554725f2a07ac5abd33f` (merge of PR #60, 2026-10-29) |
| License | MIT, copyright Payward, Inc. (Kraken). `LICENSE` at repo root; `Cargo.toml` and `.claude-plugin/plugin.json` also say MIT. Redistribution permitted with the copyright and permission notice. |
| Scraped | 2026-11-11 |
| Skill count | 59 (`skills/INDEX.md` and `skills/README.md` both say 59; 59 `SKILL.md` files found on disk) |
| Install (skills + MCP) | Claude Code: `/plugin marketplace add krakenfx/kraken-cli` then `/plugin install kraken-cli@kraken` (per README; the plugin manifest has `"skills": "./skills/"` and an MCP server `kraken-mcp -s market,paper,feedback`). Needs the CLI first: `curl --proto '=https' --tlsv1.2 -LsSf https://github.com/krakenfx/kraken-cli/releases/latest/download/kraken-cli-installer.sh \| sh` |
| Install (OpenClaw) | symlink or copy `skills/kraken-*` and `skills/recipe-*` into `~/.openclaw/skills/` (per `skills/README.md`) |
| Install (Gemini CLI) | `gemini extensions install https://github.com/krakenfx/kraken-cli` |

Nothing in the clone was executed. Files were read only.

## How to read this page

The skills are instructions for a model that drives the `kraken` CLI (and, through `kraken-mcp`, the same commands as MCP tools). Almost every "never do X without human approval" line is a sentence in a prompt. The model enforces it, or it does not. This page marks which guardrails the CLI or MCP server enforces mechanically (from the skill text itself, not from reading the Rust source) and which are model-enforced only.

Mechanically enforced, as stated by the skills:

- `--validate` on spot orders is a real dry run in the CLI. Futures orders, amends, edits and cancels have no dry run.
- `kraken-mcp` default service sets: marketplace listings ship `-s market,paper,feedback` (no live trading). A bare `kraken-mcp` serves `market,account,paper,workspace,feedback`. Live trading needs `trade` or `futures`; funds movement needs `funding`, `earn`, `subaccount`.
- Dangerous MCP tools carry `destructive_hint` and, in guarded mode, are routed to the operator through MCP elicitation. This holds only if the client can show an elicitation. Otherwise the server accepts `acknowledged=true` written by the model, which `kraken-mcp-integration` itself describes as "no person is asked unless the client's own tool-approval prompt is on".
- `kraken workspace promote` grades the promotion checklist mechanically and refuses without evidence. Live workspaces enforce an allocation budget (`allocation_budget`, `over_allocated`, `unverified` refusals).
- The CLI prompts for some commands (cancel-all, withdrawals, transfers, earn, workspace reset or promote) and `--yes` skips the prompt. The skills tell the model to pass `--yes` only after the user approves.
- Account-wide exchange controls such as the dead man's switch (`cancel-after`) and API key scopes live at Kraken, not in the skills.

Model-enforced only (no CLI mechanism stated):

- "Require explicit human approval" for every live order, amend, cancel, withdrawal and transfer. Per `kraken-autonomy-levels`: "Placing an order never prompts at any level: the Level 3 approval is a step the agent takes itself."
- Position size limits, trades per hour limits and pair allowlists. Per the same skill: "The CLI does not enforce position size or frequency limits. Build these in your agent logic".
- The paper vs live boundary for sessions. `kraken-playground`: without a workspace, "`kraken order buy` trades the real account". Each paper driver depends on the model passing `--workspace <name>` on every call and re-checking that the mode is `paper`.
- Margin ratio alerts (0.5 alert, 0.7 act), the drawdown circuit breaker, the 10 to 25 percent initial live size, and "at least a week" progression rules between autonomy levels.
- `--reduce-only` on futures exits, bracket cleanup (cancelling the opposite leg), and leg matching on basis and carry trades.

## Summary table

Capability key: read = market data or account reads only; paper = simulated fills only; live trade = can place or change real orders; live funds = can move real funds (withdraw, transfer, stake).

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| kraken-setup | Install CLI, key scopes, first paper session, MCP handoff | `kraken workspace`, `paper`, `auth`, `balance`, installer | read, paper (live optional) | "Never enable `Withdraw Funds`." Default MCP list `market,paper,feedback`; "A fresh install can never place a real order." |
| kraken-shared | Invocation contract, auth, error routing, safety list | `kraken <cmd> -o json`, `agents/tool-catalog.json` | all (contract) | Lists 43 `dangerous: true` commands; "Require explicit human approval before" live orders, cancels, withdrawals, transfers, earn, promote. "Never start `kraken auth login`." |
| kraken-autonomy-levels | Five-level ladder from read-only to fund-moving autonomy | `ticker`, `balance`, `workspace`, `paper`, `order ... --validate`, `order cancel-after` | read, paper, live trade, live funds | L4 needs restricted key and dead man's switch; "The CLI does not enforce position size or frequency limits." L3 approval is agent-side. |
| kraken-mcp-integration | Wire MCP clients to `kraken-mcp`, service scopes | `kraken-mcp -s ...` | depends on `-s` | Marketplace default has no live trading; "Switching to `-s all` expands the set of tools the agent can reach by prompt-injection or mistake." `acknowledged=true` is model-written on clients without elicitation. |
| kraken-rate-limits | Spot, trading-engine and futures rate budgets | any; reads `rate_limit` error fields | read | CLI does not pre-throttle or retry; agent adapts to `suggestion`. |
| kraken-order-types | Reference for every spot and futures order type and modifier | `order buy/sell`, `futures order`, `--validate`, `--reduce-only` | live trade | "All order placement commands are dangerous. Never execute without explicit human approval." |
| kraken-error-recovery | Safe retry, duplicate prevention, partial fills | `open-orders`, `trades-history`, `query-orders`, `order cancel`, `--cl-ord-id` | live trade | "Never blind-retry an order after a network error; always check state first." Retries need approval below autonomy level 4. |
| kraken-market-intel | Ticker, orderbook, OHLC, stream reads | `ticker`, `orderbook`, `ohlc`, `ws ticker` | read | None needed. |
| kraken-multi-pair | Multi-pair screening and watchlists | `ticker`, `pairs`, `ws ticker`, `futures tickers` | read | None needed. |
| kraken-alert-patterns | Price, spread, volume, balance and fill alerts | `ws ticker`, `ws balances`, `ws executions`, `balance` | read | "Alerts are informational; they do not execute trades automatically." |
| kraken-ws-streaming | WebSocket streams and WS order mutations | `ws ticker/book/executions`, `ws add-order/amend-order/cancel-order/cancel-all/batch-add`, `futures ws ...` | read, live trade | "WebSocket order mutations are flagged as dangerous. Require human approval." `--validate` only on `add-order` and `batch-add`. |
| kraken-spot-execution | Validate, confirm, place, verify spot orders | `ticker`, `order buy --validate`, `order buy`, `open-orders`, `order cancel`, `order cancel-after` | live trade | "Never execute live order commands without explicit user approval." |
| kraken-stop-take-profit | Stops, take-profits, brackets, trailing stops | `order sell --type stop-loss/take-profit/trailing-stop`, `futures order --type stop --reduce-only`, `ws executions` | live trade | "Never place live stop/take-profit orders without explicit human approval." Cancelling the other bracket leg is agent-side. |
| kraken-fee-optimization | Maker orders, volume tiers, fee currency | `volume`, `order ... --oflags post/fciq/fcib`, `order batch`, `futures feeschedules` | live trade | "Always `--validate` before submitting live orders." |
| kraken-paper-strategy | Spot paper testing, fee and slippage notes | `workspace create --mode paper`, `paper buy/sell`, `workspace status/reset` | paper | Migration rule: repeated stable runs, user sign-off, `--validate` passes. Warns paper omits partial fills. |
| kraken-paper-to-live | Promotion gate and pre-flight from paper to live | `workspace promote`, `lab show/compare`, `auth test`, `balance`, `order cancel-after`, `futures set-leverage` | live trade | Gate: at least 2 passing sessions of one frozen experiment, a live paper session mandatory. Start at 10 to 25 percent of paper size. First live session at autonomy level 3. |
| kraken-playground | Recorded paper sessions over live prices | `playground`, `session start/stop/note`, `order buy --workspace`, `explain pnl`, `lab score` | paper | "No real order is ever placed inside a paper workspace" but only while each order names `--workspace` and mode is `paper`. |
| kraken-lab-experiment | Hash-sealed hypothesis, run, score, verdict loop | `lab new/next/score/compare/show`, `session start/stop` | paper | Never edit a frozen spec; never report a verdict not obtained from `lab score` or `lab compare`; confirm `"mode": "paper"` before any order step. |
| kraken-risk-operations | Pre-flight, dead man's switch, mass cancel | `order cancel-after`, `order cancel-all`, `futures cancel-all`, `open-orders`, `positions` | live trade | "Never execute mass-cancel without verifying which orders and positions are open first." Cancels are dangerous and need approval. |
| kraken-futures-trading | Futures order lifecycle, batch, paper | `futures order`, `batch-order`, `edit-order`, `cancel`, `cancel-all`, `positions`, `futures paper` | live trade, paper | "Futures order commands have no `--validate` dry run; rehearse on `kraken futures paper`." Approval for place, edit, cancel. |
| kraken-futures-risk | Leverage, funding, margin, unwind queue | `futures leverage`, `set-leverage`, `accounts`, `positions`, `unwind-queue`, `set-pnl-preference` | live trade (config), read | "Alert when margin ratio exceeds 0.7"; `set-leverage` and `set-pnl-preference` are dangerous. |
| kraken-liquidation-guard | Margin monitoring, emergency flatten, top-up | `futures accounts`, `cancel-all --yes`, `order ... --reduce-only`, `futures transfer`, `wallet-transfer` | live trade, live funds | "Alert at 0.5 ratio; act at 0.7." "Emergency flatten requires human approval unless the agent operates at autonomy level 4+." |
| kraken-basis-trading | Delta-neutral spot long plus futures short | `ticker`, `futures ticker`, `order buy`, `futures order sell`, `--reduce-only` | live trade | "Never enter a basis trade without confirming both legs will execute." Human approval for all live entries and exits. |
| kraken-funding-carry | Collect perp funding with a spot hedge | `futures historical-funding-rates`, `order`, `futures order` | live trade | "Always hedge carry positions to avoid directional exposure." Approval for all entries and exits. |
| kraken-dca-strategy | Recurring buys, cost basis tracking | `workspace`, `paper buy`, `order buy --validate`, `trades-history --consolidate-taker` | paper, live trade | "Never execute live DCA buys without explicit human approval ... (unless operating at autonomy level 4+)." |
| kraken-grid-trading | Layered limit order grid | `paper buy/sell`, `order buy`, `order batch`, `order cancel-all`, `ws executions` | paper, live trade | "Never place or cancel live grid orders without explicit human approval." Notes grids lose in strong trends. |
| kraken-rebalancing | Allocation drift and rebalance trades | `balance`, `ticker`, `order sell/buy --validate` | paper, live trade | "Never execute rebalance trades without explicit human approval." Present full plan first; sells before buys. |
| kraken-twap-execution | Time-sliced large orders | `order buy --validate`, loop with `sleep`, `trades-history` | paper, live trade | The sample loop sends every slice unattended: "run it only at autonomy level 4+. Below that, run one validated slice per approved call". |
| kraken-funding-ops | Deposits, withdrawals, wallet transfers | `deposit`, `withdraw`, `withdrawal info/addresses/cancel`, `wallet-transfer`, `futures transfer` | live funds | "Withdrawals are flagged as dangerous. Never execute without explicit human approval." Verify the pre-approved address. |
| kraken-earn-staking | Earn strategies, allocate, deallocate | `earn strategies/allocations/allocate/deallocate` | live funds | "Allocate and deallocate are flagged as dangerous. Never execute without explicit human approval." Warn about lock-ups. |
| kraken-tax-export | Trade, ledger and cost basis exports | `export-report`, `export-status`, `export-retrieve`, `export-delete`, `ledgers` | read (export-delete is dangerous) | "Never delete a report without explicit human approval." |
| kraken-portfolio-intel | Balances, P&L, history, fees | `balance`, `trade-balance`, `trades-history`, `ledgers`, `positions --show-pnl` | read | None beyond `export-delete` confirmation. |
| kraken-subaccount-ops | Subaccount creation, transfers, isolation | `subaccount create/transfer`, `futures subaccounts`, `set-subaccount-status` | live funds | "Subaccount transfers and `subaccount create` are flagged as dangerous ... a created subaccount cannot be removed through the API." |
| recipe-playground-dca | Time-gated paper DCA driver | `session`, `order buy --workspace dca`, `ticker`, `ohlc` | paper | Every round exits unless workspace mode is `paper`; "Never permit a bare `kraken order buy`". |
| recipe-playground-dca-triggered | Dip-triggered paper DCA on a stream | `ws ticker`, `order buy --workspace dcatrig` | paper | Stream starts only if workspace mode is `paper`; `min_spacing_s` rate limit. |
| recipe-playground-rebalance | Paper rebalance driver | `paper balance`, `order buy/sell --workspace rebalance` | paper | Mode check each round; sells before buys; fresh balance read every round. |
| recipe-playground-price-alert | Recorded price-level alerts | `ticker`, `session note/state` | read, paper | "Alert-only ... never places a trade." |
| recipe-playground-webhook | Webhook signals to paper orders | local HTTP listener on 127.0.0.1, `order --workspace hook` | paper | Untrusted payload: allowlist, numeric bound, `max_notional_per_signal`, `max_signals`, optional token. |
| recipe-session-post-mortem | Explain a stopped session's P&L | `explain pnl`, `replay` | read | "Read-only." Every number must trace to command output. |
| recipe-start-dca-bot | Paper-test then live DCA | `workspace create`, `paper buy`, `auth test`, `order buy --validate`, `order buy` | paper, live trade | "Live orders spend real money. Paper-test first, then promote with explicit approval." Run live steps with no workspace active. |
| recipe-launch-grid-bot | Paper-test then live grid | `paper buy/sell`, `order cancel-after 3600`, `order buy`, `ws executions` | paper, live trade | "Always paper-test first." Dead man's switch before live grid; approval to place and replace levels. |
| recipe-trailing-stop-runner | Market entry plus trailing stop | `order buy --type market`, `order sell --type trailing-stop` | live trade | Entry "requires human approval". The stop is placed after the fill; there is no validate step in this recipe. |
| recipe-basis-trade-entry | Enter a basis trade | `ticker`, `futures ticker`, `order buy`, `futures order sell` | live trade | "A single-leg fill is a directional bet." Cancel the unfilled leg. |
| recipe-futures-hedge-spot | Short futures against spot holding | `balance`, `futures order sell`, `futures cancel-after` | live trade | Short needs approval; order size is the raw `BTC` balance variable. |
| recipe-funding-rate-scan | Rank perps by funding carry | `futures instruments`, `tickers`, `historical-funding-rates` | read | None needed. |
| recipe-paper-strategy-backtest | Multi-round paper validation | `workspace create/reset`, `paper buy/sell` | paper | "A strategy that is only marginally profitable on paper with fees and slippage enabled is likely unprofitable live." |
| recipe-weekly-rebalance | Weekly live rebalance | `balance`, `ticker`, `order sell/buy --validate` | live trade | Present plan; sells first; "requires human approval". |
| recipe-daily-pnl-report | Daily P&L summary | `balance`, `trades-history`, `ledgers`, `futures accounts` | read | None needed. |
| recipe-portfolio-snapshot-csv | Portfolio snapshot to CSV | `balance`, `ticker`, `earn allocations` | read | None needed. |
| recipe-subaccount-capital-rotation | Move capital between subaccounts by performance | `subaccount transfer`, `balance` | live funds | "Transfers move real funds. Always confirm IIBANs and amounts." |
| recipe-fee-tier-progress | Distance to next fee tier | `volume`, `futures fee-schedule-volumes` | read | None needed. |
| recipe-morning-market-brief | Morning prices and portfolio state | `status`, `ticker`, `ohlc`, `balance`, `open-orders` | read | None needed. |
| recipe-multi-pair-breakout-watch | Breakout alerts across pairs | `ws ticker`, `ohlc` | read | Alert only. |
| recipe-track-orderbook-depth | Orderbook imbalance monitor | `orderbook`, `ws book` | read | Alert only. |
| recipe-price-level-alerts | Price level notifications | `ws ticker --event-trigger bbo` | read | Alert only. |
| recipe-emergency-flatten | Cancel everything and close positions | `order cancel-all --yes`, `futures cancel-all --yes`, `futures order --reduce-only` | live trade | "`--yes` ... is only appropriate at autonomy level 4+". Step 1 and 2 are written with `--yes` regardless. |
| recipe-drawdown-circuit-breaker | Halt on drawdown threshold | `balance`, `ticker`, `order cancel-all`, `futures cancel-all` | live trade | Agent-side polling only; "Wait for explicit user instruction before resuming any trading activity". |
| recipe-withdrawal-to-cold-storage | Withdraw to a verified address | `withdrawal addresses --verified true`, `withdrawal info`, `withdraw` | live funds | "Withdrawals are irreversible once confirmed on-chain." Explicit approval. |
| recipe-earn-yield-compare | Compare staking yields | `earn strategies`, `earn allocations`; optional allocate and deallocate | read, live funds | Step 8 reallocation only "If user approves". |

## Notable guardrail gaps

1. Order placement never prompts in the CLI. The skills say so. Human approval is a prompt convention, so a model at autonomy level 4 passes `--yes` and places orders with no human step. The only hard limits are the API key scopes and the MCP service list.
2. MCP elicitation falls back to a model-set `acknowledged=true` on clients that cannot show a prompt. In that case "dangerous" is a speed bump.
3. Paper vs live separation depends on the model passing `--workspace <name>` on every call (an exported `KRAKEN_WORKSPACE` does not reach later shells such as `/loop` fires). A dropped flag means a real order. The driver recipes add a mode check, but that check is also a shell snippet the model runs.
4. No CLI position size, notional, frequency or pair limits (stated). Even the webhook recipe's `max_notional_per_signal` is agent-side bash.
5. `recipe-emergency-flatten` steps 1 and 2 include `--yes` while the caution says omit it below level 4. A model following the numbered steps literally skips the confirmation.
6. `recipe-trailing-stop-runner` and `recipe-futures-hedge-spot` have no `--validate` step. The futures hedge passes the raw spot `BTC` balance as the futures order size, with no conversion step in the recipe.
7. `feedback` is in the default MCP set and uploads text or a local file the model names, with no approval step (`kraken-mcp-integration`, `kraken-setup`). Exfiltration path if the agent reads untrusted input.
8. Dead man's switch `order cancel-after` is account-wide, cancelling every order on the key including other workspaces (`kraken-paper-to-live`), and is refused inside a paper workspace.
9. A live workspace is a CLI-side allocation of the real account, not a Kraken subaccount: "anything using the same API key can spend allocated funds".
10. Drift to check against `brokers/kraken.md`: the skills say every marketplace listing ships `-s market,paper,feedback`, while that entry's connect line uses `-s market,account,paper`. The bare `kraken-mcp` default (no `-s`) is `market,account,paper,workspace,feedback`.

## Skill details

Where a skill is flagged "model-enforced" below, the instruction is prose only. Full text is included for every skill that places or manages orders, funds, risk or the paper to live path. Read-only and paper-driver skills get a summary and short verbatim quotes, since they carry no live-trade capability.

## Core

### kraken-shared

Capability: all (runtime contract)

Defines the invocation contract (`kraken <command> -o json 2>/dev/null`, parse stdout only, route on `.error`) and the safety list. Says the catalog marks 43 commands `dangerous: true` and that `workspace create --mode live` and `recipe run --real-account` must be treated as dangerous. Approval requirements are model-enforced (prompt text). The warning that "Commands execute real financial transactions" is in the first lines.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-shared
version: 1.1.0
description: "Shared runtime contract for kraken-cli: auth, invocation, parsing, and safety."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-shared

**This tool is experimental. Commands execute real financial transactions on the Kraken exchange. Test with `kraken paper` before using real funds. See `DISCLAIMER.md` for full terms.**

## Invocation Contract

Always call:

```bash
kraken <command> [args...] -o json 2>/dev/null
```

Rules:
- Parse `stdout` only.
- Treat `stderr` as diagnostics.
- Exit code `0` means success.
- Non-zero exit means failure with JSON envelope in `stdout`.
- Streaming commands (`session start`, `record`, `ws`, `streamd`) emit JSONL: match lines by their `"type"` field (e.g. scan for `"type":"session_started"` to get the session handle) — never assume a line position, because live market frames interleave on `stdout`.
- Probe capability, not version, at the start of a loop: `kraken session --help >/dev/null 2>&1` exits `0` on a build that speaks this contract and `2` on an older one — `kraken --version` cannot tell them apart across a vocabulary change.
- Market-data field names are readable (`last_price`, not `c[0]`). Only `ticker` still keys on Kraken's INTERNAL pair name (`XXBTZUSD`, not `BTCUSD`) — reach its fields with `.[]` or `to_entries`, never a hardcoded key. `ohlc`/`trades`/`spreads` reshape to `{pair, …}`: fold the named row array (`.candles`/`.trades`/`.spreads`) directly, never the whole object — `ohlc` keeps a sibling `last` cursor that poisons naive iteration. `orderbook` drops the wrapper to top-level `.asks`/`.bids`.
- Validate every number a READ produces before it gates an order or lands in a reason. On an empty or failed read, record `kraken session note --kind alert --reason "READ failed: ..."` and end the step — never interpolate a failed read into a reason, or the decision log fills with plausible-looking false evidence.

## Authentication

```bash
export KRAKEN_API_KEY="your-key"
export KRAKEN_API_SECRET="your-secret"
```

Optional futures credentials:

```bash
export KRAKEN_FUTURES_API_KEY="your-futures-key"
export KRAKEN_FUTURES_API_SECRET="your-futures-secret"
```

Public market data and paper trading require no credentials.

## Error Routing

Route on `.error`:
- `auth`: re-authenticate
- `rate_limit`: read `suggestion` and `docs_url` fields, adapt strategy
- `network`: retry with exponential backoff; if `verify_first` is `true`, check order or transfer state first
- `validation`: fix inputs, do not retry unchanged request
- `api`: inspect request parameters

## Safety

The catalog marks 43 commands as `dangerous: true`. Always check the `dangerous` field in `agents/tool-catalog.json` before executing a command. Two more carry `effect: local_or_live` and `dangerous: false`, because one argument points them at the real account: `workspace create --mode live` and `recipe run --real-account`. Treat them as dangerous whenever that argument is set.

Require explicit human approval before:
- live buy or sell orders (spot and futures)
- order amendments, edits, and batch operations
- cancel and cancel-all operations
- withdrawals and wallet transfers
- earn allocate/deallocate
- subaccount transfers
- WebSocket order mutations
- `kraken workspace promote`, which switches a paper workspace to live, and `kraken workspace create --mode live` or `kraken recipe run --real-account`
- `kraken workspace reset` and `kraken paper reset`
- `kraken auth switch` and `kraken auth reset`, which change or delete the key that signs every request
- `kraken auth set` when an API key is already stored: it overwrites that key without asking

Never start `kraken auth login`. It is a browser sign-in for a person, and it refuses to run without a terminal.

Use paper trading for dry runs:

```bash
kraken workspace create sandbox --capital 10000 --mode paper -o json
export KRAKEN_WORKSPACE=sandbox
```

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-autonomy-levels

Capability: read, paper, live trade, live funds

Five levels. L1 query-only key; L2 paper; L3 live orders with a human confirming each; L4 autonomous, no human in the loop, restricted key and dead man's switch required; L5 fund movement. Model-enforced only: the L3 confirm step, the position limits, "Paper trading (Level 2) for at least a week before supervised trading". Key statement: "Placing an order never prompts at any level: the Level 3 approval is a step the agent takes itself."

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-autonomy-levels
version: 1.0.0
description: "Progress from manual trading to full agent autonomy with controlled risk at each level."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-autonomy-levels

Use this skill to help a trader move from hands-on CLI usage to fully autonomous agent trading in safe, incremental steps.

## Level 1: Read-Only Agent

The agent reads market data and account state. No API key needed for public data; a query-only key for account data.

**Kraken API key permissions:** Query Funds, Query Open Orders & Trades

```bash
export KRAKEN_API_KEY="query-only-key"
export KRAKEN_API_SECRET="query-only-secret"

kraken ticker BTCUSD -o json 2>/dev/null
kraken balance -o json 2>/dev/null
kraken open-orders -o json 2>/dev/null
```

The agent can inform, alert, and recommend. It cannot place orders, cancel orders, or move funds.

## Level 2: Paper Trading Agent

The agent tests strategies against live prices with zero risk. No API key needed.

```bash
kraken workspace create sandbox --capital 10000 --mode paper -o json 2>/dev/null
export KRAKEN_WORKSPACE=sandbox
kraken paper buy BTCUSD 0.01 -o json 2>/dev/null
kraken workspace status -o json 2>/dev/null
kraken workspace reset -o json --yes 2>/dev/null  # dangerous: confirm with the user first
```

Run paper strategies repeatedly. Compare results across parameter changes. Only move to Level 3 after consistent paper performance.

## Level 3: Supervised Trading Agent

The agent places real orders, but a human confirms each one. The API key has trading permissions, but the agent validates before executing and waits for human approval.

**Kraken API key permissions:** Query Funds, Create & Modify Orders, Cancel/Close Orders

```bash
unset KRAKEN_WORKSPACE  # live orders run outside the paper workspace
export KRAKEN_API_KEY="trade-key"
export KRAKEN_API_SECRET="trade-secret"

# Step 1: Agent validates the order (no submission)
kraken order buy BTCUSD 0.001 --type limit --price 50000 --validate -o json 2>/dev/null

# Step 2: Agent presents the validated order to the human
# Step 3: Human approves or rejects

# Step 4: Agent executes only after approval
kraken order buy BTCUSD 0.001 --type limit --price 50000 -o json 2>/dev/null
```

Safety controls at this level:
- Always `--validate` before executing
- Always enable the dead man's switch for the session: `kraken order cancel-after 300 -o json`
- Check `open-orders` after every trade to verify state

## Level 4: Autonomous Trading Agent

The agent trades independently. No human in the loop. The trader trusts the agent and its strategy.

**Kraken API key permissions:** Create & Modify Orders, Cancel/Close Orders, Query Funds

```bash
export KRAKEN_API_KEY="full-trade-key"
export KRAKEN_API_SECRET="full-trade-secret"
```

The agent operates on its own schedule and passes `--yes` to the commands that prompt: cancel-all, withdrawals and transfers, earn allocations, `workspace create --mode live`, `workspace reset`, `workspace promote`, and `recipe run --real-account`. Placing an order never prompts at any level: the Level 3 approval is a step the agent takes itself.

**Required safeguards at this level:**

1. **Restricted API key.** Never use a key with withdrawal permissions for an autonomous agent. Create a key that can trade but cannot withdraw funds.

2. **Dead man's switch.** Start every session with `cancel-after` so all orders auto-cancel if the agent crashes or disconnects:
   ```bash
   kraken order cancel-after 600 -o json 2>/dev/null
   ```
   Refresh periodically. If the agent stops refreshing, all orders cancel.

3. **Position limits in agent code.** The CLI does not enforce position size or frequency limits. Build these in your agent logic:
   - Maximum order size per trade
   - Maximum open positions
   - Maximum trades per hour
   - Pair allowlist (only trade specific pairs)

4. **Error handling.** Autonomous agents must handle every error category:
   - `rate_limit`: back off, reduce frequency
   - `network`: retry with backoff; if `verify_first` is `true`, check state first so an order is never double-submitted
   - `auth`: stop trading, alert the trader
   - `validation`: log and skip, do not retry unchanged

5. **Monitoring.** Run a separate read-only agent (Level 1) that monitors positions and alerts the trader if thresholds are breached.

## Level 5: Autonomous Agent with Fund Management

The agent can also move funds (deposits, withdrawals, transfers between wallets). This is the highest trust level.

**Kraken API key permissions:** All permissions including Withdraw Funds

This level is rare and high-risk. Only appropriate when:
- The agent manages a treasury or rebalances across exchanges
- The withdrawal addresses are pre-approved and whitelisted in Kraken's account settings
- Kraken's withdrawal address lock is enabled (prevents adding new addresses via API)

## Choosing the Right Level

| Level | Agent can | Human involvement | Risk |
|-------|-----------|-------------------|------|
| 1 | Read data | None | Zero |
| 2 | Paper trade | None | Zero |
| 3 | Trade with approval | Confirms every order | Low |
| 4 | Trade autonomously | Monitors, intervenes if needed | Medium |
| 5 | Trade and move funds | Monitors | High |

## Progression Rule

Move to the next level only after the agent demonstrates consistent behavior at the current level. Paper trading (Level 2) for at least a week before supervised trading (Level 3). Supervised trading for at least a week before autonomous (Level 4).

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-mcp-integration

Capability: depends on -s service list

Service table (market 11 tools, account 18, trade 9, paper 17, workspace 20, futures 39, futures-paper 17, funding 10, earn 6, auth 2, subaccount 2, feedback 1; 152 total). Mechanically enforced: service scope selection and `destructive_hint`. Partly mechanical: MCP elicitation, falling back to model-written `acknowledged=true`. `--allow-dangerous` disables the per-call gate. Gemini CLI extension install is noted.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-mcp-integration
version: 1.1.0
description: "Connect MCP clients to kraken-cli for native tool calling without subprocess wrappers."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken-mcp"]
---

# kraken-mcp-integration

Use this skill to connect any MCP-compatible client to `kraken-cli` for structured tool calling over stdio.

MCP tool calls execute through the same command path as CLI commands, so error handling and rate-limit behavior is identical between MCP and CLI.

## Supported Clients

Claude Desktop, Codex, Gemini CLI, Cursor, VS Code, Windsurf, and other clients that start local stdio MCP servers. Most take an `mcpServers` JSON entry; VS Code and Codex use their own formats (below).

## Setup

### 1. Configure your MCP client

Add this to your MCP client configuration (Claude Desktop: `claude_desktop_config.json`, Cursor: `.cursor/mcp.json`, etc.):

```json
{
  "mcpServers": {
    "kraken": {
      "command": "kraken-mcp",
      "args": ["-s", "market,paper,feedback"]
    }
  }
}
```

VS Code takes the same entry under a top-level `"servers"` key in `.vscode/mcp.json`. Codex reads TOML in `~/.codex/config.toml`:

```toml
[mcp_servers.kraken]
command = "kraken-mcp"
args = ["-s", "market,paper,feedback"]
```

`-s market,paper,feedback` is the service list every marketplace listing ships:
public market data, paper trading, and the feedback tool, which uploads the text
it is given, or a local file it names, to Kraken. The file upload has no approval step, so a model can send any file it can name, including the CLI config file that holds your stored keys; drop `feedback` from `-s` for an agent that reads untrusted input. No real funds can be touched until you opt in explicitly by
expanding the service list. See [Enabling live trading](#enabling-live-trading)
below.

Started with no `-s`, `kraken-mcp` serves `market,account,paper,workspace,feedback`.
That adds account reads and the workspace, session and recipe tools, and with
them five gated tools: `export-delete`, `export-retrieve`, `workspace reset`,
`workspace promote`, and `workspace create` with mode `live`. `paper reset` is
gated in both sets.

Credential resolution follows the standard CLI precedence: command-line
flags, then `KRAKEN_API_KEY` / `KRAKEN_API_SECRET` in the MCP server's `env`
block, then the active stored key in a secure local config file managed by
the CLI (stored with user-only permissions in your OS's standard config
directory): the key from `kraken auth set` or `kraken setup`, or the sign-in
key from `kraken auth login`, as `kraken auth switch` selects. The MCP server
and the standalone CLI share the same config file, and the server reads it
again for each call, so a switch reaches a running server. When an active
sign-in key expires, calls that need a key fail with an `auth` error; the
server does not fall back to the other key.

### 2. Set credentials (only needed for live trading)

If you stay on `market,paper,feedback`, skip this step — paper trading needs no keys.

For live trading, the MCP server reads credentials from environment variables:

```bash
export KRAKEN_API_KEY="your-key"
export KRAKEN_API_SECRET="your-secret"
```

### 3. Restart your MCP client

The client discovers tools on startup.

## Service Filtering

Control which command groups the MCP server exposes:

```bash
kraken-mcp -s market                    # public data only (safe, no auth)
kraken-mcp -s market,paper,feedback              # market data + paper trading (marketplace default)
kraken-mcp                              # binary default: market,account,paper,workspace,feedback
kraken-mcp -s market,trade,paper        # add live trading
kraken-mcp -s market,account,trade      # add account queries and live trading
kraken-mcp -s all                       # everything (152 tools, includes funding/earn/subaccount)
```

Keep the service list to what you need. MCP clients typically handle 50-100 tools well.

| Service | Auth | Tools | Risk |
|---------|------|-------|------|
| market | No | 11 | None |
| account | Yes | 18 | Reads, plus `export-delete` and `export-retrieve` (dangerous) |
| trade | Yes | 9 | Orders (dangerous) |
| paper | No | 17 | Simulation, lab and explain; `paper reset` (dangerous) |
| workspace | No | 20 | Workspaces, sessions, recipes, plugins; `workspace promote` and `reset` (dangerous), `workspace create` with mode `live` (gated) |
| futures | Mixed | 39 | Orders (dangerous) |
| futures-paper | No | 17 | None (simulation) |
| funding | Yes | 10 | Withdrawals (dangerous) |
| earn | Yes | 6 | Staking (dangerous) |
| auth | Mixed | 2 | Read-only (auth login/set/switch/reset excluded) |
| subaccount | Yes | 2 | Transfers (dangerous) |
| feedback | No | 1 | Uploads text or a local file to Kraken (no approval) |

The counts are the tools each service serves, 152 in all. Streaming, interactive and withheld commands (such as `auth switch`) run only from the CLI.

## Enabling live trading

Every `kraken-cli` marketplace listing ships with `-s market,paper,feedback` by default,
so a fresh install can never place a real order. To opt in to live trading,
edit the MCP server args in your client's config and widen the service list:

```json
{
  "mcpServers": {
    "kraken": {
      "command": "kraken-mcp",
      "args": ["-s", "market,trade,paper"],
      "env": {
        "KRAKEN_API_KEY": "your-key",
        "KRAKEN_API_SECRET": "your-secret"
      }
    }
  }
}
```

Recommended upgrade path:

1. Start with `market,paper,feedback` (the marketplace default).
2. Add `trade` once you are comfortable and have an API key scoped to orders
   only. See the "Recommended key scope" section of `skills/kraken-setup/SKILL.md`
   before generating a key.
3. Add `account` if you want the agent to read balances and positions.
4. Only enable `funding`, `earn`, `subaccount`, or `all` if you specifically
   need those workflows. Each of these unlocks tools that can move funds off
   the exchange or alter account structure.

Switching to `-s all` expands the set of tools the agent can reach by
prompt-injection or mistake. Prefer a narrow list and widen it deliberately.

## Tool Results

`structuredContent` is always a JSON object. An array or scalar output (for example `kraken_deposit_status`) arrives as `{"result": <output>}`; the text block carries the output as `-o json` prints it. A failed call returns the CLI error envelope: on `"verify_first": true`, check order or transfer state before calling again.

## Safety

Dangerous tools include `[DANGEROUS: requires human confirmation]` in their description and carry the MCP `destructive_hint` annotation. `kraken_workspace_create` with mode `live` is gated the same way. In guarded mode (the default for any service list), the server asks the operator to approve each such call through MCP elicitation. A client without elicitation cannot show that prompt, so the server accepts `acknowledged=true` in the tool arguments instead, and the model writes those arguments: no person is asked unless the client's own tool-approval prompt is on. Use guarded mode with a client that supports elicitation, or keep the client's per-tool approval enabled. In autonomous mode (`--allow-dangerous`), the per-call confirmation is disabled. MCP clients that respect annotations may still prompt at the client layer.

For fully autonomous operation, see `skills/kraken-autonomy-levels/SKILL.md`.

## Gemini CLI Extension

If using Gemini CLI, install the extension directly:

```bash
gemini extensions install https://github.com/krakenfx/kraken-cli
```

The `gemini-extension.json` includes `mcpServers` config, so the MCP server starts automatically.

## Troubleshooting

**"No tools found"**: Check that `kraken-mcp` is on your PATH and the service list is valid. Releases before this one installed `kraken` only: run the one-line installer again. Run `kraken-mcp -s market` manually to verify it starts; it prints one `server_start` line, then waits for a client. Stop it with Ctrl-C.

**Auth errors on tool calls**: Set `KRAKEN_API_KEY` and `KRAKEN_API_SECRET` in the environment where your MCP client runs.

**Too many tools**: Reduce the service list. `kraken-mcp -s market,trade` is a good starting point.

**Streaming commands not available**: WebSocket streaming commands are excluded from MCP v1. Use `kraken ws ...` directly from the terminal for streaming.

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-setup

Capability: read, paper (live optional)

First-run install and credential guidance; not a trading skill. Installer URL, `cargo install --locked --git`, paper workspace quickstart, futures paper init, recommended key scope. Verbatim quotes: "Never enable `Withdraw Funds`." and "Start read-only." and "Enable IP allowlisting if the agent runs from a static IP." Marketplace default is `-s market,paper,feedback`. `kraken auth login` is for a person at a terminal; "never an agent". Full text omitted because it is setup, not trading; the license would permit it.

### kraken-rate-limits

Capability: read

Explains Spot REST counter (Starter 15, decay 0.33/s), trading-engine per-pair counter (Starter 60), futures budgets (500 per 10s on /derivatives; /history pool of 100 refilling 100 per 10 min). "The CLI does not pre-throttle or retry rate-limited requests." Agents read `suggestion` and `docs_url`. No trade capability, so no full text.

### kraken-order-types

Capability: live trade

Reference for market, limit, stop-loss, stop-loss-limit, take-profit, take-profit-limit, trailing-stop and trailing-stop-limit on spot; market, limit, stop, trailing-stop, ioc, fok, post on futures; modifiers `--oflags post|fciq|fcib|nompp`, `--timeinforce`, `--reduce-only`, `--trigger-signal`. Notes `kraken order` defaults to `--type limit`. Only `order buy/sell/batch`, `ws add-order`, `ws batch-add` take `--validate`.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-order-types
version: 1.0.0
description: "Complete reference for all spot and futures order types and modifiers."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-order-types

Use this skill for:
- choosing the right order type for a given scenario
- understanding order modifiers (post-only, reduce-only, GTC, IOC, FOK)
- constructing complex orders with stop-loss and take-profit
- batch and conditional order patterns

## Spot Order Types

### Market

Fills immediately at best available price. Simple, guaranteed fill, but no price control. `kraken order` and `kraken futures order` default to `--type limit`, so pass `--type market` explicitly.

```bash
kraken order buy BTCUSD 0.001 --type market -o json 2>/dev/null
kraken order sell BTCUSD 0.001 --type market -o json 2>/dev/null
```

### Limit

Fills at the specified price or better. No fill guarantee if price never reaches the level.

```bash
kraken order buy BTCUSD 0.001 --type limit --price 50000 -o json 2>/dev/null
```

### Stop-Loss

Triggers a market order when the price crosses the stop level.

```bash
kraken order sell BTCUSD 0.001 --type stop-loss --price 48000 -o json 2>/dev/null
```

### Stop-Loss Limit

Triggers a limit order when the price crosses the stop level.

```bash
kraken order sell BTCUSD 0.001 --type stop-loss-limit --price 48000 --price2 47500 -o json 2>/dev/null
```

### Take-Profit

Triggers a market order when the price reaches the profit target.

```bash
kraken order sell BTCUSD 0.001 --type take-profit --price 55000 -o json 2>/dev/null
```

### Take-Profit Limit

Triggers a limit order at the profit target.

```bash
kraken order sell BTCUSD 0.001 --type take-profit-limit --price 55000 --price2 54800 -o json 2>/dev/null
```

### Trailing Stop

Stop level moves with the market to lock in profits.

```bash
kraken order sell BTCUSD 0.001 --type trailing-stop --price +500 -o json 2>/dev/null
```

### Trailing Stop Limit

Trailing stop that triggers a limit order instead of market.

```bash
kraken order sell BTCUSD 0.001 --type trailing-stop-limit --price +500 --price2=-100 -o json 2>/dev/null
```

## Spot Order Modifiers

| Flag | Effect |
|------|--------|
| `--oflags post` | Post-only: reject if it would immediately fill (maker only) |
| `--oflags fciq` | Fee in quote currency |
| `--oflags fcib` | Fee in base currency |
| `--oflags nompp` | No market price protection |
| `--timeinforce GTC` | Good-til-cancelled (default) |
| `--timeinforce IOC` | Immediate-or-cancel: fill what you can, cancel the rest |
| `--timeinforce GTD` | Good-til-date: cancel after specified expiry |
| `--validate` | Validate only, do not submit |

## Futures Order Types

### Market

```bash
kraken futures order buy PF_XBTUSD 1 --type market -o json 2>/dev/null
```

### Limit

```bash
kraken futures order buy PF_XBTUSD 1 --type limit --price 50000 -o json 2>/dev/null
```

### Stop

```bash
kraken futures order sell PF_XBTUSD 1 --type stop --stop-price 48000 --trigger-signal mark -o json 2>/dev/null
```

### Trailing Stop (Futures)

```bash
kraken futures order sell PF_XBTUSD 1 --type trailing-stop --trailing-stop-max-deviation 500 --trailing-stop-deviation-unit quote_currency --trigger-signal mark -o json 2>/dev/null
```

## Futures Order Modifiers

| Flag | Effect |
|------|--------|
| `--reduce-only` | Close existing position only, never open new |
| `--trigger-signal mark` | Trigger on mark price |
| `--trigger-signal index` | Trigger on index price |
| `--trigger-signal last` | Trigger on last traded price |
| `--client-order-id <ID>` | Attach a custom ID for tracking |

## Order Selection Guide

| Goal | Order Type |
|------|-----------|
| Buy now at any price | market |
| Buy at a specific price or better | limit |
| Protect downside if price drops | stop-loss |
| Lock in profit if price rises | take-profit |
| Trail a rising price and sell on reversal | trailing-stop |
| Earn maker rebates | limit + `--oflags post` |
| Fill what you can now, cancel the rest | limit + `--timeinforce IOC` (spot), or futures `--type ioc` with `--price` |
| Fill completely now or not at all | futures `--type fok` with `--price` |

## Validation

Validate spot orders before submitting. Only `kraken order buy`, `order sell`, `order batch`, `ws add-order` and `ws batch-add` take `--validate`; futures orders, amends, edits and cancels have no dry run, so each needs explicit approval. Rehearse futures orders on `kraken futures paper`.

```bash
kraken order buy BTCUSD 0.001 --type limit --price 50000 --validate -o json 2>/dev/null
```

## Hard Rules

- All order placement commands are dangerous. Never execute without explicit human approval.
- Always validate spot orders with `--validate` before live submission.
- Use `--reduce-only` on futures exits to prevent accidental position flips.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-error-recovery

Capability: live trade

Error categories (`auth`, `rate_limit`, `network`, `validation`, `api`), duplicate prevention via `open-orders`, `trades-history`, `--cl-ord-id`, `verify_first` flag, partial fills, stuck orders. Model-enforced: never blind-retry; "Resubmitting, amending or cancelling a live order needs the same explicit user approval as the original order, unless the agent runs at autonomy level 4+."

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-error-recovery
version: 1.0.0
description: "Handle order failures, network errors, and duplicate submissions safely."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
    skills: ["kraken-shared"]
---

# kraken-error-recovery

Use this skill for:
- recovering from failed order submissions
- preventing duplicate orders after network errors
- handling partial fills and stuck states
- building resilient agent loops

## Error Categories

Parse the `.error` field from the JSON response:

| Category | Meaning | Recovery |
|----------|---------|----------|
| `auth` | Credentials invalid or expired | Re-authenticate, do not retry |
| `rate_limit` | Too many requests | Read `suggestion` and `docs_url` fields, adapt strategy |
| `network` | Connection failed, or the response was lost after sending (`verify_first: true`) | Retry with backoff; with `verify_first`, see Duplicate Order Prevention |
| `validation` | Invalid request parameters | Fix inputs, do not retry unchanged |
| `api` | Exchange-side rejection | Inspect error message, adjust request |

## Duplicate Order Prevention

After a network error during order submission (`"verify_first": true`), the order may or may not have reached the exchange. Check before resubmitting:

```bash
kraken open-orders -o json 2>/dev/null
```

If the order appears in open-orders, do not resubmit. If absent:

```bash
kraken trades-history -o json 2>/dev/null
```

If the order filled immediately, it appears in trades. Only resubmit if the order is absent from both.

## Client Order ID for Idempotency

Use `--cl-ord-id` to tag orders with a unique identifier:

```bash
kraken order buy BTCUSD 0.001 --type limit --price 50000 --cl-ord-id "dca-2024-01-15-001" -o json 2>/dev/null
```

If the submission fails, query by client order ID to check if it reached the exchange:

```bash
kraken open-orders --cl-ord-id "dca-2024-01-15-001" -o json 2>/dev/null
```

Cancel by client order ID if needed:

```bash
kraken order cancel --cl-ord-id "dca-2024-01-15-001" -o json 2>/dev/null
```

## Network Error Recovery Pattern

```
1. Submit order (capture exit code and response)
2. If exit code != 0 and error == "network":
   a. Wait 2 seconds
   b. Check open-orders for the order (by cl-ord-id or recent orders)
   c. If found → order succeeded, proceed
   d. If not found → check trades-history
   e. If in trades → order filled, proceed
   f. If absent from both → safe to retry
3. Retry with same cl-ord-id
```

## Rate Limit Recovery

The CLI returns rate limit errors immediately with no internal retry. The error includes actionable fields for the agent to decide next steps.

On `rate_limit` error:

1. Read the `suggestion` field for specific guidance on what limit was hit and how to adapt.
2. Read the `docs_url` field for the relevant Kraken documentation.
3. Decide whether to retry (and when), reduce request frequency, or switch to WebSocket streaming for real-time data.
4. Resume with a single test call before continuing the loop.

```bash
# { "error": "rate_limit", "suggestion": "...", "docs_url": "...", "retryable": true }
kraken status -o json 2>/dev/null
```

If status succeeds, the rate limit has cleared.

## Partial Fill Handling

Limit orders may partially fill. Check order status:

```bash
kraken query-orders <TXID> -o json 2>/dev/null
```

The result is keyed by txid. Fields: `volume` (requested volume), `volume_executed` (filled volume), `status` (`open`, `closed`, `canceled`, `expired`, ...). `query-orders`, `open-orders` and `closed-orders` publish the same order shape.

If partially filled and the remaining volume is needed, amend or place a new order for the remaining amount.

## Stuck Order Resolution

An order stuck in `open` state that should have filled or been canceled:

1. Check the order:
   ```bash
   kraken query-orders <TXID> -o json 2>/dev/null
   ```
2. If still open, cancel:
   ```bash
   kraken order cancel <TXID> -o json 2>/dev/null
   ```
3. Verify cancellation:
   ```bash
   kraken open-orders -o json 2>/dev/null
   ```

## Hard Rules

- Never blind-retry an order after a network error; always check state first.
- Resubmitting, amending or cancelling a live order needs the same explicit user approval as the original order, unless the agent runs at autonomy level 4+.
- Use `--cl-ord-id` for all orders in automated loops.
- On auth errors, stop all activity and re-authenticate.
- Log every error and recovery action for post-session audit.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

## Market data

### kraken-market-intel

Capability: read

Snapshot (`ticker`, `orderbook`, `ohlc`) and stream (`ws ticker`) patterns. Read only. Verbatim: "Parse NDJSON line by line. Do not treat stream output as one JSON object."

### kraken-multi-pair

Capability: read

Multi-pair `ticker`, `ws ticker`, `pairs`, spread and volume screens, `futures tickers`. Read only.

### kraken-alert-patterns

Capability: read

Polling and streaming alerts for price, spread, volume, volatility, balance changes, fills and futures notifications. Verbatim: "Alerts are informational; they do not execute trades automatically."

### kraken-ws-streaming

Capability: read, live trade

Public and private WebSocket streams plus spot WebSocket order mutations (`ws add-order`, `amend-order`, `cancel-order`, `cancel-all`, `batch-add`, `batch-cancel`, `ws cancel-after`). The order mutation section is the trading part. Model-enforced: "Each one needs explicit human approval". Only `add-order` and `batch-add` have `--validate`.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-ws-streaming
version: 1.0.0
description: "Real-time data streaming via WebSocket for spot and futures."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-ws-streaming

Use this skill for:
- streaming live price, trade, and order book data
- monitoring authenticated feeds (executions, balances)
- futures-specific streaming (fills, positions, balances)
- building event-driven agent loops

## Output Format

All WebSocket commands emit NDJSON (one JSON object per line) to stdout. Parse line by line:

```bash
kraken ws ticker BTC/USD -o json 2>/dev/null | while read -r line; do
  echo "$line" | jq -r '.data[0].last // empty'
done
```

Do not attempt to parse the full stream as a single JSON object.

## Spot Public Streams

Ticker (best bid/ask, last price, volume):

```bash
kraken ws ticker BTC/USD -o json 2>/dev/null
```

Ticker with BBO trigger (fires only on best-bid/offer changes):

```bash
kraken ws ticker BTC/USD --event-trigger bbo -o json 2>/dev/null
```

Trades:

```bash
kraken ws trades BTC/USD -o json 2>/dev/null
```

Order book (L2, configurable depth):

```bash
kraken ws book BTC/USD --depth 10 -o json 2>/dev/null
```

OHLC candles:

```bash
kraken ws ohlc BTC/USD --interval 1 -o json 2>/dev/null
```

Instrument metadata:

```bash
kraken ws instrument BTC/USD -o json 2>/dev/null
```

## Spot Private Streams (Authenticated)

Execution updates (fills, order state changes):

```bash
kraken ws executions -o json 2>/dev/null
```

Balance updates:

```bash
kraken ws balances -o json 2>/dev/null
```

L3 order book:

```bash
kraken ws level3 BTC/USD -o json 2>/dev/null
```

## Futures Streams

Futures ticker:

```bash
kraken futures ws ticker PF_XBTUSD -o json 2>/dev/null
```

Futures trades:

```bash
kraken futures ws trades PF_XBTUSD -o json 2>/dev/null
```

Futures order book:

```bash
kraken futures ws book PF_XBTUSD -o json 2>/dev/null
```

## Futures Private Streams (Authenticated)

Fills:

```bash
kraken futures ws fills -o json 2>/dev/null
```

Open orders:

```bash
kraken futures ws open-orders -o json 2>/dev/null
```

Open positions:

```bash
kraken futures ws open-positions -o json 2>/dev/null
```

Balances and margins:

```bash
kraken futures ws balances -o json 2>/dev/null
```

Notifications:

```bash
kraken futures ws notifications -o json 2>/dev/null
```

Account log:

```bash
kraken futures ws account-log -o json 2>/dev/null
```

## WebSocket Order Mutations (Spot)

Place, amend, and cancel orders over WebSocket for lower latency. Each one
needs explicit human approval; `add-order` and `batch-add` take `--validate`
for a dry run, the others have none:

```bash
kraken ws add-order --order-type limit --side buy --symbol BTC/USD --order-qty 0.001 --limit-price 50000 --validate -o json 2>/dev/null
kraken ws amend-order --order-id OABC12 --limit-price 51000 -o json 2>/dev/null
kraken ws cancel-order --order-id OABC12 -o json 2>/dev/null
kraken ws cancel-all -o json 2>/dev/null
kraken ws batch-add --symbol BTC/USD --orders '[{"order_type":"limit","side":"buy","order_qty":0.001,"limit_price":50000},{"order_type":"limit","side":"sell","order_qty":0.001,"limit_price":70000}]' --validate -o json 2>/dev/null
kraken ws batch-cancel --orders OABC12 ODEF34 -o json 2>/dev/null
```

`batch-add` takes 2 to 15 orders and `batch-cancel` 2 to 50 IDs.

Dead man's switch over WebSocket:

```bash
kraken ws cancel-after 60 -o json 2>/dev/null
```

## Agent Loop Pattern

A typical event-driven agent reads from a stream and acts on each event:

```bash
kraken ws ticker BTC/USD -o json 2>/dev/null | while read -r line; do
  LAST=$(echo "$line" | jq -r '.data[0].last // empty')
  [ -z "$LAST" ] && continue
  # Agent logic: compare price to thresholds, trigger actions
done
```

For multi-feed agents, run each stream in a background process and merge events.

## Context Efficiency

- Use `--depth` to limit order book snapshot size.
- Use `--event-trigger bbo` on tickers to reduce noise.
- Prefer streaming over high-frequency REST polling.
- Close streams when no longer needed; each holds a connection.

## Hard Rules

- WebSocket order mutations are flagged as dangerous. Require human approval.
- Never treat NDJSON stream output as a single JSON document.
- Handle stream disconnects gracefully. Spot `kraken ws` streams reconnect with paced exponential backoff until interrupted, and print a `"type":"reconnected"` line before the fresh snapshot. `kraken futures ws` streams print no such line and exit with a `websocket` error after 12 reconnects in a row that never stay up for 30 seconds.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

## Spot trading

### kraken-spot-execution

Capability: live trade

Five-step flow: read price, `--validate`, ask for human confirmation, execute, verify with `open-orders`. Hard rule is model-enforced only: "Never execute live order commands without explicit user approval."

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-spot-execution
version: 1.0.0
description: "Execute spot orders with validation, confirmation gates, and post-trade checks."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-spot-execution

Use this skill for:
- placing spot buy or sell orders
- validating order payloads before submit
- checking open orders and trade history

## Safe Execution Flow

1. Read price:
   ```bash
   kraken ticker BTCUSD -o json 2>/dev/null
   ```
2. Validate order:
   ```bash
   kraken order buy BTCUSD 0.001 --type limit --price 50000 --validate -o json 2>/dev/null
   ```
3. Ask for explicit human confirmation.
4. Execute order:
   ```bash
   kraken order buy BTCUSD 0.001 --type limit --price 50000 -o json 2>/dev/null
   ```
5. Verify placement:
   ```bash
   kraken open-orders -o json 2>/dev/null
   ```

## Cancel and Safety

- Cancel one:
  ```bash
  kraken order cancel <TXID> -o json 2>/dev/null
  ```
- Dead-man switch:
  ```bash
  kraken order cancel-after 60 -o json 2>/dev/null
  ```

## Hard Rules

- Never execute live order commands without explicit user approval.
- Route failures by `.error` category.
- On `rate_limit`, read `suggestion` and `docs_url` fields, then adapt strategy.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-stop-take-profit

Capability: live trade

Stop-loss, take-profit, stop-loss-limit, trailing stop, bracket orders (three separate orders, not an OCO), futures stop with `--reduce-only`. Model-enforced: cancel the opposite leg when one side of a bracket fills. Note the bracket is not atomic; a gap between legs leaves exposure.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-stop-take-profit
version: 1.0.0
description: "Manage stop-loss and take-profit orders for risk-bounded positions."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
    skills: ["kraken-order-types"]
---

# kraken-stop-take-profit

Use this skill for:
- placing stop-loss orders to limit downside
- placing take-profit orders to lock in gains
- building bracket orders (entry + stop + target)
- trailing stops that follow a rising price

## Simple Stop-Loss

After buying, place a stop-loss below entry:

```bash
# Entry
kraken order buy BTCUSD 0.01 --type limit --price 60000 -o json 2>/dev/null

# Stop-loss (triggers market sell if price drops to 57000)
kraken order sell BTCUSD 0.01 --type stop-loss --price 57000 -o json 2>/dev/null
```

## Simple Take-Profit

Place a take-profit above entry:

```bash
# Take-profit (triggers market sell if price rises to 65000)
kraken order sell BTCUSD 0.01 --type take-profit --price 65000 -o json 2>/dev/null
```

## Bracket Order (Entry + Stop + Target)

Place all three as separate orders:

```bash
# 1. Entry
kraken order buy BTCUSD 0.01 --type limit --price 60000 -o json 2>/dev/null

# 2. Stop-loss
kraken order sell BTCUSD 0.01 --type stop-loss --price 57000 -o json 2>/dev/null

# 3. Take-profit
kraken order sell BTCUSD 0.01 --type take-profit --price 65000 -o json 2>/dev/null
```

When one exit fills, cancel the other to avoid double exposure:

```bash
kraken order cancel <OTHER_TXID> -o json 2>/dev/null
```

## Stop-Loss Limit (Tighter Control)

A stop-loss-limit triggers a limit order instead of market, giving price control but risking no fill in fast moves:

```bash
kraken order sell BTCUSD 0.01 --type stop-loss-limit --price 57000 --price2 56800 -o json 2>/dev/null
```

`--price` is the trigger, `--price2` is the limit price for the resulting order.

## Trailing Stop

Follows the market up, sells on reversal:

```bash
# Trail $500 below the high
kraken order sell BTCUSD 0.01 --type trailing-stop --price +500 -o json 2>/dev/null
```

As BTC rises from 60000 to 65000, the stop moves from 59500 to 64500. On a $500 drop from any high, it triggers.

## Futures Stop-Loss

```bash
kraken futures order sell PF_XBTUSD 1 --type stop --stop-price 57000 --trigger-signal mark --reduce-only -o json 2>/dev/null
```

Use `--trigger-signal mark` or `index` to avoid stop hunts on last-trade wicks. Use `--reduce-only` to prevent the stop from opening a short.

## Management Loop

Monitor stops after placement:

```bash
kraken open-orders -o json 2>/dev/null
```

Stream execution updates to detect when a stop triggers:

```bash
kraken ws executions -o json 2>/dev/null
```

When one side of a bracket fills, immediately cancel the other.

## Hard Rules

- Never place live stop/take-profit orders without explicit human approval.
- Always cancel the opposite leg when one side of a bracket fills.
- Use `--reduce-only` on futures exits to prevent accidental position flips.
- Validate spot orders before submission with `--validate`. Futures orders have no dry run: rehearse on `kraken futures paper`, then get approval for the exact command.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-fee-optimization

Capability: live trade

Maker/taker (starter 0.26% taker, 0.16% maker), post-only via `--oflags post`, fee currency flags, volume tiers, batch orders. Model-enforced: approval and `--validate`.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-fee-optimization
version: 1.0.0
description: "Minimize trading fees through maker orders, volume tiers, and fee-aware execution."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-fee-optimization

Use this skill for:
- understanding maker vs taker fee structures
- using post-only orders to guarantee maker rates
- tracking 30-day volume for tier progression
- choosing fee currency to minimize cost

## Fee Tiers

Check current 30-day volume and fee rates:

```bash
kraken volume --pair BTCUSD -o json 2>/dev/null
```

The response includes `volume` (30-day USD equivalent) and `fees` / `fees_maker` arrays showing the tier schedule.

## Maker vs Taker

- **Taker**: you remove liquidity (market orders, limit orders that fill immediately). Higher fee.
- **Maker**: you add liquidity (limit orders that rest on the book). Lower fee, sometimes zero.

At starter tier: 0.26% taker, 0.16% maker. The difference compounds over many trades.

## Post-Only Orders

Force maker execution by rejecting orders that would immediately fill:

```bash
kraken order buy BTCUSD 0.001 --type limit --price 50000 --oflags post -o json 2>/dev/null
```

If the order would cross the spread and fill as taker, it is rejected instead. This guarantees maker fees on every fill.

## Fee Currency Selection

By default, fees are deducted from the received currency. Override with:

```bash
kraken order buy BTCUSD 0.001 --type limit --price 50000 --oflags fciq -o json 2>/dev/null
```

| Flag | Fee taken from |
|------|---------------|
| `fciq` | Quote currency (e.g., USD) |
| `fcib` | Base currency (e.g., BTC) |

Paying fees in quote currency preserves your base asset balance, useful when accumulating.

## Volume-Based Optimization

Higher 30-day volume unlocks lower fees. Track progress:

```bash
kraken volume -o json 2>/dev/null
```

If close to the next tier threshold, consolidating trading activity (rather than splitting across exchanges) can push you into a cheaper bracket.

## Futures Fee Schedules

```bash
kraken futures feeschedules -o json 2>/dev/null
```

Futures fee volumes:

```bash
kraken futures fee-schedule-volumes -o json 2>/dev/null
```

## Fee-Aware Order Sizing

When buying a fixed dollar amount, account for fees in the volume calculation:

```bash
# $100 buy at starter taker rate (0.26%)
# Effective spend: $100 / 1.0026 = $99.74 worth of BTC
# Fee: ~$0.26
```

For precise accounting, check the fee field in the trade response after execution.

## Batch Orders for Fee Efficiency

Batch orders share a single API call, reducing overhead. Use when placing related orders:

```bash
kraken order batch orders.json --pair BTCUSD -o json 2>/dev/null
```

## Hard Rules

- Order placement commands are dangerous. Never execute without explicit human approval.
- Always `--validate` before submitting live orders.
- Post-only orders can be rejected; handle rejection gracefully and retry.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-paper-strategy

Capability: paper

Spot paper testing with configurable `--fee-rate` (default 0.26% taker) and `--slippage-rate` (default 0.0). Warns no partial fills or rejection. Migration rule lists three conditions, all model-judged.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-paper-strategy
version: 1.0.0
description: "Test strategy logic on paper trading before touching live funds."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-paper-strategy

Use this skill for:
- validating entry and exit logic on spot markets
- testing position sizing and simple rebalance loops
- rehearsing error handling without risk

For futures paper trading (leverage, margin, shorts, liquidation), see `kraken futures paper` commands. This skill covers spot paper trading only.

## Limitations

Paper trading runs locally against live market prices. It simulates fees and slippage but has other limitations.

- **Fees are configurable.** A 0.26% taker fee (Kraken Starter tier) is applied by default. Override with `--fee-rate` at `workspace create`; `workspace reset` can change it. Real fees vary by volume tier and maker/taker status. Live maker fees are lower (0.16%).
- **Slippage is configurable.** A flat slippage rate can be applied to market orders with `--slippage-rate` (default: 0.0). Market buys fill at `ask * (1 + slippage_rate)`, sells at `bid * (1 - slippage_rate)`. This is a conservative approximation; real slippage depends on order book depth, size, and volatility.
- **No partial fills or rejection.** A market order fills in full at once; a limit order rests until the market crosses it, then fills in full at its limit price. Live orders may partially fill, queue, or be rejected.

When presenting paper results to the user, note that partial fills and order book dynamics are not simulated. If slippage is set to 0.0 (default), remind the user that live market orders will fill at worse prices.

## Baseline Workflow

```bash
kraken workspace create sandbox --capital 10000 --mode paper --currency USD --slippage-rate 0.001 -o json 2>/dev/null
export KRAKEN_WORKSPACE=sandbox
kraken paper buy BTCUSD 0.01 -o json 2>/dev/null
kraken workspace status -o json 2>/dev/null
kraken paper sell BTCUSD 0.005 --type limit --price 70000 -o json 2>/dev/null
kraken paper orders -o json 2>/dev/null
kraken paper history -o json 2>/dev/null
```

## Reset Between Runs

```bash
kraken workspace reset -o json --yes 2>/dev/null
```

## Migration Rule

Only move a strategy to live trading after:
1. repeated paper runs with stable behavior
2. explicit user sign-off
3. `--validate` checks pass for live order payloads

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-paper-to-live

Capability: live trade

The promotion gate. Mechanical part: `kraken workspace promote <ws>` grades a checklist and refuses without evidence; live workspaces refuse over-budget orders (`allocation_budget`, `over_allocated`, `unverified`). Model-enforced part: present the checklist verbatim, never promote without user sign-off, start at 10 to 25 percent of paper size, refresh the dead man's switch, first live session at autonomy level 3. Lists the paper to live gaps (flat fees, flat slippage, no partial fills, taker-only fees).

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-paper-to-live
version: 1.2.0
description: "Promote a validated paper strategy to live trading, gated on lab experiment evidence plus safety checks."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken", "jq"]
    skills: ["kraken-paper-strategy", "kraken-spot-execution", "kraken-risk-operations", "kraken-lab-experiment"]
---

# kraken-paper-to-live

Use this skill for:
- validating a strategy has stable paper results before going live
- running pre-flight checks before first live trade
- migrating paper commands to their live equivalents
- establishing safety controls for the live session

## Paper-to-Live Performance Gap

Both spot and futures paper trading simulate taker fees (0.26% spot, configurable for futures). Spot paper supports optional flat-rate slippage simulation via `--slippage-rate`. Gaps remain between paper and live. Before promoting, factor in:

- **Fees are approximate.** Paper uses flat fee rates. Real fees depend on your volume tier and maker/taker status. Each round-trip trade costs 0.32-0.52% at base tier.
- **Slippage is a flat estimate.** If `--slippage-rate` was set (spot), market orders include a fixed slippage factor. Real slippage depends on order book depth, order size, and volatility. Futures paper does not model depth-based slippage.
- **No partial fills or latency.** Limit orders fill fully or not at all. Live orders may partially fill, queue, or be rejected. Network and matching-engine latency can cause missed entries or exits.
- **Maker fees:** Paper uses taker fee rates for all fills. Live limit orders that provide liquidity pay lower maker fees (0.16% spot).

When presenting promotion analysis to the user, note the remaining gaps (partial fills, depth-dependent slippage, tier-based fees). If slippage was not configured in paper, explicitly state that live market orders will fill at worse prices.

## Promotion Gate — evidence, not narrative

**Never propose a live order without the evidence block below.** The gate
rule: **at least 2 passing sessions of one frozen experiment, of which a live
paper session is mandatory.** Replay sessions enter the evidence only with their
lookahead caveat attached — replay cannot enforce lookahead (the agent can
read the source tape), so replay screens and live confirms; two replay
passes must never promote on their own.

**Start with the CLI's own checklist** — `kraken workspace promote` grades
the whole gate mechanically. Missing evidence returns the checklist in the
refusal envelope; a passing checklist requires explicit confirmation before
the workspace changes mode:

```bash
kraken workspace promote <workspace> -o json 2>/dev/null | jq '.checklist'
# .criteria[]: one row per gate criterion, satisfied true/false + detail
# .experiments[]: per-experiment passing_sessions / passing_live_sessions
# .manual_trades_in_windows: disclosed manual interference
# .blockers[]: active sessions or paper orders that must be resolved first
```

After promotion, orders use the normal configured Kraken credentials and the
venue's own fills are reconciled back into the workspace ledger by txid, so its
P&L is real. The workspace is an allocation of the account, not a Kraken
subaccount: the CLI enforces the allocation, Kraken does not, and anything
using the same API key can spend allocated funds. Expect two pre-venue
refusals, both `validation` envelopes:

- **Allocation budget** — an order spending beyond what the workspace's own
  ledger holds free of resting orders is refused. Route on the envelope's
  typed fields, never the message: `refusal: "allocation_budget"` with
  `available` and `required` (decimal strings), `funding` (the asset code the
  order spends — a pair leg, not necessarily the allocation currency), and
  `reconciled` (false means `available` may be stale). Reduce the size or
  cancel resting orders; this is the workspace's ledger, not the account
  balance.
- **Backing** — refused with `refusal: "over_allocated"` or `"unverified"`
  plus the full `backing` object. An over-allocated workspace stops spending
  the allocated asset until funds return to the account; an unverified one
  (balance unreadable) stops spending until credentials and connectivity are
  restored.

Size orders before placing them: reconciling live workspace commands (orders,
`balance`, `open-orders`, `trades-history`, `workspace status`) stamp
`.backing.spendable` — the allocation-asset ledger balance free of resting
orders. For orders that spend the allocation asset this is the figure the
budget gate checks `required` against; an order on a pair carrying the
allocation on neither leg is gated in its own funding leg instead (read that
asset from `balance`).

The order that pays the allocated asset back in — closing a position — passes
both refusals, so never tell a user they must abandon the workspace to exit a
trade.

Present that checklist verbatim. Then, for the per-session detail behind it,
build the evidence block from `kraken lab compare` — reproduced cold from
disk, seals verified via `kraken lab show`, no numbers of your own:

```bash
kraken lab show <exp> -o json 2>/dev/null      # seal must verify
kraken lab compare <exp> -o json 2>/dev/null | jq '{
  experiment, frozen, pass_count, total,
  sessions: [.sessions[] | {session,
                    verdict: (if .error != null then "error" else .verdict.pass end),
                    source: (.source.kind // "unknown"),
                    caveats}],
  live_run_passed: ([.sessions[] | select((.verdict.pass // false) and .source.kind == "live")] | length > 0)
}'
```

The evidence block you present for sign-off:

- `experiment` + `frozen` hash (the sealed goalposts),
- every session: session id, `source.kind` (`live`, `replay`, or `unknown` for an
  errored session — errored sessions carry no scorecard), verdict (`true`, `false`, or
  `"error"` — a mechanical FAIL is not an error), caveats verbatim,
- `pass_count` of `total`, and `live_run_passed` — **a passing run whose
  `source.kind` is `live`** (first-class, no caveat-string parsing).

**Refusals must name what is missing.** If `pass_count < 2`: say which sessions
failed or errored. If no live session passed: say "replay evidence only — a
passing live session is mandatory; run the plan's live entry" even when
`pass_count` ≥ 2. A tampered or missing experiment file blocks promotion
with its own `parse`/`validation` envelope — report it, never reconstruct.

**Reset rule:** a sealed spec cannot change. A new hypothesis, new criteria,
or a re-recorded tape is a **new experiment**, and its evidence count
starts at zero.

A strategy is ready for live promotion when:
1. The evidence block above passes the gate rule (≥2 passing sessions, live session
   mandatory, caveats attached).
2. Error handling works correctly (rate limits, network failures).
3. The strategy stays within defined risk parameters.
4. Paper returns remain positive with fees (0.26% spot, 0.05% futures) and slippage enabled (`--fee-rate`, `--slippage-rate`).
5. The user explicitly approves the transition.

## Pre-Flight Checklist

### Spot

Before the first live spot trade:

1. **Verify credentials**:
   ```bash
   kraken auth test -o json 2>/dev/null
   ```

2. **Check balance**:
   ```bash
   kraken balance -o json 2>/dev/null
   ```

3. **Confirm pair is tradable**:
   ```bash
   kraken pairs --pair BTCUSD -o json 2>/dev/null
   ```

4. **Validate a sample order** (does not execute):
   ```bash
   kraken order buy BTCUSD 0.001 --type limit --price 50000 --validate -o json 2>/dev/null
   ```

5. **Enable dead man's switch** — account-wide, so it cannot run inside a
   workspace: the timeout cancels every order on the API key, including other
   workspaces' and the account's own. Run it with no workspace active, and tell
   the user it covers their whole account, not just this strategy:
   ```bash
   KRAKEN_WORKSPACE= kraken order cancel-after 600 -o json 2>/dev/null
   ```

### Futures

Before the first live futures trade:

1. **Verify futures credentials**:
   ```bash
   kraken futures accounts -o json 2>/dev/null
   ```

2. **Check margin availability**:
   ```bash
   kraken futures accounts -o json 2>/dev/null
   ```

3. **Confirm instrument is tradable**:
   ```bash
   kraken futures instrument-status --symbol PF_XBTUSD -o json 2>/dev/null
   ```

4. **Set leverage**:
   ```bash
   kraken futures set-leverage PF_XBTUSD 10 -o json 2>/dev/null
   ```

5. **Enable dead man's switch**:
   ```bash
   kraken futures cancel-after 600 -o json 2>/dev/null
   ```

## Command Migration

Most paper and live commands differ only in the prefix. The order type default
does not carry over: `kraken paper buy` and `sell` default to `--type market`, while
`kraken order` and `kraken futures order` default to `--type limit`, so pass
`--type market` on live market orders.

### Spot

| Paper | Live |
|-------|------|
| `kraken paper buy BTCUSD 0.01` | `kraken order buy BTCUSD 0.01 --type market` |
| `kraken paper sell BTCUSD 0.01` | `kraken order sell BTCUSD 0.01 --type market` |
| `kraken paper status` | `kraken balance` + `kraken open-orders` |
| `kraken paper orders` | `kraken open-orders` |
| `kraken paper history` | `kraken trades-history` |
| `kraken paper cancel <ID>` | `kraken order cancel <TXID>` |

### Futures

| Paper | Live |
|-------|------|
| `kraken futures paper buy PF_XBTUSD 1 --leverage 10 --type market` | `kraken futures order buy PF_XBTUSD 1 --type market` |
| `kraken futures paper sell PF_XBTUSD 1 --leverage 10 --type market` | `kraken futures order sell PF_XBTUSD 1 --type market` |
| `kraken futures paper positions` | `kraken futures positions` |
| `kraken futures paper orders` | `kraken futures open-orders` |
| `kraken futures paper fills` | `kraken futures fills` |
| `kraken futures paper cancel --order-id <ID>` | `kraken futures cancel --order-id <ID>` |
| `kraken futures paper cancel-all` | `kraken futures cancel-all` |

**Leverage note:** Paper accepts `--leverage` inline on buy/sell commands. Live futures configures leverage separately via `kraken futures set-leverage <SYMBOL> <LEVERAGE>` before placing orders.

## Gradual Promotion

Start with smaller size than paper:

1. **Paper size**: the volume used during testing.
2. **Initial live size**: 10-25% of paper size.
3. **Scale up**: increase gradually after confirming live behavior matches paper.

## Live Session Safety

After going live, maintain these controls:

- Dead man's switch refreshed periodically.
- Balance check after every trade.
- Open orders verified after every placement.
- Error handling active for all error categories.
- Maximum loss threshold that triggers session shutdown.

## Rollback

If live behavior diverges from paper:

### Spot
1. Cancel all open spot orders once the user approves (`--yes` skips the CLI prompt):
   ```bash
   kraken order cancel-all --yes -o json 2>/dev/null
   ```
2. Assess balances.
3. Return to `kraken paper` to debug.

### Futures
1. Cancel all open futures orders once the user approves (`--yes` skips the CLI prompt):
   ```bash
   kraken futures cancel-all --yes -o json 2>/dev/null
   ```
2. Close open positions with `--reduce-only`.
3. Return to `kraken futures paper` to debug.

## Hard Rules

- Never promote without explicit user sign-off.
- Never promote without the promotion evidence block: ≥2 passing sessions of a
  seal-verified experiment, a passing **live** run among them, caveats
  attached. Refusals name exactly which sessions or verdicts are missing.
- Start at reduced size.
- Always validate live spot orders with `--validate` before executing. Futures orders have no dry run, so each one needs explicit user approval.
- Maintain dead man's switch throughout the live session.
- First live session should run at autonomy level 3 (supervised) regardless of prior paper autonomy.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-playground

Capability: paper

Recorded paper sessions (`kraken playground`, `session start/stop/note/decisions/state`). The load-bearing warning: "without a workspace `kraken order buy` trades the real account." Paper safety holds only while each order names `--workspace <name>` and `kraken workspace show <name>` reports `"mode": "paper"`. Model-enforced.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-playground
version: 2.0.0
description: "Paper-trading sandbox over workspace sessions: record live market data and agent decisions inside a session window, replay and score it later."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-playground

A session ties a market recorder and the workspace's paper account to one window. Live prices stream in and get recorded as the session's tape, paper orders fill against those prices on the shared account journal, and every decision is logged, so the window can be replayed and analyzed later. No real order is ever placed inside a paper workspace.

Use this skill for:
- running a paper-trading hypothesis on live prices with no real money
- recording ticker, trade, and book data alongside paper fills and decision reasons
- driving an agent hypothesis over a window at a fixed cadence
- replaying a session and computing P&L after the fact

## The One-Command Demo

`kraken playground` is the fastest way in: it creates (or reuses, never re-funding) a paper workspace named `playground` with 10,000 USD, prints how to watch it, and starts a recorded, self-stopping demo session:

```bash
kraken playground --symbols BTC/USD --for 1h 2>/dev/null &
export KRAKEN_WORKSPACE=playground
```

Everything it makes is a plain workspace plus a session — the commands below drive it like any other scope.

## What a Session Is

A session is a recorded window over the active scope's account journal. One session id (`s1`, `s2`, …) binds three things: the recorder (live market data to `sessions/s<n>/tape.*`), the window markers on the account journal (which trades belong to the session), and the session's decision log (the "why" behind each action). There is no daemon and no shared memory between rounds. State lives on disk, and each round reads what it needs.

The CLI has no scheduler and runs no strategy. It records, fills paper orders, and logs. The agent decides, and something external holds the pace (see Pacing).

## Start a Session

Work inside a paper workspace (create one once with `kraken workspace create <name> --capital 10000 --mode paper`), then:

```bash
export KRAKEN_WORKSPACE=<name>

kraken session start \
  --symbols BTC/USD --channels ticker,trade --to duckdb,jsonl \
  --label my-hypothesis-r1 \
  -o json 2>/dev/null &
```

The `session_started` JSON line on stdout carries the session id (`"session":"s<n>"`). **Print it to the user as soon as the session starts, and again in the final report.** It is the handle for everything after: `kraken session show --session s<n>`, resuming a `/loop`, and locating the artifacts under `sessions/s<n>/`.

- `--symbols`: instruments to record and trade against
- `--channels`: which feeds to record (e.g., `ticker,trade`, add `book` for depth)
- `--to`: recording sinks (`duckdb` for query, `jsonl` for raw replay)
- `--label`: a human handle, usable anywhere a `--session` ref is
- `--strategy` / `--strategy-params`: name and JSON knobs of the driver, recorded in `session.json` so two sessions compare knob-for-knob
- `--for`: auto-stop after a window (e.g. `1h`) — the session closes itself cleanly
- `--from tape:<name> --speed 10`: replay a recorded tape instead of the live market

## Paper Trades

Buy or sell against recorded prices — the order verbs are mode-routed, so inside a paper workspace they fill on the paper account. Name the workspace on every order: an exported `KRAKEN_WORKSPACE` does not reach a later shell, such as a `/loop` fire, and without a workspace `kraken order buy` trades the real account. Always pass a reason; it lands in the active session's decision log:

```bash
kraken --workspace <name> order buy BTC/USD <volume> --type market --reason "<why>" -o json 2>/dev/null
kraken --workspace <name> order sell BTC/USD <volume> --type market --reason "<why>" -o json 2>/dev/null
```

Log a non-trade decision (a skip, a gate, an alert) so the log records rounds where nothing traded:

```bash
kraken session note --kind skip --symbol BTC/USD --reason "<why>" -o json 2>/dev/null
```

## Recording

Data lands under the session directory of the active scope:

```bash
# Read the decision log (evidence) and the typed state cell (the loop's
# cursor: round, legs_done, zone, last_action_at) through the CLI —
# no layout knowledge needed:
kraken session decisions --session s<n> -o json
kraken session state get --session s<n> -o json
```

- `session.json`: the session's contract — window, opening equity anchor, strategy, experiment
- `decisions.jsonl`: one line per decision (kind, symbol, reason, timestamp, order id)
- `tape.duckdb` / `tape.jsonl`: the raw tape for replay and P&L

## Pacing

Pacing is external to the CLI. Two mechanisms, one per hypothesis shape:

- Time-gated: `/loop` owns the schedule. Set its interval to the decision spacing and it fires one round per interval.
- Event-gated: a WebSocket stream's event rate owns the schedule. The loop acts on qualifying events (see `kraken-ws-streaming`).

For time-gated runs, the interval is a floor. A round may start late (the scheduler adds jitter), never early. Do not add a second pacing gate inside the round; `/loop` already enforces spacing.

**The scheduler floor is 60 seconds.** `/loop`, cron, and `ScheduleWakeup` all clamp to a one-minute minimum, so `interval_s` must be `>= 60` and a sub-minute cadence is impossible. If the user asks for "every 30 seconds", clamp to 60s and say so — never set a sub-minute `interval_s`, and never let the report claim a cadence the harness cannot run.

## Running over a Window

A session over many rounds is interventional: one visit per interval, paced from outside. Pick the mechanism by what triggers a decision.

- "Act every N minutes on the current price": time-gated. `/loop N` fires the round, each round takes one REST snapshot (`kraken ticker`, `kraken ohlc`), decides, acts. See `recipe-playground-dca`.
- "Act the instant a condition trips": event-gated. Subscribe to a stream and act on each qualifying tick, rate-limited so you do not act faster than intended. See `recipe-playground-dca-triggered`.

Time-gated misses conditions that appear and resolve between visits. Event-gated catches them but runs as a long-lived process and is blind during reconnect gaps. Choose per hypothesis.

## Driving Your Own Hypothesis

A driver is a recipe that turns a hypothesis into recorded rounds. The shape of every round:

1. READ: pull the market state the decision needs (price, an average, spread).
2. THINK: apply the numeric gates from `--strategy-params`.
3. ACT: `order buy` / `order sell` on a trigger, `session note` on a skip, always with a numeric reason.

Keep every number that gates a buy or skip in `--strategy-params`, not only in prose reasons. That is what makes two sessions comparable. Keep the arithmetic deterministic (compute in `jq`/`bc`, do not eyeball it) so a rerun on the same tape reaches the same decisions.

## Show, Stop, and Score

```bash
kraken session show -o json 2>/dev/null | jq '.window, .valuation'
kraken session stop -o json 2>/dev/null
kraken explain pnl --session latest -o json 2>/dev/null
kraken lab score --session latest -o json 2>/dev/null
```

`--session` accepts `latest` (the default everywhere), an ordinal (`s3`), or a label.

## Hard Rules

- A session inside a paper workspace never places a live order. It records and fills paper only. That holds only while each order names the workspace with `--workspace <name>` and `kraken workspace show <name> -o json` reports `"mode": "paper"`.
- Paper results may overstate live performance: fees and slippage are simulated and there are no partial fills (see `kraken-paper-strategy`).
- No daemon, no shared memory between rounds. State lives on disk under the workspace and its sessions.
- Pace from outside the CLI: `/loop` for time-gated, a stream's event rate for event-gated. Never add a redundant pacing gate inside a round. The scheduler floor is 60s — no sub-minute cadence.
- Always pass a reason on every trade and skip, so the decision log carries the full "why".
- The session directory (`session.json`, `decisions.jsonl`, and the tape sinks) is owned by the CLI recorder. The agent only **reads** it, and only for status and the stop-time summary. Never write, edit, `mkdir`, or append inside it — every decision goes through `kraken order buy` / `kraken session note`, so the recorder stays the single writer.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-lab-experiment

Capability: paper

Autoresearch lab lifecycle: `lab new` freezes a hash-sealed hypothesis with criteria and a session plan, `lab next` drives the state machine, `lab score` returns a mechanical verdict, `lab compare` builds the promotion evidence. The seal is tamper-evident: a modified spec fails with a `parse` envelope. Model-enforced: confirm `"mode": "paper"` before any order step, never report an unobtained verdict. Verbatim: "Never edit a frozen experiment file." and "Never report a verdict you did not obtain from `lab score --experiment` or `lab compare` output in this session." Full text omitted (11 KB, paper-only research harness); license would permit it.

### kraken-risk-operations

Capability: live trade

Pre-flight checklist, dead man's switch, mass cancel, position visibility, failure handling. Model-enforced: "All cancel and cancel-all operations are dangerous. Require explicit human approval before executing." and "Dead-man switch (`cancel-after`) is also dangerous; confirm the timeout value with the user."

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-risk-operations
version: 1.0.0
description: "Operational risk controls for live agent trading sessions."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-risk-operations

Use this skill to reduce live-trading risk during automation.

## Pre-Flight Checklist

1. Confirm intended environment (paper vs live).
2. Confirm pair, side, volume, and order type.
3. Validate payload with `--validate`.
4. Enable a dead-man switch for unattended sessions.

## Live Session Safety Commands

Dead-man switch:

```bash
kraken order cancel-after 60 -o json 2>/dev/null
```

Mass cancel. `--yes` skips the CLI prompt, so pass it only after the user approves:

```bash
kraken order cancel-all --yes -o json 2>/dev/null
kraken futures cancel-all --yes -o json 2>/dev/null
```

Position visibility:

```bash
kraken open-orders -o json 2>/dev/null
kraken positions -o json 2>/dev/null
kraken futures positions -o json 2>/dev/null
```

## Failure Handling

- `network`: exponential backoff retry; if `verify_first` is `true`, check order or transfer state first
- `rate_limit`: read `suggestion` and `docs_url` fields, reduce call frequency or switch to WebSocket
- `auth`: stop and refresh credentials
- `validation` or `api`: stop, fix request, do not blind retry

## Hard Rules

- All cancel and cancel-all operations are dangerous. Require explicit human approval before executing.
- Dead-man switch (`cancel-after`) is also dangerous; confirm the timeout value with the user.
- Never execute mass-cancel without verifying which orders and positions are open first.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

## Futures

### kraken-futures-trading

Capability: live trade, paper

Place, edit, cancel, batch (`futures batch-order`), cancel-all, positions, fills, dead man's switch, and `futures paper`. Futures need separate credentials (`KRAKEN_FUTURES_API_KEY`/`SECRET`). No dry run. Model-enforced: approval for place, edit and cancel; `--reduce-only` on closes; `cancel-after` for automated sessions.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-futures-trading
version: 1.0.0
description: "Place, manage, and monitor futures orders across the full lifecycle."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-futures-trading

Use this skill for:
- placing futures buy and sell orders (market, limit, post, stop, take-profit, ioc, trailing-stop, fok)
- editing and cancelling futures orders
- batch order placement for multi-leg strategies
- monitoring open positions and fills

## Authentication

Futures use separate credentials from spot:

```bash
export KRAKEN_FUTURES_API_KEY="your-futures-key"
export KRAKEN_FUTURES_API_SECRET="your-futures-secret"
```

## Safe Execution Flow

1. Check available contracts:
   ```bash
   kraken futures instruments -o json 2>/dev/null
   ```
2. Read current price:
   ```bash
   kraken futures ticker PF_XBTUSD -o json 2>/dev/null
   ```
3. Check account state:
   ```bash
   kraken futures accounts -o json 2>/dev/null
   ```
4. Place order (requires human approval):
   ```bash
   kraken futures order buy PF_XBTUSD 1 --type limit --price 50000 -o json 2>/dev/null
   ```
5. Verify placement:
   ```bash
   kraken futures open-orders -o json 2>/dev/null
   ```

## Order Types

Market order:

```bash
kraken futures order buy PF_XBTUSD 1 --type market -o json 2>/dev/null
```

Limit order:

```bash
kraken futures order sell PF_XBTUSD 1 --type limit --price 70000 -o json 2>/dev/null
```

Stop order:

```bash
kraken futures order buy PF_XBTUSD 1 --type stop --stop-price 55000 --trigger-signal mark -o json 2>/dev/null
```

Trailing stop:

```bash
kraken futures order sell PF_XBTUSD 1 --type trailing-stop --trailing-stop-max-deviation 500 --trailing-stop-deviation-unit quote_currency --trigger-signal mark -o json 2>/dev/null
```

Reduce-only (close position without opening new exposure):

```bash
kraken futures order sell PF_XBTUSD 1 --type market --reduce-only -o json 2>/dev/null
```

## Batch Orders

Place multiple orders atomically (useful for bracket entries):

```bash
kraken futures batch-order '{"batchOrder":[
  {"order":"send","order_tag":"entry","symbol":"PF_XBTUSD","side":"buy","size":1,"orderType":"lmt","limitPrice":50000},
  {"order":"send","order_tag":"tp","symbol":"PF_XBTUSD","side":"sell","size":1,"orderType":"lmt","limitPrice":55000,"reduceOnly":true}
]}' -o json 2>/dev/null
```

Each instruction is `send`, `edit` or `cancel`. Pass a file as `@orders.json`.
`kraken futures paper batch-order` takes a bare array of rows named like the
paper flags instead: `[{"symbol":"PF_XBTUSD","side":"buy","size":1,"type":"limit","price":50000}]`.

## Edit and Cancel

Edit in place:

```bash
kraken futures edit-order --order-id <ID> --price 51000 -o json 2>/dev/null
```

Cancel one:

```bash
kraken futures cancel --order-id <ID> -o json 2>/dev/null
```

Cancel all. `--yes` skips the CLI prompt, so pass it only after the user approves:

```bash
kraken futures cancel-all --yes -o json 2>/dev/null
```

Cancel by symbol:

```bash
kraken futures cancel-all --symbol PF_XBTUSD --yes -o json 2>/dev/null
```

## Position Monitoring

Open positions:

```bash
kraken futures positions -o json 2>/dev/null
```

Recent fills:

```bash
kraken futures fills --since 2024-01-01T00:00:00Z -o json 2>/dev/null
```

Execution history:

```bash
kraken futures history-executions --since 2024-01-01T00:00:00Z --sort desc -o json 2>/dev/null
```

Order history:

```bash
kraken futures history-orders --sort desc -o json 2>/dev/null
```

## Dead Man's Switch

Enable for unattended sessions. All orders cancel if the timer expires:

```bash
kraken futures cancel-after 600 -o json 2>/dev/null
```

Refresh periodically. If the agent crashes, orders auto-cancel.

## Paper Trading

Test futures strategies without real money using `kraken futures paper`. Near-parity with live futures: all 8 order types (market, limit, post, stop, take-profit, ioc, trailing-stop, fok); leverage, margin tracking, liquidation simulation, and funding rates. Known differences: single-ID `order-status`, post-only orders are cancelled rather than queued, fills use the bid/ask snapshot with no depth-based slippage, and only IOC orders fill partially: the size the book snapshot holds at or better than the limit price fills at the best bid/ask, and the rest is cancelled.

```bash
kraken futures paper init --balance 10000 -o json 2>/dev/null
kraken futures paper buy PF_XBTUSD 1 --leverage 10 --type market -o json 2>/dev/null
kraken futures paper positions -o json 2>/dev/null
kraken futures paper status -o json 2>/dev/null
kraken futures paper reset -o json 2>/dev/null
```

To go live, `futures paper buy` and `sell` become `futures order buy` and `sell` without `--leverage` (set it first with `kraken futures set-leverage`), and the reads become `kraken futures positions`, `kraken futures open-orders` and `kraken futures fills`. `kraken-paper-to-live` has the full mapping. No credentials required for paper trading.

## Hard Rules

- Never place, edit or cancel futures orders without explicit human approval. Futures order commands have no `--validate` dry run; rehearse on `kraken futures paper`.
- Always check `futures accounts` before trading to confirm margin availability.
- Use `--reduce-only` when closing positions to prevent accidental flips.
- Enable `cancel-after` for any automated session.
- Test strategies with `kraken futures paper` before going live.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-futures-risk

Capability: live trade (config), read

Leverage, funding rates, margin ratio (`maintenanceMargin / marginEquity`), unwind queue, PnL currency preference. Model-enforced thresholds: alert above 0.7. `set-leverage` and `set-pnl-preference` flagged dangerous; a leverage change alters margin on open positions in both directions.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-futures-risk
version: 1.0.0
description: "Futures-specific risk management: leverage, funding rates, margin, and liquidation awareness."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-futures-risk

Use this skill for:
- checking and setting leverage
- monitoring funding rates for carry cost
- tracking margin and account health
- position sizing relative to available margin
- understanding liquidation risk

## Leverage Management

Check current leverage preferences:

```bash
kraken futures leverage -o json 2>/dev/null
```

Check leverage for a specific symbol:

```bash
kraken futures leverage --symbol PF_XBTUSD -o json 2>/dev/null
```

Set maximum leverage (requires human approval):

```bash
kraken futures set-leverage PF_XBTUSD 5 -o json 2>/dev/null
```

Lower leverage reduces liquidation risk but requires more margin per position.

## Funding Rate Monitoring

Check historical funding rates:

```bash
kraken futures historical-funding-rates PF_XBTUSD -o json 2>/dev/null
```

Funding rates are periodic payments between longs and shorts. Positive rates mean longs pay shorts; negative rates mean shorts pay longs. High sustained rates increase carry cost for directional positions.

Use funding rates to:
- Estimate holding cost for a position over time.
- Identify crowded trades (extreme funding rates).
- Time entries when funding flips direction.

## Account and Margin Health

Check account balances and margin:

```bash
kraken futures accounts -o json 2>/dev/null
```

Key fields of the multi-collateral account, under `.accounts.flex`: `marginEquity`, `availableMargin`, `initialMargin`, `maintenanceMargin`, `unrealizedFunding`, `pnl`.

Margin ratio = `.accounts.flex.maintenanceMargin / .accounts.flex.marginEquity`. When this approaches 1.0, liquidation risk is high.

## Position Monitoring

View all open positions:

```bash
kraken futures positions -o json 2>/dev/null
```

Stream position updates in real time:

```bash
kraken futures ws open-positions -o json 2>/dev/null
```

Monitor P&L and size continuously. Set agent-side thresholds for:
- Maximum unrealized loss per position
- Maximum total portfolio loss
- Maximum position size

## PnL Preferences

Check which currency each symbol's P&L settles in:

```bash
kraken futures pnl-preferences -o json 2>/dev/null
```

Set preference for a specific symbol:

```bash
kraken futures set-pnl-preference PF_XBTUSD USD -o json 2>/dev/null
```

## Unwind Queue

Check if any positions are in the unwind queue (approaching liquidation):

```bash
kraken futures unwind-queue -o json 2>/dev/null
```

If positions appear here, the agent should alert immediately and consider reducing exposure.

## Pre-Trade Risk Check

Before placing a futures order, always:

1. Check available margin:
   ```bash
   kraken futures accounts -o json 2>/dev/null
   ```
2. Check current positions:
   ```bash
   kraken futures positions -o json 2>/dev/null
   ```
3. Check current leverage:
   ```bash
   kraken futures leverage --symbol PF_XBTUSD -o json 2>/dev/null
   ```
4. Estimate position margin requirement based on order size and leverage.
5. Confirm available funds exceed the required margin with a safety buffer.

## Emergency Procedures

Close all positions:

```bash
kraken futures cancel-all --yes -o json 2>/dev/null
# Then close each position with a reduce-only market order
kraken futures order sell PF_XBTUSD <POSITION_SIZE> --type market --reduce-only -o json 2>/dev/null
```

Dead man's switch:

```bash
kraken futures cancel-after 300 -o json 2>/dev/null
```

## Hard Rules

- `futures set-leverage` and `futures set-pnl-preference` are flagged dangerous. Never change either without explicit human approval — a leverage change also alters the margin requirement on open positions, in both directions.
- Cancelling orders and closing positions need explicit human approval like any order; `--yes` only skips the CLI prompt, so pass it after the user approves.
- Monitor margin ratio continuously during live sessions.
- Alert when margin ratio exceeds 0.7 (conservative threshold).
- Alert when unrealized loss exceeds a pre-defined stop-loss level.
- Check funding rates before opening new positions to understand carry cost.
- Use `--reduce-only` when closing positions to prevent accidental reversals.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-liquidation-guard

Capability: live trade, live funds

Margin ratio bands (under 0.3 healthy, 0.3 to 0.5 caution, 0.5 to 0.7 warning, over 0.7 critical), emergency flatten, margin top-up via `futures transfer` or `wallet-transfer`, leverage reduction. Model-enforced: "Never increase position size when margin ratio is above 0.3." The monitoring loop in the skill is a skeleton with comments, not working code.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-liquidation-guard
version: 1.0.0
description: "Prevent futures liquidation through margin monitoring and emergency procedures."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
    skills: ["kraken-futures-risk"]
---

# kraken-liquidation-guard

Use this skill for:
- monitoring margin ratio to detect liquidation risk
- automated position reduction when thresholds are breached
- emergency flatten procedures
- proactive margin top-up patterns

## Margin Health Check

```bash
kraken futures accounts -o json 2>/dev/null
```

Key fields of the multi-collateral account, under `.accounts.flex`:
- `marginEquity`: account value that counts as margin, unrealized P&L included
- `initialMargin`: margin held for positions
- `maintenanceMargin`: minimum margin before liquidation
- `availableMargin`: free margin for new positions

Margin ratio = `.accounts.flex.maintenanceMargin / .accounts.flex.marginEquity`. Liquidation approaches as this ratio nears 1.0. A single-collateral account (`.accounts.fi_*`) reports maintenance margin, portfolio value and available funds as `marginRequirements.mm`, `auxiliary.pv` and `auxiliary.af`.

## Alert Thresholds

| Ratio | Status | Action |
|-------|--------|--------|
| < 0.3 | Healthy | Normal operation |
| 0.3 - 0.5 | Caution | Reduce position or add margin |
| 0.5 - 0.7 | Warning | Reduce position immediately |
| > 0.7 | Critical | Emergency flatten |

## Monitoring Loop

```bash
kraken futures ws balances -o json 2>/dev/null | while read -r line; do
  # Read margin equity and maintenance margin from the frame
  # Calculate ratio
  # Alert or act when threshold is breached
done
```

Or poll periodically:

```bash
kraken futures accounts -o json 2>/dev/null
```

## Unwind Queue Check

If a position enters the unwind queue, liquidation is imminent:

```bash
kraken futures unwind-queue -o json 2>/dev/null
```

Any result here requires immediate action.

## Emergency Flatten

Cancel all open orders, then close all positions:

```bash
# Cancel all orders to free held margin
kraken futures cancel-all --yes -o json 2>/dev/null

# Close each position with reduce-only market orders
kraken futures positions -o json 2>/dev/null
# For each position:
kraken futures order sell PF_XBTUSD <SIZE> --type market --reduce-only -o json 2>/dev/null
```

## Margin Top-Up

Transfer funds from spot wallet to futures to increase margin:

```bash
kraken futures transfer 5000 USD -o json 2>/dev/null
```

Or from main account:

```bash
kraken wallet-transfer USD 5000 --from <SPOT_IIBAN> --to <FUTURES_IIBAN> -o json 2>/dev/null
```

## Leverage Reduction

Lower leverage to reduce margin requirements:

```bash
kraken futures set-leverage PF_XBTUSD 2 -o json 2>/dev/null
```

## Dead Man's Switch

Always run a dead man's switch during futures sessions:

```bash
kraken futures cancel-after 600 -o json 2>/dev/null
```

If the agent crashes, orders auto-cancel, preventing further margin consumption.

## Hard Rules

- Monitor margin ratio continuously during any futures session.
- Alert at 0.5 ratio; act at 0.7. Do not wait for the exchange to liquidate.
- Emergency flatten requires human approval unless the agent operates at autonomy level 4+.
- Margin top-ups move funds: `futures transfer` and `wallet-transfer` are flagged dangerous and need human approval.
- Never increase position size when margin ratio is above 0.3.
- `futures set-leverage` is flagged dangerous: it changes the margin requirement on open positions, so de-risking with it needs the same human approval as flattening.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-basis-trading

Capability: live trade

Long spot plus short futures for the same notional. Leg risk is stated: if one leg fails to fill the position is directional. Practical gotcha: both legs are live, so `unset KRAKEN_WORKSPACE` first or the spot leg fills on paper and the futures leg is refused, leaving a half-done hedge.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-basis-trading
version: 1.0.0
description: "Capture the spot-futures price spread with delta-neutral basis trades."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
    skills: ["kraken-spot-execution", "kraken-futures-trading"]
---

# kraken-basis-trading

Use this skill for:
- identifying positive basis (futures premium over spot)
- entering delta-neutral positions (long spot, short futures)
- monitoring basis convergence
- closing both legs when basis narrows or contracts expire

## Core Concept

When futures trade at a premium to spot (positive basis), you can buy spot and sell futures for the same notional amount. The profit comes from basis convergence as the contract approaches expiry, or from collecting funding on perpetuals. The position is market-neutral: price movement does not affect P&L, only the spread does.

## Basis Calculation

```bash
SPOT=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].last_price')
FUTURES=$(kraken futures ticker PF_XBTUSD -o json 2>/dev/null | jq -r '.ticker.last')
BASIS=$(echo "scale=4; ($FUTURES - $SPOT) / $SPOT * 100" | bc)
echo "Basis: ${BASIS}%"
```

A positive basis means futures are more expensive than spot (contango). A negative basis means futures are cheaper (backwardation).

## Entry (Long Spot + Short Futures)

Both legs are live orders on the real account, so run `unset KRAKEN_WORKSPACE`
first. Inside a paper workspace the spot leg fills on paper and the workspace
guard refuses the futures leg, which leaves the hedge half done.

1. Check spot price and futures price.
2. Ensure the basis is attractive (e.g., > 0.5% annualized).
3. Calculate matched position sizes.
4. Execute both legs (requires human approval):

```bash
# Long spot
kraken order buy BTCUSD 0.01 --type limit --price $SPOT -o json 2>/dev/null

# Short futures (matched notional)
kraken futures order sell PF_XBTUSD 1 --type limit --price $FUTURES -o json 2>/dev/null
```

## Monitoring

Watch basis convergence:

```bash
# Periodic check
kraken ticker BTCUSD -o json 2>/dev/null
kraken futures ticker PF_XBTUSD -o json 2>/dev/null
```

Check positions:

```bash
kraken balance -o json 2>/dev/null
kraken futures positions -o json 2>/dev/null
```

## Exit

Both legs are live orders on the real account, so run `unset KRAKEN_WORKSPACE`
first. Inside a paper workspace the spot leg fills on paper and the workspace
guard refuses the futures leg, which leaves the hedge half done.

Close both legs when basis narrows to target:

```bash
# Sell spot
kraken order sell BTCUSD 0.01 --type market -o json 2>/dev/null

# Close futures short
kraken futures order buy PF_XBTUSD 1 --type market --reduce-only -o json 2>/dev/null
```

## Risk Considerations

- **Execution risk**: legs may fill at different times. The basis can move between fills.
- **Funding risk**: on perpetuals, negative funding rates mean the short pays the long, eating into profit.
- **Margin risk**: a sharp spot rally increases margin requirement on the short futures leg.
- **Leg risk**: if one leg fails to fill, the position is directional, not neutral.

## Hard Rules

- Never enter a basis trade without confirming both legs will execute.
- Monitor futures margin continuously; a large spot rally can trigger liquidation on the short.
- Close both legs together; leaving one open converts to a directional bet.
- Requires human approval for all live entries and exits.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-funding-carry

Capability: live trade

Collect funding on the paying side of a perpetual with a spot hedge, positive and negative funding variants, same workspace gotcha as basis trading. Model-enforced: hedge every carry position; exit when funding flips.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-funding-carry
version: 1.0.0
description: "Earn funding rate payments by positioning on the paying side of perpetuals."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
    skills: ["kraken-futures-trading", "kraken-futures-risk"]
---

# kraken-funding-carry

Use this skill for:
- scanning funding rates across perpetual contracts
- identifying carry opportunities (collect funding by being on the receiving side)
- entering hedged carry positions (spot hedge + futures position)
- monitoring ongoing carry yield

## Core Concept

Perpetual futures charge periodic funding payments between longs and shorts. When the funding rate is positive, longs pay shorts. When negative, shorts pay longs. A carry strategy positions on the receiving side and hedges with spot to remain market-neutral.

## Scan Funding Rates

```bash
kraken futures historical-funding-rates PF_XBTUSD -o json 2>/dev/null
kraken futures historical-funding-rates PF_ETHUSD -o json 2>/dev/null
```

Compare rates across contracts to find the highest yield.

## Carry Entry (Positive Funding)

Both legs are live orders on the real account, so run `unset KRAKEN_WORKSPACE`
first. Inside a paper workspace the spot leg fills on paper and the workspace
guard refuses the futures leg, which leaves the hedge half done.

When funding is positive (longs pay shorts):
1. Short the perpetual.
2. Buy spot as a hedge.

```bash
# Hedge: buy spot
kraken order buy BTCUSD 0.01 --type market -o json 2>/dev/null

# Carry: short perpetual (collect funding)
kraken futures order sell PF_XBTUSD 1 --type market -o json 2>/dev/null
```

## Carry Entry (Negative Funding)

Both legs are live orders on the real account, so run `unset KRAKEN_WORKSPACE`
first. Inside a paper workspace the spot leg fills on paper and the workspace
guard refuses the futures leg, which leaves the hedge half done.

When funding is negative (shorts pay longs):
1. Long the perpetual.
2. Sell spot as a hedge (or skip hedge if already holding).

```bash
# Carry: long perpetual (collect funding)
kraken futures order buy PF_XBTUSD 1 --type market -o json 2>/dev/null

# Hedge: sell spot
kraken order sell BTCUSD 0.01 --type market -o json 2>/dev/null
```

## Yield Calculation

Annualized yield = funding_rate * funding_periods_per_year * 100.

Kraken funding periods are typically every 4 or 8 hours (varies by contract). Check contract specs:

```bash
kraken futures instruments -o json 2>/dev/null
```

## Monitoring

Track funding accrual:

```bash
kraken futures accounts -o json 2>/dev/null
```

The `unrealizedFunding` field shows accumulated but unsettled funding.

Watch for funding rate flips:

```bash
kraken futures historical-funding-rates PF_XBTUSD -o json 2>/dev/null
```

If the rate flips direction, the position switches from collecting to paying. Exit or reverse.

## Exit

Both legs are live orders on the real account, so run `unset KRAKEN_WORKSPACE`
first. Inside a paper workspace the spot leg fills on paper and the workspace
guard refuses the futures leg, which leaves the hedge half done.

Close both legs when carry becomes unprofitable:

```bash
kraken futures order buy PF_XBTUSD 1 --type market --reduce-only -o json 2>/dev/null
kraken order sell BTCUSD 0.01 --type market -o json 2>/dev/null
```

## Hard Rules

- Always hedge carry positions to avoid directional exposure.
- Monitor funding rates continuously; a flip turns profit into loss.
- Monitor margin on the futures leg; price moves require margin even when hedged.
- Requires human approval for all entries and exits.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

## Trading strategies

### kraken-dca-strategy

Capability: paper, live trade

Paper DCA loop, live single buy with `--validate`, cost basis tracking via `trades-history --consolidate-taker`, limit-order variant, multi-asset split. No built-in scheduler. Model-enforced: per-trade confirmation unless autonomy level 4+.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-dca-strategy
version: 1.0.0
description: "Dollar cost averaging with scheduled buys and performance tracking."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-dca-strategy

Use this skill for:
- implementing a recurring buy strategy at fixed intervals
- tracking average cost basis over time
- comparing DCA performance against lump-sum entry
- running DCA simulations in paper mode first

## Core Concept

Dollar cost averaging buys a fixed dollar amount of an asset at regular intervals regardless of price. This reduces timing risk and smooths entry cost over volatile periods.

## Paper DCA Loop (Test First)

Always validate the strategy in paper mode before going live.

The `paper buy` command takes base-asset volume, not dollar amount. Calculate volume first:

```bash
kraken workspace create sandbox --capital 10000 --mode paper --currency USD -o json 2>/dev/null
export KRAKEN_WORKSPACE=sandbox

# Calculate BTC volume for a $100 buy at current price
PRICE=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].last_price')
VOLUME=$(echo "scale=8; 100 / $PRICE" | bc)

# Simulate weekly buys
kraken paper buy BTCUSD $VOLUME -o json 2>/dev/null
kraken workspace status -o json 2>/dev/null

# Repeat buy, check status each iteration
kraken paper buy BTCUSD $VOLUME -o json 2>/dev/null
kraken workspace status -o json 2>/dev/null

kraken paper history -o json 2>/dev/null
```

## Live DCA Single Buy

Live orders run outside the paper workspace, so run `unset KRAKEN_WORKSPACE`
first. Inside it, the buy fills on paper and `trades-history --consolidate-taker`
is refused.

Each interval, the agent executes one market buy for the fixed amount:

1. Check current price:
   ```bash
   kraken ticker BTCUSD -o json 2>/dev/null
   ```
2. Calculate volume from dollar amount (e.g., $100 at current price):
   ```bash
   PRICE=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].last_price')
   VOLUME=$(echo "scale=8; 100 / $PRICE" | bc)
   ```
3. Validate the order:
   ```bash
   kraken order buy BTCUSD $VOLUME --type market --validate -o json 2>/dev/null
   ```
4. Execute (requires human approval):
   ```bash
   kraken order buy BTCUSD $VOLUME --type market -o json 2>/dev/null
   ```
5. Log the trade for cost basis tracking.

## Cost Basis Tracking

After each buy, query trade history to compute running average:

```bash
kraken trades-history --consolidate-taker -o json 2>/dev/null
```

The agent should maintain a running total:
- Total invested (sum of all dollar amounts)
- Total units acquired (sum of all volumes)
- Average cost = total invested / total units
- Current value = total units * current price
- Unrealized P&L = current value - total invested

## Limit-Order DCA Variant

Instead of market buys, place limit orders slightly below the current price for better fills:

```bash
PRICE=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].bid_price')
LIMIT=$(echo "scale=2; $PRICE * 0.998" | bc)
VOLUME=$(echo "scale=8; 100 / $LIMIT" | bc)
kraken order buy BTCUSD $VOLUME --type limit --price $LIMIT -o json 2>/dev/null
```

Check fill status at the next interval. Cancel unfilled orders before placing new ones:

```bash
kraken open-orders -o json 2>/dev/null
kraken order cancel <UNFILLED_TXID> -o json 2>/dev/null
```

## Multi-Asset DCA

Split a fixed budget across multiple assets (e.g., 60% BTC, 30% ETH, 10% SOL):

```bash
# $100 total: $60 BTC, $30 ETH, $10 SOL
# Calculate volumes for each, then place orders sequentially
```

## Scheduling

The CLI does not include a built-in scheduler. Agents should use external scheduling (cron, task scheduler, or the agent's own loop timer) to trigger DCA buys at the chosen interval (daily, weekly, bi-weekly, monthly).

## Hard Rules

- Never execute live DCA buys without explicit human approval for the strategy and per-trade confirmation (unless operating at autonomy level 4+).
- Always paper-test the DCA loop first.
- Track cost basis after every buy; do not lose history.
- Cancel stale limit orders before placing new ones to avoid duplicate exposure.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-grid-trading

Capability: paper, live trade

Grid of limit orders, `order batch` for 2 to 15 orders, maintenance loop, shutdown via `order cancel-all --yes` or `order cancel-batch`. Risk text: loses in strong trends, accumulates below the grid, sells everything above it. Model-enforced: approval for the full grid; `cancel-after` for unattended grids.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-grid-trading
version: 1.0.0
description: "Grid trading strategy with layered buy and sell orders across a price range."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-grid-trading

Use this skill for:
- placing a grid of limit orders across a price range
- profiting from sideways/ranging markets
- managing grid state (filled orders, replacements)
- paper-testing grid parameters before live deployment

## Core Concept

Grid trading places buy orders below the current price and sell orders above it at fixed intervals. When a buy fills, a corresponding sell is placed one grid level higher. When a sell fills, a corresponding buy is placed one grid level lower. Profit comes from capturing the spread at each level.

## Grid Parameters

Define before starting:
- **Pair**: e.g., BTCUSD
- **Range**: lower bound to upper bound (e.g., 55000-65000)
- **Grid levels**: number of orders (e.g., 10)
- **Order size**: volume per grid level (e.g., 0.001 BTC)

Grid spacing = (upper - lower) / grid levels.

## Paper Grid Test

Always test in paper mode first:

```bash
kraken workspace create sandbox --capital 10000 --mode paper -o json 2>/dev/null
export KRAKEN_WORKSPACE=sandbox

# Place buy grid below current price
kraken paper buy BTCUSD 0.001 --type limit --price 58000 -o json 2>/dev/null
kraken paper buy BTCUSD 0.001 --type limit --price 57000 -o json 2>/dev/null
kraken paper buy BTCUSD 0.001 --type limit --price 56000 -o json 2>/dev/null

# Place sell grid above current price
kraken paper sell BTCUSD 0.001 --type limit --price 62000 -o json 2>/dev/null
kraken paper sell BTCUSD 0.001 --type limit --price 63000 -o json 2>/dev/null
kraken paper sell BTCUSD 0.001 --type limit --price 64000 -o json 2>/dev/null

kraken paper orders -o json 2>/dev/null
kraken workspace status -o json 2>/dev/null
```

## Live Grid Placement

Live commands run outside the paper workspace, so clear it first. Inside it,
orders fill on paper and `order batch` and `order cancel-batch` are refused:

```bash
unset KRAKEN_WORKSPACE
```

1. Read current price to center the grid:
   ```bash
   kraken ticker BTCUSD -o json 2>/dev/null
   ```
2. Calculate grid levels (agent logic).
3. Validate each order:
   ```bash
   kraken order buy BTCUSD 0.001 --type limit --price 58000 --validate -o json 2>/dev/null
   ```
4. Place orders (requires human approval for the full grid):
   ```bash
   kraken order buy BTCUSD 0.001 --type limit --price 58000 -o json 2>/dev/null
   kraken order buy BTCUSD 0.001 --type limit --price 57000 -o json 2>/dev/null
   # ... remaining grid levels
   ```
5. Use batch orders when placing 2-15 orders:
   ```bash
   kraken order batch grid-orders.json --pair BTCUSD --validate -o json 2>/dev/null
   kraken order batch grid-orders.json --pair BTCUSD -o json 2>/dev/null
   ```

## Grid Maintenance Loop

Monitor fills and replace completed orders:

1. Check open orders:
   ```bash
   kraken open-orders -o json 2>/dev/null
   ```
2. Check recent trades for fills:
   ```bash
   kraken trades-history -o json 2>/dev/null
   ```
3. For each filled buy at level N, place a sell at level N+1.
4. For each filled sell at level N, place a buy at level N-1.

Stream executions for real-time fill detection:

```bash
kraken ws executions -o json 2>/dev/null
```

## Grid Shutdown

Cancel all grid orders cleanly. `--yes` skips the CLI prompt, so pass it only after the user approves:

```bash
kraken order cancel-all --yes -o json 2>/dev/null
```

Or cancel specific orders by TXID:

```bash
kraken order cancel-batch <TXID1> <TXID2> <TXID3> -o json 2>/dev/null
```

## Risk Considerations

- Grid trading profits in ranging markets but loses in strong trends.
- If price moves below the entire grid, the agent accumulates the asset at a loss.
- If price moves above the entire grid, the agent sells all holdings and misses further upside.
- Set stop-loss boundaries outside the grid range to limit downside.

## Hard Rules

- Never place or cancel live grid orders without explicit human approval.
- Paper-test every grid configuration before live deployment.
- Enable `cancel-after` for unattended grid sessions.
- Track total grid P&L, not just individual level fills.
- Cancel the entire grid before adjusting parameters; do not leave orphaned orders.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-rebalancing

Capability: paper, live trade

Target weights, drift detection (example 5 percent), minimum trade threshold (example $50), sells before buys, limit order variant. Model-enforced: present the full plan, approval, respect minimum order sizes.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-rebalancing
version: 1.0.0
description: "Portfolio rebalancing to maintain target allocations across assets."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-rebalancing

Use this skill for:
- checking current portfolio allocation vs target weights
- calculating rebalance trades
- executing rebalance orders with minimum trade thresholds
- scheduling periodic rebalance checks

## Define Target Allocation

Example target: 50% BTC, 30% ETH, 20% SOL (by USD value).

The agent maintains these weights and compares against current holdings.

## Read Current Portfolio

1. Get balances:
   ```bash
   kraken balance -o json 2>/dev/null
   ```
2. Get current prices for all held assets:
   ```bash
   kraken ticker BTCUSD ETHUSD SOLUSD -o json 2>/dev/null
   ```
3. Calculate USD value of each holding and total portfolio value.
4. Compute current weights: asset_value / total_value for each.

## Calculate Rebalance Trades

For each asset:
- Target value = total_portfolio * target_weight
- Current value = holdings * current_price
- Delta = target_value - current_value
- If delta > threshold: buy (delta / price) units
- If delta < -threshold: sell (|delta| / price) units

Set a minimum trade threshold (e.g., $50) to avoid placing tiny orders that waste fees.

## Paper Rebalance Test

```bash
kraken workspace create sandbox --capital 10000 --mode paper -o json 2>/dev/null
export KRAKEN_WORKSPACE=sandbox

# Initial buys to establish positions
kraken paper buy BTCUSD 0.05 -o json 2>/dev/null
kraken paper buy ETHUSD 1.0 -o json 2>/dev/null
kraken paper buy SOLUSD 10 -o json 2>/dev/null

kraken workspace status -o json 2>/dev/null

# After price drift, rebalance
# Sell overweight asset, buy underweight asset
kraken paper sell BTCUSD 0.005 -o json 2>/dev/null
kraken paper buy SOLUSD 2 -o json 2>/dev/null

kraken workspace status -o json 2>/dev/null
```

## Live Rebalance Execution

Live orders run outside the paper workspace, so run `unset KRAKEN_WORKSPACE`
first. Inside it, the orders fill on paper and `kraken balance` reads the
paper ledger.

1. Calculate all required trades.
2. Present the rebalance plan to the user:
   - Current allocation vs target
   - Proposed trades with estimated fees
3. Validate each order:
   ```bash
   kraken order sell BTCUSD 0.005 --type market --validate -o json 2>/dev/null
   kraken order buy SOLUSD 2 --type market --validate -o json 2>/dev/null
   ```
4. Execute sells first (to free capital), then buys (requires human approval):
   ```bash
   kraken order sell BTCUSD 0.005 --type market -o json 2>/dev/null
   kraken order buy SOLUSD 2 --type market -o json 2>/dev/null
   ```
5. Verify final state:
   ```bash
   kraken balance -o json 2>/dev/null
   ```

## Drift Detection

Periodically compare current weights to targets. Trigger rebalance when any asset drifts beyond a threshold (e.g., 5% absolute drift):

```bash
# Agent checks balance and prices on a schedule
# If |current_weight - target_weight| > 0.05 for any asset → rebalance
```

## Rebalance with Limit Orders

For lower fees, use limit orders instead of market:

```bash
PRICE=$(kraken ticker SOLUSD -o json 2>/dev/null | jq -r '.[].ask_price')
kraken order buy SOLUSD 2 --type limit --price $PRICE -o json 2>/dev/null
```

Check fills before declaring rebalance complete:

```bash
kraken open-orders -o json 2>/dev/null
```

## Hard Rules

- Never execute rebalance trades without explicit human approval.
- Always present the full rebalance plan (sells and buys) before execution.
- Execute sells before buys to ensure sufficient quote currency.
- Respect minimum order sizes for each pair (check pair info with `kraken pairs`).
- Apply a minimum trade threshold to skip negligible adjustments.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-twap-execution

Capability: paper, live trade

Time-sliced orders. Flag: the live loop calls `order buy ... --type market` in a `for` loop with `sleep`, validating then placing each slice. The skill admits: "As written, the loop sends every slice without asking anyone, so run it only at autonomy level 4+." Model-enforced.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-twap-execution
version: 1.0.0
description: "Execute large orders as time-weighted slices to reduce market impact."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
    skills: ["kraken-spot-execution"]
---

# kraken-twap-execution

Use this skill for:
- breaking a large order into smaller time-spaced slices
- reducing market impact and slippage on size
- executing over minutes, hours, or days
- tracking average fill price across slices

## Core Concept

Time-Weighted Average Price (TWAP) splits a large order into N equal slices executed at regular intervals. The goal is to achieve an average price close to the time-weighted market average, reducing the impact a single large order would have on the book.

## Parameters

- **Total volume**: the full amount to buy or sell
- **Slices**: number of child orders (e.g., 10)
- **Interval**: time between slices (e.g., 60s, 300s)
- **Slice volume**: total volume / slices

## Paper TWAP Test

```bash
kraken workspace create sandbox --capital 50000 --mode paper -o json 2>/dev/null
export KRAKEN_WORKSPACE=sandbox

# Simulate 5 slices of 0.01 BTC each, 60s apart
kraken paper buy BTCUSD 0.01 -o json 2>/dev/null
# wait 60s
kraken paper buy BTCUSD 0.01 -o json 2>/dev/null
# wait 60s
kraken paper buy BTCUSD 0.01 -o json 2>/dev/null
# repeat...

kraken paper history -o json 2>/dev/null
kraken workspace status -o json 2>/dev/null
```

## Live TWAP Loop

The agent runs this loop externally (the CLI does not have a built-in scheduler).
As written, the loop sends every slice without asking anyone, so run it only at
autonomy level 4+. Below that, run one validated slice per approved call and wait
the interval between calls.
Live orders run outside the paper workspace, so clear it first:

```bash
unset KRAKEN_WORKSPACE
TOTAL_VOLUME=0.05
SLICES=5
SLICE_VOL=$(echo "scale=8; $TOTAL_VOLUME / $SLICES" | bc)
INTERVAL=60

for i in $(seq 1 $SLICES); do
  kraken order buy BTCUSD $SLICE_VOL --type market --validate -o json 2>/dev/null || break
  # A failure prints its envelope here; on "verify_first": true, check open-orders before any retry.
  kraken order buy BTCUSD $SLICE_VOL --type market -o json 2>/dev/null || break
  [ $i -lt $SLICES ] && sleep $INTERVAL
done
```

## Limit-Order TWAP Variant

Use limit orders at the current best bid/ask for potentially better fills:

```bash
PRICE=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].ask_price')
kraken order buy BTCUSD $SLICE_VOL --type limit --price $PRICE -o json 2>/dev/null
```

Check fill status before the next slice. Cancel unfilled orders and adjust:

```bash
kraken open-orders -o json 2>/dev/null
```

## Tracking Average Fill

After all slices, compute the volume-weighted average price from trade history:

```bash
kraken trades-history --consolidate-taker -o json 2>/dev/null
```

Sum (price * volume) for each fill, divide by total volume filled.

## Rate Limit Awareness

The CLI does not pre-throttle requests. If a slice submission hits a rate limit, the error includes a `suggestion` field with tier-specific limits and a `docs_url` pointing to Kraken's documentation. On `rate_limit` error, pause the loop, read the suggestion, and adjust the interval before resuming. A 60-second interval between slices is well within budget for all tiers. For shorter intervals, consult the `kraken-rate-limits` skill for per-tier counter costs and decay rates.

## Hard Rules

- Each live slice requires human approval unless operating at autonomy level 4+.
- Track cumulative fill volume and stop if total exceeds target (handle partial fills).
- On error, pause the loop rather than skipping the slice; resume after recovery.
- Log every slice for post-execution analysis.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

## Funding and earn

### kraken-funding-ops

Capability: live funds

Deposit methods and addresses, `withdraw`, `withdrawal info` for fees, `withdrawal addresses --verified true`, `wallet-transfer`, `futures transfer`. The "pre-approved address" check is model-enforced; the real control is Kraken's withdrawal address lock and the API key lacking Withdraw Funds.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-funding-ops
version: 1.0.0
description: "Manage deposits, withdrawals, and wallet transfers safely."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-funding-ops

Use this skill for:
- checking deposit methods and addresses
- tracking deposit and withdrawal status
- withdrawing funds to pre-approved addresses
- transferring between spot and futures wallets

## Deposit Workflow

1. Find available methods for an asset:
   ```bash
   kraken deposit methods BTC -o json 2>/dev/null
   ```
2. Get a deposit address:
   ```bash
   kraken deposit addresses BTC "Bitcoin" -o json 2>/dev/null
   ```
3. Generate a new address (if supported):
   ```bash
   kraken deposit addresses BTC "Bitcoin" --new -o json 2>/dev/null
   ```
4. Monitor incoming deposits:
   ```bash
   kraken deposit status --asset BTC -o json 2>/dev/null
   ```

Filter by time range:

```bash
kraken deposit status --asset BTC --start 1704067200 --end 1706745600 -o json 2>/dev/null
```

Paginate large result sets:

```bash
kraken deposit status --asset BTC --limit 25 --cursor <CURSOR> -o json 2>/dev/null
```

## Withdrawal Workflow

1. Check available methods:
   ```bash
   kraken withdrawal methods --asset BTC -o json 2>/dev/null
   ```
2. Check pre-approved addresses:
   ```bash
   kraken withdrawal addresses --asset BTC --verified true -o json 2>/dev/null
   ```
3. Get fee estimate:
   ```bash
   kraken withdrawal info BTC "my-btc-address" 0.5 -o json 2>/dev/null
   ```
4. Execute withdrawal (requires human approval):
   ```bash
   kraken withdraw BTC "my-btc-address" 0.5 -o json 2>/dev/null
   ```
5. Track status:
   ```bash
   kraken withdrawal status --asset BTC -o json 2>/dev/null
   ```

Cancel a pending withdrawal:

```bash
kraken withdrawal cancel BTC <REFID> -o json 2>/dev/null
```

## Wallet Transfer

Move funds between spot and futures wallets:

```bash
kraken wallet-transfer USD 1000 --from <SPOT_IIBAN> --to <FUTURES_IIBAN> -o json 2>/dev/null
```

Futures-specific transfer:

```bash
kraken futures transfer 1000 USD -o json 2>/dev/null
```

Check transfer history:

```bash
kraken futures transfers -o json 2>/dev/null
```

## Fee-Aware Withdrawal Pattern

Always check fees before withdrawing. Compare the fee to the withdrawal amount:

```bash
INFO=$(kraken withdrawal info BTC "my-btc-address" 0.5 -o json 2>/dev/null)
# Parse .fee and .limit from the response
# Present fee to user before proceeding
```

## Hard Rules

- Withdrawals are flagged as dangerous. Never execute without explicit human approval.
- Always verify the withdrawal address matches a pre-approved address in account settings.
- Use `--verified true` when listing addresses to confirm approval status.
- Check fees before every withdrawal; network fees fluctuate.
- Cancel pending withdrawals promptly if the user changes their mind: the window is short.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-earn-staking

Capability: live funds

Strategies, allocate, deallocate, status. Flex (auto-earn) cannot be allocated or deallocated via API. Handling of `verify_first` after a network error is spelled out. Model-enforced: approval, warn on bonded lock-ups.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-earn-staking
version: 1.0.0
description: "Discover staking strategies, allocate funds, and track earn positions."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-earn-staking

Use this skill for:
- browsing available earn/staking strategies
- allocating funds to earn products
- deallocating (unstaking) funds
- monitoring current allocations and status

## Discover Strategies

### Lock types

- "bonded": The strategy has bonding and/or unbonding period that lock up funds
- "instant": Known as "flexible". The funds are immediately allocated or deallocated without a lock-up period
- "flex": Known as "auto-earn". No lock-up period. Funds are available for anything - trading, withdrawal, etc. without having to explicitly deallocate them

When communicating to client, use the front-end terminology rather than API terminology (so bonded, flexible and auto-earn).

### Flex

- Better known as auto-earn
- Funds in eligible wallet (i.e. spot wallet) are implicitly allocated
- No lock-up period
- Funds cannot be explicitly allocated to or deallocated from a strategy via API — Auto-Earn manages this automatically based on settings
- Auto-earn preferences (enable/disable per yield source) can be set in user settings, but not via API
- The granularity of control per yield source: staking, opt-in-rewards, base-rewards
- `can_allocate` and `can_deallocate` on flex strategy are always false even if user is eligible for the flex strategy

### Examples

List all strategies for an asset:

```bash
kraken earn strategies --asset ETH -o json 2>/dev/null
```

Filter by lock type:

```bash
kraken earn strategies --asset ETH --lock-type instant -o json 2>/dev/null
kraken earn strategies --asset DOT --lock-type bonded -o json 2>/dev/null
```

Paginate results:

```bash
kraken earn strategies --limit 10 --cursor <CURSOR> --ascending -o json 2>/dev/null
```

Key fields in each strategy (under `.items[]`): `id`, `asset`, `apr_estimate`, `lock_type.type`, `user_min_allocation`, `user_cap`, `can_allocate`, `can_deallocate`, `yield_source`.

## Allocation Workflow

1. Pick a strategy from the list and note its `id`.
2. Record what is allocated to it now. In `.items[]`, find the entry whose
   `strategy_id` is that `id`, and note `amount_allocated.total.native` and
   `amount_allocated.pending.native` (a missing `pending`, or a strategy that is not listed, counts as zero):
   ```bash
   kraken earn allocations -o json 2>/dev/null
   ```
3. Allocate funds (requires human approval):
   ```bash
   kraken earn allocate <STRATEGY_ID> 1.5 -o json 2>/dev/null
   ```
4. Check allocation status (bonded strategies may have a lock-up period):
   ```bash
   kraken earn allocate-status <STRATEGY_ID> -o json 2>/dev/null
   ```

## Deallocation Workflow

1. Record what is allocated to it now. In `.items[]`, find the entry whose
   `strategy_id` is the strategy's `id`, and note `amount_allocated.total.native` and
   `amount_allocated.pending.native` (a missing `pending`, or a strategy that is not listed, counts as zero):
   ```bash
   kraken earn allocations -o json 2>/dev/null
   ```
2. Deallocate (requires human approval):
   ```bash
   kraken earn deallocate <STRATEGY_ID> 1.0 -o json 2>/dev/null
   ```
3. Check deallocation status:
   ```bash
   kraken earn deallocate-status <STRATEGY_ID> -o json 2>/dev/null
   ```

Bonded strategies may have unbonding periods. The status response indicates whether funds are pending or available.

If `earn allocate` or `earn deallocate` returns a `network` error with `"verify_first": true`, the move may already have happened. Run `kraken earn allocations -o json` again, compare both values with the ones you recorded, and check `kraken ledgers`. Send the call again only if neither shows the move. `earn allocate-status` and `earn deallocate-status` only say whether a known move is still pending.

## View Current Allocations

```bash
kraken earn allocations -o json 2>/dev/null
```

Filter out zero balances:

```bash
kraken earn allocations --hide-zero-allocations -o json 2>/dev/null
```

Convert to a reference currency for comparison:

```bash
kraken earn allocations --converted-asset USD --hide-zero-allocations -o json 2>/dev/null
```

## Strategy Selection Pattern

When helping a user choose a strategy:

1. List strategies for the asset.
2. Compare `apr_estimate`, `lock_type.type`, and `user_min_allocation`.
3. Present a summary: flexible strategies offer instant access; bonded strategies lock funds for higher yield.
4. Confirm the user's choice before allocating.

## Hard Rules

- Allocate and deallocate are flagged as dangerous. Never execute without explicit human approval.
- Always show the lock type and any unbonding period before allocation.
- For bonded strategies, warn the user that funds will be locked for the stated duration.
- Check `can_allocate` and `can_deallocate` fields before attempting operations.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### kraken-tax-export

Capability: read (export-delete is dangerous)

Trade and ledger exports (`export-report`, `export-status`, `export-retrieve`), futures history, deposit and withdrawal status, staking ledger entries. `export-retrieve` writes to disk and `export-delete` is irreversible; both flagged dangerous. Full text omitted, not a trading skill.

## Portfolio and account

### kraken-portfolio-intel

Capability: read

Balances, extended balance, trade balance, trade history, ledgers, fee tier, exports, futures account and positions. Read only apart from `export-delete`. Full text omitted, not a trading skill.

### kraken-subaccount-ops

Capability: live funds

Create subaccounts, transfer between main and sub IIBANs, futures subaccount trading status and wallet transfers, isolation pattern. "a created subaccount cannot be removed through the API". Model-enforced approval.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: kraken-subaccount-ops
version: 1.0.0
description: "Create and manage subaccounts with inter-account transfers."
metadata:
  openclaw:
    category: "finance"
  requires:
    bins: ["kraken"]
---

# kraken-subaccount-ops

Use this skill for:
- creating subaccounts for strategy isolation
- transferring funds between main and subaccounts
- managing futures subaccount trading status
- isolating risk across multiple strategies

## Why Subaccounts

Subaccounts isolate balances and positions. Use them to:
- Run different strategies with separate capital pools.
- Limit risk exposure per strategy.
- Track P&L per strategy independently.
- Give different agents access to different subaccounts with restricted API keys.

## Create a Subaccount

```bash
kraken subaccount create "dca-bot" "dca-bot@example.com" -o json 2>/dev/null
```

## Transfer Between Accounts

Move funds from main account to subaccount (requires human approval):

```bash
kraken subaccount transfer USD 5000 --from <MAIN_IIBAN> --to <SUB_IIBAN> -o json 2>/dev/null
```

Move funds back:

```bash
kraken subaccount transfer USD 5000 --from <SUB_IIBAN> --to <MAIN_IIBAN> -o json 2>/dev/null
```

## Futures Subaccounts

List futures subaccounts:

```bash
kraken futures subaccounts -o json 2>/dev/null
```

Check subaccount trading status:

```bash
kraken futures subaccount-status <UID> -o json 2>/dev/null
```

Enable or disable trading for a subaccount:

```bash
kraken futures set-subaccount-status <UID> true -o json 2>/dev/null
kraken futures set-subaccount-status <UID> false -o json 2>/dev/null
```

Transfer between futures wallets:

```bash
kraken futures wallet-transfer <FROM_WALLET> <TO_WALLET> USD 1000 -o json 2>/dev/null
```

## Strategy Isolation Pattern

1. Create a subaccount per strategy (e.g., "grid-btc", "dca-eth").
2. Allocate capital to each subaccount.
3. Configure separate API keys per subaccount with minimum required permissions.
4. Each agent operates only within its assigned subaccount.
5. The main account retains reserve capital not allocated to any strategy.

## Monitoring

Check all balances from the main account to see aggregate state. Individual subaccount balances are visible through their respective API keys.

For centralized monitoring, use the main account's credentials with query permissions across subaccounts.

## Hard Rules

- Subaccount transfers and `subaccount create` are flagged as dangerous. Never execute without explicit human approval — a created subaccount cannot be removed through the API.
- Never share API keys across subaccounts; create separate keys per subaccount.
- Verify IIBAN values before initiating transfers; incorrect IIBANs will fail.
- Disable futures trading on subaccounts that should not trade futures.
- If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

## Recipes: playground (paper)

### recipe-playground-dca

Capability: paper

Time-gated DCA driver under `/loop`. Params in `--strategy-params` (`dollars_per_buy`, `rounds`, `interval_s`, `dip_threshold_pct`). Each round verifies workspace mode is `paper`, claims the round in the session state cell before acting, fails loud on empty reads. Scheduler floor 60 seconds. Verbatim: "Never permit a bare `kraken order buy`: outside a workspace it is a real order." Model-enforced paper boundary.

### recipe-playground-dca-triggered

Capability: paper

Event-gated variant: a WebSocket stream drives buys with `min_spacing_s` rate limit and `max_buys`. Long-lived shell loop, blind during reconnects. Mode check runs once before the stream starts, not per tick.

### recipe-playground-rebalance

Capability: paper

Multi-leg paper rebalance with cursor in session state, `legs_done` crash recovery, sells before buys, fee and slippage reserve on buys, fresh balance each round. Mode check per round.

### recipe-playground-price-alert

Capability: read, paper

Alert-on-crossing using a zone state (`above`, `within`, `below`) in the session state cell. Verbatim: "Alert-only: it records crossings, it never places a trade."

### recipe-playground-webhook

Capability: paper

Local HTTP listener on 127.0.0.1 converts webhook POSTs into paper orders. Treats the payload as untrusted: side enum, symbol allowlist, numeric qty, notional cap, `max_signals`, optional shared token. Guardrails are bash in the recipe, model-run. Verbatim: "The listener binds `127.0.0.1` only".

### recipe-session-post-mortem

Capability: read

Narrates a stopped session from `kraken explain pnl` and `kraken replay`. Verbatim: "Read-only. This recipe never places orders". Every number must come from command output.

## Recipes: strategy (live)

### recipe-start-dca-bot

Capability: paper, live trade

Paper buys then live: `auth test`, `balance`, `order buy --validate`, first live buy "requires human approval", verify fill. Note step 6: run live steps with no workspace active.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-start-dca-bot
version: 1.0.0
description: "Set up and run a dollar cost averaging bot from paper test to live."
metadata:
  openclaw:
    category: "recipe"
    domain: "strategy"
  requires:
    bins: ["kraken"]
    skills: ["kraken-dca-strategy", "kraken-paper-to-live"]
---

# Start a DCA Bot

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-dca-strategy`, `kraken-paper-to-live`

Set up a dollar cost averaging bot that buys a fixed dollar amount of BTC at regular intervals.

> **CAUTION:** Live orders spend real money. Paper-test first, then promote with explicit approval.

## Steps

1. Initialize paper account: `kraken workspace create sandbox --capital 10000 --mode paper -o json 2>/dev/null`
2. Calculate volume from dollar amount: `PRICE=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].last_price') && VOLUME=$(echo "scale=8; 100 / $PRICE" | bc)`
3. Run 5 paper DCA buys to validate the loop: `kraken --workspace sandbox paper buy BTCUSD $VOLUME -o json 2>/dev/null`
4. Check paper results: `kraken workspace status sandbox -o json 2>/dev/null`
5. Review paper trade history: `kraken --workspace sandbox paper history -o json 2>/dev/null`
6. Run the live steps with no workspace active: `unset KRAKEN_WORKSPACE` in the shell that runs them, or prefix each live command with `KRAKEN_WORKSPACE=`. Inside a paper workspace, `balance` and `trades-history` read the paper ledger and `order buy` fills on paper.
7. Verify live credentials: `kraken auth test -o json 2>/dev/null`
8. Check live balance: `kraken balance -o json 2>/dev/null`
9. Validate the live order: `kraken order buy BTCUSD $VOLUME --type market --validate -o json 2>/dev/null`
10. Execute first live buy (requires human approval): `kraken order buy BTCUSD $VOLUME --type market -o json 2>/dev/null`
11. Verify fill: `kraken trades-history -o json 2>/dev/null`

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-launch-grid-bot

Capability: paper, live trade

Paper grid, then live with `order cancel-after 3600`, validate, place levels, replace filled levels. Approval gates are prose.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-launch-grid-bot
version: 1.0.0
description: "Deploy a grid trading bot with paper validation and live safety controls."
metadata:
  openclaw:
    category: "recipe"
    domain: "strategy"
  requires:
    bins: ["kraken"]
    skills: ["kraken-grid-trading", "kraken-paper-to-live"]
---

# Launch a Grid Bot

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-grid-trading`, `kraken-paper-to-live`

Deploy a grid of buy and sell orders across a price range.

> **CAUTION:** Grids profit in ranging markets but lose in strong trends. Always paper-test first.

## Steps

1. Get current price: `PRICE=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].last_price')`
2. Compute grid levels (e.g., 3 levels at $1000 spacing): `BUY1=$(echo "$PRICE - 1000" | bc)`, `BUY2=$(echo "$PRICE - 2000" | bc)`, `BUY3=$(echo "$PRICE - 3000" | bc)`, `SELL1=$(echo "$PRICE + 1000" | bc)`, `SELL2=$(echo "$PRICE + 2000" | bc)`, `SELL3=$(echo "$PRICE + 3000" | bc)`
3. Paper-test the grid in its own workspace: `kraken workspace create sandbox --capital 10000 --mode paper -o json 2>/dev/null`
4. Place paper buy levels: `kraken --workspace sandbox paper buy BTCUSD 0.001 --type limit --price $BUY1 -o json 2>/dev/null` (repeat for BUY2, BUY3)
5. Place paper sell levels: `kraken --workspace sandbox paper sell BTCUSD 0.001 --type limit --price $SELL1 -o json 2>/dev/null` (repeat for SELL2, SELL3)
6. Monitor paper fills: `kraken --workspace sandbox paper orders -o json 2>/dev/null`
7. Review paper results: `kraken workspace status sandbox -o json 2>/dev/null`
8. Run the live steps with no workspace active: `unset KRAKEN_WORKSPACE` in the shell that runs them, or prefix each live command with `KRAKEN_WORKSPACE=`. Inside a paper workspace, `balance` reads the paper ledger, `order cancel-after` is refused, and `order buy` fills on paper.
9. Pre-flight live: `kraken auth test -o json 2>/dev/null && kraken balance -o json 2>/dev/null`
10. Enable dead man's switch: `kraken order cancel-after 3600 -o json 2>/dev/null`
11. Validate live grid orders: `kraken order buy BTCUSD 0.001 --type limit --price $BUY1 --validate -o json 2>/dev/null`
12. Place live grid (requires human approval): place buy and sell levels sequentially using $BUY1-3 and $SELL1-3
13. Monitor fills: `kraken ws executions -o json 2>/dev/null`
14. Replace filled levels (requires human approval): when a buy fills, place a sell one level up, and vice versa

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-trailing-stop-runner

Capability: live trade

Market entry (approval), verify fill, place trailing stop `+500`, watch ticker stream. No `--validate` step.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-trailing-stop-runner
version: 1.0.0
description: "Ride a trend with a trailing stop that locks in profits on reversal."
metadata:
  openclaw:
    category: "recipe"
    domain: "strategy"
  requires:
    bins: ["kraken"]
    skills: ["kraken-stop-take-profit", "kraken-spot-execution"]
---

# Trailing Stop Runner

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-stop-take-profit`, `kraken-spot-execution`

Enter a position and attach a trailing stop to capture trend profits while limiting downside.

## Steps

1. Get current price: `kraken ticker BTCUSD -o json 2>/dev/null`
2. Enter position (requires human approval): `kraken order buy BTCUSD 0.01 --type market -o json 2>/dev/null`
3. Verify fill: `kraken trades-history -o json 2>/dev/null`
4. Set trailing stop (e.g., $500 trail distance): `kraken order sell BTCUSD 0.01 --type trailing-stop --price +500 -o json 2>/dev/null`
5. Verify stop is placed: `kraken open-orders -o json 2>/dev/null`
6. Monitor via stream: `kraken ws ticker BTC/USD -o json 2>/dev/null`
7. When the trailing stop triggers, verify the exit fill: `kraken trades-history -o json 2>/dev/null`
8. Report entry price, exit price, and net P&L

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-basis-trade-entry

Capability: live trade

Compute basis, check balances and futures margin, place spot buy then futures short, cancel any unfilled leg.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-basis-trade-entry
version: 1.0.0
description: "Enter a spot-futures basis trade when the premium exceeds a target threshold."
metadata:
  openclaw:
    category: "recipe"
    domain: "strategy"
  requires:
    bins: ["kraken"]
    skills: ["kraken-basis-trading", "kraken-futures-risk"]
---

# Basis Trade Entry

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-basis-trading`, `kraken-futures-risk`

Enter a delta-neutral basis trade (long spot, short futures) when the basis premium is attractive.

> **CAUTION:** Both legs must fill to be market-neutral. A single-leg fill is a directional bet.

## Steps

1. Get spot price: `SPOT=$(kraken ticker BTCUSD -o json 2>/dev/null | jq -r '.[].last_price')`
2. Get futures price: `FUTURES=$(kraken futures ticker PF_XBTUSD -o json 2>/dev/null | jq -r '.ticker.last')`
3. Calculate basis: `BASIS=$(echo "scale=4; ($FUTURES - $SPOT) / $SPOT * 100" | bc)`
4. If basis < target threshold (e.g., 0.5% annualized), skip
5. Check spot balance for capital: `kraken balance -o json 2>/dev/null`
6. Check futures margin availability: `kraken futures accounts -o json 2>/dev/null`
7. Calculate matched position sizes
8. Execute spot buy (requires human approval): `kraken order buy BTCUSD 0.01 --type limit --price $SPOT -o json 2>/dev/null`
9. Execute futures short: `kraken futures order sell PF_XBTUSD 1 --type limit --price $FUTURES -o json 2>/dev/null`
10. Verify both legs filled: `kraken open-orders -o json 2>/dev/null` + `kraken futures open-orders -o json 2>/dev/null`
11. If one leg unfilled, cancel it to avoid directional exposure

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-futures-hedge-spot

Capability: live trade

Short futures sized from the raw `BTC` balance, `cancel-after 3600`, margin monitoring, remove hedge with a `--reduce-only` buy.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-futures-hedge-spot
version: 1.0.0
description: "Hedge a spot holding with a short futures position to lock in value."
metadata:
  openclaw:
    category: "recipe"
    domain: "strategy"
  requires:
    bins: ["kraken"]
    skills: ["kraken-spot-execution", "kraken-futures-trading", "kraken-futures-risk"]
---

# Hedge Spot with Futures

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-spot-execution`, `kraken-futures-trading`, `kraken-futures-risk`

Protect a spot BTC holding from downside by shorting an equivalent futures position.

> **CAUTION:** This locks in current value but also caps upside. Futures margin requirements apply.

## Steps

1. Check spot balance: `kraken balance -o json 2>/dev/null`
2. Get spot price: `kraken ticker BTCUSD -o json 2>/dev/null`
3. Get futures price: `kraken futures ticker PF_XBTUSD -o json 2>/dev/null`
4. Check futures margin availability: `kraken futures accounts -o json 2>/dev/null`
5. Calculate matching futures size: `BTC_BAL=$(kraken balance -o json 2>/dev/null | jq -r '.BTC // "0"')` and `FUT_PRICE=$(kraken futures ticker PF_XBTUSD -o json 2>/dev/null | jq -r '.ticker.last')`
6. Open short futures position (requires human approval): `kraken futures order sell PF_XBTUSD $BTC_BAL --type limit --price $FUT_PRICE -o json 2>/dev/null`
7. Verify the position: `kraken futures positions -o json 2>/dev/null`
8. Enable dead man's switch: `kraken futures cancel-after 3600 -o json 2>/dev/null`
9. Monitor margin: `kraken futures accounts -o json 2>/dev/null`
10. To remove hedge, close futures (requires human approval): `kraken futures order buy PF_XBTUSD $BTC_BAL --type market --reduce-only -o json 2>/dev/null`

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-funding-rate-scan

Capability: read

Ranks perpetual contracts by annualized funding yield. Read only.

### recipe-paper-strategy-backtest

Capability: paper

Runs 3 to 5 paper rounds with `workspace reset --yes` between them and compares results. Verbatim: "A strategy that is only marginally profitable on paper with fees and slippage enabled is likely unprofitable live."

## Recipes: portfolio

### recipe-weekly-rebalance

Capability: live trade

Weekly drift check against 5 percent bands, present plan, validate, sells then buys.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-weekly-rebalance
version: 1.0.0
description: "Run a weekly portfolio rebalance to maintain target asset allocations."
metadata:
  openclaw:
    category: "recipe"
    domain: "portfolio"
  requires:
    bins: ["kraken"]
    skills: ["kraken-rebalancing"]
---

# Weekly Rebalance

> **PREREQUISITE:** Load the following skill to execute this recipe: `kraken-rebalancing`

Check portfolio drift and rebalance to target weights once per week.

## Steps

1. Get balances: `kraken balance -o json 2>/dev/null`
2. Get prices: `kraken ticker BTCUSD ETHUSD SOLUSD -o json 2>/dev/null`
3. Calculate current weights (agent computes USD value per asset / total)
4. Compare to targets (e.g., 50% BTC, 30% ETH, 20% SOL)
5. If any asset drifts more than 5% from target, compute rebalance trades: `SELL_VOL=$(echo "scale=8; ($CURRENT_BTC_VALUE - $TARGET_BTC_VALUE) / $BTC_PRICE" | bc)` and `BUY_VOL=$(echo "scale=8; ($TARGET_SOL_VALUE - $CURRENT_SOL_VALUE) / $SOL_PRICE" | bc)`
6. Present the rebalance plan to the user with estimated fees
7. Validate sell orders: `kraken order sell BTCUSD $SELL_VOL --type market --validate -o json 2>/dev/null`
8. Execute sells first (requires human approval): `kraken order sell BTCUSD $SELL_VOL --type market -o json 2>/dev/null`
9. Execute buys with freed capital: `kraken order buy SOLUSD $BUY_VOL --type market -o json 2>/dev/null`
10. Verify final allocations: `kraken balance -o json 2>/dev/null`

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-daily-pnl-report

Capability: read

Daily P&L from balances, tickers, `trades-history` and ledgers. Read only.

### recipe-portfolio-snapshot-csv

Capability: read

Balances, prices, earn allocations and futures positions into CSV. Read only.

### recipe-subaccount-capital-rotation

Capability: live funds

Ranks subaccounts by risk-adjusted return and moves capital with `subaccount transfer`. Verbatim: "Transfers move real funds. Always confirm IIBANs and amounts."

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-subaccount-capital-rotation
version: 1.0.0
description: "Rotate capital between subaccounts based on strategy performance."
metadata:
  openclaw:
    category: "recipe"
    domain: "portfolio"
  requires:
    bins: ["kraken"]
    skills: ["kraken-subaccount-ops", "kraken-portfolio-intel"]
---

# Subaccount Capital Rotation

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-subaccount-ops`, `kraken-portfolio-intel`

Evaluate strategy performance per subaccount and reallocate capital to winning strategies.

> **CAUTION:** Transfers move real funds. Always confirm IIBANs and amounts.

## Steps

1. Check main account balance: `kraken balance -o json 2>/dev/null`
2. Check each subaccount balance (via their API keys or main account view)
3. Review trade history per subaccount to calculate P&L
4. Rank strategies by risk-adjusted return
5. Calculate new allocation (increase capital for outperformers, reduce for underperformers)
6. Obtain IIBANs from account settings or the Kraken web UI (IIBANs are account-specific identifiers like `ABCD 1234 EFGH 5678`)
7. Transfer from underperforming subaccount to main (requires human approval): `kraken subaccount transfer USD 2000 --from $SUB_IIBAN --to $MAIN_IIBAN -o json 2>/dev/null`
8. Transfer from main to outperforming subaccount: `kraken subaccount transfer USD 2000 --from $MAIN_IIBAN --to $SUB_IIBAN -o json 2>/dev/null`
9. Verify balances after transfers: `kraken balance -o json 2>/dev/null`

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-fee-tier-progress

Capability: read

Compares 30-day volume to the next fee tier. Read only.

## Recipes: market data

### recipe-morning-market-brief

Capability: read

Status, prices, 24h OHLC, balances, open orders, positions, earn allocations. Read only.

### recipe-multi-pair-breakout-watch

Capability: read

Streams several tickers and alerts on support and resistance breaks. Read only.

### recipe-track-orderbook-depth

Capability: read

Order book imbalance ratio (bid volume over total; above 0.6 or below 0.4 flagged). Read only.

### recipe-price-level-alerts

Capability: read

Upper and lower price level alerts from a BBO-triggered ticker stream. Read only.

## Recipes: risk

### recipe-emergency-flatten

Capability: live trade

Cancel all spot and futures orders then close positions with reduce-only market orders. The caution says `--yes` is only for autonomy level 4+, but steps 1 and 2 are written with `--yes`.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-emergency-flatten
version: 1.0.0
description: "Cancel all orders and close all positions in an emergency."
metadata:
  openclaw:
    category: "recipe"
    domain: "risk"
  requires:
    bins: ["kraken"]
    skills: ["kraken-risk-operations", "kraken-liquidation-guard"]
---

# Emergency Flatten

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-risk-operations`, `kraken-liquidation-guard`

Immediately cancel all orders and close all positions across spot and futures.

> **CAUTION:** This closes everything at market prices. Slippage may be significant. The `--yes` flag skips confirmation prompts and is only appropriate at autonomy level 4+ (see `kraken-autonomy-levels`). At lower levels, omit `--yes` and confirm each cancel with the user.

## Steps

1. Cancel all spot orders (dangerous): `kraken order cancel-all --yes -o json 2>/dev/null`
2. Cancel all futures orders (dangerous): `kraken futures cancel-all --yes -o json 2>/dev/null`
3. Check spot positions: `kraken positions -o json 2>/dev/null`
4. Close each spot margin position with a market order (requires human approval)
5. Check futures positions and extract sizes: `kraken futures positions -o json 2>/dev/null` (parse each position's `size` and `side` fields)
6. Close each futures position with reduce-only market orders (requires human approval; use `sell` for longs, `buy` for shorts): e.g., `kraken futures order sell PF_XBTUSD 1 --type market --reduce-only -o json 2>/dev/null`
7. Verify no open orders remain: `kraken open-orders -o json 2>/dev/null`
8. Verify no futures orders remain: `kraken futures open-orders -o json 2>/dev/null`
9. Verify all positions closed: `kraken futures positions -o json 2>/dev/null`
10. Check final balances: `kraken balance -o json 2>/dev/null`

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-drawdown-circuit-breaker

Capability: live trade

Polls portfolio value, tracks a high-water mark, cancels all orders when drawdown passes a threshold (example 10 percent), then waits for the user. Purely agent-side polling with a 5 second minimum interval; no CLI-level circuit breaker. Step 6 requires approval for cancels unless autonomy level 4+.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-drawdown-circuit-breaker
version: 1.0.0
description: "Automatically stop trading when portfolio drawdown exceeds a threshold."
metadata:
  openclaw:
    category: "recipe"
    domain: "risk"
  requires:
    bins: ["kraken"]
    skills: ["kraken-risk-operations", "kraken-alert-patterns"]
---

# Drawdown Circuit Breaker

> **PREREQUISITE:** Load the following skills to execute this recipe: `kraken-risk-operations`, `kraken-alert-patterns`

Monitor portfolio value and halt trading if cumulative drawdown from peak exceeds a limit (e.g., 10%).

## Steps

1. Record starting portfolio value: `kraken balance -o json 2>/dev/null` + `kraken ticker BTCUSD ETHUSD SOLUSD -o json 2>/dev/null` (calculate total USD value)
2. Set this as the high-water mark
3. On each check interval (at least 5 seconds; see `kraken-rate-limits` for tier budgets):
   - Recalculate total portfolio value
   - Update high-water mark if value exceeds previous peak
   - Calculate drawdown: (peak - current) / peak * 100
4. If drawdown exceeds threshold (e.g., 10%):
   - Alert the user immediately
   - Cancel all open orders: `kraken order cancel-all -o json 2>/dev/null`
   - Cancel all futures orders: `kraken futures cancel-all -o json 2>/dev/null`
5. Present drawdown report: peak value, current value, drawdown percentage, orders cancelled
6. Cancel operations require explicit human approval unless operating at autonomy level 4+
7. Wait for explicit user instruction before resuming any trading activity

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

## Recipes: funding

### recipe-withdrawal-to-cold-storage

Capability: live funds

Verify balance, list verified addresses, check fee, present fee and net amount, withdraw with explicit approval, track status.

Full SKILL.md (verbatim, MIT licensed, copyright Payward, Inc. (Kraken)):

~~~~markdown
---
name: recipe-withdrawal-to-cold-storage
version: 1.0.0
description: "Safely withdraw funds to a pre-approved cold storage address."
metadata:
  openclaw:
    category: "recipe"
    domain: "funding"
  requires:
    bins: ["kraken"]
    skills: ["kraken-funding-ops"]
---

# Withdraw to Cold Storage

> **PREREQUISITE:** Load the following skill to execute this recipe: `kraken-funding-ops`

Withdraw crypto to a pre-approved hardware wallet address with fee checks and status tracking.

> **CAUTION:** Withdrawals are irreversible once confirmed on-chain. Triple-check the address.

## Steps

1. Check balance for the asset: `kraken balance -o json 2>/dev/null`
2. List verified withdrawal addresses: `kraken withdrawal addresses --asset BTC --verified true -o json 2>/dev/null`
3. Confirm the target address matches the cold storage address on file
4. Check withdrawal fee: `kraken withdrawal info BTC "cold-storage-btc" 0.5 -o json 2>/dev/null`
5. Present fee and net amount to the user
6. Execute withdrawal (requires explicit human approval): `kraken withdraw BTC "cold-storage-btc" 0.5 -o json 2>/dev/null`
7. Track withdrawal status: `kraken withdrawal status --asset BTC -o json 2>/dev/null`
8. Verify balance reduction: `kraken balance -o json 2>/dev/null`

If you hit a mismatch between what you are trying to do and the CLI's interface or responses — including a mismatch between this skill and the installed CLI version's contract — feel free to submit feedback with `kraken feedback`.

~~~~

### recipe-earn-yield-compare

Capability: read, live funds

Compares APR across assets and lock types; step 8 deallocates and allocates only if the user approves. Read only until that step.
