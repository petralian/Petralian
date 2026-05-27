#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const snip = (name) =>
  readFileSync(join(root, "content/diagrams/snippets", `${name}.d2`), "utf8").trim();

const d2 = (body) => "```d2\n" + body + "\n```";

const rules = [
  {
    test: /```mermaid[\s\S]*?Layer 4 — Feedback hardened[\s\S]*?L3 --> L1\n```/,
    body: snip("four-tier-memory"),
  },
  {
    test: /```mermaid[\s\S]*?Layer 4 — Rules hooks and feedback[\s\S]*?L3 --> L1\n```/,
    body: snip("series-four-layers"),
  },
  {
    test: /```mermaid[\s\S]*?subgraph tools[\s\S]*?L2 --> TASKS\n```/,
    body: snip("memory-layers-productivity"),
  },
  {
    test: /```mermaid[\s\S]*?USER\[User\] --> STM[\s\S]*?LTM --> STM\n```/,
    body: snip("arch-in-model"),
  },
  {
    test: /```mermaid[\s\S]*?USER\[User\] --> CHAT[\s\S]*?OPS --> CHAT\n```/,
    body: snip("arch-external-files"),
  },
  {
    test: /```mermaid[\s\S]*?subgraph INFO[\s\S]*?F --> D\n```/,
    body: snip("infographic-vs-system"),
  },
];

const dirs = [
  join(root, "content", "posts"),
  "D:\\Obsidian\\Obsidian\\40_VSCode\\Petralian\\Blog\\02 Ready to publish",
];

for (const dir of dirs) {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue;
    const path = join(dir, name);
    if (!statSync(path).isFile()) continue;
    let text = readFileSync(path, "utf8");
    if (!text.includes("```mermaid")) continue;
    let n = 0;
    for (const { test, body } of rules) {
      text = text.replace(test, () => {
        n++;
        return d2(body);
      });
    }
    if (n > 0) {
      writeFileSync(path, text);
      console.log(path, `(${n} diagram(s))`);
    } else {
      console.warn("UNMATCHED mermaid in", path);
    }
  }
}
