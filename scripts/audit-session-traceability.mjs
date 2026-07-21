#!/usr/bin/env node
/**
 * Lightweight enterprise traceability checks (vault + repo).
 * Usage: node scripts/audit-session-traceability.mjs [--json] [--repo PATH]
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { loadHarnessVerify } from "./lib/load-harness-yaml.mjs";

const asJson = process.argv.includes("--json");
const repoArg = process.argv.indexOf("--repo");
const repoRoot =
  repoArg >= 0 ? path.resolve(process.argv[repoArg + 1]) : path.resolve(import.meta.dirname, "..");

const doc = loadHarnessVerify(repoRoot);
const issues = [];
const warnings = [];

function check(cond, file, reason, level = "fail") {
  if (cond) return;
  (level === "warn" ? warnings : issues).push({ file, reason });
}

const vaultRel = doc.traceability?.vault_path ?? doc.vault_path;
const decisionRegister =
  doc.traceability?.decision_register ?? "Operations/Decision Register.md";

check(fs.existsSync(path.join(repoRoot, "data/harness-verify.yaml")), "data/harness-verify.yaml", "missing");
check(
  fs.existsSync(path.join(repoRoot, "scripts/audit-parametric-drift.mjs")),
  "scripts/audit-parametric-drift.mjs",
  "missing — run Brain sync-cursor-stack or copy template"
);
check(
  fs.existsSync(path.join(repoRoot, "memories/repo/facts-discipline.md")),
  "memories/repo/facts-discipline.md",
  "missing"
);

if (vaultRel) {
  const vaultRoot = path.isAbsolute(vaultRel) ? vaultRel : path.join(repoRoot, vaultRel);
  const regPath = path.join(vaultRoot, decisionRegister.replace(/\//g, path.sep));
  check(fs.existsSync(regPath), decisionRegister, "missing in project vault", "warn");
}

try {
  const dirty = execSync("git status --porcelain", { cwd: repoRoot, encoding: "utf8" }).trim();
  if (dirty) {
    warnings.push({
      file: "git",
      reason: "uncommitted changes — session note + ADR row before close",
    });
  }
} catch {
  warnings.push({ file: "git", reason: "not a git repo" });
}

const payload = { ok: issues.length === 0, issues, warnings };

if (asJson) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log("\n── Session traceability audit ─────────────────────────────────");
  for (const i of issues) console.log(`  FAIL ${i.file}: ${i.reason}`);
  for (const w of warnings) console.log(`  WARN ${w.file}: ${w.reason}`);
  if (issues.length === 0 && warnings.length === 0) {
    console.log("  PASS");
  }
  console.log("────────────────────────────────────────────────────────────────\n");
}

process.exit(issues.length === 0 ? 0 : 1);
