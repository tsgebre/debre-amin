/** An Ethiopian (Amete Mihret) calendar date. */
export interface EthiopianDate {
  /** Ethiopian year; must be >= 1. */
  year: number;
  /** 1–13. Months 1–12 have 30 days; month 13 (Pagume) has 5 or 6. */
  month: number;
  /** 1-based day of the month. */
  day: number;
}

/** A (proleptic) Gregorian calendar date. */
export interface GregorianDate {
  /** Gregorian year; must be >= 1. */
  year: number;
  /** 1–12 */
  month: number;
  /** 1-based day of the month. */
  day: number;
}

/** The two site languages, declared locally so this module stays dependency-free. */
export type EcalLang = 'en' | 'am';
