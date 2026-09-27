import { describe, expect, it } from 'vitest';
import {
  FASIKA_TABLE,
  FIXED_FEASTS,
  MOVABLE_DEFS,
  currentObservances,
  feastsForYear,
  nextFeast,
  resolveMovableFeasts,
} from '../../src/lib/feasts';
import type { FeastOccurrence } from '../../src/lib/feasts';

type Ymd = [number, number, number];
const DAY = 86_400_000;
const utc = ([y, m, d]: Ymd) => Date.UTC(y, m - 1, d);
const ymd = (g: { year: number; month: number; day: number }): Ymd => [g.year, g.month, g.day];
const addDays = (base: Ymd, n: number): Ymd => {
  const t = new Date(utc(base) + n * DAY);
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
};
const weekday = (d: Ymd) => new Date(utc(d)).getUTCDay(); // 0 = Sunday

// ─── Independent oracle: Meeus' Julian computus ──────────────────────────
// Gives Julian-calendar Easter; +13 days converts to Gregorian, valid for
// 1900-03-01..2100-02-28 (the whole table is inside that window).
function orthodoxEasterGregorian(year: number): Ymd {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return addDays([year, month, day], 13);
}

const TABLE_YEARS = Object.keys(FASIKA_TABLE).map(Number);

describe('FASIKA_TABLE', () => {
  it('covers exactly EC 2016–2030', () => {
    expect(TABLE_YEARS).toEqual(Array.from({ length: 15 }, (_, i) => 2016 + i));
  });

  it('sanity-checks the oracle on a documented year (2024 → Julian Apr 22 → May 5)', () => {
    expect(orthodoxEasterGregorian(2024)).toEqual([2024, 5, 5]);
  });

  it.each(TABLE_YEARS)('EC %i: matches the Julian computus, falls in Gregorian year y + 8, on a Sunday', (ey) => {
    const g = ymd(FASIKA_TABLE[ey]);
    expect(g[0]).toBe(ey + 8);
    expect(g).toEqual(orthodoxEasterGregorian(ey + 8));
    expect(weekday(g)).toBe(0);
  });

  // Dated news on the day (docs/research/feasts.md#fasika): ENA May 5, 2024;
  // Washington Times Apr 20, 2025; ENA Apr 12, 2026.
  const OBSERVED_FASIKA: Record<number, Ymd> = {
    2016: [2024, 5, 5],
    2017: [2025, 4, 20],
    2018: [2026, 4, 12],
  };

  it.each(Object.entries(OBSERVED_FASIKA))('EC %s: matches the dated observed Fasika', (ey, obs) => {
    expect(ymd(FASIKA_TABLE[Number(ey)])).toEqual(obs);
  });
});

// Expected offsets restated here from docs/research/feasts.md, independently of MOVABLE_DEFS.
const OFFSETS: Record<string, { start: number; end?: number; weekday?: number }> = {
  'tsome-nenewe': { start: -69, end: -67, weekday: 1 },
  'abiy-tsom': { start: -55, end: -1, weekday: 1 },
  hosanna: { start: -7, weekday: 0 },
  siklet: { start: -2, weekday: 5 },
  fasika: { start: 0, weekday: 0 },
  erget: { start: 39, weekday: 4 },
  peraklitos: { start: 49, weekday: 0 },
  'tsome-hawariat': { start: 50, weekday: 1 },
};

