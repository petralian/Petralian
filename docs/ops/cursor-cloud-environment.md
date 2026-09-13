# Cursor Cloud — fleet environment (no dashboard “dependencies” field)

There is **no** `repositoryDependencies` text box on the environment **Overview** or **Edit** screen. That is normal.

## What to configure (two places)

### A. GitHub App access (private repos)

1. [Cursor Dashboard → Integrations → GitHub](https://cursor.com/dashboard) (or **Manage Connections**).
2. Ensure the Cursor GitHub App can access **all** of:
   - `petralian/Petralian` (primary — already linked)
   - `petralian/ops`
   - `petralian/vault-petralian`
   - `petralian/sitemonitor`  
   Use **Selected repositories** and tick each private repo (or **All repositories** for the org).

### B. Repo file `.cursor/environment.json` (on `master`)

This repo already defines:

| Field | Purpose |
|--------|---------|
| `repositoryDependencies` | Lets the cloud agent **authenticate** to those GitHub repos |
| `install` | **Clones** `ops`, `vault-petralian`, `sitemonitor` next to Petralian (`../ops`, etc.) then runs `npm ci` |

After you merge/pull this file:

1. Environment page → **Trigger New Build** (or start a new cloud agent).
2. Smoke test: agent reads `../vault-petralian/Operations/AI Session Bridge.md`.

### C. Optional: multi-repo environment (alternative)

**New Environment** at [Cloud Agents → Environments](https://cursor.com/dashboard/cloud-agents/environments) → during setup, **select all four repos** so Cursor clones each at creation. You can keep your existing `petralian/Petralian` env or create a new one named e.g. `Petralian fleet`.

## Which repos to add?

| Repo | Why |
|------|-----|
| `petralian/Petralian` | Site + this config (primary) |
| `petralian/ops` | `services.yaml` fleet map |
| `petralian/vault-petralian` | Bridge, Features, session ops |
| `petralian/sitemonitor` | mon.petralian.com code (when populated) |

Do **not** add duplicate vault repos unless you use a single canonical name (`vault-petralian` vs legacy `VAULT_REPO` secret).
