# KuCoin official agent skills (kucoin-skills-hub)

| | |
|---|---|
| Repo | https://github.com/Kucoin/kucoin-skills-hub |
| Commit | `a9bda62ce7f6cbf1d848b48eb489781fe874f962` (committed 2026-03-17) |
| License | MIT. Root `LICENSE` ("Copyright (c) 2026 KuCoin Exchange"), a `LICENSE.md` in each skill directory ("Copyright (c) 2025 KuCoin"), and `license: MIT` in the spot skill's frontmatter. |
| Date scraped | 2026-11-11 |
| Install | `npx skills add https://github.com/Kucoin/kucoin-skills-hub --full-depth` (all) or add `--skill spot` for one. `--full-depth` is required or the CLI does not find `skills/<name>/SKILL.md`. |
| MCP | None. Skills are instructions plus auth reference docs. No scripts. |

Method: shallow clone, read as plain files. Nothing was executed.

## Structure

Seven skills, `SKILL.md` plus `LICENSE.md`, `CHANGELOG.md` and `references/authentication.md` each. No scripts, no CLI, no MCP server. The model builds every signed request itself from the signing recipe in `references/authentication.md` (HMAC-SHA256, three credentials: API key, secret, passphrase). This is the "signed-request building by the model" pattern.

## Read-only, as advertised, with one caveat

The README says: "All skills currently support GET (read-only) endpoints only. Write operations (placing/cancelling orders, transfers, etc.) are not yet supported." We checked every endpoint table in all seven SKILL.md files: no POST, PUT or DELETE endpoint is listed. 

The caveat: each skill's `references/authentication.md` still carries the full signing recipe for write verbs. `futures-trading/references/authentication.md` shows a signed `POST /api/v1/orders` market order (symbol `XBTUSDTM`, leverage 10, `clientOid: "agent-abc123"`), a signed `DELETE /api/v1/orders/<id>`, and a "curl POST Example". The `spot` reference includes a "POST Request (Place Order)" script. So the text that stops the agent from trading is the sentence "only supports GET" in the SKILL.md. It is a model-enforced rule sitting next to a worked example of how to break it. The real control is the API key's permission set: create the key with General (read) permission only, and no trade, transfer or withdraw.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text and enforcement |
|---|---|---|---|---|
| `spot` | Spot market data, HF order and fill queries, stop orders, OCO orders, DCP setting | Model-built `curl` or HTTP to `api.kucoin.com`, GET only | read | "only supports Classic REST API GET endpoints (read-only operations)." Model-enforced; real control is key permission. A `CONFIRM` rule is present but no write endpoint exists to confirm |
| `margin-trading` | Cross and isolated margin data, order queries, borrow and repay history, lending, risk limits | Same | read | Same GET-only note, plus CONFIRM for "transactions in production" |
| `futures-trading` | Futures market data, orders, positions, funding fees | `api-futures.kucoin.com`, GET | read | Same GET-only note, "Transactions Confirmation" with CONFIRM for "placing orders, canceling orders, modifying positions" (none supported) |
| `assets` | Account summary, balances, ledgers, **API key info, sub-account API keys**, deposit addresses and history, withdrawal quotas and history, transfer quotas, fees | Same, GET | read (sensitive data) | GET-only note, plus credential-handling rules below |
| `earn` | Simple Earn and Structured Earn product queries, holdings | Same, GET | read | GET-only note. Says to CONFIRM "purchase, redeem" though neither exists in the skill |
| `convert` | Convert currencies, quotes, order detail and history, limit quote | Same, GET | read | GET-only note. CONFIRM before convert transactions (none supported). Quote endpoints are GET but authenticated |
| `broker` | Affiliate, Broker Pro and ND Broker queries | Same, GET | read | GET-only note. ND Exchange Broker endpoints "currently return 404" per the skill itself |

## Credential handling (the rules the skills do contain)

Every skill ends with a Security section. Verbatim fragments:

