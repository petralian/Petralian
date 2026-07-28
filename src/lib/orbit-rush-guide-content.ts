/** Static copy for /lost-in-space — crawlers and players (keep in sync with in-game POWERUP_REFERENCE). */

export type OrbitRushPowerUpRow = {
  label: string;
  description: string;
  kind: "up" | "down" | "wild";
};

export const ORBIT_RUSH_POWERUPS: OrbitRushPowerUpRow[] = [
  { label: "SHIELD", description: "Absorbs one hit", kind: "up" },
  { label: "SCORE ×2", description: "Double points for a short time", kind: "up" },
  { label: "MAGNET", description: "Pulls enemies and pickups toward your ship", kind: "up" },
  { label: "TURBO", description: "Stronger orbit push when you hold", kind: "up" },
  { label: "OVERCHARGE", description: "Triple points", kind: "up" },
  { label: "ORBIT FLIP", description: "Reverse orbit direction until flipped again", kind: "up" },
  { label: "GHOST", description: "Enemy shots pass through you", kind: "up" },
  { label: "NOVA", description: "Clears red enemies on screen", kind: "up" },
  { label: "RETALIATE", description: "Auto-fire at red threats", kind: "up" },
  { label: "REVERSE", description: "Hold pulls inward — release drifts out", kind: "down" },
  { label: "WEAK THRUST", description: "Much weaker orbit push", kind: "down" },
  { label: "ORBIT SHRINK", description: "Smaller safe orbit ring", kind: "down" },
  { label: "???", description: "Random effect on pickup", kind: "wild" },
];

export const ORBIT_RUSH_FAQ: { question: string; answer: string }[] = [
  {
    question: "How do you play Orbit Rush?",
    answer:
      "Hold mouse, space, or touch to widen your orbit around the star. Release to fall inward. Collect pickups, dodge debris and the stellar edge, and survive as long as you can.",
  },
  {
    question: "Is Lost in Space free to play?",
    answer:
      "Yes. Orbit Rush runs in your browser on petralian.com with no install. Scores can be saved to the public leaderboard if you qualify.",
  },
  {
    question: "What devices support Orbit Rush?",
    answer:
      "Desktop (mouse or spacebar), tablets, and phones with touch. The game adapts controls on smaller screens.",
  },
  {
    question: "How does the leaderboard work?",
    answer:
      "After a strong run you can submit a display name. Only scores above the qualification threshold are stored. Share the game link to challenge friends.",
  },
];
