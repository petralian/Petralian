#!/usr/bin/env node
/**
 * Restructure dense playbook posts by demoting grouped H2 sections to H3 under chapter H2s.
 * Usage: node scripts/restructure-playbook-posts.mjs [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const REPO_POSTS = path.join(__dir, "..", "content", "posts");
const VAULT_PUBLISHED = path.join(
  "D:",
  "Obsidian",
  "Obsidian",
  "40_VSCode",
  "Petralian",
  "Blog",
  "03 Published",
);

/** slug → { chapterTitle: [exact H2 titles to demote under it] } */
const PLAYBOOK_CHAPTERS = {
  "knowledge-work-engine-leadership-decisions-2026": {
    "Getting oriented": [
      "The problem: leadership AI without a record is rehearsal",
      "How to start with this playbook",
      "Who this is for",
      "Where this sits (leadership stack)",
    ],
    "Frameworks for purpose and decisions": [
      "Golden Circle → memory tiers (Sinek + applied AI)",
      "Drucker's decision discipline → advisory and commit",
      "RACI in the age of agents",
    ],
    "Advisory vs commit in practice": [
      "Two modes: advisory vs commit",
      "Decision note template",
      "Stakeholder map (Layer 3)",
      "Escalation and RAG (leadership lens)",
    ],
    "Day-to-day leadership workflows": [
      "Meeting prep and follow-up",
      "Harness + memory loop for leaders",
      "Voice for leadership comms",
      "Governance footer (Mode D)",
      "Applied AI thought leadership (five principles)",
    ],
    "Getting started": [
      "Beginner: one decision this week",
      "Advanced: decision index",
    ],
  },
  "knowledge-work-engine-project-management-2026": {
    "Getting oriented": [
      "The problem: initiatives die in chat threads",
      "Not a fourth PM tool: a complement layer",
    ],
    "Frameworks and delivery controls": [
      "How classic frameworks map to engine files",
      "Iron triangle: record tradeoffs, not math",
      "Triangle before",
      "Triangle after",
      "Owner",
      "RAG status: define the scale once",
      "RAID: risks, assumptions, issues, dependencies",
      "RACI: humans accountable, AI responsible only for drafts",
    ],
    "Running initiatives": [
      "Initiative file layout",
      "Jira: execution truth stays in Jira",
      "Confluence: publish for humans, files for agents",
      "Applied AI in delivery (thought leadership)",
      "Task tracker vs thinking layer",
      "Batch orchestrator (3+ workstreams)",
      "Milestone gate (Mode D)",
      "Complex requirements and review gates",
      "Real constraints",
    ],
  },
  "knowledge-work-engine-marketing-voice-2026": {
    "Getting oriented": [
      "The problem: every channel gets a different AI personality",
    ],
    "Brand voice system": [
      "Golden Circle for brand (Why → How → What)",
      "Voice is a system: Define, Enforce, Measure",
      "Machine-readable voice guide (not \"be approachable\")",
      "Editorial file layout",
      "CONTENT-ROUTING.md (high output, minimum effort)",
      "Governed prompt library (Define layer)",
      "Atomization: one Why, many Whats",
      "Pre-publish checklist (Enforce layer)",
      "Measure: voice fidelity without vibes",
      "Consistency across tools",
      "Harness + memory loop for marketing",
      "SEO and GEO for marketing teams",
      "Myth vs reality (AI marketing)",
    ],
  },
  "knowledge-work-agent-engine-guide-2026": {
    "Replication kit": [
      "Replication kit (give this to an AI)",
      "Folder scaffold",
      "WORK-ROUTING.md template",
      "voice-guide.md minimum (10 bullets)",
      "Bootstrap block (_session_startup.md)",
      "Current priority",
      "Open loops",
      "Next physical action",
      "Status",
      "This week",
      "Blockers",
      "Decisions pending",
      "Links",
      "Context",
      "Options considered",
      "Decision",
      "Who was informed",
      "Review date",
    ],
    "Getting oriented": [
      "The problem: chat is not a program office",
      "Why it matters (four outcomes)",
      "Where this sits among PM frameworks",
    ],
    "Engine components": [
      "What the engine is (six components)",
      "Coding → knowledge work translation",
      "Advanced: harness patterns without code",
      "How the series continues",
      "Myth vs reality (knowledge work AI)",
    ],
  },
  "why-file-memory-beats-the-three-layer-diagram-for-builders": {
    "Memory model": [
      "The three-layer diagram (what it gets right)",
      "Why the diagram breaks in practice",
      "File memory as the durable layer",
      "Session handoffs vs long-term memory",
    ],
    "Implementation": [
      "What to store where",
      "How agents load memory",
      "Footer contract and gates",
      "Obsidian vs repo memory",
    ],
  },
  "three-layer-external-brain-for-ai-first-development": {
    "Architecture": [
      "Layer 1: Short-term context",
      "Layer 2: Operational memory",
      "Layer 3: Evergreen knowledge",
      "Layer 4: Feedback loop",
    ],
  },
  "cursorbench-fable-5-composer-2-5-cost-vs-score": {
    "Benchmark design": [
      "Methodology",
      "Task selection",
      "Scoring rubric",
      "Cost model",
    ],
  },
  "obsidian-memory-layers-personal-productivity-beyond-chat": {
    "Memory tiers": [
      "Tier 1: Session",
      "Tier 2: Operational",
      "Tier 3: Evergreen",
      "Tier 4: Feedback",
    ],
  },
  "how-gravio-scoring-engine-was-built": {
    "Engine design": [
      "Architecture overview",
      "Scoring pipeline",
      "Data model",
      "UI integration",
    ],
  },
  "github-copilot-vs-openrouter-real-cost-comparison-for-developers": {
    "Cost analysis": [
      "Methodology",
      "Token economics",
      "Subscription vs API",
      "Break-even scenarios",
    ],
  },
  "how-i-built-the-petralian-weekly-digest-on-brevo-free": {
    "Implementation": [
      "Architecture",
      "Brevo setup",
      "GitHub Actions workflow",
      "Template design",
    ],
  },
  "boutiques-agencies-consultancies-digital-transformation-roi": {
    "ROI framework": [
      "Engagement models",
      "Value drivers",
      "Measurement",
      "Case patterns",
    ],
  },
};