- "Users can provide KuCoin API credentials by sending a file where the content is in the following format:" followed by three lines: key, secret, passphrase. 
- "Never disclose the location of the API key, secret, and passphrase file."
- "Never send the API key, secret, and passphrase to any website other than Mainnet."
- Masking: API key first 5 and last 4 characters, secret "Always mask, show only last 5", passphrase "Always mask entirely".
- "When listing accounts, show names and environment only -- never keys".

All model-enforced. The flow tells you to hand the agent a plain-text file holding the secret, and the agent then needs to read it to sign, so the secret is in the model's working context and any tool output that echoes the file. A read-only key limits the damage. Note `assets` can read `GET /api/v1/user/api-key` and sub-account API key listings, which return key metadata into the transcript.

## Flags

- **Signed requests built by the model:** yes, from a shell and `openssl` recipe (`echo -n ... | openssl dgst -sha256 -hmac "${SECRET_KEY}" -binary | base64`), with the secret as a shell variable. The model also signs the passphrase. Expect the secret to appear in command lines and shell history if the agent runs these.
- **Key files:** the credential file format above. No path convention, no permissions advice beyond "never disclose the location".
- **Self-updating code:** none found. No hooks, no installer scripts, no fetch-at-run.
- **No paper mode:** the skills point at mainnet (`https://api.kucoin.com`, `https://api-futures.kucoin.com`); the README names no sandbox.
- **Docs drift:** `earn` notes structured-earn endpoints "may be unavailable (returns 400100)" and `broker` flags ND endpoints as 404. The skills ship known-broken sections.

## Full SKILL.md text for the trading-category skills (MIT)

Reproduced verbatim from commit `a9bda62ce7f6cbf1d848b48eb489781fe874f962` of https://github.com/Kucoin/kucoin-skills-hub, licensed MIT, copyright KuCoin. Unmodified. These three are the trading-named skills; all three are read-only. The other four are summarized above.

### spot

~~~~markdown
---
name: spot
description: KuCoin Spot trading using the KuCoin API. Authentication requires API Key, API Secret, and Passphrase.
metadata:
  version: 1.0.0
  author: KuCoin
license: MIT
---

# KuCoin Spot Skill

Spot trading on KuCoin using authenticated API endpoints. Requires API Key, API Secret, and Passphrase for authenticated endpoints. Return the result in JSON format.

> **Note:** This skill only supports Classic REST API GET endpoints (read-only operations).

## Quick Reference

### Classic API - Spot Market Data

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/announcements` (GET) | Get announcements | None | currentPage, pageSize, annType, lang, startTime, endTime | No |
| `/api/v3/currencies/{currency}` (GET) | Get currency detail | currency (path) | chain | No |
| `/api/v3/currencies` (GET) | Get all currencies | None | None | No |
| `/api/v2/symbols/{symbol}` (GET) | Get symbol detail | symbol (path) | None | No |
| `/api/v2/symbols` (GET) | Get all symbols | None | market | No |
| `/api/v1/market/orderbook/level1` (GET) | Get ticker (best bid/ask) | symbol | None | No |
| `/api/v1/market/allTickers` (GET) | Get all tickers | None | None | No |
| `/api/v1/market/histories` (GET) | Get trade history | symbol | None | No |
| `/api/v1/market/candles` (GET) | Get klines | symbol, type | startAt (sec), endAt (sec) | No |
| `/api/v1/market/orderbook/level2_{size}` (GET) | Get part orderbook | size (path: 20, 100), symbol | None | No |
| `/api/v3/market/orderbook/level2` (GET) | Get full orderbook | symbol | None | Yes |
| `/api/v1/market/orderbook/callauction/level2_{size}` (GET) | Get call auction part orderbook | size (path: 20, 100), symbol | None | No |
| `/api/v1/market/callauctionData` (GET) | Get call auction info | symbol | None | No |
| `/api/v1/prices` (GET) | Get fiat price | None | base, currencies | No |
| `/api/v1/market/stats` (GET) | Get 24hr stats | symbol | None | No |
| `/api/v1/markets` (GET) | Get market list | None | None | No |

### Classic API - Spot HF Order Queries

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v1/hf/orders/{orderId}` (GET) | Get order by orderId | orderId (path), symbol | None | Yes |
| `/api/v1/hf/orders/client-order/{clientOid}` (GET) | Get order by clientOid | clientOid (path), symbol | None | Yes |
| `/api/v1/hf/orders/active/symbols` (GET) | Get symbols with open orders | None | None | Yes |
| `/api/v1/hf/orders/active` (GET) | Get open orders | symbol | None | Yes |
| `/api/v1/hf/orders/active/page` (GET) | Get open orders (paginated) | symbol | pageNum, pageSize | Yes |
| `/api/v1/hf/orders/done` (GET) | Get closed orders | symbol | side, type, lastId, limit, startAt, endAt | Yes |
| `/api/v1/hf/fills` (GET) | Get trade history | symbol | orderId, side, type, lastId, limit, startAt, endAt | Yes |
| `/api/v1/hf/orders/dead-cancel-all/query` (GET) | Get DCP settings | None | None | Yes |

