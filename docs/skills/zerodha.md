# Zerodha Kite CLI agent skill (zerodha/kite-cli)

| | |
|---|---|
| Repo | https://github.com/zerodha/kite-cli |
| Commit | `940c10f1ddcdd5297cb67b4dce893cd1bed722e0` (committed 2026-11-11) |
| License | MIT (`LICENSE`, Copyright 2026 Zerodha Technology Pvt. Ltd.; GitHub detects MIT) |
| Date scraped | 2026-11-11 |
| Install (CLI) | `curl -fsSL https://raw.githubusercontent.com/zerodha/kite-cli/main/scripts/install.sh \| sh` (README says it verifies the archive SHA-256); Windows `irm .../install.ps1 \| iex` |
| Install (skill) | Agent prompt from the README: "Fetch and follow the instructions at https://raw.githubusercontent.com/zerodha/kite-cli/main/skills/prompt.md". That file tells the agent to install the CLI if missing, then `curl` `skills/kite/SKILL.md` into `~/.claude/skills/kite/` or `~/.agents/skills/kite/` |

Method: shallow clone, files read as plain text. No script, installer or CLI from the repo was executed.

## Structure

One skill, `kite`, in `skills/kite/SKILL.md` (6 KB, no reference files). It is a thin instruction layer over the official Rust `kite` CLI (the repo is the CLI itself; the skill lives in `skills/`). Also present: `skills/prompt.md` (agent bootstrap) and `skills/README.md`.

## Summary table

| Skill | What it does | CLI commands called | Capability | Guardrail text |
|---|---|---|---|---|
| `kite` | Inspect a Zerodha Kite account and market data; place, modify and cancel orders, GTTs, price alerts, position conversions; stream ticks; raw API passthrough | Reads: `user profile`, `user margins`, `portfolio holdings`, `portfolio positions`, `orders list`, `orders get`, `orders trades`, `market ltp\|ohlc\|quote\|search\|resolve`, `historical candles`, `gtt list`, `alerts list`, `mf holdings\|sips\|orders`, `margins orders\|charges`, `request get`, `stream ticks`, `doctor`. Writes: `orders place\|modify\|cancel`, `portfolio convert`, `gtt place\|modify\|delete`, `alerts create\|modify\|enable\|disable\|delete`, `request post\|put\|delete` | live only (no paper or sandbox mode in the skill or CLI help text read). Read-only commands need no confirmation | "Never send a write without explicit approval. Order, GTT, alert, conversion and raw `post`/`put`/`delete` commands are dry runs unless `--confirm` is passed." "One approval covers one request." "Never sign in for the user." "Never print credentials." |

## Guardrails: model-enforced vs code-enforced

**Code-enforced (verified in the Rust source and CLI help):**

- Dry run by default on every write. `src/cli.rs` help strings say "Dry-runs unless --confirm is provided", and `src/util.rs` builds a `dry_run_request` display for the write paths. With `--json` the dry run returns `"dry_run": true` plus `method`, `path` and `body`. An agent that forgets the approval step still sends nothing until it adds `--confirm`.
- Alert modify, enable and disable read the stored alert first so the dry run shows the exact request.
- Session tokens expire daily, which bounds the blast radius of a leaked session.

**Model-enforced only (SKILL.md text, nothing in code behind it):**

- That the agent adds `--confirm` only after the user approved that specific request in the conversation. The flag is a plain boolean; nothing ties it to a human reply. An agent that runs the dry run and `--confirm` back to back succeeds.
- "One approval covers one request" (no token or nonce).
- Never run `kite auth login`, never ask for user ID, password or 2FA. The CLI would accept them; the rule is behavioural. The bootstrap `prompt.md` repeats it.
- Never read or print `config.json`, `KITE_ACCESS_TOKEN`, `KITE_API_KEY`. Nothing blocks the agent from `cat`-ing the config file.
- Do not log out, do not open the TUI.
- After a timed-out confirmed write, check `orders list` before retrying (prevents double orders; advice only).

## Secrets and file access

- Credentials live in `config.json` under the CLI's config dir (written by `kite auth login`, `src/commands/auth.rs`). Env overrides: `KITE_API_KEY`, `KITE_ACCESS_TOKEN`, `KITE_USER_ID`, `KITE_CONFIG`, `KITE_API_ROOT`, `KITE_TICKER_URL`.
- The skill itself reads no files, but `allowed-tools` is not set, so the agent runs whatever shell it likes. The no-print rule is the only barrier to the token file.
- Install path runs a remote shell installer (`curl | sh`) and fetches the skill from `main` unpinned, so the guardrail text itself can change upstream without a version bump. `kite upgrade` re-runs the official installer.

## Gap list

1. `--confirm` is a flag, not a human-bound token. Dry run is real, but approval is honour system.
2. No paper or sandbox mode documented for the CLI; every approved write is a real order.
3. Raw `request post|put|delete` is an escape hatch for any Kite write; it follows the same dry-run rule.
4. Skill fetched from `main` with no pin or checksum (only the binary archive is checksummed, per README).

## Full SKILL.md (MIT)

Reproduced verbatim from `skills/kite/SKILL.md` at commit `940c10f1ddcdd5297cb67b4dce893cd1bed722e0` of https://github.com/zerodha/kite-cli, licensed under the MIT License (Copyright (c) 2026 Zerodha Technology Pvt. Ltd.). Text unmodified; punctuation inside the block is the original's.

~~~~markdown
---
name: kite
description: Use the `kite` CLI to inspect a Zerodha Kite account and market data (holdings, positions, order book, trades, margins, quotes, historical candles, instrument search, GTTs, price alerts, mutual funds). Use when the user asks about their Zerodha or Kite portfolio, P&L, mutual funds, a stock price, historical data, or wants to script Kite data with `--json` and jq.
---

