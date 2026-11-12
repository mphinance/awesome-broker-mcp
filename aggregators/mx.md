---
name: MX
region: US
status: none
trading: false
server_type: n/a
source_url: none found
last_verified: 2026-11-11
confidence: medium
---

# MX

## Overview

No MCP server found for MX (MX Technologies), official or community. Two
differently-worded searches surfaced no MCP integration, no Claude connector, and no
third-party wrapper repo — results returned only MX's general product/API marketing
pages and unrelated MCP ecosystem content. MX does operate a well-documented REST API
(the MX Platform API: JSON, resource-oriented URLs, account aggregation, balance
verification, transaction enrichment across ~16,000 institutions), which makes it a
reasonable DIY-wrapper candidate, but a REST API is not an MCP server.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- 2026-11-11: I read `www.mx.com/llms.txt`, `www.mx.com` and `docs.mx.com/llms.txt`. None mention MCP or AI agent connectors for the data API; MX's AI references are its own product marketing ("MX Max", Financial AI assistant). GitHub API searches found no MX Technologies MCP repo. The earlier negative therefore now rests on first-party pages for the data API.
- New fact: `docs.mx.com` is a hosted docs site with an MCP endpoint at `https://docs.mx.com/mcp`. An unauthenticated initialize POST returned serverInfo "MX Documentation" with instructions saying it provides search and retrieval over the public docs site. That is a documentation-search server, not a connector to MX account or transaction data, and it cannot move money. Tool list was not called. Status stays `none` for a data or trading MCP.
- Confidence is medium rather than high: 'MX' is a short, highly ambiguous token that
  collides badly with unrelated terms (Microsoft MXC, mcp-agent, etc.), so search
  recall for this vendor is genuinely weaker than for the others in the cluster. A
  first-party server could plausibly exist and be missed. A targeted fetch of
  docs.mx.com would be the cheapest way to firm this up.
- Not a broker and cannot place orders under any route. If a wrapper were built on the
  MX Platform API, it would be read-only financial data aggregation and enrichment.
- The `docs.mx.com/api-reference/platform-api/` URL returns a 308 redirect that was not followed, so the REST-API characterization still comes from search summaries plus MX's own product pages, not the API reference itself.
