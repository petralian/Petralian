"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type React from "react";
import { usePathname } from "next/navigation";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { detectPlayDevice, type PlayDevice } from "@/lib/play-device";
import {
  formatLeaderboardScore,
  qualifiesForLeaderboard,
  sanitizeLeaderboardName,
  type LeaderboardEntry,
} from "@/lib/orbit-rush-leaderboard";
import { OrbitGame, POWERUP_REFERENCE, drawPowerUpIcon, PowerUpType } from "@/orbit-game/orbit";

type OverlayPhase = "idle" | "browse-scores" | "entering-name" | "showing-scores";

const SHARE_PATH = "/lost-in-space";
const LEADERBOARD_API = "/api/orbit-rush/leaderboard";

function copyGameLink() {
  const url = `${SITE_URL}${SHARE_PATH}`;
  void navigator.clipboard?.writeText(url);
  return url;
}

const panelStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.88)",
  border: "1px solid rgba(68,170,255,0.35)",
  borderRadius: 8,
  padding: "14px 22px",
  minWidth: 260,
  maxWidth: "min(92vw, 360px)",
  backdropFilter: "blur(6px)",
  fontFamily: "monospace",
};

const overlayShellStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  zIndex: 9999,
  pointerEvents: "auto",
  touchAction: "manipulation",
  padding: "16px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(0,0,0,0.6)",
  border: "1px solid #4af",
  borderRadius: 4,
  color: "#fff",
  fontFamily: "monospace",
  fontSize: 16,
  padding: "12px 10px",
  marginBottom: 8,
  WebkitAppearance: "none",
  touchAction: "auto",
  WebkitUserSelect: "text",
  userSelect: "text",
};

