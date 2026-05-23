# ── Obsidian → Site Sync ─────────────────────────────────────────────────────
# Copies articles from Obsidian's "02 Ready to publish" folder into the
# site's content/posts directory, sets status to published, and pushes to git.
#
# Also copies referenced images to site/public/images/posts/ and rewrites
# both Obsidian wiki-link syntax (![[image.png]]) and relative image paths
# to absolute /images/posts/ paths the Next.js site can serve.
#
# Usage:
#   .\scripts\sync-obsidian.ps1              # sync + commit + push
#   .\scripts\sync-obsidian.ps1 -DryRun      # preview only, no writes
# ─────────────────────────────────────────────────────────────────────────────

param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$obsidianReady  = "D:\Obsidian\Obsidian\40_VSCode\Petralian\Blog\02 Ready to publish"
$obsidianVault  = "D:\Obsidian\Obsidian\40_VSCode\Petralian"
$sitePosts      = "$PSScriptRoot\..\content\posts"
$siteImages     = "$PSScriptRoot\..\public\images\posts"
$repo           = "$PSScriptRoot\.."

$imageExtensions = @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif')

if (-not (Test-Path $obsidianReady)) {
  Write-Error "Obsidian publish folder not found: $obsidianReady"
  exit 1
}

# Ensure image output directory exists
if (-not $DryRun -and -not (Test-Path $siteImages)) {
  New-Item -ItemType Directory -Path $siteImages -Force | Out-Null
}

# ── Locate an image file anywhere under the vault ──────────────────────────
function Find-VaultImage {
  param([string]$filename, [string]$articleFolder)
  # 1. Same folder as the article
  $candidate = Join-Path $articleFolder $filename
  if (Test-Path $candidate) { return $candidate }
  # 2. Sibling assets / attachments folder
  foreach ($sub in @('assets', 'attachments', 'images')) {
    $candidate = Join-Path $articleFolder $sub $filename
    if (Test-Path $candidate) { return $candidate }
  }
  # 3. Vault-level attachments folder
  foreach ($sub in @('assets', 'attachments', 'images')) {
    $candidate = Join-Path $obsidianVault $sub $filename
    if (Test-Path $candidate) { return $candidate }
  }
  # 4. Recursive vault search (slower, last resort)
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
    if ($val -eq '' -or $val.StartsWith('http')) { return $m.Value }
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

$files = Get-ChildItem -Path $obsidianReady -Filter "*.md"

if ($files.Count -eq 0) {
  Write-Host "Nothing in '02 Ready to publish' - done." -ForegroundColor Yellow
  exit 0
}

$copied = @()

foreach ($file in $files) {
  Write-Host "Processing: $($file.Name)" -ForegroundColor White
  $raw = Get-Content $file.FullName -Raw -Encoding UTF8

  # Extract slug from frontmatter
  if ($raw -match '(?m)^slug:\s*(.+)$') {
    $slug = $matches[1].Trim().Trim('"').Trim("'")
  } else {
    $slug = $file.BaseName -replace '[^a-zA-Z0-9]+', '-' -replace '^-|-$', '' | ForEach-Object { $_.ToLower() }
  }

  $destFile = Join-Path $sitePosts "$slug.md"

  # Set status: published
  $content = $raw -replace '(?m)^status:\s*(ready|draft|published)\s*$', 'status: published'

  # Resolve images (copy files + rewrite paths)
  $content = Resolve-Images -content $content -articleFolder $file.DirectoryName -dryRun $DryRun.IsPresent

  if ($DryRun) {
    Write-Host "[DryRun] Would copy: $($file.Name) -> posts/$slug.md" -ForegroundColor Cyan
  } else {
    Set-Content -Path $destFile -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Copied: $($file.Name) -> posts/$slug.md" -ForegroundColor Green
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
  git add site/content/posts site/public/images/posts
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
