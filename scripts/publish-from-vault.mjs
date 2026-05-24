#!/usr/bin/env node
/**
 * publish-from-vault.mjs
 *
 * Cloud equivalent of scripts/sync-obsidian.ps1.
 * Reads articles from an Obsidian vault checkout (via obsidian-git) and publishes them.
 *
 * Called by: .github/workflows/auto-publish.yml
 *
 * Environment variables:
 *   VAULT_PATH  — path to the checked-out vault, e.g. "_vault/40_VSCode/Petralian"  (required)
 *   FORCE       — 'true' to skip preflight errors and publish anyway  (default: 'false')
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..');

const VAULT_PATH = process.env.VAULT_PATH;
if (!VAULT_PATH) {
  console.error('Error: VAULT_PATH environment variable is required.');
  process.exit(1);
}

const FORCE = process.env.FORCE === 'true';

const obsidianReady = join(VAULT_PATH, 'Blog', '02 Ready to publish');
const obsidianPublished = join(VAULT_PATH, 'Blog', '03 Published');
const obsidianAttachments = join(VAULT_PATH, 'Blog', '00 Attachments');

const sitePosts = join(repoRoot, 'content', 'posts');
const siteImages = join(repoRoot, 'public', 'images', 'posts');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

// ── Extract slug from markdown file ─────────────────────────────────────────
function getSlug(filePath, content) {
  const m = content.match(/^slug:\s*(.+)$/m);
  if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  const base = basename(filePath, extname(filePath));
  return base.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

// ── Locate an image in the vault (mirrors PowerShell Find-VaultImage) ────────
function findVaultImage(filename, articleFolder) {
  const candidates = [
    join(obsidianAttachments, filename),                        // 1. Blog/00 Attachments (primary)
    join(articleFolder, 'Attachments', filename),               // 2. Article subfolder/Attachments
    join(articleFolder, filename),                              // 3. Same folder as article
    join(articleFolder, 'assets', filename),                    // 4. Sibling asset folders
    join(articleFolder, 'attachments', filename),
    join(articleFolder, 'images', filename),
    join(VAULT_PATH, 'Attachments', filename),                  // 5. Vault-level Attachments
    join(VAULT_PATH, 'assets', filename),
    join(VAULT_PATH, 'attachments', filename),
    join(VAULT_PATH, 'images', filename),
  ];

  for (const loc of candidates) {
    if (existsSync(loc)) return loc;
  }

  // 6. Recursive vault search (last resort — slower)
  try {
    const result = execSync(
      `find "${VAULT_PATH}" -name "${filename.replace(/'/g, "'\\''")}" -type f 2>/dev/null | head -1`,
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    if (result) return result;
  } catch {
    // ignore — not found
  }

  return null;
}

// ── Copy image to site ───────────────────────────────────────────────────────
function copyImage(src, filename) {
  copyFileSync(src, join(siteImages, filename));
}

// ── Resolve all image references in markdown content ────────────────────────
function resolveImages(content, articleFolder) {
  // Pattern 1: Obsidian wiki-link  ![[filename.ext]]  or  ![[filename.ext|alt text]]
  content = content.replace(/!\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]/g, (match, ref) => {
    const filename = basename(ref.trim());
    const ext = extname(filename).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return match;

    const src = findVaultImage(filename, articleFolder);
    if (!src) { console.warn(`  ⚠ Image not found: ${filename}`); return match; }

    copyImage(src, filename);
    console.log(`  Image: ${filename}`);
    return `![](/images/posts/${filename})`;
  });

  // Pattern 2: Standard markdown  ![alt](relative/path.ext)  — not http(s)
  content = content.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (match, alt, path) => {
    const filename = basename(path.trim());
    const ext = extname(filename).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return match;
    if (path.startsWith('/images/')) return match; // already resolved

    const src = findVaultImage(filename, articleFolder);
    if (!src) { console.warn(`  ⚠ Image not found: ${filename}`); return match; }

    copyImage(src, filename);
    console.log(`  Image: ${filename}`);
    return `![${alt}](/images/posts/${filename})`;
  });

  // Pattern 3: featured_image frontmatter with a local filename (not a URL or /path)
  content = content.replace(/^featured_image:\s*(.+)$/m, (match, val) => {
    val = val.trim().replace(/^["']|["']$/g, '');
    if (!val || val.startsWith('http') || val.startsWith('/')) return match;

    // Strip Obsidian wiki-link brackets: [[filename.png]] → filename.png
    val = val.replace(/^\[\[/, '').replace(/\]\]$/, '');
    const filename = basename(val);
    const ext = extname(filename).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return match;

    const src = findVaultImage(filename, articleFolder);
    if (!src) { console.warn(`  ⚠ Featured image not found: ${filename}`); return match; }

    copyImage(src, filename);
    console.log(`  Featured image: ${filename}`);
    return `featured_image: /images/posts/${filename}`;
  });

  return content;
}

// ── Parse YAML frontmatter key/value pairs ───────────────────────────────────
function parseFrontmatter(content) {
  const fm = {};
  const m = content.match(/^---\s*\n([\s\S]+?)\n---/);
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w][\w_-]*):\s*(.*)$/);
    if (kv) fm[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

// ── Preflight: validate an article before publishing ─────────────────────────
function preflight(filePath, content, articleFolder) {
  const errors = [];
  const warnings = [];

  if (!content.match(/^---\s*\n[\s\S]+?\n---/)) {
    errors.push('No YAML frontmatter block found');
    return { errors, warnings, wordCount: 0 };
  }

  const fm = parseFrontmatter(content);

  // Required — blocks publish
  for (const field of ['title', 'slug', 'date', 'category']) {
    if (!fm[field]) errors.push(`Missing required field: ${field}`);
  }

  // Recommended — warnings only
  for (const field of ['excerpt', 'seo_description', 'focus_keyword']) {
    if (!fm[field]) warnings.push(`Missing recommended field: ${field}`);
  }

  // Featured image exists in vault
  const fi = fm['featured_image'];
  if (!fi) {
    warnings.push('No featured_image set — article will render without a header image');
  } else if (!fi.startsWith('http') && !fi.startsWith('/')) {
    const fname = basename(fi.replace(/^\[\[/, '').replace(/\]\]$/, ''));
    if (!findVaultImage(fname, articleFolder)) {
      errors.push(`featured_image file not found in vault: ${fname}`);
    }
  }

  if (!fm['featured_image_alt']) {
    warnings.push('Missing featured_image_alt — hero image will have no alt text');
  }

  // Body word count
  const body = content.replace(/^---[\s\S]+?---\s*/, '');
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (wordCount < 300) warnings.push(`Low word count: ${wordCount} words (min 300 recommended)`);

  return { errors, warnings, wordCount };
}

