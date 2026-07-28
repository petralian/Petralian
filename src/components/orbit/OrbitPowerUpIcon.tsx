"use client";

import { useEffect, useRef } from "react";
import { drawPowerUpIcon, type PowerUpType } from "@/orbit-game/orbit";

const ICON_SIZE = 28;

export default function OrbitPowerUpIcon({ type }: { type: PowerUpType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
    drawPowerUpIcon(ctx, type, ICON_SIZE);
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="orbit-powerup-icon"
      aria-hidden
    />
  );
}
