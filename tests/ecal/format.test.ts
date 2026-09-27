import { describe, expect, it } from 'vitest';
import {
  ECAL_AM_NEEDS_REVIEW,
  ETHIOPIAN_MONTHS_AM,
  ETHIOPIAN_MONTHS_EN,
  formatEthiopian,
  formatGregorian,
} from '../../src/lib/ecal';

const ETHIOPIC = /[ሀ-፿]/;

describe('month names', () => {
  it('has 13 names per language, and every Amharic name is Ethiopic script', () => {
    expect(ETHIOPIAN_MONTHS_EN).toHaveLength(13);
    expect(ETHIOPIAN_MONTHS_AM).toHaveLength(13);
    for (const name of ETHIOPIAN_MONTHS_AM) {
      expect(name, name).toMatch(ETHIOPIC);
      expect(name, name).not.toMatch(/[A-Za-z]/);
    }
  });

  it('flags uncertain Amharic strings for parish review', () => {
    expect(ECAL_AM_NEEDS_REVIEW.length).toBeGreaterThan(0);
  });
});

describe('formatEthiopian', () => {
  it('formats English as "<Month> <d>, <y> E.C."', () => {
    expect(formatEthiopian({ year: 2019, month: 1, day: 17 }, 'en')).toBe('Meskerem 17, 2019 E.C.');
  });

  it('formats Amharic as "<ወር> <ቀን> ቀን <ዓመት> ዓ.ም."', () => {
    expect(formatEthiopian({ year: 2019, month: 1, day: 17 }, 'am')).toBe('መስከረም 17 ቀን 2019 ዓ.ም.');
  });

  it('formats Pagume in both languages', () => {
    expect(formatEthiopian({ year: 2015, month: 13, day: 6 }, 'en')).toBe('Pagume 6, 2015 E.C.');
    expect(formatEthiopian({ year: 2015, month: 13, day: 6 }, 'am')).toBe('ጳጉሜን 6 ቀን 2015 ዓ.ም.');
  });

  it('formats a two-digit day', () => {
    expect(formatEthiopian({ year: 2016, month: 2, day: 30 }, 'en')).toBe('Tikimt 30, 2016 E.C.');
    expect(formatEthiopian({ year: 2016, month: 2, day: 30 }, 'am')).toBe('ጥቅምት 30 ቀን 2016 ዓ.ም.');
  });

  it('rejects an invalid date', () => {
    expect(() => formatEthiopian({ year: 2016, month: 13, day: 6 }, 'en')).toThrow(RangeError);
  });
});

describe('formatGregorian', () => {
  it('formats English via the en-US locale', () => {
    expect(formatGregorian({ year: 2026, month: 9, day: 27 }, 'en')).toBe('September 27, 2026');
  });

  it('formats Amharic via the am-ET locale, in genuine Ethiopic script', () => {
    const out = formatGregorian({ year: 2026, month: 9, day: 27 }, 'am');
    // Exact CLDR output observed on Node 20; the Ethiopic assertion also
    // guards against an ICU build that silently lacks Amharic data.
    expect(out).toBe('27 ሴፕቴምበር 2026');
    expect(out).toMatch(ETHIOPIC);
  });

  it('never shifts the day across time zones (UTC-pinned)', () => {
    // Jan 1 would render as Dec 31 if the formatter used a western zone.
    expect(formatGregorian({ year: 2026, month: 1, day: 1 }, 'en')).toBe('January 1, 2026');
    expect(formatGregorian({ year: 2026, month: 1, day: 1 }, 'am')).toBe('1 ጃንዋሪ 2026');
  });

  it('formats a leap day', () => {
    expect(formatGregorian({ year: 2024, month: 2, day: 29 }, 'en')).toBe('February 29, 2024');
  });

  it('rejects an invalid date', () => {
    expect(() => formatGregorian({ year: 2023, month: 2, day: 29 }, 'en')).toThrow(RangeError);
  });
});
