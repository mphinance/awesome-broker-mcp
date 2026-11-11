---
name: DEGIRO
region: EU (Netherlands)
status: community
trading: true
server_type: local
source_url: https://github.com/jaenster/degiro-mcp
last_verified: 2026-11-11
confidence: medium
---

# DEGIRO

> **DEGIRO has NO official API and NO official MCP server.** Every route here is a hobby
> project built on DEGIRO's private, reverse-engineered web API. Unofficial access may breach
> DEGIRO's terms and can get your account suspended. The only order-capable server
> (`jaenster/degiro-mcp`) exposes its order tools **only when you set `DEGIRO_TRADING=true`**,
> and it needs your password and 2FA seed. `trading: true` means "trading-capable community
> server behind a flag", not "sanctioned".

## Overview

No official MCP server, and DEGIRO is not first-party in any of this. Two new
**community** MCP servers appeared in October 2026 (both read from their READMEs on
2026-11-11; we did not clone them or enumerate registered tools, so the tool lists are
README claims): `jaenster/degiro-mcp` (Zig, optional order tools) and
`ivanrad07/degiro-mcp` (Python, read-only). An earlier check (2026-07-16) found none;
that is superseded. The old search hit (gabrielerandelli/minus-tracker, an Italian
capital-gains calculator that merely tags DEGIRO) is still unrelated. DEGIRO is absent from the
openbankingtracker agentic-banking directory and offers no official public developer
API. There is, however, a mature unofficial API-library ecosystem — pladaria/degiro
(358 stars, archived), Chavithra/degiro-connector (288, Python),
icastillejogomez/degiro-api (232, TypeScript, explicitly supports setting orders),
lolokraus/DegiroAPI (229, Python) — making DEGIRO the strongest DIY-wrapper candidate
in this cluster.

## How to connect

- `jaenster/degiro-mcp`: prebuilt binary from its releases or `zig build`; run with
  `degiro-mcp stdio` and `DEGIRO_USERNAME`, `DEGIRO_PASSWORD`, `DEGIRO_TOTP_SECRET`. It
  can also run remote (`degiro-mcp serve`, Streamable HTTP, self-hosted OAuth 2.1 in
  front of your own OIDC provider).
- `ivanrad07/degiro-mcp`: `uvx degiro-mcp` with the same three env vars (TOTP optional).

## Trading scope

- `jaenster/degiro-mcp` (MIT, 0 stars, created 2026-10-19, last push 2026-10-20, not
  archived): portfolio, orders, transactions, cash movements, price history, product
  search. Four order tools (`check_order`, `check_conversion`, `confirm_order`,
  `cancel_order`) exist **only with `DEGIRO_TRADING=true`**; `confirm_order` needs a
  `confirmation_id` from a prior check, good for one order within 10 minutes. README
  calls it a hobby project using DEGIRO's private web API.
- `ivanrad07/degiro-mcp` (MIT, 1 star, created 2026-10-02, last push 2026-10-02, not
  archived): 8 read-only tools (portfolio, account summary, transactions, cash movements,
  open orders, order history, upcoming payments, product search). README says there are
  no write tools and an HTTP guard blocks non-GET traffic to DEGIRO.

Frontmatter `trading: true` reflects the jaenster server with its opt-in flag; the other
is read-only.

## Caveats

- jaenster README re-read 2026-11-11 via `gh api`: it calls itself "Unofficial: it uses DeGiro's private web API, which can change or break at any time. Hobby project, use at your own risk." The four order tools (`check_order`, `check_conversion`, `confirm_order`, `cancel_order`) "only exist with `DEGIRO_TRADING=true`"; `check_order` places nothing and returns a `confirmation_id`, but the model can call `confirm_order` itself, so it is not human approval. Its README also shows putting the password and TOTP seed in plaintext MCP config unless you use a secrets helper.
- Both servers are unofficial, days-old, near-zero-star hobby projects that log into DEGIRO
  with your password and 2FA seed through a reverse-engineered private web API. DEGIRO has
  no sanctioned API, so ToS and account-suspension risk applies.

- DIY-wrapper candidate: the underlying libraries are unofficial reverse-engineered
  clients of DEGIRO's web routes, not a sanctioned API. Any wrapper inherits ToS and
  account-suspension risk.
- The most-starred library (pladaria/degiro) is archived — a signal about the
  durability of unofficial DEGIRO access generally.
- Do not mistake gabrielerandelli/minus-tracker for a DEGIRO MCP server; it is a tax
  tool that happens to ship an MCP interface.

## Sources

Checked directly on 2026-11-11 (READMEs of the two repos below) and 2026-07-16 (searches):

- <https://github.com/jaenster/degiro-mcp>
- <https://github.com/ivanrad07/degiro-mcp>
- <https://api.github.com/search/repositories?q=degiro+mcp&sort=stars&order=desc>
- <https://api.github.com/search/repositories?q=degiro&sort=stars&order=desc&per_page=20>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
