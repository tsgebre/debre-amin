#!/usr/bin/env node
// Generates the site's social-share image (Open Graph / Twitter card):
// public/og-image.png, 1200x630, the cross motif and the palette
// (src/styles/tokens.ts) with the parish name in English and Amharic
// (src/i18n/en.json / am.json, so it can't drift from the real strings).
//
// Ethiopic glyphs need the self-hosted Noto Sans Ethiopic font
// (@fontsource/noto-sans-ethiopic). librsvg (which sharp uses to rasterize
// SVG) resolves fonts through fontconfig, which by default does not know
// about node_modules. This script writes a temporary fontconfig file that
// includes the system config *and* points at the fontsource font files, so
// both scripts render — verified by visual inspection (see the task notes;
// re-verify after upgrading @fontsource/noto-sans-ethiopic or on a new
// machine, since font rendering is environment-dependent).
//
// Usage:
//   node scripts/generate-og-image.mjs
//   npm run og:image
//
// The output is committed to public/og-image.png, so the build never
// depends on running this script or on sharp being able to render fonts at
// build time.

import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_FILE = resolve(ROOT, 'public/og-image.png');
const FONT_DIR = resolve(ROOT, 'node_modules/@fontsource/noto-sans-ethiopic/files');

const en = JSON.parse(await import('node:fs').then((fs) => fs.readFileSync(resolve(ROOT, 'src/i18n/en.json'), 'utf-8')));
const am = JSON.parse(await import('node:fs').then((fs) => fs.readFileSync(resolve(ROOT, 'src/i18n/am.json'), 'utf-8')));

const WIDTH = 1200;
const HEIGHT = 630;

// Site palette, src/styles/tokens.ts.
const BROWN = '#5b3a1e';
const GOLD = '#c9a227';
const WHITE = '#ffffff';

const siteNameEn = en['site.name'];
const siteNameAm = am['site.name'];
const taglineEn = en['site.tagline'];

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Greedy word-wrap using an average-character-width estimate; good enough for a generated card, verified visually afterwards. */
function wrap(text, fontSize, maxWidth, charWidthFactor) {
  const charWidth = fontSize * charWidthFactor;
  const maxChars = Math.max(1, Math.floor(maxWidth / charWidth));
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Simplified cross motif (src/components/CrossMotif.astro): a plus body
// with a ring terminal at each arm tip.
function plusOutline(cx, cy, halfWidth, tip) {
  const near = cx - halfWidth;
  const far = cx + halfWidth;
  const nearY = cy - halfWidth;
  const farY = cy + halfWidth;
  const top = cy - tip;
  const bottom = cy + tip;
  const left = cx - tip;
  const right = cx + tip;
  const pts = [
    [near, top], [far, top], [far, nearY], [right, nearY],
    [right, farY], [far, farY], [far, bottom], [near, bottom],
    [near, farY], [left, farY], [left, nearY], [near, nearY],
  ];
  return `M ${pts.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
}

function ring(cx, cy, rOuter, rInner) {
  const outer = `M ${cx - rOuter} ${cy} A ${rOuter} ${rOuter} 0 1 0 ${cx + rOuter} ${cy} A ${rOuter} ${rOuter} 0 1 0 ${cx - rOuter} ${cy} Z`;
  const inner = `M ${cx - rInner} ${cy} A ${rInner} ${rInner} 0 1 0 ${cx + rInner} ${cy} A ${rInner} ${rInner} 0 1 0 ${cx - rInner} ${cy} Z`;
  return `${outer} ${inner}`;
}

function crossMotif(cx, cy, scale) {
  const halfWidth = 14 * scale;
  const tip = 68 * scale;
  const rOuter = 24 * scale;
  const rInner = 11 * scale;
  const terminals = [
    [cx, cy - tip], [cx, cy + tip], [cx - tip, cy], [cx + tip, cy],
  ];
  const rings = terminals.map(([x, y]) => ring(x, y, rOuter, rInner)).join(' ');
  return `<path d="${plusOutline(cx, cy, halfWidth, tip)}" fill="${GOLD}" fill-rule="evenodd" />
    <path d="${rings}" fill="${GOLD}" fill-rule="evenodd" />`;
}

const crossCx = 175;
const crossCy = HEIGHT / 2;

const titleLines = wrap(siteNameEn, 52, 760, 0.52);
const titleStartY = HEIGHT / 2 - 110 - (titleLines.length - 1) * 30;
const titleTspans = titleLines
  .map((line, i) => `<tspan x="360" y="${titleStartY + i * 62}">${escapeXml(line)}</tspan>`)
  .join('');

const amLines = wrap(siteNameAm, 40, 760, 0.85);
const amStartY = titleStartY + titleLines.length * 62 + 44;
const amTspans = amLines
  .map((line, i) => `<tspan x="360" y="${amStartY + i * 50}">${escapeXml(line)}</tspan>`)
  .join('');

const taglineY = amStartY + amLines.length * 50 + 46;
const taglineLines = wrap(taglineEn, 26, 760, 0.5);
const taglineTspans = taglineLines
  .map((line, i) => `<tspan x="360" y="${taglineY + i * 34}">${escapeXml(line)}</tspan>`)
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BROWN}" />
  <rect width="${WIDTH}" height="10" y="${HEIGHT - 10}" fill="${GOLD}" />
  <rect width="${WIDTH}" height="10" fill="${GOLD}" />
  ${crossMotif(crossCx, crossCy, 1.6)}
  <text font-family="Inter, 'Noto Sans Ethiopic', sans-serif" font-weight="700" font-size="52" fill="${WHITE}">${titleTspans}</text>
  <text font-family="'Noto Sans Ethiopic', sans-serif" font-weight="700" font-size="40" fill="${WHITE}">${amTspans}</text>
  <text font-family="Inter, sans-serif" font-weight="400" font-size="26" fill="${GOLD}">${taglineTspans}</text>
</svg>
`;

const tmpDir = mkdtempSync(join(tmpdir(), 'og-image-fontconfig-'));
const fontConfigPath = join(tmpDir, 'fonts.conf');
writeFileSync(
  fontConfigPath,
  `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>
  <dir>${FONT_DIR}</dir>
</fontconfig>
`,
);

if (!existsSync(FONT_DIR)) {
  throw new Error(`Ethiopic font directory not found: ${FONT_DIR} (is @fontsource/noto-sans-ethiopic installed?)`);
}

process.env.FONTCONFIG_FILE = fontConfigPath;

try {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT_FILE);
  console.log(`wrote ${OUT_FILE}`);
  console.log('Inspect it and confirm the Ethiopic text rendered as glyphs, not boxes.');
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
