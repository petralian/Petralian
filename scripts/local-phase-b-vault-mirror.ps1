# Phase B — vault-petralian mirror (run inside Petralian Obsidian vault on D:).
#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$Vault = "D:\Obsidian\Obsidian\40_VSCode\Petralian"
if (-not (Test-Path $Vault)) {
  Write-Error "Vault not found: $Vault — edit `$Vault in this script."
}
Set-Location $Vault

$gitignore = @"
Blog/01 Drafts/
Blog/02 Ready to publish/
.obsidian/workspace*
.obsidian/cache
.trash/
"@
Set-Content -Encoding utf8 .gitignore $gitignore

if (-not (Test-Path .git)) {
  git init
  git remote add origin git@github.com:petralian/vault-petralian.git
} else {
  $remotes = git remote -v
  if ($remotes -notmatch "vault-petralian") {
    Write-Host "Existing .git — add remote manually if needed:"
    Write-Host "  git remote add origin git@github.com:petralian/vault-petralian.git"
  }
}

git add Operations/ Features/ _Home.md _MOC.md .gitignore
git status
$msg = "Initial vault ops mirror for cloud continuity"
if ((git status --porcelain) -match "^\?\?|^M|^A") {
  git commit -m $msg
  git push -u origin master
  Write-Host "Pushed. Configure Obsidian Git plugin for ongoing pushes."
} else {
  Write-Host "Nothing to commit — vault may already be mirrored."
}
