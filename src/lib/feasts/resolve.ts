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
import { FASIKA_TABLE, resolveMovableFeasts } from './movable';
import type { DatePair, FeastDef, FeastKind, FeastOccurrence, FixedRule, MonthDay } from './types';

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

function bounds(def: FeastDef<FixedRule>, ey: number): { start: MonthDay; end?: MonthDay } {
  switch (def.rule.type) {
    case 'fixed':
      return { start: { month: def.rule.month, day: def.rule.day } };
    case 'fixedRange':
      return { start: def.rule.start, end: def.rule.end };
    case 'computed':
      return def.rule.compute(ey);
  }
}

const startJdn = (o: FeastOccurrence) => ethiopianToJdn(o.start.e);
const endJdn = (o: FeastOccurrence) => ethiopianToJdn((o.end ?? o.start).e);

function byStart(a: FeastOccurrence, b: FeastOccurrence): number {
  return startJdn(a) - startJdn(b) || a.id.localeCompare(b.id);
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
      confidence: def.confidence,
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
      confidence: m.confidence,
      start: pair(ey, { month: i + 1, day: m.day }),
    };
    if (m.annualMonths.includes(i + 1)) occ.annual = true;
    return occ;
  });
}

/**
 * Fixed and movable occurrences of Ethiopian year `ey`, sorted by start date.
 * `movableAvailable` is false when `ey` is outside FASIKA_TABLE; the movable
 * feasts are then absent rather than guessed.
 */
export function feastsForYear(ey: number): { occurrences: FeastOccurrence[]; movableAvailable: boolean } {
  const fixed = resolveFixedFeasts(ey);
  return {
    occurrences: [...fixed, ...resolveMovableFeasts(ey)].sort(byStart),
    movableAvailable: ey in FASIKA_TABLE,
  };
}

/**
 * Fixed and (where available) movable occurrences overlapping the inclusive
 * Gregorian window [fromG, toG], across Ethiopian year boundaries, sorted.
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
    for (const occ of feastsForYear(ey).occurrences) {
      if (startJdn(occ) <= toJdn && endJdn(occ) >= fromJdn) result.push(occ);
    }
  }
  return result.sort(byStart);
}

/**
 * The first occurrence of the given kinds (default: feasts) starting on or
 * after `fromG`, searching its Ethiopian year and the next; null if none.
 * Monthly commemorations are searched too, so kinds: ['commemoration'] works.
 */
export function nextFeast(
  fromG: GregorianDate,
  { kinds = ['feast'] }: { kinds?: FeastKind[] } = {},
): FeastOccurrence | null {
  const ey = toEthiopian(fromG).year;
  const fromJdn = gregorianToJdn(fromG);
  for (const year of [ey, ey + 1]) {
    if (year > FEAST_MAX_YEAR) break;
    const candidates = [...feastsForYear(year).occurrences, ...monthlyCommemorations(year)]
      .filter((o) => kinds.includes(o.kind) && startJdn(o) >= fromJdn)
      .sort(byStart);
    if (candidates.length > 0) return candidates[0];
  }
  return null;
}

/** Fasts in progress on `g` (inclusive of their first and last days). */
export function currentObservances(g: GregorianDate): FeastOccurrence[] {
  const jdn = gregorianToJdn(g);
  return feastsForYear(toEthiopian(g).year).occurrences.filter(
    (o) => o.kind === 'fast' && startJdn(o) <= jdn && endJdn(o) >= jdn,
  );
}
