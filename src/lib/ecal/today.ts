import type { EthiopianDate } from './types';
import { toEthiopian } from './core';

// "Today" is the civil (midnight-to-midnight) day in the given IANA time
// zone. The traditional Ethiopian reckoning, in which the date turns at
// dawn rather than midnight, is intentionally out of scope.
export function ethiopianTodayIn(
  timeZone = 'America/New_York',
  now: Date = new Date(),
): EthiopianDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const num = (type: 'year' | 'month' | 'day'): number =>
    Number(parts.find((p) => p.type === type)?.value);
  return toEthiopian({ year: num('year'), month: num('month'), day: num('day') });
}
