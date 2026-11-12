# BingX official agent skills (api-ai-skills)

| | |
|---|---|
| Repo | https://github.com/BingX-API/api-ai-skills |
| Commit | `660ab65f3991494dc01cc8025ee3844efe95cd7c` (committed 2026-11-10) |
| License | **None on file.** There is no LICENSE file. `package.json` says `"license": "MIT"` and that is the only claim, so we treat the repo as unlicensed (all rights reserved). This page has summaries and short quotes only, no full SKILL.md text. |
| Date scraped | 2026-11-11 |
| Install | Three routes in the README: tell the agent "Set up the skills https://github.com/BingX-API/api-ai-skills"; `/plugin marketplace add BingX-API/api-ai-skills` then `/plugin install bingx-ai-skills`; or `npx skills add BingX-API/api-ai-skills`. |
| MCP | None. Skills teach the model to write and run its own signed REST calls (TypeScript) and, for the strategy skills, bundled Python scripts. |

Method: shallow clone, read as plain files. No script or installer from the repo was executed. This repo has 29 skill modules, so we read the trading-relevant ones in full (`swap-trade`, `spot-wallet`, `sub-account` interaction rules, the three strategy skills) and sampled the rest with targeted reads of their guardrail sections and scripts.

## Environments

`references/base-urls.md` defines two: `prod-live` (`open-api.bingx.com`) and `prod-vst` (`open-api-vst.bingx.com`, "Production Simulated (Testnet)", also called VST virtual trading). The doc says: "Default: Use `prod-live` for real trading." Every code sample in every trading skill passes `"prod-live"` literally. VST is the paper mode and needs no confirmation.

## Summary table

All 29 skills in one table. "Signing" means the model writes the signed request.

