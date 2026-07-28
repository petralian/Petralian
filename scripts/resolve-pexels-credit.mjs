#!/usr/bin/env node
/**
 * Resolve Pexels photographer credits by photo ID (not download filename).
 *
 * Usage:
 *   npm run resolve:pexels -- 16416873
 *   npm run resolve:pexels -- --url https://www.pexels.com/photo/chatgpt-on-monitors-screens-16416873/
 *   npm run resolve:pexels -- --apply when-chatgpt-is-research-and-cursor-is-build-layer
 *   npm run resolve:pexels -- --scan-vault
 *
 * Env: PEXELS_API_KEY (free at https://www.pexels.com/api/)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadEnvKey } from "./lib/load-env.mjs";
import {
  applyCaptionForFilename,
  extractPexelsPhotoId,
  formatPexelsCaption,
  listVaultArticles,
  loadPexelsCache,
  resolvePexelsPhoto,
  updateBodyImagesSlot,
} from "./lib/pexels-credit.mjs";

const VAULT_BLOG = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Blog"
);

function usage() {
  console.log(`Usage:
  node scripts/resolve-pexels-credit.mjs <photo-id>
  node scripts/resolve-pexels-credit.mjs --url <pexels-photo-url>
  node scripts/resolve-pexels-credit.mjs --apply <slug>
  node scripts/resolve-pexels-credit.mjs --scan-vault

Never trust pexels-{username}-{id}.jpg for the photographer name — use photo ID + API/cache.`);
}

function findArticlePath(slug) {
  const stages = ["01 Drafts", "02 Ready to publish", "03 Published"];
  for (const stage of stages) {
    const p = path.join(VAULT_BLOG, stage, `${slug}.md`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function slotPhotoId(slot) {
  return (
    extractPexelsPhotoId(slot.stock_id) ||
    extractPexelsPhotoId(slot.stock_page_url) ||
    extractPexelsPhotoId(slot.pexels_id)
  );
}

/** Only credit stock when this article contains the Pexels URL or photo id (user pasted it here). */
function articleReferencesPexelsPhoto(body, photoId) {
  if (!photoId || !body) return false;
  if (body.includes(photoId)) return true;
  for (const m of body.matchAll(/https:\/\/www\.pexels\.com\/photo\/[^\s\])"'<>]+/gi)) {
    if (extractPexelsPhotoId(m[0]) === photoId) return true;
  }
  return false;
}

async function cmdResolve(idOrUrl, { refresh }) {
  const apiKey = loadEnvKey("PEXELS_API_KEY");
  const photoId = extractPexelsPhotoId(idOrUrl);
  if (!photoId) {
    console.error("Could not parse Pexels photo id.");
    process.exit(1);
  }

  const cache = loadPexelsCache();
  if (!refresh && cache.photos[photoId]) {
    const entry = cache.photos[photoId];
    console.log(`Cache hit: ${photoId} → ${entry.photographer}`);
    console.log(formatPexelsCaption(entry));
    return;
  }

  if (!apiKey) {
    console.error(
      `No cache entry for ${photoId} and PEXELS_API_KEY is unset.\n` +
      `Add the photo to data/pexels-credit-cache.yaml after verifying the Pexels page, or set PEXELS_API_KEY.`
    );
    process.exit(1);
  }

  const { entry, fromCache } = await resolvePexelsPhoto(photoId, { apiKey, refresh });
  console.log(`${fromCache ? "Cache" : "API"}: ${photoId} → ${entry.photographer}`);
  console.log(formatPexelsCaption(entry));
}

