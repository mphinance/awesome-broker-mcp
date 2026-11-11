# Polymarket agent skill (Polymarket/agent-skills)

| | |
|---|---|
| Repo | https://github.com/Polymarket/agent-skills |
| Commit | `91ee44ae113e958affd20cd505c6e9d9d6100e0b` (committed 2026-02-19) |
| License | **None.** No LICENSE file in the clone; GitHub license info is null. Counts as no license. |
| Date scraped | 2026-11-11 |
| Install | Not documented in the repo. The README's quick start is SDK installation for humans: `npm install @polymarket/clob-client ethers@5.8.0` or `pip install py-clob-client`. For skill loading, the generic route is `npx skills add Polymarket/agent-skills` (inferred from the survey index; the repo does not state it). The README describes a `web3-polymarket/` folder, but the clone has the files at the repo root. |

Method: shallow clone, files read as plain text. Nothing executed.

Why no full SKILL.md: no license, so this page has a detailed summary and short quotes only. The repo contains no guardrail text, so there is nothing to quote (see below).

An OKX-published Polymarket plugin (`polymarket-plugin`, with a Rust binary and extensive confirmation text) is a different artifact, listed in [okx-plugin-store.md](okx-plugin-store.md).

## Structure

One skill, `web3-polymarket`: `SKILL.md` (8 KB, quick reference and core code patterns) plus seven on-demand reference files: `authentication.md`, `order-patterns.md`, `market-data.md`, `websocket.md`, `ctf-operations.md`, `bridge.md`, `gasless.md` (about 60 KB total with README). It is an SDK integration reference written for developers and agents that build trading code, not a task-runner: it teaches API endpoints, contract addresses and code snippets, and it does not tell the agent how to behave with a user's money.

## Summary table

| Skill | What it does | APIs and SDK calls referenced | Capability | Guardrail text |
|---|---|---|---|---|
| `web3-polymarket` | Teaches Polymarket integration on Polygon: L1 EIP-712 and L2 HMAC authentication; limit and market orders (GTC, GTD, FOK, FAK, batch, post-only, heartbeat); Gamma, Data and CLOB reads; WebSocket market, user and sports channels; CTF split, merge, redeem and negative-risk conversion; bridge deposits and withdrawals; gasless relayer transactions with builder credentials | `@polymarket/clob-client` and `py-clob-client` (`createOrDeriveApiKey`, `createAndPostOrder`, `getOrderBook`, `postHeartbeat`), `@polymarket/builder-relayer-client`, `@polymarket/builder-signing-sdk`; endpoints `clob.polymarket.com`, `gamma-api.polymarket.com`, `data-api.polymarket.com`, `bridge.polymarket.com`, `relayer-v2.polymarket.com`, three `wss://` feeds; five Polygon contract addresses (USDC.e, CTF, CTF Exchange, Neg Risk CTF Exchange, Neg Risk Adapter) | live (real USDC.e on Polygon; no paper or sandbox mode mentioned). Reads need no auth. | None found. A grep of all nine files for confirm, never, warning, risk and careful found only chain-finality status names and a heartbeat timing note. |

## Guardrails: model-enforced vs code-enforced

- **Model-enforced:** nothing, because there are no rules. No confirmation step before an order, no size or notional limit, no instruction to preview, no kill switch advice, no "do not trade without approval". The skill's trigger text is "Use when building AI agents, autonomous market makers, prediction market UIs", so it positions itself for autonomous use.
- **Platform-enforced (by Polymarket, not by the skill):** order rejection when the tick size is wrong or balance and allowance are insufficient (`INVALID_ORDER_NOT_ENOUGH_BALANCE` in `order-patterns.md`); the funder must set USDC.e or conditional-token allowances before trading; the 10 second heartbeat, where "all of your open orders will be cancelled" if a valid heartbeat is not received in time. That last one is a useful dead-man switch for a market-maker bot, and the skill documents it as a protocol rule rather than as a safety recommendation.
- **Documented footgun:** `bridge.md` says "Do not pre-generate withdrawal addresses. Generate them only when ready to execute." Withdrawals (`POST /withdraw`) move funds off-platform with no confirmation guidance.

## Secrets and file access

- Every client example reads the signer key from the environment: `new Wallet(process.env.PRIVATE_KEY)` in TypeScript and `os.getenv("PRIVATE_KEY")` in Python. This is a raw wallet private key, not a scoped API key: it can sign any on-chain transfer, not just Polymarket orders. API credentials are derived from it (`createOrDeriveApiKey`).
- Builder credentials are separate environment variables (`POLY_BUILDER_API_KEY`, `POLY_BUILDER_SECRET`, `POLY_BUILDER_PASSPHRASE`) for the relayer.
- `funder` and `signatureType` (0 EOA, 1 POLY_PROXY, 2 GNOSIS_SAFE) are written into example code; the proxy address comes from polymarket.com/settings.
- No file reads or writes by the skill itself. No install scripts, no self-update.

## Gap list

1. No license; the pack cannot be redistributed or reproduced here beyond short quotes.
2. Zero confirmation, limit or preview guidance for an agent trading real USDC.e.
3. The credential model is a full wallet private key in an environment variable.
4. Install instructions for the skill are not in the repo.
