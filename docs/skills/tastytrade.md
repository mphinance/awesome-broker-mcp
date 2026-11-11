# Tastytrade community agent skills (cmike444/tastytrade-mcp)

> **Caution: unvetted community repo that handles brokerage credentials.** This is one person's project, not Tastytrade's. The server holds your Tastytrade OAuth client secret and refresh token, can place live orders, and optionally persists an encrypted refresh token to disk. We read the files. We did not run, install or connect anything. Review the code yourself and use a sandbox or a small account first.

| | |
|---|---|
| Repo | https://github.com/cmike444/tastytrade-mcp |
| Commit | `b55e097d1594aa905e06980cd9dd665e8d8a2e69` (committed 2026-05-10) |
| License | **None.** There is no `LICENSE` file and GitHub reports no license. `package.json` and the README both say "MIT", but a metadata field without a license file does not give us a grant we can rely on, so we treat it as no license. |
| Date scraped | 2026-11-11 |
| Install | No `npx skills` flow and no plugin manifest. README: `git clone`, `npm install`, `npm run build`, then point your MCP client at `node /absolute/path/build/index.js`. The skills sit in `skills/` and the hooks in `hooks/`; you copy them into `~/.claude/` yourself. |
| Skills | 3: `tastytrade`, `trading-strategies`, `markov-regime` |

Method: shallow clone read as plain files. No script, hook, installer or CLI from the repo was executed.

## Why there is no full SKILL.md here

