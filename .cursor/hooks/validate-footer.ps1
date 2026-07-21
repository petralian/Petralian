# Validates Response Footer Contract v3.1 field counts on agent replies.
# Hook: afterAgentResponse — failClosed: false (warn only)
# Canonical: 00_Brain/Templates/cursor/hooks/validate-footer.ps1

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

$hasMode = $tail -match '\*\*Mode:\s*([A-G])\.'

# Invented v2-style footers (no Mode line but custom field labels at end)
$inventedFooter = $tail -match '(?m)^\d+\.\s+\*\*(Completed|Next priority|Deploy|MCP policy|Further phases|Handbook path|Blog draft|Agents/tools):'

$workSignals = $tail -match '(Edit|Write|git commit|deploy|sync-obsidian|Operations/|00_Brain|\.cursor/rules|vault)'

if (-not $hasMode) {
    if ($inventedFooter -or $workSignals) {
        $msg = if ($inventedFooter) {
            "INVENTED FOOTER DETECTED (custom field labels without Mode). Delete it. Re-emit v3.1 footer: line 1 = **Mode: X. Name** — why: ...; then only mode-specific numbered fields from Response Footer Contract."
        } else {
            "Footer missing Mode declaration. Append v3.1 footer per Response Footer Contract (`.cursor/rules/response-footer.mdc`)."
        }
        @{ additional_context = $msg } | ConvertTo-Json -Compress
    }
    exit 0
}

$mode = $Matches[1]
$want = $expected[$mode]
$found = ([regex]::Matches($tail, '(?m)^\d+\.\s+\*\*')).Count

if ($found -ne $want) {
    @{
        additional_context = "Footer Mode $mode`: $found/$want numbered fields. Re-emit full mode shape from Response Footer Contract."
    } | ConvertTo-Json -Compress
}

exit 0