async function cmdApply(slug, { dryRun }) {
  const articlePath = findArticlePath(slug);
  if (!articlePath) {
    console.error(`Article not found in vault: ${slug}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(articlePath, "utf8");
  const parsed = matter(raw);
  const slots = parsed.data.body_images || [];
  const apiKey = loadEnvKey("PEXELS_API_KEY");
  let body = parsed.content;
  let changed = false;

  for (const slot of slots) {
    if (slot.kind !== "stock" && !slot.stock_page_url && !slot.stock_id) continue;
    const photoId = slotPhotoId(slot);
    if (!photoId) {
      console.warn(`WARN ${slug}: slot ${slot.id} — no Pexels photo id (add stock_id or stock_page_url)`);
      continue;
    }
    if (!articleReferencesPexelsPhoto(body, photoId)) {
      console.log(`· slot ${slot.id}: skip — photo ${photoId} not referenced in this article`);
      continue;
    }

    const cache = loadPexelsCache();
    let entry = cache.photos[photoId];
    if (!entry) {
      if (!apiKey) {
        console.warn(
          `WARN ${slug}: slot ${slot.id} — photo ${photoId} not in cache; set PEXELS_API_KEY or seed cache`
        );
        continue;
      }
      ({ entry } = await resolvePexelsPhoto(photoId, { apiKey }));
    }

    const caption = formatPexelsCaption(entry);
    const capResult = applyCaptionForFilename(body, path.basename(slot.filename), caption);
    body = capResult.markdown;
    changed = changed || capResult.changed;

    const slotChanged = updateBodyImagesSlot(parsed.data, slot.id, {
      source: `Pexels ${photoId}: ${entry.photographer} — ${entry.photo_url}`,
      stock_id: photoId,
      stock_page_url: entry.photo_url,
    });
    changed = changed || slotChanged;

    console.log(`✓ slot ${slot.id}: ${entry.photographer} (${photoId})`);
  }

  if (!changed) {
    console.log("No changes needed.");
    return;
  }

  const next = matter.stringify(body, parsed.data);

  if (dryRun) {
    console.log("\n[dry-run] Would update:", articlePath);
    return;
  }

  fs.writeFileSync(articlePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  console.log(`Updated ${articlePath}`);
}

function cmdScanVault() {
  const cache = loadPexelsCache();
  const issues = [];

  for (const articlePath of listVaultArticles()) {
    const raw = fs.readFileSync(articlePath, "utf8");
    const { data, content } = matter(raw);
    const slug = path.basename(articlePath, ".md");

    for (const slot of data.body_images || []) {
      const photoId = slotPhotoId(slot);
      if (!photoId) continue;
      if (!cache.photos[photoId]) {
        issues.push(`${slug} slot ${slot.id}: photo ${photoId} missing from cache`);
      }
    }

    for (const m of content.matchAll(/^pexels-[^.]+\.(jpe?g|png|webp)/gim)) {
      issues.push(`${slug}: legacy pexels filename in body — rename + add stock_id`);
    }

    for (const m of content.matchAll(/!\[\[([^\]|]+)/g)) {
      const name = path.basename(m[1].trim());
      const id = extractPexelsPhotoId(name);
      if (id && !cache.photos[id]) {
        issues.push(`${slug}: embed ${name} → photo ${id} not in cache`);
      }
    }
  }

  if (issues.length === 0) {
    console.log("No unresolved Pexels credits found.");
    return;
  }

  console.log("Unresolved Pexels credits:\n");
  for (const line of issues) console.log(`  - ${line}`);
  console.log("\nFix: npm run resolve:pexels -- <id>  then  npm run resolve:pexels -- --apply <slug>");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const refresh = args.includes("--refresh");
  const filtered = args.filter((a) => !a.startsWith("--"));

  if (args.includes("--scan-vault")) {
    cmdScanVault();
    return;
  }

  if (args.includes("--apply")) {
    const slug = filtered[0];
    if (!slug) {
      usage();
      process.exit(1);
    }
    await cmdApply(slug, { dryRun });
    return;
  }

  const urlIdx = args.indexOf("--url");
  if (urlIdx !== -1) {
    const url = args[urlIdx + 1];
    if (!url) {
      usage();
      process.exit(1);
    }
    await cmdResolve(url, { refresh });
    return;
  }

  const id = filtered[0];
  if (!id) {
    usage();
    process.exit(1);
  }
  await cmdResolve(id, { refresh });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
