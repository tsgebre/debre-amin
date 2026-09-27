import en from './en.json';
import am from './am.json';

export const LOCALES = ['en', 'am'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (LOCALES as readonly string[]).includes(x);
}

export const LOCALE_META: Readonly<Record<Locale, { htmlLang: string; label: string }>> = {
  en: { htmlLang: 'en', label: 'English' },
  am: { htmlLang: 'am', label: 'አማርኛ' },
};

export type Dictionary = Readonly<Record<string, string>>;
export type Dictionaries = Readonly<Record<Locale, Dictionary>>;

export const DICTIONARIES: Dictionaries = { en, am };

export function missingMarker(key: string): string {
  return `⟦missing: ${key}⟧`;
}

// No cross-locale fallback: a gap in `am` must stay visible, not show English.
export function createTranslator(dicts: Dictionaries) {
  return function t(lang: Locale, key: string): string {
    const dict = dicts[lang];
    const value = dict && Object.hasOwn(dict, key) ? dict[key] : undefined;
    return typeof value === 'string' && value !== '' ? value : missingMarker(key);
  };
}

export const t = createTranslator(DICTIONARIES);
