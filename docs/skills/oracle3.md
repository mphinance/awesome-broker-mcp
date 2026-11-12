# oracle3 prediction-market agent skills (Kalshi, Polymarket, DFlow)

| | |
|---|---|
| Repo | https://github.com/YichengYang-Ethan/oracle3-prediction-market-agent |
| Commit | `267fb7c48dae7c4ff8922c02a3a223443e51bf0b` (committed 2026-10-11) |
| License | Apache-2.0 (`LICENSE`, plus a `NOTICE` file) |
| Date scraped | 2026-11-11 |
| Install (MCP) | Repo README: `git clone` the repo, `python -m venv .venv`, `.venv/bin/python -m pip install -e .`, then `claude mcp add oracle3 -- "$PWD/.venv/bin/oracle3-mcp"`. The `pm-constraint-arbitrage` skill text says `pip install oracle3`, then run `oracle3-mcp`. |
| Install (skills) | No installer. Six skills in `skills/`, with byte-identical project copies in `.claude/skills/` (a diff of the two trees was clean). Open the checkout as your project, or copy a skill directory into `~/.claude/skills/`. |

Method: shallow clone read as plain files. No script, installer, CLI or test from the repo was run.

## Shape of the repo

Six skills, one MCP server, one Python engine with a CLI. The split matters for safety:

- **The MCP server has 13 tools and none of them can place a real order.** `oracle3/mcp_server/server.py` registers 13 `@mcp.tool` functions, each annotated `READ`, `PURE`, `LOCAL_READ`, `PAPER` or `PAPER_RESET`. The only writers are `paper_order` (a local ledger fill against the live book, with fees) and `paper_reset` (erases the ledger, takes a `confirm` argument). `docs/mcp.md` lists the same 13 with a "side effects" column.
- **Live trading is CLI only.** `oracle3 live run` takes a Polymarket wallet private key or Kalshi API key and runs a strategy in the engine. The live skill gates it with prose only.
- DFlow and Solana appear in the engine (the `paper run --exchange` choices include `solana`, and the repo has `blinks` and `onchain` packages) but no skill covers them and the MCP tools take `venue` for Kalshi and Polymarket only (per the README and `docs/mcp.md`).

## MCP tool surface (13, from `docs/mcp.md`)

| Tool | Side effect |
|---|---|
| `search_markets`, `get_market`, `get_orderbook`, `get_quote` | read-only, public Kalshi and Polymarket data |
| `check_constraint_live` | read-only, fetches quotes and fee schedules |
| `check_constraint`, `trading_fee`, `fair_value`, `list_relation_types` | pure calculation |
| `list_relations` | reads `~/.oracle3/relations.json` |
| `paper_order` | writes the local paper ledger (optional `request_id` for idempotent retry) |
| `paper_portfolio` | reads the paper ledger |
| `paper_reset` | erases the paper ledger, needs `confirm` |

## Summary table

| Skill | Does | Tools called | Capability | Guardrail text, and who enforces it |
|---|---|---|---|---|
| `pm-data-discovery` | Find markets, record data, save research samples | MCP `search_markets`, `get_market`, `get_orderbook`, `get_quote`; CLI `market`, `news`, `research`, `data record` | read | "Do not propose strategy logic in this skill." "Only discover, filter, sample and save data." Model-enforced, and nothing here can trade anyway. |
| `pm-constraint-arbitrage` | Test whether related contracts violate a probability bound after fees; paper-trade the legs | MCP `search_markets`, `get_market`, `get_quote`, `get_orderbook`, `check_constraint_live`, `check_constraint`, `trading_fee`, `paper_order`, `paper_portfolio` | paper | "Never place real orders from this skill; the MCP server cannot, and the CLI `live` mode is out of scope." The server half is **code-enforced** (no live tool exists); the CLI half is model-enforced. |
| `pm-quant-strategy-authoring` | Write a `QuantStrategy` class, validate, backtest | CLI `strategy create`, `strategy validate`, `backtest run`, `research auto-tune` | paper (backtest, no orders) | Look-ahead and reproducibility rules. Model-enforced. |
| `pm-agent-strategy-authoring` | Write an LLM-driven `AgentStrategy`, evaluate with paper runs | CLI `strategy create`, `strategy validate`, `paper run`, `trade status/state/pause/resume/swap` | paper | "Check `self.is_paused()` before every decision." `research auto-tune` on an agent strategy "raises an error", which is a code check in the engine per the skill text (not traced). Everything else model-enforced. |
| `pm-paper-trade-ops` | Run, monitor, pause and archive paper sessions | CLI `paper run`, `trade status/state/pause/resume/swap/stop` | paper | "Never use live credentials during paper trading." Model-enforced. |
| `pm-live-trade-ops` | Start and supervise a live engine run | CLI `live run --exchange polymarket` (wallet private key) or `--exchange kalshi` (API key id plus key path), `trade pause/resume/killswitch/stop` | **live** (CLI only) | "Never start live trading without explicit user approval." "Never skip paper trading and go straight to live." Four gates (validate, backtest, stable paper, user approval) are all prose. **Model-enforced.** The one code-enforced fact is that the MCP server has no live tools. |

