# GitHub Actions — what cloud agents can trigger

## Why `workflow_dispatch` returns 403 for the Cursor integration token

Cloud agents authenticate to GitHub with the **Cursor GitHub App** installation token (`ghs_…`). That token is scoped for **git** (clone, push) on repos you granted. It does **not** include permission to call:

`POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches`

So `gh workflow run …` from a cloud agent fails with **HTTP 403 — Resource not accessible by integration**.

This is expected; it is not a misconfiguration of your VPS or SiteMonitor.

## What works without extra setup

| Method | Who | Effect |
|--------|-----|--------|
| **Push to `master`** | Cloud agent (with git write) | Runs **Deploy to VPS** → `scripts/fix-website-monitor-emails.sh` on the server |
| **You click Run workflow** | You in GitHub UI | **Fix SiteMonitor emails** or **Deploy to VPS** |
| **Fleet bootstrap** | You (PAT in repo secret) | `PETRALIAN_ADMIN_PAT` — only for bootstrap workflow |

## Optional: let agents dispatch workflows

Pick one:

1. **Keep using push-to-master** (recommended) — agent commits; deploy hook repairs monitor.
2. **You** run **Actions → Fix SiteMonitor emails → Run workflow** when you want an immediate digest without a deploy.
3. **Fine-grained PAT** (advanced): create a PAT with `Actions: Read and write` on `petralian/Petralian`, store as repo secret e.g. `AGENT_WORKFLOW_PAT`, add a small workflow that only trusted automation uses — not wired by default in this repo.

Do **not** put a broad PAT in the cloud agent environment unless you accept full Actions scope on those repos.

## Cursor GitHub App permission update

If Cursor prompts **“requesting an update to its permissions”** on GitHub → **Review request** → **Approve**. That covers repo access, not necessarily Actions dispatch for agents.
