---
title: Capturing UI Designs for AI Agents Creates a Prompt Injection Surface
slug: capturing-ui-designs-for-ai-agents-prompt-injection-risk
date: 2026-05-29
status: published
category: AI & Building
tags:
  - Agentic AI
  - AI Quality
  - Developer Tools
excerpt: Design capture CLIs that dump outerHTML into SKILL.md files can smuggle instructions. Sanitize at the trust boundary before agents read the DOM.
featured_image: /images/posts/composer-2-5-baseline-model-tighter-bootstrap-better-results.png
focus_keyword: ai agent ui capture prompt injection
seo_description: CLI tools that capture live UI into agent skills risk prompt injection via hidden DOM text. Sanitize outerHTML and treat design capture as an untrusted input boundary.
image_prompt: "Editorial 16:9 illustration: browser DOM tree with a hidden instruction note sneaking into a skill document, warm technical desk, no logos, no readable text."
image_prompt_variant_1: "Tiny factory: HTML snippets on conveyor pass through sanitizer gate before entering robot skill shelf, clever workshop, 16:9."
image_prompt_variant_2: "Split view: left raw outerHTML with stray script text, right cleaned capture with allowlist badge, editorial playful, 16:9."
---

Agent workflows that capture live UI into skill files or context bundles solve a real problem: the model sees what you see. They also create a new trust boundary. Anything in the DOM can become instructions if you paste outerHTML verbatim into a prompt.

I treat design capture the same way I treat user-generated content in a CMS: sanitize before the agent reads it.

## The problem: DOM as prompt payload

A typical flow:

1. CLI or browser extension selects a component.
2. Tool serializes outerHTML, computed styles, or accessibility tree.
3. Output lands in SKILL.md, a canvas file, or chat context.
4. Agent follows "design system rules" embedded in hidden nodes or aria labels.

Attack or accident paths include:

- `display:none` blocks with "ignore previous instructions"
- Data attributes copied from staging CMS with editorial notes
- Third-party widget markup with marketing copy the agent interprets as commands

## Why this matters for builder teams

Design capture accelerates UI parity work. One polluted capture can steer an agent to delete auth guards, swap API endpoints, or hardcode staging URLs across a repo.

The failure mode is subtle because the skill file looks like a legitimate design reference.

## Sanitization gate at capture time

```d2
direction: right

dom: "Live DOM\nuntrusted" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

strip: "Strip scripts\nhidden nodes" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

allow: "Allowlist tags\nand attrs" {
  style.fill: "#f5f7fa"
  style.stroke: "#d8dce6"
  style.border-radius: 8
}

skill: "SKILL.md\nagent reads" {
  style.fill: "#fff8f5"
  style.stroke: "#ff6a3d"
  style.border-radius: 8
}

dom -> strip -> allow -> skill
```

Practical rules:

1. Remove script, iframe, template, and svg foreignObject unless explicitly needed.
2. Drop elements with `hidden`, `aria-hidden=true`, or `display:none` in computed style.
3. Allowlist attributes: class, role, href, src, alt, data-testid. Strip data-* editorial fields.
4. Truncate text nodes to N characters per element; agents need structure, not full marketing copy.
5. Hash the sanitized output and log it in the skill header so drift is visible in git diff.

## Separate design tokens from narrative

Prefer capturing:

- CSS variables and token JSON
- Component prop interfaces
- Screenshots with redacted text

Avoid dumping entire marketing pages into skills. Section-level capture beats page-level capture.

## Human review hook

For high-risk repos, require a human ack line in the skill file footer: `reviewed_by: human, date: ...` before agents use it in autonomous mode.

## Testing the sanitizer

Maintain a fixture file of malicious and noisy HTML snippets. Your capture CLI tests should assert:

1. Injection strings in hidden divs never appear in output.
2. Allowed components still preserve class names and layout hierarchy.
3. Output byte size stays under a ceiling so skills do not bloat context.

Run the fixture in CI on every change to the capture tool, not only on agent prompt changes.

## What you can do next

1. Audit existing SKILL.md files for raw HTML pasted from production pages.
2. Add a sanitizer step to your capture CLI with tests for injection strings.
3. Document which sites are safe to capture from (staging vs prod).
4. Run a red-team string through a hidden div and confirm it never reaches the agent context.

Useful design capture is bounded capture. Treat the DOM as untrusted input.

Store captures in version control so diffs show when a hidden node appeared between sessions. Agents are not the only readers of skill files. Humans auditing injection risk need readable git history too. Treat every capture export as a security review artifact.

**Sources**

1. OWASP, "Prompt injection." https://owasp.org/www-project-top-10-for-large-language-model-applications/