## What is code-enforced and what is not

**Code-enforced (from the code layout and docs, not exhaustively traced):**

- The MCP server cannot place a real order. No tool in `mcp_server/server.py` talks to an order endpoint; the writers are the local paper ledger only.
- `paper_reset` needs a `confirm` argument.
- `paper_order` takes a `request_id` so a retry returns the original result instead of filling twice.
- `trade killswitch --on` and `trade pause` exist in the engine as a control plane. Whether a strategy honours them depends on the strategy: the agent-authoring skill asks authors to check `self.is_paused()` themselves.

**Model-enforced only:**

- Every "explicit user approval" and "paper first" rule in `pm-live-trade-ops`. `oracle3 live run` is a plain CLI command and the skill shows the wallet key passed as an argument (`--wallet-private-key "$POLYMARKET_PRIVATE_KEY"`), so the key appears in the process arguments for the life of the run. No confirmation prompt or spend cap is described in the skill.
- "Never use live credentials during paper trading."

Net: this is the safest shape in the directory for an agent that only has the MCP server connected. The danger starts when the same agent also has a shell and the live skill.

## Per-skill notes

- **pm-constraint-arbitrage** is the only skill that is purely about the MCP tools. It encodes five relations (implication, exclusivity, complement, same_event, event_sum), tells the agent to read resolution rules first, and states fee formulas (Kalshi taker `0.07*M*C*P*(1-P)`, Polymarket taker `rate*C*p*(1-p)` with a per-market rate, makers free). Its caveat that the check "assumes every leg fills at the quoted price" is a real limitation, not a guardrail.
- **pm-live-trade-ops** has a sensible emergency order (pause, assess, killswitch, stop) and asks for an auditable record of every live run. Nothing writes that record; it is an instruction.
- **pm-data-discovery** is not a trading skill and is summarized only. Its text is in the repo at the pinned commit.

## Full SKILL.md text (Apache-2.0)

The five trading skills are reproduced verbatim, unmodified, from https://github.com/YichengYang-Ethan/oracle3-prediction-market-agent at commit `267fb7c48dae7c4ff8922c02a3a223443e51bf0b`, licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0). Copyright is held by its authors. Dashes and other punctuation inside the blocks are the original's.

### `skills/pm-constraint-arbitrage/SKILL.md`

Verbatim from `skills/pm-constraint-arbitrage/SKILL.md` at the pinned commit.

~~~~markdown
---
name: pm-constraint-arbitrage
description: Check whether prices of related prediction-market contracts violate a probability bound after venue fees, using the oracle3 MCP server or Python API. Paper trading only.
---

# PM Constraint Arbitrage

Use this skill when the user asks whether related markets are mispriced relative to each other, for example "does P(A) exceed P(B) even though A implies B?", or whether a cross-venue price gap survives fees.

## Tools

MCP server (`pip install oracle3`, then run `oracle3-mcp`):

- `search_markets`, `get_quote`, `get_orderbook` to find markets and read executable prices.
- `check_constraint_live` to fetch quotes and fee schedules and evaluate a relation.
- `check_constraint` to evaluate a relation on quotes you supply.
- `trading_fee` to price a single fill under a venue's schedule.
- `paper_order`, `paper_portfolio` to paper-trade the legs.

Python API: `oracle3.arbitrage.check_constraint` and `oracle3.fees`.

## Relations

| Relation | Bound | Quotes, in order |
|---|---|---|
| implication | P(A) <= P(B) when A implies B | A, B |
| exclusivity | probabilities sum to at most 1 | every outcome |
| complement | P(A) + P(B) = 1 | A, B |
| same_event | P(A) = P(B), one event on two venues | A, B |
| event_sum | probabilities sum to exactly 1 | every outcome |

## Steps

