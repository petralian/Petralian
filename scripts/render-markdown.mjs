import { readFile, writeFile } from 'node:fs/promises';
import { marked } from 'marked';

const renderer = new marked.Renderer();

renderer.hr = () => '<hr class="wp-block-separator has-alpha-channel-opacity" />';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatCalloutLabel(type) {
  return type
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function renderObsidianCallouts(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const calloutMatch = lines[index].match(/^\s*>\s*\[!([A-Za-z0-9_-]+)\][+-]?\s*(.*)$/);

    if (!calloutMatch) {
      output.push(lines[index]);
      continue;
    }

    const calloutType = calloutMatch[1].toLowerCase();
    const calloutTitle = calloutMatch[2].trim() || formatCalloutLabel(calloutType);
    const bodyLines = [];

    for (index += 1; index < lines.length; index += 1) {
      if (!/^\s*>/.test(lines[index])) {
        index -= 1;
        break;
      }

      bodyLines.push(lines[index].replace(/^\s*>\s?/, ''));
    }

    const bodyMarkdown = bodyLines.join('\n').trim();
    const bodyHtml = bodyMarkdown ? marked.parse(bodyMarkdown).trim() : '';

    output.push(`<div class="petralian-callout petralian-callout--${escapeHtml(calloutType)}">`);
    output.push(`  <div class="petralian-callout__title">${escapeHtml(calloutTitle)}</div>`);
    output.push('  <div class="petralian-callout__content">');
    if (bodyHtml) {
      output.push(bodyHtml);
    }
    output.push('  </div>');
    output.push('</div>');
  }

  return output.join('\n');
}

function stripEditorialScaffolding(markdown) {
  let output = markdown.replace(/^eff/, '');

  output = output.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/, '');

  output = output.replace(/\n## Featured Image Prompt\b[\s\S]*$/, '');

  return output;
}

function preprocessMarkdown(markdown) {
  return renderObsidianCallouts(
    stripEditorialScaffolding(markdown).replace(/\[\[([^\]]+)\]\]/g, '$1')
  );
}

async function main() {
  const [, , inputPath, outputPath] = process.argv;

  if (!inputPath || !outputPath) {
    console.error('Usage: node scripts/render-markdown.mjs <input.md> <output.html>');
    process.exit(1);
  }

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });

  const markdown = await readFile(inputPath, 'utf8');
  const html = marked.parse(preprocessMarkdown(markdown));
  await writeFile(outputPath, html, 'utf8');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});