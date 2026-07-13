#!/usr/bin/env node
/**
 * Audit (and optionally fix) Cloudflare DNS for petralian.com → Vercel.
 * Usage:
 *   node scripts/audit-cloudflare-dns.mjs
 *   node scripts/audit-cloudflare-dns.mjs --fix
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const DOMAIN = "petralian.com";
const FIX = process.argv.includes("--fix");

function loadToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  if (!fs.existsSync(ENV_PATH)) throw new Error("No CLOUDFLARE_API_TOKEN and no .env");
  const line = fs
    .readFileSync(ENV_PATH, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("CLOUDFLARE_API_TOKEN="));
  if (!line) throw new Error("CLOUDFLARE_API_TOKEN not in .env");
  return line.slice("CLOUDFLARE_API_TOKEN=".length).trim();
}

async function cf(token, method, apiPath, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(
      `Cloudflare API ${method} ${apiPath}: ${JSON.stringify(json.errors)}`
    );
  }
  return json.result;
}

async function main() {
  const token = loadToken();
  const zones = await cf(token, "GET", `/zones?name=${DOMAIN}`);
  if (!zones.length) throw new Error(`Zone not found: ${DOMAIN}`);
  const zone = zones[0];
  console.log(`Zone: ${zone.name} (${zone.id})`);
  console.log(`Status: ${zone.status}`);

  try {
    const settings = await cf(
      token,
      "GET",
      `/zones/${zone.id}/settings/ssl`
    );
    console.log(`SSL mode: ${settings.value}`);
  } catch {
    console.log("SSL mode: (token lacks Zone Settings read — skip)");
  }

  const records = await cf(
    token,
    "GET",
    `/zones/${zone.id}/dns_records?per_page=100`
  );

  const byType = {};
  for (const r of records) {
    (byType[r.type] ||= []).push(r);
  }

  console.log("\n--- DNS records ---");
  for (const r of records.sort((a, b) => a.type.localeCompare(b.type))) {
    const proxy = r.proxied ? "proxied" : "dns-only";
    console.log(
      `${r.type.padEnd(6)} ${r.name.padEnd(24)} → ${r.content.padEnd(40)} ${proxy}`
    );
  }

  const issues = [];
  const apexA = records.filter(
    (r) => r.type === "A" && r.name === DOMAIN
  );
  const apexCname = records.find(
    (r) => r.type === "CNAME" && r.name === DOMAIN
  );
  const wwwCname = records.find(
    (r) => r.type === "CNAME" && r.name === `www.${DOMAIN}`
  );
  const gscTxt = records.filter(
    (r) =>
      r.type === "TXT" &&
      r.name === DOMAIN &&
      r.content.includes("google-site-verification")
  );
  const staleNs = records.filter(
    (r) =>
      r.type === "NS" &&
      r.name === DOMAIN &&
      (r.content.includes("registrar-servers.com") ||
        r.content.includes("domaincontrol.com"))
  );

  if (!apexA.length && !apexCname) issues.push("Missing apex @ record (A or CNAME to Vercel)");
  if (apexCname && !apexCname.content.includes("vercel-dns")) {
    issues.push(`Apex CNAME does not point to Vercel: ${apexCname.content}`);
  }
  if (!wwwCname) issues.push("Missing www CNAME");
  if (wwwCname && !wwwCname.content.includes("vercel-dns")) {
    issues.push(`www CNAME does not point to Vercel: ${wwwCname.content}`);
  }
  if (wwwCname?.proxied) issues.push("www CNAME should be DNS-only (grey cloud) for Vercel");
  if (!gscTxt.length) issues.push("Missing google-site-verification TXT");
  if (staleNs.length) {
    issues.push(
      `${staleNs.length} stale NS record(s) pointing to old registrar — safe to remove`
    );
  }

  console.log("\n--- Checks ---");
  if (issues.length) {
    for (const i of issues) console.log(`⚠ ${i}`);
  } else {
    console.log("✓ Core DNS looks correct for Vercel + GSC");
  }

  if (FIX && wwwCname?.proxied) {
    console.log("\nFixing: set www CNAME to DNS-only...");
    await cf(token, "PATCH", `/zones/${zone.id}/dns_records/${wwwCname.id}`, {
      proxied: false,
    });
    console.log("✓ www CNAME proxied=false");
  }

  if (FIX && staleNs.length) {
    console.log(`\nRemoving ${staleNs.length} stale NS record(s)...`);
    for (const ns of staleNs) {
      await cf(token, "DELETE", `/zones/${zone.id}/dns_records/${ns.id}`);
      console.log(`✓ Deleted NS → ${ns.content}`);
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
