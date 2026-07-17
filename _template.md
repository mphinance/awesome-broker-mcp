---
name: Broker Name
region: US
status: official          # official | community | aggregator-only | none
trading: true             # can it place a real order?
server_type: remote       # remote | local | n/a
source_url: https://example.com/docs/mcp
last_verified: YYYY-MM-DD # the date YOU checked
---

# Broker Name

## Overview

What this is, in two or three sentences. Official or community? Hosted or local?
Lead with the thing that decides it for the reader.

## How to connect

The concrete steps. A hosted URL to paste, or the local command to run.

```bash
claude mcp add broker-name -- uvx broker-mcp-server
```

Auth: what the flow is, and what the AI can and cannot see.

## Trading scope

Exactly what it can trade — asset classes, order types, multi-leg or not. If it's
read-only, say "None." plainly.

## Safety / guardrails

Draft-first? Explicit confirmation step? An unlock for live vs. paper? Can it move
money, or only place trades? This is the section readers need most.

## Caveats

- Anything you could not confirm. Be specific about what's unverified and why.
- Maintenance signals, if community: last commit, stars, single-maintainer risk.
- Account minimums, plan requirements, region limits.
