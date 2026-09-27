import { describe, expect, it } from 'vitest';
import {
  emailOrPh,
  parseSiteConfig,
  phoneOrPh,
  placeholderFields,
  siteConfig,
  siteConfigSchema,
  urlOrPh,
} from '../src/data/site';
import { isPlaceholder, ph } from '../src/data/placeholder';

const ETHIOPIC = /[ሀ-፿]/;
// Digit sequences that look like a phone number or a clock time, or an "@".
const LOOKS_LIKE_A_REAL_FACT = /\d{3,}|\d{1,2}:\d{2}|@/;

function leaves(value: unknown, path: string[] = []): { path: string; value: string }[] {
  if (typeof value === 'string') return [{ path: path.join('.'), value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, [...path, String(i)]));
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, [...path, k]));
  }
  return [];
}

describe('siteConfig', () => {
  it('parses at module load without throwing', () => {
    expect(() => siteConfigSchema.parse(siteConfig)).not.toThrow();
  });
});

describe('parseSiteConfig error message', () => {
  it('names the field and every accepted form when a value is wrong', () => {
    const bad = structuredClone({
      ...siteConfig,
      contact: { ...siteConfig.contact, phone: '555-1234' },
    });
    let message = '';
    try {
      parseSiteConfig(bad);
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toContain('src/data/site.ts has invalid values:');
    expect(message).toContain('contact.phone:');
    expect(message).toContain('TBD —');
    expect(message).toContain('+1 followed by 10 digits');
  });
});

describe('phoneOrPh', () => {
  it('accepts a well-formed +1 phone number', () => {
    expect(phoneOrPh.parse('+1 (336) 555-0123')).toBe('+1 (336) 555-0123');
    expect(() => phoneOrPh.parse('+13365550123')).not.toThrow();
  });

  it('rejects a malformed phone number', () => {
    expect(() => phoneOrPh.parse('555-1234')).toThrow();
  });

  it('rejects a placeholder missing the required prefix', () => {
    expect(() => phoneOrPh.parse('TBD phone')).toThrow();
  });

  it('accepts a well-formed placeholder', () => {
    expect(() => phoneOrPh.parse('TBD — replace in src/data/site.ts (contact.phone)')).not.toThrow();
  });
});

describe('emailOrPh', () => {
  it('accepts a well-formed email', () => {
    expect(() => emailOrPh.parse('parish@example.org')).not.toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() => emailOrPh.parse('not-an-email')).toThrow();
  });
});

describe('urlOrPh', () => {
  it('accepts an absolute https URL', () => {
    expect(() => urlOrPh.parse('https://example.org/map')).not.toThrow();
  });

  it('rejects a non-https URL', () => {
    expect(() => urlOrPh.parse('http://example.org/map')).toThrow();
  });
});

describe('cashAppTag (checked through the full schema)', () => {
  function withGiving(cashAppTag: string) {
    return structuredClone({
      ...siteConfig,
      giving: { ...siteConfig.giving, cashAppTag },
    });
  }

  it('accepts a well-formed cashtag', () => {
    expect(() => siteConfigSchema.parse(withGiving('$DebreAmin123'))).not.toThrow();
  });

  it('rejects a cashtag missing the leading "$"', () => {
    expect(() => siteConfigSchema.parse(withGiving('DebreAmin123'))).toThrow();
  });
});

describe('clergy photo (checked through the full schema)', () => {
  function withPhoto(photo: string | undefined) {
    return structuredClone({
      ...siteConfig,
      clergy: [{ ...siteConfig.clergy[0], photo }, ...siteConfig.clergy.slice(1)],
    });
  }

  it('accepts a well-formed local filename', () => {
    expect(() => siteConfigSchema.parse(withPhoto('images/clergy/abba-name.jpg'))).not.toThrow();
  });

  it('accepts no photo at all', () => {
    expect(() => siteConfigSchema.parse(withPhoto(undefined))).not.toThrow();
  });

  it('rejects a hotlinked URL', () => {
    expect(() =>
      siteConfigSchema.parse(withPhoto('https://example.org/photo.jpg')),
    ).toThrow();
  });

  it('rejects path traversal', () => {
    expect(() => siteConfigSchema.parse(withPhoto('../x.jpg'))).toThrow();
  });

  it('rejects a filename with a space and an uppercase extension', () => {
    expect(() => siteConfigSchema.parse(withPhoto('images/clergy/Fr Name.JPG'))).toThrow();
  });
});

