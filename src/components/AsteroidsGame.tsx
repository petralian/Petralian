'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type React from 'react';

interface Vec2 { x: number; y: number }

interface Ship {
    pos: Vec2;
    vel: Vec2;
    angle: number;
    dead: boolean;
    invincible: number;
    respawnTimer: number;
}

interface Asteroid {
    pos: Vec2;
    vel: Vec2;
    radius: number;
    angle: number;
    rotSpeed: number;
    offsets: number[];
}

interface Bullet {
    pos: Vec2;
    vel: Vec2;
    life: number;
}

interface GameState {
    ship: Ship;
    asteroids: Asteroid[];
    bullets: Bullet[];
    score: number;
    lives: number;
    phase: 'idle' | 'playing' | 'over';
    keys: Set<string>;
    shootCooldown: number;
    animId: number;
    gameOverFired: boolean;
}

interface HighScore { name: string; score: number }
type UiPhase = 'idle' | 'playing' | 'entering-name' | 'showing-scores';

// ── LocalStorage helpers ───────────────────────────────────────────────────────
const LS_KEY = 'petralian_asteroids_hs';
function loadScores(): HighScore[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}
function saveScores(scores: HighScore[]) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(scores)); } catch { /* noop */ }
}
function addScore(scores: HighScore[], entry: HighScore): HighScore[] {
    return [...scores, entry].sort((a, b) => b.score - a.score).slice(0, 10);
}
function qualifiesForBoard(scores: HighScore[], score: number): boolean {
    if (score <= 0) return false;
    if (scores.length < 10) return true;
    return score > scores[scores.length - 1].score;
}

// ── Leaderboard panel ──────────────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.78)',
    border: '1px solid rgba(68,170,255,0.35)',
    borderRadius: 8,
    padding: '14px 22px',
    minWidth: 260,
    backdropFilter: 'blur(6px)',
};
const inputStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid #4af',
    borderRadius: 4,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    letterSpacing: '0.05em',
    marginBottom: 8,
    boxSizing: 'border-box',
};
const btnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #4af',
    borderRadius: 4,
    color: '#4af',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: '0.1em',
    padding: '6px 16px',
    cursor: 'pointer',
    width: '100%',
};

function LeaderboardPanel({ scores, highlightScore }: { scores: HighScore[]; highlightScore?: number }) {
    return (
        <div style={panelStyle}>
            <p style={{ color: '#4af', fontSize: 12, letterSpacing: '0.15em', margin: '0 0 10px', textAlign: 'center' }}>
                ── HIGH SCORES ──
            </p>
            {scores.length === 0 ? (
                <p style={{ color: '#556', fontSize: 11, margin: 0, textAlign: 'center', letterSpacing: '0.08em' }}>
                    NO SCORES YET — BE FIRST
                </p>
            ) : (
                scores.map((s, i) => {
                    const isHighlight = highlightScore !== undefined && s.score === highlightScore;
                    return (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 24,
                            fontSize: 12,
                            color: isHighlight ? '#ff8' : (i === 0 ? '#4af' : '#9ce'),
                            fontWeight: isHighlight ? 'bold' : 'normal',
                            marginBottom: 3,
                            letterSpacing: '0.04em',
                        }}>
                            <span>{i + 1}. {s.name}</span>
                            <span>{s.score}</span>
                        </div>
                    );
                })
            )}
        </div>
    );
}

const SHIP_THRUST = 0.15;
const SHIP_ROTATE = 0.055;
const FRICTION = 0.988;
const MAX_SPEED = 6;
const BULLET_SPEED = 8;
const BULLET_LIFE = 55;
const SHOOT_COOLDOWN = 12;
const INVINCIBLE_FRAMES = 180;
const ASTEROIDS_START = 5;
const VIRT_W = 800;
const VIRT_H = 500;

function wrap(v: number, max: number): number {
    if (v < 0) return v + max;
    if (v >= max) return v - max;
    return v;
}

