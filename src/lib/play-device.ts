export type PlayDevice = "mobile" | "tablet" | "desktop";

export function detectPlayDevice(): PlayDevice {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  const ua = navigator.userAgent;
  const touch = navigator.maxTouchPoints > 0;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (/iPad|Tablet|PlayBook/i.test(ua)) return "tablet";
  if (touch && width >= 600 && width < 1100) return "tablet";
  if (touch || coarse || width < 600 || /Android|iPhone|iPod|Mobile/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export function deviceLabel(device: PlayDevice): string {
  switch (device) {
    case "mobile":
      return "Mobile";
    case "tablet":
      return "Tablet";
    default:
      return "Desktop";
  }
}
