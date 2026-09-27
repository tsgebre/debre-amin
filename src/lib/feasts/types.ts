import type { EthiopianDate, GregorianDate } from '../ecal';

export type FeastKind = 'feast' | 'fast' | 'commemoration';

export interface MonthDay {
  /** Ethiopian month, 1–13. */
  month: number;
  day: number;
}

export type FixedRule =
  | { type: 'fixed'; month: number; day: number }
  | { type: 'fixedRange'; start: MonthDay; end: MonthDay }
  | {
      type: 'computed';
      /** Plain-language statement of the rule, for docs and review. */
      description: string;
      compute: (ethiopianYear: number) => { start: MonthDay; end?: MonthDay };
    };

/** Offsets are whole days from that Ethiopian year's Fasika (negative = before). */
export type MovableRule =
  | { type: 'relative'; offset: number }
  | { type: 'relative'; startOffset: number; endOffset: number }
  | { type: 'relative'; startOffset: number; end: MonthDay };

export type FeastRule = FixedRule | MovableRule;

export interface FeastNames {
  en: string;
  am: string;
}

export type Confidence = 'high' | 'medium';

export interface FeastDef<R extends FeastRule = FeastRule> {
  id: string;
  kind: FeastKind;
  names: FeastNames;
  rule: R;
  confidence: Confidence;
  /** `docs/research/feasts.md#<anchor>` — where this entry's sources are recorded. */
  sourceRef: string;
}

export interface DatePair {
  e: EthiopianDate;
  g: GregorianDate;
}

export interface FeastOccurrence {
  id: string;
  kind: FeastKind;
  names: FeastNames;
  /** 'medium' entries must be shown with a "dates pending parish confirmation" note. */
  confidence: Confidence;
  start: DatePair;
  /** Last day (inclusive) of a multi-day observance such as a fast. */
  end?: DatePair;
  /** Monthly commemorations only: this month's 24th is also an annual feast. */
  annual?: boolean;
}
