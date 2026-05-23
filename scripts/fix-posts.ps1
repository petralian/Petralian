$postsDir = "D:\VS Code Projects\Petralian\site\content\posts"
$count = 0
foreach ($f in Get-ChildItem $postsDir -Filter "*.md") {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    $c2 = $c -replace ' \u2014 ', ' - '
    $c2 = $c2 -replace '\u2014', '-'
    $c2 = $c2 -replace '## My Take\b', '## What I Think'
    if ($c2 -ne $c) {
        [System.IO.File]::WriteAllText($f.FullName, $c2)
        $count++
        Write-Host "Fixed: $($f.Name)"
    }
}
Write-Host "Done. $count files modified." -ForegroundColor Green
