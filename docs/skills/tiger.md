# Tiger Brokers official agent skills (tigerfintech/tigeropen-skill)

| | |
|---|---|
| Skills repo | https://github.com/tigerfintech/tigeropen-skill |
| Commit | `e61510a8eac3d68eb42ec5244023cbb921ccb133` (committed 2026-10-23) |
| License | **No repo-level LICENSE file** (GitHub API reports none). Each SKILL.md declares its own license in frontmatter: `Apache-2.0` for `tigeropen`, `-java`, `-go`, `-rust`, `-csharp`, `-cpp`; `MIT` for `-typescript`. The repo has a `DISCLAIMER.md` (risk disclosure and disclaimer, Chinese and English). |
| Date scraped | 2026-11-11 |
| Install | `npx skills add tigerfintech/tigeropen-skill` (interactive; `--list` to preview, `--skill tigeropen` for the Python skill only) |
| Runtime dependency | `pip install tigeropen` (Python SDK, also provides a `tigeropen` CLI); `pip install tigermcp` for the MCP server described in `references/mcp.md` |
| Related, not covered | https://github.com/tigerfintech/tigeropen-skill-us (pushed 2026-08-04). Listed in the org, not cloned. |

Method: shallow clone read as plain files. No script, installer or CLI from the repo was executed.

## Structure

7 skills, one per SDK language, all "Agent Skills" format: `tigeropen` (Python, 7.4 KB with 7 reference files: `quickstart`, `quote`, `trade`, `option`, `push`, `cli`, `mcp`), plus `tigeropen-java`, `-go`, `-rust`, `-csharp`, `-cpp`, `-typescript` (4 to 7 KB each). These are SDK coding skills: the agent writes or runs code against the Tiger OpenAPI. The Python skill also documents the `tigeropen` CLI, which places orders directly.

## Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `tigeropen` (Python) | SDK setup, quotes, stock/futures/options trading, push subscriptions, screener, `tigeropen` CLI, MCP server setup | `tigeropen` Python SDK (`preview_order()`, `place_order()`, `get_orders()`), `tigeropen trade order place|preview` CLI, `tigermcp` | read, paper, live | paper default; live needs `preview_order()`, a details table, then stop and wait for explicit confirmation |
| `tigeropen-java` | Same coverage, Java SDK | Java SDK | read, paper, live | "Always confirm order details with the user before ..." live orders; paper default |
| `tigeropen-go`, `-rust`, `-csharp`, `-cpp`, `-typescript` | Same coverage in each language | each SDK | read, paper, live | one-line version: "Default to Paper Trading ... Always confirm order details before live orders." |

## Guardrails: what is model-enforced and what is code-enforced

**Model-enforced (SKILL.md text):**

- Paper by default. The Python skill: "Default to **Paper Trading** unless the user explicitly requests live trading." `references/trade.md` adds a Paper vs Live table: `account_type` is `PAPER` for paper and `STANDARD` or `GLOBAL` for live; the default is paper and live "User must explicitly request".
- Live order workflow in `references/trade.md` (five mandatory steps, "skip any step and do NOT place the order"): verify account (non-`PAPER`), `preview_order()` and show commission and margin, show details in a table "then stop and wait for the user to reply to confirm", only then `place_order()`, then poll `get_orders()` because "Submission success is not execution".
- The safety block closes with "never auto-submit".
- The non-Python language skills carry only a one-line version of the rule.

**Code-enforced (outside the skill text):**

- `tigermcp` read-only mode: `TIGERMCP_READONLY=true` "disable trading" and disables `place_order` and `cancel_order` (the tool table marks both as disabled in read-only mode). `references/mcp.md` recommends it for first-time use. It is opt-in.
- Account type (paper vs live) is set by the credentials and account the user configures.

Flags:

