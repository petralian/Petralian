#!/usr/bin/env node
/**
 * CLI wrapper for Petralian Obsidian vault tools (same paths/rules as obsidian-mcp-server.mjs).
 * Usage:
 *   node scripts/obsidian-mcp-cli.mjs read  "Operations/AI Session Bridge.md"
 *   node scripts/obsidian-mcp-cli.mjs write "Blog/00 Ideas/foo.md" --file content.md
 *   node scripts/obsidian-mcp-cli.mjs append "Operations/Session Summaries.md" "new line"
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve, normalize } from "node:path";

const EXPECTED_VAULT_ROOT = normalize(resolve("D:\\Obsidian\\Obsidian\\40_VSCode\\Petralian"));
const VAULT_ROOT = normalize(
  resolve(process.env.PETRALIAN_OBSIDIAN_VAULT_ROOT || EXPECTED_VAULT_ROOT)
);

if (VAULT_ROOT !== EXPECTED_VAULT_ROOT) {
  console.error(`Unsafe VAULT_ROOT: ${VAULT_ROOT}`);
  process.exit(1);
}

function safePath(relPath) {
  const target = normalize(join(VAULT_ROOT, relPath.replace(/\//g, "\\")));
  if (!target.startsWith(VAULT_ROOT + "\\") && target !== VAULT_ROOT) {
    throw new Error("path escapes vault root");
  }
  return target;
}

const [, , cmd, relPath, ...rest] = process.argv;

try {
  if (cmd === "read") {
    const target = safePath(relPath);
    if (!existsSync(target)) {
      console.error(`Not found: ${relPath}`);
      process.exit(1);
    }
    process.stdout.write(readFileSync(target, "utf8"));
  } else if (cmd === "write") {
    const fileFlag = rest.indexOf("--file");
    const content =
      fileFlag >= 0
        ? readFileSync(rest[fileFlag + 1], "utf8")
        : rest.join(" ");
    const target = safePath(relPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, "utf8");
    console.log(`Written ${relPath} (${content.length} chars)`);
  } else if (cmd === "append") {
    const content = rest.join(" ");
    const target = safePath(relPath);
    mkdirSync(dirname(target), { recursive: true });
    const existing = existsSync(target) ? readFileSync(target, "utf8") : "";
    const sep = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
    writeFileSync(target, existing + sep + content, "utf8");
    console.log(`Appended to ${relPath}`);
  } else {
    console.error("Usage: read|write|append <vault-relative-path> [content|--file path]");
    process.exit(1);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
