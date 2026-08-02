/**
 * PM2 process file for aaPanel / VPS.
 * Start: pm2 start ecosystem.config.cjs
 * Reload after deploy: pm2 reload ecosystem.config.cjs --update-env
 */
const { readFileSync } = require("fs");

let port = 3000;
try {
  const raw = readFileSync("./data/deploy.yaml", "utf8");
  const match = raw.match(/^\s*port:\s*(\d+)/m);
  if (match) port = Number(match[1]);
} catch {
  // default 3000
}

/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "petralian",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${port}`,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1500M",
      env: {
        NODE_ENV: "production",
        PORT: String(port),
      },
    },
  ],
};
