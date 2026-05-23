param([switch]$DryRun)

$postsDir = Join-Path $PSScriptRoot "..\content\posts"

$updates = [ordered]@{
    "ai-shopping-revolution-will-shopifys-chatgpt-integration-redefine-retail-strategy" = @{
        category = "Commerce & Growth"; tags = @("Ecommerce", "Agentic AI", "AI in Marketing") }
    "best-practices-for-founders-integrating-ai-and-seo-for-effective-digital-campaign-management" = @{
        category = "Marketing & Media"; tags = @("AI in Marketing", "Future of Search", "Marketing Technology") }
    "boutiques-agencies-consultancies-digital-transformation-roi" = @{
        category = "Marketing & Media"; tags = @("Agency Landscape", "Digital Transformation") }
    "bringing-the-retail-mindset-to-finance-how-personalization-can-transform-banking-in-apac" = @{
        category = "Commerce & Growth"; tags = @("Digital Transformation", "APAC", "Customer Experience") }
    "contextual-ai-for-ecommerce-beyond-the-click-and-into-the-conversation" = @{
        category = "AI & Technology"; tags = @("Enterprise AI", "Ecommerce", "Customer Experience") }
    "crafting-a-strong-digital-identity-for-startups-essential-branding-tips" = @{
        category = "Marketing & Media"; tags = @("Brand Strategy", "Marketing Technology") }
    "data-warehousing-as-a-cdp-can-you-really-have-it-all" = @{
        category = "AI & Technology"; tags = @("Marketing Technology", "Enterprise AI", "Customer Experience") }
    "done-calling-myself-ecommerce" = @{
        category = "Digital Transformation"; tags = @("Digital Transformation", "Leadership", "Ecommerce") }
    "e-commerce-in-2025-trends-statistics-and-strategies-to-stay-ahead" = @{
        category = "Commerce & Growth"; tags = @("Ecommerce", "AI in Marketing", "Social Commerce") }
    "ex-merkle-md-joins-silk-commerce" = @{
        category = "Leadership"; tags = @("Leadership", "APAC") }
    "fractional-marketing-revolutionize-startups-small-businesses" = @{
        category = "Marketing & Media"; tags = @("Marketing Technology", "Leadership", "Agency Landscape") }
    "generative-ai-in-marketing-my-thoughts-on-the-industrys-progress-and-challenges" = @{
        category = "AI & Technology"; tags = @("Generative AI", "AI in Marketing", "Agency Landscape") }
    "getting-enterprise-ai-right-the-work-that-comes-before-deployment" = @{
        category = "AI & Technology"; tags = @("Enterprise AI", "Digital Transformation", "Programme Delivery") }
    "how-ai-and-human-imagination-work-together" = @{
        category = "AI & Technology"; tags = @("Generative AI", "AI in Marketing") }
    "infinity-loops-the-framework-behind-successful-brand-stories" = @{
        category = "Commerce & Growth"; tags = @("Customer Experience", "Brand Strategy", "Ecommerce") }
    "is-saas-being-dismantled-by-ai" = @{
        category = "AI & Technology"; tags = @("Enterprise AI", "Marketing Technology", "Agentic AI") }
    "is-salesforce-becoming-invisible-on-purpose-or-becoming-irrelevant" = @{
        category = "AI & Technology"; tags = @("Agentic AI", "Enterprise AI", "Marketing Technology") }
    "is-using-ai-in-creative-work-wrong" = @{
        category = "AI & Technology"; tags = @("Generative AI", "AI in Marketing", "Agency Landscape") }
    "leadership-lessons-from-the-vatican-consensus-as-a-catalyst-for-digital-transformation" = @{
        category = "Leadership"; tags = @("Leadership", "Digital Transformation") }
    "leadership-styles-and-their-impact-on-marketing-and-branding" = @{
        category = "Leadership"; tags = @("Leadership", "Brand Strategy") }
    "marketing-101-fundamental-principles-for-sustainable-business-growth" = @{
        category = "Marketing & Media"; tags = @("Marketing Technology", "Brand Strategy", "Customer Experience") }
    "mastering-ai-prompting-frameworks-for-marketers-transforming-campaigns-with-the-right-ai-tools" = @{
        category = "AI & Technology"; tags = @("AI in Marketing", "Generative AI", "Marketing Technology") }
    "new-merkle-md" = @{
        category = "Leadership"; tags = @("Leadership", "APAC") }
    "programmatic-transparency-in-2026-why-agencies-are-fighting-the-trade-desk" = @{
        category = "Marketing & Media"; tags = @("Programmatic", "Agency Landscape", "Marketing Technology") }
    "redefining-media-agency-success-embracing-innovation-in-the-digital-era" = @{
        category = "Marketing & Media"; tags = @("Agency Landscape", "AI in Marketing", "Digital Transformation") }
    "redefining-the-career-ladder-how-ai-sidelines-entry-level-learning-in-apac" = @{
        category = "Leadership"; tags = @("Leadership", "APAC", "Enterprise AI") }
    "shoppable-media-as-an-omnichannel-strategy-a-warc-exclusive-article" = @{
        category = "Commerce & Growth"; tags = @("Ecommerce", "Social Commerce", "Marketing Technology") }
    "thank-you-merkle" = @{
        category = "Leadership"; tags = @("Leadership", "APAC") }
    "the-ad-agency-holding-company-transformation-what-2026-is-really-telling-us-about-the-future-of-marketing" = @{
        category = "Marketing & Media"; tags = @("Agency Landscape", "Digital Transformation", "AI in Marketing") }
    "the-ai-revolution-how-llms-are-reshaping-search-and-the-future-of-seo" = @{
        category = "AI & Technology"; tags = @("Future of Search", "Enterprise AI", "Generative AI") }
    "the-future-of-social-commerce-why-brands-need-to-own-their-customer-data" = @{
        category = "Commerce & Growth"; tags = @("Social Commerce", "Marketing Technology", "Ecommerce") }
    "the-power-of-engagement-how-buy-socials-messaging-and-notifications-system-stands-out" = @{
        category = "Commerce & Growth"; tags = @("Customer Experience", "Marketing Technology", "Ecommerce") }
    "the-rise-of-cxm" = @{
        category = "Commerce & Growth"; tags = @("Customer Experience", "Marketing Technology", "Ecommerce") }
    "what-i-learned-directing-ai-as-my-primary-engineer" = @{
        category = "AI & Technology"; tags = @("Enterprise AI", "Agentic AI", "Programme Delivery") }
    "what-the-next-generation-of-delivery-leadership-may-look-like" = @{
        category = "Leadership"; tags = @("Leadership", "Programme Delivery", "Enterprise AI") }
    "why-retail-often-leads-in-digital-innovation-over-banking-and-what-we-can-learn-from-it" = @{
        category = "Commerce & Growth"; tags = @("Digital Transformation", "Ecommerce", "APAC") }
    "your-brain-was-not-built-for-this-why-i-built-a-second-one-in-obsidian" = @{
        category = "AI & Technology"; tags = @("Generative AI", "Leadership", "Enterprise AI") }
}

$updated = 0
$notFound = 0

foreach ($slug in $updates.Keys) {
    $filePath = Join-Path $postsDir "$slug.md"
    if (-not (Test-Path $filePath)) {
        Write-Warning "NOT FOUND: $slug.md"
        $notFound++
        continue
    }

    $u = $updates[$slug]
    $tagsJson = '["' + ($u.tags -join '", "') + '"]'
    $newCategory = $u.category

    if ($DryRun) {
        Write-Host "DRY: $slug -> category: $newCategory | tags: $tagsJson" -ForegroundColor Cyan
        continue
    }

    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    # Replace category line
    $content = $content -replace '(?m)^category:.*$', "category: $newCategory"

    # Replace tags line (handles inline array format: tags: [...])
    $content = $content -replace '(?m)^tags:.*$', "tags: $tagsJson"

    [System.IO.File]::WriteAllText($filePath, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "OK: $slug" -ForegroundColor Green
    $updated++
}

Write-Host ""
Write-Host "Done. Updated: $updated | Not found: $notFound"
