import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { downloadUrlAsRaster, rasterNameFor } from "./image-pipeline.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
export const CACHE_PATH = path.join(ROOT, "data", "pexels-credit-cache.yaml");
const VAULT_BLOG = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Blog"
);

const PEXELS_PHOTO_URL_RE =
  /pexels\.com\/photo\/(?:[a-z0-9-]+-)?(\d+)/i;
const PEXELS_FILENAME_RE = /^pexels-.+-(\d+)\.(jpe?g|png|webp)$/i;

export function extractPexelsPhotoId(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (/^\d+$/.test(raw)) return raw;
  const fromUrl = raw.match(PEXELS_PHOTO_URL_RE);
  if (fromUrl) return fromUrl[1];
  const fromName = raw.match(PEXELS_FILENAME_RE);
  if (fromName) return fromName[1];
  return null;
}

export function loadPexelsCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    return { photos: {} };
  }
  const data = yaml.load(fs.readFileSync(CACHE_PATH, "utf8")) || {};
  if (!data.photos) {
    return { photos: data };
  }
  return data;
}

export function savePexelsCache(cache) {
  const body = {
    photos: cache.photos || {},
  };
  const header = fs
    .readFileSync(CACHE_PATH, "utf8")
    .split("photos:")[0]
    .trimEnd();
  const yamlBody = yaml.dump(body, { lineWidth: 120, noRefs: true }).trimEnd();
  const content = `${header}\n\n${yamlBody}\n`;
  fs.writeFileSync(CACHE_PATH, content, "utf8");
}

export function formatPexelsCaption(entry, { year = new Date().getFullYear() } = {}) {
  const name = entry.photographer;
  const url =
    entry.photo_url ||
    (entry.id ? `https://www.pexels.com/photo/${entry.id}/` : null);
  if (!name || !url) {
    throw new Error("Cache entry missing photographer or photo_url");
  }
  return `*Photo: [${name}](${url}) on Pexels — Petralian (${year})*`;
}

export async function fetchPexelsPhoto(photoId, apiKey) {
  const { entry } = await fetchPexelsPhotoRaw(photoId, apiKey);
  return entry;
}

export async function fetchPexelsPhotoRaw(photoId, apiKey) {
  if (!apiKey) {
    throw new Error(
      "PEXELS_API_KEY is not set. Get a free key at https://www.pexels.com/api/"
    );
  }
  const res = await fetch(`https://api.pexels.com/v1/photos/${photoId}`, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pexels API ${res.status} for photo ${photoId}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const entry = {
    id: String(data.id),
    photographer: data.photographer,
    photographer_url: data.photographer_url,
    photo_url: data.url,
    alt: data.alt || "",
    resolved_at: new Date().toISOString().slice(0, 10),
    source: "api",
  };
  const downloadUrl =
    data.src?.large2x || data.src?.large || data.src?.original || data.src?.medium;
  return { entry, downloadUrl, data };
}

export async function downloadPexelsToFile(photoId, destPath, apiKey) {
  const { entry, downloadUrl } = await fetchPexelsPhotoRaw(photoId, apiKey);
  if (!downloadUrl) {
    throw new Error(`Pexels API returned no download URL for photo ${photoId}`);
  }
  const avifDest = rasterNameFor(path.basename(destPath));
  const fullDest = path.join(path.dirname(destPath), avifDest);
  await downloadUrlAsRaster(downloadUrl, fullDest);
  if (fullDest !== destPath && fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }

  const cache = loadPexelsCache();
  cache.photos[entry.id] = entry;
  savePexelsCache(cache);

  return { entry, destPath: fullDest };
}

export async function resolvePexelsPhoto(photoId, { apiKey, refresh = false } = {}) {
  const id = extractPexelsPhotoId(photoId);
  if (!id) {
    throw new Error(`Could not parse Pexels photo id from: ${photoId}`);
  }

  const cache = loadPexelsCache();
  if (!refresh && cache.photos[id]) {
    return { id, entry: cache.photos[id], fromCache: true };
  }

  const entry = await fetchPexelsPhoto(id, apiKey);
  cache.photos[id] = entry;
  savePexelsCache(cache);
  return { id, entry, fromCache: false };
}

export function listVaultArticles() {
  const stages = [
    path.join(VAULT_BLOG, "01 Drafts"),
    path.join(VAULT_BLOG, "02 Ready to publish"),
    path.join(VAULT_BLOG, "03 Published"),
  ];
  const files = [];
  for (const stage of stages) {
    if (!fs.existsSync(stage)) continue;
    for (const name of fs.readdirSync(stage)) {
      if (name.endsWith(".md")) {
        files.push(path.join(stage, name));
      }
    }
  }
  return files;
}

const WIKI_IMG_RE = /!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/;
const ATTR_RE = /^\*(?:Photo|Screenshot|Diagram|Source):.*\*$/i;

export function applyCaptionForFilename(markdown, filename, caption) {
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let i = 0;
  let changed = false;

  while (i < lines.length) {
    const line = lines[i];
    const m = line.trim().match(WIKI_IMG_RE);
    if (m && path.basename(m[1].trim()) === filename) {
      out.push(line);
      i += 1;
      if (i < lines.length && ATTR_RE.test(lines[i].trim())) {
        out.push(caption);
        changed = true;
        i += 1;
      } else {
        out.push(caption);
        changed = true;
      }
      continue;
    }
    out.push(line);
    i += 1;
  }

  return { markdown: out.join("\n"), changed };
}

export function updateBodyImagesSlot(data, slotId, { source, stock_id, stock_page_url }) {
  const slots = data.body_images;
  if (!Array.isArray(slots)) return false;
  const slot = slots.find((s) => String(s.id) === String(slotId));
  if (!slot) return false;
  if (source) slot.source = source;
  if (stock_id) slot.stock_id = String(stock_id);
  if (stock_page_url) slot.stock_page_url = stock_page_url;
  return true;
}
