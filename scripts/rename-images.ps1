# ── Rename images to SEO-friendly names + fix alt tags ───────────────────────
# One-time migration. Safe to re-run (skips already-renamed files).
# After running, commit public/images/posts/ and content/posts/.
#
# Usage: .\scripts\rename-images.ps1 [-DryRun]
# ─────────────────────────────────────────────────────────────────────────────
param([switch]$DryRun)

$imgDir   = "$PSScriptRoot\..\public\images\posts"
$postsDir = "$PSScriptRoot\..\content\posts"

# ── Rename map: old filename → new SEO filename ──────────────────────────────
$renameMap = [ordered]@{
  # Cryptic hash names
  "0_1-e1745491049250.jpg"                                                                                 = "creative-ai-hero.jpg"
  "576fde1c79b331c5df0dd3ac938fa80680847e5b9f7c5b2a1adf1cca30f98584_96a2343f86dd770f2d45eed9cf2df2ef_2000.jpg" = "ai-seo-founders-digital-campaign-hero.jpg"
  "73a77ea28fe9c7d23171050c2f4628be0027932d0b1064134c16f7578add9a36-1.png"                               = "contextual-ai-ecommerce-conversation-hero.png"
  "8ce687fde907bf855f9efe280b30fd523f92cf51b8e07f233ad077251c3f4bdc.jpg"                                 = "data-warehouse-cdp-architecture-hero.jpg"
  "e8d599da5355dc9920aa4b28177c4e3347a47702fa774a1a60107a1e59852348-e1739341410902.jpg"                  = "ecommerce-2025-trends-statistics-hero.jpg"
  "4298e0b8ba76d8a56de0b1aa18c749370d566d6453bd0874773635cdc58a07d4-e1737523847151.jpg"                  = "ai-human-imagination-collaboration-hero.jpg"
  "2e0c55fd347660a0b864e10b8e10c0cc6f6ac34d77cbb042ff8ea95c378c4c11-e1740127762132.jpg"                  = "infinity-loops-brand-storytelling-hero.jpg"
  "253d62aa1cf281c910778007a827dbb6d18a7b376ff6c1930d372085e7867e9b-e1741157048613.jpg"                  = "saas-ai-disruption-future-hero.jpg"
  "a5ae8a1efc23f944b3c38d347c34360548baf8b1fd47eef6f2cc056cdae886c9-e1744168494724.jpg"                  = "marketing-101-fundamentals-principles-hero.jpg"
  "61ade0a299577fe287e93e30e632ac4dd058cabbd3f313ab3a67cc7121fca7ba-e1742363187423.jpg"                  = "ai-prompting-frameworks-marketers-hero.jpg"
  "d8f62647-d4e8-4c79-be6a-5f90e6d8246d.jpg"                                                              = "new-merkle-announcement-hero.jpg"
  "052eb9991557d9d6e68451840192f29d38b32a284ef5c1e537c0c93934830a9b-e1747138638190.jpg"                  = "media-agency-innovation-digital-era-hero.jpg"
  "59fe562fdd5ed97ee66d729879f6a37dd35781695d188ae97d131a26dddda102.jpg"                                  = "career-ladder-ai-apac-sidelines-hero.jpg"
  "fa31d351bdaa223160484eb59818b8e7efb040c594156f552b1d4998dc7a754a.jpg"                                  = "ad-agency-holding-company-2026-hero.jpg"
  "0_2-e1744184382153.jpg"                                                                                 = "ai-llms-search-seo-revolution-hero.jpg"
  "11553ff0aeb85ec5e80c911bca80c834a3b3fb0f83680398cc25e6175a5ca0ff-e1737371134564.jpg"                  = "retail-digital-innovation-banking-apac-hero.jpg"
  # Timestamps + ugly names → clean descriptive names
  "Financial-advisor-engaging-with-a-customer-via-a-personalized-digital-banking-app-in-APAC-e1736950772132.jpg" = "personalized-banking-digital-app-apac-hero.jpg"
  "glassesgallery-AR-glasses-e1736912333979.jpg"                                                           = "ar-glasses-digital-brand-identity-hero.jpg"
  "IMG_4099-scaled.jpg"                                                                                    = "merkle-silk-commerce-launch-hero.jpg"
  "fractional-cmo-e1738764955900.jpeg"                                                                     = "fractional-cmo-marketing-hero.jpeg"
  "Generative-AI-e1736080910554.jpeg"                                                                      = "generative-ai-marketing-industry-hero.jpeg"
  "salesforce-ai-crm-future-agentforce-invisible-infrastructure-e1778326631628.jpg"                        = "salesforce-agentforce-invisible-crm-hero.jpg"
  "leader-e1746685352112.jpg"                                                                              = "digital-transformation-leadership-hero.jpg"
  "a_leader_standing_image-e1740547276706.jpeg"                                                            = "leadership-styles-marketing-branding-hero.jpeg"
  "DeckCoverMar21-e1626763680829.jpg"                                                                      = "shoppable-media-warc-omnichannel-hero.jpg"
  "IMG_7630-scaled-e1736077900101.jpg"                                                                     = "thank-you-merkle-team-hero.jpg"
  "buysocial-messages-e1736137779138.jpg"                                                                  = "buysocial-messaging-notifications-hero.jpg"
  "buysocial-1.jpeg"                                                                                       = "buysocial-social-commerce-hero.jpeg"
  "CXM-post.png"                                                                                           = "cxm-customer-experience-management-hero.png"
  "which-to-choose.png"                                                                                    = "boutique-agency-consultancy-choice-hero.png"
  "stackoverflow-3-months-traffic-1024x472.jpg"                                                           = "stackoverflow-traffic-decline-ai-search.jpg"
  "marketing-101-figure-5-14.jpg"                                                                         = "marketing-101-market-size-framework.jpg"
  # Generic body image names
  "image.png"                                                                                              = "saas-on-premise-iaas-paas-comparison.png"
  "image-1.png"                                                                                            = "boutique-agency-consultancy-spectrum.png"
  # Keep as-is (already SEO-friendly):
  # "programmatic-transparency-publicis-trade-desk-2026.jpg"
  # "obsidian-second-brain-graph-view.jpg"
  # "marketing-101-figure-5-14.jpg"  ← handled above
}

