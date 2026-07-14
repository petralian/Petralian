# Validates Response Footer Contract v3.1 field counts on agent replies.
# Hook: afterAgentResponse — failClosed: false (warn only)

$ErrorActionPreference = "Stop"

$expected = @{
    "A" = 1
    "B" = 4
    "C" = 6
    "D" = 8
    "E" = 8
    "F" = 6
    "G" = 9
}

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }

$text = $raw
try {
    $json = $raw | ConvertFrom-Json -ErrorAction Stop
    foreach ($prop in @("response", "agentResponse", "text", "content", "message")) {
        if ($json.PSObject.Properties.Name -contains $prop -and $json.$prop) {
            $text = [string]$json.$prop
            break
        }
    }
} catch {
    # stdin may be plain text
}

$tail = if ($text.Length -gt 2000) { $text.Substring($text.Length - 2000) } else { $text }

if ($tail -notmatch '\*\*Mode:\s*([A-G])\.') {
    if ($tail -match '(Edit|Write|git commit|deploy|sync-obsidian)') {
        $out = @{
            additional_context = "Footer missing Mode declaration. Append v3.1 footer per Response Footer Contract (`.cursor/rules/response-footer.mdc`)."
        } | ConvertTo-Json -Compress
        Write-Output $out
    }
    exit 0
}

$mode = $Matches[1]
$want = $expected[$mode]
$found = ([regex]::Matches($tail, '(?m)^\d+\.\s+\*\*')).Count

if ($found -ne $want) {
    $out = @{
        additional_context = "Footer Mode $mode`: $found/$want numbered fields. Re-emit full mode shape from Response Footer Contract."
    } | ConvertTo-Json -Compress
    Write-Output $out
}

exit 0
