---
title: From Empty Folder to First Quality Score in 10 Minutes
slug: first-gravio-score-in-10-minutes
date: 2026-05-11T00:00:00.000Z
tags:
  - Gravio
  - Agentic AI
  - Developer Tools
excerpt: >-
  A practical, no-fluff walkthrough for getting Gravio running from a clean
  folder to your first quality score, including the exact command flow and
  common mistakes.
featured_image: /images/posts/first-gravio-score-in-10-minutes.png
focus_keyword: gravio setup guide
seo_description: >-
  Follow a step-by-step Gravio onboarding guide from zero setup to first AI
  quality score in about 10 minutes, with troubleshooting tips for common
  friction…
image_prompt: >-
  A clean developer desktop with terminal commands and checklist steps floating
  as UI cards, bright neutral lighting, modern technical illustration, subtle
  green success accents, no text
featured_image_alt: A clean developer desktop with terminal commands and checklist steps
format: hands-on
best_for: Builders trying Gravio scoring on a real repo in one sitting
seo_title: From Empty Folder to First Quality Score in 10 Minutes
---

> **External Memory Series** — File-based memory for AI-assisted work ([overview](/posts/external-memory-series-guide) · [1 Implementation](/posts/three-layer-external-brain-for-ai-first-development) · [2 Productivity](/posts/obsidian-memory-layers-personal-productivity-beyond-chat) · [3 vs the diagram](/posts/why-file-memory-beats-the-three-layer-diagram-for-builders) · [4 Governance](/posts/why-deliberate-file-memory-beats-hoping-agents-remember))
# From Empty Folder to First Quality Score in 10 Minutes

If you are trying Gravio for the first time, speed matters. You want value fast, and you do not want onboarding confusion around project naming, repeated auth steps, or token placeholders.

This guide gives you the practical path from empty folder to first score.

## The 3-Step Reality

A lot of tools overcomplicate onboarding. Gravio works best when you keep it simple:

1. Download CLI and run setup once.
2. Authorize the folder once with your user API key.
3. Run a local scan.

That is it.

## Step 1: Download CLI and Setup

Windows:

```powershell
Invoke-WebRequest https://gravio.dev/cli/gravio.mjs -OutFile gravio.mjs
node gravio.mjs --setup --target .
```

macOS/Linux:

```bash
curl -fsSL https://gravio.dev/cli/gravio.mjs -o gravio.mjs
node gravio.mjs --setup --target .
```

This prepares the folder so later scans are consistent.

## Step 2: Authorize the Folder Once

```bash
node gravio.mjs --authorize --target . --project <name> --server https://gravio.dev --api-key <YOUR_USER_KEY>
```

Important details:

1. API key is user-bound, not project-bound.
2. Authorization is one-time per folder, not every scan.
3. If the key auto-fill placeholder appears, hard-refresh while signed in.

## Step 3: Run the First Scan

```bash
node gravio.mjs --once --target .
```

What happens:

1. If this is a new project, Gravio creates it automatically.
2. If the project already exists, it appends a new run.
3. In cloud-only encrypted mode, you do not get a local plaintext scorecard file.

## Common Setup Mistakes

### Mistake 1: Treating project naming as a separate onboarding phase

It is not. First scan handles creation flow automatically.

### Mistake 2: Re-authorizing on each scan

Authorization is folder-level setup. Repeating it adds noise and confusion.

### Mistake 3: Debugging the wrong issue when token placeholder appears

Usually the fix is session state in browser, not CLI syntax.

## Additional detail

### What to Do After the First Score

Once you have your first run, do two things:

1. Establish a recurring scan cadence.
2. Decide how score thresholds should affect release confidence.

To understand why recurring scans matter, read [Why AI Agent Output Quality Drifts Over Time](/blog/ai-agent-quality-drift-detection/).

To operationalize thresholds in pipelines, read [The New CI Gate: Failing Builds on Agent Quality](/blog/ai-quality-gate-ci-gravio/).

### What is Gravio onboarding?

Gravio onboarding is a three-step local setup: download the CLI and run setup once, authorize the folder once with your user API key, then run a scan. First scan creates the project automatically if needed. Authorization is folder-level—not repeated every scan—so teams can establish a recurring quality cadence without auth friction.

---
**TL;DR**

- A practical, no-fluff walkthrough for getting Gravio running from a clean folder to your first quality score, including the exact command flow and common mistakes.

### Reference

### Quick reference: first-run command flow

| Step | Command | Notes |
|------|---------|-------|
| **Setup** | `node gravio.mjs --setup --target .` | Once per folder |
| **Authorize** | `node gravio.mjs --authorize --target . --project <name> --api-key <key>` | User-bound key; one-time per folder |
| **Scan** | `node gravio.mjs --once --target .` | Creates project or appends run |

---

### Additional detail

### Common mistakes (Gravio setup)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Treating project naming as separate phase | Onboarding confusion | First scan handles project creation |
| Re-authorizing every scan | Noise and friction | Authorization is folder-level setup |
| Debugging CLI when token placeholder appears | Wrong root cause | Hard-refresh browser while signed in |
| Expecting local plaintext scorecard in encrypted mode | "Missing" output | Cloud-only encrypted path by design |
| Skipping recurring cadence after first score | Drift goes unnoticed | Schedule scans; read [drift detection](/blog/ai-agent-quality-drift-detection/) |

---

## FAQ

### How long does first score take?

About **10 minutes** with a clean folder if API key and session state are ready—mostly download, authorize, and one scan.

### Is the API key project-specific?

**No.** The key is user-bound. Project identity comes from folder authorization and scan context.

### What happens on the first scan of a new project?

Gravio **creates the project automatically** and records the first run.

### What should I do immediately after the first score?

Establish a **recurring scan cadence** and decide how thresholds affect release confidence—then read [CI quality gates](/blog/ai-quality-gate-ci-gravio/).

### Does setup work the same on Windows and macOS?

Yes—download `gravio.mjs`, run setup, authorize, scan. Platform-specific fetch commands differ; flow is identical.

---

### Why Fast Onboarding Is Strategic

Teams adopt what feels reliable and low-friction. A clear first-run experience turns quality tooling from "nice to have" into team habit.

Then habit becomes policy.

If you are evaluating Gravio from a security perspective, also read [Zero-Knowledge AI Quality: How Gravio Scores Agents Without Seeing Your Code](/blog/zero-knowledge-ai-quality-gravio/).

---

*Do you want to join Gravio as a beta tester or support as an open source contributor? Simply sign up on gravio.dev and email me, I will convert your account to pro.*
