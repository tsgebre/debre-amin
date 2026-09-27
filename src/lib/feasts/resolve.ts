import {
  SUPPORTED_MAX_JDN,
  SUPPORTED_MIN_JDN,
  ethiopianToJdn,
  gregorianToJdn,
  jdnToEthiopian,
  toEthiopian,
  toGregorian,
} from '../ecal';
import type { EthiopianDate, GregorianDate } from '../ecal';
import { FIXED_FEASTS, MONTHLY_COMMEMORATION } from './fixed';
import type { DatePair, FeastDef, FeastOccurrence, MonthDay } from './types';

// Feasts resolve only for whole Ethiopian years inside the ecal range
// (Gregorian 1900-01-01..2100-12-31): EC 1893 (from Sep 1900) to EC 2092
// (to Sep 2100). EC 1892 and 2093 are only partly inside it, so a year's
// occurrences would silently go missing; they are rejected instead.
export const FEAST_MIN_YEAR = jdnToEthiopian(SUPPORTED_MIN_JDN).year + 1;
export const FEAST_MAX_YEAR = jdnToEthiopian(SUPPORTED_MAX_JDN).year - 1;

function assertFeastYear(ey: number): void {
  if (!Number.isInteger(ey) || ey < FEAST_MIN_YEAR || ey > FEAST_MAX_YEAR) {
    throw new RangeError(
      `Ethiopian year ${ey} is outside the supported feast range ` +
        `(${FEAST_MIN_YEAR}–${FEAST_MAX_YEAR} EC, i.e. Sep 1900 to Sep 2100)`,
    );
  }
}

function pair(ey: number, md: MonthDay): DatePair {
  const e: EthiopianDate = { year: ey, month: md.month, day: md.day };
  return { e, g: toGregorian(e) };
}

function bounds(def: FeastDef, ey: number): { start: MonthDay; end?: MonthDay } {
  switch (def.rule.type) {
    case 'fixed':
      return { start: { month: def.rule.month, day: def.rule.day } };
    case 'fixedRange':
      return { start: def.rule.start, end: def.rule.end };
    case 'computed':
      return def.rule.compute(ey);
  }
}

function byStart(a: FeastOccurrence, b: FeastOccurrence): number {
  return ethiopianToJdn(a.start.e) - ethiopianToJdn(b.start.e) || a.id.localeCompare(b.id);
}

/** Every fixed feast and fast of Ethiopian year `ey`, sorted by start date. */
export function resolveFixedFeasts(ey: number): FeastOccurrence[] {
  assertFeastYear(ey);
  return FIXED_FEASTS.map((def) => {
    const b = bounds(def, ey);
    const occ: FeastOccurrence = {
      id: def.id,
      kind: def.kind,
      names: def.names,
      start: pair(ey, b.start),
    };
    if (b.end) occ.end = pair(ey, b.end);
    return occ;
  }).sort(byStart);
}

/** The saint's 12 monthly commemorations (Pagume has no 24th). */
export function monthlyCommemorations(ey: number): FeastOccurrence[] {
  assertFeastYear(ey);
  const m = MONTHLY_COMMEMORATION;
  return Array.from({ length: 12 }, (_, i) => {
    const occ: FeastOccurrence = {
      id: m.id,
      kind: m.kind,
      names: m.names,
      start: pair(ey, { month: i + 1, day: m.day }),
    };
    if (m.annualMonths.includes(i + 1)) occ.annual = true;
    return occ;
  });
}

/**
 * Fixed feasts and fasts overlapping the inclusive Gregorian window
 * [fromG, toG], across Ethiopian year boundaries, sorted by start date.
 */
export function occurrencesBetween(fromG: GregorianDate, toG: GregorianDate): FeastOccurrence[] {
  const from = toEthiopian(fromG);
  const to = toEthiopian(toG);
  const fromJdn = gregorianToJdn(fromG);
  const toJdn = gregorianToJdn(toG);
  if (fromJdn > toJdn) {
    throw new RangeError('occurrencesBetween: fromG must not be after toG');
  }
  const result: FeastOccurrence[] = [];
  for (let ey = from.year; ey <= to.year; ey++) {
    for (const occ of resolveFixedFeasts(ey)) {
      const s = ethiopianToJdn(occ.start.e);
      const e = ethiopianToJdn((occ.end ?? occ.start).e);
      if (s <= toJdn && e >= fromJdn) result.push(occ);
    }
  }
  return result.sort(byStart);
}
