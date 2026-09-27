import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FEAST_MAX_YEAR,
  FEAST_MIN_YEAR,
  FIXED_FEASTS,
  MONTHLY_COMMEMORATION,
  MOVABLE_DEFS,
  gennaDay,
  resolveFixedFeasts,
} from '../../src/lib/feasts';
import type { FeastOccurrence } from '../../src/lib/feasts';
import { toGregorian } from '../../src/lib/ecal';

// Expected values here never come from src/lib/ecal. Two independent sources:
//  1. OBSERVED: dated observances from docs/research/feasts.md
//     ("Dated observances used as test expectations").
//  2. COUNTED: each year's sourced Enkutatash date plus the day offset within
//     the Ethiopian year (30-day months), using plain Date.UTC arithmetic.

type Ymd = [number, number, number];

/** Enkutatash (Meskerem 1) per EC year: 2016–2018 observed, 2019–2020 ecal-reference rows 4–5. */
const ENKUTATASH: Record<number, Ymd> = {
  2016: [2023, 9, 12],
  2017: [2024, 9, 11],
  2018: [2025, 9, 11],
  2019: [2026, 9, 11],
  2020: [2027, 9, 12],
};

/** Dated observances (2016–2018) and RESEARCHER-computed dates (2019–2020). */
const OBSERVED: Record<string, Record<number, Ymd>> = {
  enkutatash: ENKUTATASH,
  meskel: {
    2016: [2023, 9, 28],
    2017: [2024, 9, 27],
    2018: [2025, 9, 27],
    2019: [2026, 9, 27],
    2020: [2027, 9, 28],
  },
  genna: {
    2016: [2024, 1, 7],
    2017: [2025, 1, 7],
    2018: [2026, 1, 7],
    2019: [2027, 1, 7],
    2020: [2028, 1, 7],
  },
  timket: {
    2016: [2024, 1, 20],
    2017: [2025, 1, 19],
    2018: [2026, 1, 19],
    2019: [2027, 1, 19],
    2020: [2028, 1, 20],
  },
};

/** Expected Ethiopian [month, day] of each entry's start (and end), per the documented rules. */
function expectedEthiopian(id: string, ey: number): { start: [number, number]; end?: [number, number] } {
  const johnYear = ey % 4 === 0;
  switch (id) {
    case 'enkutatash': return { start: [1, 1] };
    case 'demera': return { start: [1, 16] };
    case 'meskel': return { start: [1, 17] };
    case 'tsome-nebiyat': return { start: [3, 15], end: [4, johnYear ? 27 : 28] };
    case 'teklehaymanot-birth': return { start: [4, 24] };
    case 'genna': return { start: [4, johnYear ? 28 : 29] };
    case 'ketera': return { start: [5, 10] };
    case 'timket': return { start: [5, 11] };
    case 'tsome-filseta': return { start: [12, 1], end: [12, 15] };
    case 'filseta': return { start: [12, 16] };
    case 'teklehaymanot-repose': return { start: [12, 24] };
    default: throw new Error(`no expectation for ${id}`);
  }
}

function counted(ey: number, month: number, day: number): Ymd {
  const [y, m, d] = ENKUTATASH[ey];
  const t = new Date(Date.UTC(y, m - 1, d + 30 * (month - 1) + (day - 1)));
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
}

const ymd = (g: { year: number; month: number; day: number }): Ymd => [g.year, g.month, g.day];

const YEARS = [2016, 2017, 2018, 2019, 2020];

describe.each(YEARS)('resolveFixedFeasts(%i)', (ey) => {
  const occ = resolveFixedFeasts(ey);
  const byId = new Map(occ.map((o) => [o.id, o]));

  it('resolves every fixed feast and fast exactly once', () => {
    expect(occ.map((o) => o.id).sort()).toEqual(FIXED_FEASTS.map((d) => d.id).sort());
  });

  it.each(FIXED_FEASTS.map((d) => d.id))('%s has the documented Ethiopian date(s)', (id) => {
    const o = byId.get(id)!;
    const exp = expectedEthiopian(id, ey);
    expect([o.start.e.year, o.start.e.month, o.start.e.day]).toEqual([ey, ...exp.start]);
    if (exp.end) {
      expect(o.end && [o.end.e.year, o.end.e.month, o.end.e.day]).toEqual([ey, ...exp.end]);
    } else {
      expect(o.end).toBeUndefined();
    }
  });

  it.each(FIXED_FEASTS.map((d) => d.id))('%s has the day-counted Gregorian date(s)', (id) => {
    const o = byId.get(id)!;
    expect(ymd(o.start.g)).toEqual(counted(ey, o.start.e.month, o.start.e.day));
    if (o.end) expect(ymd(o.end.g)).toEqual(counted(ey, o.end.e.month, o.end.e.day));
  });

  it.each(Object.keys(OBSERVED))('%s falls on its dated observed/sourced Gregorian date', (id) => {
    expect(ymd(byId.get(id)!.start.g)).toEqual(OBSERVED[id][ey]);
  });

  it('is sorted by start date', () => {
    const starts = occ.map((o) => Date.UTC(o.start.g.year, o.start.g.month - 1, o.start.g.day));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(occ[0].id).toBe('enkutatash');
    expect(occ.map((o) => o.id)).toEqual([
      'enkutatash', 'demera', 'meskel', 'tsome-nebiyat', 'teklehaymanot-birth', 'genna',
      'ketera', 'timket', 'tsome-filseta', 'filseta', 'teklehaymanot-repose',
    ]);
  });
});

