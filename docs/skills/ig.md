# IG: agent skills (IG-incubator/IG-Skills)

| Field | Value |
|---|---|
| Repo | https://github.com/IG-incubator/IG-Skills (directory `skills/ig/`) |
| Commit | `71e68ea9fa9e3a2cda09a168526745f04cc55352` (2026-03-11, "Formalise README language", only history shown by `git log`) |
| License | MIT. Each skill folder ships a `LICENSE.md` reading "Copyright (c) 2026 IG Group"; each `SKILL.md` frontmatter says `license: MIT`; README says MIT. There is no root `LICENSE` file, and the GitHub API reports `license: null` for the repo. Redistribution permitted with the notice retained. |
| Scraped | 2026-11-11 |
| Skill count | 4 (`spot`, `market-data`, `account`, `watchlist`) |
| Install | None provided. README and `AGENTS.md` tell you to point your agent at the `SKILL.md` files (the LangChain example loads `skills/ig/<name>/SKILL.md`). Copy a folder into your agent skills directory. |

Nothing in the clone was executed. Files were read only.

## Provenance and relationship to IG's official MCP

- These skills are not shipped by IG's hosted "IG Trading: CFD Assistant" (`brokers/ig.md`), which is read-only and ChatGPT-only. They are REST-API skill definitions for the IG Labs trading API and have no MCP server in the repo. `AGENTS.md` shows a Claude Desktop config launching `node ig-mcp-server/index.js`, but no `ig-mcp-server` directory exists in the repo.
- Account facts re-checked on 2026-11-11 with `gh api`: `IG-incubator` is a `User` account (not an organization), no name, company or email set, created 2026-03-10; the repo was created 2026-03-10 and last pushed 2026-03-10, 0 stars.
- New evidence that bears on the "unverified" note in `brokers/ig.md`: the single commit's author is `Myer Raymond <myer.raymond@ig.com>`, the LICENSE files say "IG Group", and the frontmatter author is `IG-Aus`. That is consistent with IG staff authorship but does not verify it; GitHub account type and the lack of any IG link remain unchanged. Do not treat as official IG without confirmation from IG.
- Frontmatter in all four skills: `version: "1.0.0"`, `author: IG-Aus`.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| spot | Open and close CFD and spread bet positions, working orders, stop and limit edits, deal confirmation | REST: `GET /positions`, `POST /positions/otc`, `DELETE /positions/otc/{dealId}`, `PUT /positions/otc/{dealId}`, `GET /workingorders`, `POST /workingorders/otc`, `PUT` and `DELETE /workingorders/otc/{dealId}`, `GET /confirms/{dealReference}` | live trade (demo or live, by which base URL the agent uses) | Section "Safety": "Always confirm trades before execution", "Use DEMO environment for testing", "Set stop-losses on every position", "Check available margin before trading", "Verify market hours before placing orders" |
| market-data | Market search, prices, history, client sentiment | `GET /markets?searchTerm=`, `GET /markets/{epic}`, `GET /prices/{epic}`, `GET /prices/{epic}/{resolution}/{start}/{end}`, `GET /clientsentiment/{marketId}` | read | None needed. Lists rate limits: search 30 per minute, weekly historical datapoint cap. |
| account | Accounts, balances, margin, activity, transactions | `GET /accounts`, `GET /accounts/preferences`, `GET /history/activity`, `GET /history/transactions` | read | None needed. |
| watchlist | Create and edit watchlists | `GET`, `POST`, `PUT`, `DELETE /watchlists...` | read plus account-state writes (no trading) | None. Includes delete watchlist. |

## Repo-level safety text (AGENTS.md, MIT)

`AGENTS.md` is not a skill but carries the real guardrails. All of them are example Python in a markdown file, not enforced anywhere:

- "Always default to DEMO" (`os.getenv("IG_ENVIRONMENT", "DEMO")`, with `require_explicit_confirmation = True` for LIVE).
- "Always confirm before execution": the example `place_order` asks the user and accepts only the literal `CONFIRM`.
- Size limits: example `MAX_POSITION_SIZE = {"DEMO": 100, "LIVE": 10}`.
- Credential hygiene: never log credentials, `MASKED_FIELDS = ["password", "api_key", "CST", "X-SECURITY-TOKEN"]`.
- Rate limits: trading 1 per second, non-trading 30 per minute, historical weekly cap.
- Test cases: `Buy 1 lot of EUR/USD -> Requires confirmation`, `Close all positions -> Requires confirmation`.
- The README repeats that trading CFDs and spread bets carries risk and users are solely responsible.

