import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as tokens from '../src/styles/tokens';
import { TEXT_PAIRS } from '../src/styles/tokens';

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

describe('WCAG contrast formula', () => {
  it('matches known reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 1);
  });
});

describe('TEXT_PAIRS', () => {
  it.each(TEXT_PAIRS)('%s on %s meets %s:1', (fg, bg, minRatio) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(minRatio);
  });

  it('never lists gold as text on cream or white', () => {
    const disallowed = new Set([tokens.cream, tokens.white]);
    for (const [fg, bg] of TEXT_PAIRS) {
      if (fg === tokens.gold) {
        expect(disallowed.has(bg)).toBe(false);
      }
    }
  });
});

describe('global.css token sync', () => {
  const css = readFileSync(resolve(__dirname, '../src/styles/global.css'), 'utf-8');

  const tokenToVar: Record<string, string> = {
    green: '--color-green',
    greenDark: '--color-green-dark',
    gold: '--color-gold',
    goldDark: '--color-gold-dark',
    red: '--color-red',
    cream: '--color-cream',
    ink: '--color-ink',
    muted: '--color-muted',
    white: '--color-white',
  };

  it.each(Object.entries(tokenToVar))('--color-* for %s matches tokens.ts', (name, cssVar) => {
    const match = new RegExp(`${cssVar}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`).exec(css);
    expect(match, `expected ${cssVar} to be declared in global.css`).not.toBeNull();
    const value = match![1].toLowerCase();
    const expected = (tokens as unknown as Record<string, string>)[name].toLowerCase();
    expect(value).toBe(expected);
  });

  it('declares every custom property inside :root', () => {
    const rootBlock = /:root\s*\{([^}]*)\}/.exec(css)![1];
    for (const cssVar of Object.values(tokenToVar)) {
      expect(rootBlock).toContain(cssVar);
    }
  });
});
