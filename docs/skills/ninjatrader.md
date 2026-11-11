# NinjaTrader official agent skills (NT-NinjaTrader/mcp-skills): 13 skills for the Tradovate-hosted MCP

| | |
|---|---|
| Repo | https://github.com/NT-NinjaTrader/mcp-skills |
| Commit | `ae136cfb06a83cb1a3c1dcf53d376626238a89e2` (committed 2026-11-06), plugin version 0.3.1 |
| License | Apache-2.0 (`LICENSE`, full text; `plugin.json` also says Apache-2.0). The README says the license covers the repo contents only and grants no access to the MCP server or any account. |
| Date scraped | 2026-11-11 |
| Install (Claude Code) | `/plugin marketplace add NT-NinjaTrader/mcp-skills` then `/plugin install ninjatrader@mcp-skills` (bundles the MCP server entries) |
| Install (skills only) | `npx skills add NT-NinjaTrader/mcp-skills` (no MCP; register separately with `claude mcp add --transport http ninjatrader-demo https://mcp-demo.tradovateapi.com/mcp`, and `ninjatrader-live` at `https://mcp-live.tradovateapi.com/mcp`) |
| Other hosts | Codex `codex plugin marketplace add NT-NinjaTrader/mcp-skills`, `codex plugin add ninjatrader@mcp-skills`, `codex mcp login ninjatrader-demo`; Claude Desktop via Customize, Plugins, Add marketplace; Cursor listing awaiting review |
| MCP servers | Demo (simulation) `https://mcp-demo.tradovateapi.com/mcp`, Live (real money) `https://mcp-live.tradovateapi.com/mcp`, both OAuth, both declared in `mcp.json` and `.claude-plugin/plugin.json` |
| Runtime | Python 3.10+ for bundled analytics scripts; `matplotlib` (inline PEP 723 block, via `uv run`) for `chart-render` only |

Method: shallow clone read as plain files. No bundled script, installer or CLI was executed. The 13 `SKILL.md` files were all read; the four skills that sit on the order path were read in full, the other nine for purpose, tool list, non-goals and the places they write output. Scripts under `scripts/` were listed and their contracts read from the SKILL.md and `AGENTS.md`, not audited line by line.

## Structure and posture

13 skills, each with the same spine (Purpose, Environment routing, MCP tools used, Workflow, Disambiguation, Resource layout), bundled Python scripts for deterministic math (sizing, brackets, ATR, VWAP, correlation, excursion), fixtures, and references. The design statement in `AGENTS.md`: "A skill proposes an action. It never executes a trade or another account-changing action on its own." Contributors are told that a change adding autonomous execution will be declined. The README banner: "Start on Demo. The skills propose orders and never submit them, and you approve every payload."

Doc inconsistency worth knowing: `AGENTS.md` says "This beta bundles the Demo (simulation) server only", but `mcp.json` and the Claude plugin manifest declare both the Demo and the Live server, and the README's Codex section says "The plugin bundles both servers." Treat the plugin as carrying a live-money endpoint.

## Summary table

MCP tool names below are bare, as in the skills. Order-path tools named in the skills: `place_order`, `modify_order`, `close_position`, `create_alert`, plus the read-only gate `estimate_order`. `update_risk_settings` is named by two skills but called by none.

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `pretrade-risk` | Sizes a futures trade from risk percent, stop distance (ATR or explicit) and contract specs; proposes an OCO bracket; pending-quantity aware | MCP `my_portfolio`, `market_snapshot`, `risk_settings`, `estimate_order`, `describe`; local `size.py`, `bracket.py` | read; proposes orders, never submits | "Never executes orders." "The final feasibility gate is the `estimate_order` MCP tool", run "in every workflow outcome". "If `feasible: false`, report the reason to the user. Do not propose workarounds automatically." |
| `position-watchdog` | Live health of open positions: P&L in dollars and R, distance to stop, margin use, stop drift, correlated exposure, what-if math | MCP `my_portfolio`, `market_snapshot`, `order_history`, `risk_settings`; local `health.py`, `whatif_live.py`, `stop_drift.py` | read | "This skill reads only. It calls no tool that changes an account, an order, or an alert." |
| `scale-manager` | Scale in, scale out, partial exit, breakeven or trail stop, ladder entry; computes basis, before and after risk, builds payloads for approval | MCP `my_portfolio`, `order_details`, `market_snapshot`, `estimate_order`, `risk_settings`; named execution tools `modify_order`, `place_order`, `close_position`; local `scale_math.py`, `ladder.py` | proposes live writes; user submits | "Never call `modify_order`, `place_order`, or `close_position` from this skill." "Show the plan and the exact payloads, then wait for user approval." |
| `alerts-composer` | Turns alert intent into a validated Tradovate alert expression and submits it | MCP `search_contracts`, `my_portfolio`, `list_alerts`, `create_alert`, `market_snapshot`; local `validate.py` | account write (alert) after approval; no order | "Never call `create_alert` from this skill before the user approves that payload." Duplicate check required even for drafts. |
| `contract-intel` | Resolves "ES" to the front-month symbol, rollover status, micro and full siblings | MCP `market_snapshot`, `search_contracts`; local `resolve.py`, `rollover.py` | read | "Always quote the exact contract symbol, never invent." |
| `market-context` | Session VWAP, volume profile, ATR, realized volatility, cumulative delta, cross-symbol strength | MCP `market_history`, `market_snapshot`, `search_contracts`; local scripts | read | "Descriptive, not predictive." Never report false precision. |
| `correlation-hedge` | Correlation, regression beta, dollar-neutral hedge sizing | MCP `market_history`, `my_portfolio`, `market_snapshot`, `search_contracts`, `user_profile`; local `correlation.py`, `hedge_sizing.py` | read; proposes hedge sizes | regime caveat reference; no order tools |
| `event-watch` | Economic calendar filtered by positions, reaction-size history, reaction-window alert proposals | MCP `economic_calendar`, `earnings_calendar`, `market_history`, `my_portfolio`, `market_snapshot`; local `importance_filter.py`, `reaction_size.py` | read; hands alerts to `alerts-composer` | "Never add an event from memory." "Never invent numbers." Third-party calendar sites explicitly not allowed. |
| `risk-coach` | Advisory behavioral flags from recent fills: revenge trading, loss streaks, overtrading, size drift | MCP `fill_history`, `performance_summary`, `my_portfolio`, `risk_settings`, `user_profile`; local `detect.py` | read | "No blocking. Advisory only." "Never tell the user to stop." Hard limits are server side. |
| `trade-journal` | Descriptive analysis of closed trades: transaction cost analysis, streaks, hold times | MCP `fill_history`, `performance_summary`, `position_history`, `timeline_report`, `market_history`, `order_history`, `order_details`, `user_profile`, `describe`; local `slippage.py`, `streaks.py` | read | descriptive only |
| `trade-replay` | One closed trade: MFE, MAE, counterfactual exits | MCP `position_history`, `fill_history`, `market_history`, `search_contracts`; local `excursion.py`, `whatif.py` | read | reconstructed-stop caveat on R values |
| `trade-debrief` | Session review through 7 coaching prompt templates, with a computed report | MCP `timeline_report`, `performance_summary`, `fill_history`, `position_history`, `market_history`, `search_contracts`, `economic_calendar` (via event-watch), `user_profile`; local `compute_derived.py`, `assemble_report.py` | read | educational, cites report fields |
| `chart-render` | PNG candlestick, volume profile and equity curve charts | MCP `market_history`, `fill_history`; local `candles.py`, `profile_chart.py`, `equity_curve.py` via `uv run` | read; writes PNG files (default `/tmp/<session_id>_<name>.png`) | none needed |

