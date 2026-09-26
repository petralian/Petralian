#!/usr/bin/env node
/**
 * Merge data/sitemonitor/adland-sources.json into SiteMonitor volume config + topic files.
 * Run inside the sitemonitor container (see scripts/patch-sitemonitor-adland-sources.sh).
 */
import fs from "node:fs";
import path from "node:path";

const patchPath = process.argv[2] || "/tmp/adland-sources.json";
if (!fs.existsSync(patchPath)) {
  console.error("patch file missing:", patchPath);
  process.exit(1);
}
const patch = JSON.parse(fs.readFileSync(patchPath, "utf8"));

const configCandidates = ["data/config.json", "/app/data/config.json", "config.json"];
const configPath = configCandidates.find((p) => fs.existsSync(p));
if (!configPath) {
  console.error("config.json not found in", configCandidates.join(", "));
  process.exit(1);
}

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
  }).toLowerCase();
  return (patch.profileMatchers || []).some((m) => hay.includes(String(m).toLowerCase()));
}

function patchProfile(p) {
  if (!matchesTag(p)) return false;
  const label = p.id || p.slug || p.name || p.key || "tag-profile";
  console.log("[adland-patch] profile", label);

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

  if (Array.isArray(p.topics) && patch.topicKeys?.length) {
    for (const t of patch.topicKeys) {
      if (!p.topics.includes(t)) p.topics.push(t);
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
console.log("[adland-patch] config", configPath, "keys:", Object.keys(cfg).join(","));

let profileCount = 0;
for (const bucket of [cfg.profiles, cfg.clients, cfg.sites, cfg.monitors, cfg.tenants, cfg.digestProfiles]) {
  if (!bucket) continue;
  const list = Array.isArray(bucket) ? bucket : Object.values(bucket);
  for (const p of list) {
    if (patchProfile(p)) profileCount += 1;
  }
}

// Root-level TAG client (some builds store tag at top level)
if (cfg.tag && typeof cfg.tag === "object" && patchProfile(cfg.tag)) profileCount += 1;

const topicDirs = [
  "data/topics/petralian",
  "data/topics",
  "/app/data/topics/petralian",
  "/app/data/topics",
];

for (const dir of topicDirs) {
  if (!fs.existsSync(dir)) continue;
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
    topic.adland = true;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(topic, null, 2));
    console.log("[adland-patch] topic file", file);
  }
}

fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
console.log("[adland-patch] profiles patched:", profileCount);
if (profileCount === 0) {
  console.warn("[adland-patch] WARN: no TAG profile matched — dump profile ids for debugging:");
  for (const bucket of [cfg.profiles, cfg.clients, cfg.sites]) {
    if (!bucket) continue;
    const list = Array.isArray(bucket) ? bucket : Object.values(bucket);
    for (const p of list) {
      console.warn("  -", p.id || p.slug || p.name || p.key || "(unnamed)");
    }
  }
}