const actionButtonStyle: React.CSSProperties = {
  width: "100%",
  marginBottom: 8,
  padding: "12px 10px",
  minHeight: 44,
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 14,
  touchAction: "manipulation",
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
  scores: LeaderboardEntry[];
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
        ── GLOBAL HIGH SCORES ──
      </p>
      {scores.length === 0 ? (
        <p style={{ color: "#556", fontSize: 11, margin: 0, textAlign: "center" }}>
          NO SCORES YET — BE FIRST
        </p>
      ) : (
        scores.map((s, i) => (
          <div
            key={`${s.name}-${s.score}-${s.createdAt}-${i}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 12,
              color:
                highlight !== undefined &&
                  formatLeaderboardScore(s.score) === formatLeaderboardScore(highlight)
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
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                minWidth: 52,
                justifyContent: "flex-end",
              }}
            >
              {formatLeaderboardScore(s.score)}
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

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(LEADERBOARD_API, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { scores?: LeaderboardEntry[] };
    return Array.isArray(data.scores) ? data.scores : [];
  } catch {
    return [];
  }
}

export default function OrbitRushGame() {
  const shellRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<OrbitGame | null>(null);
  const pathname = usePathname();
  const playDeviceRef = useRef<PlayDevice>(detectPlayDevice());
  const [overlay, setOverlay] = useState<OverlayPhase>("idle");
  const [pendingScore, setPendingScore] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [highScores, setHighScores] = useState<LeaderboardEntry[]>([]);
  const [shareMsg, setShareMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayRef = useRef<OverlayPhase>("idle");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    overlayRef.current = overlay;
  }, [overlay]);

  const refreshScores = useCallback(async () => {
    const scores = await fetchLeaderboard();
    setHighScores(scores);
    return scores;
  }, []);

  useEffect(() => {
    void refreshScores();
    document.documentElement.classList.add("orbit-game-active");
    document.body.classList.add("orbit-game-active");
    return () => {
      document.documentElement.classList.remove("orbit-game-active");
      document.body.classList.remove("orbit-game-active");
    };
  }, [refreshScores]);

  useEffect(() => {
    if (overlay !== "entering-name") return;
    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus({ preventScroll: true });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [overlay]);

  const openBrowseScores = useCallback(() => {
    void refreshScores();
    setOverlay("browse-scores");
  }, [refreshScores]);

  const closeBrowseScores = useCallback(() => {
    setOverlay("idle");
  }, []);

  useEffect(() => {
    const open = overlay !== "idle";
    document.documentElement.classList.toggle("orbit-game-overlay-open", open);
    return () => {
      document.documentElement.classList.remove("orbit-game-overlay-open");
    };
  }, [overlay]);

  const handleGameOver = useCallback(
    async (score: number) => {
      setPendingScore(score);
      setSubmitError("");
      const scores = await refreshScores();
      if (qualifiesForLeaderboard(scores, score)) {
        setOverlay("entering-name");
      } else {
        setOverlay("showing-scores");
      }
    },
    [refreshScores]
  );

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const blockSpaceScroll = (e: KeyboardEvent) => {
      if (overlayRef.current !== "idle") return;
      if (e.key === " " || e.code === "Space") {
        const t = e.target;
        if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
        e.preventDefault();
      }
    };
    shell.addEventListener("keydown", blockSpaceScroll);
    document.addEventListener("keydown", blockSpaceScroll, true);

    const game = new OrbitGame({
      onGameOver: (score) => {
        void handleGameOver(score);
      },
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

  const submitName = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    const name = sanitizeLeaderboardName(nameInput);
    const device = gameRef.current?.playDevice ?? playDeviceRef.current;
    try {
      const res = await fetch(LEADERBOARD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          score: formatLeaderboardScore(pendingScore),
          device,
        }),
      });
      const data = (await res.json()) as {
        scores?: LeaderboardEntry[];
        error?: string;
      };
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not save score");
        setIsSubmitting(false);
        return;
      }
      setHighScores(data.scores ?? []);
      setNameInput("");
      setOverlay("showing-scores");
    } catch {
      setSubmitError("Could not save score — check connection");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, nameInput, pendingScore]);

  const handleShareLink = useCallback(() => {
    copyGameLink();
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2500);
  }, []);

  const handleShare = useCallback(() => {
    copyGameLink();
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2500);
  }, []);

  const retry = useCallback(() => {
    setOverlay("idle");
    setSubmitError("");
    gameRef.current?.restartFromOverlay();
  }, []);

  const overlayContent = (
    <>
      {overlay === "idle" && (
        <button
          type="button"
          data-orbit-ui
          onClick={openBrowseScores}
          style={{
            position: "fixed",
            left: "50%",
            bottom: "10%",
            transform: "translateX(-50%)",
            zIndex: 120,
            pointerEvents: "auto",
            touchAction: "manipulation",
            background: "rgba(0,10,20,0.75)",
            border: "1px solid rgba(68,170,255,0.45)",
            color: "#9ce",
            fontFamily: "monospace",
            fontSize: 12,
            letterSpacing: "0.14em",
            padding: "10px 20px",
            minHeight: 44,
            cursor: "pointer",
          }}
        >
          HIGH SCORES
        </button>
      )}

      {overlay === "browse-scores" && (
        <div
          style={overlayShellStyle}
          data-orbit-ui
          role="dialog"
          aria-label="High scores"
        >
          <Leaderboard scores={highScores} />
          <button
            type="button"
            onClick={closeBrowseScores}
            style={{
              ...panelStyle,
              cursor: "pointer",
              color: "#4af",
              fontWeight: "bold",
              minHeight: 44,
              touchAction: "manipulation",
            }}
          >
            CLOSE
          </button>
        </div>
      )}

      {overlay === "entering-name" && (
        <div
          style={overlayShellStyle}
          data-orbit-ui
          role="dialog"
          aria-label="Enter your name"
        >
          <div style={panelStyle}>
            <p style={{ color: "#f75", textAlign: "center", margin: "0 0 6px" }}>
              GAME OVER
            </p>
            <p style={{ color: "#ff8", textAlign: "center", margin: "0 0 12px" }}>
              SCORE {formatLeaderboardScore(pendingScore)} — NEW HIGH SCORE
            </p>
            <input
              ref={nameInputRef}
              maxLength={20}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitName();
              }}
              placeholder="Your name"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              inputMode="text"
              aria-label="Your name for the leaderboard"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => void submitName()}
              disabled={isSubmitting}
              style={{ ...actionButtonStyle, color: "#4af", fontWeight: "bold" }}
            >
              {isSubmitting ? "SAVING…" : "SAVE SCORE"}
            </button>
            <button
              type="button"
              onClick={handleShareLink}
              style={{ ...actionButtonStyle, color: "#6ef" }}
            >
              SHARE
            </button>
            {submitError && (
              <p style={{ color: "#f88", fontSize: 11, textAlign: "center", margin: "4px 0 0" }}>
                {submitError}
              </p>
            )}
            {shareMsg && (
              <p style={{ color: "#6ef", fontSize: 11, textAlign: "center", margin: 0 }}>
                {shareMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {overlay === "showing-scores" && (
        <div style={overlayShellStyle} data-orbit-ui role="dialog" aria-label="Game over">
          <p style={{ color: "#f75", margin: 0, fontFamily: "monospace", letterSpacing: "0.1em" }}>
            GAME OVER — SCORE {formatLeaderboardScore(pendingScore)}
          </p>
          <Leaderboard scores={highScores} highlight={pendingScore} />
          <button
            type="button"
            onClick={retry}
            style={{
              ...panelStyle,
              cursor: "pointer",
              color: "#4af",
              fontWeight: "bold",
              minHeight: 44,
              touchAction: "manipulation",
            }}
          >
            RETRY
          </button>
          <button
            type="button"
            onClick={handleShare}
            style={{
              ...panelStyle,
              cursor: "pointer",
              color: "#6ef",
              fontSize: 11,
              minHeight: 44,
              touchAction: "manipulation",
            }}
          >
            SHARE
          </button>
          {shareMsg && <p style={{ color: "#6ef", fontSize: 11, margin: 0 }}>{shareMsg}</p>}
        </div>
      )}
    </>
  );

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

      {portalReady && overlay !== "idle"
        ? createPortal(overlayContent, document.body)
        : overlay === "idle"
          ? overlayContent
          : null}
    </div>
  );
}
