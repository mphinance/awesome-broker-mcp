#!/usr/bin/env node
// Detects upstream changes at each broker: has anything moved since we last looked?
//
// check-freshness.mjs asks "how old is OUR date?". This asks "did THEY change?".
// For every entry in brokers/ and aggregators/ it collects the URLs the page cites,
// and probes the machine-readable surfaces that change when a broker ships something:
//
//   <origin>/llms.txt, /llms-full.txt   agent-facing docs index
//   <origin>/openapi.json (+ swagger)   API surface
//   source_url + MCP endpoints          the page we verified against, and whether the endpoint is alive
//   github.com/<o>/<r>                  latest release tag + last push (needs `gh`)
//
// Each probe is hashed and compared to scripts/upstream-snapshot.json.
//
//   node scripts/check-upstream.mjs                 # diff against snapshot, exit 0
//   node scripts/check-upstream.mjs --update        # diff, then write the new snapshot
//   node scripts/check-upstream.mjs --strict        # exit 1 if anything changed
//   node scripts/check-upstream.mjs robinhood etrade  # only these slugs
//
// First run has no snapshot, so everything is reported as BASELINE. Commit the snapshot;
// every run after that tells you what moved.

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAP = join(ROOT, "scripts", "upstream-snapshot.json");
const DIRS = ["brokers", "aggregators"];
const TIMEOUT_MS = 12000;
const CONCURRENCY = 8;
// Several brokers (Robinhood, Schwab) 403 anything that doesn't look like a browser.
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const STRICT = args.includes("--strict");
const ONLY = args.filter((a) => !a.startsWith("--"));

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/\s+#.*$/, "").trim();
  }
  return out;
}

// ---- collect targets -------------------------------------------------------

const urlRe = /https?:\/\/[^\s)>\]"'`]+/g;
const clean = (u) => u.replace(/[.,;:*]+$/, "");

// Origins we never probe for llms/openapi: they're hosts for other people's content.
const SKIP_ORIGIN = /(^|\.)(github\.com|githubusercontent\.com|npmjs\.com|pypi\.org|x\.com|twitter\.com|youtube\.com|medium\.com|reddit\.com|discord\.com|discord\.gg|t\.me|linkedin\.com|wikipedia\.org|readthedocs\.io|smithery\.ai|glama\.ai|pulsemcp\.com|mcp\.so)$/;

function targetsFor(slug, text) {
  const fm = frontmatter(text);
  const urls = new Set((text.match(urlRe) || []).map(clean));
  if (fm.source_url) urls.add(fm.source_url);

  const probes = []; // {key, url, kind}
  const origins = new Set();
  const repos = new Set();

  for (const u of urls) {
    let p;
    try { p = new URL(u); } catch { continue; }
    if (/^(localhost|127\.|0\.0\.0\.0)/.test(p.hostname) || /[{}<>]/.test(u) || /(^|\.)example\.(com|org)$/.test(p.hostname)) continue;
    if (p.hostname === "github.com") {
      const [o, r] = p.pathname.split("/").filter(Boolean);
      if (o && r && !["orgs", "topics", "sponsors", "marketplace"].includes(o)) repos.add(`${o}/${r.replace(/\.git$/, "")}`);
      continue;
    }
    if (SKIP_ORIGIN.test(p.hostname)) continue;
    origins.add(p.origin);
    if (/mcp/i.test(p.pathname + p.hostname)) probes.push({ key: `mcp:${u}`, url: u, kind: "mcp" });
    else if (p.pathname.length > 1) probes.push({ key: `page:${u}`, url: u, kind: "page" }); // every cited doc/support/changelog page
  }

  for (const o of origins) {
    probes.push({ key: `llms:${o}/llms.txt`, url: `${o}/llms.txt`, kind: "llms" });
    probes.push({ key: `llms:${o}/llms-full.txt`, url: `${o}/llms-full.txt`, kind: "llms" });
    probes.push({ key: `openapi:${o}/openapi.json`, url: `${o}/openapi.json`, kind: "openapi" });
  }
  if (fm.source_url) probes.push({ key: `page:${fm.source_url}`, url: fm.source_url, kind: "page" });

  const seen = new Set();
  return {
    slug,
    fm,
    probes: probes.filter((p) => !seen.has(p.key) && seen.add(p.key)),
    repos: [...repos],
  };
}

// ---- probing ---------------------------------------------------------------

const looksHtml = (s) => /^\s*(<!doctype html|<html|<head|<body)/i.test(s);

// Strip volatile noise so a marketing page doesn't "change" on every nonce/timestamp.
function normalizePage(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\b[0-9a-f]{8,}\b/gi, "") // nonces, build hashes, request ids
    .replace(/\b\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?\b/g, "") // timestamps
    .replace(/\s+/g, " ")
    .trim();
}

async function probe(job) {
  const r = await probeOnce(job);
  const transient = r.error || r.status >= 500 || r.status === 429;
  if (!transient) return r;
  await new Promise((res) => setTimeout(res, 1500));
  return probeOnce(job);
}

