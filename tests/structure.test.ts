import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { renderAllPages } from './helpers/pages';

// Document structure over every rendered page type, both locales. The root
// redirect is `bare` (no site chrome, no headings) and is exempt from the
// heading and landmark checks only.
const pages = (await renderAllPages()).map((p) => ({
  ...p,
  doc: new JSDOM(p.html).window.document,
}));
const cases = pages.map((p) => [p.name, p] as const);
const chromed = cases.filter(([, p]) => !p.bare);

function accessibleName(a: Element): string {
  const label = a.getAttribute('aria-label')?.trim();
  if (label) return label;
  const text = a.textContent?.trim();
  if (text) return text;
  return [...a.querySelectorAll('img[alt]')].map((img) => img.getAttribute('alt')!.trim()).join(' ');
}

describe('heading structure', () => {
  it.each(chromed)('%s has exactly one <h1>', (_n, p) => {
    expect(p.doc.querySelectorAll('h1')).toHaveLength(1);
  });

  it.each(chromed)('%s starts at h1 and never skips a level', (_n, p) => {
    const levels = [...p.doc.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    const skips = levels.flatMap((level, i) =>
      i > 0 && level > levels[i - 1] + 1 ? [`h${levels[i - 1]} → h${level}`] : [],
    );
    expect(skips).toEqual([]);
  });
});

describe('landmarks', () => {
  it.each(chromed)('%s has one main#main, header, footer and labelled nav', (_n, p) => {
    expect(p.doc.querySelectorAll('main')).toHaveLength(1);
    expect(p.doc.querySelector('main')!.id).toBe('main');
    expect(p.doc.querySelectorAll('header')).toHaveLength(1);
    expect(p.doc.querySelectorAll('footer')).toHaveLength(1);
    const navs = p.doc.querySelectorAll('nav');
    expect(navs).toHaveLength(1);
    expect(navs[0].getAttribute('aria-label')?.trim()).toBeTruthy();
  });
});

describe('element-level rules', () => {
  it.each(cases)('%s: every <img> has an alt attribute', (_n, p) => {
    const missing = [...p.doc.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt'));
    expect(missing.map((img) => img.outerHTML)).toEqual([]);
  });

  it.each(cases)('%s: every <a> has a non-empty accessible name', (_n, p) => {
    const unnamed = [...p.doc.querySelectorAll('a')].filter((a) => !accessibleName(a));
    expect(unnamed.map((a) => a.outerHTML)).toEqual([]);
  });

  it.each(cases)('%s: every table has a <caption> and every <th> has scope', (_n, p) => {
    for (const table of p.doc.querySelectorAll('table')) {
      expect(table.querySelector(':scope > caption')?.textContent?.trim()).toBeTruthy();
    }
    const unscoped = [...p.doc.querySelectorAll('th')].filter((th) => !th.hasAttribute('scope'));
    expect(unscoped.map((th) => th.outerHTML)).toEqual([]);
  });

  it.each(cases)('%s: every tabindex is 0 or -1', (_n, p) => {
    const bad = [...p.doc.querySelectorAll('[tabindex]')].filter(
      (el) => !['0', '-1'].includes(el.getAttribute('tabindex')!),
    );
    expect(bad.map((el) => el.outerHTML)).toEqual([]);
  });

  it.each(cases)('%s: every lang attribute is "en" or "am"', (_n, p) => {
    const bad = [...p.doc.querySelectorAll('[lang]')]
      .map((el) => el.getAttribute('lang'))
      .filter((lang) => lang !== 'en' && lang !== 'am');
    expect(bad).toEqual([]);
  });
});
