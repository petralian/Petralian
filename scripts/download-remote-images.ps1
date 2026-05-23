# ── Download Remote Images → Local ───────────────────────────────────────────
# One-time (and re-runnable) migration script.
# Finds all petralian.com image URLs in content/posts/*.md, downloads them to
# public/images/posts/, then rewrites the URLs to local /images/posts/ paths.
#
# Usage:
#   .\scripts\download-remote-images.ps1            # download + rewrite
#   .\scripts\download-remote-images.ps1 -DryRun    # preview only
# ─────────────────────────────────────────────────────────────────────────────

param([switch]$DryRun)

$ErrorActionPreference = "Stop"

$posts  = "$PSScriptRoot\..\content\posts"
$imgDir = "$PSScriptRoot\..\public\images\posts"
$pattern = 'https?://petralian\.com[^\s")\]]+\.(jpg|jpeg|png|gif|webp|svg|avif)'

if (-not $DryRun) {
  New-Item -ItemType Directory -Path $imgDir -Force | Out-Null
}

# ── Collect all unique remote URLs across all posts ──────────────────────────
$urlMap = [ordered]@{}   # url -> local filename

Get-ChildItem "$posts\*.md" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw -Encoding UTF8
  [regex]::Matches($content, $pattern, 'IgnoreCase') | ForEach-Object {
    $url      = $_.Value
    $filename = [System.IO.Path]::GetFileName(([System.Uri]$url).AbsolutePath)
    $urlMap[$url] = $filename
  }
}

Write-Host ""
Write-Host "Found $($urlMap.Count) unique remote image(s)." -ForegroundColor Cyan

# ── Download ─────────────────────────────────────────────────────────────────
$downloaded = 0
$skipped    = 0
$failed     = @()

foreach ($entry in $urlMap.GetEnumerator()) {
  $url      = $entry.Key
  $filename = $entry.Value
  $dest     = Join-Path $imgDir $filename

  if (Test-Path $dest) {
    Write-Host "  skip (exists): $filename" -ForegroundColor DarkGray
    $skipped++
    continue
  }

  if ($DryRun) {
    Write-Host "  [DryRun] Would download: $filename" -ForegroundColor Cyan
    continue
  }

  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 30
    Write-Host "  downloaded: $filename" -ForegroundColor Green
    $downloaded++
  }
  catch {
    Write-Warning "  FAILED: $url"
    Write-Warning "    $_"
    $failed += $url
  }
}

# ── Rewrite URLs in posts ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "Rewriting URLs in posts..." -ForegroundColor Cyan
$rewritten = 0

Get-ChildItem "$posts\*.md" | ForEach-Object {
  $file    = $_
  $content = Get-Content $file.FullName -Raw -Encoding UTF8

  $newContent = [regex]::Replace($content, $pattern, {
      param($m)
      $filename = [System.IO.Path]::GetFileName(([System.Uri]$m.Value).AbsolutePath)
      "/images/posts/$filename"
    }, 'IgnoreCase')

  if ($newContent -ne $content) {
    if ($DryRun) {
      Write-Host "  [DryRun] Would rewrite: $($file.Name)" -ForegroundColor Cyan
    }
    else {
      Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
      Write-Host "  rewritten: $($file.Name)" -ForegroundColor Green
      $rewritten++
    }
  }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "─────────────────────────────────────────────" -ForegroundColor Cyan
if ($DryRun) {
  Write-Host "Dry run complete. Run without -DryRun to apply." -ForegroundColor Cyan
}
else {
  Write-Host "Downloaded : $downloaded  |  Skipped: $skipped  |  Failed: $($failed.Count)" -ForegroundColor Cyan
  Write-Host "Posts updated: $rewritten" -ForegroundColor Cyan
  if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed URLs (update manually):" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  }
}
