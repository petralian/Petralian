import {
  ArrowsClockwise,
  ArrowsInSimple,
  BatteryVerticalLow,
  CircleDashed,
  Crosshair,
  Ghost,
  Magnet,
  NumberCircleThree,
  NumberCircleTwo,
  SealQuestion,
  ShieldPlus,
  Speedometer,
  SunDim,
} from "@phosphor-icons/react";
import { PowerUpType } from "@/orbit-game/orbit";
import { powerUpIconColor } from "@/orbit-game/powerup-phosphor";

const ICON_SIZE = 16;

function PhosphorGlyph({
  type,
  color,
}: {
  type: PowerUpType;
  color: string;
}) {
  const props = { size: ICON_SIZE, weight: "fill" as const, color };
  switch (type) {
    case PowerUpType.SHIELD:
      return <ShieldPlus {...props} />;
    case PowerUpType.SCORE_MULTIPLIER:
      return <NumberCircleTwo {...props} />;
    case PowerUpType.MAGNET:
      return <Magnet {...props} />;
    case PowerUpType.TURBO_THRUST:
      return <Speedometer {...props} />;
    case PowerUpType.OVERCHARGE:
      return <NumberCircleThree {...props} />;
    case PowerUpType.ORBIT_FLIP:
      return <ArrowsClockwise {...props} />;
    case PowerUpType.PHANTOM:
      return <Ghost {...props} />;
    case PowerUpType.NOVA:
      return <SunDim {...props} />;
    case PowerUpType.RETALIATE:
      return <Crosshair {...props} />;
    case PowerUpType.GRAVITY_REVERSE:
      return <ArrowsInSimple {...props} />;
    case PowerUpType.WEAK_THRUST:
      return <BatteryVerticalLow {...props} />;
    case PowerUpType.ORBIT_SHRINK:
      return <CircleDashed {...props} />;
    case PowerUpType.RANDOM:
      return <SealQuestion {...props} />;
    default:
      return <SealQuestion {...props} />;
  }
}

export default function PowerUpSvgIcon({ type }: { type: PowerUpType }) {
  const isDebuff =
    type === PowerUpType.GRAVITY_REVERSE ||
    type === PowerUpType.WEAK_THRUST ||
    type === PowerUpType.ORBIT_SHRINK;
  const color = powerUpIconColor(type, isDebuff);

  return (
    <span className="orbit-powerup-icon" style={{ color }} aria-hidden>
      <PhosphorGlyph type={type} color={color} />
    </span>
  );
}
