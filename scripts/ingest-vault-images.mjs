#!/usr/bin/env node
/**
 * Ingest messy Obsidian image pastes into canonical body_images slots.
 *
 * Handles:
 *   - Pasted screenshots (Pasted image …, double .png.png extensions)
 *   - Pexels page URLs pasted in the note (Source: … or bare URL)
 *   - pexels-{slug}-{id}.jpg wiki embeds → download + rename to slot filename
 *
 * Usage:
 *   npm run ingest:images -- --slug session-bridge-as-standup-file-agents-read-first
 *   npm run ingest:images -- --slug my-slug --dry-run
 *
 * Env: PEXELS_API_KEY in .env (for stock downloads)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadEnvKey } from "./lib/load-env.mjs";
import {
  applyCaptionForFilename,
  downloadPexelsToFile,
  extractPexelsPhotoId,
  formatPexelsCaption,
  loadPexelsCache,
  updateBodyImagesSlot,
} from "./lib/pexels-credit.mjs";
import {
  convertRasterFile,
  isRasterInputExt,
  rasterNameFor,
} from "./lib/image-pipeline.mjs";
import {
  downloadUnsplashToFile,
  extractUnsplashPhotoId,
  formatUnsplashCaption,
  loadUnsplashCache,
  unsplashUrlsInText,
} from "./lib/unsplash-credit.mjs";

const VAULT_BLOG = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Blog"
);
const LEGACY_ATTACH = path.join(VAULT_BLOG, "00 Attachments");
const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const WIKI_IMG_RE = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/;
const ATTR_RE = /^\*(?:Photo|Screenshot|Diagram|Source):.*\*$/i;
const PEXELS_URL_RE = /https:\/\/www\.pexels\.com\/photo\/[^\s\])"'<>]+/gi;
const PEXELS_WIKI_RE = /^pexels-.+\.(jpe?g|png|webp)$/i;
const PASTED_RE = /^pasted image /i;

function findArticlePath(slug) {
  for (const stage of ["03 Published", "02 Ready to publish", "01 Drafts"]) {
    const p = path.join(VAULT_BLOG, stage, `${slug}.md`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function searchRoots(articlePath) {
  const folder = path.dirname(articlePath);
  const roots = [path.join(folder, "Attachments"), folder];
  const publishedAttach = path.join(VAULT_BLOG, "03 Published", "Attachments");
  if (publishedAttach !== roots[0]) {
    roots.push(publishedAttach);
  }
  roots.push(LEGACY_ATTACH);
  return roots;
}

function listVaultImages(articlePath) {
  const map = new Map();
  for (const root of searchRoots(articlePath)) {
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root)) {
      if (!IMAGE_EXT.test(name)) continue;
      const full = path.join(root, name);
      if (fs.statSync(full).isFile() && fs.statSync(full).size > 0) {
        map.set(name, full);
      }
    }
  }
  return map;
}

function slotPhotoId(slot) {
  return (
    extractPexelsPhotoId(slot.stock_id) ||
    extractPexelsPhotoId(slot.stock_page_url) ||
    extractPexelsPhotoId(slot.pexels_id)
  );
}

function pexelsUrlsInText(text) {
  return [...text.matchAll(PEXELS_URL_RE)].map((m) => m[0]);
}

function normalizeDoubleExt(name) {
  return name.replace(/\.(png|jpe?g)\.(png|jpe?g)$/i, ".$1");
}

function slugShort(slug, maxLen = 40) {
  return slug.length > maxLen ? slug.slice(0, maxLen).replace(/-$/, "") : slug;
}

/** Shared 03 Published/Attachments — never match another article's -body-NN- file. */
function belongsToSlug(name, slug) {
  const base = normalizeDoubleExt(path.basename(name));
  const short = slugShort(slug);
  if (PASTED_RE.test(base)) return true;
  return base.startsWith(`${slug}-`) || base.startsWith(`${short}-`);
}

