/**
 * PM2 process file for aaPanel / VPS.
 * Cluster mode: `pm2 reload` restarts workers one-by-one (near zero-downtime).
 * Start: pm2 start ecosystem.config.cjs
 * Reload after deploy: pm2 reload ecosystem.config.cjs --update-env
 */
const { readFileSync } = require("fs");

let port = 3000;
let instances = 2;
let execMode = "cluster";

try {
  const raw = readFileSync("./data/deploy.yaml", "utf8");
  const portMatch = raw.match(/^\s*port:\s*(\d+)/m);
  if (portMatch) port = Number(portMatch[1]);
  const instMatch = raw.match(/^\s*pm2_instances:\s*(\d+)/m);
  if (instMatch) instances = Number(instMatch[1]);
  const modeMatch = raw.match(/^\s*pm2_exec_mode:\s*(\w+)/m);
  if (modeMatch) execMode = modeMatch[1];
} catch {
  // defaults above
}

/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "petralian",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${port}`,
      instances,
      exec_mode: execMode,
      autorestart: true,
      max_memory_restart: "1500M",
      kill_timeout: 8000,
      listen_timeout: 15000,
      reload_delay: 2000,
      max_restarts: 10,
      min_uptime: 5000,
      env: {
        NODE_ENV: "production",
        PORT: String(port),
      },
    },
  ],
};
