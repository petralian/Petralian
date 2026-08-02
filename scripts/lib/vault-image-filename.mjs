/**
 * SEO-safe vault image filename rules — shared by slug-bundle and attachment audits.
 */

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"]);

/** Content-hash / paste-hash names Obsidian assigns on paste. */
const HASH_NAME = /^[a-f0-9]{20,}(?:\.[a-f0-9]+)?\.[a-z0-9]+$/i;

export function isImageFile(name) {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXT.has(ext);
}

export function isBadSeoFilename(name) {
  if (!name || typeof name !== "string") return true;
  const base = name.trim();
  if (!base) return true;
  if (/[\s]/.test(base)) return true;
  if (/^pasted image /i.test(base)) return true;
  if (/^snipaste_/i.test(base)) return true;
  if (/^image\d+\./i.test(base)) return true;
  if (/^screenshot/i.test(base)) return true;
  if (/^capture/i.test(base)) return true;
  if (HASH_NAME.test(base)) return true;
  return false;
}

export function badSeoReason(name) {
  if (!name?.trim()) return "empty filename";
  if (/[\s]/.test(name)) return "contains spaces";
  if (/^pasted image /i.test(name)) return "Obsidian paste name (Pasted image …)";
  if (/^snipaste_/i.test(name)) return "Snipaste default name";
  if (/^image\d+\./i.test(name)) return "generic imageN name";
  if (/^screenshot/i.test(name)) return "generic Screenshot prefix";
  if (/^capture/i.test(name)) return "generic Capture prefix";
  if (HASH_NAME.test(name)) return "content-hash name (rename to {slug}-body-NN-descriptor)";
  return "non-SEO filename";
}

export function isCanonicalAsset(name, slug) {
  if (!slug || !name) return false;
  const stem = name.replace(/\.[^.]+$/, "");
  return stem === slug || stem.startsWith(`${slug}-body-`);
}