# ── Alt text map: new filename → alt text ────────────────────────────────────
# Used when an image has missing ("") alt text in the markdown body.
$altMap = @{
  "creative-ai-hero.jpg"                             = "Creative AI intersection — human imagination and artificial intelligence"
  "ai-seo-founders-digital-campaign-hero.jpg"        = "Founders integrating AI and SEO for digital campaign management"
  "contextual-ai-ecommerce-conversation-hero.png"    = "Contextual AI driving ecommerce conversations beyond the click"
  "data-warehouse-cdp-architecture-hero.jpg"         = "Data warehouse as a customer data platform architecture diagram"
  "ecommerce-2025-trends-statistics-hero.jpg"        = "Ecommerce 2025 trends and statistics landscape"
  "ai-human-imagination-collaboration-hero.jpg"      = "AI and human imagination working together in creative collaboration"
  "infinity-loops-brand-storytelling-hero.jpg"       = "Infinity loops framework for successful brand storytelling"
  "saas-ai-disruption-future-hero.jpg"               = "SaaS model being disrupted and dismantled by AI-native software"
  "marketing-101-fundamentals-principles-hero.jpg"   = "Marketing 101 fundamental principles for sustainable business growth"
  "ai-prompting-frameworks-marketers-hero.jpg"       = "AI prompting frameworks and tools for marketing campaign transformation"
  "new-merkle-announcement-hero.jpg"                 = "New role announcement at Merkle"
  "media-agency-innovation-digital-era-hero.jpg"     = "Redefining media agency success through digital innovation"
  "career-ladder-ai-apac-sidelines-hero.jpg"         = "AI sidelining entry-level career progression in APAC"
  "ad-agency-holding-company-2026-hero.jpg"          = "Ad agency holding company transformation and the future of marketing in 2026"
  "ai-llms-search-seo-revolution-hero.jpg"           = "AI and LLMs reshaping search and the future of SEO"
  "retail-digital-innovation-banking-apac-hero.jpg"  = "Retail leading digital innovation over banking in APAC"
  "personalized-banking-digital-app-apac-hero.jpg"   = "Financial advisor using a personalised digital banking app in APAC"
  "ar-glasses-digital-brand-identity-hero.jpg"       = "AR glasses representing cutting-edge digital brand identity for startups"
  "merkle-silk-commerce-launch-hero.jpg"             = "Merkle MD joins Silk Commerce — announcement photo"
  "fractional-cmo-marketing-hero.jpeg"               = "Fractional CMO driving growth for startups and small businesses"
  "generative-ai-marketing-industry-hero.jpeg"       = "Generative AI transforming the marketing industry"
  "salesforce-agentforce-invisible-crm-hero.jpg"     = "Salesforce Agentforce becoming invisible infrastructure in the CRM stack"
  "digital-transformation-leadership-hero.jpg"       = "Leadership driving digital transformation — Vatican consensus model"
  "leadership-styles-marketing-branding-hero.jpeg"   = "Leadership styles and their direct impact on marketing and branding"
  "shoppable-media-warc-omnichannel-hero.jpg"        = "Shoppable media as an omnichannel strategy — WARC exclusive"
  "thank-you-merkle-team-hero.jpg"                   = "Farewell to Merkle — a thank you to the team"
  "buysocial-messaging-notifications-hero.jpg"       = "BuySocial messaging and notifications system engagement features"
  "buysocial-social-commerce-hero.jpeg"              = "BuySocial powering the future of social commerce"
  "cxm-customer-experience-management-hero.png"      = "The rise of CXM — customer experience management as a discipline"
  "boutique-agency-consultancy-choice-hero.png"      = "Boutiques, agencies and consultancies — which to choose for digital transformation"
  "stackoverflow-traffic-decline-ai-search.jpg"      = "Stack Overflow traffic decline over three months as AI search replaces traditional queries"
  "marketing-101-market-size-framework.jpg"          = "Marketing 101 market size framework illustration"
  "saas-on-premise-iaas-paas-comparison.png"         = "Comparison diagram of On-Premise, IaaS, PaaS and SaaS deployment models"
  "boutique-agency-consultancy-spectrum.png"         = "Boutiques, agencies and consultancies positioned on the digital transformation spectrum"
  "programmatic-transparency-publicis-trade-desk-2026.jpg" = "Programmatic transparency battle — Publicis vs The Trade Desk in 2026"
  "obsidian-second-brain-graph-view.jpg"             = "Obsidian second brain graph view — connected knowledge management system"
}

