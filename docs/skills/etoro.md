# eToro agent skills: server-published skill file plus etoro-builders/etoro-agent-skills

Two different surfaces. The first is eToro's own MCP server publishing its skill file. The second is a GitHub skill pack under the `etoro-builders` org whose README points to the official eToro developer portal, but this scrape could not confirm the org is run by eToro (the org profile has no name or description).

| | Server skill file (official) | etoro-builders/etoro-agent-skills |
|---|---|---|
| Source | https://mcp.public-api.etoro.com/skill (HTTP 200, `text/markdown`) | https://github.com/etoro-builders/etoro-agent-skills |
| Version or commit | skill version `1.23.17`; 87,489 bytes; SHA-256 `2414174a235982475d34adf18c60e37962de81d95f8b45c36bc9638ea4ef1ab2` of the body as fetched 2026-11-11 | commit `0d78c0cbeab4373c76e1855fcbde963bb97b5929` (committed 2026-04-30) |
| License | none stated in the file | none (no LICENSE file; GitHub API reports none) |
| Install | `claude mcp add --transport http etoro-public-api https://mcp.public-api.etoro.com` (from the skill file itself; also lists Cursor, VS Code, Windsurf, JetBrains, Cline, Zed) | No install command given. README: plain markdown, "deployable into any agent runtime that loads markdown skills"; load `etoro-trading-assistant` first, add `etoro-agent-portfolios` when relevant |
| Date scraped | 2026-11-11 | 2026-11-11 |

Method: the server skill file was fetched with a single HTTP GET and read as text; the repo was shallow-cloned and read as plain files. No script, installer or CLI was executed, and no authenticated MCP call was made.

Because neither source states a license, no SKILL.md is embedded here. The sections below are detailed summaries with short verbatim quotes.

## Structure

**Server skill file** (`etoro-public-api-operations`, 87 KB, one file): documents seventeen MCP tools. Discovery: `get-tags`, `get-all-routes`, `get-route-spec`. Execution: `execute-read`, `execute-write`. Convenience reads: `get-my-profile-and-scopes`, `get-instruments-overview`, `get-my-portfolio-summary`, `get-my-balances`, `get-my-watchlists`, `get-trader-profile-summary`, `get-my-positions-and-orders`, `get-my-trading-history`. Trading pairs: `prepare-trade` and `place-trade`, `prepare-close` and `place-close`. It also has a phased workflow (discovery, auth, build and confirm, execute and report) and a fallback flow for older server deployments.

