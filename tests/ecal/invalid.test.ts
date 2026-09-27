import { describe, expect, it } from 'vitest';
import {
  isValidEthiopianDate,
  isValidGregorianDate,
  toEthiopian,
  toGregorian,
} from '../../src/lib/ecal';
import type { EthiopianDate, GregorianDate } from '../../src/lib/ecal';

describe('toGregorian rejects invalid Ethiopian dates with RangeError', () => {
  const cases: [string, EthiopianDate][] = [
    ['Pagume 6 in a non-leap year (2016 EC)', { year: 2016, month: 13, day: 6 }],
    ['Pagume 7 even in a leap year (2015 EC)', { year: 2015, month: 13, day: 7 }],
    ['month 14', { year: 2016, month: 14, day: 1 }],
    ['month 0', { year: 2016, month: 0, day: 1 }],
    ['day 31 in a 30-day month', { year: 2016, month: 1, day: 31 }],
    ['day 0', { year: 2016, month: 1, day: 0 }],
    ['non-integer day', { year: 2016, month: 1, day: 1.5 }],
    ['non-integer year', { year: 2016.2, month: 1, day: 1 }],
    ['year 0', { year: 0, month: 1, day: 1 }],
  ];

  it.each(cases)('%s', (_name, d) => {
    expect(isValidEthiopianDate(d)).toBe(false);
    expect(() => toGregorian(d)).toThrow(RangeError);
  });

  it('accepts Pagume 6 in a leap year (2015 EC)', () => {
    expect(isValidEthiopianDate({ year: 2015, month: 13, day: 6 })).toBe(true);
    expect(() => toGregorian({ year: 2015, month: 13, day: 6 })).not.toThrow();
  });

  it('the message explains the Pagume rule', () => {
    expect(() => toGregorian({ year: 2016, month: 13, day: 6 })).toThrow(/Pagume, month 13, has 5 days, or 6/);
  });
});

describe('toEthiopian rejects invalid Gregorian dates with RangeError', () => {
  const cases: [string, GregorianDate][] = [
    ['Feb 29 in a non-leap year (2023)', { year: 2023, month: 2, day: 29 }],
    ['Feb 29, 1900 (century year, not a leap year)', { year: 1900, month: 2, day: 29 }],
    ['Feb 30 even in a leap year (2024)', { year: 2024, month: 2, day: 30 }],
    ['Apr 31', { year: 2024, month: 4, day: 31 }],
    ['month 13', { year: 2024, month: 13, day: 1 }],
    ['month 0', { year: 2024, month: 0, day: 1 }],
    ['day 0', { year: 2024, month: 1, day: 0 }],
    ['day 32', { year: 2024, month: 1, day: 32 }],
    ['non-integer day', { year: 2024, month: 1, day: 1.5 }],
    ['non-integer month', { year: 2024, month: 1.5, day: 1 }],
    ['year 0', { year: 0, month: 1, day: 1 }],
  ];

  it.each(cases)('%s', (_name, d) => {
    expect(isValidGregorianDate(d)).toBe(false);
    expect(() => toEthiopian(d)).toThrow(RangeError);
  });

  it('accepts Feb 29, 2000 (divisible by 400) and Feb 29, 2024', () => {
    expect(() => toEthiopian({ year: 2000, month: 2, day: 29 })).not.toThrow();
    expect(() => toEthiopian({ year: 2024, month: 2, day: 29 })).not.toThrow();
  });

  it('the message names the offending date', () => {
    expect(() => toEthiopian({ year: 2023, month: 2, day: 29 })).toThrow(/Invalid Gregorian date 2023-2-29/);
  });
});

describe('supported range (Gregorian 1900-01-01 to 2100-12-31)', () => {
  it('accepts both boundaries in both calendars', () => {
    expect(() => toEthiopian({ year: 1900, month: 1, day: 1 })).not.toThrow();
    expect(() => toEthiopian({ year: 2100, month: 12, day: 31 })).not.toThrow();
    // Ethiopian equivalents of the two boundary days.
    expect(() => toGregorian({ year: 1892, month: 4, day: 23 })).not.toThrow();
    expect(() => toGregorian({ year: 2093, month: 4, day: 21 })).not.toThrow();
  });

  it('rejects one day outside on either side, in both calendars', () => {
    expect(() => toEthiopian({ year: 1899, month: 12, day: 31 })).toThrow(RangeError);
    expect(() => toEthiopian({ year: 2101, month: 1, day: 1 })).toThrow(RangeError);
    expect(() => toGregorian({ year: 1892, month: 4, day: 22 })).toThrow(RangeError); // = 1899-12-31
    expect(() => toGregorian({ year: 2093, month: 4, day: 22 })).toThrow(RangeError); // = 2101-01-01
    expect(() => toEthiopian({ year: 1899, month: 12, day: 31 })).toThrow(/outside the supported range/);
  });
});
