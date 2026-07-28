#!/usr/bin/env node
/**
 * @deprecated Use scripts/raster-to-avif.mjs (data/image-pipeline.yaml).
 * Kept as a shim for old docs/scripts.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "raster-to-avif.mjs");
const args = process.argv.slice(2);
const r = spawnSync(process.execPath, [script, ...args], { stdio: "inherit" });
process.exit(r.status ?? 1);
