#!/usr/bin/env node
/**
 * Shared facts / parametric gate — drift + session traceability.
 * Used by publish scripts, sync-obsidian.ps1 (via CLI), and npm run audit:facts.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * @param {string} repoRoot
 * @param {{ label?: string }} [opts]
 */
export function runFactsGate(repoRoot, opts = {}) {
  const label = opts.label ?? "Facts / parametric audit";
  const scriptsDir = path.join(repoRoot, "scripts");
  const steps = [
    { file: "audit-parametric-drift.mjs", required: true },
    { file: "audit-session-traceability.mjs", required: true },
  ];

  console.log(`\n── ${label} ────────────────────────────────────`);

  for (const { file, required } of steps) {
    const scriptPath = path.join(scriptsDir, file);
    if (!existsSync(scriptPath)) {
      const msg = `  WARN: ${file} not found — skipping`;
      if (required) {
        console.error(msg);
        process.exit(1);
      }
      console.warn(msg);
      continue;
    }
    execSync(`node ${JSON.stringify(scriptPath)}`, {
      cwd: repoRoot,
      stdio: "inherit",
    });
  }

  console.log("────────────────────────────────────────────────────────────────\n");
}
