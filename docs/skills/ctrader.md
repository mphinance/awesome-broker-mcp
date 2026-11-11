# Spotware ctrader-skills (cTrader CLI and cTrader MCP servers)

| | |
|---|---|
| Repo | https://github.com/spotware/ctrader-skills |
| Commit | `01e93fec9a802a03fd55b14f1332207c496fe2d0` (committed 2026-08-21; pyproject and plugin version 0.1.1, README warns "early development") |
| License | **Proprietary, not an open-source license.** `LICENSE` and `COPYRIGHT.md`: "Copyright (c) 2026 Spotware Systems Ltd. All rights reserved." use is "governed exclusively by the Spotware End User License Agreement" (https://www.spotware.com/eula/). Each skill has a `LICENSE.txt` and frontmatter `license: Proprietary. LICENSE.txt has complete terms.` GitHub reports NOASSERTION. The EULA itself was not fetched. |
| Date scraped | 2026-11-11 |
| Install | `npx skills add spotware/ctrader-skills --skill '*' --yes --global`, or in Claude Code `/plugin marketplace add spotware/ctrader-skills` then `/plugin install ctrader-skills@ctrader-skills`, or `./install.sh [--global]` from a clone (not run here) |
| Prerequisites | Python 3.12+ on PATH for the bundled helper scripts; for the CLI skill, `winget install Spotware.cTrader.CLI` (Windows) or `brew tap spotware/tap` then `brew install spotware/tap/ctrader-cli` (macOS, Linux); cTrader MCP servers are installed separately per the cTrader Help Centre |

Method: shallow clone read as plain files. No script, installer or CLI was executed. The five Python helpers were only grepped, not run.

## Why full text is not reproduced

The repo is proprietary all-rights-reserved with an EULA, so there is no grant to redistribute the `SKILL.md` files. This page gives detailed summaries and short verbatim guardrail quotes only. The summaries describe behavior and structure; read the repo for the text.

## Structure

2 skills, ~380 KB of files in total:

- `skills/ctrader-cli/`: `SKILL.md` (16.5 KB) plus six references (`setup.md`, `routing-and-output.md`, `commands.md`, `trading-write.md`, `algo-lifecycle.md`, `errors-and-exit-codes.md`). Observed CLI build 5.9.0.38, last audit 2026-08-03.
- `skills/ctrader-mcp-servers/`: `SKILL.md` (25.5 KB), references (`local-http-server.md`, `remote-http-server.md`, `known-quirks.md`, `self-healing-playbook.md`, `trader-workflows.md`), a symbol precision table, and five Python helpers (`pip_math.py`, `position_sizing.py`, `tiered_margin.py`, `conversion_rate.py`, `units_encoding.py`). Last audited 2026-05-14 against rest-proxy 1.0.18 (Remote) and a Local build observed 2026-05-14.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text (short verbatim) |
|---|---|---|---|---|
| `ctrader-cli` | Teaches the agent to drive `ctrader-cli` headlessly: accounts, symbols, prices, candles, orders, positions, deals, exposure, alerts; order place/modify/cancel, position close/modify; cBot create, build, backtest, run | `ctrader-cli[.exe]` verbs `accounts`, `symbols`, `account`, `symbol`, `price(s)`, `candles`, `orders`, `positions`, `order place-market/place-limit/place-stop/place-stop-limit/modify/cancel`, `position close/close-partial/modify`, `alert create/delete`, `create`, `build`, `backtest`, `run`, `stop` | read, and live or demo orders (account type is chosen by the user's login; the skill requires demo) | "On a mutating verb, `-q` *is* the confirmation" and "Never run a mutating command to discover how it behaves." |
| `ctrader-mcp-servers` | Semantics, units, encodings and workflows for the two cTrader MCP servers (Local HTTP bound to cTrader Desktop; Remote HTTP via rest-proxy), plus five calculation scripts and a quirks ledger | Local tools: `place_market_order`, `place_limit_order`, `place_stop_order`, `place_stop_limit_order`, `amend_order`, `amend_position`, `cancel_order`, `close_position`, `close_position_partial`, `close_all_positions`, `cancel_all_pending_orders`, chart/watchlist/alert/cBot tools (`stopPlugin`, `delete_*`, `clear_chart_objects`). Remote tools: `create_order`, `amend_order`, `cancel_order`, `amend_position`, `close_position` plus a read `data` profile. `python scripts/*.py` for math. | read and live (both servers work against demo or live; the Remote server "itself does not distinguish demo from live") | "mutating tools require explicit user confirmation before invocation" (Remote `trading` profile) and "always read current state first and confirm intent with the user" (Local destructive ops) |

## ctrader-cli in detail

Structure of the skill: a routing model (six verbs have a batch path and everything else runs through the interactive shell, with `-q` acting as a routing flag, not a quiet flag), an invocation template (`timeout 30 ctrader-cli.exe <verb> [flags] -e </dev/null 1>out.txt 2>err.txt`), credential handling, output parsing, exit codes (0 ok, 1 usage, 81 bad credentials, 82 account not found, 124 external timeout), a mutation sequence, and a session preflight in `references/setup.md`.

**Secrets and files**

- Credentials: environment variables `CTID` and `PWD-FILE` (a path to a file whose first line is the password), enabled by the `-e` flag. The skill says "Never read or print the value of `CTID` or `PWD-FILE`. Check presence and length only." It tells the agent to prefer env over `--ctid`/`--pwd-file` flags and says `--password` "should not appear in a scripted invocation".
- The password sits in a plaintext file on disk by design. The shell banner prints the cTrader ID ("Redact it when quoting captured output").
- Output files: calls redirect to `out.txt`/`err.txt` with unique names; `backtest --report-json` writes a report file; `create` scaffolds cBot projects and `build` compiles them (code execution on the user's machine, with arbitrary cBot source).

**Mutation guardrails**

- The CLI itself requires a confirmation on mutating verbs: without `-q` (or the shell `yes`) it prints `Refused: confirmation required` and exits 1 (source: `references/trading-write.md`; the CLI is a closed binary, so this is described, not verified in code). The skill treats `-q` as the confirmation and says `--yes` and `-y` do not work at a flag-style launch.
- That confirmation is supplied by the agent's own command line, so it is a speed bump, not a human gate. The human gate is a sentence of prose: add `-q` "only after the user has explicitly authorized that specific action, and only after you have confirmed the target account is a demo account by checking that `accounts` reports `"Live": false`." Model-enforced only. The skill does not make the CLI refuse live accounts.
- Authorization scope per `trading-write.md`: not "authorization to trade in general", and not one given earlier for a different order or symbol; "the specific action you are about to submit". Model-enforced.
- A four-stage sequence is prescribed (pre-flight read of `symbol` limits and current state, act, post-flight re-read, report). After every mutation: "re-read the affected entity ... and confirm the applied state". Model-enforced.
- Stop loss and take profit are three-state on modify: a value replaces, `0` removes, omission preserves. Wrong-side prices are rejected client-side before submission (CLI behavior).
- Volume defaults to units, not lots; the skill tells the agent to read `lotSize`, `minVolume`, `maxVolume`, `volumeStep` first.

**Permission pre-approval (notable)**: the frontmatter declares `allowed-tools: "Read, Grep, Glob, Bash(ctrader-cli.exe *), Bash(timeout 30 ctrader-cli.exe *), ... Bash(ctrader-cli *) ..."`. In agent runtimes that honor `allowed-tools` (Claude Code does), that pre-approves every `ctrader-cli` invocation, including `order place-market -q`, so the runtime's own permission prompt is bypassed for exactly the commands that move money. Combined with `-q` being agent-supplied, the only remaining human check is the model reading the prose above. It also pre-approves `Bash(printenv *)`, which can print any environment variable including secrets, despite the "never print" instruction.

## ctrader-mcp-servers in detail

Content: identification of which server is bound (Local vs Remote fingerprints), a units table (Local volume in units, display prices, ISO 8601 with mandatory `Z`, symbol names; Remote volume in cents, prices in pipettes, integer `symbolId`), SL/TP conventions (Local order placement takes pip distance, position amendment takes absolute price; Remote uses absolute price), dynamic-leverage margin math, currency conversion chains, hedging vs netting, stop-out, swap, seven workflows (W0 session bootstrap, W1 to W6 including position sizing by risk percent, pre-trade briefing, cost comparison, place and visualize, historical backfill, safe flatten), a quirks ledger (for example Q-R10: Remote `amend_position` omitting a leg removes it), and a self-healing playbook.

**Guardrails and where they live**

- Entirely prose plus MCP-server behavior. The skill has no hooks and no code gate on orders. The only code in the repo is the five calculators (stdlib Python), which only compute numbers; `pip_math.py` reads a bundled JSON file, nothing else touches files or network (by grep for `open(`, `subprocess`, `socket`, `urllib`, `requests`, `environ`).
- Server-side profile gate (not in this repo): the Remote server exposes a `data` profile (read tools only, "safe to call without confirmation") and a `trading` profile that adds the five mutating tools. The skill says: if no mutating tools are visible in `tools/list`, the connection is data-only. This is the one real read-only mode, and it is chosen when the user connects the server, not by the skill.
- "mutating tools require explicit user confirmation before invocation" (Remote) and, for Local destructive operations (`close_all_positions`, `cancel_all_pending_orders`, `clear_chart_objects`, `delete_workspace`, `delete_watchlist`, `delete_chart_template`, `delete_price_alert`, `stopPlugin`): "these tools have no undo on this server" and "present the affected items to the user for confirmation". Model-enforced.
- Demo vs live: "a live account may require an additional explicit `ASK` (user acknowledgement) before any mutation". The agent should surface "this is a LIVE account" before the first mutation in a session and again for any out-of-policy size. Model-enforced, and phrased with "may".
- Pre-flight gates in `self-healing-playbook.md` (quote sanity, side direction, SL/TP sidedness, volume step, schema fields only, pipettes vs display). These are model-run checks. One override path is prose: "If the user explicitly invokes `--allow-far-otm` ... bypass this gate but LOG the override" (a flag that exists only in the skill's own text).
- Post-order validation loop: after any mutating call, re-read and verify volume, side, entry, SL, TP and `dealStatus`; "Do not assume the order is filled just because the call returned without an exception."
- W0 session bootstrap is read-only except an opt-in probe that "places a real MARKET_RANGE order (immediately closed)"; default is not to run it.
- Frontmatter `allowed-tools: "Read, Grep, Glob, Bash(python *)"` pre-approves any `python` command, not only the bundled scripts. The helper scripts need no keys; the skill itself says it does not require API keys, and MCP server credentials are handled by the separate server install.

## Reference files not reproduced

All proprietary; summarized above. `references/trading-write.md` (guarded mutation sequence), `references/setup.md` (preflight and user-facing setup wording), `references/known-quirks.md` (28 KB quirks ledger with Detect/Workaround/Verify-fixed/Removal criteria), `references/trader-workflows.md` (56 KB), `references/local-http-server.md` and `remote-http-server.md` (capability maps).

## Guardrail gap list

1. All confirmation and demo-only rules are model-enforced prose. No code anywhere in the repo checks account type or asks a human.
2. `ctrader-cli` mutations are confirmed by `-q`, a flag the agent types itself; and the skill pre-approves all `ctrader-cli` calls through `allowed-tools`.
3. Demo-only is a request to check `"Live": false`; the CLI will happily trade a live login.
4. `Bash(printenv *)` is pre-approved while the skill forbids printing `CTID` or `PWD-FILE`.
5. `Bash(python *)` is pre-approved for the MCP skill, wider than the five bundled scripts it needs.
6. The MCP servers do not distinguish demo from live; the Remote `data` vs `trading` profile is the only structural read-only control and it is outside the skill.
7. License is proprietary; do not vendor or redistribute the text.
