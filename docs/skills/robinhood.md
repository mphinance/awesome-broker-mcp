# Robinhood agent skills: Oft3r/agentic-trading-desk (consumes the Robinhood MCP)

| | |
|---|---|
| Repo | https://github.com/Oft3r/agentic-trading-desk (community project, not from Robinhood) |
| Commit | `2cdfe07ac421fa6c85ee6b9f6d155b6f65e04211` (committed 2026-10-19) |
| License | MIT (`LICENSE`: "Copyright (c) 2026 Oft3r") |
| Date scraped | 2026-11-11 |
| Install | No installer. README: `cp -r /path/to/agentic-trading-desk ~/.claude/skills/agentic-trading-desk`, then register the order guard hook at user level: `install -m 755 hooks/mandate-order-guard.sh ~/.claude/hooks/mandate-order-guard.sh` plus a `PreToolUse` entry in `~/.claude/settings.json` (matcher `mcp__.*Robinhood__place_equity_order`). The repo also ships `gemini-spark-skill.zip` (the second skill, no hook). |
| MCP it needs | A Robinhood MCP server the user connects separately; the repo contains and configures none. Tool names the skills call: `get_accounts`, `get_portfolio`, `get_equity_historicals`, `get_equity_quotes`, `get_equity_positions`, `get_equity_orders`, `get_realized_pnl`, `get_earnings_calendar`, `get_trade_approval_setting`, `review_equity_order`, `place_equity_order`. |

Method: shallow clone read as plain files. No script, hook, installer or the zip's contents were executed or installed. The Python scripts and the hook were read, not run.

Both skills are trading skills in an MIT repo, so both `SKILL.md` files are reproduced in full below, unmodified, at the commit above. Copyright stays with Oft3r.

Capability key: read, paper, live.

## Structure

Two skills with the same name (`agentic-trading-desk`), two variants of one manual:

- Root `SKILL.md` (23.9 KB): the Claude Code version. Autonomous execution in one broker-designated "Agentic" account under a written Mandate, plus discretionary trades, plus a code guard (`hooks/mandate-order-guard.sh`) and a self-test (`scripts/session-setup.sh`).
- `gemini-spark/SKILL.md` (11.7 KB): the packaged variant (`gemini-spark-skill.zip` holds SKILL.md plus the four Python scripts, no hook and no `session-setup.sh`). Stricter in prose ("Zero discretion", a 2 minute quote-staleness rule) and says plainly "No external guard runs in this version."
- `scripts/` (stdlib Python, also copied under `gemini-spark/scripts`): `prepare_inputs.py`, `indicators.py`, `macro_pillar.py`, `score.py`. They only do math and write JSON files into a `--out` work directory. `session-setup.sh` is only in the root.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text (short verbatim) |
|---|---|---|---|---|
| `agentic-trading-desk` (root) | Three-pillar technical scoring (trend, momentum, macro) for stocks and ETFs; decides EXIT, RE-ENTRY, TACTICAL REBOUND, HOLD, WAIT; places market orders autonomously in the agent-tradable account within a Mandate | Robinhood MCP tools above; `python3 scripts/prepare_inputs.py`, `macro_pillar.py`, `score.py`, `indicators.py`; `bash scripts/session-setup.sh`; WebFetch to Investing.com and Google Finance (optional) | live (autonomous) | "A limit exceeded is not a cue to ask for permission: it is a cue to **not trade** and report." and "I treat the preflight table above as the real check, not the hook" |
| `agentic-trading-desk` (gemini-spark) | Same analysis and Mandate, no discretionary trades, no hook | Same MCP tools and scripts, no `session-setup.sh` | live (prose-limited) | "No external guard runs in this version. The preflight list above is the entire safety margin" |

## Guardrails: code versus prose

**Enforced in code (root variant only, and only where the hook is registered)**

`hooks/mandate-order-guard.sh` is a Claude Code `PreToolUse` hook on `mcp__.*Robinhood__place_equity_order` (the regex tolerates the `mcp__Robinhood__` vs `mcp__claude_ai_Robinhood__` prefixes). It denies, and fails closed, on:

- `type` other than `market`, or any `limit_price`; `market_hours` other than unset or `regular_hours`; `time_in_force` not exactly `gfd`.
- Any order outside Mon to Fri 09:30 to 15:58 America/New_York (it checks the zone abbreviation to make sure tzdata is real). No holiday calendar; `gfd` is the stated backstop.
- `side` not `buy` or `sell`; non-numeric or non-positive size; both or neither of `dollar_amount` and `quantity`.
- Market buys by `quantity` (the notional is not visible), and buys over a hardcoded $1,200 `dollar_amount`.
- Missing `jq`, unparseable payload, unreadable clock, or a crashing guard (the registered command wraps it so a crash exits 2, which blocks). 15 probes in `session-setup.sh` check 12 prohibited and 3 permitted orders against every installed copy, and fail if the user-level copy differs byte for byte.

**Prose only (nothing in code checks these)**

