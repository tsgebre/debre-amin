import { describe, expect, it } from 'vitest';
import {
  ethiopianToJdn,
  gregorianToJdn,
  toEthiopian,
  toGregorian,
} from '../../src/lib/ecal';
import type { EthiopianDate, GregorianDate } from '../../src/lib/ecal';

// VERIFICATION STATUS: RESEARCHER-VERIFIED. Every row was confirmed
// against two independent source classes (published tables / dated news of
// record, and the published Beyene–Kudlek algorithm evaluated by hand);
// per-row sources, verification classes and caveats are recorded in
// docs/research/ecal-reference.md. Do not edit rows without re-verifying
// there.
//
// Genna warning: none of these rows uses "Ethiopian Christmas" as a
// reference — Genna's observed date follows a liturgical rule and is
// sometimes Tahsas 28, so it is useless as a conversion anchor.

interface ReferenceRow {
  note: string;
  g: GregorianDate;
  e: EthiopianDate;
}

function row(
  note: string,
  gy: number,
  gm: number,
  gd: number,
  ey: number,
  em: number,
  ed: number,
): ReferenceRow {
  return { note, g: { year: gy, month: gm, day: gd }, e: { year: ey, month: em, day: ed } };
}

const REFERENCE: ReferenceRow[] = [
  row('Enkutatash 2016 EC — Sep 12 (year after leap 2015 EC)', 2023, 9, 12, 2016, 1, 1),
  row('Enkutatash 2017 EC', 2024, 9, 11, 2017, 1, 1),
  row('Enkutatash 2018 EC', 2025, 9, 11, 2018, 1, 1),
  row('Enkutatash 2019 EC', 2026, 9, 11, 2019, 1, 1),
  row('Enkutatash 2020 EC — Sep 12 (year after leap 2019 EC)', 2027, 9, 12, 2020, 1, 1),
  row('Ethiopian Millennium — Meskerem 1, 2000 EC', 2007, 9, 12, 2000, 1, 1),
  row('Pagume 1, 2015 EC (leap year)', 2023, 9, 6, 2015, 13, 1),
  row('Pagume 6, 2015 EC (leap-year 6th epagomenal day)', 2023, 9, 11, 2015, 13, 6),
  row('Pagume 5, 2018 EC (last day of a non-leap year)', 2026, 9, 10, 2018, 13, 5),
  row('Jan 1, 2000 — Tahsas 22, 1992 EC (oracle anchor)', 2000, 1, 1, 1992, 4, 22),
  row('Gregorian leap day 2024', 2024, 2, 29, 2016, 6, 21),
  row('Day after the 2024 leap day', 2024, 3, 1, 2016, 6, 22),
  row('Gregorian leap day 2028', 2028, 2, 29, 2020, 6, 21),
  row('Jan 1, 1900 — pre-1950 (before Mar 1900 the alignment is one day earlier)', 1900, 1, 1, 1892, 4, 23),
  row('Patriots’ Victory Day — May 5, 1941 = Miyazia 27, 1933 EC', 1941, 5, 5, 1933, 8, 27),
  row('Jan 1, 2095 — post-2090', 2095, 1, 1, 2087, 4, 23),
  row('Enkutatash 2093 EC — Sep 12, 2100 (Gregorian 2100 skips its leap day)', 2100, 9, 12, 2093, 1, 1),
  row('Today-sanity row — Sep 27, 2026 = Meskerem 17, 2019 EC', 2026, 9, 27, 2019, 1, 17),
];

describe('reference table', () => {
  it('has at least 15 rows', () => {
    expect(REFERENCE.length).toBeGreaterThanOrEqual(15);
  });

  it.each(REFERENCE)('$note', ({ g, e }) => {
    expect(toEthiopian(g)).toEqual(e);
    expect(toGregorian(e)).toEqual(g);
    expect(gregorianToJdn(g)).toBe(ethiopianToJdn(e));
  });
});

describe('epoch and JDN anchors', () => {
  it('Meskerem 1, 1 EC (Amete Mihret epoch) is JDN 1724221', () => {
    expect(ethiopianToJdn({ year: 1, month: 1, day: 1 })).toBe(1724221);
  });

  it('Gregorian 2000-01-01 is JDN 2451545 (J2000 anchor)', () => {
    expect(gregorianToJdn({ year: 2000, month: 1, day: 1 })).toBe(2451545);
  });
});
