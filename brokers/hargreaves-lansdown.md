---
name: Hargreaves Lansdown
region: UK
status: none
trading: false
server_type: n/a
source_url: none found
last_verified: 2026-11-11
confidence: high
---

# Hargreaves Lansdown

## Overview

No MCP server of any kind. A GitHub search across all Hargreaves Lansdown repositories
returned roughly a dozen projects and not one mentions MCP or Model Context Protocol.
HL also has no official public developer API for retail customers, which is why its
whole third-party ecosystem is unofficial scrapers and web-portal clients —
jamiehaywood/hargreaves (54 stars, 'unofficial API to programatically access your
Hargreaves Lansdown account'), jonathanmadeley/hl-api-client-net (27, C#, ISA data),
tomdee/HLScraper (Scrapy), krazerxz/hl_scraper (Ruby) — plus CSV/QIF export
converters. HL is absent from the openbankingtracker agentic-banking directory.

## How to connect

Nothing to connect. See Overview — no MCP route was found.

## Trading scope

None.

## Caveats

- Weak DIY-wrapper candidate at best: with no official API, any wrapper must scrape
  the authenticated web portal, which is brittle, requires full account credentials,
  and carries clear ToS risk. This is the least viable broker in the cluster for an
  MCP route.
- The existing unofficial clients are read/portfolio-oriented; none of the surfaced
  projects claim order execution.
- This is a clean, confident negative — expected, not a research gap.

## Sources

Checked directly on 2026-07-16 and re-checked 2026-11-11:

- <https://api.github.com/search/repositories?q=%22hargreaves+lansdown%22&sort=stars&order=desc>
- <https://www.openbankingtracker.com/agentic-banking-and-mcp>
- <https://www.hl.co.uk/llms.txt> and <https://www.hl.co.uk/> (read 2026-11-11: no MCP, AI agent, or developer API mention; the llms.txt lists only ISA, pension and savings product pages)
- GitHub repository search for `hargreaves lansdown mcp` (2026-11-11): 0 results. The openbankingtracker page was not re-read this session.