describe.each(TABLE_YEARS)('resolveMovableFeasts(%i)', (ey) => {
  const occ = resolveMovableFeasts(ey);
  const byId = new Map(occ.map((o) => [o.id, o]));
  const fasika = ymd(FASIKA_TABLE[ey]);

  it('resolves every movable observance once, all inside Ethiopian year ey', () => {
    expect(occ.map((o) => o.id).sort()).toEqual(Object.keys(OFFSETS).sort());
    for (const o of occ) {
      expect(o.start.e.year, o.id).toBe(ey);
      expect((o.end ?? o.start).e.year, o.id).toBe(ey);
    }
  });

  it.each(Object.keys(OFFSETS))('%s: day-counted start/end and weekday', (id) => {
    const o = byId.get(id)!;
    const exp = OFFSETS[id];
    expect(ymd(o.start.g)).toEqual(addDays(fasika, exp.start));
    if (exp.end !== undefined) expect(ymd(o.end!.g)).toEqual(addDays(fasika, exp.end));
    if (exp.weekday !== undefined) expect(weekday(ymd(o.start.g))).toBe(exp.weekday);
  });

  it('Abiy Tsom lasts 55 days, from a Monday to Holy Saturday', () => {
    const o = byId.get('abiy-tsom')!;
    expect((utc(ymd(o.end!.g)) - utc(ymd(o.start.g))) / DAY + 1).toBe(55);
    expect(weekday(ymd(o.end!.g))).toBe(6);
  });

  it('Tsome Nenewe is Monday–Wednesday, two weeks before Abiy Tsom', () => {
    const n = byId.get('tsome-nenewe')!;
    expect(weekday(ymd(n.end!.g))).toBe(3);
    expect((utc(ymd(byId.get('abiy-tsom')!.start.g)) - utc(ymd(n.start.g))) / DAY).toBe(14);
  });

  it('Tsome Hawariat starts the day after Peraklitos and ends Hamle 4 (July 11)', () => {
    const h = byId.get('tsome-hawariat')!;
    const p = byId.get('peraklitos')!;
    expect(utc(ymd(h.start.g)) - utc(ymd(p.start.g))).toBe(DAY);
    expect(h.end!.e).toEqual({ year: ey, month: 11, day: 4 });
    expect(ymd(h.end!.g)).toEqual([ey + 8, 7, 11]);
    expect(utc(ymd(h.start.g))).toBeLessThanOrEqual(utc(ymd(h.end!.g)));
  });
});

describe('dated parish-calendar observances (Debreselam Medhanealem, EC 2016 and 2017)', () => {
  // docs/research/feasts.md: printed Gregorian dates for each observance.
  // Peraklitos 2017 is omitted: that calendar's Gregorian date is a typo.
  const PARISH: Record<number, Record<string, Ymd>> = {
    2016: {
      'tsome-nenewe': [2024, 2, 26],
      'abiy-tsom': [2024, 3, 11],
      hosanna: [2024, 4, 28],
      siklet: [2024, 5, 3],
      erget: [2024, 6, 13],
      peraklitos: [2024, 6, 23],
      'tsome-hawariat': [2024, 6, 24],
    },
    2017: {
      'abiy-tsom': [2025, 2, 24],
      hosanna: [2025, 4, 13],
      siklet: [2025, 4, 18],
      erget: [2025, 5, 29],
      'tsome-hawariat': [2025, 6, 9],
    },
  };

  for (const [ey, rows] of Object.entries(PARISH)) {
    it.each(Object.entries(rows))(`EC ${ey}: %s starts on the printed date`, (id, date) => {
      const o = resolveMovableFeasts(Number(ey)).find((x) => x.id === id)!;
      expect(ymd(o.start.g)).toEqual(date);
    });
  }
});

describe('confidence', () => {
  it('is copied onto every occurrence; only the two fasts with disputed ends are medium', () => {
    const { occurrences } = feastsForYear(2018);
    const medium = occurrences.filter((o) => o.confidence === 'medium').map((o) => o.id).sort();
    expect(medium).toEqual(['tsome-hawariat', 'tsome-nebiyat']);
    for (const o of occurrences) expect(['high', 'medium']).toContain(o.confidence);
  });
});

describe('Demera (Meskerem 16)', () => {
  // Day-counted from sourced Enkutatash dates (+15), and matching the dated
  // Demera reports: ENA Sep 27, 2023; ENA Sep 26, 2024; Borkena Sep 26, 2025.
  it.each([
    [2016, [2023, 9, 12], [2023, 9, 27]],
    [2017, [2024, 9, 11], [2024, 9, 26]],
    [2018, [2025, 9, 11], [2025, 9, 26]],
  ] as [number, Ymd, Ymd][])('EC %i', (ey, enkutatash, observed) => {
    const d = feastsForYear(ey).occurrences.find((o) => o.id === 'demera')!;
    expect(d.start.e).toEqual({ year: ey, month: 1, day: 16 });
    expect(ymd(d.start.g)).toEqual(addDays(enkutatash, 15));
    expect(ymd(d.start.g)).toEqual(observed);
  });
});