- The CLI has a skip-confirmation flag: `tigeropen trade order place ... -y`. The skills show it in an example. That example normalises a flag that removes the CLI's own confirmation prompt; nothing in the skill text forbids an agent from adding it.
- No repo-level license; per-skill license in frontmatter only.
- `DISCLAIMER.md` states the AI agent is an independent third party and the user must verify AI output before executing trades; it also says the tool is not suited to latency-sensitive high-frequency strategies.
- No position-size or notional caps in the skill text.

## Trading skill (full SKILL.md, Apache-2.0 per its frontmatter)

### tigeropen

Path: `skills/tigeropen/SKILL.md` (7.4 KB). This is an index; the order workflow detail is in `references/trade.md` (summarised above, not embedded).

````markdown
---
name: tigeropen
description: |
  Tiger Brokers OpenAPI Python SDK — complete skills for AI coding tools. Covers SDK setup, market data queries, stock/futures/options trading, real-time push subscriptions, CLI command-line tool, and MCP server integration. Use when building trading applications, querying market data, placing orders, using the tigeropen CLI, or integrating Tiger Brokers API with AI editors.
  老虎证券 OpenAPI Python SDK 完整技能集。涵盖 SDK 配置、行情查询、股票/期货/期权交易、实时推送订阅、CLI 命令行工具、MCP Server 集成。适用于构建交易应用、查询行情数据、下单交易、使用 tigeropen CLI、或将老虎 API 集成到 AI 编辑器。
  用户提到以下关键词时自动使用 / Auto-activate on these keywords: 行情、报价、价格、K线、快照、买卖盘、深度、买入、卖出、下单、撤单、改单、交易、持仓、资金、账户、订单、委托、期权、期权链、到期日、期货、推送、订阅、选股、筛选、tigeropen、tiger API、quote、price、K-line、order、buy、sell、trade、position、asset、account、option、future、push、scanner
license: Apache-2.0
compatibility: Requires Python 3.8+, pip, and a Tiger Brokers developer account
metadata:
  author: tigerbrokers
  version: "3.7.0"
  language: zh_CN, en_US
  openclaw:
    requires:
      bins:
        - pip
        - python
---

# Tiger Open API Python SDK

> 老虎量化开放平台 Python SDK 完整技能集 / Complete AI skill set for Tiger Brokers OpenAPI

> **安全警告 / Safety Warning**: 交易涉及真实资金。生成交易代码时默认使用**模拟账户**（Paper Trading），除非用户明确要求实盘。实盘下单前**必须**：1) 调用 `preview_order()` 展示预估佣金；2) 以表格展示订单详情；3) **停止并等待用户明确确认后**才能调用 `place_order()`。
> Trading involves real money. Default to **Paper Trading** unless the user explicitly requests live trading. Before any live `place_order()` call: 1) call `preview_order()` and show estimated fees, 2) display order details in a table, 3) **stop and wait for explicit user confirmation** — never auto-submit.

- Docs: https://docs.itigerup.com/docs/prepare
- GitHub: https://github.com/tigerfintech/openapi-python-sdk
- SDK: `pip install tigeropen` | Python 3.8 - 3.14

## Language Rules / 语言规则

根据用户输入语言自动回复。用户使用英文提问则用英文回复，使用中文提问则用中文回复。技术术语（代码、API 名称、参数名）保持原文不翻译。
Reply in the user's language. Keep technical terms (code, API names, parameters) as-is.

## Reference Guides

This skill is organized into focused reference files. Load the relevant guide based on your task:

- **[Quickstart](references/quickstart.md)** — SDK install, authentication, client setup, enums/objects, error codes, FAQ
- **[Market Data](references/quote.md)** — Real-time quotes, K-lines, depth, ticks, capital flow, fundamentals, scanner
- **[Trading](references/trade.md)** — Place orders (market/limit/stop/algo), order management, assets, positions, fund transfers
- **[Options](references/option.md)** — Option chains, Greeks, single-leg/multi-leg combos, option calculator
- **[Real-time Push](references/push.md)** — Subscribe to quote/depth/tick/K-line/order/position/asset changes via PushClient
- **[CLI Tool](references/cli.md)** — Command-line interface: config, quote, trade, account, push commands with table/json/csv output
- **[MCP Server](references/mcp.md)** — Expose Tiger API as MCP tools for Cursor, Claude Code, Kiro, Trae

