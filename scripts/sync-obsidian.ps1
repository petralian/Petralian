# ── Obsidian → Site Sync ─────────────────────────────────────────────────────
# Copies articles from Obsidian's "02 Ready to publish" folder into the
# site's content/posts directory, sets status to published, and pushes to git.
#
# Usage:
#   .\scripts\sync-obsidian.ps1              # sync + commit + push
#   .\scripts\sync-obsidian.ps1 -DryRun      # preview only, no writes
# ─────────────────────────────────────────────────────────────────────────────

param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$obsidianReady = "D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\02 Ready to publish"
$sitePosts     = "$PSScriptRoot\..\site\content\posts"
$repo          = "$PSScriptRoot\.."

if (-not (Test-Path $obsidianReady)) {
  Write-Error "Obsidian publish folder not found: $obsidianReady"
  exit 1
}

$files = Get-ChildItem -Path $obsidianReady -Filter "*.md"

if ($files.Count -eq 0) {
  Write-Host "Nothing in '02 Ready to publish' — done." -ForegroundColor Yellow
  exit 0
}

$copied = @()

foreach ($file in $files) {
  $raw = Get-Content $file.FullName -Raw -Encoding UTF8

  # Extract slug from frontmatter (slug: value)
  if ($raw -match '(?m)^slug:\s*(.+)$') {
    $slug = $matches[1].Trim().Trim('"').Trim("'")
  } else {
    # Fall back to kebab-casing the filename
    $slug = $file.BaseName -replace '[^a-zA-Z0-9]+', '-' -replace '^-|-$', '' | ForEach-Object { $_.ToLower() }
  }

  $destFile = Join-Path $sitePosts "$slug.md"

  # Set status: published in the destination copy
  $published = $raw -replace '(?m)^status:\s*(ready|draft|published)\s*$', 'status: published'

  if ($DryRun) {
    Write-Host "[DryRun] Would copy: $($file.Name) → posts/$slug.md" -ForegroundColor Cyan
  } else {
    Set-Content -Path $destFile -Value $published -Encoding UTF8 -NoNewline
    Write-Host "Copied: $($file.Name) → posts/$slug.md" -ForegroundColor Green
    $copied += $slug
  }
}

if ($DryRun) {
  Write-Host ""
  Write-Host "Dry run complete. Run without -DryRun to apply." -ForegroundColor Cyan
  exit 0
}

if ($copied.Count -eq 0) {
  Write-Host "No files were copied." -ForegroundColor Yellow
  exit 0
}

# Git: stage, commit, push
Push-Location $repo
try {
  git add site/content/posts
  $msg = "content: publish $($copied.Count) article(s) from Obsidian"
  if ($copied.Count -le 3) { $msg = "content: publish $($copied -join ', ')" }
  git commit -m $msg
  git push origin master
  Write-Host ""
  Write-Host "Pushed. Vercel will deploy in ~30 seconds." -ForegroundColor Green
  Write-Host "  https://petralian.com" -ForegroundColor Blue
} finally {
  Pop-Location
}
