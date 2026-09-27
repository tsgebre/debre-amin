// Single source of truth for the palette. `global.css` declares the same
// hex values as `--color-*` custom properties — tests/tokens.test.ts checks
// the two stay in sync.

export const green = '#1e4d2b';
export const greenDark = '#163a20';
/** Decoration and backgrounds only — too light for text on cream/white. */
export const gold = '#c9a227';
/** Text-safe gold: darkened so it can carry text on light backgrounds. */
export const goldDark = '#7a5e12';
export const red = '#9b1c1c';
export const cream = '#faf6ee';
export const ink = '#2a2a28';
export const muted = '#5b5850';
export const white = '#ffffff';

export type TextPair = readonly [fg: string, bg: string, minRatio: number];

// Every foreground/background combination the CSS actually uses for text.
export const TEXT_PAIRS: readonly TextPair[] = [
  [ink, cream, 4.5], // body text on the page background
  [green, cream, 4.5], // links
  [white, green, 4.5], // nav text on the header band
  [white, greenDark, 4.5], // footer text on the footer band
  [ink, gold, 4.5], // placeholder badge text on its gold background
  [white, green, 3], // focus ring (outline: currentColor) on the header band
  [muted, cream, 4.5], // secondary text: review notes, captions, empty states
  [gold, green, 3], // skip-link focus ring, drawn over the header band
];
