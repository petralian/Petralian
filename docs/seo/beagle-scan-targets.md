# Beagle Security — scan targets (petralian.com)

Run one quarterly scan in Beagle dashboard. Export PDF → vault `Operations/Security Audits/`.

## URLs to include

### Public pages

- `https://petralian.com/`
- `https://petralian.com/posts`
- `https://petralian.com/about`
- `https://petralian.com/lost-in-space`
- `https://petralian.com/posts/knowledge-work-agent-engine-guide-2026` (long MDX sample)

### API routes

| Route | Method | Notes |
|-------|--------|-------|
| `/api/subscribe` | POST | Rate-limited; honeypot `company` field |
| `/api/subscribe/confirm` | GET | HMAC token + 24h window |
| `/api/unsubscribe` | GET/POST | Signed tokens |
| `/api/newsletter/weekly` | GET | Requires `CRON_SECRET` header |
| `/api/orbit-rush/leaderboard` | GET/POST | Redis-backed; name/score validation |

### Admin

- `https://petralian.com/admin` — TinaCMS SPA (auth required)

## Pre-scan repo checks (2026-07-13)

- Subscribe route: IP rate limit (6 / 10 min), confirm HMAC
- Leaderboard POST: server-side validation via `saveLeaderboardEntry`
- Cron: protected by `CRON_SECRET`
- `.env` gitignored — no secrets in repo

## After scan

- [ ] Zero **critical** findings
- [ ] Fix **high** on API routes before promoting Orbit Rush leaderboard
- [ ] Document accepted **medium** (e.g. missing security headers) as open loops

## Headers to verify (manual or Beagle)

- `Strict-Transport-Security` (Vercel default)
- `X-Content-Type-Options`
- `Referrer-Policy`
