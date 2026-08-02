#!/usr/bin/env node
/**
 * Mandatory gates after vault → content/posts sync. Called by sync-obsidian.ps1 and publish-from-vault.mjs.
 *
 *   node scripts/run-post-publish-gates.mjs slug [slug ...]
 *   node scripts/run-post-publish-gates.mjs --full
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(script, args) {
  const label = `node scripts/${script} ${args.join(" ")}`.trim();
  console.log(`\n> ${label}`);
  const r = spawnSync("node", [path.join(ROOT, "scripts", script), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status ?? 1;
}

const args = process.argv.slice(2);
const full = args.includes("--full");
const slugs = args.filter((a) => a !== "--full");

console.log("\n══ Post-publish gates ════════════════════════════════════════════");

let code = 0;

if (slugs.length > 0) {
  const syncArgs = slugs.flatMap((s) => ["--slug", s]);
  code = run("audit-sync-integrity.mjs", syncArgs) || code;
  code = run("audit-hero-diversity.mjs", syncArgs) || code;
  code = run("audit-live-posts.mjs", syncArgs) || code;
} else if (full) {
  code = run("audit-sync-integrity.mjs", ["--all-synced"]) || code;
  code = run("audit-live-posts.mjs", []) || code;
} else {
  code = run("audit-live-posts.mjs", []) || code;
}

if (code !== 0) {
  console.error("\n✗ Post-publish gates FAILED — fix before commit/push.");
  process.exit(1);
}

console.log("\n✓ Post-publish gates passed.");
process.exit(0);
