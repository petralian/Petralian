# Brevo API key — SiteMonitor digests

## Symptom

Deploy log shows:

```text
Brevo send failed: 401 {"message":"Key not found","code":"unauthorized"}
```

Digest runs (`npm run digest -- --send`) but **no email**.

## Which key to use

In Brevo → **SMTP & API** → **API keys**, use the key named **`petralian.com`** (masked suffix ends in **`7fWKhP`** in the dashboard).

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

1. **Petralian** repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Name: `BREVO_API_KEY` — value: full **petralian.com** key from Brevo.
3. Run **Fix SiteMonitor emails** (or push to `master`).

The deploy hook sets `BREVO_API_KEY_OVERRIDE` from that secret and updates both `petralian/.env` and `/opt/sitemonitor/.env`.

## Verify in Actions log

After the fix script runs, look for:

```text
[monitor-fix] BREVO petralian.env: suffix=…7fWKhP valid=yes
```

If `valid=no` or suffix is `…45M8MK`, the wrong key is still on the server.