### Classic API - Stop Order Queries

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v1/stop-order` (GET) | Get stop orders list | None | symbol, side, type, tradeType, startAt, endAt, currentPage, orderIds, pageSize, stop | Yes |
| `/api/v1/stop-order/{orderId}` (GET) | Get stop order by orderId | orderId (path) | None | Yes |
| `/api/v1/stop-order/queryOrderByClientOid` (GET) | Get stop order by clientOid | clientOid | symbol | Yes |

### Classic API - OCO Order Queries

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/oco/order/{orderId}` (GET) | Get OCO order by orderId | orderId (path) | None | Yes |
| `/api/v3/oco/client-order/{clientOid}` (GET) | Get OCO order by clientOid | clientOid (path) | None | Yes |
| `/api/v3/oco/orders` (GET) | Get OCO order list | None | symbol, startAt, endAt, orderIds, pageSize, currentPage | Yes |
| `/api/v3/oco/order/details/{orderId}` (GET) | Get OCO order detail by orderId | orderId (path) | None | Yes |

---

## Parameters

### Common Parameters

* **symbol**: Trading pair (e.g., BTC-USDT)
* **currency**: Currency code (e.g., BTC, ETH, USDT)
* **orderId**: The unique order ID generated by the trading system
* **clientOid**: Client order ID, unique identifier created by the user (max 40 characters)
* **side**: Trade direction filter: buy | sell
* **type**: Order type filter: limit | market
* **startAt**: Start time. **Note:** For `/api/v1/market/candles`, use **seconds** (10-digit Unix timestamp). For other endpoints, use **milliseconds** (13-digit timestamp).
* **endAt**: End time. **Note:** For `/api/v1/market/candles`, use **seconds** (10-digit Unix timestamp). For other endpoints, use **milliseconds** (13-digit timestamp).
* **pageSize**: Number of items per page (e.g., 20, 50, 100)
* **currentPage**: Current page number for Classic pagination
* **lastId**: ID of last record from previous batch for cursor-based pagination
* **limit**: Number of results per page. Default: 20, Max: 100
* **stop**: Stop order trigger condition filter: loss | entry
* **tradeType**: Trade type filter for stop orders
* **market**: Trading market filter for Classic symbols (e.g., USDS, BTC, ALTS)
* **chain**: Blockchain network for currency query (e.g., ERC20, TRC20)
* **base**: Base fiat currency for price conversion (e.g., USD, EUR). Default: USD
* **currencies**: Comma-separated cryptocurrency list for fiat price (e.g., BTC,ETH)
* **annType**: Announcement type (e.g., latest-announcements, new-listings, activities)
* **lang**: Announcement language (e.g., en_US, zh_HK, ja_JP)

### Enums

* **side**: buy | sell
* **type**: limit | market
* **stop**: loss | entry
* **kline type**: 1min | 3min | 5min | 15min | 30min | 1hour | 2hour | 4hour | 6hour | 8hour | 12hour | 1day | 1week | 1month
* **annType**: latest-announcements | activities | product-updates | vip | maintenance-updates | delistings | others | api-campaigns | new-listings | futures-announcements

