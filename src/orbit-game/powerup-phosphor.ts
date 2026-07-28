import { PowerUpType } from "./orbit";
import { PHOSPHOR_FILL_PATHS, type PhosphorPathKey } from "./phosphor-paths";

function pathKeyForType(type: PowerUpType): PhosphorPathKey {
  switch (type) {
    case PowerUpType.SHIELD:
      return "SHIELD";
    case PowerUpType.SCORE_MULTIPLIER:
      return "SCORE";
    case PowerUpType.MAGNET:
      return "MAGNET";
    case PowerUpType.TURBO_THRUST:
      return "TURBO";
    case PowerUpType.OVERCHARGE:
      return "OVER";
    case PowerUpType.ORBIT_FLIP:
      return "FLIP";
    case PowerUpType.PHANTOM:
      return "GHOST";
    case PowerUpType.NOVA:
      return "NOVA";
    case PowerUpType.RETALIATE:
      return "RET";
    case PowerUpType.GRAVITY_REVERSE:
      return "REV";
    case PowerUpType.WEAK_THRUST:
      return "WEAK";
    case PowerUpType.ORBIT_SHRINK:
      return "SHRINK";
    case PowerUpType.RANDOM:
      return "RAND";
    default:
      return "RAND";
  }
}

/** Colored glyph fill — guide + in-game sprites (no circle backing). */
export function powerUpIconColor(type: PowerUpType, isDebuff = false): string {
  if (isDebuff) return "#ff5a6e";
  switch (type) {
    case PowerUpType.SHIELD:
      return "#4da3ff";
    case PowerUpType.SCORE_MULTIPLIER:
      return "#5b9cf5";
    case PowerUpType.MAGNET:
      return "#9b4de8";
    case PowerUpType.TURBO_THRUST:
      return "#2dd4a8";
    case PowerUpType.OVERCHARGE:
      return "#6bb0ff";
    case PowerUpType.ORBIT_FLIP:
      return "#3b9eed";
    case PowerUpType.PHANTOM:
      return "#a8b8cc";
    case PowerUpType.NOVA:
      return "#ff8c32";
    case PowerUpType.RETALIATE:
      return "#32e8c0";
    case PowerUpType.RANDOM:
      return "#b08cff";
    default:
      return "#2dd4a8";
  }
}

/** @deprecated Use powerUpIconColor — kept for any stale imports */
export function powerUpBgColor(type: PowerUpType, isDebuff: boolean): string {
  return powerUpIconColor(type, isDebuff);
}

function buildPickupSvg(iconColor: string, pathD: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <path d="${pathD}" fill="${iconColor}"/>
</svg>`;
}

function svgToCanvas(svg: string, size: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    );
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("No 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG rasterize failed"));
    };
    img.src = url;
  });
}

export async function loadPowerUpSprite(
  type: PowerUpType,
  size: number,
  isDebuff: boolean
): Promise<HTMLCanvasElement> {
  const key = pathKeyForType(type);
  const pathD = PHOSPHOR_FILL_PATHS[key];
  const color = powerUpIconColor(type, isDebuff);
  return svgToCanvas(buildPickupSvg(color, pathD), size);
}

export async function loadAllPowerUpSprites(
  size = 64
): Promise<Map<PowerUpType, HTMLCanvasElement>> {
  const types = [
    PowerUpType.SHIELD,
    PowerUpType.SCORE_MULTIPLIER,
    PowerUpType.MAGNET,
    PowerUpType.TURBO_THRUST,
    PowerUpType.OVERCHARGE,
    PowerUpType.ORBIT_FLIP,
    PowerUpType.PHANTOM,
    PowerUpType.NOVA,
    PowerUpType.RETALIATE,
    PowerUpType.GRAVITY_REVERSE,
    PowerUpType.WEAK_THRUST,
    PowerUpType.ORBIT_SHRINK,
    PowerUpType.RANDOM,
  ];

  const entries = await Promise.all(
    types.map(async (type) => {
      const canvas = await loadPowerUpSprite(
        type,
        size,
        type === PowerUpType.GRAVITY_REVERSE ||
          type === PowerUpType.WEAK_THRUST ||
          type === PowerUpType.ORBIT_SHRINK
      );
      return [type, canvas] as const;
    })
  );

  return new Map(entries);
}
