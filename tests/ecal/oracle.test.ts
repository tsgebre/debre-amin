import { describe, expect, it } from 'vitest';
import {
  ethiopianMonthLength,
  ethiopianToJdn,
  toEthiopian,
  toGregorian,
} from '../../src/lib/ecal';
import type { EthiopianDate, GregorianDate } from '../../src/lib/ecal';

// ─── Independent naive oracle ────────────────────────────────────────────
// This oracle never calls the module under test. It knows only the two
// calendars' month-length rules and walks one day at a time from a single
// anchor row of the reference table. Every expected value below is derived
// by day counting, not by the module's arithmetic.

/** Reference row: Jan 1, 2000 = Tahsas 22, 1992 EC. */
const ANCHOR_G: GregorianDate = { year: 2000, month: 1, day: 1 };
const ANCHOR_E: EthiopianDate = { year: 1992, month: 4, day: 22 };

function oracleEthLeap(y: number): boolean {
  return y % 4 === 3;
}
function oracleEthMonthLen(y: number, m: number): number {
  return m === 13 ? (oracleEthLeap(y) ? 6 : 5) : 30;
}
function oracleGregLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
const ORACLE_GREG_MONTH_LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function oracleGregMonthLen(y: number, m: number): number {
  return m === 2 && oracleGregLeap(y) ? 29 : ORACLE_GREG_MONTH_LEN[m - 1];
}

function nextEth(d: EthiopianDate): EthiopianDate {
  if (d.day < oracleEthMonthLen(d.year, d.month)) return { ...d, day: d.day + 1 };
  if (d.month < 13) return { year: d.year, month: d.month + 1, day: 1 };
  return { year: d.year + 1, month: 1, day: 1 };
}
function prevEth(d: EthiopianDate): EthiopianDate {
  if (d.day > 1) return { ...d, day: d.day - 1 };
  if (d.month > 1) return { year: d.year, month: d.month - 1, day: oracleEthMonthLen(d.year, d.month - 1) };
  return { year: d.year - 1, month: 13, day: oracleEthMonthLen(d.year - 1, 13) };
}
function nextGreg(d: GregorianDate): GregorianDate {
  if (d.day < oracleGregMonthLen(d.year, d.month)) return { ...d, day: d.day + 1 };
  if (d.month < 12) return { year: d.year, month: d.month + 1, day: 1 };
  return { year: d.year + 1, month: 1, day: 1 };
}
function prevGreg(d: GregorianDate): GregorianDate {
  if (d.day > 1) return { ...d, day: d.day - 1 };
  if (d.month > 1) return { year: d.year, month: d.month - 1, day: oracleGregMonthLen(d.year, d.month - 1) };
  return { year: d.year - 1, month: 12, day: 31 };
}

function same(a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}
function fmt(d: { year: number; month: number; day: number }): string {
  return `${d.year}-${d.month}-${d.day}`;
}

/** Oracle-only backward walk from the anchor to Gregorian 1900-01-01. */
function oracleSweepStart(): { g: GregorianDate; e: EthiopianDate } {
  let g = { ...ANCHOR_G };
  let e = { ...ANCHOR_E };
  while (!(g.year === 1900 && g.month === 1 && g.day === 1)) {
    g = prevGreg(g);
    e = prevEth(e);
  }
  return { g, e };
}

describe('exhaustive oracle sweep, 1900-01-01 → 2100-12-31', () => {
  const start = oracleSweepStart();

  it('the oracle-derived Ethiopian date for 1900-01-01 matches its reference row', () => {
    // Two independent paths agree: reference row (sources) vs day counting
    // backward from the Jan 1, 2000 anchor.
    expect(start.e).toEqual({ year: 1892, month: 4, day: 23 });
  });

  it('module agrees with the oracle on every day (plus round trips and JDN continuity)', () => {
    let g = { ...start.g };
    let e = { ...start.e };
    const failures: string[] = [];
    let days = 0;
    let prevJdn = ethiopianToJdn(toEthiopian(start.g)) - 1;
    for (;;) {
      const me = toEthiopian(g);
      const mg = toGregorian(e);
      if (!same(me, e)) failures.push(`toEthiopian(${fmt(g)}) = ${fmt(me)}, oracle says ${fmt(e)}`);
      if (!same(mg, g)) failures.push(`toGregorian(${fmt(e)}) = ${fmt(mg)}, oracle says ${fmt(g)}`);
      if (!same(toGregorian(me), g)) failures.push(`round trip G→E→G broke at ${fmt(g)}`);
      if (!same(toEthiopian(mg), e)) failures.push(`round trip E→G→E broke at ${fmt(e)}`);
      const jdn = ethiopianToJdn(me);
      if (jdn !== prevJdn + 1) failures.push(`JDN not consecutive at ${fmt(g)}: ${jdn} after ${prevJdn}`);
      prevJdn = jdn;
      days++;
      if (failures.length > 5) break;
      if (g.year === 2100 && g.month === 12 && g.day === 31) break;
      g = nextGreg(g);
      e = nextEth(e);
    }
    expect(failures).toEqual([]);
    expect(days).toBe(73414); // every day of 1900-01-01..2100-12-31 inclusive
  });

  it('Pagume has 6 days iff year % 4 === 3, for every year in range', () => {
    for (let y = 1892; y <= 2093; y++) {
      expect(ethiopianMonthLength(y, 13)).toBe(y % 4 === 3 ? 6 : 5);
    }
  });

  it('every Meskerem 1 in range falls on Gregorian Sep 11 or Sep 12', () => {
    for (let y = 1893; y <= 2093; y++) {
      const g = toGregorian({ year: y, month: 1, day: 1 });
      expect(g.month).toBe(9);
      expect([11, 12]).toContain(g.day);
    }
  });
});
