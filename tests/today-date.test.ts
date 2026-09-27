import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import TodayDate from '../src/components/TodayDate.astro';
import { scriptPolicyViolations, scriptTags } from './helpers/script-policy';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const render = (lang: 'en' | 'am', now: Date) => container.renderToString(TodayDate, { props: { lang, now } });

describe('TodayDate (server-rendered fallback)', () => {
  const now = new Date('2026-09-27T12:00:00Z');

  it('renders both calendars for the given moment in English', async () => {
    const doc = await render('en', now);
    expect(doc).toMatch(/<p class="today-date"[^>]*\bdata-today\b/);
    expect(doc).toContain('data-tz="America/New_York"');
    expect(doc).toMatch(/<time datetime="2026-09-27"[^>]*data-today-e[^>]*>Meskerem 17, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2026-09-27"[^>]*data-today-g[^>]*>September 27, 2026<\/time>/);
    expect(doc).toContain('Today:');
    expect(doc).not.toContain('⟦missing:');
  });

  it('renders both calendars in Amharic', async () => {
    const doc = await render('am', now);
    expect(doc).toMatch(/data-today-e[^>]*>መስከረም 17 ቀን 2019 ዓ\.ም\.<\/time>/);
    expect(doc).toMatch(/data-today-g[^>]*>27 ሴፕቴምበር 2026<\/time>/);
    expect(doc).toContain('ዛሬ:');
    expect(doc).not.toContain('⟦missing:');
  });

  it('uses the parish time zone, not UTC, for the civil day', async () => {
    const doc = await render('en', new Date('2026-09-11T03:30:00Z'));
    expect(doc).toContain('datetime="2026-09-10"');
    expect(doc).toContain('Pagume 5, 2018 E.C.');
  });

  it('hides the separator from assistive tech', async () => {
    expect(await render('en', now)).toMatch(/<span aria-hidden="true"[^>]*>·<\/span>/);
  });

  it('loads its updater as a local module script, never inline-classic or external', async () => {
    const doc = await render('en', now);
    expect(scriptTags(doc)).toHaveLength(1);
    expect(scriptPolicyViolations(doc)).toEqual([]);
  });
});
