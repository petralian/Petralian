# SiteMonitor — digest source patches (TAG)

## Overview

TAG digests combine **topic buckets** (`petralian/*`) with profile-specific RSS, site-section crawls, and search query boosts. Petralian repo holds **SSOT JSON** patches merged into the VPS Docker `sitemonitor` volume on deploy.

| SSOT file | Focus |
|-----------|--------|
| `data/sitemonitor/adland-sources.json` | APAC agency trade press (Marketing Interactive, Campaign Asia, Mumbrella) |
| `data/sitemonitor/creative-tech-sources.json` | Creative production, gen-AI tooling, holding competitors (WPP, Publicis, Omnicom, Dentsu, IPG, Havas, Accenture Song/Sapient) |

Holding sites often lack stable public RSS; those entries use `type: "site-section"` plus `searchQueryBoosts` so digest search still surfaces WPP Open, Publicis Sapient, Accenture Song, etc.

## Apply pipeline

| File | Role |
|------|------|
| `scripts/sitemonitor/apply-digest-sources.mjs` | Merges one `*-sources.json` into `data/config.json` + `data/topics/petralian/*.json` |
| `scripts/patch-sitemonitor-digest-sources.sh` | Copies apply script + **all** `data/sitemonitor/*-sources.json` into container, one restart |
| `scripts/patch-sitemonitor-adland-sources.sh` | Thin wrapper → digest patch (back-compat) |

**Deploy:** `Deploy to VPS` runs `patch-sitemonitor-digest-sources.sh` after the main app deploy.

**Manual:** SSH → `cd /www/wwwroot/petralian && bash scripts/patch-sitemonitor-digest-sources.sh`

**Workflow:** `Patch SiteMonitor digest sources (TAG)` (`patch-sitemonitor-digest.yml`)

## Verify

1. Actions log: `[adland-patch] profile tag`, `[creative-tech-patch] profile tag`, and `topic file .../agency-media.json`, `.../creative-tech.json`, etc.
2. Next 07:00 Asia/Singapore TAG digest should include adland + creative-tech items when they match interest text
3. Optional: `docker exec sitemonitor npm run digest -- --send` (slow; off-peak)

## Engine source of truth

Application code remains on VPS (`/opt/sitemonitor` image). Phase D: import into private `petralian/sitemonitor` for in-repo `run-digest.mjs` changes.

See also: `docs/ops/sitemonitor-adland-sources.md` (historical note — superseded by this doc for operations).
