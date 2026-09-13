# Create private fleet repos and push petralian/ops bootstrap (run at desk with gh auth).
#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Bootstrap = Join-Path $Root "fleet-bootstrap"

function Ensure-Repo($name) {
  $full = "petralian/$name"
  gh repo view $full 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating private repo $full"
    gh repo create $full --private --confirm
  } else {
    Write-Host "Repo exists: $full"
  }
}

Ensure-Repo "ops"
Ensure-Repo "vault-petralian"
Ensure-Repo "sitemonitor"

$opsDir = Join-Path $env:TEMP "petralian-ops-bootstrap"
if (Test-Path $opsDir) { Remove-Item -Recurse -Force $opsDir }
New-Item -ItemType Directory -Path $opsDir | Out-Null
Copy-Item (Join-Path $Bootstrap "services.yaml") $opsDir
Copy-Item (Join-Path $Bootstrap "secrets.manifest.yaml") $opsDir
Copy-Item (Join-Path $Bootstrap "README.md") $opsDir

Push-Location $opsDir
git init
git add services.yaml secrets.manifest.yaml README.md
git commit -m "Initial fleet map (all VPS web apps)"
git branch -M master
git remote add origin "git@github.com:petralian/ops.git"
git push -u origin master
Pop-Location

Write-Host "Done. Next: scripts/local-phase-b-vault-mirror.ps1 in Obsidian vault."