describe('timeZone', () => {
  it('is the parish time zone (Greensboro, NC)', () => {
    expect(siteConfig.timeZone).toBe('America/New_York');
  });

  it('rejects an invalid IANA name', () => {
    expect(() => siteConfigSchema.parse({ ...structuredClone(siteConfig), timeZone: 'Mars/Olympus' })).toThrow();
  });
});

describe('service day (bilingual)', () => {
  function withServiceDay(day: unknown) {
    return structuredClone({
      ...siteConfig,
      services: [{ ...siteConfig.services[0], day }, ...siteConfig.services.slice(1)],
    });
  }

  it('accepts a real bilingual day value', () => {
    expect(() => siteConfigSchema.parse(withServiceDay({ en: 'Sunday', am: 'እሑድ' }))).not.toThrow();
  });

  it('accepts a bilingual day with placeholders in one or both languages', () => {
    expect(() =>
      siteConfigSchema.parse(withServiceDay({ en: 'Sunday', am: ph('services.0.day.am') })),
    ).not.toThrow();
  });

  it('rejects a day that is not bilingual', () => {
    expect(() => siteConfigSchema.parse(withServiceDay('Sunday'))).toThrow();
  });
});

describe('placeholderFields', () => {
  const fields = new Set(placeholderFields(siteConfig));

  it('flags the remaining contact placeholders, and not the parish-provided facts', () => {
    expect(fields.has('contact.email')).toBe(true);
    expect(fields.has('contact.directions.en')).toBe(true);
    // Real values from the parish's tabot-reception program poster.
    expect(fields.has('contact.phone')).toBe(false);
    expect(fields.has('contact.address.street')).toBe(false);
  });

  it('flags day (en and am) and time for every service', () => {
    for (let i = 0; i < siteConfig.services.length; i++) {
      expect(fields.has(`services.${i}.day.en`)).toBe(true);
      expect(fields.has(`services.${i}.day.am`)).toBe(true);
      expect(fields.has(`services.${i}.time`)).toBe(true);
    }
  });

  it('flags the name of every clergy member', () => {
    for (let i = 0; i < siteConfig.clergy.length; i++) {
      expect(fields.has(`clergy.${i}.name.en`)).toBe(true);
    }
  });

  it('flags every giving field', () => {
    expect(fields.has('giving.zelle')).toBe(true);
    expect(fields.has('giving.paypalUrl')).toBe(true);
    expect(fields.has('giving.cashAppTag')).toBe(true);
    expect(fields.has('giving.mailingAddress')).toBe(true);
  });
});

describe('content honesty', () => {
  const nonPlaceholderLeaves = leaves(siteConfig).filter((l) => !isPlaceholder(l.value));

  it('has no invented real-world facts outside placeholders', () => {
    // Fields whose real values came from the parish itself (the tabot
    // program poster and the links the parish shared) — not invented.
    const PARISH_SOURCED = new Set([
      'contact.phone',
      'contact.address.street',
      'contact.address.postalCode',
      'contact.mapUrl',
      'giving.gofundmeUrl',
      'social.facebookUrl',
    ]);
    const offenders = nonPlaceholderLeaves.filter(
      (l) => !PARISH_SOURCED.has(l.path) && LOOKS_LIKE_A_REAL_FACT.test(l.value),
    );
    expect(offenders).toEqual([]);
  });

  it('every non-placeholder Amharic value is genuine Ethiopic script', () => {
    const offenders = nonPlaceholderLeaves
      .filter((l) => l.path.endsWith('.am'))
      .filter((l) => !ETHIOPIC.test(l.value));
    expect(offenders).toEqual([]);
  });

  it('the only non-placeholder leaves are the known real values', () => {
    const allowed = new Set(nonPlaceholderLeaves.map((l) => l.path.replace(/^services\.\d+/, 'services.N')));
    expect([...allowed].sort()).toEqual(
      [
        'timeZone',
        'contact.address.city',
        'contact.address.state',
        'contact.address.country',
        'services.N.name.en',
        'services.N.name.am',
        'services.N.id',
        'clergy.0.id',
        'clergy.1.id',
        'clergy.2.id',
        // Parish-provided real links (2026-09): the "Help Build Our New
        // Church" GoFundMe campaign and the parish's Facebook share link.
        'giving.gofundmeUrl',
        'social.facebookUrl',
        // Real contact facts from the parish's tabot-reception program
        // poster (Nehase 2018 EC / August 2026).
        'contact.phone',
        'contact.address.street',
        'contact.address.postalCode',
        'contact.mapUrl',
      ].sort(),
    );
  });
});
