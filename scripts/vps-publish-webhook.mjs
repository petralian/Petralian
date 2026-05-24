#!/usr/bin/env node
/**
 * vps-publish-webhook.mjs
 *
 * Lightweight webhook server to run on your VPS.
 * Accepts an authenticated POST /publish request and triggers
 * the GitHub Actions auto-publish workflow.
 *
 * Deploy with Docker Compose — see the snippet in the README below.
 *
 * Required environment variables (set in docker-compose or .env):
 *   WEBHOOK_SECRET  — shared secret; caller must send header  X-Webhook-Secret: <value>
 *   GH_TOKEN        — GitHub PAT with "Actions: Write" on the Petralian repo
 *   GH_REPO         — e.g. "yourusername/petralian"
 *   PORT            — (optional) port to listen on; default 9877
 *
 * Manual trigger (no server needed — just run this curl command from anywhere):
 *   curl -X POST \
 *     -H "Authorization: Bearer <GH_TOKEN>" \
 *     -H "Accept: application/vnd.github.v3+json" \
 *     https://api.github.com/repos/<GH_REPO>/actions/workflows/auto-publish.yml/dispatches \
 *     -d '{"ref":"master"}'
 */

import { createServer } from 'http';
import { request as httpsRequest } from 'https';

const PORT   = parseInt(process.env.PORT || '9877', 10);
const SECRET = process.env.WEBHOOK_SECRET;
const TOKEN  = process.env.GH_TOKEN;
const REPO   = process.env.GH_REPO;

if (!SECRET || !TOKEN || !REPO) {
  console.error('Error: WEBHOOK_SECRET, GH_TOKEN, and GH_REPO must all be set.');
  process.exit(1);
}

// ── Trigger GitHub Actions workflow_dispatch ──────────────────────────────────
function triggerWorkflow(force = false) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ ref: 'master', inputs: { force: force ? 'true' : 'false' } });

    const opts = {
      hostname: 'api.github.com',
      path:     `/repos/${REPO}/actions/workflows/auto-publish.yml/dispatches`,
      method:   'POST',
      headers: {
        'Authorization':  `Bearer ${TOKEN}`,
        'Accept':         'application/vnd.github.v3+json',
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent':     'petralian-webhook-server/1.0',
      },
    };

    const req = httpsRequest(opts, (res) => {
      // 204 = accepted; 422 = bad ref
      if (res.statusCode === 204) {
        resolve();
      } else {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => reject(new Error(`GitHub API ${res.statusCode}: ${data}`)));
      }
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = createServer((req, res) => {
  const log = (msg) => console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} — ${msg}`);

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', repo: REPO }));
    return;
  }

  // Publish trigger
  if (req.method === 'POST' && (req.url === '/publish' || req.url === '/publish?force=true')) {
    const secret = req.headers['x-webhook-secret'];
    if (secret !== SECRET) {
      log('Unauthorized');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    const force = req.url.includes('force=true');

    triggerWorkflow(force)
      .then(() => {
        log('Workflow triggered OK');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'triggered', force, repo: REPO }));
      })
      .catch((err) => {
        log(`Error: ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Bind to localhost only — nginx or aaPanel handles HTTPS termination
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Petralian publish webhook listening on 127.0.0.1:${PORT}`);
  console.log(`POST /publish  with header  X-Webhook-Secret: <secret>  to trigger a publish`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
