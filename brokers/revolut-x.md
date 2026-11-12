---
name: Revolut X
region: UK / EEA (Revolut's crypto exchange)
status: official
trading: true
server_type: n/a
source_url: https://github.com/revolut-engineering/revolut-agent-skills
last_verified: 2026-11-11
confidence: medium
---

# Revolut X

## Overview

Revolut publishes official agent skills for Revolut X, its crypto exchange, in `revolut-engineering/revolut-agent-skills` (9 stars, created 2026-03-27, last push 2026-05-15). The README calls it a technical preview. There is no MCP server: seven `SKILL.md` skills teach an agent to call the Revolut X API. No license file was detected.

## How to connect

```bash
npx skills add revolut/revolut-agent-skills
```

Auth: a Revolut X API key with Ed25519 request signing (the `revolut-x-auth` skill), signed through a bundled Python script.

## Trading scope

Skills: auth, configuration (currencies and pair constraints), balance (available, reserved, staked), orders (place, cancel and query; market, limit, conditional, TPSL), trades, market data, and public market data (no auth).

## Safety / guardrails

The orders skill instructs the agent never to place or cancel without explicit user confirmation, to present a confirmation summary first, to warn before cancel-all, and never to guess missing parameters. This is an instruction to the model, not an enforced gate.

## Caveats

- Skills only; nothing hosted to probe.
- Technical preview, last pushed 2026-05-15. No paper mode found.
- Revolut also has a Revolut Business API; community MCP servers for that are a separate, non-trading-venue product.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/revolut-engineering/revolut-agent-skills>
