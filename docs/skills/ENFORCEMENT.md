# How a skill guards a live order: the Gate rung scale

The [scoreboard](README.md) flags every guardrail as **code-enforced** or **model-enforced**. That is a coin flip with a lot of room inside it. A dry-run flag, a signed token and a terminal prompt are all "code", and they stop very different things. This page splits the code half into rungs, so two skills that both say "confirmation" can be told apart.

**This is a read, not a test.** Every rung below was assigned by reading the per-broker docs in this directory, which were themselves written from files read at a pinned commit (scraped 2026-11-11). Nothing was run, installed or connected to an account. Where a doc says "not tested here", that still holds here. If a doc does not settle a placement, this page says so instead of picking a rung.

## The test: agent-satisfiable

Ask one question per write path:

> Can the agent, with the access it ships with (its shell, its tools, its config files, its own arguments), produce the artefact that gate asks for?

If yes, the gate is a **speed bump**. It catches a forgetful agent and does nothing against a careless or injected one. If no, it is a **gate**. A rung counts as a gate only when the answer is no.

Two consequences:

1. Rate each **write path**, not the skill. One skill can be G3 for orders and G0 for recurring-investment plans (Longbridge, below). Where a skill has several write paths, the skill's rung is its **weakest reachable write path**, and the per-path rungs are listed.
2. "Access it ships with" includes files. An env var, a `.env` or a policy file the agent can edit is an agent-satisfiable artefact. That is why Limits carry their own `agent-editable?` field.

## The rungs