## Quick Start

个人用户优先使用 OAuth2：必须通过**同一个 SDK `OAuth2SessionManager`** 显式完成授权，再将 OAuth2 authentication 附加到客户端配置。`tigeropen auth login` 仅授权 CLI 业务命令；CLI 使用独立的 `cli` OAuth 客户端和凭据，不能授权下面默认 `sdk-python` manager。OAuth2 模式不使用 `tiger_id` 或 RSA 私钥。机构 / Agency、TBHK 专有两步验证和既有 RSA 用户请使用 [quickstart](references/quickstart.md) 中的 RSA 配置。
For individual users, prefer OAuth2: explicitly authorize the **same SDK `OAuth2SessionManager`** before attaching OAuth2 authentication to the client config. `tigeropen auth login` authorizes CLI business commands only; the CLI has a separate `cli` OAuth client and credentials, so it cannot authorize the default `sdk-python` manager below. OAuth2 mode does not use `tiger_id` or an RSA private key. Organizations / Agency, TBHK proprietary two-factor authentication, and existing RSA users should use the RSA setup in [quickstart](references/quickstart.md).

```python
from tigeropen.auth.oauth2 import OAuth2Authentication, OAuth2SessionManager
from tigeropen.common.consts import Market
from tigeropen.tiger_open_config import TigerOpenClientConfig
from tigeropen.quote.quote_client import QuoteClient
from tigeropen.trade.trade_client import TradeClient

# 1. Authorize this SDK session explicitly (loopback + PKCE) /
#    显式授权当前 SDK 会话（loopback + PKCE）
sessions = OAuth2SessionManager()
sessions.login_if_needed(lambda url: print("Open the authorization URL:", url))

# 2. Attach the authorized session / 附加已授权会话
config = TigerOpenClientConfig()
config.authentication = OAuth2Authentication(sessions)

# 3. Query quotes / 查询行情
quote_client = QuoteClient(config)
quote = quote_client.get_market_status(Market.US)

# 4. Place order / 下单
trade_client = TradeClient(config)
# See references/trade.md for order examples
```

## When to Use Each Reference

| Task | Reference |
|------|-----------|
| First time setup, SDK install, auth config | [quickstart.md](references/quickstart.md) |
| Get stock/option/future quotes, K-lines, screener | [quote.md](references/quote.md) |
| Place/modify/cancel orders, check positions/assets | [trade.md](references/trade.md) |
| Option chains, Greeks, combo strategies | [option.md](references/option.md) |
| Real-time streaming data via WebSocket | [push.md](references/push.md) |
| CLI commands: query data, manage orders from terminal | [cli.md](references/cli.md) |
| Set up MCP Server for AI editor integration | [mcp.md](references/mcp.md) |

## Common Symbols / 常见标的速查

当用户使用中文名称或英文简称时，按下表映射。不在表中的标的根据上下文判断。
Map user's natural language to symbols. For unlisted symbols, infer from context.

### 港股 HK

| 常见称呼 | 代码 Symbol |
|---------|------------|
| 腾讯 | 00700 |
| 阿里巴巴、阿里 | 09988 |
| 美团 | 03690 |
| 小米 | 01810 |
| 京东 | 09618 |
| 比亚迪 | 01211 |
| 快手 | 01024 |
| 百度 | 09888 |
| 网易 | 09999 |
| 中芯国际 | 00981 |
| MINIMAX | 00100 |
| 智谱 | 02513 |

### 美股 US

