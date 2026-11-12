# Broker agent skills

**About 250 agent skills from 30 brokers and exchanges, read line by line.** Which ones can place a live order, which only talk to paper, and where the guardrail is real code instead of a polite sentence.

An MCP server gives your agent hands. A skill tells it how to use them: when to trade, what to confirm, what never to touch. The tools are usually fine. The skill is where the safety rules live, and most of those rules are prose the model chooses to follow.

Scraped 2026-11-11. Every file linked below records repo URL, commit SHA, license, install command, a summary table, and a flag on each rule: **code-enforced** (the CLI or server blocks you) or **model-enforced** (the skill asks nicely).

## The scoreboard

| Broker | Skills | Live orders | Paper / demo | Guardrail that is real code | License | Doc |
|---|---|---|---|---|---|---|
| Alpaca | 13 | Broker API references | Trading API skills refuse live | Paper-only by skill design | Apache-2.0 | [alpaca](alpaca.md) |
| Binance | 21 | Yes | `testnet`, `demo` profiles | Prediction scaffold `budget_usd` and dry-run default | None at repo root (MIT on 4 dirs) | [binance](binance.md) |
| Bybit | 1 (15 modules), plus 4 and 1 | Yes, mainnet default | Testnet | Little. Most modules never confirm | MIT, others none | [bybit](bybit.md) |
| Coinbase | 2 | Send, swap, trade | None | None found | MIT | [coinbase](coinbase.md) |
| Crypto.com | 13 and 2 | Yes, production by default | UAT, opt-in | Tiers exist, but `acknowledged` is model-supplied | MIT or Apache-2.0 | [crypto-com](crypto-com.md) |
| cTrader | 2 | Yes | Demo | None. The agent types its own confirm | Proprietary EULA | [ctrader](ctrader.md) |
| Deriv | 8 | Yes | Demo | Mostly prose | MIT | [deriv](deriv.md) |
| eToro | Server-served skill, plus 2 | Yes | Demo | **Signed prepare/place tokens, server side** | None | [etoro](etoro.md) |
| Gemini | 3 | Yes | Sandbox | None, all prose | Apache-2.0 | [gemini](gemini.md) |
| Hyperliquid | 2 | Mainnet, no confirm text | Not mentioned in the skill | None | MIT | [hyperliquid](hyperliquid.md) |
| IG | 4 | Yes | Demo | Example code in `AGENTS.md` | MIT per skill | [ig](ig.md) |
| Kalshi | 0 real skills | Live by default | None | None | None | [kalshi](kalshi.md) |
| Kraken | 59 | Yes | Paper workspace | Paper depends on `--workspace` on every call | MIT | [kraken](kraken.md) |
| Longbridge | 13 and 1 | Yes | None | **CLI mints a single-use order code** | MIT | [longbridge](longbridge.md) |
| moomoo | 11 (hub) and 4 (plugin) | Yes | Sim skill | CLI dry-run plus a 3 digit code (guessable, see doc) | Hub: none. Plugin, CLI: MIT | [moomoo](moomoo.md) |
| NinjaTrader | 13 | Yes | Demo | Prose says Demo only, plugin ships a Live server | Apache-2.0 | [ninjatrader](ninjatrader.md) |
| OKX | 10, 7, 63 | Yes | `--demo` | `--confirm` preview on fixed-term earn | MIT | [okx](okx.md), [onchainos](okx-onchainos.md), [plugin-store](okx-plugin-store.md) |
| Polymarket | 1 | Yes | None | None | None | [polymarket](polymarket.md) |
| Public.com | 1, plus 2 forks | Yes, no paper mode | None | None, confirmation is model-only | Frontmatter only | [public](public.md) |
| Robinhood (community) | 2 | Via the official MCP | None | A guard hook that covers one tool, Claude Code only | MIT | [robinhood](robinhood.md) |
| Tiger Brokers | 7 and 2 | After preview | Paper by default | Opt-in read-only mode | Per skill | [tiger](tiger.md) |
| Trade It | 1 and 1 | Auto-execute accounts | None | None | MIT, one none | [trade-it](trade-it.md) |
| Truthifi | 3 | No, read-only | n/a | n/a | MIT | [truthifi](truthifi.md) |
| Upstox | 1 | Yes | None | A `safety` config block that no code reads | MIT | [upstox](upstox.md) |
| Webull | 1 (current), 1 (legacy), 9 (community) | Yes | Sandbox by env var | **Python guards: notional cap, symbol whitelist, audit log** | Apache-2.0 | [webull](webull.md), [legacy](webull-legacy.md), [community](webull-community.md) |
| Zerodha | 1 | Yes | None | **Dry run by default, in code** | MIT | [zerodha](zerodha.md) |
| Questrade (community, unvetted) | 1 | No, read-only | n/a | The server has no order tool | MIT | [questrade](questrade.md) |
| Saxo Bank (community, unvetted) | 9 | SIM autonomous, LIVE off by default | SIM | **Server-side LIVE flag, allowlists, caps, kill switch, single-use approval** | None (manifest claims MIT) | [saxo-bank](saxo-bank.md) |
| Schwab (community, unvetted) | 6, plus 1 (archived) | Yes | None | Archived CLI: config flag and preview digest. MCP server: a `confirmed` flag the model sets itself | MCP server none, CLI MIT | [schwab](schwab.md) |
| Tastytrade (community, unvetted) | 3 | Yes, live by default | Sandbox via env var | Optional Claude Code hooks: plan, bracket, concentration cap. Partly self-attested | None (metadata claims MIT) | [tastytrade](tastytrade.md) |

