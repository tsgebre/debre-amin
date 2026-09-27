import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import CalendarView from '../src/components/CalendarView.astro';
import CalendarPage from '../src/pages/[lang]/calendar.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import { scriptPolicyViolations } from './helpers/script-policy';

type Component = Parameters<AstroContainer['renderToString']>[0];
const CalendarPageComponent = CalendarPage as unknown as Component;

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

// The dev-mode Container API injects data-astro-source-* attributes on
// every element; strip them so exact-markup assertions stay readable.
function stripAstroSource(doc: string): string {
  return doc.replace(/\s+data-astro-source-(?:file|loc)="[^"]*"/g, '');
}

async function render(lang: Locale, years: number[]): Promise<string> {
  const doc = await container.renderToString(CalendarView, {
    props: { lang, years, timeZone: 'America/New_York' },
    request: new Request(`http://localhost/${lang}/calendar/`),
  });
  return stripAstroSource(doc);
}

function tables(html: string): string[] {
  return [...html.matchAll(/<table>[\s\S]*?<\/table>/g)].map((m) => m[0]);
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '|').replace(/\|+/g, '|');
}

describe('CalendarView — en, [2019, 2020]', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('en', [2019, 2020]);
  });

  it('shows Meskel with its Ethiopian and Gregorian dates', () => {
    expect(doc).toMatch(
      /Meskel[^<]*<\/td>\s*<td>\s*<time datetime="2026-09-27">Meskerem 17, 2019 E\.C\.<\/time>\s*<\/td>\s*<td>\s*<time datetime="2026-09-27">September 27, 2026<\/time>/,
    );
  });

  it('shows Genna 2019 as Tahsas 29, January 7, 2027', () => {
    expect(doc).toMatch(
      /Genna[^<]*<\/td>\s*<td>\s*<time datetime="2027-01-07">Tahsas 29, 2019 E\.C\.<\/time>\s*<\/td>\s*<td>\s*<time datetime="2027-01-07">January 7, 2027<\/time>/,
    );
  });

  it('shows Genna 2020 as Tahsas 28, 2020, January 7, 2028', () => {
    expect(doc).toMatch(
      /Genna[^<]*<\/td>\s*<td>\s*<time datetime="2028-01-07">Tahsas 28, 2020 E\.C\.<\/time>\s*<\/td>\s*<td>\s*<time datetime="2028-01-07">January 7, 2028<\/time>/,
    );
  });

  it('shows Fasika 2019 as May 2, 2027', () => {
    expect(doc).toMatch(/Fasika[^<]*<\/td>\s*<td>\s*<time datetime="2027-05-02">[^<]*<\/time>\s*<\/td>\s*<td>\s*<time datetime="2027-05-02">May 2, 2027<\/time>/);
  });

  it('the Abiy Tsom "to" cell contains "until Fasika" and the Fasika date', () => {
    const fastsTable = tables(doc).find((t) => t.includes('Fasting periods'))!;
    const row = /<tr>\s*<td>\s*Great Lent[\s\S]*?<\/tr>/.exec(fastsTable)![0];
    expect(row).toContain('until Fasika');
    expect(row).toMatch(/<time datetime="2027-05-02">May 2, 2027<\/time>/);
  });

  it('has exactly one pending-confirmation note per year, on Tsome Nebiyat and Tsome Hawariat only', () => {
    const notes = doc.match(/class="pending-note"/g) ?? [];
    expect(notes).toHaveLength(4); // 2 fasts × 2 years
    const fastsTables = tables(doc).filter((t) => t.includes('Fasting periods'));
    expect(fastsTables).toHaveLength(2);
    for (const t of fastsTables) {
      const rowsWithNote = [...t.matchAll(/<tr>[\s\S]*?<\/tr>/g)]
        .map((m) => m[0])
        .filter((r) => r.includes('pending-note'));
      expect(rowsWithNote).toHaveLength(2);
      expect(rowsWithNote.every((r) => r.includes('Tsome Nebiyat') || r.includes('Tsome Hawariat'))).toBe(true);
    }
  });

  it('has 12 monthly commemorations per year, with exactly 2 marked annual', () => {
    const monthlyTables = tables(doc).filter((t) => t.includes('Monthly commemoration'));
    expect(monthlyTables).toHaveLength(2);
    for (const t of monthlyTables) {
      const rows = [...t.matchAll(/<tr>[\s\S]*?<\/tr>/g)].map((m) => m[0]).filter((r) => !r.includes('<th'));
      expect(rows).toHaveLength(12);
      const annual = rows.filter((r) => r.includes('Annual feast'));
      expect(annual).toHaveLength(2);
    }
  });

  it('shows the two annual saint feasts by name', () => {
    const annualTables = tables(doc).filter((t) => t.includes('Annual feasts of Abune'));
    expect(annualTables).toHaveLength(2);
    for (const t of annualTables) {
      expect(t).toContain('Birth of Abune Teklehaymanot');
      expect(t).toContain('Repose of Abune Teklehaymanot');
    }
  });

  it('never shows a digit-followed-by-"days" pattern in the fasts table', () => {
    for (const t of tables(doc).filter((tb) => tb.includes('Fasting periods'))) {
      expect(stripTags(t)).not.toMatch(/\d+\s*days?/i);
    }
  });

  it('every table has a caption and scoped column headers', () => {
    for (const t of tables(doc)) {
      expect(t).toMatch(/<caption>/);
      const headers = t.match(/<th\b[^>]*scope="col"[^>]*>/g) ?? [];
      expect(headers.length).toBeGreaterThan(0);
    }
  });

  it('the 13 month rows give the correct Meskerem 1 date for both years', () => {
    const monthTables = tables(doc).filter((t) => t.includes('13 months'));
    expect(monthTables).toHaveLength(2);
    expect(monthTables[0]).toMatch(/<tr>\s*<td>Meskerem<\/td>\s*<td>\s*<time datetime="2026-09-11">September 11, 2026<\/time>/);
    expect(monthTables[1]).toMatch(/<tr>\s*<td>Meskerem<\/td>\s*<td>\s*<time datetime="2027-09-12">September 12, 2027<\/time>/);
    for (const t of monthTables) {
      const rows = [...t.matchAll(/<tr>[\s\S]*?<\/tr>/g)].map((m) => m[0]).filter((r) => !r.includes('<th'));
      expect(rows).toHaveLength(13);
    }
  });

  it('shows the year heading in the documented format', () => {
    expect(doc).toContain('2019 E.C. (2026–2027)');
    expect(doc).toContain('2020 E.C. (2027–2028)');
  });
});

