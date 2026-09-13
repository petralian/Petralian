# Cursor Cloud — one-time setup (copy-paste)

GitHub **A** is done (Cursor app → All repositories). **B** is automatic from git after one build.

## 1. GitHub (you did this)

- Cursor app → **All repositories** ✓  
- If you see **“Cursor is requesting an update to its permissions”** → **Review request** → **Approve**.

## 2. You do **not** add repo dependencies in the UI

There is no such field. Fleet repos are cloned by the **install script** in `.cursor/environment.json` (on `master`).

## 3. Trigger a build (one click)

1. Open your environment: [petralian/Petralian](https://cursor.com/dashboard/cloud-agents/environments/e/ef658c55-accc-11f1-bf4b-42ffb4d10ea7)
2. Click **Trigger New Build**
3. Wait until status is **Success** (not Failure)

If it fails, click **Edit** and paste this **Install script** (same as repo):

```bash
set -e
mkdir -p fleet-repos
for r in ops vault-petralian sitemonitor; do
  if [ ! -d "fleet-repos/$r/.git" ]; then
    git clone --depth 1 "https://github.com/petralian/${r}.git" "fleet-repos/$r"
  fi
done
npm ci
```

Save → **Trigger New Build** again.

## 4. Test

**New Agent** on `petralian/Petralian`:

> Read `fleet-repos/vault-petralian/Operations/AI Session Bridge.md` and summarize priority.

---

**Paths:** `fleet-repos/ops/services.yaml`, `fleet-repos/vault-petralian/`, `fleet-repos/sitemonitor/`
