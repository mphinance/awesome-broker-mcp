#!/usr/bin/env node
// Flags entries whose `last_verified` has gone stale.
//
// A broker directory is only worth the date on it. This turns "someone should
// re-check these" into a thing CI says out loud, on a schedule.
//
// Usage:
//   node scripts/check-freshness.mjs             # report, exit 0
//   node scripts/check-freshness.mjs --strict    # exit 1 if anything is STALE
//   node scripts/check-freshness.mjs --days 120  # override the stale threshold

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["brokers", "aggregators"];

const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const daysFlag = args.indexOf("--days");
const STALE_DAYS = daysFlag !== -1 ? Number(args[daysFlag + 1]) : 90;
const WARN_DAYS = Math.floor(STALE_DAYS / 2);

// Deliberately not a YAML dep — the frontmatter we control is flat key: value.
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/\s+#.*$/, "").trim();
  }
  return out;
}

const today = new Date();
const rows = [];
const errors = [];

for (const dir of DIRS) {
  let files;
  try {
    files = readdirSync(join(ROOT, dir)).filter(
      (f) => f.endsWith(".md") && f !== "readme.md" && !f.startsWith("_"),
    );
  } catch {
    continue;
  }

  for (const file of files) {
    const path = join(dir, file);
    const fm = frontmatter(readFileSync(join(ROOT, path), "utf8"));

    if (!fm) {
      errors.push(`${path}: no frontmatter block`);
      continue;
    }
    if (!fm.last_verified) {
      errors.push(`${path}: missing 'last_verified'`);
      continue;
    }

    // `pending` is a legitimate, deliberate state: the page exists and its claims are
    // inherited from a related source, but nobody has checked it first-hand yet. That's
    // an honest disclosure, not a formatting mistake — track it, don't fail on it.
    if (fm.last_verified === "pending") {
      rows.push({ path, name: fm.name ?? file, age: null, state: "UNVERIFIED", status: fm.status ?? "?" });
      continue;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.last_verified)) {
      errors.push(
        `${path}: 'last_verified: ${fm.last_verified}' is not YYYY-MM-DD (or the literal 'pending')`,
      );
      continue;
    }

    const when = new Date(`${fm.last_verified}T00:00:00Z`);
    if (Number.isNaN(when.getTime())) {
      errors.push(`${path}: 'last_verified: ${fm.last_verified}' is not a real date`);
      continue;
    }

    const age = Math.floor((today - when) / 86400000);
    const state = age < 0 ? "FUTURE" : age > STALE_DAYS ? "STALE" : age > WARN_DAYS ? "AGING" : "FRESH";
    rows.push({ path, name: fm.name ?? file, age, state, status: fm.status ?? "?" });
  }
}

// Unverified first (they need a human most), then oldest-first.
rows.sort((a, b) => {
  if ((a.age === null) !== (b.age === null)) return a.age === null ? -1 : 1;
  return (b.age ?? 0) - (a.age ?? 0);
});

const icon = { FRESH: "ok", AGING: "warn", STALE: "STALE", FUTURE: "?!", UNVERIFIED: "never" };
console.log(`\nFreshness — stale after ${STALE_DAYS} days (${rows.length} entries)\n`);
for (const r of rows) {
  const age = r.age === null ? "  --" : `${String(r.age).padStart(4)}`;
  console.log(`  ${icon[r.state].padEnd(6)} ${age}d  ${r.path.padEnd(38)} ${r.status}`);
}

const stale = rows.filter((r) => r.state === "STALE");
const future = rows.filter((r) => r.state === "FUTURE");
const aging = rows.filter((r) => r.state === "AGING");
const unverified = rows.filter((r) => r.state === "UNVERIFIED");
const fresh = rows.filter((r) => r.state === "FRESH");

console.log(
  `\n${fresh.length} fresh · ${aging.length} aging · ${stale.length} stale · ` +
    `${unverified.length} never independently verified · ${future.length} future-dated`,
);

if (unverified.length) {
  console.log(`\n'never verified' entries are honest placeholders, not bugs — their claims are`);
  console.log(`inherited from a related page. Checking one first-hand is a great first PR.`);
}

// A future date means someone typed a date they couldn't have verified on.
for (const r of future) errors.push(`${r.path}: last_verified is in the future`);

if (errors.length) {
  console.error(`\nErrors:`);
  for (const e of errors) console.error(`  - ${e}`);
}

if (stale.length) {
  console.log(`\nStale entries need a human to re-open the source and either confirm`);
  console.log(`(bump last_verified) or correct the page. Don't bump what you didn't check.`);
}

if (errors.length) process.exit(1);
if (STRICT && stale.length) process.exit(1);
