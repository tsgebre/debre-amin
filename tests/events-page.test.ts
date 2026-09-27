import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import EventsList from '../src/components/EventsList.astro';
import EventDetail from '../src/components/EventDetail.astro';
import type { EventItem } from '../src/lib/events';

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

function item(slug: string, date: string, overrides: Partial<EventItem['data']> = {}): EventItem {
  return {
    slug,
    data: {
      type: 'event',
      title: { en: `Title ${slug}`, am: `አርእስት ${slug}` },
      summary: { en: `Summary ${slug}`, am: `ማጠቃለያ ${slug}` },
      date,
      bodyLang: 'en',
      draft: false,
      ...overrides,
    },
  };
}

describe('EventsList', () => {
  it('shows the empty state when items is []', async () => {
    const doc = await render(EventsList, { props: { lang: 'en', items: [] } });
    expect(doc).toContain('No events or announcements yet — check back soon.');
    expect(doc).not.toContain('⟦missing:');
  });

  it('renders items in the given order (newest-first is the caller\'s job) with both-calendar dates', async () => {
    const items = [item('meskel-day', '2026-09-27')];
    const doc = await render(EventsList, { props: { lang: 'en', items } });
    expect(doc).toMatch(/<time datetime="2026-09-27">Meskerem 17, 2019 E\.C\.<\/time>/);
    expect(doc).toMatch(/<time datetime="2026-09-27">September 27, 2026<\/time>/);
  });

  it('shows a type badge as text for events and announcements', async () => {
    const items = [item('a', '2027-01-01', { type: 'event' }), item('b', '2027-02-01', { type: 'announcement' })];
    const doc = await render(EventsList, { props: { lang: 'en', items } });
    expect(doc).toContain('Event');
    expect(doc).toContain('Announcement');
  });

  it('renders a date range as "from – to" in both calendars', async () => {
    const items = [item('range', '2027-01-15', { endDate: '2027-01-16' })];
    const doc = await render(EventsList, { props: { lang: 'en', items } });
    const article = doc.slice(doc.indexOf('<article'), doc.indexOf('</article>'));
    expect(article).toContain(' – ');
    expect(article).toMatch(/<time datetime="2027-01-15">/);
    expect(article).toMatch(/<time datetime="2027-01-16">/);
  });

  it('does not render a range for a single-day item', async () => {
    const items = [item('single', '2027-01-15')];
    const doc = await render(EventsList, { props: { lang: 'en', items } });
    expect(doc).not.toContain(' – ');
  });

  it('links each title to its detail page', async () => {
    const items = [item('the-slug', '2027-01-01')];
    const doc = await render(EventsList, { props: { lang: 'en', items } });
    expect(doc).toMatch(/<a href="\/en\/events\/the-slug\/">Title the-slug<\/a>/);
  });

  it('renders the summary text', async () => {
    const items = [item('a', '2027-01-01')];
    const doc = await render(EventsList, { props: { lang: 'en', items } });
    expect(doc).toContain('Summary a');
  });

  it('renders Amharic titles, badges and dates on the am locale, with no missing markers', async () => {
    const items = [item('a', '2026-09-27', { type: 'announcement' })];
    const doc = await render(EventsList, { props: { lang: 'am', items } });
    expect(doc).toContain('አርእስት a');
    expect(doc).toContain('ማስታወቂያ');
    expect(doc).toMatch(/መስከረም 17 ቀን 2019 ዓ\.ም\./);
    expect(doc).not.toContain('⟦missing:');
  });
});

describe('EventDetail', () => {
  const baseProps = {
    lang: 'en' as const,
    type: 'event' as const,
    title: 'Fixture Title',
    summary: 'Fixture summary.',
    date: { year: 2027, month: 1, day: 15 },
  };

  it('renders the title, type, dates and summary', async () => {
    const doc = await render(EventDetail, {
      props: { ...baseProps, bodyLang: 'en' },
      slots: { default: 'Fixture body.' },
    });
    expect(doc).toMatch(/<h1>Fixture Title<\/h1>/);
    expect(doc).toContain('Event');
    expect(doc).toMatch(/<time datetime="2027-01-15">Miyazia|<time datetime="2027-01-15">January 15, 2027/);
    expect(doc).toContain('Fixture summary.');
    expect(doc).toContain('Fixture body.');
  });

  it('renders a date range with an en dash', async () => {
    const doc = await render(EventDetail, {
      props: { ...baseProps, endDate: { year: 2027, month: 1, day: 16 }, bodyLang: 'en' },
      slots: { default: 'Body.' },
    });
    expect(doc).toContain(' – ');
    expect(doc).toMatch(/<time datetime="2027-01-16">/);
  });

  it('shows time and location when present', async () => {
    const doc = await render(EventDetail, {
      props: { ...baseProps, time: '1:00 PM', location: 'Fellowship Hall', bodyLang: 'en' },
      slots: { default: 'Body.' },
    });
    expect(doc).toContain('1:00 PM');
    expect(doc).toContain('Fellowship Hall');
  });

  it('puts lang="am" on the body wrapper when bodyLang is am', async () => {
    const doc = await render(EventDetail, {
      props: { ...baseProps, bodyLang: 'am' },
      slots: { default: 'የፊክስቸር ጽሑፍ።' },
    });
    expect(doc).toMatch(/<div lang="am">\s*የፊክስቸር ጽሑፍ።/);
  });

  it('shows the body-language note on the en page when bodyLang is am', async () => {
    const doc = await render(EventDetail, {
      props: { ...baseProps, lang: 'en', bodyLang: 'am' },
      slots: { default: 'Body.' },
    });
    expect(doc).toContain('Details available in Amharic.');
  });

  it('shows no body-language note when bodyLang matches the page lang', async () => {
    const doc = await render(EventDetail, {
      props: { ...baseProps, lang: 'en', bodyLang: 'en' },
      slots: { default: 'Body.' },
    });
    expect(doc).not.toContain('Details available in');
  });

  it('links back to the events list', async () => {
    const doc = await render(EventDetail, {
      props: { ...baseProps, bodyLang: 'en' },
      slots: { default: 'Body.' },
    });
    expect(doc).toMatch(/<a href="\/en\/events\/">/);
  });
});