describe('Genna rule', () => {
  it('ዘመነ ዮሐንስ (EC % 4 === 0): Tahsas 28 — Genna 2016 = Jan 7, 2024 (observed)', () => {
    expect(gennaDay(2016)).toBe(28);
    const g = resolveFixedFeasts(2016).find((o) => o.id === 'genna')!;
    expect(g.start.e).toEqual({ year: 2016, month: 4, day: 28 });
    expect(ymd(g.start.g)).toEqual([2024, 1, 7]);
  });

  it('other years: Tahsas 29 — Genna 2017 and 2018 = Jan 7 (observed)', () => {
    for (const [ey, gy] of [[2017, 2025], [2018, 2026], [2019, 2027]]) {
      expect(gennaDay(ey)).toBe(29);
      const g = resolveFixedFeasts(ey).find((o) => o.id === 'genna')!;
      expect(g.start.e).toEqual({ year: ey, month: 4, day: 29 });
      expect(ymd(g.start.g)).toEqual([gy, 1, 7]);
    }
  });

  it('Tahsas 29 in ዘመነ ዮሐንስ would miss Jan 7 — the adjustment is what keeps it there', () => {
    expect(ymd(toGregorian({ year: 2016, month: 4, day: 29 }))).toEqual([2024, 1, 8]);
  });

  it('EC 1892 falls on Jan 6, 1900 (sourced century exception: Julian Dec 25)', () => {
    expect(gennaDay(1892)).toBe(28);
    expect(ymd(toGregorian({ year: 1892, month: 4, day: gennaDay(1892) }))).toEqual([1900, 1, 6]);
  });

  it('stays on Jan 7 for every resolvable year (EC 1893–2092)', () => {
    for (let ey = FEAST_MIN_YEAR; ey <= FEAST_MAX_YEAR; ey++) {
      const g = resolveFixedFeasts(ey).find((o) => o.id === 'genna')!.start.g;
      expect([g.month, g.day], `EC ${ey}`).toEqual([1, 7]);
    }
  });
});

describe('fast ranges', () => {
  const days = (o: FeastOccurrence) =>
    (Date.UTC(o.end!.g.year, o.end!.g.month - 1, o.end!.g.day) -
      Date.UTC(o.start.g.year, o.start.g.month - 1, o.start.g.day)) / 86_400_000 + 1;

  it.each(YEARS)('EC %i: every fast has start ≤ end and the documented length', (ey) => {
    const fasts = resolveFixedFeasts(ey).filter((o) => o.kind === 'fast');
    expect(fasts.map((f) => f.id).sort()).toEqual(['tsome-filseta', 'tsome-nebiyat']);
    for (const f of fasts) expect(days(f)).toBeGreaterThan(0);
    expect(days(fasts.find((f) => f.id === 'tsome-filseta')!)).toBe(15);
    expect(days(fasts.find((f) => f.id === 'tsome-nebiyat')!)).toBe(ey % 4 === 0 ? 43 : 44);
  });

  it('Tsome Nebiyat always ends on the eve of Genna', () => {
    for (const ey of YEARS) {
      const occ = resolveFixedFeasts(ey);
      const fastEnd = occ.find((o) => o.id === 'tsome-nebiyat')!.end!.g;
      const genna = occ.find((o) => o.id === 'genna')!.start.g;
      expect(Date.UTC(genna.year, genna.month - 1, genna.day) -
        Date.UTC(fastEnd.year, fastEnd.month - 1, fastEnd.day)).toBe(86_400_000);
    }
  });
});

describe('range', () => {
  it('covers EC 1893–2092 (the whole years inside Gregorian 1900–2100)', () => {
    expect(FEAST_MIN_YEAR).toBe(1893);
    expect(FEAST_MAX_YEAR).toBe(2092);
    expect(() => resolveFixedFeasts(1893)).not.toThrow();
    expect(() => resolveFixedFeasts(2092)).not.toThrow();
  });

  it.each([1892, 2093, 0, 2016.5])('rejects EC %s with RangeError', (ey) => {
    expect(() => resolveFixedFeasts(ey)).toThrow(RangeError);
  });
});

describe('data integrity', () => {
  const all = [
    ...[...FIXED_FEASTS, ...MOVABLE_DEFS].map((d) => ({ id: d.id, names: d.names, sourceRef: d.sourceRef })),
    MONTHLY_COMMEMORATION,
  ];

  it('has unique ids', () => {
    const ids = all.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every Amharic name is genuine Ethiopic script with no Latin letters', () => {
    for (const d of all) {
      expect(d.names.am, d.id).toMatch(/[ሀ-፿]/);
      expect(d.names.am, d.id).not.toMatch(/[A-Za-z]/);
    }
  });

  it('every sourceRef points to an existing anchor in docs/research/feasts.md', () => {
    const docs = new Map<string, string>();
    for (const d of all) {
      const [file, anchor] = d.sourceRef.split('#');
      expect(file, d.id).toBe('docs/research/feasts.md');
      if (!docs.has(file)) docs.set(file, readFileSync(resolve(__dirname, '../..', file), 'utf-8'));
      expect(docs.get(file), `${d.id} → #${anchor}`).toContain(`<a id="${anchor}"></a>`);
    }
  });

  it('ships no pending-confirmation saint dates (Ginbot 12, Megabit 24)', () => {
    for (const d of FIXED_FEASTS) {
      if (d.rule.type !== 'fixed') continue;
      expect([d.rule.month, d.rule.day], d.id).not.toEqual([9, 12]);
      expect([d.rule.month, d.rule.day], d.id).not.toEqual([7, 24]);
    }
  });
});
