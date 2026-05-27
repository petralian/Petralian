#!/usr/bin/env node
/**
 * Renders public/diagram-compare/four-tier-memory.{mmd,d2} to SVG for side-by-side review.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "diagram-compare");
const mmd = join(dir, "four-tier-memory.mmd");
const d2 = join(dir, "four-tier-memory.d2");
const config = join(dir, "mermaid-config.json");
const mermaidOut = join(dir, "four-tier-memory-mermaid.svg");
const d2Out = join(dir, "four-tier-memory-d2.svg");

console.log("Rendering Mermaid (neo)…");
execSync(
  `npx -y @mermaid-js/mermaid-cli -i "${mmd}" -o "${mermaidOut}" -c "${config}" -b transparent`,
  { stdio: "inherit", cwd: dir },
);

console.log("Rendering D2 (Kroki, vertical TB)…");
const body = readFileSync(d2, "utf8");
const res = await fetch("https://kroki.io/d2/svg", {
  method: "POST",
  headers: { "Content-Type": "text/plain; charset=utf-8" },
  body,
});
if (!res.ok) {
  throw new Error(`Kroki D2 failed: ${res.status} ${await res.text()}`);
}
writeFileSync(d2Out, Buffer.from(await res.arrayBuffer()));

console.log("\nDone. Open:");
console.log(`  file://${join(dir, "index.html").replace(/\\/g, "/")}`);
console.log("  or http://localhost:3000/diagram-compare/ (with dev server running)");