## Guardrails: what is model-enforced and what is code-enforced

**Code-enforced (server side, per the skill text; not tested here):** `estimate_order` is the server's read-only pre-trade risk check. The server enforces hard limits such as daily loss auto-liquidation and maximum contracts, and rejects wrong-side stops. `AGENTS.md`: "The server enforces the hard limits, such as daily loss and maximum contracts." Demo and Live are separate servers with separate accounts, so a mixed-up environment fails rather than silently crossing. OAuth sign-in gates the MCP.

**Model-enforced (SKILL.md text only):**

- Every mutating tool call "sits after an explicit approval gate in its skill body" (`AGENTS.md`). The approval is a model behavior; there is no code token like a confirmation code. If a client auto-approves MCP tool calls, nothing in the skills stops `place_order` from being called by the agent, since the MCP exposes it regardless.
- "Environment routing": once an account is resolved on a server, stay on that server. Model-only.
- `estimate_order` before every proposal, "Never skip it". Model-only, though the server itself still applies the same check at order time.
- Alert expressions must be validated offline with `validate.py` and checked for duplicates; model-run script.
- `scale-manager` has no server-side dry run for `modify_order` ("`estimate_order` covers new orders only"), so the "stop must be on the safe side of the mark" check is the model's. Skill warns "Wrong-side stops trigger immediately on submission with no warning."
- Sign convention hazards the skills spell out: `place_order.brackets[]` takes signed deltas from entry while `modify_order.stopPrice` is absolute; sending absolute prices leaves the user filled "with no stop loss". `close_position` always closes the full position; a partial exit needs a market order plus resizing both bracket legs, or a stale same-size stop can flip the position.

Flags specific to this pack:

