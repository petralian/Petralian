#!/usr/bin/env node
/**
 * Live sitemap crawl (WebSite Auditor substitute) — HEAD each URL in sitemap.xml.
 * Usage: node scripts/audit-live-sitemap.mjs [--site https://petralian.com]
 */
const site =
  process.argv.find((a, i) => process.argv[i - 1] === "--site") ||
  "https://petralian.com";

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function head(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    return { url, status: res.status, ok: res.ok, final: res.url };
  } catch (e) {
    return { url, status: 0, ok: false, error: String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

const xml = await fetchText(`${site}/sitemap.xml`);
const locs = parseLocs(xml);
console.log(`Sitemap URLs: ${locs.length}\n`);

const results = [];
for (const url of locs) {
  results.push(await head(url));
  process.stdout.write(results.at(-1).ok ? "." : "X");
}
console.log("\n");

const bad = results.filter((r) => !r.ok);
if (bad.length) {
  console.log(`Failed: ${bad.length}\n`);
  for (const r of bad) {
    console.log(`${r.status} ${r.url}${r.error ? ` — ${r.error}` : ""}`);
  }
  process.exit(1);
}

console.log("All sitemap URLs returned 2xx/3xx.");