# kite CLI

`kite` is the official command-line client for Zerodha Kite. It acts on the user's live trading account. Treat every write as a real-money action.

## Safety rules

1. **Never send a write without explicit approval.** Order, GTT, alert, conversion and raw `post`/`put`/`delete` commands are dry runs unless `--confirm` is passed. Run the dry run first, show the user the exact request, and add `--confirm` only after the user approves that specific request in this conversation. One approval covers one request.
2. **Never sign in for the user.** `kite auth login` asks for a user ID, password and 2FA code. Do not run it, and never ask for, type, pipe or store those values. If a command fails with `MissingSession` or `session expired`, ask the user to run `kite auth login` in their own terminal.
3. **Never print credentials.** Do not read or print `config.json`, the access token, or `KITE_ACCESS_TOKEN` / `KITE_API_KEY`.
4. **Do not log out** (`kite auth logout`) unless the user asks.
5. **Do not open the TUI** (`kite` with no arguments, or `kite tui`). It is interactive and an agent cannot drive it.

## Before you start

```sh
kite --version
kite --json doctor | jq -e .ok    # exit 0 = installed, configured and signed in
```

Sessions expire every day. A failed `doctor` usually means the user must run `kite auth login`.

## Output contract

- Add `--json` (global flag, any position) for machine output. Prefer it whenever you parse results.
- With `--json`, success prints Kite's `data` payload unchanged on stdout. Errors print `{"ok": false, "error": {"type", "message"}}` on stdout.
- Exit codes: `0` success (includes dry runs and empty results), `1` runtime or API error, `2` usage error (bad flag or command; plain text on stderr even with `--json`).
- Without `--json`, output is a human table. Totals and derived columns in tables (for example combined demat + MTF quantity) are not in the JSON.
- Run `kite <command> --help` when unsure of a flag. The help text is the source of truth.

## Read commands

| Task | Command |
| :--- | :--- |
| Profile | `kite --json user profile` |
| Funds and margins | `kite --json user margins [--segment equity\|commodity]` |
| Holdings | `kite --json portfolio holdings` |
| Positions (`net` and `day` arrays) | `kite --json portfolio positions` |
| Today's orders | `kite --json orders list [--status OPEN] [--tradingsymbol INFY]` |
| One order's history | `kite --json orders get <ORDER_ID>` |
| Trades | `kite --json orders trades [--order-id <ORDER_ID>]` |
| Last price | `kite --json market ltp NSE:INFY NSE:TCS` |
| OHLC + LTP | `kite --json market ohlc NSE:INFY` |
| Full quote with depth | `kite --json market quote NSE:INFY` |
| Find an instrument | `kite --json market search "infosys" [--exchange NSE] [--limit 5]` |
| Instrument token and metadata | `kite --json market resolve NSE:INFY` |
| Historical candles | `kite --json historical candles --instrument-token 408065 --interval day --from "2026-01-01 00:00:00" --to "2026-03-31 23:59:59"` |
| GTT triggers | `kite --json gtt list` |
| Price alerts | `kite --json alerts list` |
| Mutual funds | `kite --json mf holdings`, `kite --json mf sips`, `kite --json mf orders` |
| Order margin and charges | `kite --json margins orders ...`, `kite --json margins charges ...` (see `--help`) |
| Any other GET endpoint | `kite --json request get /path -q key=value` |

Instruments are written `EXCHANGE:TRADINGSYMBOL` (`NSE:INFY`, `NFO:NIFTY26OCT25000CE`, `NSE:NIFTY 50`). Historical candles need the numeric `instrument_token`: get it from `market resolve` (`.matches[0].instrument_token`). Intervals: `minute`, `3minute`, `5minute`, `10minute`, `15minute`, `30minute`, `60minute`, `day`.

Examples:

```sh
# Holdings as symbol, quantity, last price
kite --json portfolio holdings | jq -r '.[] | [.tradingsymbol, .quantity, .last_price] | @tsv'

# Open positions with P&L
kite --json portfolio positions | jq -r '.net[] | select(.quantity != 0) | [.tradingsymbol, .quantity, .pnl] | @tsv'

# Count open orders
kite --json orders list --status OPEN | jq length
```

## Write commands (dry run first)

```sh
kite orders place --exchange NSE --tradingsymbol INFY --transaction-type BUY \
  --order-type LIMIT --quantity 1 --product CNC --price 1500 --validity DAY
```

This prints the exact request and sends nothing. With `--json`, the dry run is an object with `"dry_run": true`, `method`, `path` and `body`. Show it to the user. After the user approves, run the identical command with `--confirm`.

Writes that follow this rule: `orders place|modify|cancel`, `portfolio convert`, `gtt place|modify|delete`, `alerts create|modify|enable|disable|delete`, `request post|put|delete`.

If a confirmed write times out, its outcome is unknown. Check `kite --json orders list` (or the matching list command) before you retry, so the order is not placed twice.

## Live ticks

```sh
kite --json stream ticks NSE:INFY --limit 5
```

Prints one JSON object per line. By default it stops after 10 ticks or 30 seconds. Never set both `--limit 0` and `--timeout-seconds 0`, because the command then runs until it is killed.

## Troubleshooting

- `MissingSession` or `session expired`: ask the user to run `kite auth login`.
- `CloudflareBlocked`: the request was blocked before it reached Kite. Wait and retry later; do not loop.
- `InputException` and other Kite error types: Kite rejected the request. Show the user the message; do not guess new parameters for a write.
- Instrument not found: run `kite market cache refresh`, then search again.
~~~~
