# Cursor Cloud — one-time setup (copy-paste)

GitHub **A** is done (Cursor app → All repositories). **B** is install script + build (below).

**Obsidian MCP (full vault read/write on cloud):** Dashboard only — see [`cloud-obsidian-mcp.md`](cloud-obsidian-mcp.md).

## 1. GitHub (you did this)

- Cursor app → **All repositories** ✓  
- If you see **“Cursor is requesting an update to its permissions”** → **Review request** → **Approve**.

## 2. You do **not** add repo dependencies in the UI

There is no such field. Fleet repos are set up by the **install script** in `.cursor/environment.json` (on `master`).

## 3. Paste install script (exact steps)

1. Open [Petralian environment](https://cursor.com/dashboard/cloud-agents/environments/e/ef658c55-accc-11f1-bf4b-42ffb4d10ea7).
2. Click **Edit** (or open the environment settings).
3. Find **Install script** (single text box).
4. Select all → delete → paste the script below **exactly** (one line per command; no `bash` wrapper).
5. Leave **Start script** empty unless you run a dev server on boot.
6. Click **Save**.
7. Click **Trigger New Build** → wait for **Success**.

### Install script (copy from here)

```bash
set -e
mkdir -p fleet-repos
rm -rf fleet-repos/ops fleet-repos/vault-petralian
cp -a cloud-bundle/ops fleet-repos/ops
cp -a cloud-bundle/vault-mirror fleet-repos/vault-petralian
mkdir -p fleet-repos/sitemonitor
test -f fleet-repos/sitemonitor/README.md || echo "Import from github.com/petralian/sitemonitor" > fleet-repos/sitemonitor/README.md
for r in ops vault-petralian sitemonitor; do
  if git clone --depth 1 "https://github.com/petralian/${r}.git" "fleet-repos/${r}.gitclone" 2>/dev/null; then
    rm -rf "fleet-repos/$r"
    mv "fleet-repos/${r}.gitclone" "fleet-repos/$r"
  fi
done
npm ci
```

## 4. Test

**New Agent** on `petralian/Petralian`:

> Read `fleet-repos/vault-petralian/Operations/AI Session Bridge.md` and summarize priority.

---

**Paths:** `fleet-repos/ops/services.yaml`, `fleet-repos/vault-petralian/`, `fleet-repos/sitemonitor/`