## Authentication

For endpoints that require authentication, you will need to provide KuCoin API credentials.
Required credentials:

* apiKey: Your KuCoin API key
* secretKey: Your KuCoin API secret (for signing)
* passphrase: Your KuCoin API passphrase (also HMAC signed)

Base URL:
* Mainnet: https://api.kucoin.com

## Security

### Share Credentials

Users can provide KuCoin API credentials by sending a file where the content is in the following format:

```bash
abc123...xyz
secret123...key
passphrase123...abc
```

### Never Disclose API Key and Secret

Never disclose the location of the API key, secret, and passphrase file.

Never send the API key, secret, and passphrase to any website other than Mainnet.

### Never Display Full Secrets

When showing credentials to users:
- **API Key:** Show first 5 + last 4 characters: `su1Qc...8akf`
- **Secret Key:** Always mask, show only last 5: `***...aws1`
- **Passphrase:** Always mask entirely: `***...`

Example response when asked for credentials:
Account: main
API Key: su1Qc...8akf
Secret: ***...aws1
Passphrase: ***...
Environment: Mainnet

### Listing Accounts

When listing accounts, show names and environment only -- never keys:
KuCoin Accounts:
* main (Mainnet)
* trading-bot (Mainnet)

### Transactions in Mainnet

When performing transactions in mainnet, always confirm with the user before proceeding by asking them to write "CONFIRM" to proceed.
~~~~

### margin-trading

~~~~markdown
---
name: margin-trading
description: KuCoin Margin trading using the KuCoin API. Cross margin and isolated margin market data, order queries, borrowing/repaying queries, lending queries, and risk limits. Authentication requires API Key, API Secret, and Passphrase.
metadata:
  version: 1.0.0
  author: KuCoin
license: MIT
---

# KuCoin Margin Trading Skill

Margin trading on KuCoin using authenticated API endpoints. Supports cross margin and isolated margin market data, HF order queries, stop order queries, OCO order queries, borrow/repay history queries, lending queries, and risk limits. Requires API Key, API Secret, and Passphrase for authenticated endpoints. Return the result in JSON format.

> **Note:** This skill only supports Classic REST API GET endpoints (read-only operations).

## Quick Reference

### Classic Margin Market Data

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/margin/symbols` (GET) | Get Symbols - Cross Margin (trading pair config) | None | symbol | No |
| `/api/v1/isolated/symbols` (GET) | Get Symbols - Isolated Margin (trading pair config) | None | None | No |
| `/api/v3/etf/info` (GET) | Get ETF Info (leveraged token info) | None | currency | No |
| `/api/v1/mark-price/{symbol}/current` (GET) | Get Mark Price Detail (current mark price for a margin pair) | symbol (path) | None | No |
| `/api/v1/margin/config` (GET) | Get Margin Config (cross margin config, currency list) | None | None | No |
| `/api/v3/mark-price/all-symbols` (GET) | Get Mark Price List (current mark price for all margin pairs) | None | None | No |
| `/api/v3/margin/collateralRatio` (GET) | Get Margin Collateral Ratio | None | currencyList | No |
| `/api/v3/margin/available-inventory` (GET) | Get Market Available Inventory (platform borrowable amount) | None | currency | No |

### Classic Margin HF Order Queries

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/hf/margin/orders/{orderId}` (GET) | Get Order By OrderId | orderId (path), symbol (query) | None | Yes |
| `/api/v3/hf/margin/orders/client-order/{clientOid}` (GET) | Get Order By ClientOid | clientOid (path), symbol (query) | None | Yes |
| `/api/v3/hf/margin/order/active/symbols` (GET) | Get Symbols With Open Order | tradeType | None | Yes |
| `/api/v3/hf/margin/orders/active` (GET) | Get Open Orders | symbol, tradeType | None | Yes |
| `/api/v3/hf/margin/orders/done` (GET) | Get Closed Orders | symbol, tradeType | side, type, lastId, limit, startAt, endAt | Yes |
| `/api/v3/hf/margin/fills` (GET) | Get Trade History | symbol, tradeType | orderId, side, type, lastId, limit, startAt, endAt | Yes |

