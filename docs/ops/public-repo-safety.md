# Public `petralian/Petralian` — what is safe on GitHub

The **site repo** is public to avoid GitHub billing. **Secrets and vault content must not live here.**

## Already safe (checked pattern)

| Area | Status |
|------|--------|
| `.env` / real API keys | **Not committed** — only `.env.example` placeholders |
| `secrets.manifest.yaml` / `fleet-bootstrap` | **Names only**, no values |
| `cloud-bundle/vault-mirror/` | **Stubs** for cloud bootstrap, not full Obsidian vault |
| `BREVO_API_KEY`, `VPS_*`, PATs | **GitHub Actions secrets** or VPS `.env` only |
| Blog drafts | **Not** in this repo (`content/posts/` is published material only) |

## Keep private (separate repos)

These should stay **private** (you already created them via fleet bootstrap):

- `petralian/ops`
- `petralian/vault-petralian`
- `petralian/sitemonitor`

Never copy production `.env` into the public Petralian repo.

## Before you publish / if worried

```bash
# From repo root — should return nothing sensitive
git grep -E 'xkeysib-|ghp_[A-Za-z0-9]{20,}|BEGIN OPENSSH PRIVATE'
```

Run `npm run audit:facts` when changing harness limits.

## Never put real keys in `.env.example`

`.env.example` is committed and **public**. Use empty placeholders only. Put live values in **GitHub Actions secret `BREVO_API_KEY`** and VPS `/www/wwwroot/petralian/.env` (via deploy hook).

## If something leaked

1. **Rotate** the key in Brevo (revoke old key, create new, update GitHub secret `BREVO_API_KEY`) immediately.
2. Remove from git history (`git filter-repo` or BFG) if a real secret was committed.
3. Prefer **GitHub Secret** `BREVO_API_KEY` + deploy hook over VPS hand-edits.

## Operational docs in public repo

`docs/ops/*` describes **architecture and runbooks** — no live credentials. VPS hostname may appear in **your** private Actions logs only, not in committed files.