describe('CalendarView — en, [2031] (outside the movable-feast table)', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('en', [2031]);
  });

  it('shows the movable-unavailable note', () => {
    expect(doc).toContain('Movable feast and fast dates are not yet available for this year.');
  });

  it('still shows the fixed feasts', () => {
    expect(doc).toContain('Enkutatash');
    expect(doc).toContain('Meskel');
    expect(doc).toContain('Genna');
  });

  it('has no Fasika row', () => {
    expect(doc).not.toContain('Fasika');
  });

  it('has no missing-translation markers', () => {
    expect(doc).not.toContain('⟦missing:');
  });
});

describe('CalendarView — am, [2019]', () => {
  let doc = '';

  beforeAll(async () => {
    doc = await render('am', [2019]);
  });

  it('shows Ethiopic month names', () => {
    expect(doc).toContain('መስከረም');
    expect(doc).toContain('ጳጉሜን');
  });

  it('shows Amharic feast names', () => {
    expect(doc).toContain('ፋሲካ');
    expect(doc).toContain('ገና');
  });

  it('has no missing-translation markers', () => {
    expect(doc).not.toContain('⟦missing:');
  });
});

describe('calendar page', () => {
  let html: Partial<Record<Locale, string>> = {};

  beforeAll(async () => {
    for (const lang of LOCALES) {
      const doc = await container.renderToString(CalendarPageComponent, {
        params: { lang },
        request: new Request(`http://localhost/${lang}/calendar/`),
      });
      html[lang] = stripAstroSource(doc);
    }
  });

  it.each(LOCALES)('marks the Calendar nav link as current — %s', (lang) => {
    const href = `/${lang}/calendar/`;
    expect(html[lang]).toMatch(new RegExp(`<a href="${href.replace(/\//g, '\\/')}"[^>]*aria-current="page"`));
  });

  it.each(LOCALES)('ships only local module scripts (no external hosts) — %s', (lang) => {
    expect(scriptPolicyViolations(html[lang]!)).toEqual([]);
  });

  it.each(LOCALES)('has no missing-translation markers — %s', (lang) => {
    expect(html[lang]).not.toContain('⟦missing:');
  });
});
