#!/usr/bin/env node
/**
 * CLI wrapper for Petralian Obsidian vault tools (same paths/rules as obsidian-mcp-server.mjs).
 * Usage:
 *   node scripts/obsidian-mcp-cli.mjs read  "Operations/AI Session Bridge.md"
 *   node scripts/obsidian-mcp-cli.mjs write "Blog/00 Ideas/foo.md" --file content.md
 *   node scripts/obsidian-mcp-cli.mjs append "Operations/Session Summaries.md" "new line"
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
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

function safeAttachmentPath(relPath) {
  const target = safePath(relPath);
  const rel = relPath.replace(/\\/g, "/");
  const ok =
    /^Blog\/00 Attachments\//.test(rel) ||
    /^Blog\/[^/]+\/Attachments\//.test(rel);
  if (!ok) throw new Error("write-attachment only under Blog/**/Attachments/");
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
  } else if (cmd === "git-pull") {
    const branch = rest[0] || "master";
    execFileSync("git", ["fetch", "origin", branch], { cwd: VAULT_ROOT, encoding: "utf8" });
    const out = execFileSync("git", ["pull", "--ff-only", "origin", branch], {
      cwd: VAULT_ROOT,
      encoding: "utf8",
    });
    console.log(out);
  } else if (cmd === "write-attachment") {
    const fileFlag = rest.indexOf("--file");
    if (fileFlag < 0) throw new Error("write-attachment requires --file <path>");
    const buf = readFileSync(rest[fileFlag + 1]);
    const target = safeAttachmentPath(relPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buf);
    console.log(`Wrote ${relPath} (${buf.length} bytes)`);
  } else if (cmd === "append") {
    const content = rest.join(" ");
    const target = safePath(relPath);
    mkdirSync(dirname(target), { recursive: true });
    const existing = existsSync(target) ? readFileSync(target, "utf8") : "";
    const sep = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
    writeFileSync(target, existing + sep + content, "utf8");
    console.log(`Appended to ${relPath}`);
  } else {
    console.error(
      "Usage: read|write|append|git-pull|write-attachment <vault-path> [--file path] [content]"
    );
    process.exit(1);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