| Skill (dir / name) | What it does | Tools / CLI called | Capability | Guardrail text and enforcement |
|---|---|---|---|---|
| `swap-market` | USDT-M perp prices, depth, klines, funding, OI | Public REST, model-written TypeScript | read | None needed |
| `swap-trade` | Place, batch, cancel, amend, close all, TWAP, leverage, margin type, position mode, auto-add margin, reverse position, VST faucet (`getVst`) | Signed REST via `fetchSigned` | **live (prod-live) or paper (prod-vst)** | "prod-live: Ask user to type CONFIRM before any order placement, cancellation, or position/leverage change." Model-enforced |
| `swap-account` | Balance, positions, income, commission | Signed GET | read | "read-only (GET)". Nothing to enforce |
| `spot-market` | Spot prices, depth, klines | Public REST | read | None needed |
| `spot-trade` | Spot orders, OCO, cancel, fills | Signed REST | **live or VST** | CONFIRM on prod-live. Model-enforced |
| `spot-account` | Balances, asset transfers between accounts | Signed REST | read plus **live transfer** | CONFIRM before transfer. Model-enforced |
| `spot-wallet` | Deposit address, deposit and **withdrawal** history, **initiate withdrawal** to any address | `POST /openApi/wallets/v1/capital/withdraw/apply` | **live, funds leave the exchange** | "requires CONFIRM on prod-live", with a summary of coin, network, address, amount. Model-enforced only |
| `cswap-market` | Coin-M perp market data | Public REST | read | None needed |
| `cswap-trade` | Coin-M orders, leverage, margin | Signed REST | **live or VST** | CONFIRM on prod-live. Model-enforced |
| `copytrade-spot` | Copy-trader spot sell, profit queries | Signed REST | **live write** (sell) | CONFIRM before sell on prod-live. Model-enforced |
| `copytrade-swap` | Copy-trader close position, set TP/SL, **set commission rate**, queries | Signed REST | **live write** | CONFIRM for `closePosition`, `setTPSL`, `setCommissionRate`. Model-enforced |
| `fund-account` | Fund balance, asset overview, inter-account and **internal P2P transfer** | Signed REST | read plus **live transfers** | CONFIRM before transfer or internal transfer. Model-enforced |
| `sub-account` | Create and list sub-accounts, freeze and unfreeze, **create, edit, delete sub-account API keys**, authorize transfers, transfer assets | Signed REST (JSON bodies) | **live write, touches key management** | CONFIRM before "any create, edit, delete, freeze, or transfer operation". Model-enforced |
| `agent` | Affiliate and broker: invited users, commissions | Signed GET | read | "read-only (GET)" |
| `standard-trade` | Standard-contract positions, orders, balance | Signed GET | read | "read-only (GET)" |
| `announcement` | Official announcements | Public GET | read | None needed |
| `swap-ws-market`, `spot-ws-market`, `cswap-ws-market` | Live market streams | WebSocket, public | read | "NEVER return code to the user" output rule only |
| `swap-ws-account`, `spot-ws-account`, `cswap-ws-account` | Live order, position, balance streams | Listen key via REST, then WebSocket | read | Same output rule. Listen key (`userDataStream`) is minted, extended every 30 min |
| `bingx-technical-analysis` | 78 indicators, 62 candle patterns, multi-timeframe score, divergences | Public klines plus bundled Python (`analyze.py`, `score.py`, `patterns.py`) | read | "read-only market data queries" |
| `bingx-rsi-bottom-hunter` | Polls RSI, enters a long when oversold, with SL/TP | Klines, then `POST /openApi/swap/v2/trade/order`, `strategy.py` | **live or VST, polling loop** | "Agent MUST NOT place orders automatically without confirmation", CONFIRM on prod-live. Model-enforced |
| `bingx-maker-entry` | Multi-level limit orders near best price, 3-second monitoring loop, re-prices and cancels | depth, `POST`/`DELETE` order | **live or VST, loop** | "Do NOT place orders without confirmation", CONFIRM on prod-live. Model-enforced |
| `bingx-dynamic-sl-tp` | ATR, trailing, break-even, partial TP: cancels and re-places conditional orders | klines, `POST`/`DELETE` order | **live or VST** | "Do NOT place orders without confirmation", CONFIRM on prod-live to place or cancel. Model-enforced |
| `bingx-trade-review` | PnL, win rate, tags, reflections, charts | Signed GET, local scripts, writes `~/.bingx-skills/trade-review/trades.json` | read plus local file writes | None needed |
| `bingx-sentiment-dashboard` | Fear and Greed, funding heatmap, OI alerts, AHR999 | BingX public plus `api.alternative.me`, Python scripts | read | "must not place, cancel, or modify orders" |
| `bingx-trading-plan` | 6-dimension score, plan with entry, SL, TP, sizing | BingX public plus `ox-bigdata-api.houtai.io` | read | "must not place, cancel, or modify orders" |

## Guardrails: what is enforced and what is not

**Code-enforced: nothing we could find.** There is no CLI, no MCP server, no confirmation token and no cap anywhere in the repo. The only code is the `fetchSigned` TypeScript snippet pasted into each SKILL.md (HMAC signing, parameter validation, `.com` to `.pro` domain fallback) plus Python analysis scripts. The snippet validates parameter syntax (`FORBIDDEN = /[&=?#\r\n]/`, positive numbers, JSON shape of stop-loss objects). That protects the request format, not the account.

**Model-enforced only:**

1. The CONFIRM gate. It is a typed word the model asks for. The model also decides whether the word it received counts. Nothing records that it was typed.
2. The environment switch. `prod-live` is the default in `base-urls.md` and in every sample call. The model picks the environment string.
3. Withdrawal. `spot-wallet` withdraws to an arbitrary `address` after one CONFIRM, with no address allowlist, no cap and no cooldown in the skill. The skills never mention a withdrawal allowlist. The real controls are on the BingX side: new keys start read-only per `references/authentication.md`, and an IP whitelist per key is recommended there. Do not enable withdraw on a key you hand to an agent.
4. Sub-account key management. The model can create, edit and delete sub-account API keys and freeze accounts.
5. Strategy loops. RSI hunter polls every 5 minutes, maker entry every 3 seconds, and both place orders from a loop. They say to confirm first, and RSI hunter says "Strategy ends after one execution (single trigger, prevents repeated entries)". That limit is prose. Maker entry says orders are cancelled on timeout; that is the model's job too.

