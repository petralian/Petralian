#!/usr/bin/env node
/**
 * Merge a data/sitemonitor/*-sources.json patch into SiteMonitor config + topic files.
 * Usage: node apply-digest-sources.mjs <patch.json> [dataRoot]
 * dataRoot: host mount or /app/data (defaults: data, /app/data)
 */
import fs from "node:fs";
import path from "node:path";

const patchPath = process.argv[2];
const dataRootArg = process.argv[3] || process.env.SITEMONITOR_DATA_ROOT || "";

if (!patchPath || !fs.existsSync(patchPath)) {
  console.error("usage: node apply-digest-sources.mjs <patch.json> [dataRoot]");
  process.exit(1);
}
const patch = JSON.parse(fs.readFileSync(patchPath, "utf8"));
const logLabel = patch.logLabel || "digest-patch";
const log = (msg, ...rest) => console.log(`[${logLabel}]`, msg, ...rest);
const warn = (msg, ...rest) => console.warn(`[${logLabel}]`, msg, ...rest);

function resolveConfigPath() {
  const names = ["config.json", "digest-tag.json", "digest.json", "settings.json", "digest-config.json"];
  const roots = [];
  if (dataRootArg) roots.push(dataRootArg);
  roots.push("data", "/app/data", ".");
  const candidates = [];
  for (const root of roots) {
    for (const name of names) {
      candidates.push(path.join(root, name));
    }
  }
  candidates.push("data/config.json", "/app/data/config.json", "config.json");
  const seen = new Set();
  return candidates.find((p) => {
    if (seen.has(p)) return false;
    seen.add(p);
    return fs.existsSync(p);
  });
}

const configPath = resolveConfigPath();
if (!configPath) {
  console.error(`[${logLabel}] no config found (tried digest-tag.json, config.json under data roots)`);
  process.exit(1);
}

const configBasename = path.basename(configPath);
const isDigestTagFile = configBasename === "digest-tag.json";

function mergeSources(into, sources) {
  const list = Array.isArray(into) ? into : [];
  const seen = new Set(
    list.map((s) => (typeof s === "string" ? s : s.id || s.url || JSON.stringify(s))),
  );
  for (const s of sources || []) {
    const key = s.id || s.url;
    if (!key || seen.has(key)) continue;
    list.push(s);
    seen.add(key);
  }
  return list;
}

function matchesTag(profile) {
  if (!profile || typeof profile !== "object") return false;
  const hay = JSON.stringify({
    id: profile.id,
    slug: profile.slug,
    name: profile.name,
    label: profile.label,
    domain: profile.domain,
    clientId: profile.clientId,
    key: profile.key,
    profile: profile.profile,
    client: profile.client,
  }).toLowerCase();
  return (patch.profileMatchers || []).some((m) => hay.includes(String(m).toLowerCase()));
}

function patchProfile(p, { force = false } = {}) {
  if (!force && !matchesTag(p)) return false;
  const label = p.id || p.slug || p.name || p.key || "tag-profile";
  log("profile", label);

  if (patch.interestAppend && typeof p.interest === "string") {
    const snippet = patch.interestAppend.slice(0, 48);
    if (!p.interest.includes(snippet)) {
      p.interest = `${p.interest.trim()} ${patch.interestAppend}`.trim();
    }
  } else if (patch.interestAppend && !p.interest) {
    p.interest = patch.interestAppend;
  }

  const sourceKeys = ["sources", "feeds", "rssFeeds", "outlets", "publishers", "rss"];
  let touched = false;
  for (const key of sourceKeys) {
    if (key in p || (patch.rssSources?.length && !touched)) {
      p[key] = mergeSources(p[key], patch.rssSources);
      touched = true;
    }
  }

  if (patch.topicKeys?.length) {
    if (Array.isArray(p.topics)) {
      for (const t of patch.topicKeys) {
        if (!p.topics.includes(t)) p.topics.push(t);
      }
    } else if (!p.topics) {
      p.topics = [...patch.topicKeys];
    }
  }

  if (Array.isArray(p.githubTopics) && patch.topicKeys?.length) {
    for (const t of patch.topicKeys) {
      if (!p.githubTopics.includes(t)) p.githubTopics.push(t);
    }
  }

  if (patch.searchQueryBoosts?.length) {
    p.queryBoosts = [...new Set([...(p.queryBoosts || []), ...patch.searchQueryBoosts])];
  }

  return true;
}

const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
log("config", configPath, "keys:", Object.keys(cfg).join(","));

let profileCount = 0;
for (const bucket of [cfg.profiles, cfg.clients, cfg.sites, cfg.monitors, cfg.tenants, cfg.digestProfiles]) {
  if (!bucket) continue;
  const list = Array.isArray(bucket) ? bucket : Object.values(bucket);
  for (const p of list) {
    if (patchProfile(p)) profileCount += 1;
  }
}

if (cfg.tag && typeof cfg.tag === "object" && patchProfile(cfg.tag)) profileCount += 1;

if (isDigestTagFile && patchProfile(cfg, { force: true })) profileCount += 1;
else if (profileCount === 0 && patchProfile(cfg)) profileCount += 1;

const dataRootForTopics = dataRootArg || path.dirname(configPath);
const topicDirs = [
  path.join(dataRootForTopics, "topics/petralian"),
  path.join(dataRootForTopics, "topics"),
  "data/topics/petralian",
  "data/topics",
  "/app/data/topics/petralian",
  "/app/data/topics",
];

const topicFlag = patch.topicFlag;
const topicDirUsed = new Set();

for (const dir of topicDirs) {
  if (topicDirUsed.has(dir)) continue;
  for (const topicKey of patch.topicKeys || []) {
    const short = topicKey.includes("/") ? topicKey.split("/").pop() : topicKey;
    const file = path.join(dir, `${short}.json`);
    let topic = {};
    if (fs.existsSync(file)) {
      try {
        topic = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch {
        topic = {};
      }
    }
    topic.rssFeeds = mergeSources(topic.rssFeeds || topic.sources || topic.feeds, patch.rssSources);
    topic.sources = mergeSources(topic.sources || topic.feeds, patch.rssSources);
    topic.queryBoosts = [...new Set([...(topic.queryBoosts || []), ...(patch.searchQueryBoosts || [])])];
    if (topicFlag) topic[topicFlag] = true;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(topic, null, 2));
    log("topic file", file);
    topicDirUsed.add(dir);
  }
}

fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
log("profiles patched:", profileCount);
if (profileCount === 0) {
  warn("WARN: no TAG profile matched — dump profile ids for debugging:");
  for (const bucket of [cfg.profiles, cfg.clients, cfg.sites]) {
    if (!bucket) continue;
    const list = Array.isArray(bucket) ? bucket : Object.values(bucket);
    for (const p of list) {
      warn("  -", p.id || p.slug || p.name || p.key || "(unnamed)");
    }
  }
}
