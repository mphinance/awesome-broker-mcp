# MEXC official CLI skills (mexc-cli)

| | |
|---|---|
| Repo | https://github.com/mexcdevelop/mexc-cli |
| Commit | `f29151fe99bba13bece6950a341c34fcfc3a0b5e` (committed 2026-11-06) |
| License | MIT. `LICENSE` ("Copyright (c) 2026 mexcdevelop"). |
| Date scraped | 2026-11-11 |
| Install | `npm install -g @mexc-ai/cli`, then `mexc skills install --agent claude-code` (also `opencode`, `codex`, `cursor`, `kiro-cli`), then `mexc doctor`. Update with `mexc update`; refresh skills with `mexc skills update`. Optional MCP server: `mexc mcp spot --read-only`. |
| Operations | 309 per the README, 63 without credentials |

Method: shallow clone, read as plain files. Nothing was executed. The CLI is a Go program with vendored dependencies; we read the README, `AGENTS.md`, the confirmation code (`internal/cli/confirm.go`, `pkg/confirmaudit`, `editions/public/adapter/confirmreport.go`), `internal/cli/skills.go`, and the skills.

## Structure

The skills are not standalone documents. They are generated from the operation registry the CLI is built from: `skills/<domain>/<sub>/SKILL.md` sits next to `api/` Go declarations, CI (`check-boundary`) enforces that each SKILL.md's frontmatter matches the code, and the SKILL.md files are embedded in the binary (`mexc skills install` writes them out). Result: skills that cannot drift from the CLI, which almost no other repo in this directory manages.

25 skills plus one authoring `skill-template`:

- **Shared (3):** `mexc-common` (error envelope, safety modes, write confirmation), `mexc-auth` (credential flow), `mexc-ws` (streaming).
- **Spot (10):** `spot/trade`, `spot/asset`, `spot/account`, `spot/grid`, `spot/dca`, `spot/convert`, `spot/fee`, `spot/marketv2`, `spot/market-search`, `spot/kline`.
- **Contract (3):** `contract/trade`, `contract/market`, `contract/account`.
- **Futures streaming (2):** `futures/market`, `futures/account` (WebSocket).
- **Earn and activity (7):** `financial-openapi/common`, `flexible`, `fixed`, `contract-hold`; `activity/online`, `reward`, `participate`.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text and enforcement |
|---|---|---|---|---|
| `mexc-common` | Error envelope, `--read-only`, write confirmation, `--dry-run` | n/a (rules) | n/a | "you MUST NOT approve it on your own", "never add `--yes` or `confirm=true` on your own initiative". The rule is prose, **the gate it describes is code** |
| `mexc-auth` | Credential setup flow | `mexc profile list`, `mexc profile use` | credential setup | "DO NOT CREATE A PROFILE. ASK THE USER TO." Code: `profile set` takes no flags, env or stdin and exits 11 with no terminal |
| `mexc-ws` | WebSocket streams | `mexc ... ws-*` | read | None needed |
| `spot/marketv2`, `market-search`, `kline` | Spot tickers, depth, klines, search | `mexc spot marketv2 ...` | read, public | None needed |
| `spot/trade` | Limit, market, stop-limit, stop-market, trailing, OCO, TP/SL attach, modify, cancel, order and fill queries | `mexc spot trade place`, `place-market`, `place-trigger`, `place-oco`, `cancel` ... | **live** | Code: write prompt, exit 10 when unattended. Prose: never auto-retry non-idempotent writes |
| `spot/asset` | Balances, deposit and withdrawal **history**, transfers between own accounts, master and sub universal transfer, bills | `mexc spot asset transfer`, `sub-transfer` | read plus **live internal transfers** | Skill states no withdrawal-to-address and no send-to-user operation exists. Graded as strong writes (Heavy) in code |
| `spot/account` | Account info | `mexc spot account ...` | read | None needed |
| `spot/fee` | Fee rates | `mexc spot fee ...` | read | None needed |
| `spot/grid` | Grid strategy parameters, create, modify, stop, **withdraw grid profit** | `mexc spot grid ...` | **live** | Same code gate. Skill: do not promise a minimum invest the model computed itself |
| `spot/dca` | DCA pairs, strategy list, pause, resume, stop, create | `mexc spot dca ...` | **live** | Same gate. "Confirm with the user before calling" on state changes (prose) |
| `spot/convert` | Quote, execute, limit convert, cancel | `mexc spot convert ...` | **live** | Same gate. Expired quote must be re-quoted, never resent (prose) |
| `contract/trade` | Perpetual orders, plan, stop, trailing, chase-limit, leverage, margin, position mode, close all, reverse, positions, funding | `mexc contract trade create`, `cancel-all`, `change-leverage`, `close-all`, `reverse` ... | **live, leveraged** | Same gate. Heavy tier for destructive non-idempotent writes |
| `contract/market`, `contract/account` | Contract market data and account reads | `mexc contract market ...` | read | None needed |
| `futures/market`, `futures/account` | WebSocket market and account streams | `mexc futures ...` | read | None needed |
| `financial-openapi/*` (4) | Flexible, fixed and contract-hold earn: products, orders, auto-pledge, redeem | `mexc financial-openapi ...` | read plus writes: flexible auto-pledge settings, contract-hold `register` | Same gate |
| `activity/online`, `reward` | Activity and reward reads | `mexc activity ...` | read | None needed |
| `activity/participate` | Register the user for an activity | `mexc activity participate register` | **live write** | Same gate. Non-idempotent, never auto-retry |

## Guardrails: what is enforced and what is not

**Code-enforced, in the CLI binary (verified in `internal/cli/confirm.go` and the README):**

1. **Write confirmation.** Any write, derived from the operation's declared access, prompts a person on a real terminal: an interactive Confirm or Cancel prompt, with the cursor starting on Cancel for destructive non-idempotent writes. If stdin and stdout are not a terminal (an agent shelling out) the CLI refuses with `confirmation_required`, exit 10, and returns the pending write. This is a hard gate, not a sentence.
2. **`--read-only`.** `--read-only` or `MEXC_READ_ONLY=true` makes every write fail with `failed_precondition`. On the MCP server it removes write tools entirely.
3. **`--dry-run`.** Prints the request, "send and sign nothing", needs no credentials. Validates a supplied `--data` body against the operation schema.
4. **MCP confirmation.** Where the host has an elicitation dialog, the user clicks it and the `confirm` argument is ignored. Only hosts without a dialog fall back to `confirm=true`.
5. **Credentials cannot be supplied by the agent.** `mexc profile set` prompts at a terminal for the Access Key and Secret Key. No flag, no environment variable, no stdin. Without a terminal it exits 11 (`interactive_required`). There is no credential environment variable at all.
6. **Signing is in the binary.** HMAC-SHA256 over method, path, sorted query, body hash and timestamp, sent as `X-MEXC-CLI-SIGNATURE`. The model never builds a signature.
7. **No raw endpoint escape hatch.** "an endpoint that has no wrapper cannot be called." The agent is limited to the 309 declared operations.
8. **No retry on non-idempotent writes.** Placements, margin changes, close-all and reverse are never auto-retried.
9. **Credential storage.** Profiles are encrypted at rest in `~/.mexc`: macOS login keychain, Windows DPAPI-wrapped key file, **Linux an unwrapped key file next to the data** ("protect `~/.mexc` like the keys").

**The gap: `--yes`.** `--yes` "is taken as the user's confirmation and nothing is asked, even in a real terminal." An agent can append it. The README tells agents not to ("Agents must not add `--yes` without the user's confirmation") and `mexc-common` says the same in capitals, so the last step is model-enforced. Also, piping a body with `--data -` makes the write unattended, so the documented pattern is `--yes` after the user confirms. The code does help: confirmations on `--yes` are recorded as `assume-yes`, distinct from a prompted or relayed approval (see telemetry below). Two further mitigations are not in the CLI: create the API key with only the permissions you need (the README says "MEXC enforces them"), and run `--read-only` whenever the task is read-only.

**Model-enforced only:** the `--yes` rule above; never pasting keys into chat ("Never ask the user to paste an Access Key or Secret Key into this conversation"); symbol spelling, id resolution, quote re-quoting and the grid and DCA sizing advice in the per-skill notes.

## Flags you asked about

- **Signed requests built by the model:** no. The binary signs. Nothing in the skills tells the model to build a signature.
- **Secrets and key files:** the cleanest design in this set. The secret never touches the model, a flag, an environment variable or stdin. The remaining exposure is on-disk: `~/.mexc` on Linux holds the encryption key beside the ciphertext, so anything that can read your home directory (including an agent with file access) can decrypt the profiles. The agent can run `mexc profile show <name>`, which masks the secret, and `mexc profile use` for switching. `profile set` and `profile keychain-downgrade` are the only commands that touch key material.
- **Confirmation telemetry to MEXC.** Found in code, not described in the README sections we read (a search of the README for "audit", "telemetry" and "report" found nothing relevant). Each write confirmation lifecycle (REMIND, CONFIRMED, CANCELLED) is POSTed to `/api/service-ai/cli-confirm/report` on MEXC's API, signed with your API key and including the command name, request path and method, API description, CLI version and an `extraInfo` blob (confirmation channel such as `tty`, `refusal`, `assume-yes` or `mcp-elicitation`, whether the session was interactive, risk tier, and an `agentSource` field). Parameters and bodies are not in the payload we read. This lets MEXC see how often an agent self-approves. Decide whether you are comfortable with it.
- **Self-updating code:** `mexc update` updates the CLI (`--check` to only check; `MEXC_CLI_NO_UPDATE_NOTIFIER=1` silences the notice). `mexc skills install` and `update` shell out to `npx -y skills ...`, which the source comments call "run unpinned", so an upstream `skills` package change is pulled at install time. npm packages are published from GitHub Actions with provenance, and release binaries ship `SHA256SUMS`.
- **Install-time code:** `npm install -g` runs a platform launcher package (`npmkit`). We did not audit it.
- **Withdrawals:** none. `spot/asset` documents that there is no way to send funds out of the user's control: no external withdrawal, no user-to-user transfer. `withdraw-history` is a read. The only fund movement is between the key's own accounts (SPOT, FUTURES, PREDICT) and master and sub accounts. Grid profit withdrawal (`spot grid withdraw-apply`) moves grid profit to the main account.
- **Paper mode:** none. The README states "This product serves ONE endpoint, so it has no env axis": no testnet, no demo, no sandbox. `--dry-run` is the only no-risk path.

