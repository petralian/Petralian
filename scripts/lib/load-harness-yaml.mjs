/**
 * Load parametric SSOT from data/harness-verify.yaml.
 * Usage: import { loadHarnessVerify, getSeoLimits } from "./load-harness-yaml.mjs";
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const DEFAULT_REL = "data/harness-verify.yaml";

let _cache = null;

export function resolveHarnessPath(repoRoot = process.cwd()) {
  return path.join(repoRoot, DEFAULT_REL);
}

export function loadHarnessVerify(repoRoot = process.cwd()) {
  const fp = resolveHarnessPath(repoRoot);
  if (!fs.existsSync(fp)) {
    throw new Error(`Missing parametric SSOT: ${fp}`);
  }
  const doc = yaml.load(fs.readFileSync(fp, "utf8"));
  if (!doc || typeof doc !== "object") {
    throw new Error(`Invalid harness YAML: ${fp}`);
  }
  return doc;
}

export function loadHarnessVerifyCached(repoRoot = process.cwd()) {
  const fp = resolveHarnessPath(repoRoot);
  if (!_cache || _cache._path !== fp) {
    _cache = { _path: fp, doc: loadHarnessVerify(repoRoot) };
  }
  return _cache.doc;
}

export function getSeoLimits(repoRoot = process.cwd()) {
  const doc = loadHarnessVerifyCached(repoRoot);
  const title = doc.seo_limits?.seo_title_chars ?? { min: 50, target: 55, max: 60 };
  const desc = doc.seo_limits?.seo_description_chars ?? {
    min: 140,
    target: 155,
    max: 160,
  };
  return {
    title: { min: title.min, target: title.target, max: title.max },
    desc: { min: desc.min, target: desc.target, max: desc.max },
    label: {
      title: `${title.target ?? title.min}-${title.max}`,
      desc: `${desc.target ?? desc.min}-${desc.max}`,
    },
  };
}

export function getRepoChecks(repoRoot = process.cwd()) {
  const doc = loadHarnessVerifyCached(repoRoot);
  return doc.repo_checks ?? {};
}

export function getDriftScanPaths(repoRoot = process.cwd()) {
  const doc = loadHarnessVerifyCached(repoRoot);
  const defaults = [
    "AGENTS.md",
    ".cursor/rules",
    "scripts",
    "memories/repo",
    "data/README.md",
  ];
  return doc.drift_scan?.paths ?? defaults;
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const cmd = process.argv[2] ?? "seo";
  const root = process.argv[3] ?? process.cwd();
  if (cmd === "seo") {
    console.log(JSON.stringify(getSeoLimits(root)));
  } else if (cmd === "checks") {
    console.log(JSON.stringify(getRepoChecks(root)));
  } else {
    console.error("Usage: node load-harness-yaml.mjs [seo|checks] [repoRoot]");
    process.exit(1);
  }
}