**etoro-builders pack** (2 skills, about 171 KB with references): `etoro-trading-assistant` (15 KB plus 10 reference files covering single trade, bulk build, rebalancing, conditional rules, account snapshot, ID resolution, API conventions, SSO and session, execution invariants, examples) and `etoro-agent-portfolios` (12 KB plus an onboarding reference). Written for a runtime agent acting for an end user (for example a chatbot in an app), not for a coding assistant.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `etoro-public-api-operations` (server skill file) | Discover and call the eToro Public API: portfolio, balances, instruments, watchlists, trader profiles, open and close positions | the 17 MCP tools above | read, demo write, real write | `account` is "REQUIRED, no default" on prepare tools; prepare then place with a signed token; "confirmation gate" on every `execute-write` |
| `etoro-trading-assistant` (repo) | Open, close, modify positions; market and limit orders; bulk build; rebalance; conditional or triggered rules; live prices | eToro Public API over HTTP (`GET /trading/info/{env}/pnl`, trading execution routes), or the MCP | read, demo write, real write | confirm before open, close, cancel, modify; at-most-once delivery; stop on 401; four execution invariants |
| `etoro-agent-portfolios` (repo) | Create and operate agent-portfolios (dedicated copy-traded accounts mirrored into the user's main account) | Public API, onboarding flow, `userToken` | real only | percentages of equity for user-facing numbers; always real environment |

## Guardrails: what is model-enforced and what is code-enforced

**Code-enforced on the server (per the skill file's own description of the tools; not tested here):**

- `prepare-trade` and `prepare-close` are described as "Read-only and idempotent" and mint a short-lived signed token (about two minutes) that seals the exact order. `place-trade` and `place-close` take only that token. The server "verifies the signed token first", binds it to the connection's credentials, and rejects an expired, tampered or wrong-connection token with nothing sent. The idempotency key is sealed in the token. `prepare-trade` also checks eligibility, live quote, cost breakdown and available balance, and withholds the token on hard failures. This means the agent cannot place an order that differs from the one prepared, and cannot place without a prepare step.
- API-key scopes (`real:read`, `money.balance:read` and so on) limit what a connection can do. `get-my-profile-and-scopes` reports them.
- The Public API enforces a trade-execution rate limit that the repo skill puts at 20 requests per minute.

**Model-enforced (skill text only):**

- The approval itself. The skill says to show the user the `confirmation` block, get "a clear 'yes' to THIS confirmation, not a standing instruction", then call `place-trade` once per approval. Nothing in the token proves a human said yes; an agent can call `place-trade` straight after `prepare-trade`.
- `execute-write` (the generic route executor, used for everything the pair does not cover) has the same confirmation requirement, but as prose only: "show the user the exact resolved request (path, method, body, account type) and get an explicit 'yes' BEFORE sending".
- Environment choice. `account` has no default on `prepare-trade`; the skill says to ask if unclear and "recommend demo for first tries". In the repo pack the opposite approach is taken: "Determine environment from the key, don't ask the user" by probing `GET /trading/info/real/pnl` (200 means real key, 403 means demo key).
- 401 handling: stop the workflow and do not fabricate execution.
- Repo skill: "Confirm before destructive actions. Any open / close / cancel / modify requires explicit user confirmation, unless the user has already opted into recurring rebalancing or conditional rules". Conditional rules (agent-side polling, with `max_triggers` caps and cooldowns) therefore run without per-trade confirmation once the user has set a rule. Standing authorization is a built-in escape from the confirmation rule.
- Repo skill style rule: "Stay completely silent between confirmation and result". The agent is told not to narrate progress between the user's yes and the outcome.

Flags and gaps:

- The server skill file and the repo pack disagree on mechanics. The server file mandates `prepare-trade`/`place-trade` and says "never open positions via `execute-write` when this tool exists". The repo pack (dated 2026-04-30) describes HTTP-route workflows (`/trading/info/{env}/pnl` and execution endpoints) and has no mention of the token pair. The repo pack is older and appears to pre-date it.
- The directory entry `brokers/etoro.md` already records the eToro tool count dispute (two tools on builders.etoro.com versus seventeen in the server skill file). This file does not resolve it.
- The server skill file embeds a skill version string and tells the agent a stale skill is "an informational nudge only"; it is served live and changes (1.21.1 on 2026-10-12, 1.23.17 on 2026-11-11 per the directory entry), so any copy is a snapshot.
- No spend cap, notional limit or daily-loss limit in the skill text; bulk workflows use "ceilings on allocations" computed from frozen equity and cash anchors, not from a user-set limit.
- Agent-portfolios are real-money only; there is no demo mode for that product.

## Per-skill notes

### etoro-public-api-operations (server skill file)

Phase 0 handles questions about the user's own portfolio with convenience tools and no route discovery. Opening a position is `prepare-trade` (direction `buy` or `sellShort`; order type `mkt`, `mit` with `triggerRate`, or `limitIOC` with `limitRate` within 10 percent of market; leverage above 1 requires a stop loss), showing the confirmation block including `warnings` (soft findings such as a W-8BEN requirement or market-closed behavior), then `place-trade` with the token. An expired token means re-prepare and re-show, never retry. `place-trade` polls the order server-side for up to about 30 seconds and returns an `outcome` (`executed`, `partiallyFilled`, `rejected`, `cancelled`, `expired`, `pending`, `unknown`). `pending` means accepted and waiting, "NEVER place again". Closing mirrors this with `prepare-close` and `place-close`. Credentials live in the MCP server entry's headers, not in tool calls.

### etoro-trading-assistant (repo)

Behavior norms: talk in "bottom lines, not mechanics" (no HTTP codes or endpoint paths shown to the user); confirm intent before action and give a verified outcome after; main accounts use absolute dollar amounts. Workflows: single trade (intent capture, ID resolution, pre-flight cash check, confirmation, execution, verification), bulk portfolio build, rebalancing (close then open, with a 10-second PnL cache wait between phases), and conditional rules (rule shape, polling cadence of 10 to 30 seconds for P&L triggers, cooldowns, per-rule trigger cap). The four execution invariants (`references/execution-invariants.md`): anchor freeze (equity and cash read once per workflow), ceilings on allocation, at-most-once delivery, never hallucinate on a 401.

### etoro-agent-portfolios (repo)

Adds the agent-portfolio product concept, the onboarding flow (API key collection, portfolio creation, secret-token handoff) and one override: user-facing numbers are percentages of equity, never dollar amounts. The foundational skill says this override is enforced inside its own output-style rule, and treats dollar leakage on agent-portfolios as a defect.