## Per-skill notes

### spot/trade and contract/trade

Full text below. Worth reading in them: the `cancel` semantics (four modes chosen by which parameters you send, so a missing parameter changes the operation), "copy the symbol value off a `current-orders` row" instead of guessing a spelling, and the contract list of non-idempotent writes (`create`, `chase-limit-*`, `planorder-place-v2`, `stoporder-place-v2`, `trackorder-place`, `change-margin`, `close-all`, `reverse`) that are never auto-retried.

### spot/grid, spot/dca, spot/convert

Order-creating or strategy-creating but not plain order placement, so we summarize rather than reproduce them (they are 23 to 30 KB each, MIT licensed, at the pinned commit). Highlights: grid keeps three profit bases that must not be mixed and warns that "the minimum invest amount is still enforced server-side", so the model should not promise a figure it computed; DCA create is "not idempotent: running it again creates a second strategy"; convert quotes expire and an expired `place` must go back to a re-quote, never a resend.

### spot/asset

Skill text: "This subdomain moves funds only between accounts the API key already owns." It lists withdraw to an external wallet and send to another user as unsupported and says to stop and decline. Transfers and `sub-transfer` are graded as destructive, non-idempotent writes, so they get the strongest prompt.

## Full SKILL.md text for the core trading skills (MIT)

Reproduced verbatim from commit `f29151fe99bba13bece6950a341c34fcfc3a0b5e` of https://github.com/mexcdevelop/mexc-cli, licensed MIT, copyright mexcdevelop. Unmodified.

### spot/trade

~~~~markdown
---
name: mexc-spot-trade
scope: spot.trade
signed: yes
identity: yes
visibility: public
description: 'MEXC spot trading — place limit orders (plain, or with an attached take-profit/stop-loss), place market orders sized in the base or quote asset, place stop-limit and stop-market trigger orders, place trailing (track) orders, place OCO order pairs, modify a resting limit order, cancel orders (including a plan order by triggerId, and filtered batch cancels), query one order''s detail and fill-by-fill breakdown, query open orders, query order history, and query trades. All operations need credentials; placing/modifying/cancelling is write, queries are read. Triggers: "place spot order","stop-limit order","stop-market order","trigger order","stop loss","take profit","trailing order","track order","place OCO order","one-cancels-the-other","modify order","amend order","change order price","cancel order","query order status","order detail","order fills","deal detail","how was my order filled","query a trigger order","plan order detail","check my stop order","cancel a trigger order","cancel my plan order","cancel all my orders","batch cancel orders","open orders","order history","my trades".'
---

> Auth: this subdomain carries an openapi API key (`identity: yes`) and the CLI signs each request (`signed: yes`) with the profile secret, so a saved profile needs **both** the api key and the secret — a key alone no longer works here. It also performs writes (placing, modifying and cancelling orders). On a structured `failed_precondition` (e.g. `requires API credentials`), load the `mexc-auth` skill to prepare credentials (common error/safety rules → load `mexc-common`), then replay; this skill does not describe login.

# spot · trade (spot trading)

> The subdomain where **reads and writes coexist**: `access: read` for queries, `access: write` for placing, modifying and cancelling orders. scope marks only the resource (`spot.trade`); the action lives in the access column.

## Core Concepts

- **symbol**: a trading pair. **Do not assume a spelling — copy the `symbol` value off a `current-orders` / `history-orders` row.** The gateway that serves this sub-domain names pairs with a separator (`MX_USDT`, `BTC_USDT`) and refuses the joined form with `Invalid market name` (HTTP 400) — verified on `cancel --symbol`. The separator form is the whole `/api/cli/*` gateway's spelling, market data included, so a `symbol` you read off a row here is the one to pass to `spot marketv2` too — **verified against a live gateway**: `spot marketv2 ticker --symbol BTCUSDT` is refused with `symbol not exists` (code 30014), and `BTC_USDT` answers. Be aware that `spot marketv2 symbol-trade` does **not** refuse the joined form — it answers with a near-empty payload instead, so a wrong spelling there fails silently rather than loudly.
- **side**: `BUY` | `SELL`.
- **orderType**: the order kind, by NAME — and **which operation you call decides which names are legal**. `place` accepts the five non-conditional types: `LIMIT_ORDER` (its default), `MARKET_ORDER`, `IMMEDIATE_OR_CANCEL`, `POST_ONLY`, `FILL_OR_KILL` — but `MARKET_ORDER` is a dead end there, because `place` still requires `price` (see its block below); use `place-market` instead. `place-market` accepts **only** `MARKET_ORDER` and refuses anything else with a 400 "invalid order type". The conditional families (stop-limit, stop-market, OCO, trailing) are **not** values you pass to `place` — each has its own operation, and sending one to `place` fails with the misleading `"orderType is required"`.
- **orderId**: the exchange order id. It is the **only** order key any operation here accepts — no operation takes a client order id, so if the user gives you one, list with `current-orders` / `history-orders` and match it against the returned rows to get the exchange id first.
- **triggerId**: the id a plan/trigger placement returns. A different namespace from `orderId`, and **obtainable only from that placement response** — no listing exposes it. `deal-detail` requires it (paired with `orderType: TRIGGER_ORDER`), so keep it if you will need the plan record later. `cancel` does **not** need it: cancel by `orderId`.
- **quantity** is the amount of the **base** asset; **`amount` is its quote-asset counterpart** ("spend N USDT"). Which one you may use is decided by the operation, not by preference: `amount` exists **only on the three market-order paths** — `place-market`, `place-market-trigger`, and `place-track` in its `TRACK_MARKET_ORDER` form — and where both fields exist they are **mutually exclusive**. A **limit** order has no `amount` at all, so `place`, `place-trigger` and `place-oco` can be sized only in the base asset; converting a quote budget for those is your job (see Important Notes).

### The body-based operations (advanced order types + modify)

**Every placement is body-based.** Seven operations — all six placements (`place`, `place-market`, `place-trigger`, `place-market-trigger`, `place-track`, `place-oco`) plus `modify` — take a **JSON body on `--data`** instead of flags, and use a vocabulary of their own. Always build the body from `mexc schema spot.trade.<op>`. Only the cancels and the queries are flag-based, and `symbol` survives just in those.

Shared vocabulary:

- **Pair identification is not `symbol`.** Pass either the name pair `currency` + `market` (e.g. `BTC` + `USDT`) **or** the id pair `currencyId` + `marketCurrencyId`. One complete pair is required; a partial pair is refused as an invalid-parameter error. (`modify` needs neither — it inherits the pair from the order being modified.)
- **`tradeType`** (`BUY` | `SELL`) is the side. There is no `side` field on a placement.
- **`triggerType`** (`GE` | `LE`) is the activation direction: `GE` = activate when the price **rises** to the trigger price, `LE` = when it **falls** to it.
- **`orderSource`** records where the order came from; send `CLI`.
- **All decimal fields are strings**, so a value is transmitted exactly as written (the backend parses arbitrary precision).
- **`quantity` is a base-asset amount; `amount` is a quote-asset amount.** Where both fields exist they are mutually exclusive.
- **`memberId` is never sent** — the caller identity comes from the session.

What each one does:

| Operation | What it places | Order type field |
|---|---|---|
| `place` | A plain order, optionally with a **take-profit** (`profitTriggerPrice`) and/or **stop-loss** (`loseTriggerPrice`) attached. Omit both and it is an ordinary order. | `orderType` optional, defaults to `LIMIT_ORDER`; only non-conditional types allowed |
| `place-trigger` | One **stop-limit** order: on reaching `triggerPrice`, a limit order for `quantity` at `price` is submitted. | not accepted — fixed to stop-limit server-side |
| `place-market-trigger` | One **stop-market** order: on reaching `triggerPrice`, a *market* order is submitted (no limit price). | must be `STOP_MARKET_ORDER` |
| `place-track` | A **trailing** order that follows the market by `trackAmplitude` and submits when the price retraces by that fraction. | must be `TRACK_LIMIT_ORDER` or `TRACK_MARKET_ORDER` |
| `place-oco` | **One-cancels-the-other**: a limit leg at `price` plus a stop-limit leg (activates at `triggerPrice`, placed at `triggerLimitPrice`). Whichever activates first cancels the other. | must be `OCO_STOP_LIMIT_ORDER` |
| `modify` | Changes a resting **limit** order's `price`/`quantity` by **cancel-and-replace**, returning `{oldOrderId, newOrderId}`. | not accepted — limit orders only |

**The trigger-family operations return a trigger/plan order id (`triggerId`), not a spot order id** — and that distinction decides how you query the order afterwards:

