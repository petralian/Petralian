import { NextResponse } from "next/server";
import {
  loadLeaderboard,
  leaderboardStorageConfigured,
  saveLeaderboardEntry,
} from "@/lib/orbit-rush-leaderboard-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scores = await loadLeaderboard();
    return NextResponse.json({
      scores,
      storage: leaderboardStorageConfigured() ? "server" : "unconfigured",
    });
  } catch (error) {
    console.error("orbit-rush leaderboard GET failed", error);
    return NextResponse.json(
      { scores: [], error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!leaderboardStorageConfigured()) {
    return NextResponse.json(
      { error: "Leaderboard storage is not configured on the server" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      score?: number;
      device?: string;
    };
    const result = await saveLeaderboardEntry({
      name: body.name ?? "",
      score: body.score ?? 0,
      device: body.device,
    });

    if (!result.accepted) {
      return NextResponse.json(
        { error: "Score does not qualify for the leaderboard", scores: result.entries },
        { status: 400 }
      );
    }

    return NextResponse.json({ scores: result.entries });
  } catch (error) {
    console.error("orbit-rush leaderboard POST failed", error);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}
