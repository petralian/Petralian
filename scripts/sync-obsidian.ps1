# ── Obsidian → Site Sync ─────────────────────────────────────────────────────
# Bidirectional sync between Obsidian and content/posts:
#   PUBLISH   — copies articles from "02 Ready to publish" AND "03 Published"
#               into content/posts, sets status: published, resolves images.
#               (03 Published = live posts you edit in Obsidian; re-syncs minor edits.)
#   UNPUBLISH — removes any content/posts file whose slug does not exist in
#               either "02 Ready to publish" OR "03 Published".
#
# Image lookup order:
#   1. Blog/00 Attachments/          ← drop images here (primary)
#   2. Article's own Attachments/ subfolder
#   3. Same folder as article
#   4. Other common subfolders (assets/, attachments/, images/)
#   5. Vault-level Attachments/
#   6. Recursive vault search (last resort)
#
# Usage:
#   .\scripts\sync-obsidian.ps1              # sync + commit + push
#   .\scripts\sync-obsidian.ps1 -DryRun      # preview only, no writes
#   .\scripts\sync-obsidian.ps1 -Preflight   # check articles only, no sync
#   .\scripts\sync-obsidian.ps1 -Force       # sync even if preflight has errors
# ─────────────────────────────────────────────────────────────────────────────

