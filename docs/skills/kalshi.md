# Kalshi autonomous trading agent workspace (kadengriffith/kalshi): 1 prompt-skill, no license

| | |
|---|---|
| Repo | https://github.com/kadengriffith/kalshi (individual developer, community, not a Kalshi project) |
| Commit | `639606d104a0459727ef81511652f5468b439154` (committed 2026-02-13, the only commit date seen; the repo is 9 months old at scrape time) |
| License | **None.** No `LICENSE` file, no license field anywhere. Treated as all rights reserved, so this page has a detailed summary and short quotes only, no full text of the prompt. |
| Date scraped | 2026-11-11 |
| Install | No installer. The README tells you to clone the repo and run Python files. The agent is started with `Prompt.md`: 178 bytes telling it to act autonomously following `kalshi/KalshiTradingAgent.prompt.md`. |
| Runtime | Python with `numpy`, `requests`, `cryptography` (the prompt tells the agent to `pip install` them); env vars `KALSHI_API_KEY_ID` and `KALSHI_PRIVATE_KEY` (RSA private key PEM, per `.env.example`) |

Method: shallow clone read as plain files. Nothing was run, including `kalshi/kalshi.py`, which was read to see what the commands do.

## What is actually in the repo

The README describes a skill at `Skills/kalshi-predictions/` (with `SKILL.md`, `scripts/kalshi.py`, `references/`) and a `test_skill_demo.py`. **None of those exist at this commit.** There is no `SKILL.md` anywhere. The "skill" is therefore a prompt file plus a CLI:

- `kalshi/KalshiTradingAgent.prompt.md` (11 KB): the agent instructions.
- `kalshi/kalshi.py` (26 KB): CLI with subcommands `hot`, `stats`, `buy`, `sell`, `cancel`, `account`, `edge`. Also contains a small Coinbase public-API client and Holt smoothing, Kelly and edge helpers.
- `kalshi/kalshi-api-documentation.md` (31 KB): Kalshi docs index snapshot; `coinbase-api-documentation.md`; `portfolio_state.schema.json`; empty `Learnings.md`; `Changelog.md` ("No entries."). The README names `learnings.md` lowercase and a gitignored `portfolio_state.json` and `watchlist.json`, which would hold account balances and positions locally.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `KalshiTradingAgent.prompt.md` (single prompt, no SKILL.md) | Autonomous prediction-market trader: scans Kalshi sports (college basketball first), weather and economics markets, researches outcomes, estimates edge, places bets, tracks state | `python kalshi/kalshi.py hot, stats, buy, sell, cancel, account, edge`; `jq`; `curl` to `api.weather.gov` and `api.open-meteo.com`; scraping of DRatings, ESPN BPI and odds sites; WeatherAPI with `WEATHERAPI_KEY` | live by default (production `https://api.elections.kalshi.com/trade-api/v2`); `--demo` flag switches to `https://demo-api.kalshi.co/trade-api/v2` | "Never risk more than 10% of your account on a single bet". "Always cross-reference at least 2 data sources before placing any bet". "Maximum 48-hour expiration window". "Minimum $100 volume on a market". |

## Guardrails: what is model-enforced and what is code-enforced

**Code-enforced:** almost nothing. `kalshi.py` checks that `--price` is strictly between 0 and 1 and that credentials are present. There is no confirmation step, no size cap, no daily-loss limit, no market allowlist and no check of the prompt's "Hard Limits". `buy` and `sell` call `POST /portfolio/orders` immediately. The demo environment is opt-in via `--demo`, so the default is real money. A `buy` without `--price` sends `type: limit` with no price, which depends on the exchange rejecting it. Any exposure limit comes from Kalshi's own account rules.

**Model-enforced (the entire "Hard Limits" list):** 10% of account per bet, no hard-to-sell sides (the example given is "a 1% chance of an outcome with an extremely high payout"), two independent data sources, 48 hour expiry window, $100 minimum market volume, "Halt if you consistently run into API errors and contact me via text." These can be skipped by the agent with no technical consequence.

Problems with the prompt itself:

- **Autonomy is the design.** Opening line: "Act autonomously and confident in yourself to maximize your Kalshi win rate and P&L." The entry `Prompt.md` ends "Let's get that money!" There is no human approval step per bet.
- **The prompt contradicts its own limits.** "Size winning bets higher before they close" and "If other active open positions are succeeding, reverify and optionally double down" push toward larger positions while the cap is 10% per bet. "Bet whenever you identify positive expected value ... Even a small edge (5-10%) is worth taking" is looser than the workflow line "If edge > 5% and supported by 2+ data sources, consider placing a bet". The edge is the agent's own estimate against the price, with no calibration or backtest.
- **Self-modifying instructions.** "You may edit this file to improve your capabilities", and the agent may create scripts and skills in the workspace and edits to two named files (the file names are blank in the prompt text) "should not be recorded" in the public Changelog. The rules above can be edited out by the agent that is bound by them.
- **Untrusted web content drives bets.** Probabilities come from scraped DRatings and ESPN pages, weather APIs and odds sites; nothing says to treat page text as data rather than instructions.
- **Unverifiable "true and reliable data" rule.** "Calculations and your thesis must use true and reliable data sources" has no mechanism.

Flags on secrets and files:

- `KALSHI_PRIVATE_KEY` is an RSA private key passed as an environment variable; `kalshi.py` reconstructs the PEM from a single-line value and signs each request (RSA-PSS, SHA-256). The key is never written to disk by the code. `.gitignore` excludes `.env`, `portfolio_state.json` and `watchlist.json`.
- The agent is told to write notes, a private strategy diary (`Learnings.md`) and `portfolio_state.json` snapshots with balances, positions and orders in the repo directory. These persist and contain account data.
- The curl examples send `User-Agent: ZoComputer`, which suggests the author runs it on a hosted agent platform; a hosted runtime means the key lives in that provider's environment.
- No self-updating code and no network fetch of code. The prompt does tell the agent to `pip install` packages if needed.

Bottom line: a hobbyist autonomous bettor with a live-money default and an advisory-only risk list. It is useful as a record of what an unattended prediction-market agent prompt looks like, and a poor template for anything that should be gated.