- **A spot order IS pre-created immediately, in state `INACTIVE` ("not activated").** It is queryable right away and counts as a current order — `INACTIVE` means "pre-created, not yet live on the book", not an error and not a fill state. It becomes `NEW` on activation.
- **But the id you were handed is the `triggerId`, not that spot order's id.** To go from what you hold to the order, use `deal-detail --orderId <triggerId> --orderType TRIGGER_ORDER`, which reads the plan record itself.
- **There is no bridge back**: a row in state `INACTIVE` does **not** carry its `triggerId`, so a pre-created order cannot be matched to the plan that owns it from a listing. Keep the `triggerId` from the placement response if you will need it — `deal-detail` has no other way to reach the plan record. Cancelling does not need it (see Cancelling).
- **Once activated**, the spot order is live under its own id, and `deal-detail` (with the order's real type) or a `history-orders` listing will find it.

## Resource Relationships

```
Order
├── plain placement                            (access: write, non-idempotent)
│     ├── place                                LIMIT: price + quantity required
│     │     ├── profitTriggerPrice             take-profit leg (optional)
│     │     └── loseTriggerPrice               stop-loss leg   (optional)
│     └── place-market                         MARKET: no price; quantity OR amount
├── conditional placement                      (access: write, non-idempotent, body-based)
│     ├── place-trigger                        stop-limit:  activate -> limit order at price
│     ├── place-market-trigger                 stop-market: activate -> market order
│     ├── place-track                          trailing by trackAmplitude
│     └── place-oco                            2 linked legs, one cancels the other
│           ├── limit leg                      rests at price
│           └── stop-limit leg                 activates at triggerPrice -> triggerLimitPrice
├── modify                 cancel-and-replace a resting limit order
│                          (access: write, non-idempotent, DESTRUCTIVE, new order id)
├── cancel                 one plan order | one order | one pair | whole account
│                          (access: write, idempotent; scope = which params you send)
├── one order              deal-detail     detail + fills; the only single-order lookup,
│                                          and the only op keyed by triggerId  (access: read)
├── order lists            current-orders  open: INACTIVE / NEW / PARTIALLY_FILLED
│                          history-orders  finished: FILLED / CANCELED / PARTIALLY_CANCELED
└── fills                  deals           one row per fill, paged + filters
```

## Important Notes

- **Everything here is signed and everything needs a credential.** All twelve operations are gateway endpoints, and every one of them is signed (`signed: yes`): the CLI signs the request with the profile secret and the gateway resolves the member from the api key it carries. So a saved profile needs **both** halves — an api key alone is not enough — and `identity: yes` applies to every operation. The backend scopes each placement, cancel and lookup to the resolved member; a missing credential fails the call outright.
- **The signature covers the query on a GET/DELETE and the JSON body on a POST.** The queries and `cancel` travel in the query string, which is what gets signed; the seven body-based POSTs (the six placements plus `modify`) have their `--data` covered as well, byte for byte as sent. Nothing you pass is signed separately or needs to be — the CLI signs and sends in one step — but it does mean a placement body cannot be edited or re-serialized in flight, so build it once and send it as is.
- **Reads and writes in the same domain**: the action is in the access column; scope is always the resource `spot.trade`.
- **Write semantics differ**: every placement (`place`, `place-market`, `place-trigger`, `place-market-trigger`, `place-track`, `place-oco`) and `modify` are **non-idempotent**, so they are **never auto-retried** on a transient failure — a lost response could mean the order already landed. `cancel` is **idempotent** (safe to repeat). Declared in `./api/trade.go`; feeds the MCP safety hints. Note that idempotent says nothing about **scope** — `cancel` covers anything from one order to the whole account depending on its parameters, so read its block below before calling it.
- **`modify` is the only destructive write** — see its block below before using it.
- **Before placing an order**, fetch the pair's order limits/precision with `spot marketv2 symbol-trade` and the current price with `spot marketv2 ticker`. Both take the **separator** symbol (`BTC_USDT`) — the same spelling this subdomain uses, not the joined form their own `--symbol` help text suggests — and both are signed gateway reads, so they need the credential this subdomain already requires; there is no credential-free way to look this up.
- **No batch placement.** There is no multi-order endpoint here, so every placement is one order per call; place N orders with N calls (and remember none of them is auto-retried).
- **Quote-amount sizing works for market orders only.** `amount` (a quote-asset size) is declared on exactly three operations — `place-market`, `place-market-trigger`, and `place-track` as `TRACK_MARKET_ORDER` — so "spend 100 USDT on BTC" is expressible directly on those. A **limit** order has no such field — for `place` you must convert to a base `quantity` yourself: fetch the price with `spot marketv2 ticker`, divide, and truncate to the pair's quantity precision from `spot marketv2 symbol-trade`. State the computed quantity when you confirm with the user, since that rounding is yours, not the exchange's.
- **History reach is an account-level cap, not a fixed window** — see the listing section below. There is no documented "last N days" constant to plan around: the backend refuses queries that reach too far back rather than truncating them.

### Cancelling

`cancel` is the **only** cancel operation, and it reaches two things a plain per-order cancel cannot: an unactivated plan order and an OCO leg — both by `orderId`, like everything else here.

**`cancel` selects one of four modes from which parameters you send**, and the precedence is fixed. All four are intended behaviour — the parameters do not filter one query, they choose the operation:

1. `triggerId` present → cancel **that one plan/trigger order**. Wins even if `orderId` is also sent.
2. else `orderId` present → cancel **that one order**. If no such spot order exists, the value is retried as a `triggerId`.
3. else `symbolId` (preferred) or `symbol` present → cancel **that pair's** open orders, optionally narrowed by `tradeType` / `orderTypes`.
4. else nothing present → cancel **every open order in the account, across all pairs**. This is the endpoint's designed "cancel everything" form, not an error.

Because the scope is chosen by presence rather than by an explicit mode flag, **a parameter that goes missing silently widens the scope** — dropping `symbol` on a retry turns a one-pair cancel into an account-wide one. Keep the parameter set stable across retries, and state the mode you are invoking when you confirm with the user.

**The confirmation prompt does NOT name the mode for you.** It shows the operation summary — which has to enumerate all four — and then the parameters you sent, so mode 4 and mode 2 differ only in that mode 4 lists none. Mode 4 is confirmed exactly like the other three (`cancel` is a Light write: repeating it converges). So state the mode explicitly when you ask the user, and read the parameter list back as the check that nothing went missing before you relay anything.

**Cancel by `orderId`, uniformly — including for plan/trigger orders.** `current-orders` does **not** return a `triggerId` on its rows, so the only id you can act on is the `orderId` it gives you, and that id cancels every kind of order here: an `INACTIVE` pre-created plan order as much as a live `NEW` one. Do not go looking for a `triggerId` to cancel with; there is nowhere to read one from.

**`--triggerId` is the narrow case**: it is usable only when you still hold the value a `place-trigger` / `place-market-trigger` / `place-track` call returned, in this same session. It buys nothing over `--orderId` — mode 2 retries an unmatched `orderId` as a `triggerId` anyway — so treat it as an explicit alternative, not the route to prefer.

**Two things `cancel` cannot do:**

- **Cancel by `origClientOrderId`.** The gateway endpoint takes no client-order-id parameter at all, so a client id must first be resolved to an exchange `orderId` — list with `current-orders` and match on the returned rows before cancelling.
- **Cancel several symbols in one call.** `symbol` is a single pair, so N pairs means N calls — or the account-wide form if that is genuinely what the user wants.

**The two batch filters are integer CODES, not names** — the opposite of `deal-detail`'s `orderType`, which is a name. Mixing them up is the easy mistake here:

- `tradeType`: `1` = BUY, `2` = SELL. Omit for both sides.
- `orderTypes`: comma-separated `OrderType` codes. `-1` TRIGGER_ORDER, `1` LIMIT_ORDER, `2` POST_ONLY, `3` IMMEDIATE_OR_CANCEL, `4` FILL_OR_KILL, `5` MARKET_ORDER, `100` STOP_LIMIT_ORDER, `101` OCO_STOP_LIMIT_ORDER, `102` OCO_LIMIT_ORDER, `103` STOP_MARKET_ORDER, `104` TRACK_LIMIT_ORDER, `105` TRACK_MARKET_ORDER. Omit for all types.
- A filter that excludes both `100` and `103` skips the plan-order family entirely — so a batch cancel meant to clear stop orders must include those codes.

Other things to expect:

- **Ownership is enforced**: cancelling someone else's order is refused with "Only can cancel self order".
- **Repeats inside ~3s are refused**, not double-cancelled: the backend answers "the cancel request was sent too quickly, please try again after 3 seconds". Wait and re-query rather than hammering.
- **A closed market blocks it** with a trading-disabled error.
- **Trailing (track) orders cannot be cancelled by the track order's own id** — go through `orderId`/batch mode instead.

### Listing orders and fills

Three operations, split by **what state the thing is in** rather than by what you want to filter on:

| Want | Use | Notes |
|---|---|---|
| Open orders | **`current-orders`** | states `0` INACTIVE / `1` NEW / `3` PARTIALLY_FILLED |
| Finished orders | **`history-orders`** | states `2` FILLED / `4` CANCELED / `5` PARTIALLY_CANCELED |
| Fills | **`deals`** | one row per fill, not per order |

All three are paged and filter by pair, order type, side and time. Every pair parameter is optional, so omitting them lists **across all pairs** — which is also the trap: a query you meant to scope to one symbol becomes account-wide if the parameter goes missing.

Picking between the first two matters more than it looks, because of the second trap below: they own **disjoint** state sets, so "the order is not in the list" usually means you asked the wrong one, not that the order is gone.

Three traps here, all of which fail quietly rather than loudly:

- **The filters are integer CODES, except one.** `orderTypes`, `states` and `tradeType` on `current-orders` / `history-orders` are codes (`tradeType`: `1` BUY, `2` SELL). But **`deals` takes `tradeType` by NAME** (`BUY` / `SELL`) — the same concept spelled two ways across sibling operations. The order-type codes are the ones listed under `cancel` above.
- **These two also RETURN their enums as codes** — `orderType`, `state` and `tradeType` on a `current-orders` / `history-orders` row are integers (`orderType: "1"`, `state: "1"`), **not** names. This matters beyond reading them, because `deal-detail --orderType` accepts only NAMES: taking the type off a row and passing it straight through is refused every time (`--orderType value "1" is not allowed`). **Translate the code to its name first** using the table under `cancel` above — `1` → `LIMIT_ORDER`, `5` → `MARKET_ORDER`, `104` → `TRACK_LIMIT_ORDER`, and so on. Note the asymmetry with `deal-detail`, which returns these same fields as names: codes in a listing response, names in a single-order response.
- **`states` is clamped, not validated.** Each endpoint owns a state set — `current-orders`: `0` INACTIVE / `1` NEW / `3` PARTIALLY_FILLED; `history-orders`: `2` FILLED / `4` CANCELED / `5` PARTIALLY_CANCELED. Your `states` is intersected with that set, and **an empty intersection silently falls back to the endpoint's whole set**. So asking `current-orders` for `states=2` (FILLED) does not error and does not return nothing — it returns all open orders, as if you had not filtered. Pick the endpoint by what you want first, then filter within it.
- **The history window is capped per account.** Queries reaching too far back are refused as out of range rather than truncated, and how far back is allowed varies by account. Omitting `startTime` lets the backend apply its own default window.

`needPage=false` on any of the three skips the total-count query — cheaper when you only want the current page and do not need a total.

### Querying one order: `deal-detail`

`deal-detail` is the **only** operation that looks up a single order. It returns the order's fields plus `deals[]`, its individual fills (each fill's price, quantity, fee), and it is the only way to reach an unactivated plan order — via `orderType: TRIGGER_ORDER` keyed on the `triggerId`.

Two consequences worth planning around, because the list operations do **not** cover them:

- **There is no lookup by `origClientOrderId`.** `deal-detail` is keyed on `orderId` only, and `current-orders` / `history-orders` have no order-id filter at all. A client order id must be resolved to an exchange `orderId` by listing and matching on the returned field.
- **`orderType` is required, and you may not know it.** It is not a filter — it selects which record is looked up (see below). When you do not already hold the type, read it off a `current-orders` / `history-orders` row first — **and translate it: the row carries the integer CODE (`"1"`), while this parameter takes the NAME (`LIMIT_ORDER`), so passing the row's value through is refused.** The code table is under `cancel` above. That does not reach the **plan record** of an unactivated trigger order: the listing shows the `INACTIVE` spot order the plan pre-created, and carries no `triggerId` to reach the plan by — which is exactly the case `TRIGGER_ORDER` exists for.

