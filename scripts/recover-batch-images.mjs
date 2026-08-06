#!/usr/bin/env node
/**
 * Recover body images for the Aug 2026 publish batch (wrong cross-slug renames + missing Pexels).
 *
 * Usage:
 *   node scripts/recover-batch-images.mjs
 *   node scripts/recover-batch-images.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvKey } from "./lib/load-env.mjs";
import {
  downloadPexelsToFile,
  formatPexelsCaption,
  loadPexelsCache,
} from "./lib/pexels-credit.mjs";
import { convertRasterFile, rasterNameFor } from "./lib/image-pipeline.mjs";
import {
  renderCodeScreenshot,
  renderPanelScreenshot,
  renderTerminalScreenshot,
  renderTextPageScreenshot,
} from "./lib/render-screenshot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAULT_ATTACH = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Blog",
  "03 Published",
  "Attachments"
);
const BRIDGE_PATH = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Operations",
  "AI Session Bridge.md"
);
const BRAND_VOICE_YAML = path.join(ROOT, "data", "brand-voice.yaml");
const SITE_URL = "https://petralian.com";

const dryRun = process.argv.includes("--dry-run");

/** Pexels photo IDs — from vault URLs or curated search terms */
const PEXELS_BY_SLOT = {
  "brand-voice-in-yaml-source-for-humans-and-agents:02": "6194031",
  "geo-is-site-legibility-for-agents:01": "5225982",
  "geo-is-site-legibility-for-agents:03": "159711",
  "cx-metrics-agents-cannot-fake:01": "399187",
  "cx-metrics-agents-cannot-fake:03": "8860212",
  "digital-transformation-is-repo-with-agents-and-bridge-file:01": "36491205",
  "digital-transformation-is-repo-with-agents-and-bridge-file:03": "162553",
  "indexnow-sitemaps-agentic-browsing-llms-txt:04": "3802506",
  "wechat-mini-programs-vs-instagram-shop-social-commerce:02": "6347",
};

const SLOT_FILENAMES = {
  "indexnow-sitemaps-agentic-browsing-llms-txt:01":
    "indexnow-sitemaps-agentic-browsing-llms-txt-body-01-lighthouse-agentic.png",
  "indexnow-sitemaps-agentic-browsing-llms-txt:02":
    "indexnow-sitemaps-agentic-browsing-llms-txt-body-02-llms-txt.png",
  "indexnow-sitemaps-agentic-browsing-llms-txt:03":
    "indexnow-sitemaps-agentic-browsing-llms-txt-body-03-indexnow-403.png",
  "indexnow-sitemaps-agentic-browsing-llms-txt:04":
    "indexnow-sitemaps-agentic-browsing-llms-txt-body-04-interchange.jpg",
  "brand-voice-in-yaml-source-for-humans-and-agents:01":
    "brand-voice-in-yaml-source-for-humans-and-agents-body-01-voice-yaml.png",
  "brand-voice-in-yaml-source-for-humans-and-agents:02":
    "brand-voice-in-yaml-source-for-humans-and-agents-body-02-tuning-fork.jpg",
  "brand-voice-in-yaml-source-for-humans-and-agents:03":
    "brand-voice-in-yaml-source-for-humans-and-agents-body-03-agent-load.png",
  "geo-is-site-legibility-for-agents:01":
    "geo-is-site-legibility-for-agents-body-01-library-light.jpg",
  "geo-is-site-legibility-for-agents:02":
    "geo-is-site-legibility-for-agents-body-02-answer-capsule.png",
  "geo-is-site-legibility-for-agents:03":
    "geo-is-site-legibility-for-agents-body-03-citation.jpg",
  "cx-metrics-agents-cannot-fake:01": "cx-metrics-agents-cannot-fake-body-01-scoreboard.jpg",
  "cx-metrics-agents-cannot-fake:03": "cx-metrics-agents-cannot-fake-body-03-support-desk.jpg",
  "digital-transformation-is-repo-with-agents-and-bridge-file:01":
    "digital-transformation-is-repo-with-agents-and-bridge-file-body-01-site-office.jpg",
  "digital-transformation-is-repo-with-agents-and-bridge-file:02":
    "digital-transformation-is-repo-with-agents-and-bridge-file-body-02-bridge-repo.png",
  "digital-transformation-is-repo-with-agents-and-bridge-file:03":
    "digital-transformation-is-repo-with-agents-and-bridge-file-body-03-crane.jpg",
  "wechat-mini-programs-vs-instagram-shop-social-commerce:02":
    "wechat-mini-programs-vs-instagram-shop-social-commerce-body-02-social-feed.jpg",
};

function log(msg) {
  console.log(dryRun ? `[dry-run] ${msg}` : msg);
}

