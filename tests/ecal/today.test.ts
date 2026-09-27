import { describe, expect, it } from 'vitest';
import { ethiopianTodayIn, isValidEthiopianDate } from '../../src/lib/ecal';

// The dated expectations below are RESEARCHER-verified: rows 4, 9 and 18
// of the reference table plus the EDT (UTC-4) offset rule — see
// docs/research/ecal-reference.md ("Time-zone facts").

describe('ethiopianTodayIn', () => {
  it('2026-09-27T12:00:00Z in America/New_York is Meskerem 17, 2019 EC', () => {
    const e = ethiopianTodayIn('America/New_York', new Date('2026-09-27T12:00:00Z'));
    expect(e).toEqual({ year: 2019, month: 1, day: 17 });
  });

  it('a UTC instant can still be the previous civil day in New York', () => {
    // 2026-09-11T03:30:00Z is 23:30 on Sep 10 in New York (EDT, UTC-4):
    // still Pagume 5, 2018 EC there, while the same instant in UTC is
    // already Sep 11 — Meskerem 1, 2019 EC (Enkutatash).
    const instant = new Date('2026-09-11T03:30:00Z');
    expect(ethiopianTodayIn('America/New_York', instant)).toEqual({ year: 2018, month: 13, day: 5 });
    expect(ethiopianTodayIn('UTC', instant)).toEqual({ year: 2019, month: 1, day: 1 });
  });

  it('defaults (America/New_York, current clock) produce a valid Ethiopian date', () => {
    expect(isValidEthiopianDate(ethiopianTodayIn())).toBe(true);
  });
});
