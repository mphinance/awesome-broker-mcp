# Bitget agent-mcp: no bundled skills, two MCP prompts

| | |
|---|---|
| Repo | https://github.com/Bitget-AI/agent-mcp |
| Commit | `486a7c5b2769e452bc7d3b39337cb6d3f9b1a0d3` (committed 2026-09-01) |
| License | MIT (`LICENSE`, "Copyright (c) 2025 Bitget"; `package.json` and `server.json` also say MIT) |
| Date scraped | 2026-11-11 |
| Install | `npx -y @bitget-ai/bitget-agent-mcp` as an MCP server with `BITGET_API_KEY`, `BITGET_SECRET_KEY`, `BITGET_PASSPHRASE` in the host's `env`. The README's "One-Step Install" is a prompt you paste into your agent so that it edits your MCP config and fills in the credentials. |
| Skills found | **0.** No `SKILL.md` anywhere in the repo. |

Method: shallow clone, read as plain files (source is 444 lines of TypeScript, plus README, CHANGELOG, `llms.txt`, manifests). Nothing was executed or installed.

## Result: it is a server, not a skill pack

`agent-mcp` is a thin stdio MCP adapter over `@bitget-ai/bitget-agent-sdk` (a separate npm package, **not in this repo and not read**). Its README says it is "Part of Bitget Agent Hub" (https://github.com/Bitget-AI/agent_hub), "including the CLI, SDK, installer, and market-analysis skills". Any official Bitget skills live there, not here. We did not scrape `agent_hub` for this page.

What the repo ships instead of skills:

1. **The `initialize` instructions** (`buildInstructions` in `src/server.ts`), a briefing the host injects into the model: the discover, drill down, execute workflow, the write-safety rule, and the live session posture (`surface`, `modules`, `readOnly`, `paperTrading`, `authenticated`).
2. **Two MCP prompts**, read-only workflow starters, which are the nearest thing to skills. Both are in the table below.

Tool surface: 14 intent verbs (default load is 12 verbs plus `discover` and `raw`, 14 tools) fronting 89 default endpoints. Default modules `account,trade,market`; on demand `strategy`, `cryptoloans`, `tax`. Verbs: `market`; `order`, `position`, `strategy_order`; `account_overview`, `account_config`, `repayment`, `transfer_funds`, `deposit`, `withdraw`, `funds_records`, `subaccount`; `loan`; `tax`. `raw` reaches any v3 operation by `operationId`.

## Summary table

| Skill (prompt) | What it does | Tools / CLI called | Capability | Guardrail text and enforcement |
|---|---|---|---|---|
| `account_snapshot` (MCP prompt) | Balances, open positions, working orders summary | `account_overview({})`, `position({action:"info"})`, `order({action:"open"})` | read | "Do not place, modify, or cancel anything." Model-enforced; the verbs it names are read actions |
| `pre_trade_check` (MCP prompt, args `symbol`, optional `category`) | Price, exposure and balance check before an order | `market({action:"tickers"})`, `position`, `account_overview` | read | "Recommend a size, but do not place the order until I confirm." Model-enforced |

Both prompts are MIT and short; full text of their templates (from `src/server.ts`, joined with spaces):

~~~~
account_snapshot:
Give me a concise snapshot of my Bitget Unified Trading Account. Call account_overview({}) for balances, position({ action: "info" }) for open positions, and order({ action: "open" }) for working orders. Summarize equity, exposure, and anything that needs attention. Do not place, modify, or cancel anything.

pre_trade_check:
Before I trade <symbol>[ in category <category>], do a safety review. Check the current price via market({ action: "tickers", symbol: "<symbol>" }), my existing exposure via position({ action: "info" }), and my available balance via account_overview({}). Flag liquidation risk, insufficient margin, or an oversized order. Recommend a size, but do not place the order until I confirm.
~~~~

## Guardrails: what is enforced and what is not

The safety logic lives in the SDK dependency, which we did not read. What the README and the server source say about it:

**Described as code-enforced (in the SDK, unverified by us):**

- `--read-only`: "strips all write tools at startup" and rejects "any order, transfer, cancellation, or withdrawal ... before it reaches Bitget". Mutually exclusive with `--paper-trading`. This is the strongest control here and is a launch flag, so the model cannot flip it mid-session.
- `--paper-trading`: routes signed requests to Bitget's Demo Trading environment with the `paptrading: 1` header. Needs a separate Demo API key. Real paper mode, off by default.
- A risk tier (`riskLevel`: read, write, high) that drives MCP tool annotations, so hosts can flag destructive tools ahead of the call.
- Client-side retry and rate-limit policy against API loops.

**The confirmation gate is a model-supplied argument.** "Ordinary writes execute immediately." High-risk operations (README examples: `cancelAll`, `withdraw`) "return `{ confirmationRequired: true }` unless you pass `confirm: true`". `confirm` is a normal tool argument. The model can pass `confirm: true` on its first call, and no host dialog, MCP elicitation or out-of-band user step is involved in what we read. Compare MEXC, where the CLI refuses without a terminal and the MCP path uses host elicitation. In practice this gate stops an accidental call and does not stop a model that decides to confirm for itself. Everything the README does not call high-risk, including spot and futures orders, margin and leverage changes and `transfer_funds`, runs with no gate at all.

**`dryRun: true`** works on any write ("a no-network preview"), but nothing makes it a prerequisite.

## Flags

- **`withdraw` and `deposit` verbs in the default profile.** `withdraw` is loaded by default in the `account` module, behind the model-suppliable `confirm: true`. With a Bitget API key that has withdrawal permission and no address whitelist on the Bitget side, an agent can move funds off the exchange. The README tells you to enable "Read + Trade" permissions only; keep it that way, and keep withdrawal permission off.
- **Secrets in the MCP config.** Credentials go in plaintext in the host's JSON config `env`. The one-step install prompt tells the agent to "add a server ... with BITGET_API_KEY, BITGET_SECRET_KEY, and BITGET_PASSPHRASE filled in", which means the keys pass through the conversation if you paste them to it. Edit the config yourself instead. The server itself reads keys from environment variables and says it never logs, writes or proxies them (README claim, unverified in the SDK).
- **Signing:** done in the SDK in-process (HMAC-SHA256), not by the model.
- **Self-updating code:** `llms.txt` says "Auto-updates on every start via `npx -y`", and the documented command is unpinned `npx -y @bitget-ai/bitget-agent-mcp`, which pulls the newest published version and the SDK's `^3.0.0` range each launch. Pin a version if you want a stable review target.
- **`raw` escape hatch:** reaches any v3 operation by `operationId`, including operations outside the verb groups. README: "rarely needed". `--read-only` still applies.
- **Hidden modules:** the CHANGELOG mentions `broker` and `instloan` modules hidden from `all`. Not enabled by default.
- **Telemetry:** the README states "no telemetry". The SDK's lifecycle hooks (request, response, retry, error) are forwarded to the host as MCP log notifications only.

## Bottom line for this repo

Good launch-time switches (`--read-only`, `--paper-trading`) and no key handling by the model, but no skill content to audit and a confirmation flag the model can set itself. If you want an agent on Bitget today: run with `--paper-trading` first, then `--read-only`, and only add live write access with a trade-only key and no withdrawal permission.
