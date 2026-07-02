"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { usePathname } from "next/navigation";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { detectPlayDevice, type PlayDevice } from "@/lib/play-device";
import { OrbitGame, POWERUP_REFERENCE, drawPowerUpIcon, PowerUpType } from "@/orbit-game/orbit";

interface HighScore {
  name: string;
  score: number;
  device?: PlayDevice;
}

type OverlayPhase = "idle" | "entering-name" | "showing-scores";

const LS_KEY = "petralian_orbit_rush_hs_v2";
const SHARE_PATH = "/lost-in-space";

function formatScore(score: number): number {
  return Math.round(score);
}

function loadScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HighScore[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s) => ({ ...s, score: formatScore(s.score) }));
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

function copyGameLink() {
  const url = `${SITE_URL}${SHARE_PATH}`;
  void navigator.clipboard?.writeText(url);
  return url;
}

const panelStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.82)",
  border: "1px solid rgba(68,170,255,0.35)",
  borderRadius: 8,
  padding: "14px 22px",
  minWidth: 260,
  backdropFilter: "blur(6px)",
  fontFamily: "monospace",
};

function DeviceIcon({ device }: { device?: PlayDevice }) {
  if (!device) return null;
  const iconProps = {
    size: 11,
    strokeWidth: 2,
    style: { flexShrink: 0, opacity: 0.85 },
    "aria-hidden": true as const,
  };
  if (device === "mobile") return <Smartphone {...iconProps} />;
  if (device === "tablet") return <Tablet {...iconProps} />;
  return <Monitor {...iconProps} />;
}

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
        <p style={{ color: "#556", fontSize: 11, margin: 0, textAlign: "center" }}>
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
                highlight !== undefined && formatScore(s.score) === formatScore(highlight)
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
            <span style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 52, justifyContent: "flex-end" }}>
              {formatScore(s.score)}
              <DeviceIcon device={s.device} />
            </span>
          </div>
        ))
      )}
    </div>
  );
}

const ICON_SIZE = 22;

function PowerUpReferenceIcon({ type }: { type: PowerUpType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPowerUpIcon(ctx, type, ICON_SIZE);
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="settings-powerup-reference__icon"
      aria-hidden
    />
  );
}

