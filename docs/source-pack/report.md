# Awesome Broker MCP Ecosystem Briefing & Technical Audit

## 1. Recent Ecosystem Updates & Critical Changes

*   **Alpaca MCP v2 Complete Rewrite:** Transitioned from a hand-crafted v1 architecture to a complete rewrite built on FastMCP and OpenAPI specs (`trading-api.json` and `market-data-api.json`). Recent updates include a September 2026 API spec synchronization, the addition of option stop orders (merged 2 weeks ago), and a version bump to v2.3.2 (merged 3 weeks ago). This version introduces breaking changes across tool schemas, parameters, and configuration models.
*   **Base MCP Sunset & Deprecation:** The official `base/base-mcp-legacy` repository was officially archived and marked read-only on May 13, 2026. The associated `base-mcp` npm package is formally deprecated (final tag `v1.0.13-final` / `1.0.14`). Developers are instructed to discontinue `npx base-mcp` or `npm install base-mcp` and migrate to updated Base AI Agent guides at `docs.base.org/ai-agents`.
*   **Polymarket MCP Enhancements:** Added a local Web Dashboard (`polymarket-web` / `start_web_dashboard.sh`) operating at `http://localhost:8080`. Recent repository activity includes multiple pull requests merged 3 weeks ago spanning testing suites, documentation alignment, and route inventory maintenance, consolidating the v0.2.0 release.
*   **Kalshi MCP Maintenance:** Merged PR #14 3 weeks ago, integrating upstream error handling improvements, automated secret redaction in GitHub Actions workflows, scheduled OpenAPI drift detection, and graceful client exit handling on `ClientCall` path processing.

---

## 2. Individual Server Technical Audits

### 2.1 Alpaca MCP Server (`alpacahq/alpaca-mcp-server`)

| Dimension | Standardized Specification |
| :--- | :--- |
| **Official Status** | Official (`alpacahq`) |
| **Deployment Model** | Local (stdio via `uvx` / Docker) or Streamable HTTP |
| **Execution Capability** | Full Multi-Asset Order Execution (Stocks, ETFs, Crypto, Options) |
| **Default Trading Environment** | Paper Trading (`ALPACA_PAPER_TRADE=true`) |
| **Safety & Risk Controls** | Default paper environment variable, server-side toolset filtering via `ALPACA_TOOLSETS`, host header validation |

The official Alpaca MCP server provides a FastMCP-based bridge generated via `from_openapi()` from Alpaca’s OpenAPI specifications (`trading-api.json` and `market-data-api.json`). It supports market, limit, stop, stop-limit, trailing stop, and bracket orders for equities and crypto, as well as single-leg/multi-leg option strategies and contract exercise instructions.

#### Authentication & Cryptographic Signing
Authentication is managed via HTTP headers (`APCA-API-KEY-ID` and `APCA-API-SECRET-KEY`) passed directly to Alpaca REST endpoints. No secret credentials or state files are persisted to local disk. The server identifies itself using a standard user-agent string (`APCA-MCP-TRADING/<version>`).

#### Protocol & Wire Specifications
The server exposes 11 modular toolsets (`account`, `trading`, `watchlists`, `assets`, `stock-data`, `crypto-data`, `options-data`, `corporate-actions`, `news`, `fixed-income-data`, `locates`). Tool access is restricted on server startup via the `ALPACA_TOOLSETS` environment variable (e.g., `ALPACA_TOOLSETS=stock-data,crypto-data`).

#### Transport & Security Considerations
Default deployment operates via local stdio. When configured for Streamable HTTP transport, the server defaults to `127.0.0.1:8000`. To prevent DNS rebinding and cross-site requests in HTTP mode, the server implements strict Host and Origin header validation against `FASTMCP_HTTP_ALLOWED_HOSTS`.

#### Client Setup Configurations

##### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "alpaca": {
      "command": "uvx",
      "args": ["alpaca-mcp-server"],
      "env": {
        "ALPACA_API_KEY": "your_alpaca_api_key",
        "ALPACA_SECRET_KEY": "your_alpaca_secret_key",
        "ALPACA_PAPER_TRADE": "true"
      }
    }
  }
}
```

##### Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "alpaca": {
      "command": "uvx",
      "args": ["alpaca-mcp-server"],
      "env": {
        "ALPACA_API_KEY": "your_alpaca_api_key",
        "ALPACA_SECRET_KEY": "your_alpaca_secret_key",
        "ALPACA_PAPER_TRADE": "true"
      }
    }
  }
}
```

##### VS Code
Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "alpaca": {
      "type": "stdio",
      "command": "uvx",
      "args": ["alpaca-mcp-server"],
      "env": {
        "ALPACA_API_KEY": "your_alpaca_api_key",
        "ALPACA_SECRET_KEY": "your_alpaca_secret_key",
        "ALPACA_PAPER_TRADE": "true"
      }
    }
  }
}
```

##### Claude Code
Run in terminal:
```bash
claude mcp add alpaca --scope user --transport stdio uvx alpaca-mcp-server \
  --env ALPACA_API_KEY=your_alpaca_api_key \
  --env ALPACA_SECRET_KEY=your_alpaca_secret_key \
  --env ALPACA_PAPER_TRADE=true
```

---

### 2.2 Kalshi Prediction Markets MCP (`9crusher/mcp-server-kalshi`)

| Dimension | Standardized Specification |
| :--- | :--- |
| **Official Status** | Community / Third-Party (`9crusher`) |
| **Deployment Model** | Local (stdio via `uvx` / Docker) |
| **Execution Capability** | Order Execution (Prediction market YES/NO contracts) |
| **Default Trading Environment** | Demo / Sandbox (`KALSHI_ENV=demo`) |
| **Safety & Risk Controls** | Mandatory draft/preview gate (`confirm=true` required for orders), default sandbox URL derivation |

This Python-based MCP server provides end-to-end integration with Kalshi prediction markets, covering market discovery, candlestick history, orderbook depth, settlement rule extraction (including legal PDF parsing), portfolio balances, and order placement.

#### Authentication & Cryptographic Signing
Authenticated operations (portfolio balances, active orders, trade creation) require an RSA key pair. Requests are signed using RSA-PSS (MGF1-SHA256, maximum salt length). Each HTTP request attaches three mandatory headers:
*   `KALSHI-ACCESS-KEY`: API key ID.
*   `KALSHI-ACCESS-TIMESTAMP`: Millisecond timestamp (`timestamp_ms`).
*   `KALSHI-ACCESS-SIGNATURE`: Base64 signature generated over the message string `timestamp_ms + METHOD + path` (where `path` includes `/trade-api/v2` and excludes query parameters).

#### Protocol & Wire Specifications
Kalshi’s native V2 REST API quotes all contracts relative to the YES leg in fixed-point dollars. This server converts requests into an intuitive order model: action (`buy`/`sell`), side (`yes`/`no`), and a limit price in whole cents. The underlying client engine handles the required buy-NO $\leftrightarrow$ sell-YES price inversion automatically.

#### Transport & Security Considerations
Market discovery and rule lookup tools run completely unauthenticated. Execution tools enforce a strict confirmation gate: calling `create_order` or `amend_order` without `confirm=true` intercepts network transmission, returning a human-readable JSON preview payload instead of placing an order on the exchange.

#### Client Setup Configurations

##### Claude Desktop (uvx)
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "kalshi": {
      "command": "uvx",
      "args": ["mcp-server-kalshi"],
      "env": {
        "KALSHI_ENV": "demo",
        "KALSHI_API_KEY": "your_kalshi_api_key_id",
        "KALSHI_PRIVATE_KEY_PATH": "/path/to/your/rsa_private_key.pem"
      }
    }
  }
}
```

##### Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "kalshi": {
      "command": "uvx",
      "args": ["mcp-server-kalshi"],
      "env": {
        "KALSHI_ENV": "demo",
        "KALSHI_API_KEY": "your_kalshi_api_key_id",
        "KALSHI_PRIVATE_KEY_PATH": "/path/to/your/rsa_private_key.pem"
      }
    }
  }
}
```

##### VS Code
Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "kalshi": {
      "type": "stdio",
      "command": "uvx",
      "args": ["mcp-server-kalshi"],
      "env": {
        "KALSHI_ENV": "demo",
        "KALSHI_API_KEY": "your_kalshi_api_key_id",
        "KALSHI_PRIVATE_KEY_PATH": "/path/to/your/rsa_private_key.pem"
      }
    }
  }
}
```

---

### 2.3 Polymarket MCP Server (`caiovicentino/polymarket-mcp-server`)

| Dimension | Standardized Specification |
| :--- | :--- |
| **Official Status** | Community / Third-Party (`caiovicentino`) |
| **Deployment Model** | Local (Python stdio, Docker, or Web Dashboard at `localhost:8080`) |
| **Execution Capability** | Full Mode (Trading) / DEMO Mode (Read-Only) |
| **Default Trading Environment** | DEMO Mode (`DEMO_MODE=true` default in quickstart) |
| **Safety & Risk Controls** | Hold gate (`ENABLE_AUTONOMOUS_TRADING=false`), order size limits, portfolio exposure caps, spread tolerances |

Created by Caio Vicentino, this server features 45 tools divided across 5 categories: Market Discovery (8), Market Analysis (10), Trading (12), Portfolio Management (8), and Real-time Monitoring (7). It includes a browser interface (`http://localhost:8080`) managed via `start_web_dashboard.sh`.

#### Authentication & Cryptographic Signing
Operates on a two-tier authentication architecture:
1.  **L1 Authentication:** Polygon wallet private key (`POLYGON_PRIVATE_KEY`, without `0x` prefix) used for EIP-712 typed data signing of order messages.
2.  **L2 Authentication:** Polymarket API key credentials managed through `py-clob-client` for Central Limit Order Book (CLOB) interaction.

#### Protocol & Wire Specifications
The system interfaces with three network endpoints: CLOB API (order submission and management), Gamma API (market metadata and analytics), and WebSockets (real-time price and orderbook streaming). Streaming feeds feature automated reconnection handling with exponential backoff. Network activity is bound by a token-bucket rate limiter.

#### Transport & Security Considerations
When `DEMO_MODE=true` is active, wallet private keys are unnecessary, and all order tools are rendered read-only. In Full Trading Mode, order safety is governed by conditional execution logic:

```
IF ENABLE_AUTONOMOUS_TRADING == false:
    All orders -> HELD as 'confirmation_required' (Requires confirm=true parameter)
ELSE IF order_value_usd > REQUIRE_CONFIRMATION_ABOVE_USD ($500 default):
    Order -> HELD as 'confirmation_required'
ELSE:
    Order -> Transmitted directly to CLOB API
```

#### Risk Control Parameters
*   `MAX_ORDER_SIZE_USD`: Maximum dollar limit per order (default `$1000`).
*   `MAX_TOTAL_EXPOSURE_USD`: Maximum aggregate portfolio limit (default `$5000`).
*   `MAX_POSITION_SIZE_PER_MARKET`: Position cap for a single market (default `$2000`).
*   `MIN_LIQUIDITY_REQUIRED`: Minimum market liquidity required before order entry (default `$10000`).
*   `MAX_SPREAD_TOLERANCE`: Maximum allowable bid-ask spread ratio (default `0.05` / 5%).

#### Client Setup Configurations

##### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "polymarket": {
      "command": "/path/to/polymarket-mcp-server/venv/bin/python",
      "args": ["-m", "polymarket_mcp.server"],
      "cwd": "/path/to/polymarket-mcp-server",
      "env": {
        "DEMO_MODE": "true",
        "POLYGON_PRIVATE_KEY": "your_private_key_without_0x",
        "POLYGON_ADDRESS": "0xYourPolygonAddress",
        "ENABLE_AUTONOMOUS_TRADING": "false",
        "MAX_ORDER_SIZE_USD": "1000"
      }
    }
  }
}
```

##### Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "polymarket": {
      "command": "/path/to/polymarket-mcp-server/venv/bin/python",
      "args": ["-m", "polymarket_mcp.server"],
      "cwd": "/path/to/polymarket-mcp-server",
      "env": {
        "DEMO_MODE": "true",
        "POLYGON_PRIVATE_KEY": "your_private_key_without_0x",
        "POLYGON_ADDRESS": "0xYourPolygonAddress",
        "ENABLE_AUTONOMOUS_TRADING": "false",
        "MAX_ORDER_SIZE_USD": "1000"
      }
    }
  }
}
```

---

### 2.4 Interactive Brokers MCP (`kelvingao/ibkr-mcp`)

| Dimension | Standardized Specification |
| :--- | :--- |
| **Official Status** | Community / Third-Party (`kelvingao`) |
| **Deployment Model** | Local TCP Socket (Connects to Trader Workstation or IB Gateway) |
| **Execution Capability** | Strategy Scanning, Analysis & Draft/Preview Execution |
| **Default Trading Environment** | Session Dependent (Bound to target TWS/Gateway socket connection) |
| **Safety & Risk Controls** | Automated risk evaluation rules, exposure monitoring alerts, playbook adjustments |

This Python 3.12+ implementation connects AI assistants to Interactive Brokers via direct socket connections. It provides account summary tracking, portfolio P&L monitoring, option chain evaluation, historical news lookup, and strategy scanning across covered calls, iron condors, Poor Man's Covered Calls (PMCC), and vertical spreads.

#### Authentication & Cryptographic Signing
Authentication is handled by the local TWS or IB Gateway application instance. The MCP server establishes an unencrypted local TCP socket connection, delegating authentication, 2FA, and session persistence to the desktop application.

#### Protocol & Wire Specifications
The server communicates over IB native socket protocols. Market data behavior and option cache storage are managed through environment variables:
*   `IBKR_HOST`: Target socket host address (default `127.0.0.1`).
*   `IBKR_PORT`: Port number (`7497` for TWS, `4001` for IB Gateway).
*   `IBKR_CLIENT_ID`: Socket client identifier (default `0`).
*   `IBKR_ACCOUNT`: Specific account ID target (optional).
*   `IBKR_MCP_OPTION_DATA_DIR`: Directory for options data caching (default `optiondata`).
*   `IBKR_MCP_OPTION_HISTORY_DIR`: Directory for historical option storage (default `historydata`).
*   `IBKR_MCP_MARKET_DATA_TYPE`: Data type selector (`LIVE`, `FROZEN`, `DELAYED`, `DELAYED_FROZEN`).

#### Transport & Security Considerations
Because socket connections inherit the access permissions of the host TWS/Gateway process, risk monitoring operates continuously. The server measures portfolio exposures against configured risk rules, generating alerts and automated playbook recommendations when exposure limits are reached.

#### Client Setup Configurations

##### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "ibkr": {
      "command": "uvx",
      "args": ["ibkr-mcp"],
      "env": {
        "IBKR_HOST": "127.0.0.1",
        "IBKR_PORT": "4001",
        "IBKR_CLIENT_ID": "0",
        "IBKR_MCP_MARKET_DATA_TYPE": "LIVE"
      }
    }
  }
}
```

##### Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "ibkr": {
      "command": "uvx",
      "args": ["ibkr-mcp"],
      "env": {
        "IBKR_HOST": "127.0.0.1",
        "IBKR_PORT": "7497",
        "IBKR_CLIENT_ID": "0",
        "IBKR_MCP_MARKET_DATA_TYPE": "DELAYED"
      }
    }
  }
}
```