describe('feastsForYear', () => {
  it('merges fixed and movable occurrences, sorted by start', () => {
    const { occurrences, movableAvailable } = feastsForYear(2018);
    expect(movableAvailable).toBe(true);
    expect(occurrences).toHaveLength(FIXED_FEASTS.length + MOVABLE_DEFS.length);
    const starts = occurrences.map((o) => utc(ymd(o.start.g)));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(occurrences.map((o) => o.id).indexOf('timket')).toBeLessThan(
      occurrences.map((o) => o.id).indexOf('tsome-nenewe'),
    );
  });

  it.each([2031, 2015])('EC %i (outside the table): movableAvailable false, fixed feasts still returned', (ey) => {
    const { occurrences, movableAvailable } = feastsForYear(ey);
    expect(movableAvailable).toBe(false);
    expect(occurrences.map((o) => o.id).sort()).toEqual(FIXED_FEASTS.map((d) => d.id).sort());
    expect(resolveMovableFeasts(ey)).toEqual([]);
  });
});

describe('nextFeast', () => {
  const next = (g: Ymd, kinds?: FeastOccurrence['kind'][]) =>
    nextFeast({ year: g[0], month: g[1], day: g[2] }, kinds ? { kinds } : undefined);

  it('is inclusive: from Meskel day (2026-09-27) it returns Meskel', () => {
    const n = next([2026, 9, 27])!;
    expect(n.id).toBe('meskel');
    expect(ymd(n.start.g)).toEqual([2026, 9, 27]);
  });

  it('from 2026-09-28 it returns the saint’s birth feast (Tahsas 24, 2019 = 2027-01-02), before Genna', () => {
    // Enkutatash 2019 = 2026-09-11 (sourced); Tahsas 24 is 3×30 + 23 = 113 days later.
    // Nothing of kind 'feast' falls between (Tsome Nebiyat is a fast); Genna is 2027-01-07.
    const n = next([2026, 9, 28])!;
    expect(n.id).toBe('teklehaymanot-birth');
    expect(ymd(n.start.g)).toEqual(addDays([2026, 9, 11], 113));
    expect(ymd(n.start.g)).toEqual([2027, 1, 2]);
  });

  it('crosses from Nehase into the next Ethiopian year', () => {
    // Nehase 25, 2018 = 2026-08-31: nothing is left in EC 2018 → Enkutatash 2019.
    const n = next([2026, 8, 31])!;
    expect(n.id).toBe('enkutatash');
    expect(n.start.e).toEqual({ year: 2019, month: 1, day: 1 });
  });

  it('finds movable feasts: from 2026-04-11 the next feast is Fasika 2026-04-12', () => {
    expect(ymd(next([2026, 4, 11])!.start.g)).toEqual([2026, 4, 12]);
    expect(next([2026, 4, 11])!.id).toBe('fasika');
  });

  it('honours kinds: next fast and next commemoration', () => {
    expect(next([2026, 9, 28], ['fast'])!.id).toBe('tsome-nebiyat');
    const c = next([2026, 8, 31], ['commemoration'])!;
    expect(c.start.e).toEqual({ year: 2019, month: 1, day: 24 });
  });

  it('returns null when nothing is found within the supported years', () => {
    // EC 2092's last feast is Nehase 24; EC 2093 is outside the feast range.
    expect(next([2100, 9, 1])).toBeNull();
  });
});

describe('currentObservances', () => {
  const ids = (g: Ymd) => currentObservances({ year: g[0], month: g[1], day: g[2] }).map((o) => o.id);

  it('inside Abiy Tsom 2018 (Fasika 2026-04-12) returns Abiy Tsom', () => {
    expect(ids([2026, 3, 15])).toEqual(['abiy-tsom']);
  });

  it('includes both ends of a fast and nothing after it', () => {
    expect(ids(addDays([2026, 4, 12], -55))).toEqual(['abiy-tsom']);
    expect(ids([2026, 4, 11])).toEqual(['abiy-tsom']);
    expect(ids([2026, 4, 12])).toEqual([]);
  });

  it('returns fixed fasts too (Tsome Filseta, 2026-08-10) and [] on an ordinary day', () => {
    expect(ids([2026, 8, 10])).toEqual(['tsome-filseta']);
    expect(ids([2026, 10, 1])).toEqual([]);
  });
});
