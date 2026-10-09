#!/usr/bin/env node
// Keeps the readme's headline numbers honest. The counts come from entry frontmatter,
// so a status change in brokers/*.md that isn't reflected in the badges fails CI.
//
//   node scripts/check-readme-stats.mjs          # exit 1 on mismatch
//   node scripts/check-readme-stats.mjs --fix    # rewrite the readme numbers in place
//
// entries  = files in brokers/ + aggregators/, plus no-route rows that have no file of their
//            own (SoFi, JPM, ... are listed in the readme's no-route table only)
// official = files whose status starts with "official" (including "official + community")
// none     = files with status "none", plus those file-less no-route rows

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = process.argv.includes("--fix");

let entries = 0, official = 0, none = 0;
for (const dir of ["brokers", "aggregators"]) {
  for (const f of readdirSync(join(ROOT, dir))) {
    if (!f.endsWith(".md") || f === "readme.md" || f.startsWith("_")) continue;
    const m = readFileSync(join(ROOT, dir, f), "utf8").match(/^status:\s*([^\n#]+)/m);
    const status = (m?.[1] || "").trim();
    entries++;
    if (status.startsWith("official")) official++;
    if (status === "none") none++;
  }
}

const README = join(ROOT, "readme.md");
let md = readFileSync(README, "utf8");

// File-less no-route rows: table rows inside the no-route <details> with no link to an entry file.
const det = md.match(/<details>\s*<summary><b>\d+ brokers with no MCP route[\s\S]*?<\/details>/)?.[0] || "";
const fileless = det.split("\n").filter((l) => /^\| /.test(l) && !/^\| Broker/.test(l) && !/^\|---/.test(l) && !/\((brokers|aggregators)\//.test(l)).length;
entries += fileless;
none += fileless;
const checks = [
  ["entries badge", /entries-(\d+)-/, entries, (n) => `entries-${n}-`],
  ["entries alt", /alt="(\d+) entries"/, entries, (n) => `alt="${n} entries"`],
  ["official badge", /official%20servers-(\d+)-/, official, (n) => `official%20servers-${n}-`],
  ["official alt", /alt="(\d+) official"/, official, (n) => `alt="${n} official"`],
  ["no-route badge", /confirmed%20no%20route-(\d+)-/, none, (n) => `confirmed%20no%20route-${n}-`],
  ["no-route alt", /alt="(\d+) confirmed none"/, none, (n) => `alt="${n} confirmed none"`],
  ["header", /<sub>(\d+) brokers checked/, entries, (n) => `<sub>${n} brokers checked`],
  ["no-route summary", /<b>(\d+) brokers with no MCP route<\/b>/, none, (n) => `<b>${n} brokers with no MCP route</b>`],
];

let bad = 0;
for (const [name, re, want, rewrite] of checks) {
  const m = md.match(re);
  if (!m) { console.log(`MISSING  ${name}: pattern not found in readme.md`); bad++; continue; }
  if (Number(m[1]) !== want) {
    console.log(`${FIX ? "FIXED  " : "MISMATCH"}  ${name}: readme says ${m[1]}, entries say ${want}`);
    if (FIX) md = md.replace(re, rewrite(want)); else bad++;
  }
}
if (FIX) writeFileSync(README, md);
console.log(`entries ${entries} · official ${official} · none ${none}` + (bad ? ` — ${bad} problem(s)` : " — readme matches"));
process.exit(bad ? 1 : 0);