---

### 2.5 SnapTrade MCP Demo (`dangelov/mcp-snaptrade`)

| Dimension | Standardized Specification |
| :--- | :--- |
| **Official Status** | Community / Third-Party (`dangelov`) |
| **Deployment Model** | Local CLI Binary Execution (`/bin/cli`) |
| **Execution Capability** | Read-Only Account Data; Order Execution **[UNCONFIRMED]** |
| **Default Trading Environment** | SnapTrade Demo / Credentials Dependent |
| **Safety & Risk Controls** | Repository disclaimer flagging unmaintained proof-of-concept status |

This Go implementation (`dangelov/mcp-snaptrade`, 99.2% Go) acts as a proof-of-concept exposing SnapTrade API endpoints to Anthropic's Claude via MCP. It allows models to read financial account state, balances, and holdings through aggregated brokerage connections.

#### Prerequisites & Setup
1.  Register for a developer account on the SnapTrade Dashboard to obtain a `Client ID` and `Client Secret`.
2.  Register a demo user via the SnapTrade API demo portal to generate user credentials.
3.  Populate credentials in a `.env` file within the project build output directory.

#### Protocol & Transport Specifications
The server compiles to a local CLI binary located at `/bin/cli`. It interfaces with SnapTrade REST endpoints using HTTP client libraries. The repository documentation does not define specific order placement tool schemas, leaving order execution capabilities **[UNCONFIRMED]**.

#### Client Setup Configurations

##### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "SnapTrade": {
      "command": "/path/to/mcp-snaptrade/bin/cli"
    }
  }
}
```

---

### 2.6 Coinbase / Base Network MCP (`base/base-mcp-legacy`)

| Dimension | Standardized Specification |
| :--- | :--- |
| **Official Status** | Official (`base`) — Archived / Deprecated |
| **Deployment Model** | Local (Legacy Node / npm package `base-mcp`) |
| **Execution Capability** | Historical Onchain Execution; Currently Archived / Read-Only |
| **Default Trading Environment** | Historical Base Mainnet / Testnet |
| **Safety & Risk Controls** | Full repository archival (May 13, 2026); npm package deprecation |

Formerly the official Model Context Protocol server for the Base network and Coinbase API, this TypeScript project provided tools for onchain transfers, token trading, and Farcaster username resolution via the ActionProvider pattern.

The repository was officially archived on May 13, 2026, and the `base-mcp` npm package was marked deprecated (final release tag `v1.0.13-final` / `1.0.14`). Active agent development has migrated to `docs.base.org/ai-agents`.

---

## 3. Comparative Infrastructure & Audit Summary

| Broker / Repository | Official? | Deployment | Order Execution | Default Mode | Primary Safety Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Alpaca** (`alpacahq/alpaca-mcp-server`) | Official | Local stdio / HTTP | Multi-Asset (Stocks, Crypto, Options) | Paper (`ALPACA_PAPER_TRADE=true`) | Default paper trading; `ALPACA_TOOLSETS` server-side tool filtering; host validation |
| **Kalshi** (`9crusher/mcp-server-kalshi`) | Community | Local stdio / Docker | Prediction Contracts (YES/NO) | Sandbox (`KALSHI_ENV=demo`) | Mandatory confirmation gate (`confirm=true` required); RSA-PSS request signing |
| **Polymarket** (`caiovicentino/polymarket-mcp-server`) | Community | Local stdio / Docker / Web UI | CLOB Trading / DEMO Read-Only | DEMO Mode (`DEMO_MODE=true`) | `ENABLE_AUTONOMOUS_TRADING=false` hold gate; order/exposure USD risk caps |
| **Interactive Brokers** (`kelvingao/ibkr-mcp`) | Community | Local TCP (TWS / Gateway) | Strategy Scanning & Execution | Session Dependent | Portfolio risk evaluation rules, exposure alerts, and playbook recommendations |
| **SnapTrade** (`dangelov/mcp-snaptrade`) | Community | Local CLI binary | **[UNCONFIRMED]** | Demo Credentials | Disclaimer marking project as unmaintained proof-of-concept |
| **Base Network** (`base/base-mcp-legacy`) | Official (Archived) | Local npm package | Archived / Read-Only | Historical Testnet/Mainnet | Repository archived; npm package deprecated in favor of `docs.base.org/ai-agents` |

---

## 4. Source Contradictions, Deprecations & Unconfirmed Claims Audit

### Source Contradictions & Version Incompatibilities

> **Complete Lack of Alpaca MCP v1 to v2 Backward Compatibility:**
> Alpaca MCP v2 is a total rewrite built on FastMCP and OpenAPI specs (`trading-api.json` and `market-data-api.json`). V1 configurations, `.env` file setups, and `init` commands are completely obsolete in v2. Tool names, schemas, and parameters do not share drop-in compatibility with v1. Upgrading requires clearing client tool caches and initializing fresh chat sessions.

> **Polymarket Documentation Version Claims Stale:**
> Multiple root documentation files in the Polymarket MCP repository (`DOCKER_SUMMARY.md`, `INSTALLATION_SUMMARY.md`, `PROJECT_COMPLETE.md`, `Makefile`) contained stale references to version `0.1.0`. Primary release metadata, Dockerfiles, and `pyproject.toml` confirm the active server version is `0.2.0`.

### Unconfirmed Features & Unreachable Sources

> **Unreachable External Issue Tracker (`we-promise/sure` Issue #2387):**
> Verification attempts for SnapTrade integration issues on external repository `we-promise/sure` (Issue #2387) failed, returning an explicit source error: "Unable to load page. Please reload page and try again." External bug reports regarding SnapTrade stability cannot be verified and are marked **[UNCONFIRMED]**.

> **SnapTrade Live Order Execution Capability [UNCONFIRMED]:**
> Although `dangelov/mcp-snaptrade` describes building a "trading bot," primary documentation defines tools only for retrieving financial account data. Explicit order placement tools, parameters, or execution safety gates are absent from code context. Live order execution for this server is marked **[UNCONFIRMED]**.

### Deprecation Notices

> **Official Deprecation Notice for `base-mcp`:**
> The `base-mcp-legacy` repository was archived on May 13, 2026, and the `base-mcp` npm package is formally deprecated. Developers are warned against `npx base-mcp` or `npm install base-mcp` and must migrate to `docs.base.org/ai-agents`.

---

## 5. Order Safety Controls & Confirmation Flow Taxonomy

1. **Preview / Draft Gate Strategy (Kalshi):**
   Order-placing tools (`create_order`, `amend_order`) intercept order submission by default. Unless `confirm=true` is explicitly provided, the tool refrains from routing the order to the exchange and instead returns a human-readable preview payload containing the formatted JSON order payload and price conversion details.
2. **Confirmation Hold Strategy (Polymarket):**
   Orders are evaluated against autonomous trading gates. When `ENABLE_AUTONOMOUS_TRADING=false` (the default setting) or when an order size exceeds `REQUIRE_CONFIRMATION_ABOVE_USD` ($500 threshold), order execution is paused and assigned a `confirmation_required` status until explicitly resubmitted with `confirm=true`.
3. **Toolset Whitelisting & Environment Gating (Alpaca):**
   Capabilities are restricted server-side prior to client dynamic discovery. Administrators can disable order execution entirely by omitting `trading` from `ALPACA_TOOLSETS`. Additionally, execution strictly defaults to paper trading (`ALPACA_PAPER_TRADE=true`), requiring explicit environment variable modification to target live accounts.
4. **Rule-Based Automated Adjustments (IBKR):**
   System risk controls monitor continuous account metrics. Position exposures and portfolio limits are evaluated against user rules, generating real-time risk alerts and automated playbook recommendations to adjust or hedge positions when boundaries are breached.