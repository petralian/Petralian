#!/usr/bin/env node
/**
 * Fail when numeric literals in docs/scripts disagree with data/harness-verify.yaml.
 * Usage: node scripts/audit-parametric-drift.mjs [--json] [--repo PATH]
 */
import fs from "node:fs";
import path from "node:path";
import { getDriftScanPaths, getSeoLimits, loadHarnessVerify } from "./lib/load-harness-yaml.mjs";

const asJson = process.argv.includes("--json");
const repoArg = process.argv.indexOf("--repo");
const repoRoot =
  repoArg >= 0 ? path.resolve(process.argv[repoArg + 1]) : path.resolve(import.meta.dirname, "..");

const limits = getSeoLimits(repoRoot);
const doc = loadHarnessVerify(repoRoot);
const scanRoots = getDriftScanPaths(repoRoot);

const EXT = new Set([".md", ".mdc", ".mjs", ".js", ".ps1", ".py", ".ts", ".tsx"]);

function collectFiles(rel) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) return [];
  const st = fs.statSync(abs);
  if (st.isFile()) return [abs];
  const out = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    out.push(...collectFiles(path.join(rel, ent.name)));
  }
  return out.filter((f) => EXT.has(path.extname(f)));
}

/** Patterns that contradict current YAML SEO limits */
function buildForbiddenPatterns() {
  const { title, desc } = limits;
  const items = [];

  const add = (re, reason) => items.push({ re, reason });

  // Wrong hard caps (legacy drift)
  if (title.max !== 65) add(/>\s*65\b|Length\s*-\s*gt\s*65|title\.length\s*>\s*65/gi, `seo_title max is ${title.max} in harness-verify.yaml (found 65)`);
  if (desc.max !== 165) add(/>\s*165\b|Length\s*-\s*gt\s*165|desc\.length\s*>\s*165/gi, `seo_description max is ${desc.max} in harness-verify.yaml (found 165)`);

  // Misleading prose ranges when min differs from target
  add(/\b55-60\s*char/gi, `Use harness-verify.yaml (title min ${title.min}, max ${title.max}) — not hardcoded 55-60`);
  add(/\b150-160\s*char/gi, `Use harness-verify.yaml (desc min ${desc.min}, max ${desc.max}) — not hardcoded 150-160`);

  // Hardcoded audit strings in JS (after seo-utils refactor these should not appear elsewhere)
  add(/seo_title short \(\$\{[^}]+\}\/55-60\)/g, "Import auditSeoFields from seo-utils (YAML-backed)");
  add(/seo_description short \(\$\{[^}]+\}\/150-160\)/g, "Import auditSeoFields from seo-utils (YAML-backed)");

  if (title.min !== 50) add(/title\.length\s*<\s*50|Length\s*-\s*lt\s*50/gi, `seo_title min is ${title.min} in YAML`);
  if (desc.min !== 140) add(/desc\.length\s*<\s*140|Length\s*-\s*lt\s*140/gi, `seo_description min is ${desc.min} in YAML`);

  return items;
}

const forbidden = buildForbiddenPatterns();
const selfName = path.basename(import.meta.filename);
const issues = [];

for (const rel of scanRoots) {
  for (const fp of collectFiles(rel)) {
    if (fp.includes(`${path.sep}lib${path.sep}load-harness-yaml.mjs`)) continue;
    if (fp.endsWith(selfName)) continue;
    const text = fs.readFileSync(fp, "utf8");
    const relPath = path.relative(repoRoot, fp).replace(/\\/g, "/");
    for (const { re, reason } of forbidden) {
      re.lastIndex = 0;
      if (re.test(text)) {
        issues.push({ file: relPath, reason });
      }
    }
  }
}

// harness-verify.yaml must list parametric_drift check
if (!doc.repo_checks?.parametric_drift) {
  issues.push({
    file: "data/harness-verify.yaml",
    reason: "Missing repo_checks.parametric_drift",
  });
}

if (asJson) {
  console.log(JSON.stringify({ ok: issues.length === 0, issues, limits }, null, 2));
} else {
  console.log("\n── Parametric drift audit ─────────────────────────────────────");
  if (issues.length === 0) {
    console.log("  PASS — no drift vs data/harness-verify.yaml");
  } else {
    for (const i of issues) {
      console.log(`  FAIL ${i.file}: ${i.reason}`);
    }
  }
  console.log("────────────────────────────────────────────────────────────────\n");
}

process.exit(issues.length === 0 ? 0 : 1);
