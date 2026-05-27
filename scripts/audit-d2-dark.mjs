import { readFileSync, writeFileSync } from "node:fs";
import { wrapD2Chart } from "../src/lib/d2-design-system.ts";

const charts = [
  ["four-tier", "content/diagrams/snippets/four-tier-memory.d2"],
  ["infographic", "content/diagrams/snippets/infographic-vs-system.d2"],
];

for (const [name, path] of charts) {
  const chart = readFileSync(path, "utf8");
  const body = wrapD2Chart(chart);
  const res = await fetch("https://kroki.io/d2/svg", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
  });
  const svg = await res.text();
  console.log(`\n=== ${name} status ${res.status} len ${svg.length} ===`);

  if (res.status !== 200) {
    console.log(svg.slice(0, 200));
    continue;
  }

  const fills = [...svg.matchAll(/fill="(#[^"]+)"/gi)].map((m) => m[1]);
  const counts = {};
  for (const f of fills) counts[f] = (counts[f] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log("top fills:", top);

  for (const label of ["Layer 1", "Agent chat", "Chat", "STM"]) {
    const i = svg.indexOf(label);
    if (i < 0) continue;
    const chunk = svg.slice(Math.max(0, i - 600), i + 200);
    const rectFills = [...chunk.matchAll(/<rect[^>]*fill="([^"]+)"/g)].map((m) => m[1]);
    const textFills = [...chunk.matchAll(/<text[^>]*fill="([^"]+)"/g)].map((m) => m[1]);
    console.log(`  ${label}: rects`, [...new Set(rectFills)], "text", [...new Set(textFills)]);
  }

  writeFileSync(`scripts/audit-${name}-dark.svg`, svg);
}
