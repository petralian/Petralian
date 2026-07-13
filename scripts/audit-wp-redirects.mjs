#!/usr/bin/env node
/**
 * Spot-check WordPress legacy redirects on live site.
 * Usage: node scripts/audit-wp-redirects.mjs [--site https://petralian.com]
 */
const site =
  process.argv.find((a, i) => process.argv[i - 1] === "--site") ||
  "https://petralian.com";

const CASES = [
  { path: "/services/branding/", expectFinal: "/about" },
  { path: "/tag/shopify/", expectFinal: "/posts" },
  { path: "/nl/", expectFinal: "/" },
  { path: "/8/", expectFinal: "/posts" },
  { path: "/feed", expectFinal: "/feed.xml" },
  { path: "/category/ai/", expectFinal: "/posts" },
  { path: "/author/nathan/", expectFinal: "/about" },
];

async function follow(path) {
  const url = `${site}${path}`;
  const chain = [];
  let current = url;
  for (let i = 0; i < 10; i++) {
    const res = await fetch(current, { redirect: "manual" });
    chain.push({ url: current, status: res.status });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      current = new URL(loc, current).href;
      continue;
    }
    return { final: current, status: res.status, chain };
  }
  return { final: current, status: 0, chain, error: "too many redirects" };
}

console.log(`WP redirect audit: ${site}\n`);

let failed = 0;
for (const { path, expectFinal } of CASES) {
  const { final, status, chain } = await follow(path);
  const finalPath = new URL(final).pathname.replace(/\/$/, "") || "/";
  const expectPath = expectFinal.replace(/\/$/, "") || "/";
  const ok =
    (status === 200 || status === 308) &&
    (finalPath === expectPath || finalPath.startsWith(expectPath + "/"));
  if (!ok) failed++;
  const icon = ok ? "✓" : "✗";
  console.log(
    `${icon} ${path} → ${status} ${finalPath} (expected ${expectPath})`
  );
  if (!ok && chain.length > 1) {
    for (const hop of chain) console.log(`    ${hop.status} ${hop.url}`);
  }
}

console.log(failed ? `\n${failed} failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
