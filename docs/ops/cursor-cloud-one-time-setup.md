# Cursor Cloud — one-time setup (copy-paste)

GitHub **A** is done (Cursor app → All repositories). **B** is the install script + one **Save** in the environment dashboard (personal envs do not auto-read `.cursor/environment.json` from git).

## 1. GitHub (you did this)

- Cursor app → **All repositories** ✓  
- If you see **“Cursor is requesting an update to its permissions”** → **Review request** → **Approve**.

## 2. You do **not** add repo dependencies in the UI

There is no such field. Fleet repos are cloned by the **install script** in `.cursor/environment.json` (on `master`).

## 3. Save the environment (one click if the agent proposed it)

1. Open [petralian/Petralian environment](https://cursor.com/dashboard/cloud-agents/environments/e/ef658c55-accc-11f1-bf4b-42ffb4d10ea7).
2. If Cursor shows an **environment proposal** from the cloud agent → **Review** → **Save** (uses a build that already succeeded).
3. Otherwise: **Edit** → paste the **Install script** from `.cursor/environment.json` on `master` → **Save** → **Trigger New Build** → wait for **Success**.

The install script copies `cloud-bundle/` into `fleet-repos/`, then tries to clone `ops`, `vault-petralian`, and `sitemonitor` (optional; cloud-bundle still works if clone fails).

## 4. Test

**New Agent** on `petralian/Petralian`:

> Read `fleet-repos/vault-petralian/Operations/AI Session Bridge.md` and summarize priority.

---

**Paths:** `fleet-repos/ops/services.yaml`, `fleet-repos/vault-petralian/`, `fleet-repos/sitemonitor/`