function findCandidateForSlot(files, slot, body, slug) {
  const want = slot.filename;
  const embedded = new Set();
  for (const m of body.matchAll(/!\[\[([^\]|]+)/g)) {
    embedded.add(path.basename(m[1].trim()));
    embedded.add(normalizeDoubleExt(path.basename(m[1].trim())));
  }

  for (const name of embedded) {
    if (!belongsToSlug(name, slug) && !PASTED_RE.test(name)) continue;
    if (files.has(name)) return { name, path: files.get(name) };
    const norm = normalizeDoubleExt(name);
    if (files.has(norm)) return { name: norm, path: files.get(norm) };
  }

  if (files.has(want)) return { name: want, path: files.get(want) };

  const normWant = normalizeDoubleExt(want);
  if (files.has(normWant)) return { name: normWant, path: files.get(normWant) };

  const base = want.replace(/\.[^.]+$/, "");
  for (const [name, filePath] of files) {
    if (!belongsToSlug(name, slug)) continue;
    const norm = normalizeDoubleExt(name);
    if (norm === want || name === `${base}.png` || name === `${base}.png.png`) {
      return { name, path: filePath };
    }
    if (name.includes(`-body-${slot.id}-`) || norm.includes(`-body-${slot.id}-`)) {
      return { name, path: filePath };
    }
  }

  return null;
}

function moveToCanonical(srcPath, destPath, dryRun) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (path.resolve(srcPath) === path.resolve(destPath)) return destPath;
  if (dryRun) {
    console.log(`[dry-run] would move ${srcPath} -> ${destPath}`);
    return destPath;
  }
  if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
  if (path.dirname(srcPath) === path.dirname(destPath)) {
    fs.renameSync(srcPath, destPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
    try {
      fs.unlinkSync(srcPath);
    } catch {
      /* keep source if Obsidian lock */
    }
  }
  return destPath;
}

async function ensureRasterOutput(filePath, dryRun) {
  const ext = path.extname(filePath).toLowerCase();
  if (!isRasterInputExt(ext)) return filePath;
  const avifPath = rasterNameFor(filePath);
  if (dryRun) return avifPath;
  await convertRasterFile(filePath, avifPath);
  if (avifPath !== filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return avifPath;
}

function syncSlotFilename(slots, slotId, filename) {
  const slot = slots.find((s) => s.id === slotId);
  if (slot && slot.filename !== filename) {
    slot.filename = filename;
  }
}

function screenshotCaption(slot) {
  const year = new Date().getFullYear();
  if (slot.kind === "ui" && /bridge/i.test(slot.filename || "")) {
    return `*Screenshot: Petralian / Obsidian Session Bridge (${year})*`;
  }
  return `*Screenshot: Petralian (${year})*`;
}

function stripDraftImageLines(lines) {
  return lines.filter((line) => {
    const t = line.trim();
    if (/^Source:\s*https:\/\/(www\.)?(pexels|unsplash)\.com\//i.test(t)) return false;
    if (/^https:\/\/(www\.)?(pexels|unsplash)\.com\//i.test(t)) return false;
    const wm = t.match(WIKI_IMG_RE);
    if (wm) {
      const base = path.basename(wm[1].trim());
      if (PEXELS_WIKI_RE.test(base)) return false;
    }
    return true;
  });
}

function rebuildSlotBlock(lines, slot, caption) {
  const filename = slot.filename;
  const alt = slot.alt || `Illustration for body image ${slot.id}`;
  const embed = `![[${filename}|${alt}]]`;
  const cleaned = stripDraftImageLines(lines);
  const out = [];
  let replaced = false;

  for (let i = 0; i < cleaned.length; i += 1) {
    const line = cleaned[i];
    const wm = line.trim().match(WIKI_IMG_RE);
    if (wm) {
      const base = normalizeDoubleExt(path.basename(wm[1].trim()));
      const target = normalizeDoubleExt(filename);
      if (
        base === target ||
        base === filename ||
        base.includes(`-body-${slot.id}-`) ||
        PEXELS_WIKI_RE.test(base) ||
        PASTED_RE.test(base)
      ) {
        if (!replaced) {
          out.push(embed);
          out.push(caption);
          replaced = true;
        }
        i += 1;
        while (i < cleaned.length && ATTR_RE.test(cleaned[i].trim())) i += 1;
        continue;
      }
    }
    out.push(line);
  }

  if (!replaced) {
    out.push(embed);
    out.push(caption);
  }
  return out;
}

function sectionSlice(body, sectionTitle) {
  const lines = body.split(/\r?\n/);
  if (!sectionTitle) {
    return { lines, start: 0, end: lines.length, slice: lines };
  }
  const start = lines.findIndex((l) => l.trim() === `## ${sectionTitle}`);
  if (start === -1) return { lines, start: 0, end: lines.length, slice: null };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^## /.test(lines[i])) {
      end = i;
      break;
    }
  }
  return { lines, start, end, slice: lines.slice(start, end) };
}

function applySectionPatch(body, sectionTitle, newSectionLines) {
  const parsed = sectionSlice(body, sectionTitle);
  if (!parsed.slice) return body;
  const { lines, start, end } = parsed;
  const merged = [...lines.slice(0, start), ...newSectionLines, ...lines.slice(end)];
  return merged.join("\n");
}

async function ingestSlug(slug, { dryRun }) {
  const articlePath = findArticlePath(slug);
  if (!articlePath) throw new Error(`Article not found: ${slug}`);
  const articleSlug = path.basename(articlePath, ".md");

  const pexelsKey = loadEnvKey("PEXELS_API_KEY");
  const unsplashKey = loadEnvKey("UNSPLASH_ACCESS_KEY");
  const raw = fs.readFileSync(articlePath, "utf8");
  const parsed = matter(raw);
  const slots = parsed.data.body_images || [];
  if (slots.length === 0) {
    console.log("No body_images slots — nothing to ingest.");
    return;
  }

  let body = parsed.content;
  const attachDir = path.join(path.dirname(articlePath), "Attachments");
  let files = listVaultImages(articlePath);
  const usedUrls = new Set();

  for (const slot of slots) {
    if (slot.kind === "stock") {
      const section = sectionSlice(body, slot.section);
      const sectionText = section.slice ? section.slice.join("\n") : body;
      const pexelsUrls = pexelsUrlsInText(sectionText).filter((u) => !usedUrls.has(u));
      const unsplashUrls = unsplashUrlsInText(sectionText).filter((u) => !usedUrls.has(`u:${u}`));

      let provider = null;
      let photoId = null;

      if (slot.stock_page_url?.includes("unsplash.com") || slot.stock_provider === "unsplash") {
        provider = "unsplash";
        photoId = extractUnsplashPhotoId(slot.stock_page_url) || extractUnsplashPhotoId(slot.stock_id);
      } else if (slot.stock_page_url?.includes("pexels.com") || slot.stock_provider === "pexels") {
        provider = "pexels";
        photoId = slotPhotoId(slot);
      } else if (unsplashUrls.length > 0) {
        provider = "unsplash";
        photoId = extractUnsplashPhotoId(unsplashUrls[0]);
        usedUrls.add(`u:${unsplashUrls[0]}`);
      } else if (pexelsUrls.length > 0) {
        provider = "pexels";
        photoId = extractPexelsPhotoId(pexelsUrls[0]);
        usedUrls.add(pexelsUrls[0]);
      } else {
        photoId = slotPhotoId(slot);
        if (photoId) provider = "pexels";
        if (!photoId) {
          for (const [name] of files) {
            const fromName = extractPexelsPhotoId(name);
            if (fromName && PEXELS_WIKI_RE.test(name)) {
              photoId = fromName;
              provider = "pexels";
              break;
            }
          }
        }
      }

      if (!photoId || !provider) {
        console.warn(`WARN slot ${slot.id}: paste a Pexels or Unsplash photo URL in the section`);
        continue;
      }

      const dest = path.join(attachDir, slot.filename);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0 && !pexelsUrls.length && !unsplashUrls.length) {
        console.log(`✓ slot ${slot.id}: stock file exists (${slot.filename})`);
        continue;
      }

      let caption;
      let sourceLine;

      if (provider === "unsplash") {
        if (!unsplashKey) {
          console.warn(`WARN slot ${slot.id}: UNSPLASH_ACCESS_KEY missing — cannot download`);
          continue;
        }
        if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
          console.log(`↓ downloading Unsplash ${photoId} → ${slot.filename}`);
          if (!dryRun) {
            const { destPath: written } = await downloadUnsplashToFile(photoId, dest, unsplashKey);
            syncSlotFilename(parsed.data.body_images, slot.id, path.basename(written));
            files = listVaultImages(articlePath);
          }
        } else {
          console.log(`✓ stock file exists: ${slot.filename}`);
        }
        const entry = loadUnsplashCache().photos[photoId];
        caption = entry
          ? formatUnsplashCaption(entry)
          : `*Photo: [Unsplash](https://unsplash.com/photos/${photoId}) — Petralian (${new Date().getFullYear()})*`;
        sourceLine = entry
          ? `Unsplash ${photoId}: ${entry.photographer} — ${entry.photo_url}`
          : `Unsplash ${photoId}`;
        updateBodyImagesSlot(parsed.data, slot.id, {
          stock_id: photoId,
          stock_page_url: entry?.photo_url || `https://unsplash.com/photos/${photoId}`,
          source: sourceLine,
        });
        parsed.data.body_images.find((s) => s.id === slot.id).stock_provider = "unsplash";
      } else {
        if (!pexelsKey) {
          console.warn(`WARN slot ${slot.id}: PEXELS_API_KEY missing — cannot download`);
          continue;
        }
        if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
          console.log(`↓ downloading Pexels ${photoId} → ${slot.filename}`);
          if (!dryRun) {
            const { destPath: written } = await downloadPexelsToFile(photoId, dest, pexelsKey);
            syncSlotFilename(parsed.data.body_images, slot.id, path.basename(written));
            files = listVaultImages(articlePath);
          }
        } else {
          console.log(`✓ stock file exists: ${slot.filename}`);
        }
        const entry = loadPexelsCache().photos[photoId];
        caption = entry
          ? formatPexelsCaption(entry)
          : `*Photo: [Pexels](https://www.pexels.com/photo/${photoId}/) on Pexels — Petralian (${new Date().getFullYear()})*`;
        sourceLine = entry
          ? `Pexels ${photoId}: ${entry.photographer} — ${entry.photo_url}`
          : `Pexels ${photoId}`;
        updateBodyImagesSlot(parsed.data, slot.id, {
          stock_id: photoId,
          stock_page_url: entry?.photo_url || `https://www.pexels.com/photo/${photoId}/`,
          source: sourceLine,
        });
        parsed.data.body_images.find((s) => s.id === slot.id).stock_provider = "pexels";
      }

      parsed.data.body_images.find((s) => s.id === slot.id).status = "embedded";

      if (section.slice) {
        const newSection = rebuildSlotBlock(section.slice, slot, caption);
        body = applySectionPatch(body, slot.section, newSection);
      } else {
        const result = applyCaptionForFilename(body, slot.filename, caption);
        body = result.markdown;
      }
      console.log(`✓ slot ${slot.id}: ${provider} ${photoId}`);
      continue;
    }

    if (slot.kind === "ui" || slot.kind === "screenshot") {
      const destBase = rasterNameFor(slot.filename);
      const dest = path.join(attachDir, destBase);
      const destLegacy = path.join(attachDir, slot.filename);
      const hasFile =
        (fs.existsSync(dest) && fs.statSync(dest).size > 0) ||
        (fs.existsSync(destLegacy) && fs.statSync(destLegacy).size > 0);
      if (hasFile) {
        syncSlotFilename(parsed.data.body_images, slot.id, path.basename(dest));
        console.log(`✓ slot ${slot.id}: canonical file exists (${path.basename(dest)})`);
        const caption = screenshotCaption(slot);
        const section = sectionSlice(body, slot.section);
        if (section.slice) {
          const newSection = rebuildSlotBlock(section.slice, { ...slot, filename: path.basename(dest) }, caption);
          body = applySectionPatch(body, slot.section, newSection);
        }
        const s = parsed.data.body_images.find((x) => x.id === slot.id);
        if (s) s.status = "embedded";
        continue;
      }

      const candidate = findCandidateForSlot(files, slot, body, articleSlug);
      const destTarget = path.join(attachDir, slot.filename);
      if (candidate) {
        const placed = moveToCanonical(candidate.path, destTarget, dryRun);
        const finalPath = dryRun
          ? rasterNameFor(placed)
          : await ensureRasterOutput(placed, dryRun);
        syncSlotFilename(parsed.data.body_images, slot.id, path.basename(finalPath));
        files = listVaultImages(articlePath);
        console.log(`✓ slot ${slot.id}: renamed ${candidate.name} → ${path.basename(finalPath)}`);
      } else if (!fs.existsSync(dest) && !fs.existsSync(destTarget)) {
        console.warn(`WARN slot ${slot.id}: no screenshot file found for ${slot.filename}`);
      }

      const caption = screenshotCaption(slot);
      const section = sectionSlice(body, slot.section);
      const slotForEmbed = {
        ...slot,
        filename: fs.existsSync(dest) ? path.basename(dest) : slot.filename,
      };
      if (section.slice) {
        const newSection = rebuildSlotBlock(section.slice, slotForEmbed, caption);
        body = applySectionPatch(body, slot.section, newSection);
      } else if (fs.existsSync(dest) || fs.existsSync(destTarget)) {
        const result = applyCaptionForFilename(body, slotForEmbed.filename, caption);
        body = result.markdown;
      }
      if (fs.existsSync(dest) || fs.existsSync(destTarget) || candidate) {
        const s = parsed.data.body_images.find((x) => x.id === slot.id);
        if (s) s.status = "embedded";
      }
    }
  }

  const next = matter.stringify(body, parsed.data);
  if (dryRun) {
    console.log(`\n[dry-run] would update ${articlePath}`);
    return;
  }
  fs.writeFileSync(articlePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  console.log(`Updated ${articlePath}`);
}

function usage() {
  console.log(`Usage:
  npm run ingest:images -- --slug <article-slug>
  npm run ingest:images -- --slug <article-slug> --dry-run`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const slugIdx = args.indexOf("--slug");
  const slug = slugIdx !== -1 ? args[slugIdx + 1] : args.find((a) => !a.startsWith("--"));

  if (!slug) {
    usage();
    process.exit(1);
  }
  await ingestSlug(slug, { dryRun });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
