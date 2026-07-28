import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const YAML_PATH = path.join(ROOT, "data", "post-publish.yaml");

let cached = null;

function parseSimpleYaml(text) {
  const out = {
    required_frontmatter: [],
    format_allowed: [],
    vault_only_frontmatter: [],
    body: { min_words: 300, min_words_blocking: 50 },
    hero_diversity: {
      window_posts: 12,
      max_lane_c_primary: 4,
      lane_c_markers: [],
      banned_in_image_prompt: [],
      prefer_primary_lane: "cinematic",
    },
  };

  let section = null;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.endsWith(":") && !trimmed.includes(" ")) {
      section = trimmed.slice(0, -1);
      continue;
    }
    const listMatch = trimmed.match(/^- (.+)$/);
    if (listMatch) {
      const val = listMatch[1].replace(/^["']|["']$/g, "");
      if (section === "required_frontmatter") out.required_frontmatter.push(val);
      if (section === "format_allowed") out.format_allowed.push(val);
      if (section === "vault_only_frontmatter") out.vault_only_frontmatter.push(val);
      if (section === "lane_c_markers") out.hero_diversity.lane_c_markers.push(val);
      if (section === "banned_in_image_prompt")
        out.hero_diversity.banned_in_image_prompt.push(val);
      continue;
    }
    const kv = trimmed.match(/^([\w_]+):\s*(.+)$/);
    if (!kv || !section) continue;
    const num = Number(kv[2]);
    if (section === "body") out.body[kv[1]] = Number.isFinite(num) ? num : kv[2];
    if (section === "hero_diversity")
      out.hero_diversity[kv[1]] = Number.isFinite(num) ? num : kv[2];
  }
  return out;
}

export function getPostPublishConfig() {
  if (cached) return cached;
  if (!fs.existsSync(YAML_PATH)) {
    cached = parseSimpleYaml("");
    return cached;
  }
  cached = parseSimpleYaml(fs.readFileSync(YAML_PATH, "utf8"));
  return cached;
}