async function probeOnce({ url, kind }) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const mcp = kind === "mcp";
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctl.signal,
      method: mcp ? "POST" : "GET",
      headers: {
        "user-agent": UA,
        accept: mcp ? "application/json, text/event-stream" : kind === "openapi" ? "application/json" : "*/*",
        ...(mcp ? { "content-type": "application/json" } : {}),
      },
      body: mcp ? JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "upstream-check", version: "1" } } }) : undefined,
    });
    const status = res.status;
    const ct = res.headers.get("content-type") || "";
    // A live MCP server answers an initialize POST with 200 or an auth wall (401/403).
    // Only 404/410/5xx or no answer at all means the endpoint is gone.
    if (kind === "mcp") {
      await res.body?.cancel().catch(() => {});
      if (status === 404 || status === 405) {
        // Cited URL may be a docs page that merely mentions mcp, not an endpoint. If a plain GET works, it's alive.
        try {
          const g = await fetch(url, { redirect: "follow", signal: ctl.signal, headers: { "user-agent": UA } });
          await g.body?.cancel().catch(() => {});
          if (g.status === 200) return { status: 200, alive: true };
        } catch { /* fall through */ }
      }
      return { status, alive: status !== 404 && status !== 410 && status < 500 };
    }
    const body = await res.text();
    if (status !== 200) return { status };
    if (kind === "llms") {
      if (looksHtml(body) || /text\/html/i.test(ct)) return { status: 404, soft404: true };
      return { status, hash: sha(body), bytes: body.length };
    }
    if (kind === "openapi") {
      try {
        const j = JSON.parse(body);
        if (!j.openapi && !j.swagger) return { status: 404, soft404: true };
        return {
          status,
          hash: sha(body),
          bytes: body.length,
          version: j.info?.version,
          title: j.info?.title,
          paths: Object.keys(j.paths || {}).length,
        };
      } catch {
        return { status: 404, soft404: true };
      }
    }
    const text = normalizePage(body).replace(/\d+/g, "#");
    return { status, hash: sha(text), bytes: text.length };
  } catch (e) {
    return { error: e.name === "AbortError" ? "timeout" : String(e.cause?.code || e.message).slice(0, 60) };
  } finally {
    clearTimeout(t);
  }
}

