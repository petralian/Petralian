# Brevo API key — SiteMonitor digests

## Symptom

Deploy log shows:

```text
Brevo send failed: 401 {"message":"Key not found","code":"unauthorized"}
```

Digest runs (`npm run digest -- --send`) but **no email**.

## Which key to use

In Brevo → **SMTP & API** → **API keys**, use the key named **`petralian.com`** (check the masked suffix in the Brevo UI — it must match what Actions logs as `suffix=...`).

Do **not** use the **`ftm`** key (`…45M8MK`) for SiteMonitor unless you intentionally route digests through that account.

## Fix on VPS (manual)

1. Brevo → copy the **petralian.com** API key (full `xkeysib-…` value).
2. SSH (port `2245`):

   ```bash
   nano /www/wwwroot/petralian/.env
   ```

   Set one line (no quotes):

   ```env
   BREVO_API_KEY=xkeysib-...
   ```

3. GitHub → **Actions** → **Fix SiteMonitor emails** → **Run workflow**.

## Fix via GitHub secret (recommended)

1. **Petralian** repo → **Settings** → **Secrets and variables** → **Actions** → **Repository secrets** (not Environment secrets).
2. Name: **`BREVO_API_KEY`** — value: full key from Brevo (`xkeysib-…`). **Never** put this in `.env.example` or commit it (public repo).
3. Run **Fix SiteMonitor emails** or push to `master` (deploy hook runs the same script over SSH).

**Note:** “GitHub Environment `production`” (Phase E) is optional — repository secret `BREVO_API_KEY` is enough for current workflows.

The deploy hook sets `BREVO_API_KEY_OVERRIDE` from that secret and updates both `petralian/.env` and `/opt/sitemonitor/.env`.

## Verify in Actions log

After the fix script runs, look for:

```text
[monitor-fix] BREVO petralian.env: suffix=…XXXXXX valid=yes (Brevo /v3/account)
[monitor-fix] BREVO petralian.env: suffix=…XXXXXX smtp_auth=yes
```

If `valid=yes` but `smtp_auth=no`, or digest still shows `Key not found`, the deploy script now rewrites any stale `xkeysib-*` entries in SiteMonitor `data/config.json` on the Docker volume. Re-run **Fix SiteMonitor emails** or push to `master`.

If `valid=no`, the wrong or revoked key is still in GitHub secret `BREVO_API_KEY`.
