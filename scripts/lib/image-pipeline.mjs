import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONFIG_PATH = path.join(ROOT, "data", "image-pipeline.yaml");

const DEFAULT_CONFIG = {
  resize: { max_width_px: 1200 },
  encode: { avif_quality: 50, avif_effort: 4 },
  formats: { raster_output: "avif", passthrough: ["svg", "gif"] },
};

/** Raster extensions converted to the configured output format. */
export const RASTER_INPUT_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function loadImagePipelineConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return DEFAULT_CONFIG;
  const data = yaml.load(fs.readFileSync(CONFIG_PATH, "utf8")) || {};
  return {
    ...DEFAULT_CONFIG,
    ...data,
    resize: { ...DEFAULT_CONFIG.resize, ...data.resize },
    encode: { ...DEFAULT_CONFIG.encode, ...data.encode },
    formats: { ...DEFAULT_CONFIG.formats, ...data.formats },
  };
}

export function rasterOutputExt() {
  const fmt = loadImagePipelineConfig().formats?.raster_output || "avif";
  return fmt.startsWith(".") ? fmt.toLowerCase() : `.${fmt.toLowerCase()}`;
}

export function extLower(filePath) {
  return path.extname(filePath).toLowerCase();
}

export function isPassthroughExt(ext) {
  const cfg = loadImagePipelineConfig();
  const out = rasterOutputExt();
  const set = new Set(
    (cfg.formats?.passthrough || ["svg", "gif"]).map((e) =>
      e.startsWith(".") ? e.toLowerCase() : `.${e.toLowerCase()}`
    )
  );
  set.add(out);
  set.add(".svg");
  set.add(".gif");
  return set.has(ext.toLowerCase());
}

export function isRasterInputExt(ext) {
  return RASTER_INPUT_EXT.has(ext.toLowerCase());
}

export function rasterPathFor(filePath) {
  const ext = path.extname(filePath);
  const out = rasterOutputExt();
  if (ext.toLowerCase() === out) return filePath;
  return `${filePath.slice(0, -ext.length)}${out}`;
}

export function rasterNameFor(fileName) {
  const ext = path.extname(fileName);
  const out = rasterOutputExt();
  if (ext.toLowerCase() === out) return fileName;
  return `${fileName.slice(0, -ext.length)}${out}`;
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replace every occurrence of old image basenames in markdown/frontmatter. */
export function rewriteImageRefsInText(text, renameMap) {
  let out = text;
  const entries = [...renameMap.entries()].sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [oldName, newName] of entries) {
    if (oldName === newName) continue;
    out = out.replace(new RegExp(escapeRegExp(oldName), "g"), newName);
  }
  return out;
}

function encodeOptions(cfg, overrides = {}) {
  return {
    maxWidth: overrides.maxWidth ?? cfg.resize.max_width_px,
    quality: overrides.quality ?? cfg.encode.avif_quality,
    effort: overrides.effort ?? cfg.encode.avif_effort,
  };
}

export async function writeBufferAsRaster(buffer, destPath, options = {}) {
  const cfg = loadImagePipelineConfig();
  const { maxWidth, quality, effort } = encodeOptions(cfg, options);
  const outExt = rasterOutputExt();
  const dest =
    extLower(destPath) === outExt ? destPath : rasterPathFor(destPath);

  let pipeline = sharp(buffer, { failOn: "none" });
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await pipeline.avif({ quality, effort }).toFile(dest);
  return { destPath: dest, size: fs.statSync(dest).size };
}

export async function convertRasterFile(srcPath, destPath, options = {}) {
  const buffer = fs.readFileSync(srcPath);
  return writeBufferAsRaster(buffer, destPath, options);
}

export async function recompressRasterInPlace(filePath, options = {}) {
  const cfg = loadImagePipelineConfig();
  const { maxWidth, quality, effort } = encodeOptions(cfg, options);
  const originalSize = fs.statSync(filePath).size;

  let pipeline = sharp(filePath, { failOn: "none" });
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }
  pipeline = pipeline.avif({ quality, effort });

  const tmp = `${filePath}.opt-${Date.now()}${rasterOutputExt()}`;
  try {
    const info = await pipeline.toFile(tmp);
    if (info.size <= originalSize) {
      fs.copyFileSync(tmp, filePath);
    }
    return { originalSize, newSize: Math.min(info.size, originalSize) };
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Convert raster files in a directory to AVIF. Returns Map<oldBasename, newBasename>.
 * Skips SVG/GIF and files already AVIF (recompress separately).
 */
export async function convertRastersInDirectory(
  dir,
  { dryRun = false, minSavingRatio = 0.02 } = {}
) {
  const renameMap = new Map();
  const outExt = rasterOutputExt();
  if (!fs.existsSync(dir)) return renameMap;

  for (const name of fs.readdirSync(dir)) {
    const ext = extLower(name);
    if (!isRasterInputExt(ext)) continue;

    const srcPath = path.join(dir, name);
    if (!fs.statSync(srcPath).isFile()) continue;

    const destName = rasterNameFor(name);
    const destPath = path.join(dir, destName);
    const originalSize = fs.statSync(srcPath).size;

    if (dryRun) {
      renameMap.set(name, destName);
      continue;
    }

    await convertRasterFile(srcPath, destPath);
    const newSize = fs.statSync(destPath).size;
    const keep =
      destPath !== srcPath &&
      newSize < originalSize * (1 - minSavingRatio);

    if (keep && srcPath !== destPath) {
      fs.unlinkSync(srcPath);
      renameMap.set(name, destName);
      console.log(
        `  ${name} → ${destName}: ${(originalSize / 1024).toFixed(1)} KB → ${(newSize / 1024).toFixed(1)} KB`
      );
    } else if (srcPath !== destPath && fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
      console.log(`  ${name}: skip — ${outExt} not smaller`);
    }
  }

  return renameMap;
}

export async function recompressAvifInDirectory(dir, { dryRun = false } = {}) {
  const outExt = rasterOutputExt();
  let count = 0;
  if (!fs.existsSync(dir)) return count;

  for (const name of fs.readdirSync(dir)) {
    if (extLower(name) !== outExt) continue;
    const filePath = path.join(dir, name);
    if (!fs.statSync(filePath).isFile()) continue;
    if (dryRun) {
      count += 1;
      continue;
    }
    const { originalSize, newSize } = await recompressRasterInPlace(filePath);
    count += 1;
    const saved = originalSize - newSize;
    if (saved > 0) {
      console.log(
        `  ${name}: ${(originalSize / 1024).toFixed(1)} KB → ${(newSize / 1024).toFixed(1)} KB`
      );
    }
  }
  return count;
}

export function updateMarkdownFilesInDir(markdownDir, renameMap, { dryRun = false } = {}) {
  if (renameMap.size === 0 || !fs.existsSync(markdownDir)) return 0;

  let filesUpdated = 0;
  for (const file of fs.readdirSync(markdownDir)) {
    if (!file.endsWith(".md")) continue;
    const filePath = path.join(markdownDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const next = rewriteImageRefsInText(raw, renameMap);
    if (next !== raw) {
      filesUpdated += 1;
      if (!dryRun) {
        fs.writeFileSync(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
      }
    }
  }
  return filesUpdated;
}

export function walkFiles(rootDir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;

  function walk(current) {
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (predicate(full, name)) out.push(full);
    }
  }

  walk(rootDir);
  return out;
}

export async function downloadUrlAsRaster(url, destPath, options = {}) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image download ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const { destPath: written } = await writeBufferAsRaster(buffer, destPath, options);
  if (written !== destPath && fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }
  return written;
}
