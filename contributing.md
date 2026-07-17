# Contributing

Additions and corrections are both very welcome. **Corrections especially** — this
space moves fast, and a stale entry is the main way a list like this becomes useless.

## The one rule

**Every claim traces to a source you actually opened.**

Not a roundup blog post. Not "I'm pretty sure." Not another awesome-list. The
broker's own docs, or the server's own repo. If you couldn't verify it, say so in
**Caveats** rather than smoothing it over — a hedge is useful, a confident wrong
answer is not.

This is the difference between this list and a search-engine-generated one, and it's
worth protecting.

## Adding a server

1. Copy `_template.md` into `brokers/` (or `aggregators/`) as `<slug>.md`.
2. Fill in the frontmatter completely. `last_verified` is the date **you** checked,
   in `YYYY-MM-DD`.
3. Add a row to the right table in `readme.md`.
4. Open a PR. Include a link to what you checked.

### Frontmatter fields

| Field | Values | Notes |
|---|---|---|
| `name` | string | Display name of the broker/exchange. |
| `region` | string | Where you can actually open an account. |
| `status` | `official` \| `community` \| `aggregator-only` \| `none` | See below. |
| `trading` | `true` \| `false` \| `draft-only` | Can it place a real order? See below. |
| `server_type` | `remote` \| `local` \| `n/a` | Hosted URL vs. a process on your machine. |
| `source_url` | URL | The single best first-party source. |
| `last_verified` | `YYYY-MM-DD` | **The date you personally checked.** |

### What the statuses mean

- **official** — first-party. Built and/or hosted by the broker themselves.
- **community** — a third-party repo. Not endorsed by the broker. Works, but you are
  trusting a stranger with broker credentials — the list says so, every time.

### What the `trading` values mean

- **`true`** — the MCP server can place a real order on its own tool call.
- **`false`** — read-only. It cannot place an order.
- **`draft-only`** — it *builds* an order, but a human submits it in the broker's own
  UI. The server never puts anything on the market. IBKR is the reference case:
  drafted instructions land in an "AI Instructions tab" and you convert each one
  yourself.

> **`draft-only` is not a hedge, it's a category.** We originally allowed only
> `true`/`false`, so IBKR was filed as `trading: true` while the page's own prose said
> Claude never submits. The frontmatter contradicted the body for anyone scanning the
> tables. If a human must press the button, it is `draft-only`.

### Verify the tool surface, not the README

The single highest-value check: **does the server actually register the tool it claims?**

- E\*TRADE's client library has `place_order`, but it is never registered as an MCP
  tool — an LLM connected to that server cannot trade. We had it as `trading: true`.
- The only order-capable "OANDA MCP server" has no MCP SDK in `requirements.txt` at
  all. It's a FastAPI REST app claiming MCP compatibility in prose.

Clone it, find `list_tools()` / `server.tool(...)`, and enumerate. A listing site
saying "supports order placement" is not evidence.

> **Check whose GitHub org it is before you call something community.** We shipped
> Alpaca as "community" when `alpacahq` is Alpaca's *own* org and the README literally
> says "Alpaca's official MCP Server." A local server is not the same thing as an
> unofficial one — **official/community** (who wrote it) and **local/remote** (where it
> runs) are independent axes, and conflating them is the easiest mistake to make here.
> Getting this wrong isn't cosmetic: "community" carries a warning about trusting a
> stranger's code, which is unfair to a broker who built and stands behind the thing.
- **aggregator-only** — no direct server; reachable only via SnapTrade/Truthifi/etc.
- **none** — **checked, and confirmed nothing exists.** This is a real entry, not a
  gap. Knowing SoFi has no MCP route saves the next person the same afternoon.

`none` entries are as valuable as hits. Please submit them.

## Correcting or refreshing an entry

The most useful PR you can open. If you re-checked an entry and it still holds:

- Bump `last_verified` to today's date.
- **Only bump it if you actually re-checked the source.** A `last_verified` date that
  wasn't earned is worse than an old one, because it launders a stale claim as fresh.

If something changed, update the page and the table row, and note what changed.

## Style

- Say what a server **does and doesn't do**. No marketing language.
- Prefer specifics: "equities + multi-leg options" beats "powerful trading."
- Note the guardrails: draft-first? explicit confirm? unlock step for live orders?
  This is the part readers most need and vendors most bury.
- Flag maintenance signals on community servers — last commit, stars, whether it looks
  abandoned. People are connecting these to real money.
- Keep the honest hedges. "Couldn't pin the endpoint URL without a signup" is a
  legitimate, useful sentence.

## What gets rejected

- Affiliate/referral links.
- Undisclosed self-promotion. Submitting your own server is fine — say that it's yours.
- A plain REST API with no MCP layer, listed as though it were a server. It can be
  listed as a DIY-wrapper candidate, labelled as such.
- Entries sourced from another list rather than the primary source.
