# TradeMemory Protocol (memory MCP plus an optional order brake in front of Alpaca)

| | |
|---|---|
| Repo | https://github.com/mnemox-ai/tradememory-protocol |
| Commit | `cb599bd3614560435670a7afaee44d1bb62ec507` (committed 2026-10-10) |
| License | MIT (`LICENSE`, Copyright 2026 Sean). `pyproject.toml` version 0.5.6. |
| Dependency license | The optional `proxy` extra installs `mnemox-control`, whose engine is AGPL-3.0-only (README: "a commercial license is available; TradeMemory itself stays MIT"). That package is **not in this repo** and was not read. |
| Date scraped | 2026-11-11 |
| Install (memory MCP) | `pip install tradememory-protocol`, or `claude mcp add tradememory -- uvx tradememory-protocol` |
| Install (brake) | `pip install "tradememory-protocol[proxy]"` (Python 3.12+), then `tradememory proxy init --account-id <alpaca account id> --symbols AAPL,MSFT`, `tradememory proxy doctor`, `tradememory proxy config` |
| Install (skills) | No installer. Skills are plain files under `.skills/`, `skills/` and `tradememory-plugin/skills/`; copy one into `~/.claude/skills/`. |

Method: shallow clone read as plain files. No script, installer, CLI, test or package install was run. The brake source files read in full or in the relevant parts: `src/tradememory/proxy/brake.py` (693 lines), `alpaca.py` (599), `policy.py` (133), `state.py` (406), `server.py` (185), `cli.py` (220), plus `docs/recipes/alpaca-brake.md`.

## Shape of the repo

TradeMemory is mainly a **memory and audit tool**: 20 MCP tools (`remember_trade`, `recall_memories`, `get_behavioral_analysis`, `check_trade_legitimacy`, `verify_audit_chain`, `validate_strategy`, five `evolution_*` research tools, and so on) over a local SQLite database. It does not place orders. The 20-tool server has no order tool. The brake is a separate, opt-in mode (`tradememory proxy run`) that wraps Alpaca's own MCP server.

Seven SKILL.md files exist. `.skills/tradememory` is the marketplace skill; `tradememory-plugin/skills/trading-memory` is a separate, shorter set of domain notes.

## Summary table

| Skill or component | Does | Tools called | Capability | Guardrail text, and who enforces it |
|---|---|---|---|---|
| `.skills/tradememory` | Marketplace skill: memory tools plus how to set up the brake | The 20 TradeMemory tools; names `proxy init/doctor/config/run/approve/halt` | read, local writes (journal). With the brake it fronts **paper or live** Alpaca | Describes the brake: "Anything the brake cannot evaluate is refused, not passed through." That claim is **code-enforced** in the proxy (below), but only if the agent is actually pointed at the proxy. |
| `skills/tradememory-bridge` | After a Binance spot trade, journal it and recall similar past trades | `remember_trade`, `recall_memories`, `get_strategy_performance`, `get_behavioral_analysis` | read, local writes. Does not place orders | Prompt-level only: recall before entering. Model-enforced. |
| `skills/binance-skills-hub/trade-memory` | Hash-chained decision journal alongside Binance skills | `remember_trade`, `recall_memories` (`order="losses_first"`), `export_audit_trail`, `verify_audit_chain` | read, local writes | Run `get_agent_state` before a session. Model-enforced. |
| `tradememory-plugin/skills/trading-memory` | Domain notes: memory types, recall scoring, behavioural analysis | Memory tools | read, local writes | None beyond advice. |
| `tradememory-plugin/skills/risk-management` | Affective state, sizing, drawdown, tilt checks | `get_agent_state`, `check_trade_legitimacy`, `create_trading_plan`, `check_active_plans` | advisory, no orders | "Behavioral guardrails" are advice the agent reads. Model-enforced. |
| `.skills/strategy-validator` | Overfitting tests (DSR, walk-forward, regime, CPCV) | `validate_strategy` | read | Research. Summarized only. |
| `tradememory-plugin/skills/evolution-engine` | LLM strategy discovery from OHLCV | `evolution_*` tools | read (reads public Binance data) | Research. Summarized only. The repo's own `LIMITATIONS.md` marks Evolution and the DQS gate "research-stage". |
| **Brake: `tradememory proxy run`** | A fastmcp proxy in front of Alpaca's MCP server that evaluates order tools before forwarding | Wraps every Alpaca tool; evaluates `place_stock_order` and `place_crypto_order` | **paper by default, live only with two flags** | **Code-enforced** routing plus a policy engine in `mnemox-control`. See the next section. |

## The brake: what is enforced, in which file

Entry point: `tradememory proxy run` (`proxy/cli.py`). It spawns Alpaca's official server (`uvx alpaca-mcp-server`) as a child process over stdio and builds a `FastMCP.as_proxy(...)` server with one middleware, `BrakeMiddleware` (`proxy/brake.py`). Every tool call from the agent passes through `BrakeMiddleware.on_call_tool`, which sorts the tool into a class with `alpaca.classify_tool` (`proxy/alpaca.py`).

### A. Enforced in TradeMemory's own code (MIT, read directly)

