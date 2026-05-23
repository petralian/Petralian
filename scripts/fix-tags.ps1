# Fix multi-word tags: replace spaces with hyphens within tag values in YAML frontmatter
# Applies to all .md files in site/content/posts

$postsDir = "D:\VS Code Projects\Petralian\site\content\posts"
$count = 0

foreach ($f in Get-ChildItem $postsDir -Filter "*.md") {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    
    # Match inline tags: tags: [word one, word two, ...]
    $c2 = [regex]::Replace($c, '(?m)^tags:\s*\[(.+)\]', {
        param($m)
        $inner = $m.Groups[1].Value
        # Split by comma, trim, hyphenate spaces, rejoin
        $fixed = ($inner -split ',') | ForEach-Object { $_.Trim() -replace ' +', '-' } | Join-String -Separator ', '
        "tags: [$fixed]"
    })
    
    # Match list-style tags:
    # tags:
    #   - multi word tag
    $c2 = [regex]::Replace($c2, '(?m)(^  - )([^\n]+)', {
        param($m)
        # Only modify if we're in a tags block - look for context
        $prefix = $m.Groups[1].Value
        $value = $m.Groups[2].Value.Trim()
        # Hyphenate spaces (but not if it looks like a sentence - skip values with 4+ words)
        $words = ($value -split ' ').Count
        if ($words -gt 1 -and $words -le 4 -and $value -notmatch '^[A-Z][a-z]+ [A-Z]') {
            "$prefix$($value -replace ' +', '-')"
        } else {
            $m.Value
        }
    })
    
    if ($c2 -ne $c) {
        [System.IO.File]::WriteAllText($f.FullName, $c2)
        $count++
        Write-Host "Fixed tags: $($f.Name)"
    }
}
Write-Host "Done. $count files modified." -ForegroundColor Green
