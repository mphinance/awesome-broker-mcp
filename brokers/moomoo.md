---
name: moomoo / Futu
region: US, SG, and others (varies by Futu entity)
status: community
trading: true
server_type: local (requires OpenD gateway)
source_url: https://github.com/Litash/moomoo-api-mcp
last_verified: 2026-07-16
---

# moomoo / Futu

## Overview

Community server, explicitly **not affiliated with, endorsed by, or sponsored by
Moomoo Inc.** (their own disclaimer). Active: 79 commits, 9 releases, latest v0.1.8
(Apr 2026).

## How to connect

Requires **Moomoo OpenD** — a separate local gateway app — running first. Download
from Moomoo's official site, install, launch with your account credentials. The MCP
server talks to OpenD at `127.0.0.1:11111` by default.

Then run the server itself:
- Quick start: `uvx --refresh moomoo-api-mcp`
- Permanent: `uv tool install moomoo-api-mcp`
- Dev: clone + `uv run moomoo-api-mcp`

Claude Desktop: add to `claude_desktop_config.json` with the command + env vars.

## Trading scope

Real-time quotes, historical data, position management, order execution.

## Safety / guardrails

Without `MOOMOO_TRADE_PASSWORD` + `MOOMOO_SECURITY_FIRM` (broker region, e.g.
FUTUSG/FUTUINC) set, the server runs **SIMULATE-only** (paper trading) — real trading
is opt-in, not default. Real-account access requires an explicit `unlock_trade` call
before the agent can execute anything real. Even in this local setup, "the AI agent
must explicitly notify users before accessing actual funds."

## Caveats

- Two-gateway stack: OpenD process **plus** the MCP server process. More moving parts
  to keep alive than any other entry in this directory.