param(
  [switch]$DryRun,
  [switch]$Preflight,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$obsidianReady = "D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\02 Ready to publish"
$obsidianPublished = "D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\03 Published"
$obsidianAttachments = "D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\00 Attachments"
$obsidianVault = "D:\Obsidian\Obsidian\40_VSCode\Petralian"
$sitePosts = "$PSScriptRoot\..\content\posts"
$siteImages = "$PSScriptRoot\..\public\images\posts"
$repo = "$PSScriptRoot\.."

$imageExtensions = @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif')

if (-not (Test-Path $obsidianReady)) {
  Write-Error "Obsidian publish folder not found: $obsidianReady"
  exit 1
}

# Ensure image output directory exists
if (-not $DryRun -and -not (Test-Path $siteImages)) {
  New-Item -ItemType Directory -Path $siteImages -Force | Out-Null
}

# ── Extract slug from a markdown file (frontmatter slug: or filename fallback)
function Get-FileSlug {
  param([string]$filePath)
  $raw = Get-Content $filePath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
  if ($raw -match '(?m)^slug:\s*(.+)$') {
    return $matches[1].Trim().Trim('"').Trim("'")
  }
  $base = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
  return ($base -replace '[^a-zA-Z0-9]+', '-' -replace '^-|-$', '').ToLower()
}

# ── Locate an image file anywhere under the vault ────────────────────────────
function Find-VaultImage {
  param([string]$filename, [string]$articleFolder)
  # 1. Centralised attachments folder (Blog/00 Attachments) — primary location
  $candidate = Join-Path $obsidianAttachments $filename
  if (Test-Path $candidate) { return $candidate }
  # 2. Attachments subfolder under the article's folder (Obsidian default per-folder setting)
  $candidate = Join-Path $articleFolder "Attachments" $filename
  if (Test-Path $candidate) { return $candidate }
  # 3. Same folder as the article
  $candidate = Join-Path $articleFolder $filename
  if (Test-Path $candidate) { return $candidate }
  # 4. Other common sibling subfolder names
  foreach ($sub in @('assets', 'attachments', 'images')) {
    $candidate = Join-Path $articleFolder $sub $filename
    if (Test-Path $candidate) { return $candidate }
  }
  # 5. Vault-level Attachments / assets folder
  foreach ($sub in @('Attachments', 'assets', 'attachments', 'images')) {
    $candidate = Join-Path $obsidianVault $sub $filename
    if (Test-Path $candidate) { return $candidate }
  }
  # 6. Recursive vault search (slower, last resort)
  $found = Get-ChildItem -Path $obsidianVault -Recurse -Filter $filename -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { return $found.FullName }
  return $null
}

# ── Process image references in markdown content ────────────────────────────
function Resolve-Images {
  param([string]$content, [string]$articleFolder, [bool]$dryRun)

  $copiedImages = @()

  # Pattern 1: Obsidian wiki-link  ![[filename.ext]]  or  ![[filename.ext|alt]]
  $content = [regex]::Replace($content, '!\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]', {
      param($m)
      $filename = [System.IO.Path]::GetFileName($m.Groups[1].Value.Trim())
      $ext = [System.IO.Path]::GetExtension($filename).ToLower()
      if ($ext -notin $script:imageExtensions) { return $m.Value }

      $src = Find-VaultImage -filename $filename -articleFolder $articleFolder
      if (-not $src) {
        Write-Warning "  Image not found: $filename"
        return $m.Value
      }
      if (-not $dryRun) {
        Copy-Item -Path $src -Destination (Join-Path $script:siteImages $filename) -Force
      }
      Write-Host "  Image: $filename" -ForegroundColor DarkGray
      $script:copiedImages += $filename
      return "![](/images/posts/$filename)"
    })

  # Pattern 2: Standard markdown  ![alt](relative/path.ext)  (not http/https)
  $content = [regex]::Replace($content, '!\[([^\]]*)\]\((?!https?://)([^)]+)\)', {
      param($m)
      $alt = $m.Groups[1].Value
      $path = $m.Groups[2].Value.Trim()
      $filename = [System.IO.Path]::GetFileName($path)
      $ext = [System.IO.Path]::GetExtension($filename).ToLower()
      if ($ext -notin $script:imageExtensions) { return $m.Value }

      # Already an absolute /images/posts/ path — skip
      if ($path.StartsWith('/images/')) { return $m.Value }

      $src = Find-VaultImage -filename $filename -articleFolder $articleFolder
      if (-not $src) {
        Write-Warning "  Image not found: $filename"
        return $m.Value
      }
      if (-not $dryRun) {
        Copy-Item -Path $src -Destination (Join-Path $script:siteImages $filename) -Force
      }
      Write-Host "  Image: $filename" -ForegroundColor DarkGray
      $script:copiedImages += $filename
      return "![$alt](/images/posts/$filename)"
    })

  # Pattern 3: featured_image frontmatter with local filename (not a URL)
  $content = [regex]::Replace($content, '(?m)^featured_image:\s*(.+)$', {
      param($m)
      $val = $m.Groups[1].Value.Trim().Trim('"').Trim("'")
      if ($val -eq '' -or $val.StartsWith('http') -or $val.StartsWith('/')) { return $m.Value }
      # Strip Obsidian wiki-link brackets: [[filename.png]] → filename.png
      $val = $val -replace '^\[\[', '' -replace '\]\]$', ''
      $filename = [System.IO.Path]::GetFileName($val)
      $ext = [System.IO.Path]::GetExtension($filename).ToLower()
      if ($ext -notin $script:imageExtensions) { return $m.Value }

      $src = Find-VaultImage -filename $filename -articleFolder $articleFolder
      if (-not $src) {
        Write-Warning "  Featured image not found: $filename"
        return $m.Value
      }
      if (-not $dryRun) {
        Copy-Item -Path $src -Destination (Join-Path $script:siteImages $filename) -Force
      }
      Write-Host "  Featured image: $filename" -ForegroundColor DarkGray
      $script:copiedImages += $filename
      return "featured_image: /images/posts/$filename"
    })

  return $content
}

# ── Preflight: validate an article before publishing ─────────────────────────
function Test-ArticlePreflight {
  param([string]$filePath, [string]$articleFolder)

  $errors = [System.Collections.Generic.List[string]]::new()
  $warnings = [System.Collections.Generic.List[string]]::new()

  $raw = Get-Content $filePath -Raw -Encoding UTF8

  # Parse frontmatter
  $fm = @{}
  if ($raw -match '(?s)^---\s*\n(.+?)\n---') {
    foreach ($line in ($matches[1] -split '\n')) {
      if ($line -match '^([\w][\w_-]*):\s*(.*)$') {
        $fm[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'")
      }
    }
  }
  else {
    $errors.Add('No YAML frontmatter block found')
    return [PSCustomObject]@{ Errors = $errors; Warnings = $warnings; WordCount = 0 }
  }

  # Required fields — block publish if missing
  foreach ($field in @('title', 'slug', 'date', 'category')) {
    if (-not $fm[$field] -or $fm[$field] -eq '') {
      $errors.Add("Missing required field: $field")
    }
  }

  # Recommended fields — warn only
  foreach ($field in @('excerpt', 'seo_description', 'focus_keyword')) {
    if (-not $fm[$field] -or $fm[$field] -eq '') {
      $warnings.Add("Missing recommended field: $field")
    }
  }

  if ($raw -match '```mermaid') {
    $errors.Add('Found ```mermaid blocks — convert to ```d2 (see Blog/00 Writing Session Guide.md)')
  }
  if ($raw -notmatch '```d2' -and $raw -notmatch '!\[.*\]\(/images/') {
    $warnings.Add('No ```d2 diagram in article — consider adding one (mobile-first layout)')
  }

  # Featured image
  $fi = $fm['featured_image']
  if (-not $fi -or $fi -eq '') {
    $warnings.Add('No featured_image set — article will render without a header image')
  }
  elseif (-not $fi.StartsWith('http') -and -not $fi.StartsWith('/')) {
    # Strip Obsidian wiki-link brackets: [[filename.png]] → filename.png
    $fi = $fi -replace '^\[\[', '' -replace '\]\]$', ''
    $fname = [System.IO.Path]::GetFileName($fi)
    if (-not (Find-VaultImage -filename $fname -articleFolder $articleFolder)) {
      $errors.Add("featured_image file not found in vault: $fname")
    }
  }

  # Alt text on featured image
  if (-not $fm['featured_image_alt'] -or $fm['featured_image_alt'] -eq '') {
    $warnings.Add('Missing featured_image_alt — hero image will have no alt text (accessibility + AIO/GEO signal)')
  }

  # Strip frontmatter for body checks
  $body = $raw -replace '(?s)^---.*?---\s*', ''

  # Body images — wiki-link syntax  ![[file.ext]]
  foreach ($m in [regex]::Matches($body, '!\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]')) {
    $fname = [System.IO.Path]::GetFileName($m.Groups[1].Value.Trim())
    $ext = [System.IO.Path]::GetExtension($fname).ToLower()
    if ($ext -in $imageExtensions) {
      if (-not (Find-VaultImage -filename $fname -articleFolder $articleFolder)) {
        $errors.Add("Body image not found in vault: $fname")
      }
    }
  }

  # Body images — standard markdown  ![alt](relative/path.ext)
  foreach ($m in [regex]::Matches($body, '!\[([^\]]*)\]\((?!https?://)([^)]+)\)')) {
    $path = $m.Groups[2].Value.Trim()
    if ($path.StartsWith('/images/')) { continue }
    $fname = [System.IO.Path]::GetFileName($path)
    $ext = [System.IO.Path]::GetExtension($fname).ToLower()
    if ($ext -in $imageExtensions) {
      if (-not (Find-VaultImage -filename $fname -articleFolder $articleFolder)) {
        $errors.Add("Body image not found in vault: $fname")
      }
    }
  }

  # Word count
  $wordCount = ($body -split '\s+' | Where-Object { $_ -ne '' }).Count
  if ($wordCount -lt 300) {
    $warnings.Add("Low word count: $wordCount words (recommended minimum: 300)")
  }

  return [PSCustomObject]@{ Errors = $errors; Warnings = $warnings; WordCount = $wordCount }
}

# ── Run preflight on all articles in 02 Ready to publish ────────────────────
$readyForPreflight = Get-ChildItem -Path $obsidianReady -Filter '*.md'
$preflightBlocking = $false

if ($readyForPreflight.Count -gt 0) {
  Write-Host ''
  Write-Host '── Preflight checks ────────────────────────────────────────────' -ForegroundColor Cyan

  foreach ($file in $readyForPreflight) {
    $result = Test-ArticlePreflight -filePath $file.FullName -articleFolder $file.DirectoryName
    $slug = Get-FileSlug $file.FullName
    $status = if ($result.Errors.Count -gt 0) { 'FAIL' } elseif ($result.Warnings.Count -gt 0) { 'WARN' } else { 'PASS' }
    $color = switch ($status) { 'FAIL' { 'Red' } 'WARN' { 'Yellow' } default { 'Green' } }

    Write-Host "  [$status] $slug  ($($result.WordCount) words)" -ForegroundColor $color

    foreach ($e in $result.Errors) { Write-Host "        ERROR   $e" -ForegroundColor Red }
    foreach ($w in $result.Warnings) { Write-Host "        WARN    $w" -ForegroundColor Yellow }

    if ($result.Errors.Count -gt 0) { $preflightBlocking = $true }
  }

  Write-Host '────────────────────────────────────────────────────────────────' -ForegroundColor Cyan
}

if ($Preflight) {
  Write-Host ''
  if ($preflightBlocking) {
    Write-Host 'Preflight FAILED — fix errors before publishing.' -ForegroundColor Red
  }
  else {
    Write-Host 'Preflight passed. Run without -Preflight to publish.' -ForegroundColor Green
  }
  exit 0
}

if ($preflightBlocking -and -not $Force) {
  Write-Host ''
  Write-Host 'Sync blocked by preflight errors. Fix the issues above, or run with -Force to skip.' -ForegroundColor Red
  exit 1
}

# ── Build set of slugs authorised to be in content/posts/ ───────────────────
Write-Host ""
Write-Host "Scanning authorised slugs..." -ForegroundColor White

$authorisedSlugs = @{}
foreach ($folder in @($obsidianReady, $obsidianPublished)) {
  if (-not (Test-Path $folder)) { continue }
  Get-ChildItem -Path $folder -Filter "*.md" | ForEach-Object {
    $slug = Get-FileSlug $_.FullName
    $authorisedSlugs[$slug] = $true
  }
}

# ── Unpublish: remove content/posts files not in authorised set ─────────────
$removed = @()
Get-ChildItem -Path $sitePosts -Filter "*.md" | ForEach-Object {
  $slug = $_.BaseName
  if (-not $authorisedSlugs.ContainsKey($slug)) {
    if ($DryRun) {
      Write-Host "[DryRun] Would remove: posts/$slug.md" -ForegroundColor Yellow
    }
    else {
      Remove-Item $_.FullName -Force
      Write-Host "Removed: posts/$slug.md" -ForegroundColor Red
      $removed += $slug
    }
  }
}

# ── Publish: copy/update from 02 Ready (new) and 03 Published (live edits) ───
function Publish-ObsidianFile {
  param(
    [System.IO.FileInfo]$file,
    [string]$sourceLabel
  )
  $slug = Get-FileSlug $file.FullName
  Write-Host "Processing [$sourceLabel]: $($file.Name)" -ForegroundColor White
  $raw = Get-Content $file.FullName -Raw -Encoding UTF8
  $destFile = Join-Path $sitePosts "$slug.md"

  $content = $raw -replace '(?m)^status:\s*(ready|draft|published)\s*$', 'status: published'
  $content = Resolve-Images -content $content -articleFolder $file.DirectoryName -dryRun $DryRun.IsPresent

  if ($DryRun) {
    Write-Host "[DryRun] Would sync: $($file.Name) -> posts/$slug.md" -ForegroundColor Cyan
    return $slug
  }

  Set-Content -Path $destFile -Value $content -Encoding UTF8 -NoNewline
  Write-Host "Synced: $($file.Name) -> posts/$slug.md" -ForegroundColor Green
  return $slug
}

$synced = @()
$processedSlugs = @{}

# 02 Ready first (new publishes)
Get-ChildItem -Path $obsidianReady -Filter "*.md" | ForEach-Object {
  $slug = Publish-ObsidianFile -file $_ -sourceLabel '02 Ready'
  if ($slug) {
    $synced += $slug
    $processedSlugs[$slug] = $true
  }
}

# 03 Published (updates to live posts — skip slug already synced from 02)
if (Test-Path $obsidianPublished) {
  Get-ChildItem -Path $obsidianPublished -Filter "*.md" | ForEach-Object {
    $slug = Get-FileSlug $_.FullName
    if ($processedSlugs.ContainsKey($slug)) {
      Write-Host "Skipping duplicate slug in 03 Published (already synced from 02 Ready): $slug" -ForegroundColor DarkGray
      return
    }
    $s = Publish-ObsidianFile -file $_ -sourceLabel '03 Published'
    if ($s) { $synced += $s }
  }
}

if ($DryRun) {
  Write-Host ""
  Write-Host "Dry run complete. Run without -DryRun to apply." -ForegroundColor Cyan
  exit 0
}

if ($synced.Count -eq 0 -and $removed.Count -eq 0) {
  Write-Host "Nothing to sync." -ForegroundColor Yellow
  exit 0
}

# ── Compress newly copied images ─────────────────────────────────────────────
if ($synced.Count -gt 0) {
  Write-Host ''
  Write-Host '── Image compression ────────────────────────────────────────────' -ForegroundColor Cyan
  $nodeOutput = node "$PSScriptRoot\optimize-images.mjs" 2>&1
  $nodeOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
  Write-Host '────────────────────────────────────────────────────────────────' -ForegroundColor Cyan
}

# ── SEO/GEO: regenerate llms.txt + indexing reminders ───────────────────────
if ($synced.Count -gt 0 -or $removed.Count -gt 0) {
  node "$PSScriptRoot\post-publish-seo.mjs" @($synced)
}

# ── Git: stage all changes (additions, updates, deletions), commit, push ────
Push-Location $repo
try {
  # Sync with remote first so we don't push on top of a stale base.
  # If the remote has new commits (e.g. a manual workflow_dispatch publish),
  # rebase our local history on top of them before staging.
  Write-Host ''
  Write-Host '── Syncing with origin/master ───────────────────────────────────' -ForegroundColor Cyan
  git fetch origin master 2>&1 | Out-Null
  $behind = (git rev-list --count HEAD..origin/master 2>$null)
  if ($behind -and [int]$behind -gt 0) {
    Write-Host "  Local is $behind commit(s) behind origin/master — rebasing..." -ForegroundColor Yellow
    git pull --rebase origin master
    if ($LASTEXITCODE -ne 0) {
      git rebase --abort 2>$null | Out-Null
      Write-Error "Rebase against origin/master failed. Resolve manually, then re-run."
      exit 1
    }
  }

  # -A stages new files, modifications, AND deletions
  git add -A content/posts public/images/posts public/llms.txt

  $parts = @()
  if ($synced.Count -gt 0) {
    $label = if ($synced.Count -le 3) { $synced -join ', ' } else { "$($synced.Count) articles" }
    $parts += "sync $label"
  }
  if ($removed.Count -gt 0) {
    $label = if ($removed.Count -le 3) { $removed -join ', ' } else { "$($removed.Count) articles" }
    $parts += "unpublish $label"
  }
  $msg = "content: $($parts -join '; ')"

  git commit -m $msg

  # Push with one retry. If the remote moved between our fetch and our push
  # (rare narrow race), reset onto origin, overlay our just-synced files,
  # commit, and push. Local sync is always treated as the latest truth.
  git push origin master
  if ($LASTEXITCODE -ne 0) {
    Write-Host '  Push rejected — remote moved during sync. Auto-recovering...' -ForegroundColor Yellow
    $localSha = (git rev-parse HEAD).Trim()
    git fetch origin master 2>&1 | Out-Null
    git reset --hard origin/master
    if ($LASTEXITCODE -ne 0) {
      Write-Error "reset --hard origin/master failed during auto-recovery."
      exit 1
    }
    git checkout $localSha -- content/posts public/images/posts
    if ($LASTEXITCODE -ne 0) {
      Write-Error "Could not restore local files from $localSha during auto-recovery."
      exit 1
    }
    git add -A content/posts public/images/posts public/llms.txt
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
      Write-Host '  Auto-recovery: no diff vs origin/master after overlay. Nothing to push.' -ForegroundColor Yellow
    }
    else {
      git commit -m "$msg (auto-recovered after race)"
      git push origin master
      if ($LASTEXITCODE -ne 0) {
        Write-Error "Push still failing after auto-recovery. Investigate manually."
        exit 1
      }
    }
  }
  Write-Host ""
  Write-Host "Pushed. Vercel will deploy in ~30 seconds." -ForegroundColor Green
  Write-Host "  https://petralian.com" -ForegroundColor Blue
}
finally {
  Pop-Location
}
