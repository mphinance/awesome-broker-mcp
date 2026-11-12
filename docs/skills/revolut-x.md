# Revolut X official agent skills (revolut-agent-skills)

| | |
|---|---|
| Repo | https://github.com/revolut-engineering/revolut-agent-skills |
| Commit | `918c801e8d9c62989ce228db1936038831dd03ad` (committed 2026-05-11) |
| License | **None.** No LICENSE file, no license field in any skill frontmatter. All rights reserved by default, so this page has summaries and short quotes only, no full SKILL.md text |
| Date scraped | 2026-11-11 |
| Install | `npx skills add revolut/revolut-agent-skills` (project) or `... --global`. Manual: clone and copy `skills/revolut-x/*` into `.claude/skills/`. The README names the repo `revolut/revolut-agent-skills`; the repo we cloned is `revolut-engineering/revolut-agent-skills`. |
| MCP | None. Skills shell out to a bundled Python helper. |
| Status | "Technical preview", every skill is version 0.1.0. The README is full of unresolved `<!-- DEV: ... -->` comments (env var names, repo URL, skills audit pending). |

Method: shallow clone, read as plain files. No script or installer from the repo was executed.

## Structure

Seven skills, all under `skills/revolut-x/`, all for the Revolut X crypto exchange REST API (`https://revx.revolut.com/api/1.0`). Each has a `SKILL.md`, a `references/schemas.md`, and a `scripts/` helper. The six authenticated skills carry byte-identical copies of `scripts/revx_sign.py` (same md5); the public one has `revx_request.py`.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text and enforcement |
|---|---|---|---|---|
| `revolut-x-auth` | Generates an Ed25519 keypair, registers the public key, exports env vars, explains signing, debugs 401/403/409 | `openssl genpkey`, `openssl pkey`, `python scripts/revx_sign.py GET /api/1.0/balances` | read (verification call), plus key creation on disk | "Private keys are secret, never share, commit, or include in requests." Model-enforced |
| `revolut-x-configuration` | Currencies, pairs, min/max size, step, status | `revx_sign.py GET /api/1.0/configuration/...` | read | "Always check pair `status` is `active` before placing orders." Model-enforced |
| `revolut-x-balance` | Available, reserved, staked, total per currency | `revx_sign.py GET /api/1.0/balances` | read | None needed. README warns balances enter model context |
| `revolut-x-orders` | Place market and limit orders, list active and historical, cancel one, cancel all | `revx_sign.py POST /api/1.0/orders`, `DELETE /api/1.0/orders/<id>`, `DELETE /api/1.0/orders` | **live** | "NEVER place or cancel orders without explicit user confirmation." Model-enforced; the helper has no prompt, no dry run |
| `revolut-x-trades` | Public trade history, private fills, execution details | `revx_sign.py GET /api/1.0/trades/private/<pair>` | read | None needed |
| `revolut-x-market-data` | Authenticated tickers, OHLCV, order book to 20 levels | `revx_sign.py GET /api/1.0/tickers`, `/candles/<pair>`, `/order-book/<pair>` | read | None needed |
| `revolut-x-public-market-data` | Public 5-level book and last 100 trades, no key | `python scripts/revx_request.py GET /api/1.0/public/...` | read, public | None needed |

## Per-skill notes

### revolut-x-orders (the only trading skill)

Walks the agent through pre-flight (pair constraints from `revolut-x-configuration`, balance from `revolut-x-balance`, size within min and max), then a confirmation summary, then `POST /api/1.0/orders` with a generated UUID `client_order_id`. Order shapes covered: market (by `base_size` or `quote_size`), limit with `allow_taker` or `post_only`. The schemas file also documents `conditional` and `tpsl` order types, but the skill only teaches placing market and limit orders; those two types appear on the read side. The README's blurb "Place, cancel, and query orders (market, limit, conditional, TPSL)" therefore overstates what the skill places.

Key quotes (verbatim, short):

- "NEVER place or cancel orders without explicit user confirmation. These operations move real money."
- Missing symbol, side, size or order type: the skill says to ask the user and never guess (paraphrased).
- Cancel all: "Warning: Cancels every open limit, conditional, and TPSL order."
- "Limit order rate limit: 1000 placements per day" (server limit, not a safety control).

Enforcement: **model-enforced only.** `revx_sign.py` takes `METHOD PATH [--query] [--body]` and sends. It has no confirmation, no dry run, no notional cap, no allowlist. The restricted-key advice in the README ("read-only permissions (when available)") is the only structural control, and it is advice. Whether Revolut X offers a trade-disabled key tier was not verified.

## Things to flag

- **The model supplies the signed request.** The model composes the method, path and JSON body, and the helper signs whatever it is given. Signing itself is in Python, not hand-rolled by the model, which is the safer design. But the `revolut-x-auth` skill also documents manual signing (`references/signing-examples.md`, Python and Node) and the message format, so an agent that cannot run the helper is told how to build signatures itself.
- **Secrets and key files.** The auth skill has the agent run `openssl genpkey -algorithm ed25519 -out private.pem` in the current directory, which puts an unencrypted private key in whatever project the agent is working in (the skill warns not to commit it, nothing enforces that). `REVX_PRIVATE_KEY` is a path to the PEM, and `revx_sign.py` loads it with no password. Debug steps tell the agent to run `echo $REVX_API_KEY`, which prints the API key into the transcript. Generate the keypair yourself outside the repo, and keep the key file in a directory the agent cannot reach if you can.
- **Cancel-all is one command.** `DELETE /api/1.0/orders` has a prose warning only.
- **Dependency installs.** The helper exits with "Run: pip install httpx / cryptography / pynacl" if imports fail. The skill does not tell the agent to install them itself, but an agent may.
- **No self-updating code** in the repo itself. The README advises `npx skills update`, which pulls newer skill text from upstream without a diff review.
- **Capability labels.** No paper or demo mode is mentioned anywhere. Every orders call is live money.
- **PII.** The README notes balances and history enter the model context.