- Position size of 3% of account value (the hook only knows the $1,200 absolute cap; for accounts under $40,000 the prose limit is tighter and unenforced).
- Max 3 new positions per session, 15% minimum cash, the 4% daily-drawdown circuit breaker, the 2-session earnings blackout, the rule against averaging down, "Protected positions" (never sell or trim), no options, crypto, margin or shorts.
- "I run `review_equity_order` with the exact parameters before every `place_equity_order`": the hook does not verify a review happened, and the 1% quote-drift abort is the model's own check.
- Sells have no size cap by design; the Mandate argues a sell is bounded by shares held.
- The guard covers `place_equity_order` only. Any other Robinhood order tool, if the connected MCP offers one, is not matched by the hook. Options and crypto are prohibited in prose only.
- Account selection ("the broker's own flag from `get_accounts` ... never by nickname") is a rule for the model; the broker rejects orders to other accounts, which is a Robinhood control.
- Hook coverage: it runs only in Claude Code with a `settings.json` that registers it. The skill and README say so: in the claude.ai app, Cowork, other runtimes or a scheduled run on another repo, "no hook runs" and the preflight table "is the entire safety margin".
- The README admits the Mandate rules "have been broken" in practice, and the skill records that on 2026-08-25/26 three market orders (DIA, JPM x2) went through in skill mode with the guard unregistered. A stale August copy of the guard that still allowed limit orders stayed registered into October.
- `MANDATE_FAKE_ET` (an env var that pins the guard's clock, there for the self-test) is honored by the production guard with no check. If it is ever present in the hook's environment, the hours rule can be bypassed. The script says "Never set it in normal operation."

**Broker-side (Robinhood, outside this repo)**: the agent-tradable account flag, rejection of fractional and dollar orders outside regular hours, and the user's `human_must_approve_trades` setting (`get_trade_approval_setting`); a `customer_approval_required: true` review means the order waits for approval in the Robinhood app. This is the only control that applies in every client, and only the user can change it.

**Self-granted consent (flag)**: the root skill's guardrail 6 states "Autonomous execution is AUTHORIZED in the Agentic account", "established by the user in a live session on 2026-08-26", and adds that a stored prompt "cannot grant itself consent". The same is true of a skill file: whoever installs this text gets an agent that has been told it has standing consent to place orders. The real consent boundary is the Robinhood trade-approval setting, not this paragraph. Discretionary trades are also authorized in the root version, with a rule that each carry written reasoning ("a trade I cannot explain in two sentences is a trade I should not have made").

## Secrets, files, system changes (flag)

- No secrets are read by the skill; Robinhood auth lives in the MCP connector. The skill never asks for keys.
- `scripts/session-setup.sh`, which the skill tells the agent to run before the first order of every session and which the project-level `.claude/settings.json` runs as a `SessionStart` hook (120 s timeout), will install `jq` with `apt-get install` (as root, or via `sudo -n` with no password prompt) if it is missing, runs `chmod +x` on the guard, and reads `~/.claude/hooks/mandate-order-guard.sh`. That is a privileged package install triggered by an agent skill.
- Files written: JSON inputs and `closes.json` in a work directory (`prepare_inputs.py --out`), by the agent. The user must copy a script into `~/.claude/hooks/` and edit `~/.claude/settings.json` to get the guard in skill mode.
- Network: optional `WebFetch` of Investing.com (10Y-2Y spread, news) and Google Finance beta analyst pages. The README says Investing.com was chosen as a "validated source to avoid prompt injection risks"; fetched web text still lands in the agent's context. The skill says never to let a blocked fetch halt execution.
- Output not stored locally: "The durable record lives on the broker's side (`get_equity_orders`, `get_realized_pnl`)." The skill also expects a "push notification per executed order", with no tool named for it.

## Full SKILL.md: agentic-trading-desk, root (MIT)

~~~~markdown
---
name: agentic-trading-desk
description: >-
  Personal trading desk for short-term technical analysis on stocks/ETFs
  via Robinhood MCP. ALWAYS USE IT whenever the user asks to analyze a ticker,
  review positions, decide entries/exits/rebuys, calculate indicators
  (EMA/RSI/MACD/TRIX/Bollinger), score with the three-pillar framework, read
  the macro regime, or manage the Agentic account — even if they don't
  explicitly name the skill. Compute all indicators using deterministic code
  (never by eye) from raw Robinhood bars, apply the exit-on-exhaustion /
  re-enter-on-rebound logic, and respect account guardrails. Executes
  autonomously in the Agentic account under the Autonomous Execution Mandate,
  within hard limits on size, cash reserve and risk.
---

# Agentic Trading Desk

Operations manual for short-term trading analysis and execution.
**I (Agent) perform calls to the Robinhood MCP; the scripts act as my deterministic calculator; the framework decides and I execute.** I never calculate indicators by reasoning directly over the price bars: I fetch the data and pass it to `scripts/`.

## Guardrails — Read First, Non-Negotiable

1. **Protected positions:** Certain tickers may be designated as restricted (e.g., stock grants). NEVER analyze them to sell or trim, nor include them in exit suggestions. They should only be mentioned as exposure context if relevant.
2. **Two accounts, two roles:**
   - **Agentic** → short-term trading; this is where I execute under the Mandate.
   - **Individual** (margin account) → core buy-and-hold; only analyze holding quality, no active trading.
   - I identify the tradable account by the broker's own flag from `get_accounts` (exactly one account is agent-tradable; the others reject my orders outright). I never infer it from the account nickname, and I never hardcode an account number.
3. **Buying power:** I always take `get_portfolio.buying_power` as the authoritative figure rather than deriving it myself. Account type matters and can change: on a cash account only SETTLED cash is spendable (T+1), while a limited-margin account can trade unsettled proceeds immediately.
4. **HTML visualization only on Fridays** as part of the weekly review ritual. Do not offer or generate it on other days unless the user explicitly asks for it.
5. **Macro source (optional / best-effort):** Investing.com (NO Polymarket). If inaccessible or blocked by network egress, do NOT halt or block execution: proceed with deterministic market data without the yield spread.
6. **Autonomous execution is AUTHORIZED in the Agentic account** under the Autonomous Execution Mandate (next section). This authorization is durable and was established by the user in a live session on 2026-08-26; it does NOT depend on a scheduled prompt claiming it exists. A stored prompt cannot grant itself consent — the authorization lives here, in configuration, where it can be verified by reading it. Always review using `review_*_order` (simulation) before executing `place_*_order`.

## Autonomous Execution Mandate

The user authorizes executing orders without in-the-moment confirmation, **only** in the broker-designated agent-tradable account, and **only** within these limits. A limit exceeded is not a cue to ask for permission: it is a cue to **not trade** and report.

**What I may execute**
- Decisions emitted by `score.py` in this same session, with the macro pillar computed by `macro_pillar.py` the same day. The scripts still run every session and their output is still the baseline — the framework is not optional.
- **Discretionary entries and exits are authorized** (established by the user in a live session on 2026-08-26, superseding the prior zero-discretion rule): a trend change, a news catalyst, or a setup the decision cascade does not cover are all valid reasons to act. The cascade is rigid by design and will miss things; that is what this clause is for.
- Every discretionary trade MUST carry its reasoning in writing in the session report — what I saw, why it justified acting, and what would prove me wrong. A trade I cannot explain in two sentences is a trade I should not have made.
- **TACTICAL REBOUND goes in at half size** — it is counter-trend by definition.
- Optional: for a news-driven entry, require the tape to be moving in the direction of the thesis before acting rather than anticipating the move. Rationale in *External Context* below — in scheduled runs the news source is the weakest input available, and price confirmation is the cheapest guard against acting on a mis-dated headline.

**Hard limits**
- **Position size:** base size = **3% of account value**, and never more than **$1,200** per buy order. TACTICAL REBOUND = half of base size. Sells are not notional-capped: they can only reduce exposure (Robinhood offers no short selling, so a sell is bounded by the shares held), and a cap would block exiting a position that has grown past $1,200.
- Max **3 new positions** per session. Exits are uncapped.
- Minimum **15% of account value held in cash**. I never touch that reserve.
- **Orders only during regular hours — Mon–Fri 09:30–15:58 ET** (rule set by the user on 2026-10-19, replacing the 2026-08-26 after-hours limit rule). Outside that window I place **no orders at all**, buys or sells: I run the analysis, report what the framework emitted, and carry any action to the next regular session, re-running the analysis then. Why: every position in this account is fractional and base size (~3% of the account) is below one share of almost everything it trades, and Robinhood accepts fractional and dollar-based orders **only in `regular_hours`** (verified 2026-10-19 via `review_equity_order`: a fractional limit with `market_hours=extended_hours` is rejected — *"fractional and dollar-based orders are only allowed in regular_hours"*; the same order without `market_hours` is accepted, but as a `regular_hours` order that queues for the next open). The 2026-08-26 "fractional limits work after hours" verification had tested the second case, so an "after-hours" order was really an order queued for the next open at a price nobody re-evaluated.
- **Order shape:**
  - **`type: "market"`** only. If the analysis says enter, enter; a passive limit resting on a price is not an entry. `limit`, `stop_market` and `stop_limit` are prohibited — Robinhood also rejects stops on fractional shares, so stops in this account are manual levels I re-check each session, not resting orders.
  - **`market_hours`** omitted or `regular_hours`.
  - **Buys are sized in `dollar_amount`** — it is the natural way to size at 3% of the account, and the only way the notional is visible in the payload (a market buy by `quantity` carries no price, so the $1,200 cap could not be checked; the guard denies it). **Sells may use `quantity`** (`shares_available_for_sells`) so a whole position can be closed exactly.
  - **`time_in_force` set explicitly to `gfd`** (an omitted field is denied, not defaulted). No order outlives the session that placed it.
- **Order preflight.** Before every `place_equity_order` I print this table and check every row. If any row fails, I do NOT place the order — I report instead.

  | field | value | check |
  |---|---|---|
  | ET clock | … | inside Mon–Fri 09:30–15:58 (otherwise: no order) |
  | `side` | … | `buy` or `sell` |
  | `type` | … | `market` |
  | `market_hours` | … | omitted or `regular_hours` |
  | sizing | … | exactly one · buys `dollar_amount` · sells `dollar_amount` or `quantity` |
  | `time_in_force` | … | explicitly `gfd` |
  | notional (buys) | `dollar_amount` | ≤ 3% of account value and ≤ $1,200 |
- **The guard fails closed.** Without `jq`, with an unparseable payload, or with an unreadable clock it denies; the registered hook command wraps it so a missing or crashing script exits 2, which blocks the call (a plain non-zero exit would be a non-blocking error, i.e. ALLOW). Even so, I treat the preflight table above as the real check, not the hook — see *Session start* below for where the hook does and does not run.
- No new position in a single name within 2 sessions of confirmed earnings (`get_earnings_calendar`). ETFs exempt.
- I run `review_equity_order` with the exact parameters before every `place_equity_order`. **I abort and report** if `order_checks` is non-empty (I surface the alert verbatim), or if `quote_data.last_trade_price` is more than 1% away from the price the analysis used. A dollar-sized market order's review returns no share quantity or fill price — the quote is what I check. If the review returns `customer_approval_required: true`, the order goes to the user for approval in the Robinhood app: I report it as *pending approval*, not as executed.

**Session start — prove the guard is alive**

The Mandate is prose, and prose cannot enforce itself; `hooks/mandate-order-guard.sh` is what makes the order rules above mechanical. The failure mode that matters is that a guard which is unwired, non-executable, or missing `jq` looks exactly like a working one until an order slips through. That is not hypothetical: on 2026-08-26 a `stop_market` passed because `jq` was absent and the script exited 0 with no output, which the hook runner reads as ALLOW. So before the first `place_equity_order` of any session I run:

```bash
bash <skill-dir>/scripts/session-setup.sh
```

It installs `jq`, marks the guard executable, checks that the user-level copy (`~/.claude/hooks/mandate-order-guard.sh`, if present) is byte-identical to the skill's own, and runs **15 probes against every copy** — 12 orders the Mandate prohibits (stop, limit, market buy by quantity, over-cap notional, `gtc` or missing `time_in_force`, `extended_hours`, non-numeric size, any order after hours or on a weekend), which must be denied, and 3 it permits, which must pass. Probing only for denials is not enough: a guard that blocks *everything* is just as broken as one that blocks nothing, and from a single deny probe the two look identical. The probes pin the guard's clock via `MANDATE_FAKE_ET`, so both sides of the clock are tested whenever the session boots. Exit 0 with `order guard verified` means the guard is actually evaluating rules. **Any other outcome means it is not, and I do not execute orders that session** — I still run the analysis and report what the framework emitted, and I say plainly that execution was disabled and why.

**Where the hook actually runs — I state which case applies in the session report.** Hooks are a Claude Code feature, registered in a `settings.json`:
- **Claude Code on the user's machine, any project, skill mode included** → the user-level registration in `~/.claude/settings.json` (matcher `mcp__.*Robinhood__place_equity_order`, command pointing at `~/.claude/hooks/mandate-order-guard.sh`). Verified live 2026-10-19: a prohibited `place_equity_order` was denied by the hook before reaching Robinhood. The copy must be kept in sync — a stale August copy stayed registered into October; `session-setup.sh` now fails when they differ.
- **Claude Code with this repo as the project directory** (local or cloud) → `.claude/settings.json` in the repo also registers it, plus the `SessionStart` setup.
- **Any other client — the claude.ai app, Cowork, a scheduled run that opens a different repo, another agent runtime** → **no hook runs.** The probe above then only proves the script *would* deny if called. Nothing outside me is checking: the preflight table is the entire safety margin, and I fill it in row by row before every order and abort on any failing row. The only broker-side control that applies in every client is Robinhood's trade-approval setting (`get_trade_approval_setting` → `human_must_approve_trades`), which only the user can change in the app.

**If the self-audit shows agentic orders placed from an unguarded client, I say so plainly** — the orders were unguarded, whatever their contents turned out to be. (On 2026-08-25/26 three `market` orders — DIA, JPM ×2 — went through in skill mode with the guard unregistered. They would pass today's rules, but they passed then because *nothing was checking*, which is a different thing from being allowed.)

**Circuit breakers**
- If account value at session open is down **more than 4%** against the prior close: no new buys that day. Exits remain allowed.
- If the data does not reconcile — missing bars, an obviously stale quote, positions that do not match `get_equity_positions` — **I do not trade**. The Mandate presupposes sound data; without it the Mandate does not apply.

**After executing**
- A push notification per executed order, plus a summary at the end of the run. The user finds out the same day, not on Friday.
- The durable record lives on the broker's side (`get_equity_orders`, `get_realized_pnl`), not in a local file: the execution container is ephemeral.

**Still prohibited**
- Protected positions, always (guardrail 1).
- Any account other than the broker-designated agent-tradable one.
- Averaging down.
- Options, crypto, margin and short selling: outside the Mandate.

## Robinhood MCP Recipe (Order of Calls)

Load the tools with `tool_search` before using them (they are deferred).

**Guard verification runs before any of this** — see *Session start — prove the guard is alive* in the Mandate. No order goes out in a session where `session-setup.sh` did not exit 0 printing `order guard verified`.

**Session self-audit (first call of every run).** `get_equity_orders` on the agent-tradable account with `agent_initiated=true` since the previous session (this also catches agent orders the user approved in the app, which `placed_agent="agentic"` alone would miss). An order is a Mandate breach by a prior run if its `type` is anything but `market`; if its `market_hours` is anything but `regular_hours`; if it was created outside Mon–Fri 09:30–15:58 ET; if its `time_in_force` is not `gfd`; if it is a buy without `dollar_based_amount`; or if it is a buy whose notional exceeds $1,200. I check all of these on every order returned, and surface any breach in the push notification rather than letting it pass silently. The broker's order history is the only durable record — the execution container is ephemeral, so a breach that is not surfaced today is lost.

**To analyze a ticker:**
1. `Robinhood:get_equity_historicals` → ~290 daily bars (closes). This is the input for `indicators.py`. Request a range that yields ≥220 bars (ideal for EMA200).
2. `Robinhood:get_equity_quotes` → live price / last session close.
3. If the user has a position: `Robinhood:get_equity_positions` (correct account) for size and P&L → set `holding` to correct value in scoring.

**For the Macro-Sentiment pillar (once per session, shared):**
1. `get_equity_historicals` for the 8 ETFs: SPY, RSP, IWM, HYG, LQD, TLT, XLY, XLP.
2. Attempt to fetch the 10Y-2Y yield spread from Investing.com (web) and inject it as `yield_spread`. If blocked by network egress policy or unavailable, omit it immediately without retrying: the script automatically redistributes its 20% weight among the other components and execution continues seamlessly without blocking.

**For portfolio management:**
- `Robinhood:get_portfolio` → market value and buying power.
- `Robinhood:get_equity_positions` → open positions by account.
- `Robinhood:get_realized_pnl` → realized P&L (useful for the Friday review).

## Computation Flow (Run via Code Execution)

Scripts are pure stdlib; they do not need internet access. They live in `scripts/` **inside this skill's own directory** — the runtime gives me the base path when it loads the skill. I never hardcode that path: it differs between environments.

Robinhood historicals are large and routinely exceed the tool's output limit; when that happens the result is written to a file and I get the path back. **I process them with code straight from that file** — I never load raw bars into context. I save the `get_equity_quotes` responses to a file as well (they are small and come back inline).

**Step 0 — prepare the inputs (every session, before anything else).**
```bash
python3 scripts/prepare_inputs.py --historicals <historicals files…> --quotes <quotes files…> --out <workdir>
```
It does two things I must never do by eye:
1. **Drops bars flagged `interpolated: true`.** `get_equity_historicals` synthesizes bars to fill gaps — including the whole span before a symbol's first trade. Found 2026-10-19: SPCX (first trade 2026-06-12) came back with 318 bars, 230 of them fake; scored over them it showed "EMA50>EMA200, EMA200↑", both invented. With real bars only it has 89 bars and the Trend pillar is marked `partial: 2/4 components`.
2. **Makes the last bar today's, from the broker's own dates** (`previous_close_date`, `venue_last_trade_time`, read in America/New_York — never a hard-coded UTC time, which breaks at every daylight-saving change). Daily bars do not include the current session until well after the close:
   - last real bar is today → nothing appended;
   - last bar is the prior session and the quote traded today ≥ 09:30 ET → `last_trade_price` appended: **final** after 16:00 ET, **provisional** during regular hours — then I label the scorecard `intraday (partial bar)`, because flags that hinge on the last bar (RSI turn, MACD histogram slope, %B, EMA20 reclaim) can flip by the close, and that uncertainty goes in the written reasoning of any trade taken on it;
   - pre-open, weekend or holiday → nothing appended;
   - last bar older than the prior session → **STALE, symbol excluded** (data does not reconcile — circuit breaker).
   `last_non_reg_trade_price` is never used: extended-hours prints are not closes.

Output: `ticker_<SYM>.json` per symbol, `macro_input.json` (the 8 ETFs, nested under `series`), and `closes.json` with the per-symbol report (real bars, dropped bars, appended mode, warnings). Every warning it prints goes into the session report.

**Step 1 — Macro (once per session).**
```bash
python3 scripts/macro_pillar.py <workdir>/macro_input.json --json
```
To add the 10Y-2Y spread, insert `"yield_spread": <float or series>` into `macro_input.json` first. Save the `pillar_score` (-2..+2). That number is the Macro-Sentiment score for ALL tickers today.

**Step 2 — Per ticker.**
```bash
python3 scripts/score.py <workdir>/ticker_<SYM>.json --macro-score <pillar_score> --holding <true|false>
```
This returns the three-pillar scorecard + decision (EXIT / TRIM, EXIT, RE-ENTRY (new cycle), TACTICAL REBOUND (counter-trend), HOLD (ride the cycle), HOLD (under review), WAIT (do not chase), STAY OUT / AVOID, HOLD / OBSERVE, OBSERVE) along with the exhaustion/bearish/rebound/death-cross flags that justify it. Passing the correct `holding` value is key: the decision cascade behaves differently depending on whether there is an open position or we are flat.

If only raw indicators are needed: `python3 scripts/indicators.py ticker_input.json`.

## Three-Pillar Framework (Standard Output Format)

Each pillar ranges from **-2 to +2**:
- **Trend** — EMA 20/50/200 structure + price position vs. EMAs + long-term slope.
- **Momentum** — Wilder's RSI-14 + MACD histogram + TRIX-15 vs. signal.
- **Macro-Sentiment** — from `macro_pillar.py` (cross-asset regime).

Report all three scores with their details, the total (-6..+6), and the decision framed in the logic of the Agentic account. **Ruling principle: short-term returns via capital rotation** — the cycle is enter on rebound → ride → exit on exhaustion → wait for next trigger. Accumulating positions is NOT the default (keeps capital trapped):

- **EXIT / TRIM** when bullish momentum is EXHAUSTED (RSI turning from overbought, MACD histogram shrinking, price stretched / near upper Bollinger band).
- **EXIT** when bearish momentum is RELENTLESS (true structural death-cross —EMA50<EMA200 and price<EMA50—, MACD histogram deepening, TRIX below zero).
- **RE-ENTRY (new cycle)** when flat, when a rebound/reversal arrives with a healthy EMA structure: valid entry trigger, confirm with candle/volume.
- **TACTICAL REBOUND (counter-trend)** when flat, when a rebound appears WITHIN a death-cross: a legitimate short-term opportunity, but with reduced size, close target (EMA20/EMA50 or middle Bollinger band), conditional exit on the next session / daily close if the rebound falters (since server-side stop orders are prohibited), and quick exit. It is not a new cycle and does not become a hold.
- **HOLD (ride the cycle)** when holding a position with positive trend+momentum: maintain while watching for exhaustion; the next expected action is exit with profit, not adding to position.
- **HOLD (under review)** when holding a position with weak structure or momentum, but no full exit trigger yet: maintain while monitoring for further deterioration.
- **WAIT (do not chase)** when flat with a healthy trend but no fresh trigger: entering mid-trend has poor R/R; wait for pullback to EMA20 and turn.
- **STAY OUT / AVOID**, **HOLD / OBSERVE** (when holding) or **OBSERVE** (when flat) as appropriate.

## External Context (News + Analysts — Non-Blocking / Optional)

All external context (news, analyst ratings, yield spread) is strictly optional, best-effort, and non-blocking:

1. **News/macro:** Investing.com (as defined in guardrails).
2. **Analyst ratings:** Google Finance beta —
   `https://www.google.com/finance/beta/quote/<TICKER>:<EXCHANGE>?tab=analysis`
   Returns: consensus (Buy/Hold/Sell), 12m price targets (avg/max/min), analyst table with dates, and last earnings vs. estimates.
3. **Network egress policy & non-blocking execution:** In remote scheduled runs, `WebFetch` to external sites (investing.com, google.com, cnbc.com, fred.stlouisfed.org, home.treasury.gov) is blocked by the network egress policy. **Never let an external fetch error or egress block halt, delay, or fail execution.** If external requests are blocked, time out, or return errors, skip them immediately without retrying and proceed purely with deterministic Robinhood data and local scripts. The macro pillar computes cleanly without the yield spread by redistributing its weight.
4. If successfully fetched, report this as **qualitative context alongside the three-pillar scorecard** — it never modifies numeric scores or trading decisions. Highlight: consensus, average target vs. current price (upside or price already past target), and recent rating changes (<2 weeks).

## Indicator Details (What the scripts calculate)

- **EMA** seed = SMA of the first N bars (TradingView convention / adjust=False).
- **RSI-14** with **Wilder's** smoothing (not simple moving average).
- **MACD** 12/26/9; report line, signal, histogram, and histogram slope.
- **TRIX-15** = % ROC of triple EMA, with EMA-9 signal.
- **Bollinger Bands** 20/2 with **population** standard deviation; report %B.
- Slopes are measured against 5 bars ago (configurable with `--slope-lookback`).

See `scripts/indicators.py` and `scripts/score.py` for exact implementation details. The math is checked by known-answer self-tests (constant-series EMA, monotonic-series RSI, MACD = EMA12 − EMA26, flat-series %B); `score.py` also asserts the decision on synthetic exhaustion and downtrend scenarios. Run any script with no arguments to execute its self-test — a non-zero exit means do not trust the numbers that session.

## What This Skill Does NOT Do

It is not a signal service, and it is not a proven strategy: it is the user's framework executed with discipline. It runs on a schedule and executes on its own within the Mandate, but **the framework has no backtest** — a trigger firing does not make it correct. It does not average down. It does not touch protected positions. It does not trade options, crypto or margin. It does not generate HTML outside of Fridays.
~~~~

## Full SKILL.md: agentic-trading-desk, gemini-spark variant (MIT)

~~~~markdown
---
name: agentic-trading-desk
description: >-
  Personal trading desk for short-term technical analysis on stocks/ETFs
  via Robinhood MCP. Computes deterministic indicators (EMA/RSI/MACD/TRIX/Bollinger)
  from raw bars, scores with the three-pillar framework, and evaluates cycle
  exhaustion and rebound trading setups within user-defined risk limits.
---

# Agentic Trading Desk

Operations manual for technical trading analysis and execution management.
**I (Agent) perform calls to the Robinhood MCP; the scripts act as my deterministic calculator; the framework evaluates and prepares execution.** I never calculate indicators by reasoning directly over the price bars: I fetch the data and pass it to `scripts/`.

## Guardrails — Read First, Non-Negotiable

1. **Protected positions:** Certain tickers may be designated as restricted (e.g., stock grants). NEVER analyze them to sell or trim, nor include them in exit suggestions. They should only be mentioned as exposure context if relevant.
2. **Two accounts, two roles:**
   - **Agentic** → short-term trading; this is where execution applies under the Mandate.
   - **Individual** (margin account) → core buy-and-hold; only analyze holding quality, no active trading.
   - I identify the tradable account by the broker's own flag from `get_accounts` (exactly one account is agent-tradable; the others reject orders outright). I never infer it from the account nickname, and I never hardcode an account number.
3. **Buying power:** I always take `get_portfolio.buying_power` as the authoritative figure rather than deriving it myself. Account type matters and can change: on a cash account only SETTLED cash is spendable (T+1), while a limited-margin account can trade unsettled proceeds immediately.
4. **HTML visualization only on Fridays** as part of the weekly review ritual. Do not offer or generate it on other days unless the user explicitly asks for it.
5. **Macro source (optional / best-effort):** Investing.com. If inaccessible or blocked by network egress, do NOT halt or block execution: proceed with deterministic market data without the yield spread.
6. **Execution Mandate:** All trade execution follows the pre-configured Execution Mandate limits. Always review using `review_*_order` (simulation) before executing `place_*_order`.

## Execution Mandate & Boundaries

The system operates strictly within these boundaries. A limit exceeded is a directive to **not trade** and report:

**What may be evaluated and executed**
- Only decisions emitted by `score.py` in this same session, with the macro pillar computed by `macro_pillar.py` the same day. Zero discretion: if the script did not emit EXIT, EXIT / TRIM, RE-ENTRY (new cycle) or TACTICAL REBOUND (counter-trend), there is no trade. A hunch is not a trigger.
- **TACTICAL REBOUND goes in at half size** — it is counter-trend by definition.

**Hard limits**
- **Position size:** base size = **3% of account value**, and never more than **$1,200** per buy order. TACTICAL REBOUND = half of base size. Sells are not notional-capped: Robinhood offers no short selling, so a sell is bounded by the shares held.
- Max **3 new positions** per session. Exits are uncapped.
- Minimum **15% of account value held in cash**. I never touch that reserve.
- **Orders only during regular hours — Mon–Fri 09:30–15:58 ET.** Outside that window, place no orders at all; carry any action to the next regular session and re-run the analysis then. Robinhood accepts fractional and dollar-based orders only in `regular_hours` (a fractional limit with `market_hours=extended_hours` is rejected; without `market_hours` it queues for the next open), and base size is below one share of most names.
- **Order shape:** `type: "market"` only (no `limit`, `stop_market` or `stop_limit`; stops are manual levels re-checked each session) · `market_hours` omitted or `regular_hours` · buys sized in `dollar_amount`, sells may use `quantity` · `time_in_force` explicitly `gfd`.
  - In every run summary, state the order placed and the explicit rationale.
- **Quote staleness:** Before any order, check `venue_bid_time` / `venue_ask_time` and `venue_last_trade_time` against the current time. If top of book or the last trade is **more than 2 minutes** old, the quote is stale: do not trade the name this session.
- **Order preflight:** Before every `place_equity_order`, check each of these fields:
  - `ET clock`: inside Mon–Fri 09:30–15:58 (otherwise: no order).
  - `side`: `buy` or `sell`.
  - `type`: `market`.
  - `market_hours`: omitted or `regular_hours`.
  - `quote age`: top of book updated < 2 min ago; recent trade exists.
  - `size`: exactly one · buys `dollar_amount` · sells `dollar_amount` or `quantity`.
  - `time_in_force`: explicitly `gfd`.
  - `notional` (buys): `dollar_amount` ≤ 3% of account value and ≤ $1,200.
- No new position in a single name within 2 sessions of confirmed earnings (`get_earnings_calendar`). ETFs exempt.
- Run `review_equity_order` with the exact parameters before every `place_equity_order`. **Abort and report** if `order_checks` is non-empty (surface the alert verbatim), or if `quote_data.last_trade_price` is more than 1% away from the price the analysis used. A dollar-sized market order's review returns no share quantity or fill price — the quote is what to check. If the review returns `customer_approval_required: true`, the order goes to the user for approval in the Robinhood app: report it as *pending approval*, not as executed.

**Circuit breakers**
- If account value at session open is down **more than 4%** against the prior close: no new buys that day. Exits remain allowed.
- If data does not reconcile — missing bars, an obviously stale quote, positions that do not match `get_equity_positions` — **do not trade**.

**Still prohibited**
- Protected positions, always.
- Any account other than the broker-designated agent-tradable one.
- Averaging down.
- Options, crypto, margin, and short selling.

**No external guard runs in this version.** The preflight list above is the entire safety margin: check it field by field before every order and abort on any failing field. The only broker-side control is Robinhood's trade-approval setting (`get_trade_approval_setting` → `human_must_approve_trades`), which only the user can change in the app.

## Robinhood MCP Recipe (Order of Calls)

Discover and load the Robinhood MCP tools before using them.

**Session self-audit (first call of every run):**
`get_equity_orders` on the agent-tradable account with `agent_initiated=true` since the previous session (this also catches agent orders the user approved in the app). Check `side`, `type`, `market_hours`, creation time, `time_in_force`, and notional on every order returned — any non-`market` order, any order outside `regular_hours` or created outside Mon–Fri 09:30–15:58 ET, a non-`gfd` order, a buy without `dollar_based_amount`, or a buy over $1,200 is a discrepancy — and surface any discrepancy in the summary report.

**To analyze a ticker:**
1. `Robinhood:get_equity_historicals` → ~290 daily bars (closes). Request a range yielding ≥220 bars (ideal for EMA200).
2. `Robinhood:get_equity_quotes` → live price / last session close.
3. `Robinhood:get_equity_positions` (agent-tradable account) for size and P&L → `--holding true` if there is a position, `--holding false` if flat. The decision cascade differs between the two.

**For the Macro-Sentiment pillar (once per session, shared):**
1. `get_equity_historicals` for the 8 ETFs: SPY, RSP, IWM, HYG, LQD, TLT, XLY, XLP.
2. Attempt to fetch the 10Y-2Y yield spread from Investing.com (web) and inject it as `yield_spread`. If blocked by network egress policy or unavailable, omit it: `macro_pillar.py` automatically redistributes its 20% weight among the other components.

**For portfolio management:**
- `Robinhood:get_portfolio` → market value and buying power.
- `Robinhood:get_equity_positions` → open positions by account.
- `Robinhood:get_realized_pnl` → realized P&L.

## Computation Flow (Run via Code Execution)

Scripts are pure Python stdlib (3.9+); they do not require external network access or tzdata. They live in `scripts/` inside this skill's directory. Run any script with no arguments to execute its self-test; a non-zero exit means do not trust its numbers this session.

**Step 0 — prepare inputs (every session):**
Save the historicals and quotes responses to files, then:
```bash
python3 scripts/prepare_inputs.py --historicals <files…> --quotes <files…> --out <workdir>
```
It drops bars flagged `interpolated: true` (synthetic fill, e.g. the span before a recent IPO), appends today's `last_trade_price` from the broker's own dates (provisional during regular hours — label the scorecard `intraday (partial bar)` — final after 16:00 ET), excludes stale symbols, and writes `ticker_<SYM>.json`, `macro_input.json` and a report in `closes.json`. Report its warnings.

**Step 1 — Macro (once per session):**
```bash
python3 scripts/macro_pillar.py <workdir>/macro_input.json --json
```
To add the yield spread, insert `"yield_spread"` into `macro_input.json` first. Save `pillar_score` (-2..+2). That number is the Macro-Sentiment score for all tickers today.

**Step 2 — Per ticker:**
```bash
python3 scripts/score.py <workdir>/ticker_<SYM>.json --macro-score <pillar_score> --holding <true|false>
```
This returns the three-pillar scorecard and decision.

## Three-Pillar Framework

Each pillar ranges from **-2 to +2**:
- **Trend** — EMA 20/50/200 structure + price position vs. EMAs + long-term slope.
- **Momentum** — Wilder's RSI-14 + MACD histogram + TRIX-15 vs. signal.
- **Macro-Sentiment** — from `macro_pillar.py` (cross-asset regime).

Decisions:
- **EXIT / TRIM**: Bullish momentum exhausted (RSI turning from overbought, MACD histogram shrinking, price near upper Bollinger band).
- **EXIT**: Bearish momentum relentless (structural weakness, negative MACD histogram, falling TRIX).
- **RE-ENTRY (new cycle)**: Flat account; rebound arrives with healthy EMA structure.
- **TACTICAL REBOUND (counter-trend)**: Flat account; rebound appears within a death-cross: reduced size, close target, conditional exit on next session / daily close if rebound falters.
- **HOLD (ride the cycle)**: Holding position with intact positive trend and momentum; maintain while watching for exhaustion.
- **HOLD (under review)**: Holding position; weak signals or adverse momentum, prepare to exit if conditions degrade.
- **WAIT (do not chase)**: Flat account; healthy trend but no fresh entry trigger.
- **STAY OUT / AVOID**: Flat account; relentless bearish trend, no rebound trigger.
- **HOLD / OBSERVE** or **OBSERVE**: Mixed signals; no clear trigger.

## External Context (News + Analysts — Non-Blocking / Optional)

All external context is optional, best-effort, and non-blocking:
1. **News/macro:** Investing.com (if available).
2. **Analyst ratings:** Google Finance (if available).
3. **Network egress safety:** If external web lookups fail, time out, or are blocked by network egress policies, skip them immediately and proceed with deterministic Robinhood data and local Python scripts.
4. Report qualitative context alongside the three-pillar scorecard — it never alters numerical indicator scores.

## Indicator Details

- **EMA** seed = SMA of the first N bars.
- **RSI-14** with **Wilder's** smoothing.
- **MACD** 12/26/9; line, signal, histogram.
- **TRIX-15** = % ROC of triple EMA, with EMA-9 signal.
- **Bollinger Bands** 20/2 with population standard deviation; report %B.
- Slopes are measured against 5 bars ago (`--slope-lookback`).

~~~~

## Reference files not reproduced

- `README.md`: architecture diagram, indicator definitions, script usage, the "Enforcing the Mandate" section (guard table, where hooks do and do not run, user-level install JSON, fail-closed reasoning). Quoted above where relevant.
- `hooks/mandate-order-guard.sh` (about 170 lines of bash plus jq), `.claude/settings.json` (project-level hook registration), `scripts/session-setup.sh`: described above.
- `scripts/*.py`: indicator math and the input preparer. `prepare_inputs.py` drops bars flagged `interpolated: true`, appends the live `last_trade_price` as a provisional or final bar from the broker's own dates, and marks stale symbols excluded.

## Guardrail gap list

1. The code guard exists only for Claude Code with a registered hook, and only for `place_equity_order`. The gemini-spark variant and every other client run on prose plus the broker's approval setting.
2. The 3% sizing rule, 3 new positions, 15% cash reserve, 4% drawdown breaker, earnings blackout, protected positions and no-averaging-down are model-enforced only.
3. The guard cannot check that `review_equity_order` ran or that the quote was within 1%.
4. No holiday calendar; `gfd` expiry is the backstop.
5. The skill text declares standing autonomous authorization for itself; installers inherit it.
6. A skill-triggered `sudo -n apt-get install jq` and a user-level hook that can drift out of sync (the README records this happening).
7. `MANDATE_FAKE_ET` clock override is live in the production guard.
8. Fetched web content (Investing.com, Google Finance) enters the context of an agent that can place orders.