// ── Main ─────────────────────────────────────────────────────────────────────

// Ensure output directories exist
mkdirSync(siteImages, { recursive: true });
mkdirSync(sitePosts, { recursive: true });
// Check if publish folder exists; if not, nothing to do
if (!existsSync(obsidianReady)) {
  console.log(`No "02 Ready to publish" folder found. Nothing to sync.`);
  process.exit(0);
}
const readyFiles = readdirSync(obsidianReady).filter(f => f.endsWith('.md'));

if (readyFiles.length === 0) {
  console.log('No articles in "02 Ready to publish". Nothing to sync.');
  process.exit(0);
}

// ── Preflight all articles ────────────────────────────────────────────────────
console.log('');
console.log('── Preflight checks ─────────────────────────────────────────────');

let preflightBlocking = false;

for (const filename of readyFiles) {
  const filePath = join(obsidianReady, filename);
  const content = readFileSync(filePath, 'utf8');
  const slug = getSlug(filePath, content);
  const result = preflight(filePath, content, obsidianReady);

  const status = result.errors.length > 0 ? 'FAIL'
    : result.warnings.length > 0 ? 'WARN'
      : 'PASS';

  console.log(`  [${status}] ${slug}  (${result.wordCount} words)`);
  for (const e of result.errors) console.log(`        ERROR   ${e}`);
  for (const w of result.warnings) console.log(`        WARN    ${w}`);

  if (result.errors.length > 0) preflightBlocking = true;
}

console.log('─────────────────────────────────────────────────────────────────');

if (preflightBlocking && !FORCE) {
  console.error('\nSync blocked by preflight errors. Set FORCE=true to override.');
  process.exit(1);
}

// ── Build set of authorised slugs (ready + already published) ────────────────
const authorisedSlugs = new Set();

for (const folder of [obsidianReady, obsidianPublished]) {
  if (!existsSync(folder)) continue;
  for (const filename of readdirSync(folder).filter(f => f.endsWith('.md'))) {
    const fp = join(folder, filename);
    const content = readFileSync(fp, 'utf8');
    authorisedSlugs.add(getSlug(fp, content));
  }
}

// ── Unpublish: remove content/posts files not in authorised set ──────────────
const removed = [];

for (const filename of readdirSync(sitePosts).filter(f => f.endsWith('.md'))) {
  const slug = basename(filename, '.md');
  if (!authorisedSlugs.has(slug)) {
    unlinkSync(join(sitePosts, filename));
    console.log(`Removed: posts/${slug}.md`);
    removed.push(slug);
  }
}

// ── Publish: copy new/updated articles ───────────────────────────────────────
const copied = [];

for (const filename of readyFiles) {
  const filePath = join(obsidianReady, filename);
  console.log(`\nProcessing: ${filename}`);

  let content = readFileSync(filePath, 'utf8');
  const slug = getSlug(filePath, content);

  // Set status: published
  content = content.replace(/^status:\s*(ready|draft|published)\s*$/m, 'status: published');

  // Resolve + copy images
  content = resolveImages(content, obsidianReady);

  // Write to content/posts
  writeFileSync(join(sitePosts, `${slug}.md`), content, { encoding: 'utf8' });
  console.log(`  → content/posts/${slug}.md`);
  copied.push(slug);
}

// ── Image optimisation ────────────────────────────────────────────────────────
if (copied.length > 0) {
  const optimizeScript = join(repoRoot, 'scripts', 'optimize-images.mjs');
  if (existsSync(optimizeScript)) {
    console.log('\n── Image optimisation ───────────────────────────────────────────');
    try {
      execSync(`node "${optimizeScript}"`, { stdio: 'inherit', cwd: repoRoot });
    } catch (e) {
      console.warn('Image optimisation failed (non-fatal):', e.message);
    }
    console.log('─────────────────────────────────────────────────────────────────');
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
if (copied.length === 0 && removed.length === 0) {
  console.log('\nNothing changed.');
} else {
  const parts = [];
  if (copied.length > 0) parts.push(`Published: ${copied.join(', ')}`);
  if (removed.length > 0) parts.push(`Unpublished: ${removed.join(', ')}`);
  console.log(`\n✓ ${parts.join(' | ')}`);
}
