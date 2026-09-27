import type { EcalLang, EthiopianDate, GregorianDate } from './types';
import { isValidEthiopianDate, isValidGregorianDate } from './core';
import { ETHIOPIAN_MONTHS_AM, ETHIOPIAN_MONTHS_EN } from './names';

/** "Meskerem 17, 2019 E.C." (en) / "መስከረም 17 ቀን 2019 ዓ.ም." (am). */
export function formatEthiopian(e: EthiopianDate, lang: EcalLang): string {
  if (!isValidEthiopianDate(e)) {
    throw new RangeError(`Cannot format invalid Ethiopian date ${e.year}-${e.month}-${e.day}`);
  }
  return lang === 'am'
    ? `${ETHIOPIAN_MONTHS_AM[e.month - 1]} ${e.day} ቀን ${e.year} ዓ.ም.`
    : `${ETHIOPIAN_MONTHS_EN[e.month - 1]} ${e.day}, ${e.year} E.C.`;
}

// The Date is constructed in UTC and the formatter is pinned to UTC, so the
// rendered day never shifts with the machine's time zone; `calendar:
// 'gregory'` is pinned so the am locale cannot substitute another calendar.
// Node ships full ICU with CLDR Amharic data (ሴፕቴምበር, …); the format tests
// assert genuine Ethiopic output, so an ICU build without Amharic data
// fails the test suite loudly instead of silently rendering English.
export function formatGregorian(g: GregorianDate, lang: EcalLang): string {
  if (!isValidGregorianDate(g)) {
    throw new RangeError(`Cannot format invalid Gregorian date ${g.year}-${g.month}-${g.day}`);
  }
  const date = new Date(Date.UTC(g.year, g.month - 1, g.day));
  date.setUTCFullYear(g.year); // Date.UTC maps years 0-99 to 1900-1999
  return new Intl.DateTimeFormat(lang === 'am' ? 'am-ET' : 'en-US', {
    timeZone: 'UTC',
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
