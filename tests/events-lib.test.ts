import { describe, expect, it } from 'vitest';
import { parseDateString, publishable, sortNewestFirst, toAnnouncementItems } from '../src/lib/events';
import type { EventItem } from '../src/lib/events';

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

describe('sortNewestFirst', () => {
  it('sorts by date descending', () => {
    const items = [item('a', '2026-01-01'), item('b', '2027-06-15'), item('c', '2026-12-31')];
    expect(sortNewestFirst(items).map((i) => i.slug)).toEqual(['b', 'c', 'a']);
  });

  it('breaks a date tie by slug, ascending', () => {
    const items = [item('zebra', '2027-01-01'), item('apple', '2027-01-01'), item('mango', '2027-01-01')];
    expect(sortNewestFirst(items).map((i) => i.slug)).toEqual(['apple', 'mango', 'zebra']);
  });

  it('does not mutate the input array', () => {
    const items = [item('a', '2026-01-01'), item('b', '2027-01-01')];
    const copy = [...items];
    sortNewestFirst(items);
    expect(items).toEqual(copy);
  });
});

describe('publishable', () => {
  it('filters out drafts', () => {
    const items = [
      item('published', '2027-01-01'),
      item('draft', '2027-02-01', { draft: true }),
    ];
    expect(publishable(items).map((i) => i.slug)).toEqual(['published']);
  });

  it('keeps everything when nothing is a draft', () => {
    const items = [item('a', '2027-01-01'), item('b', '2027-02-01')];
    expect(publishable(items)).toHaveLength(2);
  });
});

describe('toAnnouncementItems', () => {
  const items = [item('picnic', '2027-01-15')];

  it('builds hrefs under base "/"', () => {
    const result = toAnnouncementItems(items, 'en', '/');
    expect(result).toEqual([{ title: 'Title picnic', date: { year: 2027, month: 1, day: 15 }, href: '/en/events/picnic/' }]);
  });

  it('builds hrefs under base "/debre-amin/"', () => {
    const result = toAnnouncementItems(items, 'en', '/debre-amin/');
    expect(result[0].href).toBe('/debre-amin/en/events/picnic/');
  });

  it('picks the title for the given language', () => {
    const result = toAnnouncementItems(items, 'am', '/');
    expect(result[0].title).toBe('አርእስት picnic');
  });
});

describe('parseDateString', () => {
  it('splits YYYY-MM-DD into numeric parts', () => {
    expect(parseDateString('2027-01-15')).toEqual({ year: 2027, month: 1, day: 15 });
  });
});