### Classic Margin Stop Order Queries

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/hf/margin/stop-orders` (GET) | Get Stop Orders List (paginated, untriggered) | None | symbol, side, type, tradeType, startAt, endAt, currentPage, orderIds, pageSize, stop | Yes |
| `/api/v3/hf/margin/stop-order/orderId` (GET) | Get Stop Order By OrderId | orderId | None | Yes |
| `/api/v3/hf/margin/stop-order/clientOid` (GET) | Get Stop Order By ClientOid | clientOid | None | Yes |

### Classic Margin OCO Order Queries

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/hf/margin/oco-order/orderId` (GET) | Get OCO Order By OrderId | orderId | None | Yes |
| `/api/v3/hf/margin/oco-order/clientOid` (GET) | Get OCO Order By ClientOid | clientOid | None | Yes |
| `/api/v3/hf/margin/oco-order/detail/orderId` (GET) | Get OCO Order Detail By OrderId (includes sub-orders) | orderId | None | Yes |
| `/api/v3/hf/margin/oco-orders` (GET) | Get OCO Order List (paginated) | pageSize, currentPage | symbol, startAt, endAt, orderIds, tradeType | Yes |

### Classic Debit Queries (Borrowing and Repaying)

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/margin/borrowRate` (GET) | Get Borrow Interest Rate | None | vipLevel, currency | Yes |
| `/api/v3/margin/borrow` (GET) | Get Borrow History | currency | isIsolated, symbol, orderNo, startTime, endTime, currentPage, pageSize | Yes |
| `/api/v3/margin/repay` (GET) | Get Repay History | currency | isIsolated, symbol, orderNo, startTime, endTime, currentPage, pageSize | Yes |
| `/api/v3/margin/interest` (GET) | Get Interest History | None | currency, isIsolated, symbol, startTime, endTime, currentPage, pageSize | Yes |

### Classic Credit Queries (Lending)

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/project/list` (GET) | Get Loan Market (currencies available for lending) | None | currency | Yes |
| `/api/v3/project/marketInterestRate` (GET) | Get Loan Market Interest Rate (past 7 days) | currency | None | Yes |
| `/api/v3/purchase/orders` (GET) | Get Purchase Orders (paginated) | status | currency, purchaseOrderNo, currentPage, pageSize | Yes |
| `/api/v3/redeem/orders` (GET) | Get Redeem Orders (paginated) | status | currency, redeemOrderNo, currentPage, pageSize | Yes |

