"use client";

import { POWERUP_REFERENCE } from "@/orbit-game/orbit";
import OrbitPowerUpIcon from "@/components/orbit/OrbitPowerUpIcon";

function kindClass(kind: "up" | "down" | "wild") {
  if (kind === "up") return "orbit-powerup-card--boost";
  if (kind === "down") return "orbit-powerup-card--risk";
  return "orbit-powerup-card--wild";
}

function PowerUpSection({
  title,
  items,
}: {
  title: string;
  items: typeof POWERUP_REFERENCE;
}) {
  if (items.length === 0) return null;
  return (
    <article className="orbit-guide-card orbit-guide-card--wide">
      <h2 className="orbit-guide-card__title">{title}</h2>
      <ul className="orbit-powerup-grid">
        {items.map((row) => (
          <li key={row.type} className={`orbit-powerup-card ${kindClass(row.kind)}`}>
            <OrbitPowerUpIcon type={row.type} />
            <div className="orbit-powerup-card__text">
              <span className="orbit-powerup-card__name">{row.label}</span>
              <span className="orbit-powerup-card__desc">{row.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function OrbitRushPowerUpsSection() {
  const boosts = POWERUP_REFERENCE.filter((p) => p.kind === "up");
  const risks = POWERUP_REFERENCE.filter((p) => p.kind !== "up");

  return (
    <>
      <PowerUpSection title="Boosts" items={boosts} />
      <PowerUpSection title="Risks & wildcards" items={risks} />
    </>
  );
}