**VST fact worth knowing:** `swap-trade` lists `POST /openApi/swap/v2/trade/getVst` ("Get VST (virtual simulation trading)"), so the paper environment is real and reachable. Paper is the right default; the skills just do not default to it.

**Test endpoint caveat:** the skill itself warns "`/openApi/swap/v2/trade/order/test` does not enforce every validation performed by the real endpoint", so a passing test order proves little.

## Signed-request building by the model

This is the main design choice and the main risk. The skills say "You MUST copy the `fetchSigned` function below verbatim", then every example call has the form `fetchSigned("prod-live", API_KEY, SECRET, "POST", path, params)`. So the agent writes and runs a TypeScript program that holds the API key and secret as plain variables, signs, and sends. There is no wrapper that hides the secret from the model's context or limits what it can send. A model that deviates from "verbatim" (the skill says not to) changes the signing path unobserved.

`AGENTS.md` says the key and secret come from `BINGX_API_KEY` and `BINGX_SECRET_KEY` environment variables. Examples use bare `API_KEY` and `SECRET`. Nothing says how those reach the script. In practice the model will read the environment or ask you to paste them.

## Secrets, files and self-updating code

- **Secrets in model context:** yes, by design (see above). Use a key with only the permissions you need, IP-whitelisted, and prefer a VST key to start.
- **Third-party credentials:** `bingx-trading-plan` reads `LINDORM_ACCESS_TOKEN` and `LINDORM_PROXY_USER` from the environment (default proxy user `space_232` is hard-coded) and calls `https://ox-bigdata-api.houtai.io`, a non-BingX host, for long/short ratio and liquidation heatmap data. The skill says "never hard-code credentials".
- **Local writes:** `bingx-trade-review` persists trades, tags and reflections to `~/.bingx-skills/trade-review/trades.json` and charts to `~/.bingx-skills/trade-review/charts`. `bingx-sentiment-dashboard` writes PNGs under `~/.bingx-skills/sentiment/`. These contain your trade history in plain files.
- **Dependency installs:** the strategy skills declare `python_packages: ["pandas", "pandas-ta-classic"]` and per-skill `requirements.txt`. An agent that installs them runs third-party code.
- **Self-updating:** `plugin.yaml` lists `hooks: - SessionStart` and the keyword `auto-update`, but no hook file exists in the repo, so we found no update mechanism. We cannot say what the hook would do. The "AI conversation install" route ("Set up the skills <url>") means the agent fetches and installs whatever is at that URL at that moment.
- **Required header:** every request, including public ones, must carry `X-SOURCE-KEY: BX-AI-SKILL`, so BingX can attribute traffic from these skills.

## Notes on specific skills

- **`swap-trade`:** the most complete skill. 42 endpoints, a guided 8-step collect-then-confirm flow, order type enums (MARKET, LIMIT, STOP, STOP_MARKET, TAKE_PROFIT, TRAILING_STOP_MARKET and others), attached `stopLoss` and `takeProfit` objects, `closeAllPositions`, a `cancelAllAfter` kill switch, and TWAP. "Parameter security" rule: "NEVER copy raw user text into API parameters", with a character blocklist. That is a sensible prompt-injection defense and it is also model-enforced, though the TypeScript `validateParams` backs it up for the injection characters.
- **`spot-wallet`:** also exposes deposit address retrieval and deposit risk-control records. The withdraw flow collects coin, network, address, optional tag, amount and wallet type, then shows a CONFIRM summary.
- **`sub-account`:** covers API-key lifecycle for sub-accounts. Responses that return a key or secret will land in the transcript.
- **`copytrade-swap`:** can change a copy trader's commission rate, a money-affecting setting that a user may not expect an agent to touch.
- **Announcements and sentiment skills** pull public content (announcement text, third-party API output). Treat returned text as data, not instructions.
