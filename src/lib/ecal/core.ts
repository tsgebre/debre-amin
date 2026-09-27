import type { EthiopianDate, GregorianDate } from './types';

// Ethiopian ↔ Gregorian conversion through Julian Day Numbers (JDN), in
// pure integer arithmetic on the proleptic Gregorian calendar.
//
// Supported range: Gregorian 1900-01-01 to 2100-12-31, inclusive. The
// arithmetic is exact far beyond that window, but only this window is
// verified by the reference table and the exhaustive day-by-day oracle in
// tests/ecal/, so toEthiopian/toGregorian reject dates outside it. The
// low-level *Jdn functions are unbounded.

/** Meskerem 1, 1 EC in the Amete Mihret era. */
const ETHIOPIAN_EPOCH_JDN = 1724221;

/** True when the Ethiopian year has a 6-day Pagume. Safe for any integer. */
export function isEthiopianLeapYear(year: number): boolean {
  return ((year % 4) + 4) % 4 === 3;
}

/** Days in an Ethiopian month. `month` must already be within 1–13. */
export function ethiopianMonthLength(year: number, month: number): number {
  if (month === 13) return isEthiopianLeapYear(year) ? 6 : 5;
  return 30;
}

function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const GREGORIAN_MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function gregorianMonthLength(year: number, month: number): number {
  if (month === 2 && isGregorianLeapYear(year)) return 29;
  return GREGORIAN_MONTH_LENGTHS[month - 1];
}

export function isValidEthiopianDate(d: EthiopianDate): boolean {
  if (!Number.isInteger(d.year) || !Number.isInteger(d.month) || !Number.isInteger(d.day)) {
    return false;
  }
  if (d.year < 1) return false;
  if (d.month < 1 || d.month > 13) return false;
  return d.day >= 1 && d.day <= ethiopianMonthLength(d.year, d.month);
}

export function isValidGregorianDate(d: GregorianDate): boolean {
  if (!Number.isInteger(d.year) || !Number.isInteger(d.month) || !Number.isInteger(d.day)) {
    return false;
  }
  if (d.year < 1) return false;
  if (d.month < 1 || d.month > 12) return false;
  return d.day >= 1 && d.day <= gregorianMonthLength(d.year, d.month);
}

// Standard form: jdn = 1723856 + 365 + 365*(y-1) + floor(y/4) + 30*m + d - 31,
// rewritten around the Meskerem 1, 1 EC epoch. floor(y/4) counts the leap
// years (y ≡ 3 mod 4) among years 1..y-1.
export function ethiopianToJdn(d: EthiopianDate): number {
  return (
    ETHIOPIAN_EPOCH_JDN +
    365 * (d.year - 1) +
    Math.floor(d.year / 4) +
    30 * (d.month - 1) +
    (d.day - 1)
  );
}

// Inverse: split the days since the epoch into 1461-day cycles. Within a
// cycle, years 4k+1..4k+4 have lengths 365, 365, 366, 365 (year 4k+3 is the
// leap year), giving start offsets 0, 365, 730, 1096. Month/day then fall
// out of the uniform 30-day months: Pagume days are dayOfYear 360..365.
const CYCLE_YEAR_OFFSETS = [0, 365, 730, 1096] as const;

export function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = jdn - ETHIOPIAN_EPOCH_JDN;
  const cycle = Math.floor(r / 1461);
  const rem = r - cycle * 1461; // 0..1460 even for negative r
  let index: number;
  if (rem < 365) index = 0;
  else if (rem < 730) index = 1;
  else if (rem < 1096) index = 2;
  else index = 3;
  const dayOfYear = rem - CYCLE_YEAR_OFFSETS[index]; // 0-based
  return {
    year: 4 * cycle + index + 1,
    month: Math.floor(dayOfYear / 30) + 1,
    day: (dayOfYear % 30) + 1,
  };
}

// Fliegel–Van Flandern in floor-division form (proleptic Gregorian).
export function gregorianToJdn(d: GregorianDate): number {
  const a = Math.floor((14 - d.month) / 12);
  const y = d.year + 4800 - a;
  const m = d.month + 12 * a - 3;
  return (
    d.day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// Richards' inverse of the above.
export function jdnToGregorian(jdn: number): GregorianDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    year: 100 * b + d - 4800 + Math.floor(m / 10),
    month: m + 3 - 12 * Math.floor(m / 10),
    day: e - Math.floor((153 * m + 2) / 5) + 1,
  };
}

/** JDN of Gregorian 1900-01-01, the start of the supported range. */
export const SUPPORTED_MIN_JDN = gregorianToJdn({ year: 1900, month: 1, day: 1 });
/** JDN of Gregorian 2100-12-31, the end of the supported range. */
export const SUPPORTED_MAX_JDN = gregorianToJdn({ year: 2100, month: 12, day: 31 });

function assertInSupportedRange(jdn: number, label: string): void {
  if (jdn < SUPPORTED_MIN_JDN || jdn > SUPPORTED_MAX_JDN) {
    throw new RangeError(
      `${label} is outside the supported range (Gregorian 1900-01-01 to 2100-12-31)`,
    );
  }
}

export function toEthiopian(g: GregorianDate): EthiopianDate {
  if (!isValidGregorianDate(g)) {
    throw new RangeError(
      `Invalid Gregorian date ${g.year}-${g.month}-${g.day}: ` +
        'year (>= 1), month (1-12) and day must be integers, and the day must exist in that month.',
    );
  }
  const jdn = gregorianToJdn(g);
  assertInSupportedRange(jdn, `Gregorian ${g.year}-${g.month}-${g.day}`);
  return jdnToEthiopian(jdn);
}

export function toGregorian(e: EthiopianDate): GregorianDate {
  if (!isValidEthiopianDate(e)) {
    throw new RangeError(
      `Invalid Ethiopian date ${e.year}-${e.month}-${e.day}: ` +
        'year (>= 1), month (1-13) and day must be integers, and the day must exist in that month ' +
        '(Pagume, month 13, has 5 days, or 6 when year % 4 === 3).',
    );
  }
  const jdn = ethiopianToJdn(e);
  assertInSupportedRange(jdn, `Ethiopian ${e.year}-${e.month}-${e.day}`);
  return jdnToGregorian(jdn);
}
