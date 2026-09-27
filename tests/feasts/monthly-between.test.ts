import { describe, expect, it } from 'vitest';
import { monthlyCommemorations, occurrencesBetween } from '../../src/lib/feasts';

describe('monthlyCommemorations', () => {
  it.each([2016, 2017, 2018, 2019, 2020])('EC %i: 12 on the 24th of months 1–12, 2 marked annual', (ey) => {
    const m = monthlyCommemorations(ey);
    expect(m).toHaveLength(12);
    expect(m.map((o) => o.start.e.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const o of m) {
      expect(o.start.e.day).toBe(24);
      expect(o.start.e.year).toBe(ey);
      expect(o.kind).toBe('commemoration');
    }
    expect(m.some((o) => o.start.e.month === 13)).toBe(false);
    expect(m.filter((o) => o.annual).map((o) => o.start.e.month)).toEqual([4, 12]);
  });

  it('rejects an out-of-range year', () => {
    expect(() => monthlyCommemorations(2093)).toThrow(RangeError);
  });
});

describe('occurrencesBetween', () => {
  // Aug 1 – Oct 31, 2026 spans the EC 2018 → 2019 year boundary (Sep 11, 2026).
  const occ = occurrencesBetween({ year: 2026, month: 8, day: 1 }, { year: 2026, month: 10, day: 31 });
  const find = (id: string) => occ.find((o) => o.id === id);

  it('crosses the Ethiopian year boundary', () => {
    expect(find('teklehaymanot-repose')?.start.e).toEqual({ year: 2018, month: 12, day: 24 });
    expect(find('enkutatash')?.start.e).toEqual({ year: 2019, month: 1, day: 1 });
    expect(find('meskel')?.start.e).toEqual({ year: 2019, month: 1, day: 17 });
  });

  it('lands on the sourced Gregorian dates', () => {
    expect(find('enkutatash')?.start.g).toEqual({ year: 2026, month: 9, day: 11 });
    expect(find('meskel')?.start.g).toEqual({ year: 2026, month: 9, day: 27 });
  });

  it('returns exactly the overlapping entries, sorted', () => {
    expect(occ.map((o) => o.id)).toEqual([
      'tsome-filseta', // Nehase 1–15, 2018 = Aug 7–21, 2026
      'filseta',
      'teklehaymanot-repose',
      'enkutatash',
      'demera',
      'meskel',
    ]);
  });

  it('includes a fast that only partly overlaps the window', () => {
    const o = occurrencesBetween({ year: 2026, month: 8, day: 20 }, { year: 2026, month: 8, day: 20 });
    expect(o.map((x) => x.id)).toEqual(['tsome-filseta']);
  });

  it('includes both ends of the window', () => {
    const d = { year: 2026, month: 9, day: 11 };
    expect(occurrencesBetween(d, d).map((x) => x.id)).toEqual(['enkutatash']);
  });

  it('rejects a reversed window and dates outside the supported range', () => {
    expect(() =>
      occurrencesBetween({ year: 2026, month: 10, day: 1 }, { year: 2026, month: 9, day: 1 }),
    ).toThrow(RangeError);
    expect(() =>
      occurrencesBetween({ year: 1899, month: 12, day: 31 }, { year: 1900, month: 1, day: 5 }),
    ).toThrow(RangeError);
    expect(() =>
      occurrencesBetween({ year: 2100, month: 12, day: 1 }, { year: 2101, month: 1, day: 1 }),
    ).toThrow(RangeError);
  });
});
