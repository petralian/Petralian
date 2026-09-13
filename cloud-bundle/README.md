# Cloud bundle (single-repo fallback)

Until `petralian/ops` and `petralian/vault-petralian` exist, cloud agents read **this folder** inside Petralian:

| Path | Use |
|------|-----|
| `cloud-bundle/ops/services.yaml` | Fleet map (all VPS web apps) |
| `cloud-bundle/vault-mirror/Operations/` | Bridge + Open Loops stubs |

After private repos are created, Obsidian Git should own `vault-petralian`; ops repo should match `fleet-bootstrap/`.