export default function OrbitRushGame() {
  const shellRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<OrbitGame | null>(null);
  const pathname = usePathname();
  const playDeviceRef = useRef<PlayDevice>(detectPlayDevice());
  const [overlay, setOverlay] = useState<OverlayPhase>("idle");
  const [pendingScore, setPendingScore] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    setHighScores(loadScores());
    document.documentElement.classList.add("orbit-game-active");
    document.body.classList.add("orbit-game-active");
    return () => {
      document.documentElement.classList.remove("orbit-game-active");
      document.body.classList.remove("orbit-game-active");
    };
  }, []);

  const handleGameOver = useCallback((score: number) => {
    setPendingScore(score);
    const scores = loadScores();
    if (qualifies(scores, score)) {
      setOverlay("entering-name");
    } else {
      setHighScores(scores);
      setOverlay("showing-scores");
    }
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const blockSpaceScroll = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        const t = e.target;
        if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
        e.preventDefault();
      }
    };
    shell.addEventListener("keydown", blockSpaceScroll);
    document.addEventListener("keydown", blockSpaceScroll, true);

    const game = new OrbitGame({
      onGameOver: handleGameOver,
      shareUrl: `${SITE_URL}${SHARE_PATH}`,
    });
    gameRef.current = game;

    return () => {
      shell.removeEventListener("keydown", blockSpaceScroll);
      document.removeEventListener("keydown", blockSpaceScroll, true);
      gameRef.current?.stopAudio();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [handleGameOver]);

  useEffect(() => {
    return () => {
      gameRef.current?.stopAudio();
    };
  }, [pathname]);

  const submitName = useCallback(() => {
    const name = nameInput.trim() || "PILOT";
    const device = gameRef.current?.playDevice ?? playDeviceRef.current;
    const updated = [...loadScores(), { name, score: formatScore(pendingScore), device }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    saveScores(updated);
    setHighScores(updated);
    setNameInput("");
    setOverlay("showing-scores");
  }, [nameInput, pendingScore]);

  const handleShareLink = useCallback(() => {
    copyGameLink();
    if (nameInput.trim()) {
      submitName();
    } else {
      const updated = [...loadScores(), { name: "PILOT", score: formatScore(pendingScore), device: gameRef.current?.playDevice ?? playDeviceRef.current }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      saveScores(updated);
      setHighScores(updated);
      setOverlay("showing-scores");
    }
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2500);
  }, [nameInput, pendingScore, submitName]);

  const handleShare = useCallback(() => {
    copyGameLink();
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2500);
  }, []);

  const retry = useCallback(() => {
    setOverlay("idle");
    gameRef.current?.restartFromOverlay();
  }, []);

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 50,
    pointerEvents: overlay === "entering-name" ? "auto" : "none",
  };

  return (
    <div ref={shellRef} className="orbit-game-shell" tabIndex={-1}>
      <div id="orbit-game-root">
        <canvas id="world" />

        <div id="settings-menu" className="settings-menu hidden">
          <h2>SETTINGS</h2>
          <div className="menu-item menu-item--slider">
            <label htmlFor="orbit-opacity-slider">Orbit Path:</label>
            <div className="orbit-opacity-control">
              <input
                id="orbit-opacity-slider"
                className="orbit-opacity-slider"
                type="range"
                min={0}
                max={100}
                defaultValue={40}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={40}
              />
              <span id="orbit-opacity-value" className="orbit-opacity-value">
                40%
              </span>
            </div>
          </div>
          <div className="menu-item">
            <label htmlFor="background-toggle">Show Background:</label>
            <button id="background-toggle" className="toggle-button" aria-pressed="true" type="button">
              <span className="toggle-label-off">OFF</span>
              <span className="toggle-label-on">ON</span>
              <span className="toggle-handle" />
            </button>
          </div>
          <div className="menu-item">
            <label htmlFor="sound-toggle">Sound Enabled:</label>
            <button id="sound-toggle" className="toggle-button" aria-pressed="true" type="button">
              <span className="toggle-label-off">OFF</span>
              <span className="toggle-label-on">ON</span>
              <span className="toggle-handle" />
            </button>
          </div>
          <button id="credits-button" className="menu-button" type="button">
            CREDITS
          </button>
          <button id="close-menu-button" className="menu-button" type="button">
            CLOSE
          </button>

          <div className="settings-powerup-reference">
            <h3>POWER-UPS &amp; DOWNS</h3>
            <ul>
              {POWERUP_REFERENCE.map((item) => (
                <li
                  key={item.type}
                  className={`settings-powerup-reference__item settings-powerup-reference__item--${item.kind}`}
                >
                  <PowerUpReferenceIcon type={item.type} />
                  <span className="settings-powerup-reference__desc">{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id="credits-section" className="credits-section hidden">
          <h2>CREDITS</h2>
          <div className="credits-content">
            <p>
              <strong>Game engine:</strong>{" "}
              <a href="https://github.com/kioku/orbit" target="_blank" rel="noopener noreferrer">
                kioku/orbit
              </a>{" "}
              (MIT) — adapted for Petralian
            </p>
            <p>
              <strong>Music:</strong> Sport Racing Car | DRIVE by Alex-Productions — CC BY 3.0
            </p>
          </div>
          <button id="close-credits-button" className="menu-button" type="button">
            CLOSE
          </button>
        </div>

        <div id="game-over-dialog" className="game-over-dialog hidden">
          <h2 id="game-over-title">GAME OVER</h2>
          <p id="game-over-message">You were consumed by the star!</p>
          <p id="game-over-result-info" className="score-display" />
          <div className="game-over-buttons">
            <button id="play-again-button" className="menu-button" type="button">
              PLAY AGAIN
            </button>
            <button id="share-result-button" className="menu-button" type="button">
              SHARE
            </button>
          </div>
        </div>
      </div>

      {overlay === "entering-name" && (
        <div style={{ ...overlayStyle, pointerEvents: "auto" }}>
          <div style={panelStyle}>
            <p style={{ color: "#f75", textAlign: "center", margin: "0 0 6px" }}>
              GAME OVER
            </p>
            <p style={{ color: "#ff8", textAlign: "center", margin: "0 0 12px" }}>
              SCORE {formatScore(pendingScore)} — NEW HIGH SCORE
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
            <button type="button" onClick={handleShareLink} style={{ width: "100%", marginBottom: 8, padding: 8, cursor: "pointer" }}>
              SHARE
            </button>
            {shareMsg && <p style={{ color: "#6ef", fontSize: 11, textAlign: "center", margin: 0 }}>{shareMsg}</p>}
          </div>
        </div>
      )}

      {overlay === "showing-scores" && (
        <div style={overlayStyle}>
          <p style={{ color: "#f75", margin: 0, fontFamily: "monospace", letterSpacing: "0.1em" }}>
            GAME OVER — SCORE {formatScore(pendingScore)}
          </p>
          <Leaderboard scores={highScores} highlight={pendingScore} />
          <button
            type="button"
            onClick={retry}
            style={{ ...panelStyle, pointerEvents: "auto", cursor: "pointer", color: "#4af" }}
          >
            TAP / SPACE TO RETRY
          </button>
          <button
            type="button"
            onClick={handleShare}
            style={{ ...panelStyle, pointerEvents: "auto", cursor: "pointer", color: "#6ef", fontSize: 11 }}
          >
            SHARE
          </button>
          {shareMsg && <p style={{ color: "#6ef", fontSize: 11 }}>{shareMsg}</p>}
        </div>
      )}
    </div>
  );
}
