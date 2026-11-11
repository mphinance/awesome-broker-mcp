# Questrade community agent skill (agustinsacco/questrade-mcp)

> **Caution: unvetted community repo that handles brokerage credentials.** This is one person's project, not Questrade's. It stores a Questrade refresh token on disk and rotates it for you. We read the files. We did not run, install or connect anything. Review the code before you give it a token.

| | |
|---|---|
| Repo | https://github.com/agustinsacco/questrade-mcp |
| Commit | `d7320612fe0ccef34971e962886940aa4a0a9dce` (committed 2026-11-08) |
| License | MIT (`LICENSE`, "Copyright (c) 2026 Agustin Sacco"; GitHub reports MIT) |
| Date scraped | 2026-11-11 |
| Install | Claude Code: `claude mcp add --scope user questrade -- npx -y @saccolabs/questrade-mcp`, then sign in with `npx -y @saccolabs/questrade-mcp login`. One step that also links the skill into `~/.claude/skills/`: `npx -y @saccolabs/questrade-mcp setup`. pi: `pi install npm:@saccolabs/questrade-mcp`. |
| Skills | 1: `questrade-portfolio` |

Method: shallow clone read as plain files. No script, installer or CLI from the repo was executed.

## Why there is no full SKILL.md here

The repo is MIT, but our policy reproduces a full `SKILL.md` only for trading skills. This one cannot trade (see below), so this page has a detailed summary and short quotes. The original is at https://github.com/agustinsacco/questrade-mcp/blob/d7320612fe0ccef34971e962886940aa4a0a9dce/skills/questrade-portfolio/SKILL.md (5.8 KB).

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `questrade-portfolio` | Read-only Questrade data: accounts, balances, positions, activities (trades, dividends, deposits, fees), executions, order history, quotes, option chains with Greeks, candles, technicals, cross-account reports. Explains how the user signs in. | MCP, 19 tools: `qt_get_context`, `qt_list_accounts`, `qt_get_balances`, `qt_list_positions`, `qt_list_activities`, `qt_list_executions`, `qt_list_orders`, `qt_get_order`, `qt_search_symbols`, `qt_get_symbols`, `qt_get_quotes`, `qt_list_markets`, `qt_get_option_chain`, `qt_get_option_quotes`, `qt_get_candles`, `qt_compare_symbols`, `qt_analyze_technicals`, `qt_screen_watchlist`, `qt_run_report`. CLI the skill may run: `node <package>/bin/questrade-mcp.js check` and `secrets list`. | **Read only.** No paper mode, no order tools. | "No tool places, changes or cancels orders" and "Never suggest that a trade was made." Secrets rules below. |

## Guardrails: what is model-enforced and what is code-enforced

**Code-enforced (verified in `src/`):** the server has no order-writing tool. The only non-GET call in the client is a POST to `/v1/markets/quotes/options` (an option quote lookup). Questrade itself grants trading only to partner apps, which the README and the skill both say. Even a fully compromised agent cannot place a trade through this server, though it can read everything in your accounts.

**Model-enforced only (prose in the skill):**

- "Never ask for a token in the chat, and never accept one pasted there." Nothing in the server stops a user pasting a token to the model; the instruction is what keeps the model from asking.
- "Never run `login`, `logout` or `secrets set` yourself." These are CLI commands the agent could shell out to. The skill forbids it, and nothing enforces it. `login` takes the token at a hidden terminal prompt, so an agent that ran it would hang rather than see the token, but the rule is still prose.
- The permission to run `check` and `secrets list` is an allowance, and the skill says they "never print token values". That is a property of the CLI, which we read about but did not run.
- Answering hygiene: state the account, date range and currency; separate dividends, open P&L and deposits; treat market data as information, not advice.

## Secrets, tokens and files

This is where the risk is, so it gets its own list:

- **Token file:** `~/.config/questrade-mcp/credentials.env`, mode 600, override with `QUESTRADE_CREDENTIALS_FILE`. It holds a live Questrade refresh token. Anything that can read that file can read your accounts.
- **Token rotation:** each Questrade refresh token works once; the server writes the next one back immediately (atomic write: temp file, fsync, rename, chmod 600) under a lock file shared between processes, and refreshes every 25 minutes while running.
- **Background refresh:** the server keeps the token chain alive on a timer. Turn it off with `QUESTRADE_MCP_NO_KEEPALIVE`.
- **Sign-in:** the user generates a token in Questrade's API Centre and pastes it at a hidden prompt via `login`. The skill tells the model to refuse tokens pasted in chat and to treat one as exposed if the user does paste it.
- **Setup command:** `setup` edits your Claude Code config (`claude mcp add`) and links the skill into `~/.claude/skills/questrade-portfolio`. It shows each change and asks first; `--yes` skips the asking.
- **HTTP transport:** optional, defaults to `127.0.0.1:8788/mcp` with a loopback host allow-list (`QUESTRADE_MCP_ALLOWED_HOSTS`).
- **Skill file reach:** the skill assumes the CLI sits "two directories above this skill's folder", so the model is invited to run a script from the package path. Nothing else the skill instructs touches files.

## Per-skill notes

### `questrade-portfolio`

Starts every session with `qt_get_context`, which works before sign-in and returns the sign-in command with this machine's real path. With several accounts and no default it requires `accountId` on every call and says tools "refuse to guess". Symbols use `.TO` for TSX listings. Date ranges default to the last 30 days and the server splits longer ranges into 30-day requests. Amounts are never converted between CAD and USD. The skill admits realized gains per tax lot are not available.

Gaps worth knowing: no paper account, no watchlists, no streaming, and quotes can be delayed depending on your market-data subscription.

## Verdict

The safest of the community broker skills in this set for the thing most people worry about, since it cannot place an order. The exposure is the token file and a long-lived refresh chain. Keep the file at mode 600, run it on a machine you control, and revoke the authorization in Questrade's API Centre if you stop using it.
