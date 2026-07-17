---
name: DEGIRO
region: EU (Netherlands)
status: none
trading: false
server_type: n/a
source_url: none found
last_verified: 2026-07-16
confidence: high
---

# DEGIRO

## Overview

No MCP server, official or community. GitHub search for 'degiro mcp' returns exactly
one repo and it is unrelated (gabrielerandelli/minus-tracker, an Italian capital-gains
calculator that merely tags DEGIRO as a topic). DEGIRO is absent from the
openbankingtracker agentic-banking directory and offers no official public developer
API. There is, however, a mature unofficial API-library ecosystem — pladaria/degiro
(358 stars, archived), Chavithra/degiro-connector (288, Python),
icastillejogomez/degiro-api (232, TypeScript, explicitly supports setting orders),
lolokraus/DegiroAPI (229, Python) — making DEGIRO the strongest DIY-wrapper candidate
in this cluster.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- DIY-wrapper candidate: the underlying libraries are unofficial reverse-engineered
  clients of DEGIRO's web routes, not a sanctioned API. Any wrapper inherits ToS and
  account-suspension risk.
- The most-starred library (pladaria/degiro) is archived — a signal about the
  durability of unofficial DEGIRO access generally.
- Do not mistake gabrielerandelli/minus-tracker for a DEGIRO MCP server; it is a tax
  tool that happens to ship an MCP interface.

## Sources

Checked directly on 2026-07-16:

- <https://api.github.com/search/repositories?q=degiro+mcp&sort=stars&order=desc>
- <https://api.github.com/search/repositories?q=degiro&sort=stars&order=desc&per_page=20>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