### Classic Risk Limit

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v3/margin/currencies` (GET) | Get Margin Risk Limit (config and risk limit info per currency/symbol) | None | isIsolated, currency, symbol | Yes |

---

## Parameters

### Common Parameters

* **clientOid**: Client Order ID. Unique identifier created by the user (UUID recommended). Max length: 40 characters.
* **symbol**: Trading pair symbol (e.g., `BTC-USDT`)
* **side**: Order side filter: `buy` | `sell`
* **type**: Order type filter: `limit` | `market`
* **orderId**: Order ID for query
* **isIsolated**: `true` for isolated margin, `false` for cross margin. Default is `false`.
* **tradeType**: Transaction type: `MARGIN_TRADE` (cross margin), `MARGIN_ISOLATED_TRADE` (isolated margin)
* **stop**: Stop order trigger condition filter: `loss` | `entry`
* **lastId**: The ID of the last data set from the previous batch. Used for cursor-based pagination.
* **limit**: Number of results per page. Default: 20, Max: 100 (for order/fill queries).
* **currentPage**: Current page number for paginated queries. Default: 1.
* **pageSize**: Page size for paginated queries. Varies by endpoint (typical default: 50, max: 500).
* **startAt / startTime**: Start time filter in milliseconds.
* **endAt / endTime**: End time filter in milliseconds.
* **currency**: Currency code (e.g., `BTC`, `USDT`).
* **vipLevel**: VIP level. If empty, defaults to current user VIP level.
* **orderNo**: Order number for borrow/repay history queries.
* **purchaseOrderNo**: Purchase order ID for lending operations.
* **redeemOrderNo**: Redeem order ID for redemption queries.
* **status**: Order status filter. Values depend on endpoint (e.g., `DONE`, `PENDING`).
* **currencyList**: Comma-separated currency list for collateral ratio query.

### Enums

* **side**: `buy` | `sell`
* **type**: `limit` | `market`
* **tradeType**: `MARGIN_TRADE` (cross margin) | `MARGIN_ISOLATED_TRADE` (isolated margin)
* **stop**: `loss` | `entry`
* **purchase/redeem status**: `DONE` | `PENDING`
* **OCO order status**: `NEW` | `DONE` | `TRIGGERED` | `CANCELLED`
* **stop order status**: `NEW` | `TRIGGERED`
* **liquidity**: `taker` | `maker`

## Authentication

For endpoints that require authentication, you will need to provide KuCoin API credentials.
Required credentials:

* **API Key**: Your KuCoin API key (for header `KC-API-KEY`)
* **API Secret**: Your KuCoin API secret (for signing)
* **Passphrase**: Your KuCoin API passphrase (for header `KC-API-PASSPHRASE`)

Base URL:
* Production: `https://api.kucoin.com`

## Security

### Share Credentials

Users can provide KuCoin API credentials by sending a file where the content is in the following format:

```bash
api_key_value
api_secret_value
api_passphrase_value
```

### Never Disclose API Key and Secret

Never disclose the location of the API key, secret, or passphrase file.

Never send the API key, secret, or passphrase to any website other than the official KuCoin API endpoint.

### Never Display Full Secrets

When showing credentials to users:
- **API Key:** Show first 5 + last 4 characters: `abcde...wxyz`
- **API Secret:** Always mask, show only last 5: `***...s3cr3`
- **Passphrase:** Always mask entirely: `***...`

Example response when asked for credentials:
Account: main
API Key: abcde...wxyz
Secret: ***...s3cr3
Passphrase: ***...

### Listing Accounts

When listing accounts, show names and environment only -- never keys:
KuCoin Accounts:
* main (Production)
* margin-keys (Production)

### Transactions in Production

When performing transactions in production, always confirm with the user before proceeding by asking them to write "CONFIRM" to proceed.

---

## KuCoin Accounts

### main
- API Key: your_api_key
- Secret: your_api_secret
- Passphrase: your_passphrase
~~~~

### futures-trading

~~~~markdown
---
name: futures-trading
description: KuCoin Futures trading using the KuCoin API. Futures market data, orders, positions, and funding fees. Authentication requires API Key, API Secret, and Passphrase.
metadata:
  version: 1.0.0
  author: KuCoin
license: MIT
---

# KuCoin Futures Trading Skill

Futures trading on KuCoin using authenticated and public API endpoints. Requires API Key, API Secret, and Passphrase for authenticated endpoints. Return the result in JSON format.

> **Note:** This skill only supports Classic REST API GET endpoints (read-only operations).

## Quick Reference

### Classic Futures -- Market Data