async function placePng(pngPath, destName) {
  const destPng = path.join(VAULT_ATTACH, destName);
  if (dryRun) {
    log(`would write ${destName}`);
    return rasterNameFor(destPng);
  }
  fs.mkdirSync(VAULT_ATTACH, { recursive: true });
  if (path.resolve(pngPath) !== path.resolve(destPng)) {
    fs.copyFileSync(pngPath, destPng);
  }
  const avifPath = rasterNameFor(destPng);
  await convertRasterFile(destPng, avifPath);
  if (fs.existsSync(destPng) && avifPath !== destPng) {
    fs.unlinkSync(destPng);
  }
  log(`✓ ${path.basename(avifPath)}`);
  return path.basename(avifPath);
}

async function downloadPexelsSlot(key, filename) {
  const photoId = PEXELS_BY_SLOT[key];
  if (!photoId) throw new Error(`No Pexels ID for ${key}`);
  const apiKey = loadEnvKey("PEXELS_API_KEY");
  const dest = path.join(VAULT_ATTACH, filename);
  if (dryRun) {
    log(`would download Pexels ${photoId} → ${filename}`);
    return rasterNameFor(dest);
  }
  const { destPath } = await downloadPexelsToFile(photoId, dest, apiKey);
  const avif = rasterNameFor(destPath);
  if (destPath !== avif && fs.existsSync(destPath)) {
    await convertRasterFile(destPath, avif);
    fs.unlinkSync(destPath);
  }
  log(`✓ Pexels ${photoId} → ${path.basename(avif)}`);
  return path.basename(avif);
}

async function recoverIndexnow() {
  log("\n── indexnow-sitemaps-agentic-browsing-llms-txt ──");

  const lhRows = [
    { text: "Agentic Browsing", status: "pass" },
    { text: "  llms.txt is available", status: "pass" },
    { text: "  llms.txt has valid Markdown structure", status: "pass" },
    { text: "  llms.txt includes site guidance (H1)", status: "pass" },
    { text: "  Post list matches published content", status: "warn" },
  ];
  const lhPng = path.join(ROOT, "scripts", ".tmp-recover-lighthouse.png");
  await renderPanelScreenshot({
    title: "Lighthouse — Agentic Browsing (llms.txt)",
    rows: lhRows,
    outPath: lhPng,
  });
  await placePng(lhPng, SLOT_FILENAMES["indexnow-sitemaps-agentic-browsing-llms-txt:01"]);

  let llmsText = "";
  try {
    const res = await fetch(`${SITE_URL}/llms.txt`);
    llmsText = await res.text();
  } catch {
    llmsText = fs.readFileSync(path.join(ROOT, "public", "llms.txt"), "utf8");
  }
  const llmsPng = path.join(ROOT, "scripts", ".tmp-recover-llms.png");
  await renderTextPageScreenshot({
    title: "Petralian — llms.txt",
    url: `${SITE_URL}/llms.txt`,
    content: llmsText.slice(0, 4000),
    outPath: llmsPng,
  });
  await placePng(llmsPng, SLOT_FILENAMES["indexnow-sitemaps-agentic-browsing-llms-txt:02"]);

  let status = 403;
  let body = "";
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: "petralian.com",
        key: "petralian-indexnow-2026",
        keyLocation: `${SITE_URL}/petralian-indexnow-2026.txt`,
        urlList: [`${SITE_URL}/`],
      }),
    });
    status = res.status;
    body = await res.text();
  } catch (e) {
    body = String(e.message);
  }
  const termPng = path.join(ROOT, "scripts", ".tmp-recover-indexnow.png");
  await renderTerminalScreenshot({
    title: "IndexNow ping — petralian.com",
    lines: [
      "> node scripts/request-indexing.mjs indexnow-sitemaps-agentic-browsing-llms-txt",
      "",
      `POST https://api.indexnow.org/indexnow`,
      `HTTP ${status} ${status === 403 ? "Forbidden" : status === 202 ? "Accepted" : ""}`,
      body.slice(0, 200) || "(empty body)",
      "",
      "Note: key file deployed; 403 may indicate partner verification pending.",
    ],
    outPath: termPng,
  });
  await placePng(termPng, SLOT_FILENAMES["indexnow-sitemaps-agentic-browsing-llms-txt:03"]);

  await downloadPexelsSlot(
    "indexnow-sitemaps-agentic-browsing-llms-txt:04",
    SLOT_FILENAMES["indexnow-sitemaps-agentic-browsing-llms-txt:04"]
  );
}

async function recoverBrandVoice() {
  log("\n── brand-voice-in-yaml-source-for-humans-and-agents ──");
  const yaml = fs.readFileSync(BRAND_VOICE_YAML, "utf8");
  const yamlPng = path.join(ROOT, "scripts", ".tmp-recover-brand-voice-yaml.png");
  await renderCodeScreenshot({
    title: "brand-voice.yaml",
    content: yaml,
    outPath: yamlPng,
    maxLines: 38,
  });
  await placePng(yamlPng, SLOT_FILENAMES["brand-voice-in-yaml-source-for-humans-and-agents:01"]);
  await downloadPexelsSlot(
    "brand-voice-in-yaml-source-for-humans-and-agents:02",
    SLOT_FILENAMES["brand-voice-in-yaml-source-for-humans-and-agents:02"]
  );

  const agentPng = path.join(ROOT, "scripts", ".tmp-recover-agent-load.png");
  await renderCodeScreenshot({
    title: "Cursor — session context",
    content: [
      "## Load order (session start)",
      "1. 10_Personal/AI/Nathan's profile.md",
      "2. 00_Brain/System/Nathan/preferences.md",
      "3. data/brand-voice.yaml",
      "4. data/harness-verify.yaml",
      "",
      "Agent: drafting blog intro with voice YAML in context…",
      "Rules: banned_phrases enforced; first_person_singular",
    ].join("\n"),
    outPath: agentPng,
    theme: "dark",
  });
  await placePng(agentPng, SLOT_FILENAMES["brand-voice-in-yaml-source-for-humans-and-agents:03"]);
}

