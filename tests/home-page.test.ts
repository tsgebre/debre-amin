import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import HomeView, { type AnnouncementItem } from '../src/components/HomeView.astro';
import HomePage from '../src/pages/[lang]/index.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import type { GregorianDate } from '../src/lib/ecal';
import { scriptPolicyViolations } from './helpers/script-policy';

type Component = Parameters<AstroContainer['renderToString']>[0];
const HomePageComponent = HomePage as unknown as Component;

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

// The dev-mode Container API injects data-astro-source-* attributes on
// every element; strip them so exact-markup assertions stay readable.
function stripAstroSource(doc: string): string {
  return doc.replace(/\s+data-astro-source-(?:file|loc)="[^"]*"/g, '');
}

async function render(
  lang: Locale,
  today: GregorianDate,
  announcements?: AnnouncementItem[],
): Promise<string> {
  const doc = await container.renderToString(HomeView, {
    props: { lang, today, ...(announcements ? { announcements } : {}) },
    request: new Request(`http://localhost/${lang}/`),
  });
  return stripAstroSource(doc);
}

describe('HomeView — en, today = 2026-09-27 (Meskel day)', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('en', { year: 2026, month: 9, day: 27 });
  });

  it('shows the next feast as Meskel, with the "Today" label', () => {
    expect(doc).toMatch(/Meskel[^<]*<span class="home-today-label">Today<\/span>/);
    expect(doc).toMatch(/<time datetime="2026-09-27">Meskerem 17, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2026-09-27">September 27, 2026<\/time>/);
  });

  it('shows the next monthly commemoration as Meskerem 24, 2019 = October 4, 2026', () => {
    expect(doc).toMatch(/<time datetime="2026-10-04">Meskerem 24, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2026-10-04">October 4, 2026<\/time>/);
  });

  it('has no missing-translation markers', () => {
    expect(doc).not.toContain('⟦missing:');
  });
});

describe('HomeView — en, today = 2026-09-28 (day after Meskel)', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('en', { year: 2026, month: 9, day: 28 });
  });

  it('shows the next feast as the Birth of Abune Teklehaymanot, without the "Today" label', () => {
    expect(doc).toContain('Birth of Abune Teklehaymanot');
    expect(doc).toMatch(/<time datetime="2027-01-02">Tahsas 24, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2027-01-02">January 2, 2027<\/time>/);
    expect(doc).not.toContain('home-today-label');
  });
});

describe('HomeView — en, today = 2027-03-10 (inside Abiy Tsom)', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('en', { year: 2027, month: 3, day: 10 });
  });

  it('shows Abiy Tsom in progress, "until Fasika" May 2, 2027', () => {
    expect(doc).toContain('Fast in progress');
    expect(doc).toContain('Great Lent');
    expect(doc).toContain('until Fasika');
    expect(doc).toMatch(/<time datetime="2027-05-02">Miyazia 24, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2027-05-02">May 2, 2027<\/time>/);
  });
});

describe('HomeView — en, today = 2026-10-15 (no fast in progress)', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('en', { year: 2026, month: 10, day: 15 });
  });

  it('does not render the fast-in-progress section', () => {
    expect(doc).not.toContain('Fast in progress');
  });
});

describe('HomeView — services list', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('en', { year: 2026, month: 9, day: 27 });
  });

  it('headings the services card plainly, with no cadence claim', () => {
    expect(doc).toMatch(/<h2[^>]*>Services<\/h2>/);
  });

  it('lists all 3 services with placeholder day and time, and a link to /en/services/', () => {
    const placeholders = doc.match(/data-placeholder/g) ?? [];
    // 3 services × 2 placeholders (day, time) = 6, plus other placeholder use elsewhere is none on Home.
    expect(placeholders.length).toBe(6);
    expect(doc).toContain('Divine Liturgy');
    expect(doc).toContain('Sunday School');
    expect(doc).toContain('Prayer &amp; Teaching Service');
    expect(doc).toMatch(/<a href="\/en\/services\/">/);
  });
});

describe('HomeView — announcements', () => {
  const today: GregorianDate = { year: 2026, month: 9, day: 27 };

  it('shows the empty-state text when there are no announcements', async () => {
    const doc = await render('en', today, []);
    expect(doc).toContain('No announcements yet — check back soon.');
    expect(doc).not.toMatch(/<li>\s*<a href/);
  });

  it('renders exactly 3 of 4 announcements, each with both-calendar dates', async () => {
    const items: AnnouncementItem[] = [
      { title: 'First', date: { year: 2026, month: 10, day: 1 }, href: '/en/events/first/' },
      { title: 'Second', date: { year: 2026, month: 10, day: 8 }, href: '/en/events/second/' },
      { title: 'Third', date: { year: 2026, month: 10, day: 15 }, href: '/en/events/third/' },
      { title: 'Fourth', date: { year: 2026, month: 10, day: 22 }, href: '/en/events/fourth/' },
    ];
    const doc = await render('en', today, items);
    const links = [...doc.matchAll(/<a href="\/en\/events\/[^"]*">([^<]*)<\/a>/g)].map((m) => m[1]);
    expect(links).toEqual(['First', 'Second', 'Third']);
    expect(doc).not.toContain('Fourth');
    expect(doc).toMatch(/<time datetime="2026-10-01">Meskerem 21, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2026-10-01">October 1, 2026<\/time>/);
  });
});

describe('HomeView — am, today = 2026-09-27', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('am', { year: 2026, month: 9, day: 27 });
  });

  it('shows Amharic feast and month names, no missing markers', () => {
    expect(doc).toContain('መስከረም');
    expect(doc).toContain('መስቀል');
    expect(doc).not.toContain('⟦missing:');
  });
});

describe('home page', () => {
  const html: Partial<Record<Locale, string>> = {};

  beforeAll(async () => {
    for (const lang of LOCALES) {
      const doc = await container.renderToString(HomePageComponent, {
        params: { lang },
        request: new Request(`http://localhost/${lang}/`),
      });
      html[lang] = stripAstroSource(doc);
    }
  });

  it.each(LOCALES)('sets <html lang> correctly — %s', (lang) => {
    expect(html[lang]).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  it.each(LOCALES)('has exactly one <h1> — %s', (lang) => {
    const matches = html[lang]!.match(/<h1[^>]*>/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  it.each(LOCALES)('marks the Home nav link as current — %s', (lang) => {
    const href = `/${lang}/`;
    expect(html[lang]).toMatch(new RegExp(`<a href="${href.replace(/\//g, '\\/')}"[^>]*aria-current="page"`));
  });

  it.each(LOCALES)('has no missing-translation markers — %s', (lang) => {
    expect(html[lang]).not.toContain('⟦missing:');
  });

  it.each(LOCALES)('ships only local module scripts (no external hosts) — %s', (lang) => {
    expect(scriptPolicyViolations(html[lang]!)).toEqual([]);
  });
});