Base URL: `https://api-futures.kucoin.com`

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v1/timestamp` (GET) | Get Server Time | None | None | No |
| `/api/v1/status` (GET) | Get Service Status | None | None | No |
| `/api/v1/mark-price/{symbol}/current` (GET) | Get Mark Price | symbol (path) | None | No |
| `/api/v1/contracts/{symbol}` (GET) | Get Symbol (contract info) | symbol (path) | None | No |
| `/api/v1/contracts/active` (GET) | Get All Symbols (all tradable contracts) | None | None | No |
| `/api/v1/ticker` (GET) | Get Ticker | symbol | None | No |
| `/api/v1/allTickers` (GET) | Get All Tickers | None | None | No |
| `/api/v1/level2/snapshot` (GET) | Get Full OrderBook | symbol | None | No |
| `/api/v1/level2/depth{size}` (GET) | Get Part OrderBook (20 or 100 levels) | size (path: 20 or 100), symbol | None | No |
| `/api/v1/trade/history` (GET) | Get Trade History (last 100 trades) | symbol | None | No |
| `/api/v1/kline/query` (GET) | Get Klines (candlestick data) | symbol, granularity | from (ms), to (ms) | No |
| `/api/v1/index/query` (GET) | Get Spot Index Price | symbol | startAt, endAt, reverse, offset, forward, maxCount | No |
| `/api/v1/interest/query` (GET) | Get Interest Rate Index | symbol | startAt, endAt, reverse, offset, forward, maxCount | No |
| `/api/v1/premium/query` (GET) | Get Premium Index | symbol | startAt, endAt, reverse, offset, forward, maxCount | No |
| `/api/v1/trade-statistics` (GET) | Get 24hr Stats (platform futures volume). **Must use Classic Futures base URL (`https://api-futures.kucoin.com`).** | None | None | Yes |

### Classic Futures -- Order Queries

Base URL: `https://api-futures.kucoin.com`

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v1/orders` (GET) | Get Order List (paginated, active or done) | None | status, symbol, side, type, startAt, endAt, currentPage, pageSize | Yes |
| `/api/v1/stopOrders` (GET) | Get Stop Order List | None | symbol, side, type, startAt, endAt, currentPage, pageSize | Yes |
| `/api/v1/orders/{order-id}` (GET) | Get Order By OrderId | order-id (path) | None | Yes |
| `/api/v1/orders/byClientOid` (GET) | Get Order By ClientOid | clientOid | None | Yes |
| `/api/v1/recentDoneOrders` (GET) | Get Recent Closed Orders (last 24h) | None | symbol | Yes |
| `/api/v1/openOrderStatistics` (GET) | Get Open Order Value | symbol | None | Yes |
| `/api/v1/fills` (GET) | Get Trade History (paginated, up to 3 months) | None | orderId, symbol, side, type, tradeTypes, startAt, endAt, currentPage, pageSize | Yes |
| `/api/v1/recentFills` (GET) | Get Recent Trade History (last 24h fills) | None | symbol | Yes |

### Classic Futures -- Position Queries

Base URL: `https://api-futures.kucoin.com`

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v2/position/getMarginMode` (GET) | Get Margin Mode | symbol | None | Yes |
| `/api/v2/position/getPositionMode` (GET) | Get Position Mode | None | None | Yes |
| `/api/v2/getMaxOpenSize` (GET) | Get Max Open Size | symbol, price, leverage | None | Yes |
| `/api/v2/position` (GET) | Get Position Details | symbol | None | Yes |
| `/api/v1/positions` (GET) | Get Position List | None | currency | Yes |
| `/api/v1/history-positions` (GET) | Get Positions History | None | symbol, from, to, limit, pageId | Yes |
| `/api/v1/margin/maxWithdrawMargin` (GET) | Get Max Withdraw Margin | symbol | positionSide | Yes |
| `/api/v2/getCrossUserLeverage` (GET) | Get Cross Margin Leverage | symbol | None | Yes |
| `/api/v2/batchGetCrossOrderLimit` (GET) | Get Cross Margin Risk Limit | symbol | totalMargin, leverage | Yes |
| `/api/v1/contracts/risk-limit/{symbol}` (GET) | Get Isolated Margin Risk Limit | symbol (path) | None | No |

### Classic Futures -- Funding Fees

Base URL: `https://api-futures.kucoin.com`

| Endpoint | Description | Required | Optional | Authentication |
|----------|-------------|----------|----------|----------------|
| `/api/v1/funding-rate/{symbol}/current` (GET) | Get Current Funding Rate | symbol (path) | None | No |
| `/api/v1/contract/funding-rates` (GET) | Get Public Funding History | symbol, from (ms), to (ms) | None | No |
| `/api/v1/funding-history` (GET) | Get Private Funding History | symbol | startAt, endAt, reverse, offset, forward, maxCount | Yes |

