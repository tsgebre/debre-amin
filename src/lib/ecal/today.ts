import type { EcalLang, EthiopianDate, GregorianDate } from './types';
import { toEthiopian } from './core';
import { formatEthiopian, formatGregorian } from './format';

// "Today" is the civil (midnight-to-midnight) day in the given IANA time
// zone. The traditional Ethiopian reckoning, in which the date turns at
// dawn rather than midnight, is intentionally out of scope.
function civilDateIn(timeZone: string, now: Date): GregorianDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const num = (type: 'year' | 'month' | 'day'): number =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: num('year'), month: num('month'), day: num('day') };
}

export function ethiopianTodayIn(
  timeZone = 'America/New_York',
  now: Date = new Date(),
): EthiopianDate {
  return toEthiopian(civilDateIn(timeZone, now));
}

export interface TodayView {
  /** Civil Gregorian date in the time zone, as YYYY-MM-DD (for `<time datetime>`). */
  isoDate: string;
  ethiopian: string;
  gregorian: string;
}

/** Today's date in both calendars, formatted for `lang`. Throws on an invalid time zone. */
export function todayView(now: Date, timeZone: string, lang: EcalLang): TodayView {
  const g = civilDateIn(timeZone, now);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return {
    isoDate: `${pad(g.year, 4)}-${pad(g.month)}-${pad(g.day)}`,
    ethiopian: formatEthiopian(toEthiopian(g), lang),
    gregorian: formatGregorian(g, lang),
  };
}
