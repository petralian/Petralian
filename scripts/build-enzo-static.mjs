#!/usr/bin/env node
/**
 * Build static files for enzo.petralian.com → enzo-static-out/
 * Usage: node scripts/build-enzo-static.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "enzo-static-out");
const content = JSON.parse(fs.readFileSync(path.join(ROOT, "data/enzo-site.json"), "utf8"));

const MARQUEE =
  " ★ CERTIFIED HANDSOME ★ HONG KONG REGISTRY ★ ENZO!!! ★ NO APPEALS ★ ";

const SEAL_SVG = `<svg class="enzo-hero__seal" viewBox="0 0 120 120" role="img" aria-label="Cool sunglasses doodle">
  <circle cx="60" cy="60" r="54" fill="#ffe566" stroke="#1a0f2e" stroke-width="4"/>
  <ellipse cx="42" cy="58" rx="22" ry="16" fill="#1a0f2e"/>
  <ellipse cx="78" cy="58" rx="22" ry="16" fill="#1a0f2e"/>
  <path d="M64 58 H56" stroke="#1a0f2e" stroke-width="3"/>
  <path d="M18 52 Q8 58 18 64" fill="none" stroke="#1a0f2e" stroke-width="3" stroke-linecap="round"/>
  <path d="M102 52 Q112 58 102 64" fill="none" stroke="#1a0f2e" stroke-width="3" stroke-linecap="round"/>
  <path d="M38 82 Q60 98 82 82" fill="none" stroke="#1a0f2e" stroke-width="4" stroke-linecap="round"/>
</svg>`;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const tableRows = content.hkBestRows
  .map(
    (row) =>
      `<tr><td>${esc(row.label)}</td><td>${esc(row.value)}</td></tr>`
  )
  .join("\n");

const galleryCards = content.gallery
  .map(
    (item) => `
    <article class="enzo-card">
      <div class="enzo-card__ribbon">${esc(item.award)}</div>
      <div class="enzo-card__photo-wrap">
        <img src="images/enzo/${esc(item.file)}" alt="${esc(item.alt)}" class="enzo-card__photo" loading="lazy" width="800" height="1000"/>
      </div>
      <div class="enzo-card__body"><p>${esc(item.caption)}</p></div>
    </article>`
  )
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Most Handsome Man in Hong Kong — Official* Registry</title>
  <meta name="description" content="A totally serious glamour board celebrating Enzo, self-certified Hong Kong superlative per Grade 4 humanities homework."/>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body class="enzo-site">
  <div class="enzo-marquee" aria-hidden="true">
    <span class="enzo-marquee__track">${esc(MARQUEE.repeat(4))}</span>
  </div>
  <header class="enzo-hero">
    <span class="enzo-sparkle enzo-sparkle--1" aria-hidden="true"></span>
    <span class="enzo-sparkle enzo-sparkle--2" aria-hidden="true"></span>
    <span class="enzo-sparkle enzo-sparkle--3" aria-hidden="true"></span>
    ${SEAL_SVG}
    <p class="enzo-hero__badge">Hong Kong's Best · Challenge Question ★</p>
    <h1>Most Handsome Man in Hong Kong</h1>
    <p class="enzo-hero__subtitle">Primary source: Enzo's own homework. Peer review pending since forever. This is a family glamour board — not an actual government registry (obviously).</p>
  </header>
  <section class="enzo-worksheet" aria-labelledby="worksheet-heading">
    <div class="enzo-worksheet__frame">
      <h2 id="worksheet-heading">Exhibit A — The Original Filing</h2>
      <img src="images/enzo/${esc(content.worksheetImage)}" alt="School worksheet listing Hong Kong superlatives with Enzo named most handsome man" class="enzo-worksheet__img" width="897" height="1200"/>
      <table class="enzo-table">
        <thead><tr><th scope="col">The best in Hong Kong</th><th scope="col">Name</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </section>
  <section class="enzo-gallery" aria-labelledby="gallery-heading">
    <h2 id="gallery-heading">Glamour Board · Evidence Locker</h2>
    <div class="enzo-gallery__grid">${galleryCards}</div>
  </section>
  <footer class="enzo-footer">
    <p>*Not affiliated with the HKSAR, ICC, or any real beauty contest. Made with love by Dad.</p>
    <p><a href="https://petralian.com/">petralian.com</a> · <a href="https://${esc(content.host)}">https://${esc(content.host)}</a></p>
  </footer>
</body>
</html>
`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "images/enzo"), { recursive: true });

const cssSrc = fs.readFileSync(path.join(ROOT, "src/app/enzo/enzo-site.css"), "utf8");
const css = cssSrc.replace(
  /^\.enzo-site \{/m,
  `body.enzo-site {\n  margin: 0;\n  font-family: "Georgia", "Times New Roman", serif;`
);

fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "styles.css"), css);

const imgDir = path.join(ROOT, "public/images/enzo");
for (const name of fs.readdirSync(imgDir)) {
  fs.copyFileSync(path.join(imgDir, name), path.join(OUT, "images/enzo", name));
}

console.log(`Built ${OUT} (${content.gallery.length} gallery images)`);
