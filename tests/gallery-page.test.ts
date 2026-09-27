import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import GalleryGrid from '../src/components/GalleryGrid.astro';
import GalleryPage from '../src/pages/[lang]/gallery.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import type { GalleryItem } from '../src/lib/gallery';
import { scriptPolicyViolations } from './helpers/script-policy';

type Component = Parameters<AstroContainer['renderToString']>[0];
const GalleryPageComponent = GalleryPage as unknown as Component;

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

// The dev-mode Container API injects data-astro-source-* attributes on
// every element; strip them so exact-markup assertions stay readable.
function stripAstroSource(doc: string): string {
  return doc.replace(/\s+data-astro-source-(?:file|loc)="[^"]*"/g, '');
}

async function render(...args: Parameters<AstroContainer['renderToString']>): Promise<string> {
  return stripAstroSource(await container.renderToString(...args));
}

function item(slug: string, overrides: Partial<GalleryItem['data']> = {}): GalleryItem {
  return {
    slug,
    data: {
      image: `images/gallery/${slug}.jpg`,
      width: 800,
      height: 600,
      alt: { en: `Alt ${slug}`, am: `የ${slug} መግለጫ` },
      placeholder: false,
      ...overrides,
    },
  };
}

describe('GalleryGrid', () => {
  it('shows the empty state when items is []', async () => {
    const doc = await render(GalleryGrid, { props: { lang: 'en', items: [] } });
    expect(doc).toContain('No photos yet — check back soon.');
    expect(doc).not.toContain('⟦missing:');
  });

  it('renders one <li> per item', async () => {
    const items = [item('a'), item('b'), item('c')];
    const doc = await render(GalleryGrid, { props: { lang: 'en', items } });
    expect((doc.match(/<li\b/g) ?? []).length).toBe(3);
  });

  it('every <img> has a non-empty alt, width, height, loading="lazy", and a src under images/gallery/', async () => {
    const items = [item('a'), item('b')];
    const doc = await render(GalleryGrid, { props: { lang: 'en', items } });
    const imgs = [...doc.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img).toMatch(/\balt="[^"]+"/);
      expect(img).toMatch(/\bwidth="\d+"/);
      expect(img).toMatch(/\bheight="\d+"/);
      expect(img).toContain('loading="lazy"');
      expect(img).toMatch(/\bsrc="\/images\/gallery\//);
    }
  });

  it('shows the Placeholder badge on placeholder entries only', async () => {
    const items = [item('real', { placeholder: false }), item('ph', { placeholder: true })];
    const doc = await render(GalleryGrid, { props: { lang: 'en', items } });
    expect((doc.match(/data-placeholder/g) ?? []).length).toBe(1);
  });

  it('a real (non-placeholder) item with a date shows both-calendar dates and no badge', async () => {
    const items = [item('real', { date: '2026-09-27', caption: { en: 'Caption', am: 'መግለጫ' } })];
    const doc = await render(GalleryGrid, { props: { lang: 'en', items } });
    expect(doc).not.toContain('data-placeholder');
    expect(doc).toContain('Caption');
    expect(doc).toMatch(/<time datetime="2026-09-27">Meskerem 17, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2026-09-27">September 27, 2026<\/time>/);
  });

  it('links each image to its full-size file with an accessible name', async () => {
    const items = [item('a')];
    const doc = await render(GalleryGrid, { props: { lang: 'en', items } });
    expect(doc).toMatch(/<a href="\/images\/gallery\/a\.jpg" aria-label="View full size: Alt a">/);
  });

  it('renders Amharic alt text and captions on the am locale, with no missing markers', async () => {
    const items = [item('a', { caption: { en: 'Cap', am: 'መግለጫ' } })];
    const doc = await render(GalleryGrid, { props: { lang: 'am', items } });
    expect(doc).toContain('የa መግለጫ');
    expect(doc).toContain('መግለጫ');
    expect(doc).not.toContain('⟦missing:');
  });

  it('omits <figcaption> entirely when there is no caption, date or placeholder', async () => {
    const items = [item('a')];
    const doc = await render(GalleryGrid, { props: { lang: 'en', items } });
    expect(doc).not.toContain('<figcaption>');
  });
});

describe('gallery page', () => {
  const html: Partial<Record<Locale, string>> = {};

  beforeAll(async () => {
    for (const lang of LOCALES) {
      html[lang] = await render(GalleryPageComponent, {
        params: { lang },
        request: new Request(`http://localhost/${lang}/gallery/`),
      });
    }
  });

  it.each(LOCALES)('sets <html lang> correctly — %s', (lang) => {
    expect(html[lang]).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  // The Container API used in these tests doesn't run Astro's content-layer
  // sync, so getCollection('gallery') sees an empty collection here even
  // though 6 items are shipped (confirmed instead by `npm run build`, which
  // does sync — see the task's build evidence). This still exercises the
  // empty-state path end-to-end through the real page.
  it.each(LOCALES)('renders the empty state under the Container API (no live content sync) — %s', (lang) => {
    expect(html[lang]).toContain(lang === 'en' ? 'No photos yet' : 'እስካሁን ፎቶ የለም');
  });

  it.each(LOCALES)('marks the Gallery nav link as current — %s', (lang) => {
    const href = `/${lang}/gallery/`;
    expect(html[lang]).toMatch(new RegExp(`<a href="${href.replace(/\//g, '\\/')}"[^>]*aria-current="page"`));
  });

  it.each(LOCALES)('has no missing-translation markers — %s', (lang) => {
    expect(html[lang]).not.toContain('⟦missing:');
  });

  it.each(LOCALES)('ships only local module scripts (no external hosts) — %s', (lang) => {
    expect(scriptPolicyViolations(html[lang]!)).toEqual([]);
  });
});
