---
name: HTX
region: Global
status: official
trading: true
server_type: n/a
source_url: https://github.com/htx-exchange/htx-skills-hub
last_verified: 2026-11-11
confidence: medium
---

# HTX

## Overview

HTX (formerly Huobi) publishes an official CLI plus skills pack for AI agents: `htx-exchange/htx-skills-hub` (MIT, 19 stars, repo created 2026-03-12, last push 2026-10-26). There is no MCP server; agents drive a local `htx-cli` binary through 16 `SKILL.md` skills.

## How to connect

```bash
curl -fsSL https://github.com/htx-exchange/htx-skills-hub/releases/latest/download/install.sh | bash
htx-cli skill install all
```

Auth: `HTX_API_KEY` and `HTX_SECRET_KEY` environment variables, or `htx-cli config set-key` and `set-secret`. The README says the key never leaves the machine. The installer checks the binary against `SHA256SUMS`; `HTX_REQUIRE_ATTESTATION=1` also verifies build provenance.

## Trading scope

Skills: spot market, account and trading; futures market, account and trading; funding rate, open interest, elite positioning, liquidation stream, mark price, settlement; technical, derivatives and sentiment analysis; market overview. Spot and USDT-M futures order execution.

## Safety / guardrails

The README states all write operations require mandatory manual confirmation. We did not verify this in the skill files.

## Caveats

- No MCP endpoint, so no probe. The README claim of confirmation on writes is unverified beyond the README.
- No paper or testnet mode found.
- Community MCP servers for HTX exist (keyless ticker and depth only); prefer the org repo.

## Sources

Checked directly on 2026-11-11:

- <https://github.com/htx-exchange/htx-skills-hub>