- **Live-money endpoint ships in the plugin** (see the inconsistency above). A model-only "propose, never submit" rule is the main barrier on the Live server beyond the account's own server-side risk settings.
- **Runs bundled Python.** The skills instruct the agent to run `python3 scripts/*.py` (and `uv run` for charts) on saved tool output, using `--file` paths. Scripts read JSON the agent saved from MCP results and print JSON; the `AGENTS.md` script contract forbids non-stdlib dependencies except an inline `matplotlib` block. Anyone installing the pack is trusting the repo to stay benign on each update; there is no pinning beyond the plugin version.
- **Local files:** the agent saves MCP results to temp files for the scripts; `chart-render` writes PNGs to `/tmp`. No credentials are handled by the skills; OAuth is done by the client against the MCP.
- **`risk-coach` and `alerts-composer` mention `update_risk_settings`** (the MCP tool that changes the server's daily loss limit and similar). `risk-coach` says the tool "is available" to the user; `alerts-composer` offers it as an option for a cross-account loss cap. Neither calls it, but the tool is reachable by the agent and would loosen the server-side cap that the whole safety model leans on.
- **`event-watch` data caveat:** the skill says the `economic_calendar` field names "come from an external, unversioned passthrough API". Output is only as reliable as that feed.
- **Script behavior check:** a grep of every `skills/*/scripts/*.py` found imports limited to the standard library plus `matplotlib` in the chart scripts; no `urllib`, `requests`, `socket`, `http.client`, `subprocess` or `os.system`. This is an import-level check, not a full audit. No telemetry in the repo.

## Skills with full text (Apache-2.0)

The four skills on the order or alert path are reproduced in full. The other nine are analytics, review and charting skills and are summarised above.


### pretrade-risk

Path: `skills/pretrade-risk/SKILL.md`. Scripts and `references/` are not embedded.

~~~~markdown
---
name: pretrade-risk
description: Sizes a proposed futures trade from risk-per-trade (% of netLiq), stop distance (ATR-based or explicit), and contract specs. Then proposes an OCO bracket (stop + target at R-multiple) for the chosen entry. Pending-qty-aware — it includes existing filled position and open Buy/Sell orders. Combined exposure then matches what the server's pre-trade risk check will evaluate. The estimate_order tool exposes that check. Flags exceeds_daily_loss_budget, exceeds_max_contracts, stop_too_wide_for_risk_budget. Use when the user asks to "size a trade", "how many contracts", "what's my risk on this trade", "buy ES", or "sell NQ", or similar bare-intent phrasings without a quantity. Also use when the user wants a bracket proposal. Never executes orders — produces proposals the user must approve. The final feasibility gate is the estimate_order MCP tool.
compatibility: This skill requires the NinjaTrader MCP server, connected through a client with MCP support.
---

# pretrade-risk

## Purpose

This skill turns "I want to buy ES" into a sized, bracketed, risk-budgeted proposal. It uses two scripts and one reference. It never emits order payloads. It always leaves the place/modify decision to the user.

## Environment routing

Demo (simulation) and live are two separate MCP servers. Account names are unique to one server. Once the workflow resolves an account on a server, keep every downstream call on that same server. The rule covers `my_portfolio`, `market_snapshot`, `place_order`, `create_alert`, the history tools, and any other tool. Cross-routing fails or hits the wrong environment.

## MCP tools used

Tool names below are bare. The NinjaTrader MCP server provides them. Your client adds its own prefix. See `AGENTS.md` at the repo root.

- `my_portfolio` — netLiq, existing position, and pending order qty.
  Prune with `fields=["account.netLiq","positions[].symbol","positions[].netPos","workingOrders[].symbol","workingOrders[].action","workingOrders[].quantity"]`.
- `market_snapshot` — last price, tickSize, valuePerPoint for the
  symbol. Prune with
  `fields=["snapshots[].symbol","snapshots[].lastPrice","snapshots[].tickSize","snapshots[].valuePerPoint","snapshots[].initialMargin"]`.
- `risk_settings` — daily loss limit and max contracts per order.
- `estimate_order` — the server's read-only pre-trade feasibility
  gate. Run it in every workflow outcome. Never skip it.
- `describe` — call with `topic='place_order_examples'` to confirm
  the bracket sign convention before submission.

## Workflow

### 1. Resolve the symbol (if needed)

If the user gave a bare product code ("ES"), resolve it with the `contract-intel` skill first. This skill expects a specific contract symbol (like `ESU6`) downstream.

### 2. Gather inputs

Call these MCP tools in parallel where possible:

- `my_portfolio` → `account.netLiq`, existing
  position's `netPos`, sum of pending Buy+Sell orders for the symbol.
  Prune with `fields=["account.netLiq","positions[].symbol","positions[].netPos","workingOrders[].symbol","workingOrders[].action","workingOrders[].quantity"]`.
- `market_snapshot(symbols=[sym])` →
  `lastPrice` (for entry), `tickSize`, `valuePerPoint`.
  Prune with `fields=["snapshots[].symbol","snapshots[].lastPrice","snapshots[].tickSize","snapshots[].valuePerPoint","snapshots[].initialMargin"]`.
- `risk_settings(account=...)` →
  `dailyLossAutoLiq` (absolute value). `risk_settings` has no
  per-order contract-count cap — source that limit from
  `estimate_order`'s pre-trade validation instead.

Also run `market-context`'s `atr.py` on recent bars of the symbol to get the ATR in points. Default is Daily bars, 14-period ATR.

### 3. Size the trade

```bash
python3 scripts/size.py \
    --netliq 100000 \
    --risk-pct 1.0 \
    --atr 6.0 \
    --value-per-point 50 \
    --daily-loss-budget 500 \
    --max-contracts 10 \
    --existing-net-pos 0 \
    --existing-pending-qty 0
```

Output fields used downstream:
- `proposed_qty` → pass to `bracket.py --qty`
- `stop_distance_points` → pass to `bracket.py --stop-distance-points`
- `flags[]` → narrate to the user. See `references/risk-rules.md`

**Always pass `--existing-pending-qty` when non-zero** so sizing matches the server-side pre-trade risk check that will evaluate the order. See `references/risk-rules.md` § pending-qty rule.

If `proposed_qty == 0` and flag is `stop_too_wide_for_risk_budget`: the contract is too large for the risk budget at this stop distance. Options are: use a micro (consult `contract-intel` for the fungible sibling), tighten the stop, or raise `--risk-pct` with explicit user intent. **A zero-qty answer does not skip step 5.** Run the feasibility gate on the alternative you propose. If you have no alternative, run the gate on a qty=1 probe of the requested contract. This way, the server's verdict backs the honest answer.

### 4. Propose a bracket

```bash
python3 scripts/bracket.py \
    --entry 7150 \
    --direction long \
    --stop-distance-points 9 \
    --r-multiple 2.0 \
    --tick-size 0.25 \
    --qty 4 \
    --value-per-point 50
```

`bracket.py` snaps prices to the tick grid. Output gives stop_price, target_price, and dollar-risk/payoff. A `payoff_risk_ratio < 1.5` is a yellow flag. You could tighten the target or widen the stop, for fewer but better trades.

**The user chooses the R-multiple.** The default in examples is 2.0 for illustration. Real invocations should use the target multiple the user actually wants. The skill does not recommend a specific R-multiple. It computes the bracket prices for whatever the user asks for.

#### 4a. Translating bracket.py output to `place_order` — SIGNED DELTAS, not absolute prices

`bracket.py` emits **absolute** `stop_price` and `target_price`. The `place_order` `brackets[]` field expects **signed deltas added to the entry working price** in contract-native points. Both legs compute `entryPrice + delta` server-side, with **no Buy/Sell sign-flip**. `describe(topic='place_order_examples')` confirms this.

**Convert before submitting:**

```
profit_target_offset = target_price - entry_price
stop_loss_offset     = stop_price   - entry_price
```

The signs follow the trade direction:

| Direction | `profitTarget` | `stopLoss` |
|---|---|---|
| **Long** (Buy entry) | **positive** (target above entry) | **negative** (stop below entry) |
| **Short** (Sell entry) | **negative** (target below entry — profit when short) | **positive** (stop above entry — loss when short) |

**Long example** — Buy LMT 7250, target 7458, stop 7074:

```
brackets: [{ "qty": 1, "profitTarget":  208, "stopLoss": -176 }]
```

**Short example** — Sell LMT 7250, target 7042, stop 7426:

```
brackets: [{ "qty": 1, "profitTarget": -208, "stopLoss":  176 }]
```

The `describe(topic='place_order_examples')` text says "positive profitTarget = better, negative stopLoss = worse". That framing is correct only for longs. For shorts the signs invert because "better" (target) is below entry and "worse" (stop) is above. Do not paraphrase "positive = better". Reason from the trade direction.

**Failure mode if you forget:** If you send absolute prices, both legs anchor at `entry + absolute`. An example is `profitTarget: 7458, stopLoss: 7074` on a long at 7250. The target then lands at ~14708, working but unreachable. The stop lands at ~14324, above entry on a long, so the server rejects it. The user ends up with a fill and **no stop loss**. Always convert.

The fill price can also differ from your limit. Better-side fills are common. The system applies the offsets to the actual fill, so the absolute bracket prices auto-anchor correctly without recomputation.

### 5. Final feasibility gate — never skip

Always end with `estimate_order`. The server's pre-trade risk check is the authoritative answer. It is read-only and never places an order, so there is no reason to omit it:

```
estimate_order(
    account=acct, symbol=sym, action=Buy|Sell,
    quantity=proposed_qty, orderType=Market
)
```

This step runs in **every** workflow outcome, and the answer must cite its verdict:

- **Sizing produced a qty** → gate that qty on the requested symbol.
- **Honest zero** (`proposed_qty == 0`) with a micro alternative →
  gate the alternative sizing (e.g. MES qty from the recomputed
  budget).
- **Honest zero, no alternative** → gate `quantity=1` of the requested
  contract anyway. The point is to surface the server's own block —
  e.g. a futures max-order-quantity of 0 or `MaxPosLimitReached` —
  instead of resting the answer on arithmetic alone.

If `feasible: false`, report the reason to the user. Do not propose workarounds automatically. The server said no.

**`MaxPosLimitReached` is dynamic, per-contract, and includes pending working orders.** Two distinct sources fire under the same name. Source (a) is the account's contract whitelist: it excludes the contract or the product. Source (b) is the per-product hypothetical post-fill position (`hypoLong` / `hypoShort` / `hypoExposed`). It exceeds the limit once the count includes in-flight working orders. The user might have recent in-flight churn, such as just-cancelled bracket legs or just-modified working orders. In that case, the hypothetical count can run temporarily high. After the working-order state settles, a single retry is legitimate. If the rejection persists, it is a real account-config gate. Defer to the user to adjust it through Account Settings. Never silently work around it.

### 6. Alert-proposal hook (optional)

Once the user approves the bracket, emit complementary alert expressions for the user to submit via `alerts-composer`. See `references/risk-rules.md`, section Alert-proposal hook, for templates. Typical examples are a breakeven-trip alert and a target-approach alert.

## Output idioms

Lead with the qty and dollar risk. Include the R:R ratio. Mention ATR for context. Example narration:

> "4 ES long at 7150 with a 12-point stop (~1.5×ATR of 8): $2,400 at
> risk, 360% of your daily $500 budget — the trade is too big for
> one day's loss budget. Options: drop to 1 contract (risk $600),
> tighten stop to 6 points (risk $1,200, still 240% of budget), or
> raise daily budget explicitly before proceeding."

Or when everything fits:

> "4 ES long at 7150, stop 7141, target 7168. $1,800 risk (1.8% of
> netLiq), $3,600 payoff at 2R target. estimate_order confirms
> feasible."

