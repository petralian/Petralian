#!/usr/bin/env node
/**
 * CLI wrapper for the shared facts gate.
 * Usage: node scripts/run-facts-gate.mjs [--repo PATH]
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runFactsGate } from "./lib/run-facts-gate.mjs";

const repoArg = process.argv.indexOf("--repo");
const repoRoot =
  repoArg >= 0
    ? path.resolve(process.argv[repoArg + 1])
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

runFactsGate(repoRoot);
