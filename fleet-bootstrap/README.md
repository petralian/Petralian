# Fleet bootstrap → `petralian/ops`

1. Create private repo: `gh repo create petralian/ops --private`
2. Copy `services.yaml` and `secrets.manifest.yaml` from this folder to repo root.
3. After Phase 0 inventory, edit `services.yaml` (Hermes `domain:`, any missing aaPanel sites).
4. Push:

```bash
cd /tmp/ops && git init && cp -r /path/to/fleet-bootstrap/* .
git add services.yaml secrets.manifest.yaml README.md
git commit -m "Initial fleet map (all VPS web apps)"
git remote add origin git@github.com:petralian/ops.git
git push -u origin master
```

Petralian site repo links here via `memories/repo/index.md` and `AGENTS.md`.
