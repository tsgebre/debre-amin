import { gregorianToJdn, jdnToEthiopian, jdnToGregorian, ethiopianToJdn } from '../ecal';
import type { GregorianDate } from '../ecal';
import type { DatePair, FeastDef, FeastOccurrence, MovableRule } from './types';

// Movable observances hang off Fasika. Fasika itself comes from a lookup
// table, not a computus: every row is RESEARCHER-verified against three
// Eastern paschalion tables (docs/research/feasts.md#fasika), and the tests
// cross-check the whole table against an independent Julian computus.
// Years outside the table return nothing — never a guess.

/** Fasika (Gregorian) by Ethiopian year; EC year y's Fasika falls in Gregorian y + 8. */
export const FASIKA_TABLE: Readonly<Record<number, GregorianDate>> = {
  2016: { year: 2024, month: 5, day: 5 },
  2017: { year: 2025, month: 4, day: 20 },
  2018: { year: 2026, month: 4, day: 12 },
  2019: { year: 2027, month: 5, day: 2 },
  2020: { year: 2028, month: 4, day: 16 },
  2021: { year: 2029, month: 4, day: 8 },
  2022: { year: 2030, month: 4, day: 28 },
  2023: { year: 2031, month: 4, day: 13 },
  2024: { year: 2032, month: 5, day: 2 },
  2025: { year: 2033, month: 4, day: 24 },
  2026: { year: 2034, month: 4, day: 9 },
  2027: { year: 2035, month: 4, day: 29 },
  2028: { year: 2036, month: 4, day: 20 },
  2029: { year: 2037, month: 4, day: 5 },
  2030: { year: 2038, month: 4, day: 25 },
};

const HAMLE = 11;
const doc = (anchor: string) => `docs/research/feasts.md#${anchor}`;

export const MOVABLE_DEFS: readonly FeastDef<MovableRule>[] = [
  {
    id: 'tsome-nenewe',
    kind: 'fast',
    names: { en: 'Fast of Nineveh (Tsome Nenewe)', am: 'ጾመ ነነዌ' },
    rule: { type: 'relative', startOffset: -69, endOffset: -67 },
    confidence: 'high',
    sourceRef: doc('tsome-nenewe'),
  },
  {
    id: 'abiy-tsom',
    kind: 'fast',
    names: { en: 'Great Lent (Abiy Tsom)', am: 'ዐቢይ ጾም' },
    rule: { type: 'relative', startOffset: -55, endOffset: -1 },
    confidence: 'high',
    sourceRef: doc('abiy-tsom'),
  },
  {
    id: 'hosanna',
    kind: 'feast',
    names: { en: 'Hosanna (Palm Sunday)', am: 'ሆሣዕና' },
    rule: { type: 'relative', offset: -7 },
    confidence: 'high',
    sourceRef: doc('hosanna'),
  },
  {
    id: 'siklet',
    kind: 'feast',
    names: { en: 'Siklet (Good Friday)', am: 'ስቅለት' },
    rule: { type: 'relative', offset: -2 },
    confidence: 'high',
    sourceRef: doc('siklet'),
  },
  {
    id: 'fasika',
    kind: 'feast',
    names: { en: 'Fasika (Easter)', am: 'ፋሲካ' },
    rule: { type: 'relative', offset: 0 },
    confidence: 'high',
    sourceRef: doc('fasika'),
  },
  {
    id: 'erget',
    kind: 'feast',
    names: { en: 'Erget (Ascension)', am: 'ዕርገት' },
    rule: { type: 'relative', offset: 39 },
    confidence: 'high',
    sourceRef: doc('erget'),
  },
  {
    id: 'peraklitos',
    kind: 'feast',
    names: { en: 'Peraklitos (Pentecost)', am: 'ጰራቅሊጦስ' },
    rule: { type: 'relative', offset: 49 },
    confidence: 'high',
    sourceRef: doc('peraklitos'),
  },
  {
    // Start is sourced with high confidence; the Hamle 4 end is medium–high
    // (one parish calendar lists it through Hamle 5), hence 'medium'.
    id: 'tsome-hawariat',
    kind: 'fast',
    names: { en: 'Fast of the Apostles (Tsome Hawariat)', am: 'ጾመ ሐዋርያት' },
    rule: { type: 'relative', startOffset: 50, end: { month: HAMLE, day: 4 } },
    confidence: 'medium',
    sourceRef: doc('tsome-hawariat'),
  },
];

function pairFromJdn(jdn: number): DatePair {
  return { e: jdnToEthiopian(jdn), g: jdnToGregorian(jdn) };
}

/** Movable occurrences for Ethiopian year `ey`, or [] when `ey` is not in FASIKA_TABLE. */
export function resolveMovableFeasts(ey: number): FeastOccurrence[] {
  const fasika = FASIKA_TABLE[ey];
  if (!fasika) return [];
  const f = gregorianToJdn(fasika);
  return MOVABLE_DEFS.map((def) => {
    const r = def.rule;
    const occ: FeastOccurrence = {
      id: def.id,
      kind: def.kind,
      names: def.names,
      confidence: def.confidence,
      start: pairFromJdn(f + ('offset' in r ? r.offset : r.startOffset)),
    };
    if ('endOffset' in r) occ.end = pairFromJdn(f + r.endOffset);
    if ('end' in r) occ.end = pairFromJdn(ethiopianToJdn({ year: ey, ...r.end }));
    return occ;
  });
}
