import type { PowerUpType } from "@/orbit-game/orbit";
import PowerUpSvgIcon from "@/components/orbit/PowerUpSvgIcon";

export default function OrbitPowerUpIcon({ type }: { type: PowerUpType }) {
  return <PowerUpSvgIcon type={type} />;
}