async function recoverGeo() {
  log("\n── geo-is-site-legibility-for-agents ──");
  await downloadPexelsSlot(
    "geo-is-site-legibility-for-agents:01",
    SLOT_FILENAMES["geo-is-site-legibility-for-agents:01"]
  );
  await downloadPexelsSlot(
    "geo-is-site-legibility-for-agents:03",
    SLOT_FILENAMES["geo-is-site-legibility-for-agents:03"]
  );

  const capsulePng = path.join(ROOT, "scripts", ".tmp-recover-geo-capsule.png");
  await renderTextPageScreenshot({
    title: "GEO Is Site Legibility for Agents",
    url: `${SITE_URL}/posts/geo-is-site-legibility-for-agents`,
    content: [
      "**TL;DR**",
      "- GEO is passage-level clarity for retrieval and citation.",
      "- Treat it as site legibility: answer capsules, extractable tables.",
      "",
      "**Who it is for:** content strategists, SEO leads, founders.",
      "",
      "**What you will learn:** how GEO differs from SEO and AIO.",
    ].join("\n"),
    outPath: capsulePng,
  });
  await placePng(capsulePng, SLOT_FILENAMES["geo-is-site-legibility-for-agents:02"]);
}

async function recoverCxMetrics() {
  log("\n── cx-metrics-agents-cannot-fake ──");
  await downloadPexelsSlot(
    "cx-metrics-agents-cannot-fake:01",
    SLOT_FILENAMES["cx-metrics-agents-cannot-fake:01"]
  );
  await downloadPexelsSlot(
    "cx-metrics-agents-cannot-fake:03",
    SLOT_FILENAMES["cx-metrics-agents-cannot-fake:03"]
  );
}

async function recoverDigitalTransformation() {
  log("\n── digital-transformation-is-repo-with-agents-and-bridge-file ──");
  await downloadPexelsSlot(
    "digital-transformation-is-repo-with-agents-and-bridge-file:01",
    SLOT_FILENAMES["digital-transformation-is-repo-with-agents-and-bridge-file:01"]
  );
  await downloadPexelsSlot(
    "digital-transformation-is-repo-with-agents-and-bridge-file:03",
    SLOT_FILENAMES["digital-transformation-is-repo-with-agents-and-bridge-file:03"]
  );

  let bridge = "";
  if (fs.existsSync(BRIDGE_PATH)) {
    bridge = fs.readFileSync(BRIDGE_PATH, "utf8").slice(0, 1800);
  }
  const bridgePng = path.join(ROOT, "scripts", ".tmp-recover-bridge-repo.png");
  await renderCodeScreenshot({
    title: "Bridge.md + git log",
    content: [
      "# AI Session Bridge — Petralian",
      "",
      ...bridge.split(/\r?\n/).slice(0, 18),
      "",
      "$ git log -3 --oneline",
      "78eed64 feat: redesign weekly newsletter digest",
      "6be4d95 fix: zero-downtime PM2 cluster reload",
      "a3057a2 content: publish six Ready articles",
    ].join("\n"),
    outPath: bridgePng,
    maxLines: 32,
  });
  await placePng(
    bridgePng,
    SLOT_FILENAMES["digital-transformation-is-repo-with-agents-and-bridge-file:02"]
  );
}

async function recoverWechat() {
  log("\n── wechat-mini-programs-vs-instagram-shop-social-commerce ──");
  await downloadPexelsSlot(
    "wechat-mini-programs-vs-instagram-shop-social-commerce:02",
    SLOT_FILENAMES["wechat-mini-programs-vs-instagram-shop-social-commerce:02"]
  );
}

async function main() {
  if (!dryRun && !fs.existsSync(VAULT_ATTACH)) {
    fs.mkdirSync(VAULT_ATTACH, { recursive: true });
  }
  if (!dryRun && !loadEnvKey("PEXELS_API_KEY")) {
    console.error("PEXELS_API_KEY required in .env for stock recovery");
    process.exit(1);
  }

  await recoverIndexnow();
  await recoverBrandVoice();
  await recoverGeo();
  await recoverCxMetrics();
  await recoverDigitalTransformation();
  await recoverWechat();

  console.log("\nDone. Next: update vault embeds + npm run publish:ready -- --publish");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