| 常见称呼 | 代码 Symbol |
|---------|------------|
| 苹果 / Apple | AAPL |
| 特斯拉 / Tesla | TSLA |
| 英伟达 / NVIDIA | NVDA |
| 微软 / Microsoft | MSFT |
| 谷歌 / Google | GOOGL |
| 亚马逊 / Amazon | AMZN |
| Meta | META |
| 台积电 / TSM | TSM |
| AMD | AMD |
| 老虎证券 / Tiger / TIGR | TIGR |
| 阿里巴巴（美股）/ BABA | BABA |
| 京东（美股）/ JD | JD |
| 拼多多 / PDD | PDD |
| 标普500 ETF / SPY | SPY |
| 纳指 ETF / QQQ | QQQ |
````

## Other skills (summary only)

`tigeropen-java` (6.8 KB), `-go` (5.1 KB), `-rust` (4.9 KB), `-csharp` (4.7 KB), `-cpp` (4.4 KB) and `-typescript` (4.4 KB, MIT) mirror the Python skill for their SDKs, each opening with the same safety warning. Not embedded here.

## US-market variant: tigeropen-skill-us (TradeUP)

| | |
|---|---|
| Repo | https://github.com/tigerfintech/tigeropen-skill-us |
| Commit | `f2fe5b1426818660eb0fa5a5bc9c8be7ee40b8da` (committed 2026-08-04) |
| License | **No LICENSE file.** Both SKILL.md files declare `license: Apache-2.0` in frontmatter only; `.claude-plugin/plugin.json` carries no license field. Under this directory's rule that counts as no license, so no SKILL.md text is embedded here: summary and short guardrail quotes only. The repo has a `DISCLAIMER.md`. |
| Date scraped | 2026-11-11 |
| Install | `npx skills add tigerfintech/tigeropen-skill-us` (`--skill tigeropen` or `--skill tigeropen-java` for one; `--list` to preview). Alternatives: `claude --plugin-dir` on a clone, or copy `skills/<name>` into `~/.claude/skills/`. |
| Runtime dependency | Python skill: `pip install tigeropen`; Java skill: Maven `io.github.tigerbrokers:openapi-java-sdk:2.4.3`. Credentials `TIGEROPEN_TIGER_ID`, `TIGEROPEN_PRIVATE_KEY`, `TIGEROPEN_ACCOUNT`, with `license=TBUS`. |

Method: shallow clone read as plain files, nothing executed. This is a separate product from the global `tigeropen-skill` above: the repo is branded TradeUP OpenAPI (US market), scoped to US stocks, ETFs (including fractional shares, live only) and options, and says that HK, SG, AU, A-shares, futures, funds, crypto, warrants, multi-leg combos and TWAP/VWAP algos are out of scope. The DISCLAIMER names TradeUP Inc. as developer and TradeUP Securities, Inc. as the broker-dealer.

### Structure

2 skills, Python and Java: `tigeropen` v3.7.0 (7.0 KB SKILL.md plus references `quickstart`, `quote`, `option`, `scanner`, `trade`, `push`, `cli`, `mcp`) and `tigeropen-java` v2.4.3 (6.5 KB plus `quickstart`, `quote`, `option`, `scanner`, `trade`, `push`, `account`). SDK coding skills: the agent writes or runs code against the API. The Python skill also documents the `tigeropen` CLI and the `tigermcp` MCP server.

### Summary table

| Skill | What it does | Tools / CLI called | Capability | Guardrail text |
|---|---|---|---|---|
| `tigeropen` (Python) | SDK setup, market data, option chains and Greeks, scanner, US stock and option orders, push subscriptions, CLI, MCP setup | Python SDK `TradeClient.preview_order()`, `place_order()`, `get_orders()`; `tigeropen trade order place ... [-y]`; `tigermcp` | read, paper, live | "Default to the **Paper Trading** account unless the user explicitly requests live trading. Before any live `place_order()` call: 1) call `preview_order()` and show estimated commission, 2) display order details in a table ..., 3) **stop and wait for explicit user confirmation**" and "never auto-submit." |
| `tigeropen-java` | Same coverage, Java SDK (`TigerHttpClient`, `WebSocketClient`) | Java SDK request classes for place, preview, modify, cancel | read, paper, live | "Default to the **Paper Trading** account when generating trading code unless the user explicitly requests live trading. Always print order details and require explicit confirmation before placing live orders." |