| Check | Where | Exact behavior |
|---|---|---|
| Tool classification, default deny | `alpaca.py` `classify_tool`, `brake.py` `on_call_tool` | `ORDER_TOOLS = {"place_stock_order", "place_crypto_order"}`, `EXIT_TOOLS = {"close_position", "close_all_positions"}`, `CANCEL_TOOLS = {"cancel_order_by_id", "cancel_all_orders"}`. Names starting `get_`, `search_`, `fetch_`, `list_` are read. Anything else not listed returns `"unknown"` and is refused with `PROXY_UNSUPPORTED_TOOL`. |
| Options and replace refused outright | `alpaca.py` `UNSUPPORTED_ORDER_TOOLS` | `place_option_order` ("options are not covered by policy v0"), `exercise_options_position`, `do_not_exercise_options_position`, `replace_order_by_id` ("replacing an order bypasses evaluation; cancel it and place a new order"), `create_locate`. |
| Fail closed | `brake.py` `_guard` | Any exception while building the evaluation is caught: `except Exception as exc:  # fail closed, whatever broke` and returns `_deny(... PROXY_FAIL_CLOSED ...)`. The order is never forwarded on error. |
| `client_order_id` mandatory | `brake.py` `_guard` | Empty id returns `PROXY_CLIENT_ORDER_ID_REQUIRED`. Reusing an id with different terms returns `PROXY_CLIENT_ORDER_ID_REUSED`. A repeat of the same terms returns the first result (`REPLAY`) and is not forwarded again. |
| Account binding | `brake.py` `_collect` | `if account_id != self.policy.account_id: raise AdapterError(...)`. The proxy refuses to evaluate if the broker account is not the one in the policy. |
| Live data or refuse | `brake.py` `_collect` | Reads `get_account_info`, `get_all_positions`, open orders, `get_clock` and per-symbol quotes from the broker before each order. Open-order list at the 500 page limit raises ("exposure cannot be trusted"). No quote means no order. |
| Serialised evaluation | `brake.py` `on_call_tool` | `async with self._lock:` around order and cancel handling, so two concurrent orders cannot both pass a limit only one fits under. |
| Record, then forward once | `brake.py` `_guard` | The ALLOW decision is written to the audit chain before `call_next`. A failed forward is recorded as `FORWARD_FAILED`, marked unknown in state, and reconciled with the broker (`get_order_by_client_id`) on retry before anything is re-placed. |
| Protective stop cannot be cancelled | `brake.py` `_cancel_guard`, `alpaca.py` `is_protective_leg` | While `policy.require_protective_stop` is true: `cancel_all_orders` is denied if any position is non-zero (`PROXY_PROTECTIVE_STOP_CANCEL_FORBIDDEN`), and `cancel_order_by_id` is denied if the order is a stop-type closing leg of an open position. Other cancels pass and are recorded. |
| Human approval is single-use and term-bound | `state.py` `approve`, `consume_approval`; `cli.py` `proxy approve` | An ESCALATE stores a `terms_fingerprint`. `tradememory proxy approve <intent_id> --terms <fingerprint>` records it; it expires after 15 minutes (`APPROVAL_TTL`), is popped on use, and is refused if the retried order's terms differ. |
| Halt state | `state.py`, `cli.py` `proxy halt` | `NORMAL`, `SOFT_HALT`, `REDUCE_ONLY`, `FULL_HALT` live in `~/.tradememory/proxy-state.json` under an OS file lock. A corrupt state file reads as `FULL_HALT`. The halt value is passed into the policy engine as `halt_state`. |
| Live needs two flags | `cli.py` `proxy_run` | `if live and not i_accept_live_trading: raise click.UsageError("--live needs --i-accept-live-trading")`. Default is `ALPACA_PAPER_TRADE=true`, set in `server.py` `child_environment`. |
| Key isolation | `server.py` `child_environment` | The child gets an allowlisted environment (PATH, HOME, proxies, UV variables) plus the env file's keys. The proxy's other secrets are not passed down. |
| Sealed policy | `policy.py` `load_policy` | A policy whose `content_hash` does not match its content is refused at startup. |

Exit tools are never blocked: `close_position` and `close_all_positions` go straight through and are recorded as `ALLOW_EXIT`. That is deliberate (a brake must not trap you in a position) and means an agent can always flatten.

### B. Enforced by `mnemox-control` (the AGPL engine), called from `brake.py`

`brake.py` builds an `OrderIntent`, an account snapshot, a market snapshot and an instrument catalog, then calls `mnemox_control.evaluator.evaluate(policy=..., intent=..., account=..., market=..., instruments=..., evaluated_at=now)`. The decision is `ALLOW`, `DENY` or `ESCALATE`. The numeric limits live in the policy file and are evaluated **inside that package, which is not in this repo and was not read.** What we can verify from this repo:

- the policy fields (`proxy/policy.py` `build_policy`, defaults in the `init` command): `allowed_symbols`, `max_order_notional` (1000), `max_position_notional` (5000), `max_daily_loss` (200), `max_drawdown` (1000), `approval_notional` (1000), `max_leverage` (1), `max_open_orders` (10), `require_protective_stop` (true), `max_stop_distance_bps` (500), `min_stop_distance_bps` (10), `allow_position_reversal` (false), `max_state_age_seconds` (120), `max_market_age_seconds` (60), `max_price_deviation_bps` (100), `allowed_weekly_windows`, `expires_at` (30 days);
- the rule codes our evidence shows being returned, from the repo's own tests (`tests/proxy/test_brake.py`): `SYMBOL_NOT_ALLOWED`, `ORDER_NOTIONAL_EXCEEDED`, `POSITION_NOTIONAL_EXCEEDED`, `PROTECTIVE_STOP_REQUIRED`, `DAILY_LOSS_LIMIT_REACHED`, `DRAWDOWN_LIMIT_REACHED`, `HUMAN_APPROVAL_REQUIRED`, `FULL_HALT_ACTIVE`, `MARKET_STATE_STALE`;
- the allowlist, notional caps, stop requirement, daily-loss halt and approval threshold are therefore **code-enforced, but in `mnemox-control`**, and we are relying on the repo's tests and docs, not our own reading of the evaluator, for their exact semantics. Treat the evaluator as unaudited by us.

How TradeMemory feeds those checks (this part we read):

- **Bracket stop**: `alpaca.py` `intent_from_call` only counts a stop as protective if `tool == "place_stock_order"`, `order_class` is `bracket` or `oto`, and `stop_loss_stop_price` is set. The comment says a stop field anywhere else "is decoration and must not satisfy require_protective_stop". Crypto orders therefore cannot carry a protective stop and will fail the stop rule while it is on (inferred from that code path).
- **Daily loss**: `alpaca.py` `account_snapshot` sets `realized_pnl_today=equity - last_equity`. The name says realized, but the value is the change in total account equity since the broker's previous close, so unrealized losses on open positions count. That is stricter than "realized", and it also means a deposit or withdrawal moves it.
- **Drawdown**: `state.py` `observe_equity` keeps a running peak in the state file and returns drawdown from it. The peak resets if the state file is deleted or the halt is reset.
- **Order types**: only market, limit and stop are evaluable. The recipe says stop-limit and trailing orders are refused.