For fills across many orders use `deals`, which is account-wide and pair-filtered; `deal-detail` is one order.

**`orderType` is not a filter — it selects which record is looked up, and therefore which id `orderId` means.** The backend branches on it:

| `orderType` | Record looked up | `orderId` must be |
|---|---|---|
| `TRIGGER_ORDER` | the plan (trigger) order | the **`triggerId`** — the id a `place-trigger` / `place-market-trigger` / `place-track` call returned |
| any other value | the spot order | the **spot order id** |

Passing the wrong combination is **not an error** — the lookup misses and comes back empty. The two failure modes worth recognising:

- A plan order queried with the spot order id (or with a non-`TRIGGER_ORDER` type) → empty, even though the order exists.
- A spot order queried with `TRIGGER_ORDER` → empty, for the same reason in reverse.

So pass `TRIGGER_ORDER` together with the `triggerId` for a plan record, and the order's actual type together with the spot order id otherwise. If you do not know the type, read it off a `current-orders` / `history-orders` row first and **translate the row's integer code into the name this parameter wants** (`1` → `LIMIT_ORDER`, `5` → `MARKET_ORDER`; table under `cancel`) — but note that no listing hands you a `triggerId`, so the plan record is reachable **only** with the id its placement returned (that is precisely why `TRIGGER_ORDER` exists here). Cancelling is unaffected: it goes by `orderId`.

Other things to expect from `deal-detail`:

