import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en.json';
import am from '../src/i18n/am.json';
import {
  DICTIONARIES,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  createTranslator,
  isLocale,
  t,
} from '../src/i18n/index';
import { AM_NEEDS_REVIEW } from '../src/i18n/review';
import { NAV } from '../src/i18n/nav';

const ETHIOPIC = /[ሀ-፿]/;
const AM_NON_ETHIOPIC_ALLOWLIST = ['lang.switchTo'];

const REQUIRED_KEYS = [
  'site.name',
  'site.tagline',
  'nav.home',
  'nav.about',
  'nav.services',
  'nav.calendar',
  'nav.giving',
  'nav.events',
  'nav.gallery',
  'nav.contact',
  'nav.clergy',
  'a11y.skipToContent',
  'a11y.mainNav',
  'a11y.langToggle',
  'lang.switchTo',
  'footer.rights',
  'placeholder.notice',
];

describe('dictionaries', () => {
  it('en and am have identical key sets', () => {
    const enKeys = new Set(Object.keys(en));
    const amKeys = new Set(Object.keys(am));
    const diff = {
      missingFromAm: [...enKeys].filter((k) => !amKeys.has(k)),
      missingFromEn: [...amKeys].filter((k) => !enKeys.has(k)),
    };
    expect(diff).toEqual({ missingFromAm: [], missingFromEn: [] });
  });

  it('contain every required key', () => {
    for (const lang of LOCALES) {
      const missing = REQUIRED_KEYS.filter((k) => !(k in DICTIONARIES[lang]));
      expect(missing, `missing in ${lang}`).toEqual([]);
    }
  });

  it('have no empty values', () => {
    for (const lang of LOCALES) {
      const empty = Object.entries(DICTIONARIES[lang])
        .filter(([, v]) => typeof v !== 'string' || v.trim() === '')
        .map(([k]) => k);
      expect(empty, `empty in ${lang}`).toEqual([]);
    }
  });

  it('every am value contains Ethiopic script (except allowlist)', () => {
    const offenders = Object.entries(am)
      .filter(([k]) => !AM_NON_ETHIOPIC_ALLOWLIST.includes(k))
      .filter(([, v]) => !ETHIOPIC.test(v))
      .map(([k]) => k);
    expect(offenders).toEqual([]);
  });

  it('language switch labels point at the other language', () => {
    expect(en['lang.switchTo']).toBe('አማርኛ');
    expect(am['lang.switchTo']).toBe('English');
  });

  it('AM_NEEDS_REVIEW entries are existing keys', () => {
    expect(AM_NEEDS_REVIEW.filter((k) => !(k in am))).toEqual([]);
    expect(AM_NEEDS_REVIEW).toContain('site.tagline');
    expect(AM_NEEDS_REVIEW).toContain('placeholder.notice');
  });
});

describe('NAV', () => {
  it('lists the nine pages in order', () => {
    expect(NAV.map((n) => n.slug)).toEqual([
      '',
      'about',
      'services',
      'calendar',
      'giving',
      'events',
      'gallery',
      'contact',
      'clergy',
    ]);
  });

  it('uses only existing i18n keys', () => {
    expect(NAV.filter((n) => !(n.key in en) || !(n.key in am)).map((n) => n.key)).toEqual([]);
  });
});

describe('locale helpers', () => {
  it('isLocale accepts only en and am', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('am')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale('toString')).toBe(false);
  });

  it('exposes default locale and metadata', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(LOCALE_META.en).toEqual({ htmlLang: 'en', label: 'English' });
    expect(LOCALE_META.am).toEqual({ htmlLang: 'am', label: 'አማርኛ' });
  });
});

describe('t()', () => {
  it('returns the translated string', () => {
    expect(t('en', 'nav.home')).toBe('Home');
    expect(t('am', 'nav.home')).toBe('ዋና ገጽ');
  });

  it('returns a visible marker for an unknown key, never throws', () => {
    expect(t('en', 'no.such.key')).toBe('⟦missing: no.such.key⟧');
    expect(t('am', 'no.such.key')).toBe('⟦missing: no.such.key⟧');
  });

  it('does not resolve inherited object properties', () => {
    expect(t('en', 'toString')).toBe('⟦missing: toString⟧');
    expect(t('en', '__proto__')).toBe('⟦missing: __proto__⟧');
  });

  it('returns the marker (not English) when a key is missing from one locale', () => {
    const tt = createTranslator({
      en: { 'only.en': 'English only', shared: 'Hi' },
      am: { shared: 'ሰላም' },
    });
    expect(tt('en', 'only.en')).toBe('English only');
    expect(tt('am', 'only.en')).toBe('⟦missing: only.en⟧');
    expect(tt('am', 'shared')).toBe('ሰላም');
  });

  it('treats an empty value as missing', () => {
    const tt = createTranslator({ en: { k: '' }, am: {} });
    expect(tt('en', 'k')).toBe('⟦missing: k⟧');
  });
});
