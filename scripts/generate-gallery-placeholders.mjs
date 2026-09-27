#!/usr/bin/env node
// Generates six original, abstract 800x600 SVGs for the Gallery page's
// shipped placeholder entries, using only the site palette
// (src/styles/tokens.ts) and a tiled echo of the cross motif's plus shape
// (src/components/CrossMotif.astro). No photographs, no external
// references, no <text> — safe to ship as clearly-marked placeholder
// content until the parish supplies real photos.
//
// Usage:
//   node scripts/generate-gallery-placeholders.mjs
//   npm run gallery:placeholders
//
// The output is committed to public/images/gallery/placeholder-1.svg
// through -6.svg, so the build never depends on running this script —
// re-run it only if you want to regenerate those six files.

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/images/gallery');

const WIDTH = 800;
const HEIGHT = 600;

// Site palette, src/styles/tokens.ts.
const BROWN = '#5b3a1e';
const BROWN_DARK = '#3e2712';
const GOLD = '#c9a227';
const GOLD_DARK = '#7a5e12';
const RED = '#9b1c1c';
const CREAM = '#faf6ee';
const INK = '#2a2a28';

// Six distinct compositions: a background gradient plus a tiled grid of
// plus-shapes (the cross motif, simplified) at varying density, size and
// rotation, so each placeholder reads as visually distinct.
const VARIANTS = [
  { from: BROWN, to: GOLD, motif: GOLD_DARK, cols: 5, rows: 3, rotate: 0 },
  { from: GOLD_DARK, to: CREAM, motif: BROWN, cols: 4, rows: 3, rotate: 15 },
  { from: BROWN_DARK, to: RED, motif: CREAM, cols: 5, rows: 4, rotate: 0 },
  { from: GOLD, to: BROWN, motif: INK, cols: 4, rows: 3, rotate: 30 },
  { from: RED, to: GOLD_DARK, motif: CREAM, cols: 4, rows: 4, rotate: -15 },
  { from: INK, to: BROWN, motif: GOLD, cols: 4, rows: 3, rotate: 10 },
];

/** A plus/cross outline centered at (cx, cy): arm half-width `half`, tip distance `tip`. */
function plusPath(cx, cy, half, tip) {
  const points = [
    [cx - half, cy - tip],
    [cx + half, cy - tip],
    [cx + half, cy - half],
    [cx + tip, cy - half],
    [cx + tip, cy + half],
    [cx + half, cy + half],
    [cx + half, cy + tip],
    [cx - half, cy + tip],
    [cx - half, cy + half],
    [cx - tip, cy + half],
    [cx - tip, cy - half],
    [cx - half, cy - half],
  ];
  return `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
}

function buildVariant(index, { from, to, motif, cols, rows, rotate }) {
  const gradId = `g${index}`;
  const cellW = WIDTH / cols;
  const cellH = HEIGHT / rows;
  const tip = Math.min(cellW, cellH) * 0.28;
  const half = tip * 0.32;

  const crosses = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = Math.round(cellW * (c + 0.5));
      const cy = Math.round(cellH * (r + 0.5));
      const opacity = (0.12 + ((r + c) % 3) * 0.06).toFixed(2);
      const d = plusPath(cx, cy, Math.round(half), Math.round(tip));
      crosses.push(
        `<path d="${d}" fill="${motif}" opacity="${opacity}" transform="rotate(${rotate} ${cx} ${cy})" />`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}" />
      <stop offset="1" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${gradId})" />
  ${crosses.join('\n  ')}
</svg>
`;
}

for (const [i, variant] of VARIANTS.entries()) {
  const index = i + 1;
  const svg = buildVariant(index, variant);
  const path = resolve(OUT_DIR, `placeholder-${index}.svg`);
  writeFileSync(path, svg, 'utf-8');
  console.log(`wrote ${path}`);
}
