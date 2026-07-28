#!/usr/bin/env node
/**
 * One command: fix images + validate Ready posts (+ optional publish).
 *
 *   npm run publish:ready              Step 1 — auto-fix + check
 *   npm run publish:ready -- --publish Step 2 — sync when clean (or --confirm if warnings)
 *
 * Exit codes: 0 = PASS | 1 = FAIL | 2 = WARN (needs confirm)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvKey } from "./lib/load-env.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAULT_READY = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Blog",
  "02 Ready to publish"
);

function log(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 58 - title.length))}`);
}

function run(cmd, args, { cwd = ROOT, allowFail = false } = {}) {
  const label = [cmd, ...args].join(" ");
  console.log(`\n> ${label}`);
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", shell: true });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0 && !allowFail) {
    throw new Error(`Command failed (${r.status}): ${label}`);
  }
  return r;
}

function listReadySlugs(slugFilter) {
  if (!fs.existsSync(VAULT_READY)) return [];
  return fs
    .readdirSync(VAULT_READY)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .filter((s) => !slugFilter || s === slugFilter);
}

function parsePreflightOutput(text) {
  const articles = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const status = line.match(/^\s*\[(PASS|WARN|FAIL)\]\s+(\S+)/);
    if (status) {
      if (current) articles.push(current);
      current = { slug: status[2], status: status[1], errors: [], warnings: [] };
      continue;
    }
    if (!current) continue;
    const err = line.match(/^\s+ERROR\s+(.+)/);
    const warn = line.match(/^\s+WARN\s+(.+)/);
    if (err) current.errors.push(err[1]);
    if (warn) current.warnings.push(warn[1]);
  }
  if (current) articles.push(current);
  return articles;
}

async function phaseFix(slugs) {
  log("Auto-fix: images (paste, Pexels, Unsplash)");
  for (const slug of slugs) {
    console.log(`\n• ${slug}`);
    run("node", ["scripts/ingest-vault-images.mjs", "--slug", slug], { allowFail: true });
  }

  log("Auto-fix: normalize vault images");
  run("python", ["scripts/normalize-vault-images.py"]);

  log("Auto-fix: Pexels credits");
  for (const slug of slugs) {
    run("node", ["scripts/resolve-pexels-credit.mjs", "--apply", slug], { allowFail: true });
  }
}

function phaseCheck() {
  log("Preflight validation");
  const ps1 = path.join(ROOT, "scripts", "sync-obsidian.ps1");
  const r = run(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", `"${ps1}"`, "-Preflight"],
    { allowFail: true }
  );

  const summary = parsePreflightOutput(r.stdout || "");
  const hasFail = summary.some((a) => a.status === "FAIL" || a.errors.length > 0);
  const hasWarn = summary.some((a) => a.status === "WARN" || a.warnings.length > 0);

  return { summary, hasFail, hasWarn };
}

function printSummary(summary) {
  log("Results");
  for (const a of summary) {
    const icon = a.status === "PASS" ? "✓" : a.status === "WARN" ? "⚠" : "✗";
    console.log(`  ${icon} ${a.slug} [${a.status}]`);
    for (const e of a.errors) console.log(`      ERROR: ${e}`);
    for (const w of a.warnings) console.log(`      WARN:  ${w}`);
  }
}

function phasePublish({ confirm }) {
  log("Publishing: vault → content/posts");
  const ps1 = path.join(ROOT, "scripts", "sync-obsidian.ps1");
  const args = [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    `"${ps1}"`,
  ];
  if (confirm) args.push("-Force");
  run("powershell", args);
}

async function main() {
  const args = process.argv.slice(2);
  const doPublish = args.includes("--publish");
  const confirm = args.includes("--confirm");
  const slugIdx = args.indexOf("--slug");
  const slugFilter = slugIdx !== -1 ? args[slugIdx + 1] : null;

  const slugs = listReadySlugs(slugFilter);
  if (slugs.length === 0) {
    console.log("No articles in Blog/02 Ready to publish.");
    process.exit(0);
  }

  console.log(`Publish Ready — ${slugs.length} article(s) in 02 Ready`);
  if (!loadEnvKey("PEXELS_API_KEY")) {
    console.log("  NOTE: PEXELS_API_KEY not in .env — Pexels stock downloads may skip.");
  }
  if (!loadEnvKey("UNSPLASH_ACCESS_KEY")) {
    console.log("  NOTE: UNSPLASH_ACCESS_KEY not in .env — Unsplash downloads may skip.");
  }

  await phaseFix(slugs);
  const { summary, hasFail, hasWarn } = phaseCheck();
  printSummary(summary);

  if (hasFail) {
    console.log("\n✗ BLOCKED — fix errors above, then say “publish ready” again.");
    process.exit(1);
  }

  if (hasWarn) {
    console.log("\n⚠ WARNINGS — review above before publishing.");
    if (!doPublish) {
      console.log('   Say: “publish ready now” or “publish with confirm” to continue.');
      process.exit(2);
    }
    if (!confirm) {
      console.log("\n✗ Publish blocked — warnings present. Say “publish with confirm” to proceed.");
      process.exit(2);
    }
  }

  if (!doPublish) {
    console.log('\n✓ All clear — say “publish ready now” to sync to content/posts/.');
    process.exit(0);
  }

  phasePublish({ confirm: hasWarn && confirm });
  console.log("\n✓ Published to content/posts/.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