No license means all rights reserved. Per the [license policy](README.md#how-we-handle-licenses) this page has a detailed summary and short verbatim guardrail quotes, plus links pinned to the commit. Read the originals at `https://github.com/cmike444/tastytrade-mcp/blob/b55e097d1594aa905e06980cd9dd665e8d8a2e69/skills/<name>/SKILL.md`.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `tastytrade` | The execution skill. Runs a mandatory startup sequence (auth, account, balances, positions, open orders), builds order JSON for equities, options, futures, futures options and crypto, dry-runs, submits, confirms fill. Also option chains, IV metrics, candles, greeks, charts via local Python scripts. | MCP: `check_auth_status`, `get_account_info`, `get_account_balances`, `get_positions`, `query_orders`, `order_dry_run`, `create_order`, `create_complex_order`, `edit_order`, `replace_order`, `cancel_order`, `cancel_complex_order`, `get_quote`, `get_candles`, `get_market_metrics`, `get_options_greeks`, `get_instrument`, `manage_watchlist`, `get_transactions`. Local: `scripts/*.py`. | **Live trade** by default. Sandbox only if the operator sets `TASTYTRADE_SANDBOX=true` (cert API); the skill never mentions it. | Dry run, then "Present dry-run summary to user for confirmation", then submit "only after user confirms". Plus four PreToolUse hooks, see below. |
| `trading-strategies` | Playbook for seven options strategies (VRP, pre-earnings expansion, earnings crush, momentum skew, forward factor calendars, supply/demand zones, 0DTE VRP). Drives strategy choice, sizing (quarter Kelly, 2 to 8 percent of net liq) and a five-field written trade plan. | Same account and market-data tools as above; hands execution to `tastytrade`. | Advice that feeds live orders. | "If any of these five items cannot be answered before the trade is placed, the trade is not placed." Also tells the model to give "definitive recommendations" and never "it depends". 0DTE circuit breakers ($250 daily, $1,500 weekly). |
| `markov-regime` | Classifies the market as CALM, ELEVATED or STRESS from five signals (VIX term structure, momentum, credit proxies via HYG and JNK, VRP). Outputs grade modifiers and EV multipliers for sizing. | `get_market_metrics`, `get_candles`, `get_quote` | Read-only data. | "This skill informs **how much risk to take**, not whether to trade." |

## Guardrails: what is model-enforced and what is code-enforced

**Model-enforced only:**

- The confirm step. Nothing in the server blocks `create_order`; the instruction to dry-run and wait for the user is prose in `skills/tastytrade/SKILL.md`. An agent without the hooks installed submits as soon as it calls the tool.
- The five-field plan, the 2 to 8 percent sizing, the 0DTE blackout days (FOMC, CPI, NFP and so on) and the "never recommend 0DTE after a breach" rule in `trading-strategies`.
- "Definitive recommendation" framing. The skill pushes the model toward YES or NO with a dollar size, which is the opposite of a hedge.

**Code-enforced, but only on Claude Code and only if you install them:**

The repo ships `.claude/settings.json` wiring five PreToolUse hooks onto `create_order|create_complex_order`. The command paths point at `~/.claude/hooks/`, so you must copy `hooks/` there first. Nothing does that for you.

| Hook | Behavior |
|---|---|
| `tt-require-dry-run.sh` | Blocks every order when `TT_DRY_RUN=1`. Opt-in kill switch. |
| `tt-require-plan.py` | Blocks unless `/tmp/tt_pending_plan.json` exists, is under 60 minutes old and has `thesis`, `profit_target`, `stop_loss`, `time_stop`, `invalidation`. |
| `tt-require-bracket.py` | Blocks a naked Sell to Open option leg unless it is wrapped in an OTOCO bracket (50 percent profit and 2x stop for strangles and condors, 25 to 35 percent and 1.5x for straddles). |
| `tt-concentration-cap.py` | Blocks if one underlying would exceed 25 percent of net liq. Fails closed when its sidecar files are missing. |
| `tt-require-dte.py` | Warns only, at or inside 21 DTE on short premium entry. |

Limits on those hooks:

1. They are Claude Code hooks. A different MCP client, or a Claude Code session without the hooks copied in, gets none of them.
2. The plan file and the net liq and positions sidecars live in `/tmp` and are written by the agent itself (the skill tells it to). The plan check is self-attested: the model can write a plausible plan and pass.
3. The `tastytrade` skill documents seven more hooks that inject signals or monitor risk (`tt-compute-hv`, `tt-compute-vrp`, `tt-compute-skew`, `tt-compute-earnings`, `tt-0dte-circuit-breaker`, `tt-pnl-tracker`, `tt-growth-phase`). **None of these files exist in the repo at this commit.** The 0DTE circuit breaker the strategy skill leans on ("block or clear on every `get_transactions` call") is therefore not shipped; it is prose only.
4. The sandbox switch is in server code (`TASTYTRADE_SANDBOX`, `https://api.cert.tastyworks.com`), not in the skill.

## Secrets, tokens and files

Flagged because the skills and server touch all of these:

- **Credentials:** `TASTYTRADE_CLIENT_SECRET` and `TASTYTRADE_REFRESH_TOKEN` are read from the environment at startup. Together they give full account access, including orders.
- **Disk persistence:** `src/token-store.ts` can write an encrypted refresh token file when `TOKEN_ENCRYPTION_KEY` is set (`npm run generate:enc-key` makes one). `.gitignore` excludes `*.enc`.
- **HTTP mode:** an optional Streamable HTTP transport with a built-in OAuth 2.1 server, gated by `MCP_BEARER_TOKEN`. The repo's own `threat_model.md` lists order placement and token persistence as its highest-risk areas. Do not expose it to a network without reading that file.
- **Skill-driven file writes:** the `tastytrade` skill tells the model to dump MCP responses to `/tmp/tt_<tool>_<symbol>.json`, and the hooks read and write `/tmp/tt_pending_plan.json`, `/tmp/tt_netliq.json`, `/tmp/tt_positions.json`, `/tmp/tt_earnings_moves.json`, `/tmp/tt_earnings_dates.json`. Account numbers, balances and positions end up in plain temp files with default permissions, which matters on a shared machine.
- **Scripts the skill runs:** `skills/tastytrade/scripts/*.py` (chart and analytics helpers) are invoked by the model with `python3`. We read the invocation pattern, not each script's body.

## Per-skill notes

### `tastytrade`

17 KB. Opens with a five-call startup sequence the model must run before any recommendation. Then a context-window section that forces large payloads (option chains, candles) through `filter_chain.py` instead of printing them. The order workflow is six steps ending in `query_orders` to confirm the fill. Includes position-level stop rules: 2x net credit for strangles and condors, 1.5x for straddles and butterflies, grouped by underlying root, with the net credit computed from 90 days of transactions. Default sizing is 2 to 5 percent of net liq.

Quotes worth knowing: hooks "cannot be bypassed by skipping a step". True only where the hooks are installed.

### `trading-strategies`

13 KB plus ten reference files (not read line by line; the strategy math lives there). Seven strategies, a "tiered acceleration" framework (process discipline, diversification, capital injection, then sizing) and a rule to "run at least 3 concurrent strategies". Hook-injected signal tables describe computed HV, TSMOM, forward factor and skew values that depend on the hooks missing from the repo; without them the skill falls back to "compute these manually".

### `markov-regime`

11 KB. Pulls SPY, QQQ, IWM, HYG and JNK data, scores five signals, requires 3 of 5 to agree for a regime change and labels split votes as a transition zone. No order tools.

## Verdict

Real code guardrails exist, which is more than most community skills here, but they are optional, Claude Code only and partly self-attested. The server defaults to your live account. Treat it as a strong draft: turn on `TASTYTRADE_SANDBOX=true`, install the hooks, set `TT_DRY_RUN=1` until you trust it, and confirm every order in the Tastytrade app.
