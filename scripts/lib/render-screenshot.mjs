/**
 * Render editor / terminal / panel screenshots as PNG (then pipeline → AVIF).
 */
import fs from "node:fs";
import sharp from "sharp";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLines(text, maxChars = 96) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    if (raw.length <= maxChars) {
      out.push(raw);
      continue;
    }
    let rest = raw;
    while (rest.length > maxChars) {
      let cut = rest.lastIndexOf(" ", maxChars);
      if (cut < maxChars * 0.5) cut = maxChars;
      out.push(rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    if (rest) out.push(rest);
  }
  return out;
}

export async function renderCodeScreenshot({
  title,
  content,
  outPath,
  theme = "dark",
  maxLines = 42,
}) {
  const lines = wrapLines(content).slice(0, maxLines);
  const lineHeight = 20;
  const padding = 24;
  const charWidth = 8.2;
  const maxLen = Math.min(
    110,
    Math.max(...lines.map((l) => l.length), title.length + 4, 48)
  );
  const width = Math.min(1200, Math.ceil(maxLen * charWidth) + padding * 2);
  const height = padding * 2 + lines.length * lineHeight + 44;

  const bg = theme === "dark" ? "#1e1e1e" : "#ffffff";
  const fg = theme === "dark" ? "#d4d4d4" : "#1e1e1e";
  const tabBg = theme === "dark" ? "#252526" : "#f3f3f3";
  const titleColor = theme === "dark" ? "#9cdcfe" : "#0451a5";

  const body = lines
    .map(
      (line, i) =>
        `<tspan x="${padding}" dy="${i === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`
    )
    .join("");

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="40" fill="${tabBg}"/>
  <text x="${padding}" y="26" font-family="Consolas, 'Cascadia Code', monospace" font-size="13" fill="${titleColor}">${esc(title)}</text>
  <text x="${padding}" y="64" font-family="Consolas, 'Cascadia Code', monospace" font-size="13" fill="${fg}">${body}</text>
</svg>`;

  fs.mkdirSync(outPath.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}

export async function renderTerminalScreenshot({ lines, outPath, title = "powershell" }) {
  const wrapped = [];
  for (const line of lines) wrapped.push(...wrapLines(line, 88));
  const lineHeight = 18;
  const padding = 20;
  const width = 920;
  const height = padding * 2 + wrapped.length * lineHeight + 36;

  const body = wrapped
    .map(
      (line, i) =>
        `<tspan x="${padding}" dy="${i === 0 ? 0 : lineHeight}" fill="${line.startsWith("HTTP") || line.includes("403") ? "#f48771" : "#cccccc"}">${esc(line)}</tspan>`
    )
    .join("");

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0c0c0c"/>
  <rect width="100%" height="32" fill="#1a1a1a"/>
  <text x="${padding}" y="22" font-family="Segoe UI, sans-serif" font-size="12" fill="#cccccc">${esc(title)}</text>
  <text x="${padding}" y="52" font-family="Consolas, monospace" font-size="12">${body}</text>
</svg>`;

  fs.mkdirSync(outPath.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}

export async function renderPanelScreenshot({ title, rows, outPath }) {
  const lineHeight = 22;
  const padding = 24;
  const width = 880;
  const height = padding * 2 + rows.length * lineHeight + 56;

  const body = rows
    .map((row, i) => {
      const color =
        row.status === "pass"
          ? "#0cce6b"
          : row.status === "warn"
            ? "#ffa400"
            : "#d4d4d4";
      return `<tspan x="${padding}" dy="${i === 0 ? 0 : lineHeight}" fill="${color}">${esc(row.text)}</tspan>`;
    })
    .join("");

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8f9fa"/>
  <rect width="100%" height="48" fill="#1a1a2e"/>
  <text x="${padding}" y="30" font-family="Segoe UI, sans-serif" font-size="15" font-weight="600" fill="#ffffff">${esc(title)}</text>
  <text x="${padding}" y="72" font-family="Segoe UI, sans-serif" font-size="13">${body}</text>
</svg>`;

  fs.mkdirSync(outPath.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}

export async function renderTextPageScreenshot({ title, url, content, outPath }) {
  const lines = wrapLines(content, 92).slice(0, 36);
  const lineHeight = 18;
  const padding = 28;
  const width = 1000;
  const height = padding * 2 + lines.length * lineHeight + 72;

  const body = lines
    .map(
      (line, i) =>
        `<tspan x="${padding}" dy="${i === 0 ? 0 : lineHeight}" fill="#24292f">${esc(line)}</tspan>`
    )
    .join("");

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect width="100%" height="44" fill="#f6f8fa"/>
  <text x="${padding}" y="28" font-family="Segoe UI, sans-serif" font-size="13" fill="#57606a">${esc(url)}</text>
  <text x="${padding}" y="62" font-family="Segoe UI, sans-serif" font-size="18" font-weight="600" fill="#1f2328">${esc(title)}</text>
  <text x="${padding}" y="96" font-family="Consolas, monospace" font-size="12">${body}</text>
</svg>`;

  fs.mkdirSync(outPath.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}