Capability is paper by default and live on request; the skills are code-writing aids, so "live" means the generated or run code can place real orders on the account whose credentials are configured.

### Guardrails: what is model-enforced and what is code-enforced

**Model-enforced (SKILL.md and references):**

- Paper default and the live preview-then-confirm workflow quoted above. `references/trade.md` opens "Default to Paper Trading. Never place a Live order without explicit user confirmation." and lists five steps: verify a non-`PAPER` account via `get_managed_accounts()`, `preview_order()`, show a details table and "**stop and wait**", `place_order()` only after an explicit reply such as "yes", "confirm" or "go ahead", then poll `get_order()` until a terminal status because returning successfully "means *submitted*, not *filled*".
- "Never log or echo private-key fields" (`private_key`, `private_key_pk1`, `private_key_pk8`, `secret_key`).
- A warning against passing a fractional `qty` directly to `market_order()` or `limit_order()`: it is truncated or misread (for example `82379`), so fractional orders must use `market_order_by_amount`. This is a correctness rule that protects against a wrong-size order.
- The Java skill carries only a one-line version of the confirmation rule.

**Code-enforced:**

- `tigermcp` read-only mode, `TIGERMCP_READONLY=true`: "all trading-mutation tools (place / modify / cancel order, fund transfer) are disabled". `references/mcp.md` says "Strongly consider running with `TIGERMCP_READONLY=true`" and the sample configs set it, but it is opt-in and the README example "Set `TIGERMCP_READONLY` to `true` for safety, or `false` to allow trading" leaves the choice to the user. Note the MCP guard covers fund transfer, which the SDK skill text does not mention at all.
- The CLI's own confirmation prompt on place, modify and cancel ("Place / modify / cancel require interactive confirmation by default"). It exists in the tool the skill documents, not in the skill, and it is bypassed by `-y`.
- Paper versus live is decided by the account and credentials the user configures (`account_type` `PAPER` vs `STANDARD`), not by the skill.

### Flags

- **`-y` skips the CLI prompt and is shown in the skill's own examples.** `references/cli.md` prints `tigeropen trade order place --symbol AAPL --action BUY --quantity 100 --limit-price 150 -y` right after the prompted form, with the note "Default `-y` is **off** for a reason" and tells the agent to "keep the confirmation prompt for live accounts". Skip only on paper accounts after verifying parameters." That note is model-enforced; an agent that adds `-y` on a live account removes the only code-side confirmation.
- **Funds movement exists in the API surface.** The Java `account.md` covers deposit and withdrawal records and transferable funds, and the MCP tool list includes fund transfer. The skill text has no confirmation rule specific to fund transfer.
- **Secrets and files.** Credentials are read from `TIGEROPEN_*` environment variables or a properties file (`tiger_openapi_config.properties`, PKCS#8 or PKCS#1 private key), and the Python skill declares them under `metadata.openclaw.requires.env`. The skill tells the agent not to echo keys but cannot stop it reading the properties file. No file writes beyond what the agent's own generated code does.
- **No size caps.** No position-size, notional or daily-loss limit anywhere in the skill text.
- **No repo license.** Frontmatter `Apache-2.0` is a claim, not a license grant by file.
- `DISCLAIMER.md` states that AI agents may misinterpret natural-language instructions and place unintended orders, that the user "must independently review and validate all AI output before executing any trade", and that the tool is not suited to latency-sensitive trading.
