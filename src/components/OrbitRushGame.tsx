"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { SITE_URL } from "@/lib/constants";

// ── Virtual playfield (letterboxed — uniform scale, delta-time physics) ────────
const VW = 800;
const VH = 500;
const CX = VW / 2;
const CY = VH / 2 - 10;
const R_MIN = 58;
const R_MAX = 215;
const PLAYER_R = 9;
const HOLE_R = 42;

const GRAVITY = 420;
const EXPAND_FORCE = 520;
const RADIAL_DAMP = 0.92;
const BASE_ORBIT_SPEED = 1.35;
const BASE_SPAWN_MS = 2200;

type PowerType = "slow" | "invincible" | "shield" | "nova" | "double" | "magnet";

const POWER_META: Record<
  PowerType,
  { label: string; color: string; desc: string }
> = {
  slow: { label: "SLOW", color: "#6ef", desc: "Slow motion 5s" },
  invincible: { label: "STAR", color: "#fd4", desc: "Invincible 5s" },
  shield: { label: "SHLD", color: "#4af", desc: "Absorb 1 hit" },
  nova: { label: "NOVA", color: "#f75", desc: "Clear hazards" },
  double: { label: "2×", color: "#ff8", desc: "Double score 8s" },
  magnet: { label: "MAG", color: "#c8f", desc: "Pull pickups 6s" },
};

const POWER_TYPES: PowerType[] = [
  "slow",
  "invincible",
  "shield",
  "nova",
  "double",
  "magnet",
];

interface Star {
  x: number;
  y: number;
  z: number;
  b: number;
}

interface Hazard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Pickup {
  x: number;
  y: number;
  type: PowerType;
  pulse: number;
}

interface Effects {
  slowUntil: number;
  invincibleUntil: number;
  shield: boolean;
  doubleUntil: number;
  magnetUntil: number;
}

interface HighScore {
  name: string;
  score: number;
}

type UiPhase = "idle" | "playing" | "entering-name" | "showing-scores";

const LS_KEY = "petralian_orbit_rush_hs";
const SHARE_PATH = "/lost-in-space";

function loadScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HighScore[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveScores(scores: HighScore[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(scores));
  } catch {
    /* noop */
  }
}

function qualifies(scores: HighScore[], score: number): boolean {
  if (score <= 0) return false;
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}

function initStars(n: number): Star[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * VW,
    y: Math.random() * VH,
    z: 0.15 + Math.random() * 0.85,
    b: 0.25 + Math.random() * 0.75,
  }));
}

function spawnHazard(difficulty: number, angleBias?: number): Hazard {
  const edge = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  const pad = 20;
  if (edge === 0) {
    x = Math.random() * VW;
    y = -pad;
  } else if (edge === 1) {
    x = VW + pad;
    y = Math.random() * VH;
  } else if (edge === 2) {
    x = Math.random() * VW;
    y = VH + pad;
  } else {
    x = -pad;
    y = Math.random() * VH;
  }

  const targetAngle =
    angleBias !== undefined
      ? angleBias + (Math.random() - 0.5) * 0.5
      : Math.atan2(CY - y, CX - x) + (Math.random() - 0.5) * 0.65;

  const speed = (95 + Math.random() * 55) * (0.85 + difficulty * 0.12);
  return {
    x,
    y,
    vx: Math.cos(targetAngle) * speed,
    vy: Math.sin(targetAngle) * speed,
    r: 5 + Math.random() * 5,
  };
}

function spawnPickup(): Pickup {
  const angle = Math.random() * Math.PI * 2;
  const dist = R_MIN + 40 + Math.random() * (R_MAX - R_MIN - 80);
  return {
    x: CX + Math.cos(angle) * dist,
    y: CY + Math.sin(angle) * dist,
    type: POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)]!,
    pulse: Math.random() * Math.PI * 2,
  };
}

function shareScore(score: number) {
  const url = `${SITE_URL}${SHARE_PATH}`;
  const text = `I scored ${score} in Lost in Space on Petralian. Can you beat it?`;
  if (typeof navigator !== "undefined" && navigator.share) {
    void navigator.share({
      title: "Lost in Space — Petralian",
      text,
      url,
    });
    return;
  }
  void navigator.clipboard?.writeText(`${text}\n${url}`);
}

const panelStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.78)",
  border: "1px solid rgba(68,170,255,0.35)",
  borderRadius: 8,
  padding: "14px 22px",
  minWidth: 260,
  backdropFilter: "blur(6px)",
};

function Leaderboard({
  scores,
  highlight,
}: {
  scores: HighScore[];
  highlight?: number;
}) {
  return (
    <div style={panelStyle}>
      <p
        style={{
          color: "#4af",
          fontSize: 12,
          letterSpacing: "0.15em",
          margin: "0 0 10px",
          textAlign: "center",
        }}
      >
        ── HIGH SCORES ──
      </p>
      {scores.length === 0 ? (
        <p
          style={{
            color: "#556",
            fontSize: 11,
            margin: 0,
            textAlign: "center",
          }}
        >
          NO SCORES YET
        </p>
      ) : (
        scores.map((s, i) => (
          <div
            key={`${s.name}-${s.score}-${i}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 12,
              color:
                highlight !== undefined && s.score === highlight
                  ? "#ff8"
                  : i === 0
                    ? "#4af"
                    : "#9ce",
              marginBottom: 3,
            }}
          >
            <span>
              {i + 1}. {s.name}
            </span>
            <span>{s.score}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default function OrbitRushGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [uiPhase, setUiPhase] = useState<UiPhase>("idle");
  const [pendingScore, setPendingScore] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const uiRef = useRef<UiPhase>("idle");

  const gameRef = useRef({
    phase: "idle" as "idle" | "playing" | "over",
    hold: false,
    angle: 0,
    radius: (R_MIN + R_MAX) / 2,
    radialVel: 0,
    hazards: [] as Hazard[],
    pickups: [] as Pickup[],
    stars: initStars(120),
    score: 0,
    gameTime: 0,
    spawnTimer: 0,
    pickupTimer: 6,
    effects: {
      slowUntil: 0,
      invincibleUntil: 0,
      shield: false,
      doubleUntil: 0,
      magnetUntil: 0,
    } as Effects,
    gameOverFired: false,
    animId: 0,
    lastTs: 0,
  });

  const setUi = useCallback((p: UiPhase) => {
    uiRef.current = p;
    setUiPhase(p);
  }, []);

  useEffect(() => {
    setHighScores(loadScores());
  }, []);

  const onGameOver = useCallback(
    (score: number) => {
      setPendingScore(score);
      const scores = loadScores();
      if (qualifies(scores, score)) {
        setUi("entering-name");
      } else {
        setHighScores(scores);
        setUi("showing-scores");
      }
    },
    [setUi]
  );

  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const submitName = useCallback(() => {
    const name = nameInput.trim() || "PILOT";
    const updated = [...loadScores(), { name, score: pendingScore }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    saveScores(updated);
    setHighScores(updated);
    setNameInput("");
    setUi("showing-scores");
  }, [nameInput, pendingScore, setUi]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.phase = "playing";
    g.hold = false;
    g.angle = -Math.PI / 2;
    g.radius = (R_MIN + R_MAX) / 2;
    g.radialVel = 0;
    g.hazards = [];
    g.pickups = [];
    g.score = 0;
    g.gameTime = 0;
    g.spawnTimer = 0.8;
    g.pickupTimer = 5;
    g.effects = {
      slowUntil: 0,
      invincibleUntil: 0,
      shield: false,
      doubleUntil: 0,
      magnetUntil: 0,
    };
    g.gameOverFired = false;
    g.lastTs = 0;
    setUi("playing");
  }, [setUi]);

  const handleShare = useCallback(() => {
    const score =
      uiPhase === "playing" ? gameRef.current.score : pendingScore;
    shareScore(score);
    setShareMsg("Link copied — share with friends!");
    setTimeout(() => setShareMsg(""), 2500);
  }, [pendingScore, uiPhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = gameRef.current;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const setHold = (v: boolean) => {
      if (g.phase === "playing") g.hold = v;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (uiRef.current === "idle" || uiRef.current === "showing-scores") {
          startGame();
        } else if (uiRef.current === "playing") {
          setHold(true);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setHold(false);
    };

    const onPointerDown = () => {
      if (uiRef.current === "idle" || uiRef.current === "showing-scores") {
        startGame();
      } else if (uiRef.current === "playing") {
        setHold(true);
      }
    };
    const onPointerUp = () => setHold(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    function applyPower(type: PowerType, now: number) {
      const e = g.effects;
      switch (type) {
        case "slow":
          e.slowUntil = Math.max(e.slowUntil, now + 5);
          break;
        case "invincible":
          e.invincibleUntil = Math.max(e.invincibleUntil, now + 5);
          break;
        case "shield":
          e.shield = true;
          break;
        case "nova":
          g.hazards = [];
          break;
        case "double":
          e.doubleUntil = Math.max(e.doubleUntil, now + 8);
          break;
        case "magnet":
          e.magnetUntil = Math.max(e.magnetUntil, now + 6);
          break;
      }
    }

    function difficulty() {
      return 1 + g.gameTime / 45;
    }

    function timeScale(now: number) {
      return now < g.effects.slowUntil ? 0.45 : 1;
    }

    function scoreMult(now: number) {
      return now < g.effects.doubleUntil ? 2 : 1;
    }

    function drawStars(drift: number) {
      for (const s of g.stars) {
        s.x += drift * s.z * 0.35;
        s.y += drift * s.z * 0.12;
        if (s.x < 0) s.x += VW;
        if (s.x > VW) s.x -= VW;
        if (s.y < 0) s.y += VH;
        if (s.y > VH) s.y -= VH;
        const a = s.b * (0.35 + s.z * 0.65);
        ctx!.fillStyle = `rgba(180,210,255,${a})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 0.6 + s.z * 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawScene(now: number) {
      ctx!.fillStyle = "#000";
      ctx!.fillRect(0, 0, VW, VH);
      drawStars(g.phase === "playing" ? 1.2 : 0.4);

      // Orbit guides
      ctx!.strokeStyle = "rgba(68,170,255,0.12)";
      ctx!.lineWidth = 1;
      for (const r of [R_MIN, R_MAX]) {
        ctx!.beginPath();
        ctx!.arc(CX, CY, r, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Black hole
      const grad = ctx!.createRadialGradient(CX, CY, 4, CX, CY, HOLE_R + 20);
      grad.addColorStop(0, "#111");
      grad.addColorStop(0.55, "#223");
      grad.addColorStop(1, "rgba(68,170,255,0.08)");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(CX, CY, HOLE_R + 16, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "rgba(68,170,255,0.35)";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.arc(CX, CY, HOLE_R, 0, Math.PI * 2);
      ctx!.stroke();

      // Pickups
      for (const p of g.pickups) {
        const meta = POWER_META[p.type];
        const pulse = 1 + Math.sin(p.pulse) * 0.15;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.fillStyle = meta.color;
        ctx!.shadowColor = meta.color;
        ctx!.shadowBlur = 12;
        ctx!.beginPath();
        ctx!.arc(0, 0, 11 * pulse, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = "#000";
        ctx!.font = "bold 8px monospace";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.shadowBlur = 0;
        ctx!.fillText(meta.label, 0, 1);
        ctx!.restore();
      }

      // Hazards
      for (const h of g.hazards) {
        ctx!.save();
        ctx!.translate(h.x, h.y);
        ctx!.fillStyle = "#f75";
        ctx!.shadowColor = "#f75";
        ctx!.shadowBlur = 8;
        ctx!.beginPath();
        ctx!.arc(0, 0, h.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      if (g.phase === "playing" || g.phase === "idle") {
        const px = CX + Math.cos(g.angle) * g.radius;
        const py = CY + Math.sin(g.angle) * g.radius;
        const inv = now < g.effects.invincibleUntil;
        const blink = inv && Math.floor(now * 10) % 2 === 0;
        if (!blink) {
          ctx!.save();
          ctx!.translate(px, py);
          if (g.effects.shield) {
            ctx!.strokeStyle = "rgba(68,170,255,0.85)";
            ctx!.lineWidth = 2;
            ctx!.beginPath();
            ctx!.arc(0, 0, PLAYER_R + 6, 0, Math.PI * 2);
            ctx!.stroke();
          }
          ctx!.fillStyle = inv ? "#fd4" : "#6ef";
          ctx!.shadowColor = inv ? "#fd4" : "#6ef";
          ctx!.shadowBlur = 14;
          ctx!.beginPath();
          ctx!.arc(0, 0, PLAYER_R, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }
      }

      // Ghost 404
      ctx!.save();
      ctx!.globalAlpha = 0.03;
      ctx!.fillStyle = "#fff";
      ctx!.font = "bold 200px Arial";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText("404", CX, CY);
      ctx!.restore();
    }

    function loop(ts: number) {
      if (!g.lastTs) g.lastTs = ts;
      let dt = Math.min((ts - g.lastTs) / 1000, 0.05);
      g.lastTs = ts;
      const now = ts / 1000;

      const canvasW = canvas!.width;
      const canvasH = canvas!.height;
      const scale = Math.min(canvasW / VW, canvasH / VH);
      const offX = (canvasW - VW * scale) / 2;
      const offY = (canvasH - VH * scale) / 2;

      ctx!.setTransform(scale, 0, 0, scale, offX, offY);

      if (g.phase === "idle") {
        g.angle += 0.25 * dt;
        drawScene(now);
        g.animId = requestAnimationFrame(loop);
        return;
      }

      if (g.phase === "over") {
        if (!g.gameOverFired) {
          g.gameOverFired = true;
          onGameOverRef.current(g.score);
        }
        g.angle += 0.2 * dt;
        drawScene(now);
        g.animId = requestAnimationFrame(loop);
        return;
      }

      const tscl = timeScale(now);
      const ddt = dt * tscl;
      const diff = difficulty();

      g.gameTime += dt;
      g.angle += BASE_ORBIT_SPEED * diff * ddt;

      if (g.hold) {
        g.radialVel += EXPAND_FORCE * ddt;
      } else {
        g.radialVel -= GRAVITY * ddt;
      }
      g.radialVel *= RADIAL_DAMP;
      g.radius += g.radialVel * ddt;
      if (g.radius < R_MIN) g.radius = R_MIN;
      if (g.radius > R_MAX) g.radius = R_MAX;

      const px = CX + Math.cos(g.angle) * g.radius;
      const py = CY + Math.sin(g.angle) * g.radius;

      // Spawn hazards — more frequent + multi-angle bursts as difficulty rises
      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) {
        const burst = Math.min(1 + Math.floor(diff / 1.8), 4);
        const baseAngle = Math.random() * Math.PI * 2;
        for (let i = 0; i < burst; i++) {
          g.hazards.push(
            spawnHazard(diff, baseAngle + (i * Math.PI * 2) / burst)
          );
        }
        g.spawnTimer =
          (BASE_SPAWN_MS / 1000) * (0.92 / diff) + 0.3 + Math.random() * 0.4;
      }

      g.pickupTimer -= dt;
      if (g.pickupTimer <= 0 && g.pickups.length < 2) {
        g.pickups.push(spawnPickup());
        g.pickupTimer = 7 + Math.random() * 6;
      }

      for (const h of g.hazards) {
        h.x += h.vx * ddt;
        h.y += h.vy * ddt;
      }
      g.hazards = g.hazards.filter(
        (h) => h.x > -60 && h.x < VW + 60 && h.y > -60 && h.y < VH + 60
      );

      for (const p of g.pickups) {
        p.pulse += dt * 4;
        if (now < g.effects.magnetUntil) {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          p.x += (dx / dist) * 120 * dt;
          p.y += (dy / dist) * 120 * dt;
        }
      }

      g.pickups = g.pickups.filter((p) => {
        if (Math.hypot(p.x - px, p.y - py) < PLAYER_R + 14) {
          applyPower(p.type, now);
          g.score += 25 * scoreMult(now);
          return false;
        }
        return true;
      });

      const skim = Math.max(0, 1 - (g.radius - R_MIN) / 28);
      g.score += Math.floor(dt * (8 + diff * 2) * scoreMult(now));
      g.score += Math.floor(skim * dt * 35 * scoreMult(now));

      const inv = now < g.effects.invincibleUntil;
      let dead = false;
      if (g.radius <= R_MIN - 2 || g.radius >= R_MAX + 2) dead = true;

      if (!inv && !dead) {
        for (const h of g.hazards) {
          if (Math.hypot(h.x - px, h.y - py) < h.r + PLAYER_R - 2) {
            if (g.effects.shield) {
              g.effects.shield = false;
            } else {
              dead = true;
            }
            break;
          }
        }
      }

      if (dead) g.phase = "over";

      drawScene(now);

      // HUD
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.font = "13px monospace";
      ctx!.fillStyle = "#9ce";
      ctx!.textBaseline = "top";
      ctx!.fillText(`SCORE  ${g.score}`, 14, 14);
      ctx!.textAlign = "right";
      ctx!.fillText(`×${diff.toFixed(1)}`, canvas!.width - 14, 14);
      ctx!.textAlign = "left";

      const fx: string[] = [];
      if (now < g.effects.slowUntil) fx.push("SLOW");
      if (inv) fx.push("INV");
      if (g.effects.shield) fx.push("SHLD");
      if (now < g.effects.doubleUntil) fx.push("2×");
      if (now < g.effects.magnetUntil) fx.push("MAG");
      if (fx.length) {
        ctx!.fillStyle = "#4af";
        ctx!.fillText(fx.join(" · "), 14, 32);
      }

      g.animId = requestAnimationFrame(loop);
    }

    g.animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(g.animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      ro.disconnect();
    };
  }, [startGame]);

  const overlay: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    fontFamily: "monospace",
    pointerEvents: uiPhase === "entering-name" ? "auto" : "none",
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", background: "#000" }}
      />

      {uiPhase === "idle" && (
        <div style={overlay}>
          <Leaderboard scores={highScores} />
          <p style={{ color: "#4af", letterSpacing: "0.15em", fontSize: 13, margin: 0 }}>
            HOLD SPACE / TAP — WIDEN ORBIT
          </p>
          <p style={{ color: "#667", fontSize: 11, margin: 0 }}>
            Release to fall inward · Dodge incoming debris
          </p>
          <div
            style={{
              ...panelStyle,
              fontSize: 10,
              color: "#889",
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            <p style={{ color: "#4af", margin: "0 0 6px", letterSpacing: "0.1em" }}>
              POWER-UPS
            </p>
            {POWER_TYPES.map((t) => (
              <div key={t} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: POWER_META[t].color, minWidth: 36 }}>
                  {POWER_META[t].label}
                </span>
                <span>{POWER_META[t].desc}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleShare}
            style={{
              ...panelStyle,
              pointerEvents: "auto",
              cursor: "pointer",
              color: "#4af",
              fontSize: 11,
              letterSpacing: "0.1em",
            }}
          >
            SHARE GAME
          </button>
        </div>
      )}

      {uiPhase === "entering-name" && (
        <div style={{ ...overlay, pointerEvents: "auto" }}>
          <div style={panelStyle}>
            <p style={{ color: "#f75", textAlign: "center", margin: "0 0 6px" }}>
              GAME OVER
            </p>
            <p style={{ color: "#ff8", textAlign: "center", margin: "0 0 12px" }}>
              SCORE {pendingScore} — NEW HIGH SCORE
            </p>
            <input
              autoFocus
              maxLength={20}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitName()}
              placeholder="@yourname"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #4af",
                borderRadius: 4,
                color: "#fff",
                fontFamily: "monospace",
                padding: "8px 10px",
                marginBottom: 8,
              }}
            />
            <button
              type="button"
              onClick={submitName}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #4af",
                color: "#4af",
                padding: "6px",
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              SAVE SCORE
            </button>
            <button
              type="button"
              onClick={handleShare}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #6ef",
                color: "#6ef",
                padding: "6px",
                cursor: "pointer",
              }}
            >
              SHARE SCORE
            </button>
          </div>
        </div>
      )}

      {uiPhase === "showing-scores" && (
        <div style={overlay}>
          <p style={{ color: "#f75", margin: 0, letterSpacing: "0.1em" }}>
            GAME OVER — SCORE {pendingScore}
          </p>
          <Leaderboard scores={highScores} highlight={pendingScore} />
          <p style={{ color: "#4af", fontSize: 12, margin: 0 }}>
            TAP / SPACE TO RETRY
          </p>
          <button
            type="button"
            onClick={handleShare}
            style={{
              ...panelStyle,
              pointerEvents: "auto",
              cursor: "pointer",
              color: "#6ef",
              fontSize: 11,
            }}
          >
            SHARE SCORE
          </button>
          {shareMsg && (
            <p style={{ color: "#6ef", fontSize: 11, margin: 0 }}>{shareMsg}</p>
          )}
        </div>
      )}

      {uiPhase === "playing" && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            onClick={handleShare}
            title="Share game"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(68,170,255,0.35)",
              color: "#4af",
              fontFamily: "monospace",
              fontSize: 10,
              padding: "6px 10px",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            SHARE
          </button>
        </div>
      )}
    </div>
  );
}
