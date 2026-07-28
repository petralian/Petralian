import fs from "node:fs";
import path from "node:path";
import { basename, extname } from "node:path";
import matter from "gray-matter";
import { stripVaultOnlyFrontmatter } from "./strip-vault-frontmatter.mjs";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

export function findVaultImage(filename, articleFolder, vaultRoot) {
  const attachments = path.join(vaultRoot, "Blog", "00 Attachments");
  const candidates = [
    path.join(attachments, filename),
    path.join(articleFolder, "Attachments", filename),
    path.join(articleFolder, filename),
    path.join(articleFolder, "assets", filename),
    path.join(articleFolder, "attachments", filename),
    path.join(articleFolder, "images", filename),
    path.join(vaultRoot, "Attachments", filename),
  ];
  for (const loc of candidates) {
    if (fs.existsSync(loc)) return loc;
  }
  return null;
}

function resolveImages(content, articleFolder, siteImages, vaultRoot) {
  content = content.replace(/<!--\s*petralian-img(?:-slot)?\b[\s\S]*?-->\s*/gi, "");

  content = content.replace(
    /!\[\[([^\]|]+?)(?:\|([^\]]*?))?\]\](?:\r?\n(\*[^\r\n]+\*))?/g,
    (match, ref, alt, caption) => {
      const filename = basename(ref.trim());
      const ext = extname(filename).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) return match;
      const src = findVaultImage(filename, articleFolder, vaultRoot);
      if (!src) return "";
      fs.mkdirSync(siteImages, { recursive: true });
      fs.copyFileSync(src, path.join(siteImages, filename));
      const img = alt ? `![${alt}](/images/posts/${filename})` : `![](/images/posts/${filename})`;
      return caption ? `${img}\n${caption}` : img;
    }
  );

  content = content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)(?:\r?\n(\*[^\r\n]+\*))?/g,
    (match, alt, imgPath, caption) => {
      const filename = basename(imgPath.trim());
      const ext = extname(filename).toLowerCase();
      if (!IMAGE_EXTS.has(ext) || imgPath.startsWith("/images/")) return match;
      const src = findVaultImage(filename, articleFolder, vaultRoot);
      if (!src) return "";
      fs.mkdirSync(siteImages, { recursive: true });
      fs.copyFileSync(src, path.join(siteImages, filename));
      const img = `![${alt}](/images/posts/${filename})`;
      return caption ? `${img}\n${caption}` : img;
    }
  );

  content = content.replace(/^featured_image:\s*(.+)$/m, (match, val) => {
    val = val.trim().replace(/^["']|["']$/g, "");
    if (!val || val.startsWith("http") || val.startsWith("/")) return match;
    val = val.replace(/^\[\[/, "").replace(/\]\]$/, "");
    const filename = basename(val);
    const ext = extname(filename).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return match;
    const src = findVaultImage(filename, articleFolder, vaultRoot);
    if (!src) return match;
    fs.mkdirSync(siteImages, { recursive: true });
    fs.copyFileSync(src, path.join(siteImages, filename));
    return `featured_image: /images/posts/${filename}`;
  });

  return content;
}

/** Transform vault markdown → live content/posts markdown */
export function transformVaultArticle(raw, { articleFolder, siteImages, vaultRoot }) {
  let content = raw.replace(/^status:\s*.+\r?\n/m, "");
  content = content.replace(/^category:\s*.+\r?\n/m, "");
  content = resolveImages(content, articleFolder, siteImages, vaultRoot);
  content = stripVaultOnlyFrontmatter(content);
  return content;
}