## Bypass paths

What the brake does **not** cover. The first is the big one.

1. **The brake only exists if the agent talks to it.** It is an MCP proxy, not a gate at Alpaca. If the agent's MCP config still has the direct `alpaca` server (the recipe says to "replace the direct `alpaca` server" with the proxy entry), or any second path to the account, the brake is skipped entirely. The same Alpaca keys also work for Alpaca's REST API and CLI, so an agent with shell and network access can place orders with `curl` without touching MCP.
2. **The agent can read the keys.** Keys sit in the `--env-file` (the recipe example is `~/.secrets/alpaca-paper.env`). An agent with file read access can load them. Only the proxy's child process is isolated from the proxy's environment; the agent's own filesystem access is not restricted by anything here.
3. **Policy, state and approvals are plain local files.** `~/.tradememory/policy.json` is sealed with a content hash, which detects accidental edits but is not a signature: `tradememory proxy seal <path>` recomputes it for any content. `proxy-state.json` holds the halt and approvals, and `tradememory proxy approve` and `proxy halt NORMAL` are ordinary CLI commands with no authentication. An agent with shell access can edit the policy, re-seal it, reset the halt, and approve its own escalated order. The "human approval" step is a human-only gate only if the agent cannot run that CLI. We found no code that stops it (inferred from reading `cli.py` and `state.py`).
4. **Exits and most cancels are never evaluated.** `close_position`, `close_all_positions` pass through by design. A cancel that is not a protective stop passes. A flatten-and-reenter loop is limited only by the entry rules.
5. **`update_account_config` is classified as benign** ("cannot add market risk") and forwarded unevaluated. Alpaca's account config includes margin and shorting settings; whether any of them can raise exposure is a question about Alpaca, but the brake does not check it.
6. **Watchlist writes pass through** (harmless on their own).
7. **Evaluation depends on live reads.** The brake is only as good as `get_account_info`, quotes and `get_clock` from the upstream server. Stale or manipulated upstream data is caught only by the staleness limits in the policy.
8. **Scope is narrow.** Alpaca only, stocks and crypto, policy "v0". Options are refused rather than evaluated, which is safe but means an options agent gets nothing from it. No other broker is wired in.
9. **Memory tools are not a brake.** `check_trade_legitimacy` and `compute_dqs` are advisory tools the agent chooses to call. `LIMITATIONS.md` marks the DQS gate research-stage.
10. **Audit chain is tamper-evident, not tamper-proof.** It records every decision, including denials, and `verify_audit_chain` detects edits, but it does not prevent anything.

## AGPL note

The proxy extra pulls in `mnemox-control` under AGPL-3.0-only. Running it as your own tool is fine; embedding or modifying it in a service you offer over a network brings AGPL source obligations. TradeMemory's MIT license does not change that. A commercial license is offered by the vendor (README).

## Full SKILL.md text (MIT)

The five trading-related skills are reproduced verbatim, unmodified, from https://github.com/mnemox-ai/tradememory-protocol at commit `cb599bd3614560435670a7afaee44d1bb62ec507`, licensed under the MIT License (Copyright (c) 2026 Sean). Dashes and other punctuation inside the blocks are the original's. The two research skills (`strategy-validator`, `evolution-engine`) are summarized above and not reproduced.

### `.skills/tradememory/SKILL.md`

~~~~markdown
---
name: tradememory
slug: tradememory
version: 0.5.6
description: >-
  Memory and a brake for AI trading agents. 20 MCP tools: outcome-weighted
  recall, behavioral drift alerts, tamper-evident audit chain. Optional proxy
  that sits between your agent and your broker's MCP server (Alpaca today) and
  refuses orders outside a policy you own.
source: https://github.com/mnemox-ai/tradememory-protocol
repository: https://github.com/mnemox-ai/tradememory-protocol
homepage: https://github.com/mnemox-ai/tradememory-protocol
metadata:
  openclaw:
    emoji: "📊"
    category: "finance"
    requires:
      bins: ["python3", "pip"]
      env:
        ANTHROPIC_API_KEY: "Optional. Enables LLM reflections and the Evolution Engine; rule-based fallback without it."
        TRADEMEMORY_DB: "Optional. Path of the SQLite database, defaults to ~/.tradememory/tradememory.db"
    os: ["linux", "darwin", "win32"]
    homepage: https://github.com/mnemox-ai/tradememory-protocol
---

# TradeMemory Protocol

Two things for an agent that trades:

1. **Memory.** Record every trade with one call, recall past trades weighted by
   how they turned out, and get told when you are tilting: losing streaks,
   oversized positions after a loss, drawdown past your own line. Every
   record is SHA-256 chained and anchored daily to an RFC 3161 timestamp
   authority, so a changed record is detectable without trusting our clock.
2. **A brake (preview).** Run the proxy between your agent and your broker's
   MCP server. Orders are evaluated against your policy before they reach the
   broker; refusals, approvals and replays are all recorded. Alpaca is the
   first broker. See "Brake" below.

Local-first: SQLite on your machine, no telemetry, no hosted account needed.
MIT licensed, 1,500+ tests, CI on Python 3.10 to 3.12.

## Installation

```bash
pip install tradememory-protocol
# brake preview (Python 3.12+):
pip install "tradememory-protocol[proxy]"
```

Verify: `tradememory doctor`.

## Setup

### Claude Desktop

```json
{
  "mcpServers": {
    "tradememory": { "command": "uvx", "args": ["tradememory-protocol"] }
  }
}
```

### Claude Code

```bash
claude mcp add tradememory -- uvx tradememory-protocol
```

### OpenClaw

Use this skill; the server command is `uvx tradememory-protocol` (stdio).

## Brake: put it in front of Alpaca

```bash
tradememory proxy init --account-id <alpaca account id> --symbols AAPL,MSFT
tradememory proxy doctor --env-file ~/.secrets/alpaca-paper.env   # checks tool names and the account id
tradememory proxy config                                           # the MCP entry that replaces the direct Alpaca one
```

