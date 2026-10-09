#!/usr/bin/env node
/**
 * scripts/obsidian-mcp-server.mjs
 *
 * Desk: optional MCP bridge to Petralian vault on D:\ (Official Obsidian Sync).
 * Also: native Read/Write per obsidian-vault-io.mdc. Cloud: vault-petralian + Dashboard Obsidian MCP.
 *
 * CLI fallback: obsidian-mcp-cli.mjs
 *
 *   obsidian_append   — append text to any note under the Petralian Obsidian vault.
 *   obsidian_read     — read the contents of a vault note.
 *   obsidian_write    — overwrite a note (use sparingly).
 */

import { createInterface } from "node:readline";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve, normalize } from "node:path";

// ── Vault root — only paths inside here are accessible ─────────────────────
const EXPECTED_VAULT_ROOT = normalize(resolve("D:\\Obsidian\\Obsidian\\40_VSCode\\Petralian"));
const requestedVaultRoot = process.env.PETRALIAN_OBSIDIAN_VAULT_ROOT || EXPECTED_VAULT_ROOT;
const VAULT_ROOT = normalize(resolve(requestedVaultRoot));

// Fail closed if the runtime root ever drifts away from the VSCode vault.
if (VAULT_ROOT !== EXPECTED_VAULT_ROOT || /40_Projects/i.test(VAULT_ROOT)) {
  throw new Error(
    `Unsafe VAULT_ROOT '${VAULT_ROOT}'. Expected '${EXPECTED_VAULT_ROOT}' under 40_VSCode.`
  );
}

// ── MCP protocol helpers ────────────────────────────────────────────────────
function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function ok(id, content) {
  send({
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: content }],
      isError: false,
    },
  });
}

function err(id, message) {
  send({
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    },
  });
}

// ── Path safety: must stay inside VAULT_ROOT ────────────────────────────────
function safePath(relPath) {
  if (!relPath || typeof relPath !== "string") throw new Error("path is required");
  const target = normalize(join(VAULT_ROOT, relPath.replace(/\//g, "\\")));
  if (!target.startsWith(VAULT_ROOT + "\\") && target !== VAULT_ROOT) {
    throw new Error("path escapes vault root");
  }
  return target;
}

function toPosixRel(relPath) {
  return relPath.replace(/\\/g, "/");
}

/** Binary writes only under Blog attachment folders (not arbitrary vault paths). */
function safeAttachmentPath(relPath) {
  const target = safePath(relPath);
  const rel = toPosixRel(relPath);
  const ok =
    /^Blog\/00 Attachments\//.test(rel) ||
    /^Blog\/[^/]+\/Attachments\//.test(rel);
  if (!ok) {
    throw new Error(
      "write_attachment only allowed under Blog/**/Attachments/ or Blog/00 Attachments/"
    );
  }
  return target;
}

// ── Tool: obsidian_read ─────────────────────────────────────────────────────
function toolRead({ path: relPath }) {
  const target = safePath(relPath);
  if (!existsSync(target)) return `Note not found: ${relPath}`;

  // Check if path is a directory
  const stats = statSync(target);
  if (stats.isDirectory()) {
    return `Error: Path is a directory, not a file: ${relPath}\nPlease specify a file path (e.g., "${relPath}/filename.md")`;
  }

  return readFileSync(target, "utf8");
}

// ── Tool: obsidian_append ───────────────────────────────────────────────────
function toolAppend({ path: relPath, content }) {
  if (!content || typeof content !== "string") throw new Error("content is required");
  const target = safePath(relPath);
  const dir = dirname(target);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const existing = existsSync(target) ? readFileSync(target, "utf8") : "";
  const separator = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
  writeFileSync(target, existing + separator + content, "utf8");
  return `Appended ${content.length} characters to ${relPath}`;
}

// ── Tool: obsidian_write (full overwrite — use sparingly) ───────────────────
function toolWrite({ path: relPath, content }) {
  if (!content || typeof content !== "string") throw new Error("content is required");
  const target = safePath(relPath);
  const dir = dirname(target);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(target, content, "utf8");
  return `Written ${content.length} characters to ${relPath}`;
}

// ── Tool: obsidian_git_pull ─────────────────────────────────────────────────
function toolGitPull({ branch = "master" } = {}) {
  if (!existsSync(join(VAULT_ROOT, ".git"))) {
    throw new Error(`Not a git repo: ${VAULT_ROOT} (obsidian-git / petralian-private checkout)`);
  }
  const b = String(branch || "master");
  execFileSync("git", ["fetch", "origin", b], { cwd: VAULT_ROOT, encoding: "utf8" });
  const out = execFileSync("git", ["pull", "--ff-only", "origin", b], {
    cwd: VAULT_ROOT,
    encoding: "utf8",
  });
  const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: VAULT_ROOT,
    encoding: "utf8",
  }).trim();
  return `git pull origin ${b} OK @ ${head}\n${out}`.trim();
}

// ── Tool: obsidian_write_attachment (base64) ────────────────────────────────
function toolWriteAttachment({ path: relPath, base64 }) {
  if (!base64 || typeof base64 !== "string") throw new Error("base64 is required");
  const target = safeAttachmentPath(relPath);
  const buf = Buffer.from(base64, "base64");
  if (buf.length < 8) throw new Error("attachment too small or invalid base64");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buf);
  return `Wrote attachment ${relPath} (${buf.length} bytes)`;
}

