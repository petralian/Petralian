import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { downloadUrlAsRaster, rasterNameFor } from "./image-pipeline.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
export const CACHE_PATH = path.join(ROOT, "data", "unsplash-credit-cache.yaml");

const UNSPLASH_URL_RE = /unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/i;

/** Unsplash photo ids are typically 11 characters at the end of the slug segment. */
export function extractUnsplashPhotoId(input) {
  if (!input) return null;
  const raw = String(input).trim();
  const fromUrl = raw.match(UNSPLASH_URL_RE);
  if (!fromUrl) return null;
  const segment = fromUrl[1];
  const tail = segment.match(/([a-zA-Z0-9_-]{11})$/);
  return tail ? tail[1] : segment;
}

export function loadUnsplashCache() {
  if (!fs.existsSync(CACHE_PATH)) return { photos: {} };
  const data = yaml.load(fs.readFileSync(CACHE_PATH, "utf8")) || {};
  return data.photos ? data : { photos: data };
}

export function saveUnsplashCache(cache) {
  const header = fs.existsSync(CACHE_PATH)
    ? fs.readFileSync(CACHE_PATH, "utf8").split("photos:")[0].trimEnd()
    : `# Unsplash photo credits — resolved via API (UNSPLASH_ACCESS_KEY in .env).`;
  const body = yaml.dump({ photos: cache.photos || {} }, { lineWidth: 120, noRefs: true });
  fs.writeFileSync(CACHE_PATH, `${header}\n\n${body}`, "utf8");
}

function withUtm(url, source = "petralian") {
  if (!url) return url;
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "referral");
  return u.toString();
}

export function formatUnsplashCaption(entry, { year = new Date().getFullYear() } = {}) {
  const name = entry.photographer;
  const photoUrl = withUtm(entry.photo_url);
  const profileUrl = withUtm(entry.photographer_url);
  return `*Photo: [${name}](${profileUrl}) on [Unsplash](${photoUrl}) — Petralian (${year})*`;
}

export async function fetchUnsplashPhotoRaw(photoId, accessKey) {
  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY is not set — add it to .env");
  }
  const res = await fetch(`https://api.unsplash.com/photos/${photoId}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash API ${res.status} for ${photoId}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const entry = {
    id: data.id,
    photographer: data.user?.name || "Unknown",
    photographer_url: data.user?.links?.html || `https://unsplash.com/@${data.user?.username || ""}`,
    photo_url: data.links?.html || `https://unsplash.com/photos/${data.id}`,
    alt: data.alt_description || data.description || "",
    resolved_at: new Date().toISOString().slice(0, 10),
    source: "api",
  };
  const downloadUrl = data.urls?.regular || data.urls?.full || data.urls?.small;
  return { entry, downloadUrl, data };
}

export async function downloadUnsplashToFile(photoId, destPath, accessKey) {
  const { entry, downloadUrl } = await fetchUnsplashPhotoRaw(photoId, accessKey);
  if (!downloadUrl) throw new Error(`No download URL for Unsplash photo ${photoId}`);
  const avifDest = rasterNameFor(path.basename(destPath));
  const fullDest = path.join(path.dirname(destPath), avifDest);
  await downloadUrlAsRaster(downloadUrl, fullDest);
  if (fullDest !== destPath && fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }
  const cache = loadUnsplashCache();
  cache.photos[entry.id] = entry;
  saveUnsplashCache(cache);
  return { entry, destPath: fullDest };
}

export function unsplashUrlsInText(text) {
  return [...text.matchAll(/https:\/\/unsplash\.com\/photos\/[^\s\])"'<>]+/gi)].map((m) => m[0]);
}