1. Find the markets with `search_markets` and read both markets' resolution rules with `get_market`.
2. Decide which relation holds. This is a judgment about the contract wording, not something the tool can verify.
3. Run `check_constraint_live` with the relation and the markets in the order above.
4. Read `best.gross_edge_per_contract` (edge before fees), `best.fees_per_contract` and `best.net_edge_per_contract`.
5. Only if the net edge is positive and the book is deep enough, paper-trade each leg with `paper_order` at a limit no worse than the quoted ask.

## Hard rules

- Never place real orders from this skill; the MCP server cannot, and the CLI `live` mode is out of scope.
- State the relation you assumed and why; a wrong relation turns an "arbitrage" into a directional bet.
- Report fees per leg. Kalshi taker fees are 0.07·M·C·P·(1−P); Polymarket taker fees are rate·C·p·(1−p) with a per-market rate; Polymarket makers pay nothing.
- The check assumes every leg fills at the quoted price. Say so when the displayed size is smaller than the order.
~~~~

### `skills/pm-live-trade-ops/SKILL.md`

Verbatim from `skills/pm-live-trade-ops/SKILL.md` at the pinned commit.

~~~~markdown
---
name: pm-live-trade-ops
description: Run live trading only with explicit user authorization, under strict risk and emergency controls.
---

# PM Live Trade Ops

Use this skill only when the user explicitly asks for live trading and paper validation is complete.

## Gates

- `strategy validate` passes.
- The latest backtest or auto-tune results are acceptable.
- Recent paper runs behaved stably.
- The user has explicitly approved starting live trading.

## Start commands

1. Polymarket

- `oracle3 live run --exchange polymarket --wallet-private-key "$POLYMARKET_PRIVATE_KEY" --strategy-ref <strategy_ref> --strategy-kwargs-json '<json>' --json`

2. Kalshi

- `oracle3 live run --exchange kalshi --kalshi-api-key-id "$KALSHI_API_KEY_ID" --kalshi-private-key-path "$KALSHI_PRIVATE_KEY_PATH" --strategy-ref <strategy_ref> --strategy-kwargs-json '<json>' --json`

## Run control

- `oracle3 trade status --json`
- `oracle3 trade state --json`
- `oracle3 trade pause --json`
- `oracle3 trade resume --json`
- `oracle3 trade killswitch --on --json`
- `oracle3 trade stop --json`

## Emergency order

1. `pause` first.
2. Assess positions and open orders.
3. If needed, `killswitch --on`.
4. Finally, `stop`.

## Hard rules

- Never start live trading without explicit user approval.
- Never skip paper trading and go straight to live.
- Every live run keeps an auditable record: time, parameters, state snapshots and every intervention.
- The MCP server (`oracle3-mcp`) has no live-trading tools; live trading is only available through this CLI.
~~~~

### `skills/pm-paper-trade-ops/SKILL.md`

Verbatim from `skills/pm-paper-trade-ops/SKILL.md` at the pinned commit.

~~~~markdown
---
name: pm-paper-trade-ops
description: Run, monitor, intervene in and archive paper trading after a strategy has passed backtesting.
---

# PM Paper Trade Ops

Use this skill when the user asks to run paper trading or to check live behavior without real money.

## Preconditions

- The strategy passes `oracle3 strategy validate ... --json`.
- There is at least one interpretable backtest or auto-tune result.

## Steps

1. Start paper trading

- `oracle3 paper run --exchange <polymarket|kalshi|solana|rss> --strategy-ref <strategy_ref> --strategy-kwargs-json '<json>' --duration <seconds> --json`
- Add `--monitor` for the live terminal view.

2. Control the running engine

- `oracle3 trade status --json`
- `oracle3 trade state --json`
- `oracle3 trade pause --json`
- `oracle3 trade resume --json`
- `oracle3 trade swap --strategy-ref <strategy_ref> --strategy-kwargs-json '<json>' --json`
- `oracle3 trade stop --json`

3. Archive the results

- Save the key outputs to `data/research/<run_id>/paper/`.
- Include at least the configuration, a state snapshot and the end-of-run summary.

## Hard rules

- On any anomaly, `pause` first; `resume` or `stop` only after checking.
- Never use live credentials during paper trading.
- Every run must be replayable from its configuration (strategy ref, kwargs, duration, exchange).
~~~~

### `skills/pm-quant-strategy-authoring/SKILL.md`

Verbatim from `skills/pm-quant-strategy-authoring/SKILL.md` at the pinned commit.