## Guardrail gaps

1. Every safety rule is model-enforced or example code. The skill is a prompt that maps English to REST calls (README example: "Buy 1 share of Tesla" becomes `POST /positions/otc` with `{epic, direction, size}`).
2. The skill has no DEMO/LIVE switch of its own. It is whichever base URL the agent was configured with (`https://demo-api.ig.com/gateway/deal` in the AGENTS.md example).
3. Auth wants IG username, password and API key in a config or environment (AGENTS.md "Configure API Access"). This is the same plaintext-credential concern noted for the community IG MCP in `brokers/ig.md`.
4. The `spot` skill says to set stop-losses on every position but `stopLevel` and `limitLevel` are optional parameters in its own table, and nothing blocks an order without them.
5. "Close all positions" is a test case that requires confirmation, but the skill has no bulk close tool. The model would loop over `DELETE /positions/otc/{dealId}`.
6. No guarded-order limits (size, notional, instrument allowlist) other than the sample `MAX_POSITION_SIZE` dict in AGENTS.md.

## Skill details

### spot

Capability: live trade. Full text follows (MIT, Copyright (c) 2026 IG Group per the skill's `LICENSE.md`).

Full SKILL.md (verbatim):

~~~~markdown
---
name: spot
description: Execute CFD and spread betting trades on the IG Platform. Open and close positions, place working orders, manage stop-losses and take-profits. Use this skill when the user wants to buy, sell, trade, or manage positions.
metadata:
  version: "1.0.0"
  author: IG-Aus
license: MIT
---

# Spot Trading

Execute trades and manage positions on the IG Trading Platform.

## Capabilities

- Open positions (market orders)
- Close positions (full or partial)
- Place working orders (limit/stop)
- Modify stop-loss and take-profit
- View open positions and orders

## Examples

```
"Buy 1 share of Apple"
"Sell 0.5 lots of EUR/USD"
"Close my Tesla position"
"Set limit order to buy Gold at $2000"
"Add stop loss at $150 to my Apple position"
"What are my open positions?"
```

## Tools

| Tool | Endpoint | Description |
|------|----------|-------------|
| `get_positions` | GET `/positions` | List open positions |
| `open_position` | POST `/positions/otc` | Open new position |
| `close_position` | DELETE `/positions/otc/{dealId}` | Close position |
| `update_position` | PUT `/positions/otc/{dealId}` | Modify stop/limit |
| `get_orders` | GET `/workingorders` | List working orders |
| `create_order` | POST `/workingorders/otc` | Create working order |
| `update_order` | PUT `/workingorders/otc/{dealId}` | Modify order |
| `delete_order` | DELETE `/workingorders/otc/{dealId}` | Cancel order |
| `confirm_trade` | GET `/confirms/{dealReference}` | Verify execution |

## Parameters

### Open Position

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `epic` | string | Yes | Market identifier |
| `direction` | string | Yes | `BUY` or `SELL` |
| `size` | number | Yes | Position size |
| `orderType` | string | No | `MARKET` or `LIMIT` |
| `stopLevel` | number | No | Stop loss price |
| `limitLevel` | number | No | Take profit price |
| `guaranteedStop` | boolean | No | Guaranteed stop |

### Working Order

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `epic` | string | Yes | Market identifier |
| `direction` | string | Yes | `BUY` or `SELL` |
| `size` | number | Yes | Order size |
| `level` | number | Yes | Trigger price |
| `type` | string | Yes | `LIMIT` or `STOP` |
| `goodTillDate` | string | No | Expiry datetime |

## Safety

- Always confirm trades before execution
- Use DEMO environment for testing
- Set stop-losses on every position
- Check available margin before trading
- Verify market hours before placing orders

~~~~

### market-data

Capability: read. Searches markets, reads bid/ask, historical OHLC by resolution (`SECOND` through `MONTH`), and client sentiment. Includes a list of common EPICs for forex, indices, commodities and crypto, for example `CS.D.EURUSD.CFD.IP` and `IX.D.SPTRD.IFE.IP`. Not a trading skill; summary only.

### account

Capability: read. Lists accounts and reads balance, deposit, profit and loss, and available funds fields, plus activity and transaction history (types `ALL`, `ALL_DEAL`, `DEPOSIT`, `WITHDRAWAL`). Not a trading skill; summary only.

### watchlist

Capability: account-state writes only, no trading. Lists, creates, edits and deletes watchlists. Summary only.