Counts are what we found in each repo, not marketing numbers. Where two counts appear, the second is a separate repo.

## What is actually enforced

Almost every guardrail is a paragraph in `SKILL.md`. The short list of ones that do not depend on the model behaving:

- **Longbridge:** the CLI generates a single-use confirmation code for an order. A model cannot invent one.
- **eToro:** the server signs a prepare token and checks it on place. No token, no order.
- **Webull:** notional cap, quantity cap, symbol whitelist and an audit log, in Python. Market orders skip the notional cap, and `--quiet` skips the prompt.
- **Zerodha Kite CLI:** dry run by default. Approval is still on the model.
- **moomoo CLI:** dry run plus a 3 digit `--execute` code. The code is deterministic and shows in the preview, so an agent can read it and resubmit. A typo guard, not a human gate.
- **OKX:** a `--confirm` preview on fixed-term earn only.
- **Binance:** the prediction scaffold's `budget_usd` and dry-run default only.

Everything else on the scoreboard is the model following instructions.

## Things we would want to know before installing

- **Coinbase `agentic-wallet`:** `awal send` and `awal trade` have no confirmation and no spend cap. The auth flow lets the agent log in itself through an email code.
- **Coinbase `coinbase-trading`:** states it trades "fully autonomously without confirmation", and its shipped `settings.json` pre-allows `create_order` and `move_portfolio_funds`.
- **Hyperliquid root skill:** places mainnet orders with no confirmation text.
- **Robinhood community skill:** grants itself autonomous consent and runs `sudo -n apt-get install jq`.
- **Kraken:** the default-on `feedback` tool uploads local files with no approval step. `recipe-emergency-flatten` bakes in `--yes`.
- **Self-updating instructions:** Bybit pulls its skill from a manifest. OKX plugin-store auto-updates binaries and `SKILL.md` with no checksum. Binance's CLI skill pipes an installer to `sh`. Read what they fetch before you let them.
- **Polymarket:** raw `PRIVATE_KEY` in environment variables, and no confirmation guidance.
- **NinjaTrader:** the prose says Demo only, the plugin ships a Live MCP server.
- **Kalshi:** the README describes a `Skills/` directory that does not exist.

None of this means skip them. It means the skill is a draft, not an interlock. Pair it with the broker's own controls: paper first, small size, API keys scoped to what the agent needs.

## How we handle licenses

A repo with no LICENSE file is all rights reserved, so we do not republish it.

- **OSI license (MIT, Apache, BSD):** full `SKILL.md` text for trading skills, in a fenced block.
- **No license, or proprietary:** a detailed summary and short verbatim guardrail quotes, plus a link pinned to the commit.

On 2026-11-11 we opened an issue asking for a LICENSE file on 12 repos that had none: Public (3), Tiger (2), Polymarket, Trade It, moomoo agent-hub, Binance skills hub, Bybit (2), and Kalshi. If one gets a license, the doc gets upgraded.

## How we read them

Shallow clone, read as plain files, commit SHA recorded. Nothing from any repo was executed, installed or connected to an account. Hosted endpoints were probed with an unauthenticated `initialize` request only.

## Brokers with no skills found

No official skills from Tastytrade, Tradier, Interactive Brokers, Schwab, TradeStation, TradeZero, SnapTrade, Tradovate, or Robinhood. Tastytrade, Schwab, Saxo and Questrade have unvetted community skills (see the scoreboard). Evidence for each is in the survey notes in the entries themselves. Absence here means we searched the org and the entry, not that none exist anywhere.

## Built on these

Demos, bots and guides that use these skills and servers, with live or paper marked: [docs/projects](../projects/README.md).

## Fix us

Spot a skill we missed, a count that is off, or a repo that got a license? Open an issue or a PR. Include the commit SHA you looked at and what changed.
