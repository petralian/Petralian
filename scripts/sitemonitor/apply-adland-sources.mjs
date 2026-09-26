#!/usr/bin/env node
/** @deprecated Use apply-digest-sources.mjs — kept for one-release VPS compatibility */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const patchPath = process.argv[2] || "/tmp/adland-sources.json";
const r = spawnSync(process.execPath, [path.join(here, "apply-digest-sources.mjs"), patchPath], {
  stdio: "inherit",
});
process.exit(r.status ?? 1);