Then point the agent at `tradememory proxy run --policy ... --env-file ...`
instead of `uvx alpaca-mcp-server`. The agent sees all of Alpaca's tools plus
`recall_memories`, `get_behavioral_analysis`, `get_agent_state`, `brake_status`.

Refused by default: symbols outside your list, orders above your notional or
position limits, entries without a bracket stop, new orders after your daily
loss or drawdown limit, and everything after `tradememory proxy halt FULL_HALT`.
Never blocked: closing a position. Orders at or above `approval_notional`
wait for `tradememory proxy approve <intent_id>`; the agent retries with the
same `client_order_id` and the proxy forwards it exactly once. Anything the
brake cannot evaluate is refused, not passed through. Full walkthrough with
real outputs: `docs/recipes/alpaca-brake.md`.

## MCP tools (20)

| Group | Tools |
|---|---|
| Memory | `remember_trade`, `recall_memories`, `get_trade_reflection`, `get_strategy_performance` |
| State and behaviour | `get_agent_state`, `get_behavioral_analysis`, `check_trade_legitimacy`, `compute_dqs` |
| Plans | `create_trading_plan`, `check_active_plans` |
| Audit | `export_audit_trail`, `verify_audit_hash`, `verify_audit_chain`, `get_daily_root` |
| Validation | `validate_strategy` (deflated Sharpe, walk-forward, regime, CPCV) |
| Evolution (research-stage) | `evolution_fetch_market_data`, `evolution_discover_patterns`, `evolution_run_backtest`, `evolution_evolve_strategy`, `evolution_get_log` |

The Evolution Engine and the DQS gate are research-stage: see
`LIMITATIONS.md` for what has and has not survived validation before you trust
either for a trading decision.

## Things to say to your agent

> "Record my AAPL long at 195, earnings beat, high confidence."

> "Before I buy AAPL again: what happened last time in this condition?"

> "Am I on tilt? Check my state and my sizing after losses."

> "Verify the audit chain."

> "What does the brake refuse right now?" (`brake_status`, proxy only)

## Security and permissions

- **Network at runtime:** the MCP server runs on stdio with no outbound calls
  except the daily RFC 3161 timestamp request (configurable) and, if you set
  `ANTHROPIC_API_KEY`, reflection calls to the Anthropic API. The Evolution
  Engine fetches OHLCV from Binance's public API when you use it.
- **Broker keys:** the brake reads the env file you name and passes it only
  to the broker process it starts (`uvx alpaca-mcp-server`). It never writes
  keys to disk or to the database.
- **Files:** one SQLite database (`TRADEMEMORY_DB`), a policy file and a small
  state file under `~/.tradememory/`.
- **No implicit permissions:** no dependency auto-install, no system files,
  no elevation.

## Links

- GitHub: https://github.com/mnemox-ai/tradememory-protocol
- PyPI: https://pypi.org/project/tradememory-protocol/
- Brake recipe: https://github.com/mnemox-ai/tradememory-protocol/blob/master/docs/recipes/alpaca-brake.md
- Limitations: https://github.com/mnemox-ai/tradememory-protocol/blob/master/LIMITATIONS.md
- Help putting it in front of your broker: https://github.com/mnemox-ai/tradememory-protocol/issues/new?template=brake_integration.yml

## Related skills

| Skill | Path | Description |
|-------|------|-------------|
| Strategy Validator | `.skills/strategy-validator/SKILL.md` | Validate a backtest for overfitting with four statistical tests. Use when the user says "validate my strategy" or "is this overfitting?". |
~~~~

### `skills/tradememory-bridge/SKILL.md`

~~~~markdown
---
name: tradememory-bridge
description: |
  Bridge between Binance trading events and TradeMemory Protocol.
  Automatically journals trades, recalls similar past setups, detects behavioral biases,
  and provides outcome-weighted recall for AI trading agents.
  Use this skill after executing Binance spot trades to build persistent memory.
metadata:
  version: "1.0"
  author: mnemox-ai
license: MIT
---

# TradeMemory Bridge for Binance

Store Binance spot trades into persistent memory. Recall similar past trades before entering new positions. Detect behavioral biases (overtrading, revenge trading). Track strategy performance across sessions.

