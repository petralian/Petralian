import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";
import {
  LEADERBOARD_MAX,
  type LeaderboardEntry,
  sanitizeLeaderboardDevice,
  sanitizeLeaderboardName,
  sanitizeLeaderboardScore,
  sortLeaderboard,
} from "@/lib/orbit-rush-leaderboard";

const REDIS_KEY = "orbit-rush:leaderboard";
const DEV_FILE = path.join(process.cwd(), "data", "orbit-rush-leaderboard.json");

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv();
  }
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return null;
}

async function readDevFile(): Promise<LeaderboardEntry[]> {
  try {
    const raw = await readFile(DEV_FILE, "utf8");
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) ? sortLeaderboard(parsed) : [];
  } catch {
    return [];
  }
}

async function writeDevFile(entries: LeaderboardEntry[]): Promise<void> {
  await mkdir(path.dirname(DEV_FILE), { recursive: true });
  await writeFile(DEV_FILE, JSON.stringify(entries, null, 2), "utf8");
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<LeaderboardEntry[]>(REDIS_KEY);
    return sortLeaderboard(Array.isArray(data) ? data : []);
  }
  if (process.env.NODE_ENV === "development") {
    return readDevFile();
  }
  return [];
}

export async function saveLeaderboardEntry(input: {
  name: string;
  score: number;
  device?: string;
}): Promise<{ entries: LeaderboardEntry[]; accepted: boolean }> {
  const score = sanitizeLeaderboardScore(input.score);
  if (score === null) {
    return { entries: await loadLeaderboard(), accepted: false };
  }

  const name = sanitizeLeaderboardName(input.name);
  const device = sanitizeLeaderboardDevice(input.device);
  const current = await loadLeaderboard();
  const lowest = current[LEADERBOARD_MAX - 1]?.score ?? 0;
  if (current.length >= LEADERBOARD_MAX && score <= lowest) {
    return { entries: current, accepted: false };
  }

  const entry: LeaderboardEntry = {
    name,
    score,
    device,
    createdAt: new Date().toISOString(),
  };
  const updated = sortLeaderboard([...current, entry]);

  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, updated);
    return { entries: updated, accepted: true };
  }
  if (process.env.NODE_ENV === "development") {
    await writeDevFile(updated);
    return { entries: updated, accepted: true };
  }

  throw new Error("Leaderboard storage is not configured");
}

export function leaderboardStorageConfigured(): boolean {
  return (
    Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ) ||
    Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    process.env.NODE_ENV === "development"
  );
}
