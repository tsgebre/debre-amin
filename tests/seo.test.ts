import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { renderAllPages } from './helpers/pages';
import { DEFAULT_SITE } from '../src/config/deploy';

const pages = (await renderAllPages()).map((p) => ({ ...p, doc: new JSDOM(p.html).window.document }));
const localized = pages.filter((p) => !p.bare && !p.noindex);
const noindexPages = pages.filter((p) => p.noindex);

function meta(doc: Document, prop: string): string[] {
  return [...doc.querySelectorAll(`meta[property="${prop}"]`)].map((m) => m.getAttribute('content')!);
}

function linkHrefs(doc: Document, rel: string, hreflang?: string): string[] {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
  return [...doc.querySelectorAll(sel)].map((l) => l.getAttribute('href')!);
}

describe('localized pages: description', () => {
  it.each(localized.map((p) => [p.name, p] as const))('%s has exactly one non-empty <meta name="description">', (_n, p) => {
    const descs = [...p.doc.querySelectorAll('meta[name="description"]')];
    expect(descs).toHaveLength(1);
    expect(descs[0].getAttribute('content')?.trim()).toBeTruthy();
  });

  // Event detail uses the event's own summary as its description, which is
  // real content of arbitrary length, not one of the fixed meta.*.description
  // strings — so the 50-160 char rule applies to every other localized page.
  const lengthChecked = localized.filter((p) => !p.name.startsWith('event detail'));

  it.each(lengthChecked.map((p) => [p.name, p] as const))('%s: en description is 50-160 chars', (_n, p) => {
    if (p.lang !== 'en') return;
    const content = p.doc.querySelector('meta[name="description"]')!.getAttribute('content')!;
    expect(content.length).toBeGreaterThanOrEqual(50);
    expect(content.length).toBeLessThanOrEqual(160);
  });
});

describe('localized pages: canonical URL', () => {
  it.each(localized.map((p) => [p.name, p] as const))('%s has exactly one absolute canonical link', (_n, p) => {
    const links = linkHrefs(p.doc, 'canonical');
    expect(links).toHaveLength(1);
    expect(links[0].startsWith(DEFAULT_SITE)).toBe(true);
  });
});

describe('localized pages: hreflang alternates', () => {
  it.each(localized.map((p) => [p.name, p] as const))('%s has en, am and x-default alternates pointing at the right counterpart', (_n, p) => {
    const en = linkHrefs(p.doc, 'alternate', 'en');
    const am = linkHrefs(p.doc, 'alternate', 'am');
    const xdefault = linkHrefs(p.doc, 'alternate', 'x-default');
    expect(en).toHaveLength(1);
    expect(am).toHaveLength(1);
    expect(xdefault).toHaveLength(1);
    // x-default always points at the English version.
    expect(xdefault[0]).toBe(en[0]);
    // The two locale alternates share every path segment except the locale.
    const enPath = new URL(en[0]).pathname.replace(/^\/en\//, '');
    const amPath = new URL(am[0]).pathname.replace(/^\/am\//, '');
    expect(enPath).toBe(amPath);
    // The canonical URL for this page matches its own locale's alternate.
    const canonical = linkHrefs(p.doc, 'canonical')[0];
    const ownAlternate = p.lang === 'am' ? am[0] : en[0];
    expect(canonical).toBe(ownAlternate);
  });
});

describe('localized pages: Open Graph and Twitter', () => {
  it.each(localized.map((p) => [p.name, p] as const))('%s has the full OG set and a twitter:card', (_n, p) => {
    expect(meta(p.doc, 'og:title')).toHaveLength(1);
    expect(meta(p.doc, 'og:description')).toHaveLength(1);
    expect(meta(p.doc, 'og:type')).toEqual([p.ogType]);
    expect(meta(p.doc, 'og:url')).toEqual(linkHrefs(p.doc, 'canonical'));
    expect(meta(p.doc, 'og:site_name')).toHaveLength(1);
    const locale = meta(p.doc, 'og:locale');
    const altLocale = meta(p.doc, 'og:locale:alternate');
    expect(locale).toEqual([p.lang === 'am' ? 'am_ET' : 'en_US']);
    expect(altLocale).toEqual([p.lang === 'am' ? 'en_US' : 'am_ET']);
    const image = meta(p.doc, 'og:image');
    expect(image).toHaveLength(1);
    expect(image[0]).toBe(`${DEFAULT_SITE}/og-image.png`);
    expect(meta(p.doc, 'og:image:width')).toEqual(['1200']);
    expect(meta(p.doc, 'og:image:height')).toEqual(['630']);
    expect(meta(p.doc, 'og:image:alt')[0]).toBeTruthy();
    expect(p.doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  it('event detail declares og:type=article; every other page declares website', () => {
    const articlePages = pages.filter((p) => p.ogType === 'article');
    expect(articlePages.length).toBeGreaterThan(0);
    for (const p of articlePages) expect(p.name).toMatch(/^event detail/);
  });
});

describe('noindex pages (root redirect, 404)', () => {
  it.each(noindexPages.map((p) => [p.name, p] as const))('%s has noindex and no hreflang alternates', (_n, p) => {
    const robots = [...p.doc.querySelectorAll('meta[name="robots"]')].map((m) => m.getAttribute('content'));
    expect(robots).toContain('noindex');
    expect(p.doc.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
  });

  it('covers both the root redirect and the 404', () => {
    expect(noindexPages.map((p) => p.name).sort()).toEqual(['404', 'root redirect']);
  });
});
