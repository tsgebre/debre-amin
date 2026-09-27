import { isLocale, type Locale } from './index';

const DEFAULT_BASE: string = import.meta.env.BASE_URL ?? '/';

function segments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

// '/' or '' -> '', '/debre-amin/' or 'debre-amin' -> '/debre-amin'
function normalizeBase(base: string): string {
  const segs = segments(base);
  return segs.length ? `/${segs.join('/')}` : '';
}

function join(base: string, segs: string[]): string {
  const b = normalizeBase(base);
  return segs.length ? `${b}/${segs.join('/')}/` : `${b}/`;
}

export function localizedPath(lang: Locale, slug: string, base: string = DEFAULT_BASE): string {
  return join(base, [lang, ...segments(slug)]);
}

export function assetPath(file: string, base: string = DEFAULT_BASE): string {
  return `${normalizeBase(base)}/${segments(file).join('/')}`;
}

/** Resolves a site-relative path (already base-prefixed) against the deployed origin. */
export function absoluteUrl(path: string, site: string): string {
  return new URL(path, site).href;
}

export function samePath(a: string, b: string): boolean {
  const norm = (p: string) => `/${segments(p).join('/')}`;
  return norm(a) === norm(b);
}

export function switchLocalePath(
  pathname: string,
  targetLang: Locale,
  base: string = DEFAULT_BASE,
): string {
  const b = normalizeBase(base);
  let rest = pathname;
  if (b && (pathname === b || pathname.startsWith(`${b}/`))) {
    rest = pathname.slice(b.length);
  }
  const segs = segments(rest);
  if (segs.length && isLocale(segs[0])) segs.shift();
  return localizedPath(targetLang, segs.join('/'), base);
}