**Requires**: [TradeMemory Protocol](https://github.com/mnemox-ai/tradememory-protocol) MCP server running.

## Setup

Install and start the TradeMemory MCP server:

```bash
pip install tradememory-protocol
python -m tradememory
```

Or add to Claude Desktop / Claude Code MCP config:

```json
{
  "mcpServers": {
    "tradememory": {
      "command": "uvx",
      "args": ["tradememory-protocol"]
    }
  }
}
```

## Workflow

After executing a Binance spot trade using the Binance Spot skill:

1. **Store the trade** using `remember_trade` MCP tool
2. **Before next trade**, recall similar past trades using `recall_memories` MCP tool
3. **Check agent state** using `get_agent_state` to see if drawdown or confidence suggests pausing
4. **Review behaviors** using `get_behavioral_analysis` to detect biases

## MCP Tools Reference

### remember_trade

Store a completed trade into memory. Automatically updates all memory layers.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Trading pair (e.g. "BTCUSDT", "ETHUSDT") |
| direction | string | Yes | "long" or "short" |
| entry_price | number | Yes | Entry price |
| exit_price | number | Yes | Exit price |
| pnl | number | Yes | Profit/loss in account currency |
| strategy_name | string | Yes | Strategy name (e.g. "GridBreakout", "MeanReversion") |
| market_context | string | Yes | Natural language description of market conditions |
| pnl_r | number | No | P&L as R-multiple (risk units) |
| context_regime | string | No | Market regime: trending_up, trending_down, ranging, volatile |
| confidence | number | No | Confidence level 0-1 (default 0.5) |
| reflection | string | No | Lessons learned from this trade |

**Example — after a Binance spot BUY→SELL cycle:**

```
Call remember_trade with:
  symbol: "BTCUSDT"
  direction: "long"
  entry_price: 87500.00
  exit_price: 89200.00
  pnl: 170.00
  strategy_name: "BreakoutEntry"
  market_context: "BTC broke above 87000 resistance with volume spike. Funding rate positive. 4H RSI was 62."
  context_regime: "trending_up"
  confidence: 0.7
  reflection: "Entry timing was good. Could have held longer — exited at first pullback."
```

### recall_memories

Before entering a new trade, recall past trades in similar market conditions. Returns scored results ranked by outcome quality and context similarity.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Trading pair to filter by |
| market_context | string | Yes | Current market conditions (natural language) |
| context_regime | string | No | Current regime: trending_up, trending_down, ranging, volatile |
| strategy_name | string | No | Filter by strategy |
| limit | number | No | Max results (default 10) |

**Example — before entering a new BTC trade:**

```
Call recall_memories with:
  symbol: "BTCUSDT"
  market_context: "BTC consolidating near 90000 after rally. Volume declining. Funding rate turning negative."
  context_regime: "ranging"
  strategy_name: "BreakoutEntry"
  limit: 5
```

Returns past trades ranked by relevance to current conditions, with per-trade scores.

### get_agent_state

Check current trading state: confidence, risk appetite, drawdown, win/loss streaks.

**No parameters required.**

Returns a recommended action: `normal`, `reduce_size`, or `stop_trading` based on drawdown severity.

### get_behavioral_analysis

Detect trading biases from historical behavior patterns.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| strategy_name | string | No | Filter by strategy |
| symbol | string | No | Filter by symbol |

Detects: overtrading, revenge trading (re-entry after loss), disposition effect (cutting winners too early, holding losers too long), lot sizing inconsistency.

### get_strategy_performance

Get win rate, profit factor, and aggregate stats per strategy.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| strategy_name | string | No | Filter by strategy |
| symbol | string | No | Filter by symbol |

### create_trading_plan

Set conditional plans that trigger on specific market conditions.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| trigger_type | string | Yes | "market_condition", "drawdown", or "time_based" |
| trigger_condition | string | Yes | JSON describing when to trigger |
| planned_action | string | Yes | JSON describing what to do |
| reasoning | string | Yes | Why this plan was created |

**Example:**

```
Call create_trading_plan with:
  trigger_type: "market_condition"
  trigger_condition: '{"regime": "volatile", "symbol": "BTCUSDT"}'
  planned_action: '{"type": "reduce_size", "factor": 0.5}'
  reasoning: "Historical data shows BreakoutEntry underperforms in volatile BTC regimes"
```

### check_active_plans

Check if any active plans match current market conditions.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| context_regime | string | No | Current market regime |

## Agent Behavior

1. **After every Binance spot trade execution**, call `remember_trade` with full context. Include market conditions, not just price data.
2. **Before entering a new position**, call `recall_memories` to check what happened in similar past conditions.
3. **At session start**, call `get_agent_state` to check if drawdown or losing streaks suggest reducing size.
4. **Periodically**, call `get_behavioral_analysis` to detect emerging biases.
5. **Never skip journaling**. Memory quality depends on consistent recording.
6. **Use natural language** for `market_context`. The richer the description, the better the recall matching.

## Supported Exchanges

TradeMemory Protocol is exchange-agnostic. While this skill documents the Binance bridge workflow, the same MCP tools work with any trading data source — just pass the correct symbol format for your exchange.

## Notes

1. All timestamps are UTC (ISO 8601 format).
2. `pnl_r` (R-multiple) is optional but significantly improves recall quality.
3. The `context_regime` field enables regime-filtered recall — strongly recommended.
4. TradeMemory stores data locally (SQLite). Daily audit roots are timestamped by an RFC 3161 authority by default: a 32-byte hash, no trade data (`TRADEMEMORY_TSA=off` turns it off). The README's Security section lists the other outbound calls.
5. All 20 MCP tools are free and open source under the MIT license.
~~~~

### `skills/binance-skills-hub/trade-memory/SKILL.md`

~~~~markdown
---
title: TradeMemory — Decision Audit Trail
description: >-
  Decision audit trail for AI trading agents. Records every trading decision
  with full context (conditions, filters, indicators, risk state) in a SHA-256
  hash chain, so a later edit is detectable, and exports it as JSON or JSONL.
  Works alongside Binance Spot, Futures, and Web3 skills: they execute trades,
  TradeMemory records why.
metadata:
  version: 0.5.6
  author: mnemox-ai
license: MIT
---

# TradeMemory — Decision Audit Trail for AI Trading Agents

Binance skills execute trades. TradeMemory records **why**.

TradeMemory keeps the decision record. When your AI agent opens a position using the Spot or Futures skill, TradeMemory captures the full decision context: what conditions triggered the signal, which filters passed or blocked, the market indicators at that moment, risk state, and execution details. Every record is SHA-256 hashed for tamper detection.

**Why keep it.** So you, or anyone you report to, can see why each trade was taken and how it ended. Rules that require decision records (MiFID II Article 17) bind investment firms, not retail users; the EU AI Act's high-risk logging obligations were postponed to 2 December 2027, and ESMA's February 2026 briefing states that AI-based algorithmic trading is currently excluded from the high-risk scope. This is not a compliance claim.

## What TradeMemory Records

For every trading decision your agent makes:

| Field | Description |
|-------|-------------|
| `timestamp` | UTC decision time |
| `agent_id` | Which agent/EA made the decision |
| `model_version` | Software version at decision time |
| `decision_type` | ENTRY, EXIT, HOLD, SKIP |
| `strategy` | Strategy name (e.g. VolBreakout) |
| `conditions` | Entry conditions evaluated (passed/failed with thresholds) |
| `filters` | Risk filters checked (spread gate, regime gate, portfolio limits) |
| `indicators` | Market snapshot (ATR, EMA, spread, session range) |
| `execution` | Ticket, price, slippage, latency |
| `regime` | Market regime at decision time (trending/ranging/transitioning) |
| `risk_state` | Consecutive losses, cooldown status, daily P&L |
| `memory_context` | Past trades recalled via Outcome-Weighted Memory |
| `data_hash` | SHA-256 of all inputs for tamper detection |

## Real Decision Event

This is a real decision event from a XAUUSD trading system running three automated strategies. The AI agent detected a SHORT breakout signal but the `sell_allowed` filter blocked execution:

```json
{
  "ts": "2026-03-26 07:55:00",
  "strategy": "VolBreakout",
  "decision": "FILTERED",
  "signal_triggered": true,
  "signal_direction": "SHORT",
  "conditions_json": {
    "conditions": [
      {"name": "breakout_high", "passed": false, "current_value": 4462.58, "threshold": 4569.75, "operator": ">"},
      {"name": "breakout_low", "passed": true, "current_value": 4462.58, "threshold": 4463.11, "operator": "<"}
    ]
  },
  "filters_json": {
    "filters": [
      {"name": "spread_gate", "passed": true, "blocked": false, "current_value": 12.0, "threshold": 0.0},
      {"name": "sell_allowed", "passed": false, "blocked": true, "current_value": 0.0, "threshold": 0.0},
      {"name": "account_risk", "passed": true, "blocked": false, "current_value": 0.0, "threshold": 0.0},
      {"name": "regime_gate", "passed": true, "blocked": false, "current_value": 0.0, "threshold": 0.0}
    ]
  },
  "indicators_json": {
    "atr_d1": 171.16,
    "atr_m5": 8.53,
    "asia_high": 4544.08,
    "asia_low": 4488.78,
    "asia_range": 55.30
  },
  "regime": "TRENDING",
  "regime_ratio": 0.335,
  "consec_losses": 0,
  "cooldown_active": false,
  "risk_daily_pct": 0.0
}
```

A regulator or risk manager can read this and immediately understand: the agent saw a valid breakout, but policy blocked the SHORT direction. No guessing, no black box.

## How It Works with Binance Skills

```
Your AI Agent
    |
    |--- [1] Binance Spot Skill: execute BUY 0.01 XAUUSD
    |
    |--- [2] TradeMemory Skill: record WHY this trade was made
    |         - conditions that triggered the signal
    |         - filters that passed/blocked
    |         - market indicators at decision time
    |         - risk state and regime context
    |         - SHA-256 hash for tamper detection
    |
    |--- [3] Later: query /audit/verify/{trade_id} to prove the record hasn't been altered
```

## Installation

```bash
pip install tradememory-protocol
```

Start the server:

```bash
python -m tradememory
# Server running at http://localhost:8000
```

## API Endpoints

### Record a Decision

```bash
POST /trade/record_decision
Content-Type: application/json

{
  "trade_id": "VB_20260326_0755",
  "symbol": "XAUUSD",
  "direction": "short",
  "strategy": "VolBreakout",
  "confidence": 0.75,
  "reasoning": "SHORT breakout detected. Price 4462.58 < asia_low 4488.78 - buffer. Blocked by sell_allowed filter.",
  "market_context": {
    "price": 4462.58,
    "session": "london",
    "regime": {"regime": "TRENDING", "atr_h1": 26.66, "atr_d1": 171.16},
    "decision_data": {
      "indicators": {"atr_d1": 171.16, "atr_m5": 8.53, "spread_pts": 12}
    }
  }
}
```

### Audit: Get Decision Record

```bash
GET /audit/decision-record/{trade_id}
```

Returns a complete Trading Decision Record (TDR) with:
- Decision context (who, what, when, why)
- Memory context (similar past trades recalled)
- Market snapshot (indicators, regime, risk)
- SHA-256 data hash

### Audit: Verify Integrity

```bash
GET /audit/verify/{trade_id}
```

```json
{
  "trade_id": "VB_20260326_0755",
  "verified": true,
  "stored_hash": "a3f8c9...",
  "computed_hash": "a3f8c9...",
  "match": true
}
```

Recomputes SHA-256 from stored inputs and compares. If any field was tampered with after recording, `match` will be `false`.

### Audit: Bulk Export

```bash
GET /audit/export?strategy=VolBreakout&start=2026-03-01&end=2026-03-31&format=jsonl
```

Export all TDRs as JSON or JSONL for review.

## Security

- **The memory server never asks for exchange or broker keys.** It does not execute trades, move funds, or access wallets. (The optional brake that sits in front of a broker is a separate install; see the project README.)
- **Read and record only.** The agent calls TradeMemory after making a decision, passing the context. TradeMemory stores it.
- **Local-first.** Records stay in a local SQLite file. Daily audit roots are timestamped by an RFC 3161 authority by default: a 32-byte hash, no trade data (`TRADEMEMORY_TSA=off` turns it off). The evolution tools read public Binance market data when an agent calls them. The README's Security section lists every outbound call.
- **Tamper-evident, not tamper-proof.** Every record is hashed at creation and linked to the one before; changing a record breaks the chain. Verify it at any point with `/audit/verify`.
- **Scale:** 20 MCP tools, a REST API, and five memory layers (episodic, semantic, procedural, affective, prospective).

## Where the records map to regulation

The table shows which TradeMemory features map to these texts if and when they apply to you. It is not a compliance claim.

| Regulation | Requirement | TradeMemory Coverage |
|------------|-------------|---------------------|
| MiFID II Article 17 | Record every algorithmic trading decision factor | Full decision chain: conditions, filters, indicators, execution |
| EU AI Act Article 14 | Human oversight of high-risk AI systems | Explainable reasoning + memory context for every decision |
| EU AI Act Logging | Systematic logging of every AI action and decision path | Automatic per-decision TDR with structured JSON |
| ESMA 2026 Briefing | Algorithms must be distinguishable, testable, identifiable | agent_id + model_version + strategy per record |

## MCP Integration

TradeMemory also runs as an MCP server with 20 tools:

```json
{
  "mcpServers": {
    "tradememory": {
      "command": "uvx",
      "args": ["tradememory-protocol"]
    }
  }
}
```

Key MCP tools: `remember_trade`, `recall_memories` (with `order="losses_first"` before a trade), `get_strategy_performance`, `export_audit_trail`, `verify_audit_hash`, `verify_audit_chain`.

## Links

- **PyPI**: [tradememory-protocol](https://pypi.org/project/tradememory-protocol/)
- **GitHub**: [mnemox-ai/tradememory-protocol](https://github.com/mnemox-ai/tradememory-protocol) (MIT license)
- **Author**: [mnemox-ai](https://github.com/mnemox-ai)
~~~~

### `tradememory-plugin/skills/trading-memory/SKILL.md`

~~~~markdown
---
name: trading-memory
description: Domain knowledge for AI trading memory — Outcome-Weighted Memory (OWM) architecture, 5 memory types, recall scoring, and behavioral analysis. Use when recording trades, recalling similar contexts, analyzing performance, or checking behavioral drift. Triggers on "record trade", "remember trade", "recall", "similar trades", "performance", "behavioral", "disposition", "affective state", "confidence".
---

# Trading Memory

## Overview

TradeMemory implements a cognitive memory architecture for trading agents. Every trade is stored with full context (market conditions, strategy, reasoning, confidence) and recalled using Outcome-Weighted Memory (OWM) — a scoring system that surfaces winning trades in similar contexts first.

This is not a trade journal. It's a memory system that learns which past experiences are most relevant to current decisions.

## Architecture: 3-Layer Pipeline

```
L1: Raw Trades → L2: Pattern Discovery → L3: Strategy Adjustments
```

- **L1 (Episodic)**: Every trade stored as-is with full context. The ground truth.
- **L2 (Patterns)**: Behavioral patterns discovered from L1 data. Disposition effect, session biases, strategy correlations.
- **L3 (Adjustments)**: Concrete strategy adjustments derived from L2 patterns. Parameter changes, rule modifications, strategy retirement.

## Outcome-Weighted Memory (OWM) — 5 Memory Types

### 1. Episodic Memory
Raw trade events. Each record contains: symbol, direction, entry/exit, P&L, strategy, market context, reflection, timestamp.

**When to write**: After every completed trade.
**When to read**: When recalling past trades for decision-making.

### 2. Semantic Memory
Strategy knowledge base. Aggregated understanding of what works: "VolBreakout performs best in London session with ATR > $40" is semantic memory.

**When to write**: Automatically updated when trades are stored via `remember_trade`.
**When to read**: When evaluating whether a strategy fits current conditions.

### 3. Procedural Memory
Behavioral baselines. Tracks execution patterns: average hold times per strategy, lot sizing consistency, stop loss adherence, entry timing precision.

**When to write**: Automatically computed from trade history.
**When to read**: During behavioral analysis and daily reviews.

### 4. Affective Memory
Emotional/confidence state. Tracks: current confidence level (0-1), drawdown percentage, win/loss streaks, risk appetite, tilt indicators.

**When to write**: Updated after every trade and during daily reviews.
**When to read**: Before entering trades (am I on tilt?), during risk checks.

### 5. Prospective Memory
Active trading plans. Future-oriented: "If XAUUSD breaks above 5200 with ATR confirmation, go long." Plans have entry conditions, exit conditions, risk parameters, and expiry dates.

**When to write**: When creating trading plans.
**When to read**: When checking if current market conditions match any active plans.

## OWM Recall Scoring

When you query `recall_memories`, results are scored by:

| Factor | Weight | Description |
|--------|--------|-------------|
| P&L Outcome | 40% | Profitable trades score higher. Magnitude matters. |
| Context Similarity | 30% | How closely the recalled context matches the query context |
| Recency | 20% | Recent trades weighted more (exponential decay) |
| Confidence Calibration | 10% | Trades where confidence matched outcome score higher |

**Why outcome-weighted?** Traditional trade journals treat all trades equally. OWM amplifies signal from successful decisions in similar contexts. If you've profited 5 times trading London session breakouts, those memories surface strongly when you're evaluating the next London session breakout.

## MCP Tools Reference

### Core Memory (2 tools)

| Tool | Use Case |
|------|----------|
| `get_strategy_performance` | Aggregate stats: win rate, PF, P&L per strategy |
| `get_trade_reflection` | Deep-dive into a specific trade's reasoning |

### OWM Cognitive Memory (6 tools)

| Tool | Use Case |
|------|----------|
| `remember_trade` | Full OWM store: writes to all 5 memory layers |
| `recall_memories` | OWM recall: scored by outcome, similarity, recency, calibration |
| `get_behavioral_analysis` | Procedural memory: disposition ratio, hold times, Kelly criterion |
| `get_agent_state` | Affective state: confidence, drawdown, streaks, risk appetite |
| `create_trading_plan` | Prospective memory: entry/exit conditions, risk parameters |
| `check_active_plans` | Evaluate active plans against current market conditions |

## Best Practices

### When to Record
- **Always** record after a trade closes, not while it's open
- Include the full market context — session, volatility, trend state
- Write an honest reflection — why you entered, what you expected, what happened
- Set confidence before seeing the result (not after)

### When to Recall
- **Before entering a trade**: "Have I been in this situation before? What happened?"
- **During daily review**: "What patterns emerge from this week's trades?"
- **After a loss**: "Have I seen this failure mode before?"

### When NOT to Recall
- Don't recall mid-trade to justify holding a loser
- Don't recall to confirm a decision you've already made (confirmation bias)
- Don't over-query — if you're recalling 20 times a day, you're procrastinating, not trading

## Common Mistakes

| Mistake | Why It's Bad | Fix |
|---------|-------------|-----|
| Recording without context | Useless for recall — can't match future situations | Always include session, volatility, trend state |
| Setting confidence after seeing P&L | Destroys calibration scoring | Set confidence at entry, before outcome is known |
| Ignoring affective state | Trading on tilt leads to revenge trades | Check `get_agent_state` before every session |
| Never running daily reviews | Behavioral drift goes undetected | Run `/daily-review` at end of each trading day |
| Storing paper trades as real trades | Pollutes performance metrics | Tag paper trades separately or use a different database |

## Data Flow

```
Trade Closes
    ↓
remember_trade() → Episodic (raw event)
                  → Semantic (strategy knowledge update)
                  → Procedural (behavioral baseline update)
                  → Affective (confidence/streak update)
                  → Prospective (check active plans)
    ↓
recall_memories() ← OWM scoring
    ↓
Next Trading Decision
```
~~~~

### `tradememory-plugin/skills/risk-management/SKILL.md`

~~~~markdown
---
name: risk-management
description: Risk management domain knowledge for trading agents — affective state monitoring, position sizing, drawdown management, tilt detection, and behavioral guardrails. Use when checking risk before trades, managing drawdowns, detecting behavioral drift, or enforcing discipline. Triggers on "risk", "drawdown", "tilt", "position size", "lot size", "confidence", "revenge trading", "overtrading", "discipline".
---

# Risk Management

## Overview

Risk management in TradeMemory is behavioral, not just mathematical. Traditional risk management calculates position sizes and stop losses. TradeMemory adds a behavioral layer: it monitors your execution patterns, detects emotional drift, and flags when you're deviating from your own rules.

The system tracks two kinds of risk:
1. **Position risk** — How much capital is at stake on each trade
2. **Behavioral risk** — Are you making decisions rationally or emotionally

## Affective State Model

TradeMemory maintains a real-time emotional state model for the trading agent:

| Dimension | Range | What It Tracks |
|-----------|-------|----------------|
| Confidence | 0.0 - 1.0 | Self-assessed confidence, calibrated against outcomes |
| Drawdown | 0% - 100% | Current peak-to-trough equity drawdown |
| Win Streak | 0 - N | Consecutive winning trades |
| Loss Streak | 0 - N | Consecutive losing trades |
| Risk Appetite | low / normal / high | Derived from confidence + drawdown + streaks |

### How Affective State Updates
- **After a win**: Confidence += f(P&L magnitude), win streak ++, loss streak reset
- **After a loss**: Confidence -= f(P&L magnitude), loss streak ++, win streak reset
- **Drawdown crossing thresholds**: Risk appetite auto-reduces at 5%, 10%, 15% drawdown
- **Daily review**: Confidence recalibrated against actual hit rate

### Using Affective State

Check `get_agent_state` before every trading session:

```
get_agent_state() → {
  confidence: 0.42,
  drawdown: 8.3%,
  win_streak: 0,
  loss_streak: 3,
  risk_appetite: "low"
}
```

**Action rules:**
- `risk_appetite == "low"` → Reduce position size by 50% or skip marginal setups
- `loss_streak >= 3` → Stop trading for the session. Review, don't revenge trade.
- `confidence < 0.3` → Paper trade only until confidence recovers
- `drawdown > 15%` → Hard stop. No new positions until daily review.

## Behavioral Risk Indicators

### 1. Disposition Effect
**What**: Cutting winners short and holding losers too long.
**Detection**: `get_behavioral_analysis` → `disposition_ratio`
- Ratio < 1.0 = Good (holding winners longer than losers)
- Ratio > 1.5 = Problem (losers held 50% longer than winners)
- Ratio > 2.0 = Critical (classic retail trader failure mode)

### 2. Revenge Trading
**What**: Increasing position size or trade frequency after losses.
**Detection**: Compare lot sizes and trade count in the N trades after a losing streak vs baseline.
- Lot size > 1.5x baseline after loss = Revenge sizing
- Trade frequency > 2x baseline after loss = Overtrading

### 3. Overtrading
**What**: Taking more trades than the strategy generates signals for.
**Detection**: Compare actual trade count vs strategy signal count.
- If strategy generates 3 signals/week but you take 10 trades/week, you're inventing trades.

### 4. Session Drift
**What**: Trading outside designated sessions.
**Detection**: Check trade timestamps against strategy's defined trading windows.
- VolBreakout is a London session strategy. Trades at 3am UTC = session drift.

### 5. Confidence Miscalibration
**What**: Your confidence doesn't match your actual accuracy.
**Detection**: `get_behavioral_analysis` → confidence calibration curve.
- If trades rated confidence 0.8 win only 40% of the time, your confidence is miscalibrated.

## Position Sizing Rules

TradeMemory's procedural memory tracks position sizing patterns:

### Fixed Fractional
Default: Risk X% of equity per trade (typically 0.25-2%).

```
Position Size = (Equity × Risk%) / (Entry - StopLoss)
```

### Kelly Criterion
Optimal sizing based on historical edge:

```
Kelly% = WinRate - (LossRate / AvgWin÷AvgLoss)
```

- Full Kelly is too aggressive for real trading. Use Half Kelly or Quarter Kelly.
- `get_behavioral_analysis` returns Kelly criterion values per strategy.

### Lot Sizing Variance
Procedural memory tracks how consistent your sizing is:
- Low variance = Disciplined execution
- High variance = Emotional sizing (bigger when confident, smaller when scared)
- Target: coefficient of variation < 0.2

## Best Practices

### Before Every Session
1. Check `get_agent_state` — is confidence reasonable? Any active streaks?
2. Check drawdown — are you within acceptable limits?
3. Review active trading plans — don't enter trades outside your plans

### After Every Trade
1. Record the trade with `remember_trade` — include honest reflection
2. Did the trade match your strategy rules? If not, why?
3. Was position sizing consistent with your risk rules?

### After a Losing Streak (3+ consecutive losses)
1. **Stop trading.** Not permanently — just for the current session.
2. Run `/daily-review` — is there a systematic problem or just variance?
3. Check disposition ratio — are you holding losers too long?
4. Reduce position size for the next 5 trades (half the normal size)
5. Only resume full size after 2 consecutive wins at reduced size

### After a Winning Streak (5+ consecutive wins)
1. **Don't increase size.** Winning streaks end. Mean reversion is real.
2. Check if you're cherry-picking easy setups and avoiding harder (but higher EV) ones
3. Review: are the wins from your strategy or from a favorable market regime?

## Common Mistakes

| Mistake | Why It's Bad | Fix |
|---------|-------------|-----|
| No pre-session risk check | Walk into the market emotionally unprepared | Always run `get_agent_state` first |
| Ignoring drawdown thresholds | Small drawdowns become account-threatening drawdowns | Hard stop at 15% drawdown |
| Sizing up after wins | Gives back profits faster when the streak breaks | Keep sizing constant |
| Sizing down after losses | Reduces recovery speed when edge reasserts | Keep sizing constant (unless risk appetite is "low") |
| Skipping daily reviews | Behavioral drift goes undetected for days | Daily reviews are non-negotiable |
| Paper trading with different sizing | Paper P&L doesn't reflect real execution | Same sizing rules for paper and live |
~~~~
