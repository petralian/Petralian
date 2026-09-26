# SiteMonitor — APAC adland sources (TAG digest)

## Problem

TAG digests were heavy on generic `petralian/*` topic buckets (enterprise AI, cursor, etc.) and rarely surfaced **agency trade press** (Marketing Interactive, Campaign Asia, …) even when stories were directly relevant (e.g. agency technology leadership).

## Fix (in Petralian repo)

| File | Role |
|------|------|
| `data/sitemonitor/adland-sources.json` | SSOT: RSS URLs, query boosts, TAG profile matchers |
| `scripts/sitemonitor/apply-adland-sources.mjs` | Merges SSOT into container `data/config.json` + `data/topics/petralian/*.json` |
| `scripts/patch-sitemonitor-adland-sources.sh` | Copies files into Docker `sitemonitor` and runs apply |

**Deploy:** `Deploy to VPS` runs `patch-sitemonitor-adland-sources.sh` after the main app deploy.

**Manual:** SSH to VPS → `cd /www/wwwroot/petralian && bash scripts/patch-sitemonitor-adland-sources.sh`

## Verify

1. Actions log: `[adland-patch] profile tag` (or similar) and `topic file .../agency-media.json`
2. Next 07:00 Asia/Singapore TAG digest should include Marketing Interactive / Campaign items when they match the interest sentence
3. Optional: `docker exec sitemonitor npm run digest -- --send` (slow; use off-peak)

## Engine source of truth

Application code still lives on the VPS (`/opt/sitemonitor` Docker image). Phase D: import into private `petralian/sitemonitor` for in-repo edits to `scripts/run-digest.mjs` selection logic.