# ── Step 1: Rename physical files ─────────────────────────────────────────────
Write-Host ""
Write-Host "── Renaming image files ──────────────────────────────────────────" -ForegroundColor Cyan
$renamed = 0; $skipped = 0

foreach ($entry in $renameMap.GetEnumerator()) {
  $old = $entry.Key
  $new = $entry.Value
  $src = Join-Path $imgDir $old
  $dst = Join-Path $imgDir $new

  if (-not (Test-Path $src)) {
    Write-Host "  skip (not found): $old" -ForegroundColor DarkGray
    $skipped++
    continue
  }
  if ($src -eq $dst) {
    Write-Host "  skip (same name): $new" -ForegroundColor DarkGray
    $skipped++
    continue
  }
  if (Test-Path $dst) {
    Write-Host "  skip (dest exists): $new" -ForegroundColor DarkGray
    $skipped++
    continue
  }

  if ($DryRun) {
    Write-Host "  [DryRun] $old → $new" -ForegroundColor Cyan
  }
  else {
    Rename-Item -Path $src -NewName $new
    Write-Host "  $old → $new" -ForegroundColor Green
    $renamed++
  }
}

Write-Host "  Renamed: $renamed  |  Skipped/not-found: $skipped"

# ── Step 2: Update all /images/posts/ references in posts ─────────────────────
Write-Host ""
Write-Host "── Updating posts ────────────────────────────────────────────────" -ForegroundColor Cyan
$updatedPosts = 0

Get-ChildItem "$postsDir\*.md" | ForEach-Object {
  $file    = $_
  $content = Get-Content $file.FullName -Raw -Encoding UTF8
  $orig    = $content

  foreach ($entry in $renameMap.GetEnumerator()) {
    $old = $entry.Key
    $new = $entry.Value
    # Replace in featured_image and body, in both quoted and unquoted form
    $content = $content.Replace("/images/posts/$old", "/images/posts/$new")
  }

  if ($content -ne $orig) {
    if ($DryRun) {
      Write-Host "  [DryRun] Would update: $($file.Name)" -ForegroundColor Cyan
    }
    else {
      Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
      Write-Host "  updated: $($file.Name)" -ForegroundColor Green
      $updatedPosts++
    }
  }
}

Write-Host "  Posts updated: $updatedPosts"

# ── Step 3: Fix missing alt tags on body images ────────────────────────────────
Write-Host ""
Write-Host "── Fixing alt tags ───────────────────────────────────────────────" -ForegroundColor Cyan
$altFixed = 0

Get-ChildItem "$postsDir\*.md" | ForEach-Object {
  $file    = $_
  $content = Get-Content $file.FullName -Raw -Encoding UTF8
  $orig    = $content

  # Match ![](url) or !["" ](url) — empty alt text on body images
  $content = [regex]::Replace($content, '!\[([^\]]*)\]\((/images/posts/([^)]+))\)', {
    param($m)
    $alt      = $m.Groups[1].Value.Trim()
    $url      = $m.Groups[2].Value
    $filename = $m.Groups[3].Value

    if ($alt -ne '') { return $m.Value }  # already has alt

    # Look up alt text by (renamed) filename
    $suggestion = $altMap[$filename]
    if (-not $suggestion) {
      # Fallback: humanise the filename
      $suggestion = [System.IO.Path]::GetFileNameWithoutExtension($filename) -replace '-', ' ' -replace '_', ' '
      $suggestion = (Get-Culture).TextInfo.ToTitleCase($suggestion)
    }
    return "![$suggestion]($url)"
  })

  if ($content -ne $orig) {
    if ($DryRun) {
      Write-Host "  [DryRun] alt fix: $($file.Name)" -ForegroundColor Cyan
    }
    else {
      Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
      Write-Host "  alt fixed: $($file.Name)" -ForegroundColor Green
      $altFixed++
    }
  }
}

Write-Host "  Alt tags fixed: $altFixed"

# ── Summary ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor Cyan
if ($DryRun) {
  Write-Host "Dry run complete. Run without -DryRun to apply." -ForegroundColor Cyan
}
else {
  Write-Host "Done. Run: git add -A public/images/posts content/posts && git commit -m 'chore(images): rename to SEO names, add alt tags'" -ForegroundColor Green
}
