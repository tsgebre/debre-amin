// Pure helpers for the events/announcements collection — no `astro:content`
// import, so this module (and its tests) never need the content layer.
import { localizedPath } from '../i18n/paths';
import type { Locale } from '../i18n/index';
import type { GregorianDate } from './ecal';

export interface BilingualText {
  en: string;
  am: string;
}

export interface EventData {
  type: 'event' | 'announcement';
  title: BilingualText;
  summary: BilingualText;
  /** Plain YYYY-MM-DD string. */
  date: string;
  /** Plain YYYY-MM-DD string, >= date. */
  endDate?: string;
  time?: string;
  location?: BilingualText;
  bodyLang: Locale;
  draft: boolean;
}

export interface EventItem {
  slug: string;
  data: EventData;
}

export interface AnnouncementItem {
  title: string;
  date: GregorianDate;
  href: string;
}

/** Newest first by `date`; ties break by slug, ascending. */
export function sortNewestFirst<T extends EventItem>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.data.date !== b.data.date) return a.data.date < b.data.date ? 1 : -1;
    return a.slug.localeCompare(b.slug);
  });
}

/** Drops items marked `draft: true`. */
export function publishable<T extends EventItem>(items: readonly T[]): T[] {
  return items.filter((item) => !item.data.draft);
}

export function parseDateString(s: string): GregorianDate {
  const [year, month, day] = s.split('-').map(Number);
  return { year, month, day };
}

/** Maps events to Home's `{ title, date, href }` announcement shape. */
export function toAnnouncementItems(
  items: readonly EventItem[],
  lang: Locale,
  base: string,
): AnnouncementItem[] {
  return items.map((item) => ({
    title: item.data.title[lang],
    date: parseDateString(item.data.date),
    href: localizedPath(lang, `events/${item.slug}`, base),
  }));
}
