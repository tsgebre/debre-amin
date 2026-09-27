export const PLACEHOLDER_PREFIX = 'TBD —';

export function isPlaceholder(v: unknown): boolean {
  return typeof v === 'string' && v.startsWith(PLACEHOLDER_PREFIX);
}

/** A placeholder string naming its own location, e.g. ph('contact.phone'). */
export function ph(location: string): string {
  return `${PLACEHOLDER_PREFIX} replace in src/data/site.ts (${location})`;
}
