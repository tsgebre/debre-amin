import type { FeastDef, FeastNames } from './types';

// Every entry is RESEARCHER-verified; sources, conflicts and confidence are
// recorded under the matching anchor in docs/research/feasts.md. Do not add
// or change an entry without recording its sources there first.

const TAHSAS = 4;
const TIR = 5;
const HIDAR = 3;
const MESKEREM = 1;
const NEHASE = 12;

/**
 * Genna falls on Tahsas 28 in ዘመነ ዮሐንስ (EC year % 4 === 0, the year after a
 * 6-day Pagume) and on Tahsas 29 otherwise — always Julian Dec 25. Within
 * the supported range that is Gregorian Jan 7, except EC 1892 (Jan 6, 1900).
 */
export function gennaDay(ethiopianYear: number): number {
  return ((ethiopianYear % 4) + 4) % 4 === 0 ? 28 : 29;
}

const doc = (anchor: string) => `docs/research/feasts.md#${anchor}`;

export const FIXED_FEASTS: readonly FeastDef[] = [
  {
    id: 'enkutatash',
    kind: 'feast',
    names: { en: 'Enkutatash (Ethiopian New Year)', am: 'እንቁጣጣሽ' },
    rule: { type: 'fixed', month: MESKEREM, day: 1 },
    confidence: 'high',
    sourceRef: doc('enkutatash'),
  },
  {
    id: 'meskel',
    kind: 'feast',
    names: { en: 'Meskel (Finding of the True Cross)', am: 'መስቀል' },
    rule: { type: 'fixed', month: MESKEREM, day: 17 },
    confidence: 'high',
    sourceRef: doc('meskel'),
  },
  {
    id: 'tsome-nebiyat',
    kind: 'fast',
    names: { en: 'Fast of the Prophets (Tsome Nebiyat)', am: 'ጾመ ነቢያት' },
    rule: {
      type: 'computed',
      description: 'Hidar 15 through the eve of Genna (Tahsas 28, or Tahsas 27 in ዘመነ ዮሐንስ)',
      compute: (ey) => ({
        start: { month: HIDAR, day: 15 },
        end: { month: TAHSAS, day: gennaDay(ey) - 1 },
      }),
    },
    confidence: 'medium',
    sourceRef: doc('tsome-nebiyat'),
  },
  {
    id: 'teklehaymanot-birth',
    kind: 'feast',
    names: {
      en: 'Birth of Abune Teklehaymanot',
      am: 'የአቡነ ተክለ ሃይማኖት በዓለ ልደት',
    },
    rule: { type: 'fixed', month: TAHSAS, day: 24 },
    confidence: 'high',
    sourceRef: doc('teklehaymanot-birth'),
  },
  {
    id: 'genna',
    kind: 'feast',
    names: { en: 'Genna (Nativity of Christ)', am: 'ገና' },
    rule: {
      type: 'computed',
      description: 'Tahsas 28 when EC year % 4 === 0 (ዘመነ ዮሐንስ), otherwise Tahsas 29',
      compute: (ey) => ({ start: { month: TAHSAS, day: gennaDay(ey) } }),
    },
    confidence: 'high',
    sourceRef: doc('genna'),
  },
  {
    id: 'ketera',
    kind: 'feast',
    names: { en: 'Ketera (Eve of Timket)', am: 'ከተራ' },
    rule: { type: 'fixed', month: TIR, day: 10 },
    confidence: 'high',
    sourceRef: doc('ketera'),
  },
  {
    id: 'timket',
    kind: 'feast',
    names: { en: 'Timket (Epiphany)', am: 'ጥምቀት' },
    rule: { type: 'fixed', month: TIR, day: 11 },
    confidence: 'high',
    sourceRef: doc('timket'),
  },
  {
    id: 'tsome-filseta',
    kind: 'fast',
    names: { en: 'Fast of the Assumption (Tsome Filseta)', am: 'ጾመ ፍልሰታ' },
    rule: { type: 'fixedRange', start: { month: NEHASE, day: 1 }, end: { month: NEHASE, day: 15 } },
    confidence: 'high',
    sourceRef: doc('tsome-filseta'),
  },
  {
    id: 'filseta',
    kind: 'feast',
    names: { en: 'Filseta (Assumption of St. Mary)', am: 'ፍልሰታ ለማርያም' },
    rule: { type: 'fixed', month: NEHASE, day: 16 },
    confidence: 'high',
    sourceRef: doc('filseta'),
  },
  {
    id: 'teklehaymanot-repose',
    kind: 'feast',
    names: {
      en: 'Repose of Abune Teklehaymanot',
      am: 'የአቡነ ተክለ ሃይማኖት በዓለ ዕረፍት',
    },
    rule: { type: 'fixed', month: NEHASE, day: 24 },
    confidence: 'high',
    sourceRef: doc('teklehaymanot-repose'),
  },
];

/** The saint's monthly commemoration, on the 24th of months 1–12. */
export const MONTHLY_COMMEMORATION = {
  id: 'teklehaymanot-monthly',
  kind: 'commemoration',
  names: {
    en: 'Monthly commemoration of Abune Teklehaymanot',
    am: 'የአቡነ ተክለ ሃይማኖት ወርሃዊ በዓል',
  } satisfies FeastNames,
  day: 24,
  /** Months whose 24th is also one of the saint's annual feasts. */
  annualMonths: [TAHSAS, NEHASE] as readonly number[],
  confidence: 'high',
  sourceRef: doc('teklehaymanot-monthly'),
} as const;