---

## Parameters

### Common Parameters

* **symbol**: Symbol of the contract (e.g., `XBTUSDTM`, `ETHUSDTM`). Path or query parameter depending on endpoint.
* **clientOid**: User-defined unique order ID, max 40 characters.
* **startAt / from**: Begin time in **milliseconds** (13-digit Unix timestamp).
* **endAt / to**: End time in **milliseconds** (13-digit Unix timestamp).
* **pageSize**: Number of records per page. Default varies by endpoint (typically 50, max 200).
* **currentPage**: Current page number for paginated queries. Default: 1.
* **side**: Order side filter: `buy` | `sell`
* **type**: Order type filter: `limit` | `market` | `limit_stop` | `market_stop` | `oco_limit` | `oco_stop`
* **status**: Order status filter for order list: `active` | `done`. Default: `done`.
* **tradeTypes**: Trade type filter for fill history: `trade`, `adl`, `liquidation`, `settlement` (comma-separated).
* **currency**: Currency code filter (e.g., `USDT`, `XBT`).
* **reverse**: Boolean. Reverse the order of results.
* **offset**: Start offset for pagination.
* **forward**: Boolean. `true` for forward lookup (default), `false` for backward.
* **maxCount**: Displayed size per page. Default 50.
* **granularity**: Candlestick interval in minutes: `1`, `5`, `15`, `30`, `60`, `120`, `240`, `480`, `720`, `1440`, `10080`
* **positionSide**: Position side filter: `BOTH` | `LONG` | `SHORT`
* **price**: Price parameter for max open size query.
* **leverage**: Leverage parameter for max open size and risk limit queries.
* **totalMargin**: Total margin for cross margin risk limit query.

### Enums

* **side**: `buy` | `sell`
* **type**: `limit` | `market`
* **positionSide**: `BOTH` (One-Way mode) | `LONG` (Hedge mode long) | `SHORT` (Hedge mode short)
* **marginMode**: `ISOLATED` | `CROSS`
* **positionMode**: `0` (One-Way mode) | `1` (Hedge mode)
* **status** (order): `open` | `done`
* **serverStatus**: `open` | `close` | `cancelonly`
* **granularity** (minutes): `1` | `5` | `15` | `30` | `60` | `120` | `240` | `480` | `720` | `1440` | `10080`

---

## Authentication

For endpoints that require authentication, you will need to provide KuCoin API credentials.

Required credentials:
* **API Key**: Your KuCoin API key
* **API Secret**: Your KuCoin API secret (for signing)
* **API Passphrase**: Your KuCoin API passphrase (set when creating the API key)

**IMPORTANT -- Base URL:**
* **Classic Futures API**: `https://api-futures.kucoin.com` -- Used for all Classic Futures REST endpoints (`/api/v1/...`, `/api/v2/...`, `/api/v3/...`)

---

## Security

### Share Credentials

Users can provide KuCoin API credentials by sending a file where the content is in the following format:

```
api_key_value
api_secret_value
api_passphrase_value
```

### Never Disclose API Key and Secret

Never disclose the location of the API key and secret file.

Never send the API key and secret to any website other than the official KuCoin API base URLs.

### Never Display Full Secrets

When showing credentials to users:
- **API Key:** Show first 5 + last 4 characters: `abcde...wxyz`
- **API Secret:** Always mask, show only last 5: `***...s1k2y`
- **Passphrase:** Always fully masked: `***...`

Example response when asked for credentials:
Account: main
API Key: abcde...wxyz
Secret: ***...s1k2y
Passphrase: ***...
Environment: Production

### Listing Accounts

When listing accounts, show names and environment only -- never keys:
KuCoin Accounts:
* main (Production)
* test-account (Production)

### Transactions Confirmation

When performing trading operations (placing orders, canceling orders, modifying positions), always confirm with the user before proceeding by asking them to write "CONFIRM" to proceed.

---

## KuCoin Accounts

### main
- API Key: your_api_key
- Secret: your_api_secret
- Passphrase: your_passphrase
~~~~