Or the honest zero — still grounded in the server's verdict:

> "Zero ES contracts: 1% of your $9,900 netLiq is a $99 risk budget,
> and a 10-point ES stop risks $500 per contract. estimate_order
> confirms the account can't take the trade (futures max order qty
> is 0). MES with the same stop risks $50 per contract — 1 contract
> fits the budget if you want the micro."

## Disambiguation

- vs `contract-intel`: contract-intel resolves "ES" → "ESU6". This
  skill sizes a trade on the resolved symbol. Always run contract-intel
  first when the user gave a bare code.
- vs `scale-manager`: pretrade-risk sizes the **initial entry**.
  Scaling in/out of an existing position (adding on a breakout, taking
  partial at target) is scale-manager's job.
- vs `position-watchdog`: pretrade-risk runs **before** the position
  is live. Once filled, position-watchdog monitors health.
- vs `risk-coach`: this skill computes the numbers (qty, stop, target).
  risk-coach judges whether the plan is behaviorally sound ("are you
  trading on tilt?", "is this your third trade this hour?"). This is
  a different, higher-level check.

## Explicit non-goals

- **Never executes orders.** Output is informational. The user makes
  the call. `place_order` is a separate step the user triggers.
- **Never overrides server risk limits.** If `estimate_order` rejects,
  the user has to change something. Raising hidden limits is not a
  fix.
- **Not a strategy.** Sizing + bracketing is one piece of a complete
  trade plan. Direction/entry-trigger/exit-timing are the user's.

## Resource layout

- `scripts/size.py` — position-sizing math, pending-qty-aware, with
  guardrail flags
- `scripts/bracket.py` — bracket proposal (stop + target) with
  tick-grid snapping and risk/payoff dollar math
- `references/risk-rules.md` — guardrail taxonomy, the pending-qty
  rule, default parameters, alert-proposal hook templates, and
  explicit non-goals. Load it when you narrate a guardrail flag or
  draft an alert-proposal hook.

~~~~

### position-watchdog

Path: `skills/position-watchdog/SKILL.md`. Scripts and `references/` are not embedded.

~~~~markdown
---
name: position-watchdog
description: Reports the live health of open futures positions. Output covers open P&L in dollars and R, and distance to stop (ticks, dollars, % of the daily loss budget). It also covers R-achieved to target, time in trade, and margin utilization. It also lists guardrail flags (no stop attached, a stop moved against entry, correlated index exposure). It also gives informational what-if math — move stop, extend target, go breakeven. It also detects stop drift from order history. A trailed stop means less risk. A widened stop means more risk. Use when the user asks "how am I doing", "what's my P&L", "how much am I up", "am I up or down", "position health", "my positions", "where's my stop", or "how close to stop". Also use when the user asks "am I in trouble", "daily loss", "margin usage", "am I safe", "what if I move my stop to X", "what if I extend target", "should I go breakeven", or "has my stop been moved". For closed-position analysis use trade-replay. For exact order payloads to execute, use scale-manager.
compatibility: This skill requires the NinjaTrader MCP server, connected through a client with MCP support.
---

# position-watchdog

## Purpose

Report the live health of the user's open futures positions. Cover how much room they have before the stop trips and how far the target is. Cover whether their plan drifted. Also report whether their exposure is a single concentrated bet across correlated index products. Never emit order payloads. That is `scale-manager`'s job.

## Safety gate

This skill reads only. It calls no tool that changes an account, an order, or an alert. It never calls `place_order`, `modify_order`, `close_position`, or `create_alert`. Every number and every proposal here is text for the user to read. The user approves any change, and a sibling skill composes it.

## Environment routing

Demo (simulation) and live are two separate MCP servers. Account names are unique to one server. Once a workflow resolves an account on a server, every downstream call must go through that same server. This includes `my_portfolio`, `market_snapshot`, `place_order`, `create_alert`, history tools, etc. Cross-routing fails or hits the wrong environment.

## MCP tools used

Tool names below are bare. The NinjaTrader MCP server provides them. Your client adds its own prefix. See `AGENTS.md` at the repo root.

- `my_portfolio` — current positions, open P&L, used margin. Prune with `fields=["account.netLiq","account.dailyLoss","account.openPnL","positions[]","workingOrders[]"]`.
- `market_snapshot` — last price, tickSize, valuePerPoint for every symbol with an open position. Prune with `fields=["snapshots[].symbol","snapshots[].lastPrice","snapshots[].tickSize","snapshots[].valuePerPoint","snapshots[].bidPrice","snapshots[].askPrice"]`.
- `order_history` — order events for a symbol, used by stop-drift detection. Reports only the current stop price, not prior versions.
- `risk_settings` — daily loss limit, max netLiq.

## Workflow

### 1. Pull the state

Call these tools in any order (or in parallel):

- `my_portfolio` — current positions, open P&L, used margin, and working orders (the source of bracket stop/target prices). Prune with `fields=["account.netLiq","account.dailyLoss","account.openPnL","positions[]","workingOrders[]"]` — this skips balance/subscription detail the dashboard does not read.
- `market_snapshot` — last price, tickSize, valuePerPoint for every symbol with an open position. Prune with `fields=["snapshots[].symbol","snapshots[].lastPrice","snapshots[].tickSize","snapshots[].valuePerPoint","snapshots[].bidPrice","snapshots[].askPrice"]`.
- `risk_settings` — daily loss limit, max netLiq

Save each response to a temp file. The scripts take file paths.

### 2. Compute the dashboard

```bash
python3 scripts/health.py \
    --portfolio portfolio.json \
    --snapshot snapshot.json \
    --risk-settings risk.json
```

Output has two parts:

- `positions[]` — per-position health (distance to stop, R-multiple, per-position flags)
- `account_flags[]` — account-wide flags (correlated exposure, high margin utilization)

See `references/guardrails.md` for the flag taxonomy and triage templates.

### 3. Live what-if (on ask)

When the user asks "what if I moved my stop to X?" or "what if I went breakeven?", feed one position's JSON to `whatif_live.py`. Save the relevant `positions[]` entry from `health.py`'s output to a file, and pass its path with `--file`. Never re-type or inline a large JSON payload into the command (stdin still works as a fallback):

```bash
# Move stop to 7148
python3 scripts/whatif_live.py --file position.json --new-stop 7148

# Go breakeven
python3 scripts/whatif_live.py --file position.json --breakeven

# Extend target to 7170
python3 scripts/whatif_live.py --file position.json --new-target 7170
```

The script reports the new risk dollars and the new R-multiple, relative to the *original* risk as the denominator. For breakeven, it also reports how much risk the move removes from the current stop position.

**This script is informational.** It never emits `modify_order` payloads. If the user decides they actually want to move the stop, hand off to `scale-manager`.

### 4. Stop-drift detection (on ask)

When the user asks "has my stop been moved?", or you want to check before you narrate, pull the symbol's order history and run:

```bash
python3 scripts/stop_drift.py \
    --orders order_history.json \
    --symbol ESU6 \
    --original-stop 7145 \
    --entry-price 7150 --direction long \
    --tick-size 0.25 --value-per-point 50 --net-pos 4
```

`order_history` reports only the current stop price, not its prior versions. Pass the stop price you know from bracket placement as `--original-stop`. Without it, the script reports the current stop only and skips the drift comparison.

Output classifies drift as `toward_entry` (trailing, less risk), `away_from_entry` (widening, more risk — a behavioral red flag), or `unchanged`. With `--value-per-point` and `--net-pos`, the output includes the exact dollar amount of risk added or removed.

### 5. Alert-proposal hook (on ask)

**This skill never calls `create_alert`.** Emit the alert expression as a string, then hand off to `alerts-composer`. That skill composes the alert, and the user approves the submission there.

When the user wants an alert on a current position, propose an expression that uses the position's own levels. Examples:

- Stop is 7148 → propose `lastPrice(ESU6) < 7148.75` (3 ticks before the stop — a heads-up before the trip)
- Position has no stop → propose `posOpenPLUsd(ESU6) < -300` (a hard PnL floor)

**Subjects must stay unquoted.** The DSL parser rejects `lastPrice("ESU6")`. The subject regex `[\$@]?[\w\s\-\+/|]+` excludes double-quotes: the server's rule parser accepts only unquoted subject strings. Submission via `create_alert` fails with `errorText`, not silently. `alerts-composer/scripts/validate.py` catches it offline, so always run the proposed expression through `validate.py` before you hand it off.

Emit the expression as a string. Never call `create_alert` from this skill.

## Output idioms

Use `references/guardrails.md` narrative templates. Lead with dollars, then follow with R-multiples and ticks. A typical "how am I doing?" reply:

> "Long 4 ES at 7150, mark 7158 (+$1,650, +4.1R). Stop 7148 is 41 ticks
> below — $2,050 at risk, 410% of daily budget — consider trimming or
> tightening if the trade isn't moving.  
> Also long 1 NQ at 18250 without a stop attached ⚠ — the market can
> gap through any price. Want a stop?  
> Account-level: ES + NQ long is one index-beta bet; combined 1% ES
> move ≈ $2,240 swing."

## Disambiguation

- vs `risk-coach`: watchdog reports **live numbers**; coach judges **plan quality** ("are you tilting?", "is this idea well-shaped?"). These are different scopes.
- vs `scale-manager`: watchdog's what-if is **informational** ("risk becomes Y"); scale-manager converts intent into exact `modify_order`/`place_order` payloads.
- vs `trade-replay`: watchdog covers **live open positions**; replay covers **closed positions** with bar-level MFE/MAE.
- vs `pretrade-risk`: pretrade-risk sizes a new entry; watchdog runs *after* the position is live.

## Not computed: live MFE/MAE

This skill does not report MFE or MAE for a live position. It also does not compare either one against a historical median. Excursion math needs a `market_history` bar window per position, which costs one extra tool call per symbol. The dashboard stays fast instead. `trade-replay` covers the same excursion math for closed trades. A future enhancement adds `health.py --market-history PATH` per position, for users who explicitly want live excursion data. Until then, `open_pl_dollars` is the available live P&L signal.

## Resource layout

- `scripts/health.py` — distance/R/margin/flags dashboard (portfolio, snapshot, and risk-settings inputs required; fast, no market_history)
- `scripts/whatif_live.py` — informational alternate-exit math for one position (input: position dict; arg: one of --new-stop/--new-target/--breakeven)
- `scripts/stop_drift.py` — diffs the current bracket stop against a caller-known original, from order history
- `references/guardrails.md` — flag taxonomy with triage templates — load when you narrate flags or explain what a flag means

~~~~

### scale-manager

Path: `skills/scale-manager/SKILL.md`. Scripts and `references/` are not embedded.

~~~~markdown
---
name: scale-manager
description: Scales into or out of an existing futures position. Actions include add to winner (pyramid), take partial at 1R, and move stop to breakeven. Actions also include trail stop, close on reversal, and ladder an entry across a price band. Computes weighted cost basis, before/after dollar risk, R-multiples, and P&L impact. Proposes the exact modify_order / place_order / close_position payloads for the user to approve. Never executes. Use when the user asks to "scale out", "scale in", "take partial", "add to winner", "pyramid", "trim", "add more", "move stop to breakeven", "trail stop", "ladder entry", "split the order", or "close half". For INITIAL entry sizing use pretrade-risk; for live-position monitoring use position-watchdog.
compatibility: This skill requires the NinjaTrader MCP server, connected through a client with MCP support.
---

# scale-manager

## Purpose

Turn "take partial off here" / "add on this break" / "trail the stop" into correct math and approved order payloads. This skill is a sibling to `pretrade-risk` (which handles the initial entry) and `position-watchdog` (which monitors a live position). This skill owns all in-flight position adjustments.

## Environment routing

Demo (simulation) and live are two separate MCP servers. Account names are unique to one server. Once a workflow resolves an account on a server, every downstream call must go through that same server. This includes `my_portfolio`, `market_snapshot`, `place_order`, `create_alert`, history tools, etc. Cross-routing fails or hits the wrong environment.

## MCP tools used

Tool names below are bare. The NinjaTrader MCP server provides them. Your client adds its own prefix. See `AGENTS.md` at the repo root.

- `my_portfolio` — current `netPos`, `netPrice`, and working orders (the source of bracket stop/target prices). Prune with `fields=["positions[].symbol","positions[].netPos","positions[].netPrice","workingOrders[]"]`.
- `order_details` — event/fill history for one known `orderId`.
- `market_snapshot` — `lastPrice`, `tickSize`, `valuePerPoint`. Prune with `fields=["snapshots[].symbol","snapshots[].lastPrice","snapshots[].tickSize","snapshots[].valuePerPoint"]`.
- `estimate_order` — final feasibility gate for scale-ins (the server's pre-trade risk check)
- `risk_settings` — daily-loss budget, for the cross-check in Step 4
- Final execution paths (user approves): `modify_order`, `place_order`, `close_position`

## Skills consumed

- `market-context` — ATR for band spacing, regime for pyramid-eligibility
- `pretrade-risk` — pending-qty rule for scale-ins (included-in-estimate)

## Workflow

### 1. Classify the intent

| User phrasing | Action |
|---------------|--------|
| "take partial", "trim 50%", "half off" | `scale_math.py --action partial_exit --pct 0.5` |
| "scale out", "close 2 of 4" | `scale_math.py --action scale_out` |
| "add to winner", "pyramid", "add more" | `scale_math.py --action scale_in` |
| "move stop to breakeven" | modify_order on bracket stop leg |
| "trail stop to X" | modify_order on bracket stop leg |
| "ladder into 3 at 7148–7142" | `ladder.py --mode even` |

The full pattern library, with preconditions and narrations, lives in `references/scale-patterns.md`.

### 2. Gather current state

```
my_portfolio           # netPos, netPrice, workingOrders[] (bracket stop/target prices)
market_snapshot(...)   # lastPrice, tickSize, valuePerPoint
```

If `netPos == 0` and the action is scale_in/out, defer to `pretrade-risk`. This is an initial entry, not a scale.

### 3. Compute the scale math

Save the script's JSON input to a file and pass its path with `--file`. Never re-type or inline a large JSON payload into the command.

**For scale-in / scale-out / partial-exit:**

```bash
python3 scripts/scale_math.py --file position_state.json --action <scale_in|scale_out|partial_exit>
```

The caller maps input fields from the MCP response's camelCase into the script's own JSON contract. Fields: `direction`, `current_qty`, `current_basis`, `stop_price`, `current_mark` (from `lastPrice`), `value_per_point` (from `valuePerPoint`), `tick_size` (from `tickSize`), plus `action_qty` and `action_price` (or `--pct` for partial_exit).

Output fields:
- `basis_after` — new weighted cost basis (scale_in only; scale_out leaves the basis unchanged on the remainder)
- `dollar_risk_before_action` / `dollar_risk_after_action` — critical for scale-in. A scale-in typically RAISES dollar risk, because the combined qty × (new_basis − stop) exceeds the original risk.
- `R_before` / `R_after` at the current mark
- `realized_dollars` — money booked on a scale_out (0 for scale_in)

**For ladder entry:**

```bash
python3 scripts/ladder.py --file anchor_state.json --mode <even|atr|custom> --legs N ...
```

Returns per-leg price + qty + weight, combined weighted basis, and best/worst-case fill scenarios.

### 4. Surface the dollar and R impact to the user

Three must-haves in the narration:
1. **Dollar realized** (for exits) or **dollar risk change** (for adds).
2. **R before vs after** — did the trade get easier or harder to manage?
3. **Compliance with the daily-loss budget** (cross-check against `risk_settings.dailyLossAutoLiq` for scale-ins that expand risk).

### 5. Build the MCP payload (for user approval)

**Never call `modify_order`, `place_order`, or `close_position` from this skill.** This step writes payload text only. Show the plan and the exact payloads, then wait for user approval. The user submits every call in this step. So every block below describes the user's approved sequence, not an action this skill takes.

See `references/scale-patterns.md` § "Converting output to MCP payloads".

**Scale out — `close_position` always closes the full position.** It takes no `quantity` parameter. A partial exit needs a separate market order for the offset quantity. It also needs a resize of BOTH remaining bracket legs to match — never the target leg alone. The server does not link the exit order and the two bracket legs together. A stop that keeps the ORIGINAL quantity over-protects the smaller remaining position. Worse, a same-quantity stop can flip the trade to the opposite side if it fills. Example: close 2 of a long 4, and leave a same-quantity Sell Stop for 4. If that stop triggers, the trader now holds a short 2, not a flat position. A same-quantity target carries the mirror risk — a full fill flips the position too.

```
place_order(action=<opposing side>, orderType=Market, quantity=<off_qty>, symbol=<sym>, timeInForce=<Day|GTC|IOC|FOK|GTD>)
```

The user waits for the exit fill to confirm. The user then pulls `my_portfolio` again, and checks the new `netPos` against `remaining_qty`. The plan needs both leg IDs from `workingOrders[]` (see the "Stop move" step below for the filter). When the server sets `bracket.parentId` or `bracket.ocoId`, use it to confirm the pair.

```
modify_order(orderId=<bracket_stop_leg_id>, quantity=<remaining_qty>)
modify_order(orderId=<bracket_target_leg_id>, quantity=<remaining_qty>)
```

`remaining_qty` is the current `quantity` on either leg minus `off_qty`.

**If a resize call fails, the position now carries a mis-sized leg.** The caller can also skip the resize. In either case, do not treat the scale as done. Tell the user which leg still carries the ORIGINAL quantity. Propose the resize again first, before any other change to the position.

**Scale in — the `place_order` payload for the add:**

```
place_order(
  action=<Buy|Sell>,                       # same side as current direction
  orderType=<Market|Limit>,
  quantity=<add_qty>,
  price=<add_price>,                       # for Limit
  symbol=<sym>,
  timeInForce=<Day|GTC|IOC|FOK|GTD>,
)
```

For limit scale-ins, consider the pending-qty rule. The server-side `pre-trade risk check` includes all open, filled, and pending qty when it rates the order. If you chain multiple scale-ins as limits, the SECOND order's feasibility check includes the FIRST's pending qty. See `pretrade-risk/references/risk-rules.md` for details.

**Stop move (breakeven / trail):**

```
modify_order(orderId=<bracket_stop_leg_id>, stopPrice=<new>)
```

Find the stop leg id in `my_portfolio`'s `workingOrders[]` — filter by `symbol`, an opposing `action`, and `orderType: Stop|StopLimit`. Find the target leg the same way, with `orderType: Limit` and `price` set instead of `stopPrice`. When `bracket.parentId` or `bracket.ocoId` is present, use it to confirm the two legs share one entry. The scale-out resize above needs both leg IDs — reuse this same filter for that step.

**`modify_order.stopPrice` is an absolute price**, in contract-native units — the same convention as `scale_math.py`'s output. This is **asymmetric** with `place_order.brackets[].stopLoss`, which is a signed delta from entry (see `pretrade-risk/SKILL.md` §4a). Pass the new absolute stop price straight through. Do **not** convert it to an offset.

**No server-side pre-flight exists for `modify_order`** — `estimate_order` covers new orders only; it takes no `orderId` parameter. So validate the proposed stop yourself, before you show the payload:

- **Long position:** the new stop must sit below the current mark. It must also stay on the safe side of any breakeven cross. A breakeven move that lands at or just past entry is fine. A trail that crosses through the current mark flattens the market position.
- **Short position:** mirror this — the new stop must sit above the current mark.

Wrong-side stops trigger immediately on submission with no warning.

**Ladder entry — one order per leg:**

After approval, the user runs one pre-flight and one order per leg:

```
for leg in legs:
  # Pre-flight each leg — the server's pre-trade risk check counts
  # already-pending working orders from prior legs in this loop.
  estimate_order(
    account=acct, symbol=sym, action=..., quantity=leg.qty,
    orderType=Limit, price=leg.price
  )
  place_order(
    action=..., orderType=Limit, quantity=leg.qty, price=leg.price,
    timeInForce=<Day|GTC|IOC|FOK|GTD>,
  )
```

Each placed leg becomes pending qty for the next leg's pre-trade check. See `pretrade-risk/references/risk-rules.md` § pending-qty rule. **A scale-in with its own bracket follows the offset rule from `pretrade-risk/SKILL.md` §4a** — `place_order.brackets[].profitTarget` and `.stopLoss` carry a sign. They are deltas, not absolute prices.

### 6. Final feasibility check

For any scale-in that expands qty (a single add **or each ladder leg**), end with `estimate_order` on the proposed payload. It surfaces the authoritative pre-trade risk check result. If `feasible: false`, report the reason and do not submit.

**`estimate_order` does NOT cover `modify_order`.** The LLM must sanity-check stop-move proposals against the side-of-current-mark rule in Step 5's "Stop move" subsection. There is no server-side dry-run for modifies.

### 7. Emit the plan and payloads; wait for user approval

This restates the gate at the top of Step 5. Never call `modify_order`, `place_order`, or `close_position` from this skill. Always show the plan and the exact payloads, then stop. The user submits the approved calls.

## Output idioms

**Classic partial at 1R:**

> "Long 4 ES @ 7150, mark 7168 (2R). Propose: close 2 at market —
> realizes \$1,800, leaves 2 at the same stop price 7141 (\$900 at risk).
> After the fill confirms, resize BOTH remaining legs to quantity 2:
> `place_order(action=\"Sell\", orderType=\"Market\", quantity=2, symbol=\"ESU6\")`,
> then `modify_order(orderId=<stop_leg>, quantity=2)` and
> `modify_order(orderId=<target_leg>, quantity=2)`. Approve?"

**Pyramid with risk flag:**

> "Add 2 ES @ 7168 → new basis 7156, dollar risk at stop 7141 jumps
> from \$1,800 to \$4,500 (2.5× current). Options:
> (a) Approve as-is (accepts higher risk).
> (b) Tighten stop to 7155 simultaneously → risk stays \$300.
> (c) Treat as a separate trade with its own tighter stop.
> `estimate_order` says feasible with margin headroom."

**Ladder entry:**

> "3-leg ladder 7148 / 7145 / 7142 (6pt band, ≈0.75×ATR). Qty 1/1/1.
> If only the top leg fills, basis \$7148 (1 contract, lightly
> sized). If all fill, avg basis \$7145 across 3 contracts. Combined
> risk at stop 7140 = \$450 (anchor only) to \$750 (all fill).
> Payloads: 3× `place_order(orderType=Limit, quantity=1, price=...)`."

## Design constraints

- **Never executes.** Produces plans and payloads. Even after the user approves, the user triggers the MCP call, not the skill.
- **Dollar-risk-aware.** Scale-ins typically grow dollar risk. Always surface the before/after delta so the user decides eyes-open.
- **Tick-snapped.** `ladder.py` snaps leg prices to the symbol's tick grid. `place_order` rejects bad prices anyway, but the snap keeps the output clean.
- **Server-authoritative.** `estimate_order` is the last gate on scale-ins. If it says no, the skill reports that and stops.

## Disambiguation

- **vs `pretrade-risk`**: pretrade handles the initial entry (netPos = 0). scale-manager handles netPos ≠ 0 adjustments. Always check `netPos` first and route accordingly.
- **vs `position-watchdog`**: watchdog reports health (P&L, R, distance to stop, flags) informationally. scale-manager produces executable plans. Watchdog can PROPOSE a scale via its alert hook; scale-manager validates and composes the payload.
- **vs `close_position` MCP directly**: `close_position` always closes the full position — it takes no `quantity` parameter. For a literal "close half the ES position", route through this skill's partial-exit pattern (Step 5) instead. Use `close_position` directly only when the user wants the whole position flat.

## Explicit non-goals

- **No execution.** The MCP order tools stay in the user's approval loop.
- **No indicator-driven triggers.** This skill proposes a scale when the user asks. It does not watch the market and auto-propose. (Alert-based monitoring is `alerts-composer` + `position-watchdog`.)
- **No cross-account rebalancing.** Scales apply to ONE symbol on ONE account.
- **No pyramid recursion.** The math supports nested scale-ins, but the narrations cover only one add at a time. Ask the user explicitly before you compound them.

## Resource layout

- `scripts/scale_math.py` — scale-in / scale-out / partial-exit math. Stdin JSON for position state and action params. Actions: `--action scale_in|scale_out|partial_exit`.
- `scripts/ladder.py` — ladder entry splits. Modes: `even`, `atr`, `custom`. Weighting: `equal`, `front`, `back`, `custom`. Integer-quantity allocation uses the largest-remainder method, so the total exactly matches the input `total_qty`.
- `references/scale-patterns.md` — 7 named patterns: partial at 1R, runner, pyramid, and ladder mean-reversion. It also covers ladder breakout retest, pre-event scale-out, and full exit on reversal. The file also has preconditions, narrations, and the MCP-payload translation table. Load it when you pick a pattern or build the MCP payload.

~~~~

### alerts-composer

Path: `skills/alerts-composer/SKILL.md`. Scripts and `references/` are not embedded.

~~~~markdown
---
name: alerts-composer
description: Translates natural-language alert intent into a validated Tradovate alert-DSL expression. Submits the expression via create_alert.expression. Covers 37 numeric functions across Account (netLiq, dollarOpenPL, dailyLossLimit, ...) and Contract (lastPrice, percentChange, settlementPrice, ...) entities. Also covers Position (netPos, posOpenPLUsd, posInitMarginUsd, ...) and Currency (currentRate) entities. Supports arithmetic (plus, minus, times, divide, parens), comparison (gt, gte, lt, lte, eq, neq), and top-level AND/OR/XOR logic. Validates the expression offline (subject syntax, function catalog, paren balance, flat-logic rule) before submission. Use when the user says "alert", "notify", "notify me", "watch for", "wake me when", "tell me when", "heads up when", "ping me if", "set a trigger", or "let me know if". Also use when the user asks about a sibling skill's proposed alert expression. position-watchdog, event-watch, and pretrade-risk also submit their proposed expressions through this skill.
compatibility: This skill requires the NinjaTrader MCP server, connected through a client with MCP support.
---

# alerts-composer

## Purpose

Turn "alert me when X" into a valid alert-DSL expression. Validate the expression offline, check for duplicates, and submit it via `create_alert.expression`.

The DSL has:
- **37 numeric functions** across 4 entity types (Account 14, Contract 9, Position 13, Currency 1) — see `references/dsl-functions.md`.
- Arithmetic `+ - * /` with parens for grouping.
- Single comparison per compare-expression.
- Flat `AND` / `OR` / `XOR` chain at the top level — **no parenthesized sub-expressions in logic**.

See `references/dsl-grammar.md` for the full grammar.

## Environment routing

Demo (simulation) and live are two separate MCP servers. Account names are unique to one server. Once a workflow resolves an account on a server, every downstream call must go through that same server. This includes `my_portfolio`, `market_snapshot`, `place_order`, `create_alert`, history tools, etc. Cross-routing fails or hits the wrong environment.

## MCP tools used

Tool names below are bare. The NinjaTrader MCP server provides them. Your client adds its own prefix. See `AGENTS.md` at the repo root.

- `search_contracts` — resolves a bare code to a symbol (the DSL subject must be an exact contract symbol).
- `my_portfolio` — gives account name context. Prune with `fields=["account.name"]` for just the account name.
- `list_alerts` — checks for duplicates.
- `create_alert` with the `expression` param — the submit path (Mode B).
- `market_snapshot` — gives price context when you translate a "near current price" intent into an absolute level. Prune with `fields=["snapshots[].symbol","snapshots[].lastPrice","snapshots[].tickSize"]`.

## Workflow

### 1. Classify the intent

Use `references/pattern-library.md` as a routing table. It has 18 patterns that cover most cases: price cross, breakeven, P&L floor, margin, session break, divergence, FX, and more. Pick the closest template.

If the user's intent needs a multi-bar indicator (ATR, RSI, MA, or similar), the DSL cannot express it. Snapshot the value now and emit a fixed-price bracket (e.g., `entry ± 2×ATR_now`). Tell the user this explicitly.

### 2. Resolve the symbol

The subject must be an **exact** contract symbol: `ESU6`, not `ES`. If the user gave a bare code, resolve it first:

```
search_contracts(text=<code>)
```

Use the `symbol` field. `contract-intel` also does this end-to-end.

### 3. Compose the expression

Paste a template from `references/pattern-library.md`. Substitute the symbol, account, and numeric thresholds. Or build the expression from the grammar in `references/dsl-grammar.md`.

### 4. Validate offline

```bash
echo '<expression>' | python3 scripts/validate.py
```

Checks:
- Balanced parens
- Comparison operator present
- No quoted subjects
- Flat-logic rule
- Function names in the 37-function catalog
- Subject regex `[\$@]?[\w\s\-\+/|]+`

Output: `{"valid": true|false, "errors": [...], "warnings": [...], "functions_used": [...], "subjects_used": [...]}`.

If the expression is invalid, fix it and validate it again. **Always validate before you submit.** A typo still passes `create_alert`, because the server parser accepts it. But the alert never fires, because the function or subject does not resolve.

### 5. Check for duplicates — required in every mode, including drafts

```
list_alerts(status="Active")
```

This duplicate check belongs to alert composition, not to alert submission. When the user asks for a draft or a validate-only check ("don't submit it"), still run `list_alerts`. Report the duplicate status in the answer. A validated draft that collides with an active alert is a footgun: the user may submit it blind later. Never present a draft or submit an alert without this check.

`list_alerts` does not return the raw expression string. Compare the new alert against each existing alert's `symbol`, `trigger`, and `price` fields instead. If an existing alert matches on all three, ask the user for a decision. Offer to replace the alert or keep both. Never auto-dismiss the duplicate.

**Draft-only mode stops here.** Report the expression, the validation result, and the duplicate status. Do not call `create_alert`.

### 6. Submit — wait for user approval first

Show the validated expression and the exact payload below. Then stop and wait for the user's approval. Never call `create_alert` from this skill before the user approves that payload. After the user approves it, submit the payload:

```
create_alert(
  expression="<validated>",
  message="<optional human-readable>",
  validUntil=<optional ISO timestamp>,
  triggerLimits=<optional int>
)
```

Use `message` for the plain-English translation, so the user sees it in the alerts list. Use `validUntil` for time-of-day conditions, because the DSL cannot express them.

### 7. Echo back the plain-English translation

> "Created alert 4321: `lastPrice(ESU6) > 7200 AND posOpenPLUsd(ESU6) < -300`
> — fires when ES prints above 7200 *and* your ES position is losing
> more than $300. Valid until 16:00 ET."

## Integration — alert-proposal handoff from sibling skills

Three skills propose alert expressions:

- **`pretrade-risk`** — after the user approves a bracket, it proposes a breakeven-trip or target-approach alert. See `../pretrade-risk/references/risk-rules.md` § alert-proposal hook.
- **`event-watch`** — proposes a reaction-window bracket around a known volatility event.
- **`position-watchdog`** — proposes stop-proximity or P&L-floor guards on live positions.

When those skills emit an expression string, the user typically says "submit it" or "go ahead." Run the expression through `validate.py` first. Then submit the expression through `create_alert` as Mode B. **Trust but verify.** Never skip validation just because another skill produced the expression.

## Output idioms

- Happy path: "I'll submit `posOpenPLUsd(ESU6) < -300` — fires when
  the open loss on your ES position exceeds $300. Sound right?"
- Draft-only: "Draft validated: `lastPrice(ESU6) > 7600` — fires when
  ESU6 prints above 7600. No duplicate among your 3 active alerts.
  Not submitted — say the word and I'll create it."
- Invalid intent (indicator): "The alert DSL has no RSI function. I
  can snapshot RSI now and emit a fixed-price alert, or you could use
  a session-break alert (`lastPrice(ESU6) > highPrice(ESU6)`)."
- Invalid intent (cross-account): "Aggregate P&L across sub-accounts
  can't be expressed in a single alert. Options: one alert per account,
  or raise/lower `dailyLossLimit` on each upstream via
  `update_risk_settings`."
- Duplicate: "You already have alert 4218 with this expression. Keep
  both, replace, or cancel the new one?"

## Disambiguation

- **vs direct `create_alert` Mode A** (a simple price cross: `symbol + trigger + price`): for a literal "alert me when ES crosses 7200 up", Mode A is simpler. The server composes the DSL internally in that mode. Use this skill instead when the intent needs any arithmetic, logic, or any non-price function.
- **vs sibling-skill proposals**: those skills own the intent-to-expression translation for their own domain (risk, events, watchdog). This skill owns DSL composition, validation, and submission for any ad-hoc intent that does not come from another skill.

## Known gotchas

**Subject has NO quotes.** Despite what the `create_alert` MCP docstring shows, the parser rejects `lastPrice("ESU6")`. Write `lastPrice(ESU6)` instead.

**No parens around logic.** The parser rejects `(A > B) OR (C < D)`. Write `A > B OR C < D` instead.

## Explicit non-goals

- **No alert cancellation logic.** `dismiss_alert` is a separate MCP tool. This skill composes + submits only.
- **No modification.** There is no `modify_alert` — dismiss and recreate.
- **No timer / scheduling.** The DSL has no time arithmetic. Use `validUntil` at submission, or gate upstream with a human workflow.
- **No indicator / historical-bar math.** The catalog is spot-quote and current-state only. Snapshot a value now and emit a fixed-price bracket when the user wants an indicator-driven alert.
- **Never invent functions.** Stick to the 37 in `dsl-functions.md`.

## Resource layout

- `scripts/validate.py` — offline DSL lint. Stdin or `--expression`. Returns JSON with errors/warnings/functions/subjects. Exit code 0 on valid, 1 on errors.
- `references/dsl-grammar.md` — full grammar (subject regex, operators, precedence, JSON shorthand, runtime statuses, known gotchas). Load it when you build an expression from scratch, not from a pattern.
- `references/dsl-functions.md` — the canonical 37-function catalog. It groups functions by entity (Account/Contract/Position/Currency) and includes an intent-to-function routing table. Load it when you pick a function.
- `references/pattern-library.md` — 18 ready-to-paste patterns (price cross, breakeven, P&L floor, session break, divergence, spread, FX, reaction window, position flip, etc.). Load it when you classify the intent or compose the expression.

~~~~