// ── MCP handshake + dispatch ────────────────────────────────────────────────
const TOOLS = [
  {
    name: "obsidian_read",
    description: "Read the contents of a note in the Petralian Obsidian vault.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Vault-relative path, e.g. 'Operations/Session Summaries.md'",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "obsidian_append",
    description: "Append text to a note in the Petralian Obsidian vault. Creates the note if it does not exist.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Vault-relative path, e.g. 'Operations/Session Summaries.md'",
        },
        content: {
          type: "string",
          description: "Text to append. Include a leading newline if needed.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "obsidian_write",
    description: "Overwrite a note in the Petralian Obsidian vault. Use obsidian_append unless full overwrite is needed.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Vault-relative path, e.g. 'Operations/Sessions/2026-05-13 Setup.md'",
        },
        content: {
          type: "string",
          description: "Full note content to write.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "obsidian_git_pull",
    description:
      "Run git fetch + ff-only pull in the Petralian vault checkout (petralian-private). Use after cloud agent merges so Blog/01 Drafts/Attachments/ matches GitHub. Only works while this MCP host is online.",
    inputSchema: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          default: "master",
          description: "Remote branch to pull (default master).",
        },
      },
    },
  },
  {
    name: "obsidian_write_attachment",
    description:
      "Write a binary attachment under Blog/**/Attachments/ from base64. Safer than create_note on *.avif paths. Path vault-relative, e.g. Blog/01 Drafts/Attachments/slug.avif",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        base64: { type: "string", description: "Raw file bytes, base64-encoded." },
      },
      required: ["path", "base64"],
    },
  },
];

const rl = createInterface({ input: process.stdin, terminal: false });

rl.on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = msg;

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "petralian-obsidian-mcp", version: "1.0.0" },
      },
    });
    return;
  }

  if (method === "notifications/initialized") return;

  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    return;
  }

  if (method === "tools/call") {
    const { name, arguments: args } = params ?? {};
    try {
      let result;
      if (name === "obsidian_read") result = toolRead(args ?? {});
      else if (name === "obsidian_append") result = toolAppend(args ?? {});
      else if (name === "obsidian_write") result = toolWrite(args ?? {});
      else if (name === "obsidian_git_pull") result = toolGitPull(args ?? {});
      else if (name === "obsidian_write_attachment") result = toolWriteAttachment(args ?? {});
      else throw new Error(`Unknown tool: ${name}`);
      ok(id, result);
    } catch (e) {
      err(id, e.message);
    }
    return;
  }

  send({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
});