- **It is scoped to the caller.** The backend looks the order up by id *and* member, so another member's order comes back empty rather than as a permission error. An empty result means "not yours, or the wrong `orderType`".
- **Two different failure shapes, and the difference tells you what went wrong.** A *well-formed* id that does not resolve (wrong store because `orderType` mismatched, or not the caller's) returns a **success envelope with no `data` field at all** — verified: a real spot order id sent with `orderType: TRIGGER_ORDER` came back `{"code": 0, "msg": "success"}` and nothing else. A *malformed* id is different: `--orderId 1` produced an upstream **500**, not an empty result. So a 500 here means "that id is not a plausible order id", not "the order is missing" — do not retry it.
- **`deal-detail`'s enum fields come back as NAMES, not codes** — and this is true of `deal-detail` only, not of the listings. The gateway converts `orderType`, `tradeType` and `state` from their integer codes to the constant names before returning here, so expect `LIMIT_ORDER` / `BUY` / `FILLED` rather than `1` / `1` / `2`. A `current-orders` / `history-orders` row is the other way round (codes), so do not carry an expectation from one to the other.
- **`deals` is the fill list, and it comes back `null` — not `[]` — for an order that has not traded.** Verified against a live `NEW` order. Treat null and empty as the same "no fills yet"; do not index it without a null check. Each entry carries its own price, quantity, amount, fee and fee currency, so summing them is how you get the true average fill price.
- **A plan/trigger order also carries `triggerType` / `triggerPrice` / `triggerState`**, which are absent for an ordinary order.

### Constraints shared by the body-based operations

Backend-enforced; a violation is a rejected request, not a silent adjustment.

- **`clientOrderId` is the only dedupe key, and it is optional — so the protection exists only when you supply it.** The backend dedupes a placement on `clientOrderId` + member: a resend carrying the same value is **refused as a duplicate** rather than placed twice, which is what turns an ambiguous timeout into something recoverable. Send a value that is unique per intended order, decide it **before** the first attempt, and reuse it verbatim on any resend of that order — regenerating it while rebuilding the body silently discards the protection. Never reuse one across two different orders. A `duplicate` rejection means the earlier attempt landed: re-query for the `orderId` instead of retrying under a new id. A placement sent **without** the field has no key and no safe resend. **`place-trigger` is the exception** — it does not accept the field at all, so no `place-trigger` call is safely resendable. Note that supplying the key does **not** make the operation auto-retryable: every placement stays `idempotent = no` in the table below, because the CLI cannot know whether a given call carried a key and must never resend one on its own.
- **Decimal bounds**: every price/quantity/amount must be **> 0**, with at most **35 integer digits and 30 decimal places**. Values are truncated **down** to the pair's price/quantity precision, so read it from `spot marketv2 symbol-trade` first.
- **Account eligibility**: some accounts are not eligible for the conditional and TP/SL paths and are refused outright — an account state, not a malformed request. Placement is also refused while a batch-cancel is in progress on the account, and per-symbol placement is rate limited.
- **Availability**: OCO, stop-market and trailing orders can each be unavailable — for the whole market, for your account, or for one trading pair. When one is unavailable the call is rejected as an invalid/unsupported order type — that is a configuration state, not a malformed request, so do not retry or reshape the body.
- **Market must be open**: the trigger, trailing and OCO paths need a latest traded price, so they are refused before a market opens.
- **`orderSource` is required in practice** even though it is not marked required: omitting it can fail the call outright. Always send `CLI`.

### Per-operation specifics

**`place-oco`** — the price rules are the strictest here, all relative to the **latest traded price** (fetch it with `spot marketv2 ticker`):

- `tradeType: BUY` requires `triggerType: GE`, `price` strictly **below** the latest price, `triggerPrice` strictly **above** it.
- `tradeType: SELL` requires `triggerType: LE`, `price` strictly **above** the latest price, `triggerPrice` strictly **below** it.
- A `triggerType` that does not match the side is rejected outright.
- **Cancelling an OCO leg**: `cancel --orderId <leg id>` dispatches OCO legs properly, or cancel the whole pair with `cancel --symbol`.

**`place-trigger`** (stop-limit) — `triggerPrice`, `price` and `quantity` are all required.

- **`triggerType` is *not* cross-checked against the side** here, unlike `place-oco`. Both combinations are accepted, so choose deliberately: `SELL` + `LE` for a stop-loss, `BUY` + `GE` for a breakout entry. Getting it backwards places a valid order that triggers at the wrong time.
- **At most 200 pending trigger orders** per account.

**`place-market-trigger`** (stop-market) — `triggerPrice` and `triggerType` are required, and there is no limit price.

- Supply **exactly one of `quantity` or `amount`**. Both blank is rejected, and so is both supplied.
- `orderType` must be `STOP_MARKET_ORDER`.
- **⚠️ `nonce` is not a dedupe key and is no longer accepted.** The underlying DTO carries a `nonce` field, and this operation used to offer it as a deduplication key. It does not deduplicate, and this is settled from both ends: the same `nonce` sent twice places **two different orders** (both `code: 200`, different `orderId`s), and the backend's placement path for this endpoint never reads the field. A body carrying `nonce` is now refused locally as an unknown field. **The dedupe key here is `clientOrderId`** (see the shared constraints above) — that is the field to supply, and to reuse, if a call may have to be resent.

**`place-track`** (trailing) — `trackAmplitude` is required and, after truncation to 4 decimals, must fall within **(0, 1]** (i.e. a fraction, not a percentage: `0.05` = 5%).

- **This is the field to double-check, because one class of error here lands silently.** `5` and `50` are outside the range and the CLI now refuses them locally, before any request. But **`0.5` is legal — it means 50%** — so a user who meant 5% and wrote `0.5` gets an accepted order that rests looking entirely normal and triggers only after a 50% retracement. Nothing downstream catches it. The confirmation prompt therefore restates the value as a percentage (`trails by 50% — trackAmplitude 0.5 is a FRACTION, not a percent …`); **read that line back to the user in those terms, not as the raw fraction.** For an N% trail, pass N/100.

- Which size/price fields are required depends on `orderType`:
  - `TRACK_LIMIT_ORDER` needs **both `price` and `quantity`** (`amount` is unused).
  - `TRACK_MARKET_ORDER` needs **exactly one of `quantity` or `amount`** (`price` is unused).
- `trackActivePrice` is optional (trailing starts immediately without it). When supplied it must satisfy `BUY`: activation price **≤** latest price; `SELL`: activation price **≥** latest price.

**`place`** — **the general placement operation**: how you place an ordinary order as well as one carrying a take-profit/stop-loss. `price`, `quantity`, `tradeType` and `orderSource` are required

- **All three TP/SL shapes are supported**: take-profit only, stop-loss only, or **both at once** (the "two-sided" order). The backend enters its TP/SL validation when *either* field is present, so attaching both legs to one order is a first-class case, not a workaround.
- Each attached trigger is validated **against this order's own `price`**, not the market price:
  - `tradeType: BUY` → `profitTriggerPrice` **above** `price`, `loseTriggerPrice` **below** `price`. Violating either is refused with a dedicated error naming the offending leg and the required direction.
  - `tradeType: SELL` → `profitTriggerPrice` **below** `price`, `loseTriggerPrice` **above** `price`.
- Each trigger price must also be **> 0** with at most 35 integer digits and 30 decimal places, or it is refused as an invalid take-profit / stop-loss trigger price.
- **Some accounts cannot attach TP/SL at all** and are refused outright, with an error saying so. That is an account state, not a bad request — do not retry or reshape the body; place the order without TP/SL and manage the exit separately.
- **`orderType` is optional and defaults to `LIMIT_ORDER`.** Five values are accepted: `LIMIT_ORDER`, `IMMEDIATE_OR_CANCEL` (IOC), `FILL_OR_KILL` (FOK), `POST_ONLY` and `MARKET_ORDER`. The backend enforces this as a **blocklist** of the conditional families — `TRIGGER_ORDER`, `STOP_LIMIT_ORDER`, `STOP_MARKET_ORDER`, `OCO_LIMIT_ORDER`, `OCO_STOP_LIMIT_ORDER`, `TRACK_LIMIT_ORDER`, `TRACK_MARKET_ORDER` — each of which has its own operation.
- **⚠️ Sending a blocklisted type fails with the misleading message `"orderType is required"`** (HTTP 400). It does **not** mean the field was missing. Read it as "this order type is not accepted here" and switch operation — `place-trigger` / `place-market-trigger` / `place-track` / `place-oco` — rather than trying to add or re-send `orderType`.
- **`MARKET_ORDER` is accepted here but not usable in practice**: this endpoint still validates `price` as a required numeric field, so a market order has nothing sensible to put there. Use `place-market`, which needs no price and can size in the quote asset.
- **`orderSource` is enforced, not decorative, and here it is a constant: `CLI`.** It is the only accepted value, on this operation and on every other placement. Other sources exist for other clients and are rejected here with `"request not accepted"` (HTTP 400). None of them is offered: an order placed through this binary did not come from anywhere else, so a field that lets it claim otherwise is a field that can only be filled in wrongly. The backend stores the value verbatim, so a placement made here comes back from `current-orders` as `source: CLI`.

**`place-market`** — the **market-order** path, and the only operation that can size an order in the **quote** asset.

- `tradeType`, `orderType` and `orderSource` are required; `orderType` must be `MARKET_ORDER` (the backend rejects anything else with a 400 "invalid order type").
- **There is no `price`** — a market order fills against the book. The underlying DTO carries a price field, but this operation deliberately does not expose it: it would not cap anything.
- **Supply exactly one of `quantity` or `amount`.** `quantity` is a base-asset size (natural for a market SELL: "sell 0.001 BTC"); `amount` is a quote-asset size (natural for a market BUY: "spend 100 USDT"). Sending both, or neither, is a malformed request.
- **A market order fills immediately, so a duplicate is a real position** — not a resting order you can simply cancel. This is why it is never auto-retried: on an ambiguous failure, check `history-orders` (and `deals` for the fills) before considering a second attempt.

**`modify`** — read this before calling: it is **not** an in-place edit and it is the one **destructive** write in this subdomain.

- It **cancels the original order and places a new one**, returning `{oldOrderId, newOrderId}`. The old id is dead afterwards; use the new one for follow-up queries and cancels.
- **A failure can still have cancelled your order.** The distinct failure "modify failed but cancel succeeded" means the original is gone and the replacement was not placed — the position is now unprotected. On any `modify` error, **re-query state before acting** rather than retrying.
- **Never auto-retry it.** A lost response is genuinely ambiguous, and a blind repeat either fails on a now-nonexistent order id or acts on stale state.
- Only `price` and `quantity` change; side, pair and type are inherited from the original order.
- Preconditions: the order must be a **limit order**, must be **`NEW` or `PARTIALLY_FILLED`**, and must belong to the caller. Balance is re-checked against the new amount (the original order's locked funds count toward it). Some accounts are refused outright and told to cancel and re-place instead.
- `modify` can also be unavailable — either entirely, or only for orders carrying a TP/SL, which then cannot be modified at all.

## Operations

> scope is always the resource `spot.trade`; the action (read/write) is in the access column. signed/identity flag whether a signature/login is required; idempotent flags whether a repeat is safe (every placement and `modify` are NOT — never auto-retried).

| Command | scope | access | signed | identity | idempotent | Endpoint | Description |
|---------|-------|--------|--------|----------|------------|--------------|-------------|
| `mexc spot trade place-oco`   | `spot.trade` | write | yes  | yes | no  | `POST /api/cli/spot/v4/order/place/oco` | Place an OCO pair — a limit leg plus a stop-limit leg, whichever activates first cancels the other (body on `--data`) |
| `mexc spot trade place-trigger` | `spot.trade` | write | yes | yes | no | `POST /api/cli/spot/order/place/trigger/v2` | Place a stop-limit (trigger) order — a limit order submitted only once the market reaches the trigger price (body on `--data`) |
| `mexc spot trade place-market-trigger` | `spot.trade` | write | yes | yes | no | `POST /api/cli/spot/v4/order/place/market/trigger` | Place a stop-market (trigger) order — a market order submitted once the trigger price is reached (body on `--data`) |
| `mexc spot trade place-track` | `spot.trade` | write | yes | yes | no | `POST /api/cli/spot/v4/order/place/track` | Place a trailing (track) order that follows the market by trackAmplitude (body on `--data`) |
| `mexc spot trade place-market` | `spot.trade` | write | yes  | yes | no  | `POST /api/cli/spot/v4/order/place` | Place a **MARKET** order — no price; size it with `quantity` (base) **or** `amount` (quote, e.g. spend 100 USDT) |
| `mexc spot trade place` | `spot.trade` | write | yes | yes | no | `POST /api/cli/spot/order/place` | Place an order with an optional take-profit and/or stop-loss attached (body on `--data`) |
| `mexc spot trade modify` | `spot.trade` | write | yes | yes | no | `POST /api/cli/spot/order/modify` | Modify a resting limit order's price/quantity — cancel-and-replace, returns a new order id (body on `--data`) |
| `mexc spot trade cancel`      | `spot.trade` | write | yes  | yes | yes | `DELETE /api/cli/spot/order/cancel/v2` | Cancel one plan order (`--triggerId`), one order (`--orderId`), one pair (`--symbol` + optional side/type filters), or — with no parameters — the whole account |
| `mexc spot trade current-orders` | `spot.trade` | read | yes | yes | yes | `GET /api/cli/spot/order/current/orders/v2` | List OPEN orders, paged, with type/side/state/pair/time filters |
| `mexc spot trade history-orders` | `spot.trade` | read | yes | yes | yes | `GET /api/cli/spot/order/history/orders/v2` | List FINISHED orders, paged, same filters as `current-orders` |
| `mexc spot trade deals`       | `spot.trade` | read  | yes  | yes | yes | `GET /api/cli/spot/deal/deals` | List fills (trade history), paged, by pair / side / time |
| `mexc spot trade deal-detail` | `spot.trade` | read  | yes  | yes | yes | `GET /api/cli/spot/order/deal/detail` | Query one order's full detail **plus its fill list** (`--orderId` + `--orderType`) |

## Permissions

> Authorization = resource(scope) × action(access). scope is always `spot.trade`; actions split into read/write.

| Operation | scope | access |
|-----------|-------|--------|
| place / place-market / place-trigger / place-market-trigger / place-track / place-oco / modify / cancel | `spot.trade` | write |
| deal-detail / current-orders / history-orders / deals | `spot.trade` | read |

## Workflows

Multi-step order playbooks. **Always resolve the coin code into the pair ids first** and use those
(`currencyId` + `marketCurrencyId`) from then on: the operations also accept the coin names
`currency` + `market`, but the id form locates the pair more precisely and is the recommended path.
Responses spell the pair as `BTC_USDT`; do not feed a returned `symbol` back in as `currency`.

### Place an order and confirm it landed

> User: "Buy 5000 USDT of BTC at 90000"

1. `mexc spot marketv2 symbols` → the pair catalogue; **this is where the coin the user named becomes the pair ids the order needs**.
   The catalogue is grouped by **quote asset** (the `USDT` group holds every pair quoted in USDT); inside a group,
   match on `vn` — the **trading code** (e.g. `BTC`).
   ⚠️ `fn` is the **full coin name** (e.g. `Bitcoin`), so **match on `vn`, never on `fn`** — comparing a trading code
   against `fn` is guaranteed to find nothing.
   From the matched entry take `cd` / `mcd` (the base and quote asset ids — the pair ids the order uses)
   and `ps` / `qs` (price and quantity precision).
   Fetch this catalogue once and reuse it; it does not need re-fetching per order.
2. `mexc spot asset assets-spot` → the spot wallet's per-coin holdings; confirm the **quote asset** (when buying)
   or the **base asset** (when selling) has enough available to cover this order.
   Read the coin's entry in the response's `assets` block and check its `available` (not `total`).
   `assets` lists every coin the exchange carries — thousands of entries, nearly all of them zero — so filter to
   the coin you need locally rather than pushing the whole payload into context.
   ⚠️ **Never read the balance off the `balances` block of this response.** Despite the name it is the whole spot
   account's net worth re-priced into each main coin, **not a per-coin balance**, so it can be orders of magnitude
   larger than the coin's actual holding and would wave through an order the account cannot cover. `assets` is the
   only per-coin block here. (See the `mexc-spot-asset` skill for the full two-block trap.)
   This step does not depend on step 1, so the two can run in parallel.
   ⚠️ The operation belongs to another sub-domain (`spot.asset`) and is a signed read, so it needs the same API key
   this placement does. When it fails you **may skip it and continue**, but tell the user that **the balance could
   not be verified**, and **do not treat the balance as confirmed** — an insufficient balance will then only surface
   as a rejection at placement time, and that rejection must be reported as a balance problem rather than a bad
   parameter.
3. Pick the operation for the intent and build the request body → yields the exact command and body for the next step.
   **The order type decides which operation you call; it is not one operation with a different parameter**:

   | Intent | Operation |
   |---|---|
   | Plain limit and its variants (`LIMIT_ORDER` / `POST_ONLY` / `IMMEDIATE_OR_CANCEL` / `FILL_OR_KILL`, selected via `orderType`) | `place` |
   | Market (`MARKET_ORDER`) | `place-market` |
   | One-cancels-the-other pair (`OCO_STOP_LIMIT_ORDER`) | `place-oco` |
   | Take-profit / stop-loss that rests a limit order on trigger (`STOP_LIMIT_ORDER`) | `place-trigger` |
   | Take-profit / stop-loss that fills at market on trigger (`STOP_MARKET_ORDER`) | `place-market-trigger` |
   | Follows the market as it moves (`TRACK_LIMIT_ORDER` / `TRACK_MARKET_ORDER`) | `place-track` |

   Three things in the body **the backend will not catch for you**, so they have to be right before you send:
   - **The trigger direction of a take-profit / stop-loss order.** Set `triggerType` from what the user meant —
     "once it rises to X" is `GE`, "once it drops to X" is `LE`. **The backend does not validate this field at all
     and stores whatever you send**: an inverted direction raises no error but produces an order whose trigger
     condition was already satisfied the moment it was placed. It fails silently.
     (An OCO pair is the opposite: its direction is fixed by side — `GE` for buy, `LE` for sell — and an inverted
     value is rejected outright.)
   - **The amplitude of a trailing order.** `trackAmplitude` is a **decimal ratio between 0 and 1** (0 excluded,
     1 included), so `0.01` means 1%. **Do not pass it as a percentage figure** — `5` or `99.99` is rejected,
     and so is `1.0001`, while `1` is accepted.
   - **Price and quantity precision**, per `ps` / `qs` from step 1. Exceeding the precision **raises no error;
     the value is silently truncated.**

   The remaining constraints are enforced by the backend with explicit errors, so correct them from the error
   rather than pre-checking: minimum order value (the limit and market minimums are different numbers),
   the price band around the latest price, market orders needing either an amount or a quantity, and the
   price direction of a take-profit / stop-loss attached to a limit order.
4. `mexc spot trade <the operation chosen above> --data '{...}'` → places the order and returns its id.
   Build every body from `mexc schema spot.trade.<op>`; never assemble one from memory.
   ⚠️ **Send a `clientOrderId`, unique per intended order.** It is optional, and supplying it is what makes the
   placement recoverable: the backend dedupes on `clientOrderId` + member, so a resend carrying the same one is
   **refused as a duplicate** instead of placing a second order. **Decide the value before the first attempt and
   keep it until the outcome is known** — a resend must carry the identical value, and regenerating one while
   rebuilding the body silently throws the protection away. Never reuse a value across two different orders.
   A `duplicate` rejection is **not a failure**: it means the earlier attempt landed, so re-query per step 5 for its
   `orderId` rather than retrying under a new id. **Omit the field and there is no protection at all** — a resend
   then places a second order, which leaves re-querying as the only safe move. `place-trigger` does not accept the
   field, so treat every `place-trigger` call as unresendable.
   ⚠️ Distinguish the two failure shapes: an upstream **non-JSON 5xx** means the request never reached the business
   layer, so retrying it with an identical body is safe and normally succeeds (this gateway returns one
   intermittently). A **lost or timed-out response** is the opposite — the order may already have landed, so
   re-query per step 5 instead of resending.
       ↓ step 4 is a write: show the user a summary of pair, side, price and quantity, and wait for explicit
       confirmation before running.
5. Re-query to confirm what happened to the order → tells you whether it landed and what state it is in.
   **Two lists have to be checked; checking only the open list leads to the wrong conclusion**:
   `mexc spot trade current-orders --currencyId <cd> --marketCurrencyId <mcd>` → orders still resting on the book;
   `mexc spot trade history-orders --currencyId <cd> --marketCurrencyId <mcd>` → orders that already finished.
   **The open list only holds three states — inactive, unfilled and partially filled.** As soon as an order is
   filled, cancelled or partially cancelled it leaves the open list for the history list. Therefore market orders,
   `IMMEDIATE_OR_CANCEL` and `FILL_OR_KILL` **will normally never appear in the open list** and have to be looked
   up in history; a plain limit order priced to fill immediately also goes straight to history.
   Always look in the open list first and fall back to history (states such as triggered and trigger-failed follow
   the same order).
   **"Not in the open list" does not mean "never placed"** — that conclusion requires having checked both lists.

### Modify a resting order

> User: "Change the price on that order of mine"

1. `mexc spot trade current-orders --currencyId <cd> --marketCurrencyId <mcd>` → locate the target order and read its id.
   Modifying only applies to resting orders, which is why this step comes first.
2. `mexc spot trade modify --data '{"orderId":"<id from step 1>","price":"<new price>","quantity":"<new quantity>"}'`
   → modifies the order. **Both price and quantity are required**: when changing only one, carry the current value
   of the other forward. The new price is also subject to the pair's price band and the backend rejects a price
   outside it.
       ↓ step 2 is a write: show the user an "old value → new value" summary and wait for explicit confirmation
       before running.
3. `mexc spot trade current-orders --currencyId <cd> --marketCurrencyId <mcd>` → re-query to confirm the new values took effect.
   ⚠️ A successful modify returns `{oldOrderId, newOrderId}` — **it cancels the old order and creates a new one
   rather than editing in place**, so **the order id changes**; every later re-query and cancel has to use the new id.
   If the target order is no longer in the open list, check `history-orders` for its final state — **a modify can
   fail to take effect because the order filled or was cancelled in the meantime**, which is a different cause from
   "the modify failed" and should not be reported as one.

### Cancel orders (one or in bulk)

> User: "Cancel my open orders on this pair"

1. `mexc spot trade current-orders --currencyId <cd> --marketCurrencyId <mcd>` → the open orders, already carrying
   the ids and order types a cancel needs, so **no per-order detail lookup is required**.
2. Choose the cancel scope; **the scope is decided by which parameters you send**.
   ⚠️ **Always cancel by `--orderId`**, including for take-profit / stop-loss and trailing orders that have not
   triggered yet — they are cancelled by order id as well, not by a trigger id.
   - one order → `mexc spot trade cancel --orderId <id from step 1>`
   - in bulk by type → `mexc spot trade cancel --orderTypes <comma-separated type codes>`; `orderTypes` takes
     **type codes, not type names**. **Sending neither an id nor a pair cancels the entire account**, which is a
     vastly different scope.
       ↓ step 2 is a write: state which scope this cancel uses and what exactly it targets, then wait for explicit
       confirmation before running; on a retry keep the parameter set identical, because dropping one qualifier
       silently widens a single cancel into a bulk one.
3. `mexc spot trade current-orders --currencyId <cd> --marketCurrencyId <mcd>` → whether the target left the open list;
   `mexc spot trade history-orders --currencyId <cd> --marketCurrencyId <mcd>` → the state it finished in.
   **This is the easiest step to draw a wrong conclusion from**:
   ⚠️ **A successful cancel response does not mean the order was actually cancelled.** An unactivated trailing order
   has been observed returning a successful cancel while remaining in the open list with its state unchanged.
   **Whether a cancel took effect can only be established by re-querying, never from the cancel response.**
   ⚠️ **"The target left the open list" does not mean the cancel succeeded either** — it may have filled just before
   the cancel. The two outcomes mean opposite things to the user (the money was not spent / the order went through),
   so the final state in the history list is what distinguishes cancelled, partially cancelled and filled.
   Also, **cancelling one leg of an OCO pair cancels the whole pair**; cancelling the second leg then errors because
   the pair is gone, which is expected.

### Find out how an order ended up

> User: "What happened to that order of mine?"

1. `mexc spot trade current-orders --currencyId <cd> --marketCurrencyId <mcd>` → orders still open.
2. `mexc spot trade history-orders --currencyId <cd> --marketCurrencyId <mcd>` → orders that already finished.
   Open and finished are **two disjoint data sets** and an order appears in exactly one of them, so both have to be
   checked before concluding the order cannot be found.
3. `mexc spot trade deals --currencyId <cd> --marketCurrencyId <mcd>` → the fill history for the pair.
   No fills is a normal result: it means the order rested without filling.
4. `mexc spot trade deal-detail --orderId <id from the steps above> --orderType <that order's type>` → the single-order detail.
   Take `orderType` from the row you just listed, but **translate it first**: a row carries the integer CODE (`"1"`),
   while this parameter takes the NAME (`LIMIT_ORDER`), so passing the row's value straight through is refused
   locally. Run `mexc schema spot.trade.deal-detail` for the code -> name table — it is declared on the parameter
   itself, so it cannot drift from what the command accepts.
   ⚠️ **A wrong value returns an empty result instead of an error**, so never guess it.

Only the parameters that distinguish intent and are directly runnable are written above; get the full parameter set
from `mexc schema spot.trade.<op>`.

## Notes for Agents

**General rules**
- Retry only idempotent ops (idempotent=yes); never auto-retry a non-idempotent op (idempotent=no) — a lost placement response could mean the order already landed, so re-query instead of re-sending.
- Show a summary and wait for explicit user confirmation before any write operation (placing / modifying / cancelling).
- Unsure about parameters? run `mexc schema spot.trade.<op>` instead of guessing.
- On a structured `failed_precondition` (e.g. `requires API credentials`), load the `mexc-auth` skill (credentials) and the `mexc-common` skill (common error / safety / security rules), then replay the command; this skill does not describe login.

**Skill-specific notes**
- Implementation lives in `./api/trade.go` (descriptors only; the request and signing are delegated to the `pkg/` foundation).
- In `--read-only` mode every write op is refused (all placements, `modify`, `cancel`); after a successful placement, confirm it with `spot trade deal-detail --orderId <id> --orderType <type>`, or list with `spot trade current-orders` when you do not hold the id.
- **`cancel`'s scope is chosen by which parameters you send, so name the mode when you confirm.** One plan order (`--triggerId`), one order (`--orderId`), one pair (`--symbol`), or the whole account (no parameters — a legitimate "cancel everything" request). All four are intended, but they are very different in blast radius: tell the user which one you are about to run, and keep the parameter set stable across retries, since a dropped `--symbol` silently promotes a one-pair cancel to an account-wide one.
- **To cancel an unactivated plan/trigger order, use `cancel --triggerId`.** Passing its `orderId` instead is silently ineffective: the backend's dispatch chain only cancels track / OCO / `NEW` / `PARTIALLY_FILLED` orders, so an `INACTIVE` pre-created order matches nothing and no error is raised. Confirm with `deal-detail --orderId <triggerId> --orderType TRIGGER_ORDER` afterwards.
- **`deal-detail` needs `orderType`, and getting it wrong returns nothing rather than an error.** `orderType` also decides what `orderId` means: `TRIGGER_ORDER` → pass the **`triggerId`** and it reads the plan-order table; any other value → pass the **spot order id**. An empty result means "not yours, not there, or the wrong orderType/id pairing" — not necessarily a missing order.
- **After placing a trigger / trailing order, confirm it with the `triggerId` you were handed**: `deal-detail --orderId <triggerId> --orderType TRIGGER_ORDER`. Any other `orderType` expects the spot order id, which the placement did not return. The pre-created spot order does exist and shows up in `current-orders` in state `INACTIVE` ("not activated"), so `INACTIVE` is the expected healthy state before the trigger fires, not a problem to report.
- **Choosing between the placement operations**: **limit** order, plain or carrying a take-profit/stop-loss → **`place`** (omit `profitTriggerPrice` / `loseTriggerPrice` for an ordinary one). **Market** order, or any order sized by quote amount ("spend 100 USDT") → **`place-market`**. Order that should only appear once a price is reached → `place-trigger` (then a limit order) or `place-market-trigger` (then a market order). Order that should follow the market → `place-track`. Two linked exit legs → `place-oco`.
- **`modify` needs a confirmation step of its own.** It destroys the original order, and a partial failure can leave you with no order at all. Surface the old/new id pair to the user, and on any error re-query before acting.
- Every placement takes a JSON body rather than flags. Build it from `mexc schema spot.trade.<op>`, never from guesswork: they use `currency` + `market` (or the id pair) instead of `symbol`, and `tradeType` instead of `side`. A plain limit buy is the first example below. Example shapes:
- **`--dry-run` does check the body you hand it, so it is a real pre-flight for a placement.** The examples below carry `--dry-run` to show each shape without placing an order, and a `--data` passed with it is validated on the same required / enum / unknown-field rules a real call applies — a body missing `quantity`, sending `tradeType: LONG`, or naming a field that does not exist fails there instead of on the way to the exchange. Omitting `--data` is still fine, since a dry-run never demands what it was not given; the plan's `body_checked` tells you which happened (`true` = your payload was validated, `false` = there was nothing to validate). What a dry-run cannot check is the exchange's own business rules — balance, precision, whether a price crosses the book — so a green dry-run means the request is well-formed, not that it will be accepted.

  ```bash
  # a PLAIN limit buy — no TP/SL attached. The everyday limit placement.
  mexc spot trade place --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"BUY","orderType":"LIMIT_ORDER","orderSource":"CLI",
    "price":"95000","quantity":"0.001"
  }'

  # market BUY sized in the QUOTE asset: spend 100 USDT on BTC
  mexc spot trade place-market --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"BUY","orderType":"MARKET_ORDER","orderSource":"CLI",
    "amount":"100"
  }'

  # market SELL sized in the BASE asset: sell 0.001 BTC
  mexc spot trade place-market --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"SELL","orderType":"MARKET_ORDER","orderSource":"CLI",
    "quantity":"0.001"
  }'
  ```


  ```bash
  # stop-loss: sell if the price falls to 90000, placing a limit order at 89500
  mexc spot trade place-trigger --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"SELL","triggerType":"LE","orderSource":"CLI",
    "triggerPrice":"90000","price":"89500","quantity":"0.001"
  }'

  # stop-market: sell 0.001 BTC at market once the price falls to 90000
  mexc spot trade place-market-trigger --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"SELL","orderType":"STOP_MARKET_ORDER","orderSource":"CLI",
    "triggerType":"LE","triggerPrice":"90000","quantity":"0.001"
  }'

  # trailing sell: follow the market and sell on a 5% retrace
  mexc spot trade place-track --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"SELL","orderType":"TRACK_LIMIT_ORDER","orderSource":"CLI",
    "trackAmplitude":"0.05","price":"100000","quantity":"0.001"
  }'

  # buy limit at 95000 with take-profit at 120000 and stop-loss at 90000
  mexc spot trade place --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"BUY","orderType":"LIMIT_ORDER","orderSource":"CLI",
    "price":"95000","quantity":"0.001",
    "profitTriggerPrice":"120000","loseTriggerPrice":"90000"
  }'

  mexc spot trade place-oco --dry-run --data '{
    "currency":"BTC","market":"USDT",
    "tradeType":"SELL","orderType":"OCO_STOP_LIMIT_ORDER","orderSource":"CLI",
    "quantity":"0.001","price":"120000",
    "triggerType":"LE","triggerPrice":"90000","triggerLimitPrice":"89500"
  }'

  # re-price a resting limit order (destructive: old id dies, new id returned)
  mexc spot trade modify --dry-run --data '{
    "orderId":"C02__123456789","price":"96000","quantity":"0.001","orderSource":"CLI"
  }'
  ```

- **Cancelling with `cancel`** — the parameters you send choose the scope, from one order up to the whole account:

  ```bash
  # ONE unactivated plan/trigger order (the only form that works for it)
  mexc spot trade cancel --triggerId 570123456789012345

  # ONE ordinary order (also the way to drop a single OCO leg)
  mexc spot trade cancel --orderId C02__123456789

  # ONE PAIR, narrowed to SELL side and the stop-limit + stop-market types
  # (codes, not names: 100 = STOP_LIMIT_ORDER, 103 = STOP_MARKET_ORDER)
  # symbol is spelled the way current-orders returns it, NOT the joined
  # market-data form: BTC_USDT here, BTCUSDT under `spot market`.
  mexc spot trade cancel --symbol BTC_USDT --tradeType 2 --orderTypes 100,103

  # THE WHOLE ACCOUNT — every open order, all pairs. This is the intended form
  # for "cancel all my orders"; just be sure that is what the user asked for.
  mexc spot trade cancel
  ```

- **Verifying a trigger / trailing order after placing it** — the placement returns a `triggerId`, which is the only handle you hold, so start there:

  ```bash
  # place-trigger returned a triggerId; read the plan record back with it
  mexc spot trade deal-detail --orderId <triggerId> --orderType TRIGGER_ORDER

  # the spot order is pre-created straight away, in state INACTIVE ("not
  # activated") until the trigger fires — it shows up here, carrying its triggerId
  mexc spot trade current-orders --currency BTC --market USDT --states 0

  # after activation it is live (state NEW, then filling) under its own id
  mexc spot trade deal-detail --orderId <spotOrderId> --orderType LIMIT_ORDER
  ```
- Never print the secret key in logs or output.
~~~~

### contract/trade

~~~~markdown
---
name: mexc-contract-trade
scope: contract.trade
signed: yes
identity: yes
visibility: public
description: >-
  MEXC contract trading — place/cancel/change orders, plan (trigger) orders,
  take-profit/stop-loss orders, trailing (track) orders, chase-limit orders,
  leverage & margin, position mode, query/close/reverse positions. Requires an
  API key (every call is signed). Triggers: "place contract order","cancel
  order","plan order","stop loss take profit","trailing order","chase limit",
  "change leverage","adjust margin","open positions","close position","reverse".
---

# contract · trade (contract trading)

> Private trading subdomain: every operation is signed and carries the API-key identity (`signed: yes`, `identity: yes`). A valid API key is required; the user is identified by the credential, never by a request parameter/body field. On a credential/login error, load the `mexc-auth` skill, then replay.

## Core Concepts

- **symbol**: a contract name, e.g. `BTC_USDT`.
- **side**: `1` open-long, `2` close-short, `3` open-short, `4` close-long.
- **openType** (margin mode): `1` isolated, `2` cross.
- **positionMode**: `1` hedge (two-way), `2` one-way. **positionType**: `1` long, `2` short.
- **order type**: `1` limit, `2` post-only (maker), `3` IOC, `4` FOK, `5` market, `6` convert-to-limit.
- **trend** (price type): `1` last price, `2` fair price, `3` index price.
- Order/position ids are int64; times are **Unix milliseconds**.
- **Response envelope**: shared contract envelope (`success` / business `code` / `data`); business error codes come from the downstream service and pass through unchanged.
- **Error codes**: see [`references/error-codes.md`](references/error-codes.md) for the business error codes (with English meanings) these operations may return.
- **Two-step take-profit/stop-loss & trailing orders** attach to a `positionId`; plan (trigger) orders fire when the market crosses `triggerPrice`.

## Important Notes

- **API key required**: every op is `signed: yes` / `identity: yes`. Missing/invalid credentials return a structured credential error — load `mexc-auth`.
- **Writes need confirmation**: all order placement/cancel/change, margin/leverage/mode changes, and position close/reverse are `write` — show a summary and confirm first.
- **Never auto-retry `idempotent=no` writes** (`create`, `chase-limit-order`, `chase-limit-place`, `chase-limit-stop`, `planorder-place-v2`, `stoporder-place-v2`, `trackorder-place`, `change-margin`, `close-all`, `reverse`): a lost response could mean the action already landed.
- **Scalar-array bodies**: `cancel`, `chase-limit-stop`, and `chase-limit-cancel` take the request body as a raw JSON array of order ids, e.g. `--data '[123,456]'`.
- **Bodies**: create/change/plan/stop/track/chase placement and position ops take a JSON body via `--data` (validated before send; inspect with `mexc schema contract.trade.<op>`).

## Operations

> scope is the resource identifier (always `contract.trade`); the action is in the access column. signed/identity flag whether a signature/login is required; idempotent flags whether a repeat is safe.

| Command | scope | access | signed | identity | idempotent | Endpoint | Description |
|---------|-------|--------|--------|----------|------------|--------------|-------------|
| `mexc contract trade liquidate-price` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/liquidate_price/{orderId}` | Estimated liquidation price for an order |
| `mexc contract trade deal-details` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/deal_details/{orderId}` | Order deal details |
| `mexc contract trade deal-details-by-position` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/deal_details/byPositionId/{symbol}/{positionId}` | Deal details by position |
| `mexc contract trade close-orders-v2` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/list/close_orders` | Historical orders (closed) V2 |
| `mexc contract trade open-orders-v2` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/list/open_orders` | Current open orders V2 |
| `mexc contract trade open-orders-v2-by-symbol` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/list/open_orders/{symbol}` | Current open orders V2 by symbol |
| `mexc contract trade history-orders-v2` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/list/history_orders` | Historical limit orders V2 |
| `mexc contract trade order-config` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/order/order/config` | Order-query configuration |
| `mexc contract trade create` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/order/create` | Create (place) an order |
| `mexc contract trade cancel` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/order/cancel` | Cancel orders by ids |
| `mexc contract trade cancel-all` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/order/cancel_all` | Cancel all orders |
| `mexc contract trade change-limit-order` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/order/change_limit_order` | Change limit order price & volume |
| `mexc contract trade chase-limit-order` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/order/chase_limit_order` | Chase order (reprice to best) |
| `mexc contract trade chase-limit-place` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/order/chase_limit/place` | Place a chase-limit order |
| `mexc contract trade chase-limit-stop` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/order/chase_limit/stop` | Set TP/SL on chase-limit |
| `mexc contract trade chase-limit-cancel` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/order/chase_limit/cancel` | Cancel chase-limit orders |
| `mexc contract trade planorder-place-v2` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/planorder/place/v2` | Place a plan (trigger) order V2 |
| `mexc contract trade planorder-cancel` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/planorder/cancel` | Cancel plan orders |
| `mexc contract trade planorder-cancel-all` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/planorder/cancel_all` | Cancel all plan orders |
| `mexc contract trade planorder-orders-v2` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/planorder/list/orders` | Plan order list V2 |
| `mexc contract trade planorder-change-price` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/planorder/change_price` | Change plan order price |
| `mexc contract trade planorder-change-stop-order` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/planorder/change_stop_order` | Change plan order TP/SL |
| `mexc contract trade stoporder-place-v2` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/stoporder/place/v2` | Place a TP/SL order V2 |
| `mexc contract trade stoporder-cancel` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/stoporder/cancel` | Cancel TP/SL orders |
| `mexc contract trade stoporder-change-price` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/stoporder/change_price` | Change TP/SL order price |
| `mexc contract trade stoporder-change-plan-price` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/stoporder/change_plan_price` | Change position TP/SL price |
| `mexc contract trade stoporder-change-plan-order` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/stoporder/change_plan_order` | Change plan TP/SL order |
| `mexc contract trade stoporder-cancel-all` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/stoporder/cancel_all` | Cancel all TP/SL orders |
| `mexc contract trade stoporder-orders-v2` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/stoporder/list/orders` | TP/SL order list V2 |
| `mexc contract trade stoporder-open-orders` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/stoporder/open_orders` | Current TP/SL orders |
| `mexc contract trade trackorder-place` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/trackorder/place` | Place a trailing (track) order |
| `mexc contract trade trackorder-cancel` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/trackorder/cancel` | Cancel trailing (track) orders |
| `mexc contract trade trackorder-change-order` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/trackorder/change_order` | Change trailing (track) order |
| `mexc contract trade trackorder-list` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/trackorder/list/orders` | Trailing (track) order list |
| `mexc contract trade open-positions` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/open_positions` | Current open positions |
| `mexc contract trade history-positions-v2` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/list/history_positions` | Historical positions V2 |
| `mexc contract trade history-positions-liquidate` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/list/history_positions_liquidate` | Historical liquidated positions |
| `mexc contract trade funding-records` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/funding_records` | Funding-fee records |
| `mexc contract trade funding-records-summary` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/funding_records/summary` | Funding-fee summary |
| `mexc contract trade position-funding-detail` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/list/position_funding_detail` | Position funding-fee detail |
| `mexc contract trade margin-change-details` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/marginChangeDetails` | Margin-change details |
| `mexc contract trade open-position-leverage-history` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/open_position/leverage_history` | Position leverage-change history |
| `mexc contract trade leverage` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/leverage` | Leverage of a contract |
| `mexc contract trade position-mode` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/position_mode` | Position mode |
| `mexc contract trade calc-liquidate-price` | `contract.trade` | read | yes | yes | yes | `GET /api/v1/private/position/calc_liquidate_price` | Isolated→cross estimated liquidation price |
| `mexc contract trade order-calc-liquidate-price` | `contract.trade` | read | yes | yes | yes | `POST /api/v1/private/position/order/calc_liquidate_price` | Prospective-order liquidation price |
| `mexc contract trade order-calc-liquidate-price-v2` | `contract.trade` | read | yes | yes | yes | `POST /api/v1/private/position/order/calc_liquidate_price/v2` | Prospective-order liquidation price V2 |
| `mexc contract trade change-margin` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/position/change_margin` | Adjust position margin |
| `mexc contract trade change-auto-add-im` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/position/change_auto_add_im` | Toggle auto-add margin |
| `mexc contract trade auto-add-im-change-history` | `contract.trade` | read | yes | yes | yes | `POST /api/v1/private/position/autoAddImChange/history` | Auto-add-margin change history |
| `mexc contract trade change-leverage` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/position/change_leverage` | Adjust leverage |
| `mexc contract trade change-position-mode` | `contract.trade` | write | yes | yes | yes | `POST /api/v1/private/position/change_position_mode` | Switch position mode |
| `mexc contract trade close-all` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/position/close_all` | Close all positions |
| `mexc contract trade reverse` | `contract.trade` | write | yes | yes | no | `POST /api/v1/private/position/reverse` | Reverse a position |

## Permissions

> Authorization = resource(scope) × action(access).

| Operation | scope | access |
|-----------|-------|--------|
| all query operations (order/plan/stop/track/position reads + liquidation-price calculators) | `contract.trade` | read |
| all placement / cancel / change / margin / leverage / mode / close / reverse operations | `contract.trade` | write |

## Usage Examples

```bash
# --- Order query ---
mexc contract trade liquidate-price --orderId 123456
mexc contract trade deal-details --orderId 123456
mexc contract trade deal-details-by-position --symbol BTC_USDT --positionId 111
mexc contract trade close-orders-v2 --symbol BTC_USDT --page_num 1 --page_size 20
mexc contract trade open-orders-v2 --page_num 1 --page_size 20
mexc contract trade open-orders-v2-by-symbol --symbol BTC_USDT --page_num 1 --page_size 20
mexc contract trade history-orders-v2 --symbol BTC_USDT --page_num 1 --page_size 20
mexc contract trade order-config

# --- Order place / cancel / change ---
mexc contract trade create --data '{"symbol":"BTC_USDT","side":1,"type":1,"openType":1,"vol":1,"price":90000,"leverage":20}'
mexc contract trade cancel --data '[123456,123457]'
mexc contract trade cancel-all --data '{"symbol":"BTC_USDT"}'
mexc contract trade change-limit-order --data '{"orderId":123456,"price":91000,"vol":2}'
mexc contract trade chase-limit-order --data '{"orderId":"123456"}'

# --- Chase-limit orders ---
mexc contract trade chase-limit-place --data '{"symbol":"BTC_USDT","side":1,"vol":1,"leverage":20,"openType":1}'
mexc contract trade chase-limit-stop --data '[123456,123457]'
mexc contract trade chase-limit-cancel --data '[123456,123457]'

# --- Plan (trigger) orders ---
mexc contract trade planorder-place-v2 --data '{"symbol":"BTC_USDT","side":1,"triggerPrice":95000,"vol":1,"openType":1,"triggerType":1,"trend":1,"orderType":5,"executeCycle":1,"leverage":10}'
mexc contract trade planorder-cancel --data '[{"symbol":"BTC_USDT","orderId":123456}]'
mexc contract trade planorder-cancel-all --data '{"symbol":"BTC_USDT"}'
mexc contract trade planorder-orders-v2 --symbol BTC_USDT --page_num 1 --page_size 20
mexc contract trade planorder-change-price --data '{"symbol":"BTC_USDT","orderId":123456,"triggerPrice":96000,"price":96000,"orderType":1}'
mexc contract trade planorder-change-stop-order --data '{"symbol":"BTC_USDT","orderId":123456,"stopLossPrice":80000,"takeProfitPrice":110000}'

# --- Take-profit / stop-loss orders ---
mexc contract trade stoporder-place-v2 --data '{"positionId":111,"takeProfitPrice":100000,"stopLossPrice":80000}'
mexc contract trade stoporder-cancel --data '[{"symbol":"BTC_USDT","stopPlanOrderId":222}]'
mexc contract trade stoporder-change-price --data '{"orderId":222,"stopLossPrice":80000,"takeProfitPrice":100000}'
mexc contract trade stoporder-change-plan-price --data '{"stopPlanOrderId":222,"stopLossPrice":80000,"takeProfitPrice":100000}'
mexc contract trade stoporder-change-plan-order --data '{"orderId":222,"stopLossPrice":80000,"takeProfitPrice":100000}'
mexc contract trade stoporder-cancel-all --data '{"symbol":"BTC_USDT"}'
mexc contract trade stoporder-orders-v2 --symbol BTC_USDT --page_num 1 --page_size 20
mexc contract trade stoporder-open-orders --symbol BTC_USDT --includeLimit false

# --- Trailing (track) orders ---
mexc contract trade trackorder-place --data '{"symbol":"BTC_USDT","side":1,"vol":1,"openType":1,"backType":1,"backValue":0.5}'
mexc contract trade trackorder-cancel --data '{"symbol":"BTC_USDT","trackOrderId":333}'
mexc contract trade trackorder-change-order --data '{"symbol":"BTC_USDT","trackOrderId":333,"backType":1,"backValue":0.8}'
mexc contract trade trackorder-list --symbol BTC_USDT --states 1 --pageIndex 1 --pageSize 20

# --- Positions query ---
mexc contract trade open-positions --symbol BTC_USDT
mexc contract trade history-positions-v2 --symbol BTC_USDT --page_num 1 --page_size 20
mexc contract trade history-positions-liquidate --symbol BTC_USDT --positionId 111
mexc contract trade funding-records --symbol BTC_USDT --page_num 1 --page_size 20
mexc contract trade funding-records-summary --symbol BTC_USDT
mexc contract trade position-funding-detail --symbol BTC_USDT --pageIndex 1 --pageSize 15
mexc contract trade margin-change-details --positionId 111 --symbol BTC_USDT --pageIndex 1 --pageSize 5
mexc contract trade open-position-leverage-history --positionId 111 --index 1 --limit 10
mexc contract trade leverage --symbol BTC_USDT --needMaxLeverage false
mexc contract trade position-mode

# --- Liquidation-price calculators ---
mexc contract trade calc-liquidate-price --id 111 --lever 20
mexc contract trade order-calc-liquidate-price --data '{"symbol":"BTC_USDT","side":1,"type":1,"openType":1,"vol":1,"price":90000,"leverage":20}'
mexc contract trade order-calc-liquidate-price-v2 --data '{"symbol":"BTC_USDT","type":1,"positionMode":1}'

# --- Position management (write) ---
mexc contract trade change-margin --data '{"positionId":111,"amount":10,"type":"ADD"}'
mexc contract trade change-auto-add-im --data '{"positionId":111,"isEnabled":true}'
mexc contract trade auto-add-im-change-history --data '{"positionId":111,"pageSize":5}'
mexc contract trade change-leverage --data '{"symbol":"BTC_USDT","positionType":1,"openType":1,"leverage":20}'
mexc contract trade change-position-mode --data '{"positionMode":1}'
mexc contract trade close-all
mexc contract trade reverse --data '{"symbol":"BTC_USDT","positionId":111,"vol":1}'
```

## Workflows

**Open a position with attached TP/SL**
1. `create` with `takeProfitPrice`/`stopLossPrice` in the body, or place the order then
2. `stoporder-place-v2` against the resulting `positionId`.

**Adjust and close a position**
1. `open-positions` → find the `positionId`.
2. `change-leverage` / `change-margin` as needed (confirm each write).
3. `reverse` to flip the side, or `close-all` to flatten every open position (confirm first).

## Notes for Agents

**General rules**
- Retry only idempotent ops (idempotent=yes); never auto-retry an `idempotent=no` op (placements, margin change, close/reverse).
- Show a summary and wait for explicit user confirmation before any write operation.
- Unsure about parameters or a body shape? run `mexc schema contract.trade.<op>` instead of guessing.
- On a structured credential/login error, load the `mexc-auth` skill to prepare the API key; common error/safety rules → load the `mexc-common` skill. Then replay; this skill does not describe login.

**Skill-specific notes**
- `cancel`, `chase-limit-stop`, `chase-limit-cancel` take a raw JSON array of ids through `--data`, not an object body.
- Order `side` and `type` are numeric codes (see Core Concepts); pass the integer, not a label.
~~~~
