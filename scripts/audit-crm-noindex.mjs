#!/usr/bin/env node
/**
 * Verify crm.petralian.com is blocked from indexing.
 * Usage: node scripts/audit-crm-noindex.mjs
 */

const ROBOTS_URL = "https://crm.petralian.com/robots.txt";
const HOME_URL = "https://crm.petralian.com/";
const LOGIN_URL = "https://crm.petralian.com/authentication/login";

let failed = false;
let xRobotsOk = 0;

function pass(msg) {
  console.log(`✓ ${msg}`);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}

function warn(msg) {
  console.warn(`⚠ ${msg}`);
}

async function head(url) {
  return fetch(url, { method: "HEAD", redirect: "follow" });
}

async function get(url) {
  return fetch(url, { redirect: "follow" });
}

console.log("CRM noindex audit\n");

try {
  const robotsRes = await get(ROBOTS_URL);
  const robotsText = await robotsRes.text();
  if (robotsRes.status === 200 && /Disallow:\s*\//i.test(robotsText)) {
    pass(`robots.txt blocks all (${ROBOTS_URL})`);
  } else {
    fail(`robots.txt missing Disallow: / (${robotsRes.status})`);
  }

  for (const url of [HOME_URL, LOGIN_URL]) {
    const res = await head(url);
    const tag = res.headers.get("x-robots-tag") || res.headers.get("X-Robots-Tag");
    const server = res.headers.get("server") || "";
    if (tag && /noindex/i.test(tag)) {
      pass(`${url} → X-Robots-Tag: ${tag}`);
      xRobotsOk += 1;
    } else {
      warn(`${url} → no X-Robots-Tag (server: ${server || "unknown"})`);
      if (/nginx/i.test(server)) {
        warn(
          "  CRM is nginx — .htaccess does not apply. Add docs/seo/crm-deploy/nginx-noindex.conf to server block.",
        );
      }
    }
  }

  const loginRes = await get(LOGIN_URL);
  const html = await loginRes.text();
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) {
    pass("login page has meta robots noindex");
  } else if (!failed) {
    warn(
      "login page has no meta robots noindex — optional when nginx X-Robots-Tag is present",
    );
  }
} catch (err) {
  fail(String(err.message || err));
}

if (failed) process.exit(1);

if (xRobotsOk >= 2) {
  console.log("\nPass — robots.txt + X-Robots-Tag present. Meta robots optional.");
} else {
  console.log(
    "\nPartial pass — robots.txt OK; add nginx X-Robots-Tag for full coverage.",
  );
}
