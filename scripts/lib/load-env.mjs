import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const ENV_PATH = path.join(ROOT, ".env");

/** Read one key from process.env or repo .env (no dotenv dependency). */
export function loadEnvKey(name) {
  if (process.env[name]) return process.env[name].trim();
  if (!fs.existsSync(ENV_PATH)) return "";
  const line = fs
    .readFileSync(ENV_PATH, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}=`) && !l.startsWith("#"));
  if (!line) return "";
  return line.slice(name.length + 1).trim();
}
