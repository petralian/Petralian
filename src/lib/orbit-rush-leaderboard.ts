import type { PlayDevice } from "@/lib/play-device";

export interface LeaderboardEntry {
  name: string;
  score: number;
  device?: PlayDevice;
  createdAt: string;
}

export const LEADERBOARD_MAX = 10;

export function formatLeaderboardScore(score: number): number {
  return Math.round(score);
}

export function qualifiesForLeaderboard(
  entries: LeaderboardEntry[],
  score: number
): boolean {
  const rounded = formatLeaderboardScore(score);
  if (rounded <= 0) return false;
  if (entries.length < LEADERBOARD_MAX) return true;
  const lowest = entries[entries.length - 1]?.score ?? 0;
  return rounded > lowest;
}

export function sanitizeLeaderboardName(name: string): string {
  const trimmed = name.trim().slice(0, 20);
  const cleaned = trimmed.replace(/[^\w@.\- ]/g, "").trim();
  return cleaned || "PILOT";
}

export function sanitizeLeaderboardScore(score: unknown): number | null {
  const n = formatLeaderboardScore(Number(score));
  if (!Number.isFinite(n) || n <= 0 || n > 999_999) return null;
  return n;
}

export function sanitizeLeaderboardDevice(
  device: unknown
): PlayDevice | undefined {
  if (device === "mobile" || device === "tablet" || device === "desktop") {
    return device;
  }
  return undefined;
}

export function sortLeaderboard(
  entries: LeaderboardEntry[]
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score).slice(0, LEADERBOARD_MAX);
}
