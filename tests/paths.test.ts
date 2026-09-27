import { describe, expect, it } from 'vitest';
import { localizedPath, switchLocalePath } from '../src/i18n/paths';
import type { Locale } from '../src/i18n/index';

const BASES = ['/', '/debre-amin', '/debre-amin/'] as const;

describe('localizedPath', () => {
  const cases: [Locale, string, string, string][] = [
    ['en', '', '/', '/en/'],
    ['am', '', '/', '/am/'],
    ['en', 'about', '/', '/en/about/'],
    ['am', 'about', '/debre-amin/', '/debre-amin/am/about/'],
    ['am', 'about', '/debre-amin', '/debre-amin/am/about/'],
    ['en', '', '/debre-amin', '/debre-amin/en/'],
    ['en', '', '/debre-amin/', '/debre-amin/en/'],
    ['en', 'events/timket-2026', '/debre-amin/', '/debre-amin/en/events/timket-2026/'],
    ['en', '/about/', '/', '/en/about/'],
    ['en', 'about', '', '/en/about/'],
  ];

  it.each(cases)('(%s, %j, %j) -> %s', (lang, slug, base, expected) => {
    expect(localizedPath(lang, slug, base)).toBe(expected);
  });

  it('defaults base to BASE_URL', () => {
    expect(localizedPath('en', 'about')).toBe('/en/about/');
  });
});

describe('switchLocalePath', () => {
  const cases: [string, Locale, string, string][] = [
    ['/en/', 'am', '/', '/am/'],
    ['/en/about/', 'am', '/', '/am/about/'],
    ['/am/about', 'en', '/', '/en/about/'],
    ['/debre-amin/en/about/', 'am', '/debre-amin/', '/debre-amin/am/about/'],
    ['/debre-amin/en/about/', 'am', '/debre-amin', '/debre-amin/am/about/'],
    ['/debre-amin/am/events/timket/', 'en', '/debre-amin/', '/debre-amin/en/events/timket/'],
    ['/debre-amin/', 'am', '/debre-amin/', '/debre-amin/am/'],
    ['/debre-amin', 'en', '/debre-amin', '/debre-amin/en/'],
    ['/', 'am', '/', '/am/'],
    ['/about/', 'am', '/', '/am/about/'],
    ['/debre-amin/about/', 'en', '/debre-amin/', '/debre-amin/en/about/'],
    // a lookalike prefix is not the base
    ['/debre-aminx/en/', 'am', '/debre-amin/', '/debre-amin/am/debre-aminx/en/'],
  ];

  it.each(cases)('(%j, %s, %j) -> %s', (pathname, target, base, expected) => {
    expect(switchLocalePath(pathname, target, base)).toBe(expected);
  });

  it.each(BASES)('round-trips en -> am -> en under base %j', (base) => {
    for (const slug of ['', 'about', 'events/timket-2026']) {
      const original = localizedPath('en', slug, base);
      const there = switchLocalePath(original, 'am', base);
      expect(there).toBe(localizedPath('am', slug, base));
      expect(switchLocalePath(there, 'en', base)).toBe(original);
    }
  });
});

describe('path invariants', () => {
  it.each(BASES)('never emits "//" and always ends with "/" for base %j', (base) => {
    const outputs: string[] = [];
    for (const lang of ['en', 'am'] as const) {
      for (const slug of ['', 'about', '/about/', 'events/x', 'a//b']) {
        outputs.push(localizedPath(lang, slug, base));
      }
      for (const p of ['/', '/en/', '/am/about', '/debre-amin/', '/debre-amin/en/about/']) {
        outputs.push(switchLocalePath(p, lang, base));
      }
    }
    for (const out of outputs) {
      expect(out, out).not.toContain('//');
      expect(out.endsWith('/'), out).toBe(true);
      expect(out.startsWith('/'), out).toBe(true);
    }
  });
});
