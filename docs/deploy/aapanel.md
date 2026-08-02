# Petralian on aaPanel (VPS)

> **SSOT paths/ports:** `data/deploy.yaml`  
> **Env template:** `deploy/env.production.example`  
> **Nginx snippet:** `deploy/nginx/petralian.conf`  
> **Deploy script:** `scripts/deploy-on-vps.sh`  
> **PM2:** `ecosystem.config.cjs`

Move the live site from Vercel to your VPS (4c / 8GB is enough to build on-server).

---

## What you do in aaPanel (one-time)

### 1. Install Node.js

1. **App Store** → **Node.js Version Manager** → Install  
2. Install **Node 20 LTS** (or 22)  
3. **App Store** → **PM2 Manager** → Install (optional; CLI `pm2` also works)

### 2. Create the site

1. **Website** → **Add site**  
2. Domain: `petralian.com` (+ `www.petralian.com` if you use www)  
3. PHP version does not matter — Nginx will proxy to Node

### 3. Clone the repo

**Terminal** (aaPanel) or SSH:

```bash
cd /www/wwwroot
git clone https://github.com/petralian/Petralian.git petralian
cd petralian
git checkout master
```

Use a deploy key or PAT if the repo is private.

### 4. Production environment

```bash
cp deploy/env.production.example .env
nano .env   # paste secrets from Vercel → Settings → Environment Variables
```

**Required for full parity:**

| Variable | Used for |
|----------|----------|
| `BREVO_API_KEY`, `BREVO_LIST_ID` | Newsletter subscribe |
| `UNSUBSCRIBE_SECRET` | Unsubscribe + digest links |
| `CRON_SECRET` | Weekly digest API auth |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Orbit Rush leaderboard |

Copy values from your Vercel project dashboard.

### 5. First build + start

**Important:** Run the app with **CLI PM2 only** (`ecosystem.config.cjs`). Do **not** also use **Website → Node.js Project** for the same site — two managers fight over port 3000 and cause 502s during deploy. If you created a Node.js Project in aaPanel, delete it or leave it stopped permanently.

```bash
cd /www/wwwroot/petralian
npm ci
export NODE_OPTIONS=--max-old-space-size=2048
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed command so PM2 survives reboot
```

**Smoke test before DNS:**

```bash
curl -I http://127.0.0.1:3000/
```

Open `http://YOUR_VPS_IP:3000` only if port 3000 is open in the firewall (not required if you test via Nginx below).

### 6. Nginx reverse proxy

**Option A — aaPanel UI:** Website → `petralian.com` → **Reverse proxy** → target `http://127.0.0.1:3000`

**Option B — Config file:** Website → **Config** → inside `server { }`, paste contents of `deploy/nginx/petralian.conf`

Save → **Nginx** → test config → reload.

### 7. SSL

Website → `petralian.com` → **SSL** → **Let's Encrypt** → Apply for both apex + www.

### 8. Weekly newsletter cron

**Cron** → Add task:

| Field | Value |
|-------|--------|
| Type | Shell script |
| Schedule | `0 1 * * 1` (Monday 09:00 HKT / 01:00 UTC) |
| Script | See below |

```bash
curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://petralian.com/api/newsletter/weekly \
  >> /www/wwwlogs/petralian-newsletter.log 2>&1
```

Use the same `CRON_SECRET` as in `.env`.

### 9. (Optional) Auto-deploy on git push

GitHub → repo **Settings → Secrets → Actions**:

| Secret | Value |
|--------|--------|
| `VPS_HOST` | VPS public IP or hostname |
| `VPS_USER` | SSH user (often `root` or `www`) |
| `VPS_SSH_KEY` | Private key (ed25519) with access to the server |

**SSH port:** `2245` (aaPanel default is often not 22 — must match `.github/workflows/deploy-vps.yml` and `data/deploy.yaml` → `vps.ssh_port`).

Then pushes to `master` run `.github/workflows/deploy-vps.yml`.  
Content publishes (`[skip ci]` commits) trigger deploy from `auto-publish.yml` when new posts land.

---

## What you do in Cloudflare

1. **DNS → Records**  
   - `@` → **A** → your VPS IP (proxied orange cloud OK)  
   - `www` → **CNAME** → `petralian.com` (or A to same IP)  
   - Remove old Vercel CNAME (`cname.vercel-dns.com`) if present  

2. **Before cutover:** lower TTL to **300** seconds (5 min)  

3. **SSL/TLS → Overview:** mode **Full (strict)** once Let's Encrypt works on the VPS  

4. **Optional:** **Caching → Configuration** → Cache Rules: bypass cache for `/api/*` if API routes behave oddly behind CDN  

5. **Cutover:** only after `curl -I https://petralian.com` works with a **hosts file** test or temporary subdomain — see below  

### Hosts-file test (zero-downtime rehearsal)

On your PC, add:

```
YOUR_VPS_IP  petralian.com www.petralian.com
```

Browse the site. Remove the line before switching Cloudflare DNS.

---

## Day-2 operations

### Zero-downtime deploys (vs Vercel)

| Vercel | This VPS setup |
|--------|----------------|
| Builds off-box, swaps traffic atomically | Builds on-server while **old PM2 workers keep serving** |
| You never see 502 from a deploy | Brief 502 only if **all** workers die before new ones listen |

**How we minimize downtime:**

1. **Build first, reload last** — `npm ci` + `next build` run while the live app stays up.
2. **PM2 cluster (2 workers)** — `pm2 reload` restarts one worker at a time (`data/deploy.yaml` → `pm2_instances: 2`).
3. **Health check + auto-restart** — if reload fails, `deploy-on-vps.sh` runs `pm2 restart` before exiting.

**One-time on the VPS** (after pulling this change):

```bash
cd /www/wwwroot/petralian
git pull origin master
pm2 delete petralian 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
```

You should see **2** `petralian` workers in `pm2 status`.

### Manual redeploy (SSH)

```bash
cd /www/wwwroot/petralian
bash scripts/deploy-on-vps.sh
```

### Logs

```bash
pm2 logs petralian
pm2 status
```

### After Vercel cutover

1. Remove `petralian.com` from Vercel project domains (or delete project)  
2. Keep Upstash + Brevo as-is — same env vars on VPS  
3. ISR/revalidate runs on your Node process (no Vercel ISR write quota)  

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build OOM | `export NODE_OPTIONS=--max-old-space-size=2048` before build; add 2GB swap in aaPanel |
| 502 Bad Gateway | `pm2 status` — app down? `pm2 restart petralian`. Check you are **not** using aaPanel Node.js Project + CLI PM2 together. |
| Newsletter 401 | `CRON_SECRET` mismatch between cron script and `.env` |
| Leaderboard empty | Check Upstash env vars; `pm2 restart` after `.env` change |
| SSL loop | Cloudflare SSL = Full (strict); origin must have valid Let's Encrypt cert |

---

## File map

```
petralian/
├── ecosystem.config.cjs      # PM2
├── scripts/deploy-on-vps.sh # pull → build → reload
├── deploy/
│   ├── env.production.example
│   └── nginx/petralian.conf
├── data/deploy.yaml          # port, paths (SSOT)
└── .github/workflows/deploy-vps.yml
```