function makeAsteroid(w: number, h: number, avoid: Vec2, radius: number): Asteroid {
    let pos: Vec2;
    do {
        pos = { x: Math.random() * w, y: Math.random() * h };
    } while (Math.hypot(pos.x - avoid.x, pos.y - avoid.y) < 160);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.0 + Math.random() * 1.5;
    const n = 9 + Math.floor(Math.random() * 5);
    return {
        pos,
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        radius,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        offsets: Array.from({ length: n }, () => 0.65 + Math.random() * 0.7),
    };
}

function splitAsteroid(a: Asteroid): Asteroid[] {
    if (a.radius < 13) return [];
    return [0, 1].map(() => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 1.5;
        const n = 7 + Math.floor(Math.random() * 4);
        return {
            pos: { ...a.pos },
            vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
            radius: a.radius * 0.5,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            offsets: Array.from({ length: n }, () => 0.65 + Math.random() * 0.7),
        };
    });
}

function makeShip(w: number, h: number): Ship {
    return {
        pos: { x: w / 2, y: h / 2 },
        vel: { x: 0, y: 0 },
        angle: -Math.PI / 2,
        dead: false,
        invincible: INVINCIBLE_FRAMES,
        respawnTimer: 0,
    };
}

export default function AsteroidsGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stateRef = useRef<GameState>({
        ship: makeShip(400, 400),
        asteroids: [],
        bullets: [],
        score: 0,
        lives: 3,
        phase: 'idle',
        keys: new Set<string>(),
        shootCooldown: 0,
        animId: 0,
        gameOverFired: false,
    });

    const [highScores, setHighScores] = useState<HighScore[]>([]);
    const [uiPhase, setUiPhase] = useState<UiPhase>('idle');
    const [pendingScore, setPendingScore] = useState(0);
    const [nameInput, setNameInput] = useState('');
    const uiPhaseRef = useRef<UiPhase>('idle');

    // Load scores on mount
    useEffect(() => { setHighScores(loadScores()); }, []);

    const setUiPhaseBoth = useCallback((p: UiPhase) => {
        uiPhaseRef.current = p;
        setUiPhase(p);
    }, []);

    const onGameOver = useCallback((score: number) => {
        const scores = loadScores();
        setPendingScore(score);
        if (qualifiesForBoard(scores, score)) {
            setUiPhaseBoth('entering-name');
        } else {
            setHighScores(scores);
            setUiPhaseBoth('showing-scores');
        }
    }, [setUiPhaseBoth]);
    const onGameOverRef = useRef(onGameOver);
    useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);

    const submitName = useCallback(() => {
        const name = nameInput.trim() || 'ANONYMOUS';
        const scores = loadScores();
        const updated = addScore(scores, { name, score: pendingScore });
        saveScores(updated);
        setHighScores(updated);
        setNameInput('');
        setUiPhaseBoth('showing-scores');
    }, [nameInput, pendingScore, setUiPhaseBoth]);

    const startGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const state = stateRef.current;
        state.ship = makeShip(VIRT_W, VIRT_H);
        state.asteroids = Array.from({ length: ASTEROIDS_START }, () =>
            makeAsteroid(VIRT_W, VIRT_H, { x: VIRT_W / 2, y: VIRT_H / 2 }, 28 + Math.random() * 22)
        );
        state.bullets = [];
        state.score = 0;
        state.lives = 3;
        state.phase = 'playing';
        state.shootCooldown = 0;
        state.gameOverFired = false;
        setUiPhaseBoth('playing');
    }, [setUiPhaseBoth]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const state = stateRef.current;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        // Seed idle asteroids
        state.asteroids = Array.from({ length: 6 }, () =>
            makeAsteroid(VIRT_W, VIRT_H, { x: VIRT_W / 2, y: VIRT_H / 2 }, 28 + Math.random() * 22)
        );

        const onKeyDown = (e: KeyboardEvent) => {
            // Don't block space if focus is inside a form input
            if (e.key === ' ' && !(e.target instanceof HTMLInputElement)) e.preventDefault();
            state.keys.add(e.key);

            if (e.key === ' ') {
                const up = uiPhaseRef.current;
                if (up === 'idle' || up === 'showing-scores') {
                    startGame();
                    return;
                }
                if (up === 'playing' && !state.ship.dead && state.shootCooldown === 0) {
                    const s = state.ship;
                    state.bullets.push({
                        pos: {
                            x: s.pos.x + Math.cos(s.angle) * 18,
                            y: s.pos.y + Math.sin(s.angle) * 18,
                        },
                        vel: {
                            x: s.vel.x + Math.cos(s.angle) * BULLET_SPEED,
                            y: s.vel.y + Math.sin(s.angle) * BULLET_SPEED,
                        },
                        life: BULLET_LIFE,
                    });
                    state.shootCooldown = SHOOT_COOLDOWN;
                }
            }
        };
        const onKeyUp = (e: KeyboardEvent) => state.keys.delete(e.key);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // ── Draw helpers ──────────────────────────────────────────────────────────
        function drawAsteroid(a: Asteroid) {
            ctx!.save();
            ctx!.translate(a.pos.x, a.pos.y);
            ctx!.rotate(a.angle);
            ctx!.beginPath();
            const n = a.offsets.length;
            for (let i = 0; i < n; i++) {
                const ang = (i / n) * Math.PI * 2;
                const r = a.radius * a.offsets[i];
                if (i === 0) ctx!.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
                else ctx!.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
            }
            ctx!.closePath();
            ctx!.strokeStyle = '#6cc';
            ctx!.lineWidth = 1.5;
            ctx!.shadowColor = '#6cc';
            ctx!.shadowBlur = 7;
            ctx!.stroke();
            ctx!.restore();
        }

        function drawShip(ship: Ship) {
            if (ship.dead) return;
            if (ship.invincible > 0 && Math.floor(ship.invincible / 5) % 2 === 0) return;
            ctx!.save();
            ctx!.translate(ship.pos.x, ship.pos.y);
            ctx!.rotate(ship.angle);
            ctx!.beginPath();
            ctx!.moveTo(16, 0);
            ctx!.lineTo(-10, -9);
            ctx!.lineTo(-6, 0);
            ctx!.lineTo(-10, 9);
            ctx!.closePath();
            ctx!.strokeStyle = '#4af';
            ctx!.lineWidth = 2;
            ctx!.shadowColor = '#4af';
            ctx!.shadowBlur = 14;
            ctx!.stroke();
            const thrusting =
                state.keys.has('ArrowUp') || state.keys.has('w') || state.keys.has('W');
            if (thrusting) {
                ctx!.beginPath();
                ctx!.moveTo(-6, -4);
                ctx!.lineTo(-14 - Math.random() * 10, 0);
                ctx!.lineTo(-6, 4);
                ctx!.strokeStyle = '#fa4';
                ctx!.shadowColor = '#fa4';
                ctx!.shadowBlur = 12;
                ctx!.lineWidth = 2;
                ctx!.stroke();
            }
            ctx!.restore();
        }

        // ── Game loop ─────────────────────────────────────────────────────────────
        function loop() {
            const w = canvas!.width;
            const h = canvas!.height;

            ctx!.fillStyle = 'rgba(0,0,0,0.2)';
            ctx!.fillRect(0, 0, w, h);

            // Ghost 404
            ctx!.save();
            ctx!.globalAlpha = 0.035;
            ctx!.fillStyle = '#ffffff';
            ctx!.font = `bold ${Math.min(w * 0.52, h * 0.68)}px Arial`;
            ctx!.textAlign = 'center';
            ctx!.textBaseline = 'middle';
            ctx!.fillText('404', w / 2, h / 2);
            ctx!.restore();

            // Scale all game objects from virtual (VIRT_W×VIRT_H) to canvas size
            ctx!.save();
            ctx!.scale(w / VIRT_W, h / VIRT_H);

            // ── Idle / showing-scores — drift asteroids, no ship ──
            if (state.phase === 'idle') {
                for (const a of state.asteroids) {
                    a.pos.x = wrap(a.pos.x + a.vel.x, VIRT_W);
                    a.pos.y = wrap(a.pos.y + a.vel.y, VIRT_H);
                    a.angle += a.rotSpeed;
                }
                for (const a of state.asteroids) drawAsteroid(a);
                ctx!.restore();
                state.animId = requestAnimationFrame(loop);
                return;
            }

            // ── Over — animate asteroids, fire callback once ──
            if (state.phase === 'over') {
                if (!state.gameOverFired) {
                    state.gameOverFired = true;
                    onGameOverRef.current(state.score);
                }
                for (const a of state.asteroids) {
                    a.pos.x = wrap(a.pos.x + a.vel.x, VIRT_W);
                    a.pos.y = wrap(a.pos.y + a.vel.y, VIRT_H);
                    a.angle += a.rotSpeed;
                }
                for (const a of state.asteroids) drawAsteroid(a);
                ctx!.restore();
                state.animId = requestAnimationFrame(loop);
                return;
            }

            // ── Playing ──
            const { ship } = state;

            if (ship.dead) {
                ship.respawnTimer--;
                if (ship.respawnTimer <= 0) {
                    ship.dead = false;
                    ship.pos = { x: VIRT_W / 2, y: VIRT_H / 2 };
                    ship.vel = { x: 0, y: 0 };
                    ship.angle = -Math.PI / 2;
                    ship.invincible = INVINCIBLE_FRAMES;
                }
            }

            if (!ship.dead) {
                const left = state.keys.has('ArrowLeft') || state.keys.has('a') || state.keys.has('A');
                const right = state.keys.has('ArrowRight') || state.keys.has('d') || state.keys.has('D');
                const thrust = state.keys.has('ArrowUp') || state.keys.has('w') || state.keys.has('W');
                if (left) ship.angle -= SHIP_ROTATE;
                if (right) ship.angle += SHIP_ROTATE;
                if (thrust) {
                    ship.vel.x += Math.cos(ship.angle) * SHIP_THRUST;
                    ship.vel.y += Math.sin(ship.angle) * SHIP_THRUST;
                    const spd = Math.hypot(ship.vel.x, ship.vel.y);
                    if (spd > MAX_SPEED) {
                        ship.vel.x = (ship.vel.x / spd) * MAX_SPEED;
                        ship.vel.y = (ship.vel.y / spd) * MAX_SPEED;
                    }
                }
                ship.vel.x *= FRICTION;
                ship.vel.y *= FRICTION;
                ship.pos.x = wrap(ship.pos.x + ship.vel.x, VIRT_W);
                ship.pos.y = wrap(ship.pos.y + ship.vel.y, VIRT_H);
                if (ship.invincible > 0) ship.invincible--;
            }

            if (state.shootCooldown > 0) state.shootCooldown--;

            state.bullets = state.bullets.filter(b => b.life > 0);
            for (const b of state.bullets) {
                b.pos.x = wrap(b.pos.x + b.vel.x, VIRT_W);
                b.pos.y = wrap(b.pos.y + b.vel.y, VIRT_H);
                b.life--;
            }

            for (const a of state.asteroids) {
                a.pos.x = wrap(a.pos.x + a.vel.x, VIRT_W);
                a.pos.y = wrap(a.pos.y + a.vel.y, VIRT_H);
                a.angle += a.rotSpeed;
            }

            const born: Asteroid[] = [];
            state.asteroids = state.asteroids.filter(a => {
                for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
                    const b = state.bullets[bi];
                    if (Math.hypot(b.pos.x - a.pos.x, b.pos.y - a.pos.y) < a.radius) {
                        state.bullets.splice(bi, 1);
                        state.score += Math.round(300 / a.radius);
                        born.push(...splitAsteroid(a));
                        return false;
                    }
                }
                return true;
            });
            state.asteroids.push(...born);

            if (state.asteroids.length === 0) {
                const next = Math.min(ASTEROIDS_START + Math.floor(state.score / 400), 10);
                state.asteroids = Array.from({ length: next }, () =>
                    makeAsteroid(VIRT_W, VIRT_H, ship.pos, 28 + Math.random() * 22)
                );
            }

            if (!ship.dead && ship.invincible === 0) {
                for (const a of state.asteroids) {
                    if (Math.hypot(ship.pos.x - a.pos.x, ship.pos.y - a.pos.y) < a.radius + 9) {
                        state.lives--;
                        if (state.lives <= 0) {
                            state.phase = 'over';
                        } else {
                            ship.dead = true;
                            ship.respawnTimer = 100;
                        }
                        break;
                    }
                }
            }

            for (const b of state.bullets) {
                ctx!.save();
                ctx!.beginPath();
                ctx!.arc(b.pos.x, b.pos.y, 2.5, 0, Math.PI * 2);
                ctx!.fillStyle = '#ff8';
                ctx!.shadowColor = '#ff8';
                ctx!.shadowBlur = 8;
                ctx!.fill();
                ctx!.restore();
            }
            for (const a of state.asteroids) drawAsteroid(a);
            drawShip(ship);
            ctx!.restore(); // end virtual transform

            // HUD (canvas space)
            ctx!.save();
            ctx!.font = '13px monospace';
            ctx!.fillStyle = '#9ce';
            ctx!.textBaseline = 'top';
            ctx!.shadowBlur = 0;
            ctx!.textAlign = 'left';
            ctx!.fillText(`SCORE  ${state.score}`, 14, 14);
            ctx!.textAlign = 'right';
            ctx!.fillText('♦'.repeat(Math.max(state.lives, 0)), w - 14, 14);
            ctx!.restore();

            state.animId = requestAnimationFrame(loop);
        }

        state.animId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(state.animId);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            ro.disconnect();
        };
    }, [startGame]);

    const overlayBase: React.CSSProperties = {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        fontFamily: 'monospace',
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                style={{ display: 'block', width: '100%', height: '100%', background: '#000' }}
            />

            {/* ── Idle: leaderboard + play prompt ── */}
            {uiPhase === 'idle' && (
                <div style={{ ...overlayBase, pointerEvents: 'none' }}>
                    <LeaderboardPanel scores={highScores} />
                    <p style={{
                        color: '#4af', letterSpacing: '0.2em', fontSize: 13,
                        margin: 0, opacity: 0.9,
                    }}>
                        [ SPACE ] TO PLAY
                    </p>
                </div>
            )}

            {/* ── Entering name ── */}
            {uiPhase === 'entering-name' && (
                <div style={{ ...overlayBase, pointerEvents: 'auto' }}>
                    <div style={panelStyle}>
                        <p style={{
                            color: '#f75', fontSize: 17, fontWeight: 'bold',
                            margin: '0 0 4px', letterSpacing: '0.1em', textAlign: 'center',
                        }}>
                            GAME OVER
                        </p>
                        <p style={{
                            color: '#ff8', fontSize: 13, margin: '0 0 14px',
                            letterSpacing: '0.05em', textAlign: 'center',
                        }}>
                            SCORE: {pendingScore} — NEW HIGH SCORE!
                        </p>
                        <p style={{
                            color: '#9ce', fontSize: 11, margin: '0 0 7px',
                            letterSpacing: '0.08em',
                        }}>
                            ENTER YOUR NAME OR HANDLE
                        </p>
                        <input
                            autoFocus
                            type="text"
                            maxLength={20}
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') submitName(); }}
                            style={inputStyle}
                            placeholder="@yourname"
                        />
                        <button onClick={submitName} style={btnStyle}>
                            SAVE SCORE
                        </button>
                    </div>
                </div>
            )}

            {/* ── Game over + leaderboard ── */}
            {uiPhase === 'showing-scores' && (
                <div style={{ ...overlayBase, pointerEvents: 'none' }}>
                    <p style={{
                        color: '#f75', fontSize: 17, fontWeight: 'bold',
                        margin: 0, letterSpacing: '0.1em',
                    }}>
                        GAME OVER — SCORE: {pendingScore}
                    </p>
                    <LeaderboardPanel scores={highScores} highlightScore={pendingScore} />
                    <p style={{
                        color: '#4af', letterSpacing: '0.2em', fontSize: 13,
                        margin: 0, opacity: 0.9,
                    }}>
                        [ SPACE ] TO RETRY
                    </p>
                </div>
            )}
        </div>
    );
}
