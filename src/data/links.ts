function normalizePhone(v: string): string {
  return v.replace(/[\s().-]/g, '');
}

/** Callers must never pass a placeholder string. */
export function telHref(phone: string): string {
  return `tel:${normalizePhone(phone)}`;
}

/** Callers must never pass a placeholder string. */
export function mailtoHref(email: string): string {
  return `mailto:${email}`;
}