function titleToPattern(title) {
  return title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function restructureContent(content, chapters) {
  const childToParent = new Map();
  for (const [parent, children] of Object.entries(chapters)) {
    for (const child of children) {
      childToParent.set(child.trim().toLowerCase(), parent);
    }
  }

  const lines = content.split(/\r?\n/);
  const out = [];
  const insertedParents = new Set();
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^## (.+)$/);
    if (m) {
      const title = m[1].trim();
      const parent = childToParent.get(title.toLowerCase());
      if (parent) {
        if (!insertedParents.has(parent)) {
          if (out.length > 0 && out[out.length - 1] !== "") out.push("");
          out.push(`## ${parent}`, "");
          insertedParents.add(parent);
        }
        out.push(`### ${title}`);
        i++;
        while (i < lines.length && !/^## /.test(lines[i])) {
          out.push(lines[i]);
          i++;
        }
        continue;
      }
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n");
}

function countH2(content) {
  return content.split(/\r?\n/).filter((l) => /^## /.test(l)).length;
}

function processFile(filePath, dryRun) {
  const slug = path.basename(filePath, ".md");
  const chapters = PLAYBOOK_CHAPTERS[slug];
  if (!chapters) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const before = countH2(parsed.content);
  const next = restructureContent(parsed.content, chapters);
  const after = countH2(next);
  if (next === parsed.content) return null;

  const out = matter.stringify(next, parsed.data);
  if (!dryRun) fs.writeFileSync(filePath, out, "utf8");
  return { slug, before, after };
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const dirs = [REPO_POSTS];
  if (fs.existsSync(VAULT_PUBLISHED)) dirs.push(VAULT_PUBLISHED);

  const results = [];
  for (const dir of dirs) {
    for (const slug of Object.keys(PLAYBOOK_CHAPTERS)) {
      const fp = path.join(dir, `${slug}.md`);
      if (!fs.existsSync(fp)) continue;
      const r = processFile(fp, dryRun);
      if (r) results.push(r);
    }
  }
  console.log(dryRun ? "[dry-run] " : "", `Restructured ${results.length} file instances`);
  for (const r of results) {
    console.log(`  ${r.slug}: H2 ${r.before} → ${r.after}`);
  }
}

main();