let ghOk = true;
function ghRepo(repo) {
  if (!ghOk) return { error: "gh unavailable" };
  try {
    const meta = JSON.parse(execFileSync("gh", ["api", `repos/${repo}`, "--jq", "{pushed:.pushed_at,archived:.archived,stars:.stargazers_count}"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
    let tag = null;
    try {
      tag = execFileSync("gh", ["api", `repos/${repo}/releases/latest`, "--jq", ".tag_name"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch { /* no releases */ }
    return { pushed: meta.pushed?.slice(0, 10), archived: meta.archived, tag };
  } catch (e) {
    if (e.code === "ENOENT") ghOk = false;
    return { error: "not found / no access" };
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

// ---- main ------------------------------------------------------------------

const entries = [];
for (const dir of DIRS) {
  for (const f of readdirSync(join(ROOT, dir))) {
    if (!f.endsWith(".md") || f === "readme.md" || f.startsWith("_")) continue;
    const slug = basename(f, ".md");
    if (ONLY.length && !ONLY.includes(slug)) continue;
    entries.push(targetsFor(slug, readFileSync(join(ROOT, dir, f), "utf8")));
  }
}

const known = new Set(entries.map((e) => e.slug));
const unknown = ONLY.filter((a) => !known.has(a));
if (unknown.length) {
  console.error(`unknown slug(s): ${unknown.join(", ")}. Use the filename under brokers/ or aggregators/ without .md`);
  process.exit(2);
}

const jobs = entries.flatMap((e) => e.probes.map((p) => ({ slug: e.slug, ...p })));
console.error(`probing ${jobs.length} URLs across ${entries.length} entries...`);
const results = await pool(jobs, CONCURRENCY, async (j) => ({ ...j, r: await probe(j) }));

const now = {};
for (const e of entries) now[e.slug] = { probes: {}, repos: {} };
for (const j of results) now[j.slug].probes[j.key] = j.r;
for (const e of entries) for (const repo of e.repos) now[e.slug].repos[repo] = ghRepo(repo);

const prev = existsSync(SNAP) ? JSON.parse(readFileSync(SNAP, "utf8")) : null;

// ---- diff ------------------------------------------------------------------

const KNOWN_DEAD = [/tylerflar\/claude-fidelity-mcp/, /snaptrade\.com\/brokerages\/fidelity/, /wealthsimple\/wealthsimple-mcp-server/, /xtb-mcp-server/, /webapi\.tradezero\.com/];
const present = (r) => r && r.status === 200 && !r.soft404;
// "Absent" must be definitive. A timeout, 403 or 5xx means we are blind, not that it vanished.
const absent = (r) => r && (r.soft404 || r.status === 404 || r.status === 410);
const blind = (r) => r && !present(r) && !absent(r);
const lines = [];
const counts = { changed: 0, appeared: 0, gone: 0, dead: 0, blind: 0, baseline: 0 };
let blocked = 0, probed = 0, okSurfaces = 0;
for (const e of entries) for (const [k, r] of Object.entries(now[e.slug].probes)) { if (k.startsWith("page:") || k.startsWith("mcp:")) continue; probed++; if (present(r)) okSurfaces++; else if (r.status === 403 || r.status === 429) blocked++; }

function note(tag, slug, msg) {
  if (tag === "dead" && KNOWN_DEAD.some((re) => re.test(msg))) return;
  counts[tag]++;
  lines.push({ tag, slug, msg });
}

for (const e of entries) {
  const cur = now[e.slug];
  const old = prev?.snapshot?.[e.slug];

  for (const [key, r] of Object.entries(cur.probes)) {
    const o = old?.probes?.[key];
    const kind = key.split(":")[0];
    const target = key.slice(kind.length + 1);

    if (kind === "mcp") {
      if (!r.alive && r.status !== undefined) note("dead", e.slug, `MCP endpoint answers ${r.status}: ${target}`);
      else if (r.error) note("dead", e.slug, `MCP endpoint unreachable (${r.error}): ${target}`);
      continue;
    }
    if (kind === "page" && !present(r)) {
      // Cited pages 403/429 bots routinely; only a hard 404/410 or DNS failure is worth a line.
      if (r.status === 404 || r.status === 410 || /ENOTFOUND/.test(r.error || "")) note("dead", e.slug, `cited page ${r.status ?? r.error}: ${target}`);
      continue;
    }
    if (!prev) { if (present(r) && kind !== "page") note("baseline", e.slug, `${kind} present: ${target}`); continue; }

    if (present(r) && !present(o)) {
      if (kind !== "page" && !blind(o)) note("appeared", e.slug, `NEW ${kind}: ${target}${r.version ? ` (v${r.version}, ${r.paths} paths)` : ""}`);
    } else if (absent(r) && present(o)) {
      note("gone", e.slug, `${kind} disappeared: ${target} (${r.status ?? r.error})`);
    } else if (blind(r) && present(o)) {
      note("blind", e.slug, `${kind} unreadable this run (${r.status ?? r.error}), was readable before: ${target}`);
    } else if (present(r) && present(o) && r.hash !== o.hash && !(kind === "page" && r.bytes === o.bytes)) {
      // (page, same byte count, different hash) is ad/widget churn, not an edit: skipped on purpose.
      let d = `${kind} CHANGED: ${target} (${o.bytes} -> ${r.bytes} bytes)`;
      if (kind === "openapi") d += ` version ${o.version} -> ${r.version}, paths ${o.paths} -> ${r.paths}`;
      note("changed", e.slug, d);
    }
  }

  for (const [repo, r] of Object.entries(cur.repos)) {
    const o = old?.repos?.[repo];
    if (r.error) continue;
    if (r.archived && !o?.archived) note("gone", e.slug, `repo ARCHIVED: ${repo}`);
    if (o && r.tag && r.tag !== o.tag) note("changed", e.slug, `repo ${repo} release ${o.tag ?? "none"} -> ${r.tag}`);
    else if (o && r.pushed && r.pushed !== o.pushed) note("changed", e.slug, `repo ${repo} pushed ${o.pushed} -> ${r.pushed}`);
  }
}

// ---- report ----------------------------------------------------------------

const ORDER = ["changed", "appeared", "gone", "dead", "blind", "baseline"];
const LABEL = { changed: "CHANGED ", appeared: "NEW     ", gone: "GONE    ", dead: "DEAD    ", blind: "BLIND   ", baseline: "BASELINE" };
lines.sort((a, b) => ORDER.indexOf(a.tag) - ORDER.indexOf(b.tag) || a.slug.localeCompare(b.slug));

if (!prev) console.log("No snapshot yet; this run is a baseline. Run with --update to save it.\n");
else console.log(`Diff vs snapshot from ${prev.generated}\n`);

for (const l of lines) console.log(`${LABEL[l.tag]}  ${l.slug.padEnd(22)} ${l.msg}`);
console.log(`\n${counts.changed} changed, ${counts.appeared} new, ${counts.gone} gone, ${counts.dead} dead, ${counts.blind} blind` + (prev ? "" : `, ${counts.baseline} baseline surfaces`));
console.log(`coverage: ${okSurfaces} llms/openapi surfaces readable, ${blocked} blocked by bot walls (403/429, cannot be monitored), ${probed - okSurfaces - blocked} absent`);
if (!lines.length && prev) console.log("nothing changed.");

if (UPDATE) {
  const merged = { ...(prev?.snapshot || {}), ...now };
  writeFileSync(SNAP, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), snapshot: merged }, null, 1) + "\n");
  console.error(`snapshot written: ${SNAP}`);
}

process.exit(STRICT && (counts.changed || counts.appeared || counts.gone) ? 1 : 0);