~~~~markdown
---
name: pm-quant-strategy-authoring
description: Turn an agent's quantitative idea into Strategy code with tunable parameters and verifiable behavior.
---

# PM Quant Strategy Authoring

Use this skill when the user asks the agent to come up with a strategy and write the code.

## Goals

- A runnable strategy class (a `QuantStrategy` subclass).
- Exposed numeric parameters, so the strategy can be auto-tuned.
- `strategy validate` and `backtest run` both succeed.

## Code entry points

- Base class contract: `oracle3/strategy/quant_strategy.py` (`QuantStrategy`).
- For LLM-driven strategies use `AgentStrategy` instead (see `pm-agent-strategy-authoring`).
- Example strategies: `examples/strategies/*.py`, `strategies/*.py`.
- New strategies go in `strategies/`.

## Steps

1. Create the skeleton

- `oracle3 strategy create --output strategies/<name>.py --class-name <ClassName> --type quant`

2. Implement the strategy

- In `process_event`, handle only the event types you need (usually `PriceChangeEvent`).
- Put parameters in the constructor; numeric parameters are what tuning searches over.
- Call `trader.place_order(...)` to act.
- Record actions and signals with `self.record_decision(...)`.

3. Quick validation

- `oracle3 strategy validate --strategy-ref strategies/<name>.py:<ClassName> --strategy-kwargs-json '<json>' --dry-run --events 10 --json`

4. Single-market backtest

- `oracle3 backtest run --history-file <history.jsonl> --market-id <M> --event-id <E> --strategy-ref strategies/<name>.py:<ClassName> --strategy-kwargs-json '<json>' --json`

5. Prepare for tuning

- Every parameter has a clear meaning, bounds and a default.
- Parameter types stay JSON-serializable.
- Tune with `oracle3 research auto-tune --param-grid-json '<json>' ...`.

## Hard rules

- Do not hard-code strategy logic in a command-line script; it belongs in its own strategy file.
- Never use future information (no look-ahead).
- Keep runs reproducible: record the strategy file path, class name, kwargs and command.
~~~~

### `skills/pm-agent-strategy-authoring/SKILL.md`

Verbatim from `skills/pm-agent-strategy-authoring/SKILL.md` at the pinned commit.

~~~~markdown
---
name: pm-agent-strategy-authoring
description: Turn an LLM- or tool-driven idea into AgentStrategy code and evaluate it with paper trading.
---

# PM Agent Strategy Authoring

Use this skill when the user asks for a strategy that makes decisions with an LLM, MCP tools or external APIs.

## Goals

- A runnable strategy class (an `AgentStrategy` subclass).
- `strategy validate` and `paper run` both succeed.
- No parameter grid search: agent strategies cannot be auto-tuned.

## Code entry points

- Base class contract: `oracle3/strategy/agent_strategy.py` (`AgentStrategy`).
- LLM strategy reference: `oracle3/strategy/simple_strategy.py`.
- New strategies go in `strategies/`.

## Steps

1. Create the skeleton

- `oracle3 strategy create --output strategies/<name>.py --class-name <ClassName> --type agent`

2. Implement the strategy

- Call the LLM, MCP tools or external APIs inside `process_event`.
- Non-determinism is fine: results may differ between calls.
- Write the LLM output into the reasoning field with `self.record_decision(reasoning=...)` so it can be monitored.
- Call `trader.place_order(...)` to act.
- Guard every decision with `self.is_paused()` to respect the control plane.

3. Quick validation

- `oracle3 strategy validate --strategy-ref strategies/<name>.py:<ClassName> --dry-run --events 10 --json`

4. Evaluate with paper trading (the right way to evaluate agent strategies)

- `oracle3 paper run --strategy-ref strategies/<name>.py:<ClassName> --monitor`
- Watch decisions and positions with `oracle3 trade status --json`.
- Take a full snapshot with `oracle3 trade state --json`.

5. Intervene and adjust

- `oracle3 trade pause` / `oracle3 trade resume`
- Hot-swap the strategy with `oracle3 trade swap --strategy-ref strategies/<new>.py:<NewClass>`.

## Hard rules

- `AgentStrategy` subclasses cannot be used with `research auto-tune --param-grid-json`; it raises an error.
- External API calls need timeouts and error handling so they never block the event loop.
- Check `self.is_paused()` before every decision.
- Never use future information (no look-ahead).
- Keep runs reproducible: record the strategy file path, class name and command.
~~~~
