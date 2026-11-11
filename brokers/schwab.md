---
name: Charles Schwab
region: US
status: community
trading: true
server_type: local
source_url: https://github.com/jkoelker/schwab-mcp
last_verified: 2026-11-11
---

# Charles Schwab

## Overview

Community server (`jkoelker/schwab-mcp`), self-hosted, not Schwab-provided. Actively
developed: about 352 commits, 69 stars, last push 2026-11-11. **No official Schwab AI assistant with
MCP exists** — Schwab has an assistant expected H2 2026 per earlier reporting, but
nothing MCP-shaped from Schwab itself was found in this repo or elsewhere.

## How to connect

```
schwab-mcp auth --client-id YOUR_KEY --client-secret YOUR_SECRET --callback-url https://127.0.0.1:8182
```
via `uv tool install` or `pip`. OAuth through the Schwab Developer Portal opens a
browser login; token saved locally to `~/.local/share/schwab-mcp/token.yaml`.

## Trading scope

Equities, options, complex strategies (bracket orders, OCO).

## Safety / guardrails

**Read-only by default.** Trading requires explicit opt-in *plus* an approval backend: a Discord bot, or
Signal via a local signal-cli REST daemon (one backend, not both). This is an
approval workflow — an unusual extra layer versus every other server in this
directory. Two-step order flow: preview first, then place by ID, specifically to
prevent an LLM from hallucinating a different order than what was previewed. A
bypass flag (`--jesus-take-the-wheel`) exists and is marked "DANGER" in the repo's
own docs — skips the approval layer entirely.

## Caveats

- The Discord-bot-approval requirement is a real setup cost most other brokers in
  this directory don't have — factor that in before assuming "connect and go."

## Other community servers

Not endorsed by Schwab; same credential-trust caveat as above. READMEs read 2026-11-11; stars and last push as of that date.

- [`sudowealth/schwab-mcp`](https://github.com/sudowealth/schwab-mcp): TypeScript, Cloudflare Workers with Durable Objects, OAuth 2.0 with PKCE (87 stars, last push 2025-06-02, no license file, not archived). README calls itself unofficial and "may be incomplete or unstable". Covers accounts, orders, quotes, options chains, movers. Stale for 5 months.
- [`itsmostafa/schwab-mcp`](https://github.com/itsmostafa/schwab-mcp): Go single-binary stdio server for the Trader API; README says it reads accounts, pulls market data and places trades (5 stars, last push 2026-09-16, MIT, not archived). Tool surface not enumerated here.
- `major/schwab-agent` and `major/schwab-agent-rs`: ARCHIVED agent-oriented Schwab CLI (last pushes 2026-05-18 and 2026-06-01), superseded by `major/schwab-rs`. Not read; listed so nobody builds on the archived repos.

## More community repos (checked 2026-11-11)

READMEs read 2026-11-11; stars and last push as of that date. All are unofficial, run with your own Schwab developer app secret and OAuth tokens, and we read READMEs, not source. The small ones are unvetted code with credentials that can trade. Many "schwab agent" search hits are unrelated "agentic SDLC" assessment repos and were ignored.

- [`pashpashpash/schwab-cli`](https://github.com/pashpashpash/schwab-cli): Rust, agent-first CLI (not MCP): OAuth, balances, positions, quotes, option chains, orders, streaming. 28 stars, last push 2026-05-21, MIT. Order preview is free; live place, replace and cancel need `SCHWAB_CLI_ALLOW_LIVE_TRADING=1` plus `--yes-live-order`. Installed by piping a script from GitHub raw to `sh`, so read it first.
- [`weig/schwab_cli`](https://github.com/weig/schwab_cli): CLI plus optional MCP server (`schwab server --enable-mcp`), quotes, option chains, positions, orders (place, preview, cancel, replace). 2 stars, last push 2026-10-26, MIT. We did not find a documented confirmation gate for order tools. Also offers an unauthenticated REST proof of concept.
- [`k1xme/schwab-mcp`](https://github.com/k1xme/schwab-mcp): 18 tools over Streamable HTTP (includes `place_order`, `replace_order`, `cancel_order`, `preview_order`) plus a Claude Code plugin with 6 `SKILL.md` skills. `place_order` uses `confirmed=False` as a dry run and the plugin tells Claude to submit only after explicit approval; that is convention, not an external approval channel. 0 stars, last push 2026-03-30, no license file.
- [`chensirui2008/schwab-mcp`](https://github.com/chensirui2008/schwab-mcp): TypeScript on Cloudflare Workers, self-hosted. Per-client `read_only` (default) or `full_access` scope, global `ENABLE_TRADING` killswitch defaulting to false, two-phase confirmation with verbatim phrase repetition, GitHub user ID allowlist. 1 star, last push 2026-11-06, Apache-2.0. Its 5 `SKILL.md` files are Cloudflare dev skills, not broker skills.
- [`tomasgesino/schwab-mcp`](https://github.com/tomasgesino/schwab-mcp): wheel-strategy tools (`sell_covered_call`, `sell_cash_secured_put`, `place_order`, `cancel_order`). Write tools default to `dry_run=true`. 4 stars, last push 2026-03-23, MIT.
- [`vsoneji/schwab-mcp`](https://github.com/vsoneji/schwab-mcp): TypeScript, looks like a copy of `sudowealth/schwab-mcp` (same README text), with `placeOrder` and `replaceOrder` marked "Experimental". 1 star, last push 2025-12-16, no license file.
- Smaller: `psonhoang/schwab-mcp` (local server on schwabdev, accounts, quotes, orders, transactions; 1 star, 2026-08-02, no license file; order tool surface not enumerated), `ronnotel/SchwabMCP` (.NET, 0 stars, 2026-07-15, MIT), `andrew-farrell-101/schwab-mcp` (**read-only**, 0 stars, 2026-05-22, MIT).
- [`dcsoft4/schwab_cli`](https://github.com/dcsoft4/schwab_cli): Python scripts with quotes, buy/sell orders and breakout entry helpers. 3 stars, last push 2026-07-11, license NOASSERTION.
- `major/schwab-agent` (Go CLI with 1 `SKILL.md`, 4 stars, MIT) is **archived**, last push 2026-05-18, and points to the also archived `schwab-agent-rs`. It had a `"i-also-like-to-live-dangerously": true` config flag and a 15-minute preview digest flow before order placement. Do not build on it.