| Rung | Name | Artefact the gate asks for | Who can produce it | Prevents | Does not prevent |
|---|---|---|---|---|---|
| **G0** | Prose only | A polite sentence in `SKILL.md` | The model, by choosing to comply | Nothing. Compliance is the whole mechanism | Everything. Same as the scoreboard's "model-enforced" |
| **G1** | Safe default | Paper, dry-run or sandbox is what you get if you say nothing | The agent, by adding a flag or flipping an env var | Forgetting | Deciding. One flag or `.env` edit turns it off |
| **G2** | Self-attested argument | `--confirm`, `--yes`, `confirm: true`, `acknowledged`; or a code printed in the preview that the agent can read, compute or guess and resubmit | The agent, in the same turn | A deliberate extra step; a typo or a double submit | A careless agent. It supplies the argument itself |
| **G3** | Bound token | A single-use or signed token, minted by the CLI or server, tied to the exact previewed order | Not the agent. It can relay the token but not mint or alter one | Placing something other than what was previewed; placing without a preview; replay | A bad decision. **Integrity, not authority.** Nothing in a token proves a human said yes |
| **G4** | Out-of-band human channel | An approval the agent cannot reach: a TTY prompt that refuses unattended writes, a UI approval, MCP elicitation the client renders, a harness tool prompt | A human, on a channel the agent does not control | An agent acting alone | A human who approves without reading, and every path that skips the channel (a bypass flag) |
| **G5** | No capability | There is no order tool, the scope is read-only, or the toolset is switched off | Nobody, because the capability is absent | Orders through that surface | Orders through any other surface the agent can reach (a shell, the broker's REST API, another MCP server) |

### Where G2 stops and G3 starts

A printed code is not automatically G2. Longbridge prints a code in the preview and so does moomoo. The difference is what the code is:

- **G3**: minted by the CLI or server, unforgeable by the agent, single-use, expiring and bound to the full request. The agent can read it and resubmit, and the gate still does its job, which is integrity: the order that goes out is the order that was previewed.
- **G2**: deterministic, small, guessable or computable, or scoped to only some fields. The agent can produce it without the preview, or change unbound fields after it.

So G3 is a statement about the order, never about consent. "The agent read the preview and passed the code back without asking the human" passes every G3 gate. Only G4 puts a human on the path. This is a judgement call in the scale and it is the one place it departs from a literal reading of "a code the agent can read".

### What G1 and G2 mean for the scoreboard flags

| Scoreboard flag | Rungs |
|---|---|
| model-enforced | G0 |
| code-enforced, agent-satisfiable | G1, G2 |
| code-enforced, not agent-satisfiable | G3, G4, G5 |

## Two fields that are not rungs

A rung says how one order is approved. It does not say how much the agent can do before and after, or how the gate gets defeated. Those are separate, so a skill is written as `rung | Limits | Bypass`.

**Limits.** Caps on what an order may be, independent of approval: notional or quantity cap, symbol allowlist, daily-loss halt, kill switch, budget. Each limit is listed with `agent-editable? Y/N`: can the agent, with the access it ships with, raise or remove it? A cap in a server-side risk setting the agent has no tool for is **N**. A cap in a `.env` or policy file the agent can read is **Y**. If the docs do not say, the entry says `unsettled`. A skill can have strong Limits and G0 approval (Webull), or G4 approval and no Limits (MEXC).

**Bypass.** The named ways to defeat the gate, taken from the docs, not invented: a flag (`--yes`, `--quiet`, `-y`), an env flip, editing `.env` or a policy file, calling the broker API directly, a second MCP server that is still configured, a path the gate does not cover.

## Worked examples

Each row cites the doc it was read from. Quotes are short, and only from the doc.

| Skill / path | Rung | Limits | Bypass | Doc |
|---|---|---|---|---|
| **Longbridge** `order buy\|sell\|cancel\|replace` | **G3.** CLI prints a preview and a code that is "single-use, expires 10 minutes after the preview, and is tied to that exact request"; changing any field invalidates it | None in the skill text (no notional, quantity or daily-loss cap) | The agent can show the preview and pass the code straight back without asking. Same skill, `dca` and `fund submit-order` have no dry run, so those paths are **G0** or rely on a `--yes` the skill forbids | [longbridge](longbridge.md#guardrails-what-is-model-enforced-and-what-is-code-enforced) |
| **eToro** `prepare-trade` / `place-trade` (server-served skill) | **G3.** The server mints a short-lived signed token (about two minutes) that seals the exact order; `place-trade` takes only that token, and rejects an expired, tampered or wrong-connection one | API-key scopes (`real:read`, and so on), server side. No spend or daily-loss cap in the skill text | `place-trade` straight after `prepare-trade`: "Nothing in the token proves a human said yes". `execute-write` (the generic executor) is **G0** | [etoro](etoro.md#guardrails-what-is-model-enforced-and-what-is-code-enforced) |
| **Saxo Bank** (community) `saxo-trading`, LIVE | **G3** on the server (single-use preview token, five-hour expiry, bound to a request fingerprint), with a chat approval statement on top. The doc notes the statement is handed to the agent and "No second person or second approval factor is required", so the human step is **not** shown to be G4 | Server-side LIVE flag (off by default), account and instrument allowlists, quantity and notional caps, kill switch. **agent-editable?** The variables "live in your shell or MCP config, which an agent with file access can read, and possibly edit": treat as **Y** until shown otherwise | Edit the shell or MCP config that opens the gate. SIM trades need no approval by design | [saxo-bank](saxo-bank.md#guardrails-what-is-model-enforced-and-what-is-code-enforced) |
| **MEXC** `spot/trade`, `contract/trade` | **G4.** Any write prompts on a real terminal; if stdin and stdout are not a terminal the CLI "refuses with `confirmation_required`, exit 10". On the MCP server a host that renders elicitation takes the human's click and ignores the `confirm` argument | `--read-only` (a **G5** switch: every write fails). No size or loss cap in the skills | `--yes`: "is taken as the user's confirmation and nothing is asked, even in a real terminal". Piping a body with `--data -` makes the write unattended. Hosts with no elicitation dialog fall back to `confirm=true` (**G2**) | [mexc](mexc.md#guardrails-what-is-enforced-and-what-is-not) |
| **Webull** `webull-openapi` skill | **G0** for approval: the doc grepped the skill CLI for `confirm`, `input(`, `isatty` and `--yes` and found "no prompt, no confirmation token and no dry-run gate" | **Limits-only.** Python `OrderValidator`: quantity cap, per-market notional caps, optional symbol whitelist, audit log. **agent-editable? Y**: configured from the same `.env` the agent can read. Market orders skip the notional cap | `WEBULL_ENVIRONMENT=prod` flips sandbox to live. In the separate Webull CLI the `[y/N]` prompt is skipped by `-y/--yes` and also by `--quiet` | [webull](webull.md#guardrails-what-is-model-enforced-and-what-is-code-enforced) |
| **Zerodha** `kite` CLI | **G1**, with a plain-boolean **G2** on top: writes are dry runs "unless `--confirm` is passed". The flag "is a plain boolean; nothing ties it to a human reply" | None (session tokens expire daily, which bounds a leak, not an order) | `--confirm` right after the dry run. Raw `request post\|put\|delete` is a passthrough that follows the same dry-run rule | [zerodha](zerodha.md#guardrails-model-enforced-vs-code-enforced) |
| **moomoo** CLI `--execute <code>` | **G2.** The code is `sha256(...)` reduced to 3 digits: "a 1-in-1000 typo/double-submit check", readable from the preview, and its scope omits account id, order type, time in force and session. The skills never mention the gate | None found in the repo | Read the code from the preview and resubmit. `moomoo sim order` is ungated. The grid skill generates code that talks to OpenAPI directly | [moomoo](moomoo.md#headline-finding-the-real-gate-lives-in-the-cli-and-the-skills-never-mention-it) |
| **Gate** CEX skills | **G0** for writes: "Write commands submit immediately", no `--yes`, `--dry-run` or preview flag found. The one real control is **G5-by-scope**: the OAuth "Agentic subaccount" only gets the scopes the user grants in the browser, enforced by Gate's server. With `spot_trade` granted, writes are G0 again | Scopes only. The skill says it cannot enforce cumulative limits | A complete API key and secret pair "takes priority over OAuth", so a key left in config silently overrides the scoped login. One yes can cover a declared sequence of writes | [gate](gate.md#guardrails-what-is-enforced-and-what-is-not) |
| **HTX** source CLI | **G1** in the CLI source: every write goes through `writeOp`, which "returns the request it would send and sends nothing" without `--confirm`. **G0** as the skills are written: they never mention `--confirm` or the dry run | None | `--confirm` is "an ordinary CLI flag" (**G2**). `HTX_CONFIRM_WRITES=1` turns the dry run off for the whole process. The skills document a generic signed passthrough that the doc could not find in the repo source | [htx](htx.md#guardrails-model-enforced-vs-code-enforced) |
| **Kraken** paper and live | Paper: **G1**, but only while every call carries `--workspace <name>`. A dropped flag "trades the real account". Live orders: **G0** on the CLI ("Placing an order never prompts at any level"). MCP dangerous tools: **G4** where the client renders elicitation, **G2** (`acknowledged=true`, written by the model) where it cannot | None in the CLI ("The CLI does not enforce position size or frequency limits"). Live workspaces enforce an allocation budget. API-key scopes live at Kraken | `--yes` skips CLI prompts. `--workspace` omitted. Default MCP set includes `feedback`, which uploads a named local file with no approval step | [kraken](kraken.md#notable-guardrail-gaps) |

Other brokers fit the same shape. Examples that sit at the ends of the scale:

- **G5, the tool surface has no order tool**: Questrade community server (the doc found no order-writing tool in `src/`, [questrade](questrade.md)); Truthifi (read-only by the tool list of a closed server, [truthifi](truthifi.md)); oracle3's MCP server (no live tools, [oracle3](oracle3.md)); Tiger `TIGERMCP_READONLY=true`, opt-in ([tiger](tiger.md)). G5 holds for that surface only. The oracle3 doc is explicit that "the danger starts when the same agent also has a shell and the live skill".
- **G0 and the text removes the gate**: MetaTrader skill, "When the user asks to trade, execute immediately: do not ask for confirmation" ([metatrader](metatrader.md)).
- **Limits without approval, brake in front of the broker**: TradeMemory's optional proxy. Allowlist, notional caps, daily-loss halt, protective-stop rule and a single-use, term-bound approval (a **G3** token, 15-minute TTL). The limit numbers sit in the AGPL `mnemox-control` evaluator the doc did not read. **agent-editable? Y** for the policy file (hash-sealed, but `proxy seal` recomputes the hash) and for the halt state and approvals, which are plain local files. Bypass: any second path to the account, such as a still-configured direct Alpaca server ([tradememory](tradememory.md#bypass-paths)).
- **Server-side limits the agent can still move**: NinjaTrader's server enforces daily loss and max contracts, but `update_risk_settings` is reachable by the agent and "would loosen the server-side cap that the whole safety model leans on" ([ninjatrader](ninjatrader.md)).

## How to read a rung on the scoreboard

- Rung is about the **approval gate**, Limits are about **size**, Bypass is about **how it fails**. A skill with G4 and a documented `--yes` has a G4 gate and a one-token bypass.
- A higher rung is not "safer overall". G3 with no Limits lets an agent place a valid, previewed, enormous order. G5 on one surface says nothing about another.
- The rung is the claim of the **code the doc read**. For paths the doc marked "not tested here" or "not traced", the rung is a read of the design, and the entry says so.
- The rung scale does not rate whether the human at the other end reads what they approve.

## Method and limits of this page

- Source: the per-broker docs in this directory. They record repo, commit SHA, licence and scrape date. This page did not re-open the upstream repos; where a placement below depends on something a doc marks as unread or untested, it is labelled.
- Not covered by a rung: telemetry sent to the vendor (MEXC reports confirmation lifecycle events, see [mexc](mexc.md)), self-updating skills, and key handling. Those are in each doc's "Things to know" and in the README's [hazard list](README.md#things-we-would-want-to-know-before-installing).
- Found a placement that is wrong? Open an issue with the commit SHA you read and the line that settles it.
